/*
 * Coach Bobby Academy — Team styles and off-ball movement
 * ------------------------------------------------------------------
 * Decides where all 22 players go after every pass, from the team's
 * style, and records WHY each one moved. Pure functions: no DOM, no
 * randomness. The same picture and the same pass always produce the
 * same reaction, so every movement can be tested and explained.
 *
 * How a defending team is placed (the opponent, defending x = 105):
 *   1. LINE HEIGHT  The back line sits a style-set distance goal-side of
 *      the ball, inside style limits (a high press holds near halfway, a
 *      low block near the edge of its box). The back unit stays flat.
 *   2. BLOCK LENGTH Everyone else is spread over a fixed length in front
 *      of that line, keeping the formation's own order of units.
 *   3. SLIDE        The block's centre follows the ball across the pitch
 *      and the team narrows to a style-set width, so the far side tucks in.
 *   4. PRESS        When the ball is in the style's pressing zone, the
 *      nearest player presses on a curved run that cuts off the inside
 *      pass; a high press sends a second player to block the easy option.
 *   5. MARKING      Man-oriented styles pull midfielders onto opponents.
 *
 * How the attacking team moves (us, attacking x = 105):
 *   - The team steps up as the ball goes forward; the two deepest centre
 *     backs stay behind it as rest defence.
 *   - Nobody runs offside: attackers stop on the defensive line.
 *   - Players near the ball look for the pocket with the most space and
 *     the clearest passing lane from the ball.
 *   - Wide and final-third situations trigger patterned runs: overlaps,
 *     near-post and back-post runs, a midfielder holding the cutback.
 *
 * Nobody teleports: every player covers at most what he can run while the
 * ball travels, so a quick switch genuinely beats a sliding defence.
 *
 * These are representative coaching models of each style, not a claim
 * about how any particular real team behaves.
 * ------------------------------------------------------------------
 */

import { SPEED, dist, clamp, laneRisk } from './engine.js';

const GOAL_X = 105;
const MID_Y = 34;
/** No two markers closer than this: below it the circles overlap on screen. */
export const MIN_GAP = 3.9;
/** How long players keep adjusting after the ball arrives. */
const SETTLE_TIME = 0.55;

/* ============================ Styles ============================ */

/** Out-of-possession styles. Distances are yards from the defending goal. */
export const DEF_STYLES = {
  highPress: {
    id: 'highPress',
    label: 'High press',
    summary: 'Win the ball back high up the pitch. The back line pushes up near halfway to keep the team compact, the nearest player presses on a curved run, and a second player jumps onto the easiest pass.',
    lineWhy: 'pushed high behind the press so the gap between the lines stays small',
    backLine: { offset: 20, min: 24, max: 46 },
    length: 34, width: 44, slide: 0.55,
    press: { zone: 105, wide: 105, pressers: 2 },
    man: 0.55, shift: 5.0, sprint: 7.0, keeperSweep: 0.32,
  },
  midBlock: {
    id: 'midBlock',
    label: 'Mid block',
    summary: 'Stay compact around the middle third and let the opponent have the ball in front. The block slides as a unit, and pressing starts only when the ball enters midfield or goes wide, where the touchline helps.',
    lineWhy: 'held at the base of a compact middle block, protecting the space behind',
    backLine: { offset: 24, min: 16, max: 36 },
    length: 30, width: 40, slide: 0.6,
    press: { zone: 62, wide: 75, pressers: 1 },
    man: 0.25, shift: 4.6, sprint: 6.8, keeperSweep: 0.25,
  },
  lowBlock: {
    id: 'lowBlock',
    label: 'Low block',
    summary: 'Defend deep and narrow, protecting the penalty box. The team gives away the flanks and the space in front, and presses only when the ball arrives near the box.',
    lineWhy: 'dropped deep to protect the box and leave no space behind',
    backLine: { offset: 26, min: 11, max: 20 },
    length: 24, width: 36, slide: 0.5,
    press: { zone: 36, wide: 40, pressers: 1 },
    man: 0.12, shift: 4.4, sprint: 6.6, keeperSweep: 0.15,
  },
  recovering: {
    id: 'recovering',
    label: 'Recovering (caught in transition)',
    summary: 'The opponent has just lost the ball with players committed forward. Everyone sprints back toward a compact shape, and only the nearest player tries to slow the ball down.',
    lineWhy: 'sprinting back to get goal-side of the ball',
    backLine: { offset: 24, min: 14, max: 32 },
    length: 28, width: 40, slide: 0.55,
    press: { zone: 50, wide: 50, pressers: 1 },
    man: 0, shift: 6.9, sprint: 7.0, keeperSweep: 0.2,
  },
};

/** In-possession styles for the team the learner controls. */
export const ATT_STYLES = {
  possession: {
    id: 'possession',
    label: 'Possession build-up',
    summary: 'Keep the ball and move the opponent. The team steps up together behind the ball, nearby players find pockets with a clear lane, wide players hold the width, and two centre backs stay behind the ball as rest defence.',
    advance: { back: 0.55, mid: 0.75, front: 0.5 },
    supportRadius: 30, shift: 4.4, sprint: 6.6, runs: true,
  },
};

/** Default styles for a scenario: explicit `styles` win, otherwise read the brief. */
export function styleFor(scenario) {
  const explicit = scenario.styles || {};
  let theirs = explicit.theirs;
  if (!theirs) {
    const o = ((scenario.context && scenario.context.opponent) || '').toLowerCase();
    if (/committed forward|transition|recovering/.test(o)) theirs = 'recovering';
    else if (/press|chasing|pushed up|high line/.test(o)) theirs = 'highPress';
    else if (/low block|deep|two banks/.test(o)) theirs = 'lowBlock';
    else theirs = 'midBlock';
  }
  return { ours: explicit.ours || 'possession', theirs };
}

/* ============================ Helpers ============================ */

const lerp = (a, b, t) => a + (b - a) * t;
const sideName = (y) => (y < MID_Y ? 'right' : 'left'); // our frame: low y is our right
const isKeeper = (p) => p.role === 'keeper';

/**
 * Which unit a player belongs to. The position label decides when it is
 * clear (CB, full-back, winger, striker); otherwise his depth in the
 * starting shape decides. Returns Map id -> { unit, rel } where rel is
 * 0 (deepest) .. 1 (most advanced) within the formation.
 */
const BACK_RE = /^(GK|[LR]?CB|[LR]B|[LR]WB|SW)$/;
const FRONT_RE = /^([LR]W|ST|CF|[LR]S|[LR]F|SS)$/;
const MID_RE = /^([LR]?DM|[LR]?CM|[LR]?AM|[LR]M)$/;
function unitsByDepth(players, homes, depthOf) {
  const outfield = players.filter((p) => !isKeeper(p));
  const depths = outfield.map((p) => depthOf(homes.get(p.id) || p));
  const lo = Math.min(...depths), hi = Math.max(...depths);
  const span = Math.max(hi - lo, 1);
  const out = new Map();
  outfield.forEach((p, i) => {
    const rel = (depths[i] - lo) / span;
    const unit = BACK_RE.test(p.pos) ? 'back' : FRONT_RE.test(p.pos) ? 'front'
      : MID_RE.test(p.pos) ? 'mid' : rel < 0.18 ? 'back' : rel > 0.75 ? 'front' : 'mid';
    out.set(p.id, { unit, rel });
  });
  return out;
}

/** Move from `a` toward `b`, but no further than `max` yards. */
export function capMove(a, b, max) {
  const d = dist(a, b);
  if (d <= max || d === 0) return { x: b.x, y: b.y, capped: false };
  const t = max / d;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, capped: true };
}

/* ============================ Defence ============================ */

/**
 * Where a defending team (defending x = 105) wants to be with the ball at
 * `ball`. Returns Map id -> { x, y, why, job }.
 */
export function planDefence({ ball, attackers, defenders, homes, style }) {
  const S = typeof style === 'string' ? DEF_STYLES[style] : style;
  const depth = (p) => GOAL_X - p.x;
  const bd = depth(ball);
  const backD = clamp(bd - S.backLine.offset, S.backLine.min, S.backLine.max);
  const rel = unitsByDepth(defenders, homes, depth);

  // Lateral frame from the formation's own spread.
  const outfield = defenders.filter((p) => !isKeeper(p));
  const hy = outfield.map((p) => (homes.get(p.id) || p).y);
  const homeCentre = hy.reduce((a, b) => a + b, 0) / hy.length;
  const homeSpread = Math.max(Math.max(...hy) - Math.min(...hy), 1);
  const squeeze = Math.min(1, S.width / homeSpread);
  const centreY = MID_Y + (ball.y - MID_Y) * S.slide;
  const ballWide = Math.abs(ball.y - MID_Y) > 10;

  const plan = new Map();

  // 1-3. Zonal block position for everyone.
  for (const d of defenders) {
    const home = homes.get(d.id) || d;
    if (isKeeper(d)) {
      const kd = clamp(backD * S.keeperSweep, 3, 17);
      plan.set(d.id, {
        x: GOAL_X - kd, y: MID_Y + (ball.y - MID_Y) * 0.15, job: 'keeper',
        why: kd > 9
          ? `Starts ${Math.round(kd)} yd off his line to sweep up balls played in behind a high line.`
          : 'Stays near his line, shifting with the ball to narrow the angle.',
      });
      continue;
    }
    const u = rel.get(d.id);
    const back = u.unit === 'back';
    // Midfield and forwards spread over the block in front of the line,
    // never closer than a fifth of its length (a screen, not a fifth defender).
    let pd = back ? backD : backD + Math.max(u.rel, 0.2) * S.length;
    if (!back) pd = Math.min(pd, bd + 6); // nobody but a presser goes far past the ball
    const y = clamp(centreY + (home.y - homeCentre) * squeeze, 2.5, 65.5);
    const farSide = ballWide && Math.sign(home.y - MID_Y) !== Math.sign(ball.y - MID_Y) && Math.abs(home.y - MID_Y) > 6;
    let why;
    if (back) why = `Holds a flat back line ${Math.round(backD)} yd from goal — ${S.lineWhy}.`;
    else why = `Keeps his place in the ${S.label.toLowerCase()} shape, ${Math.round(Math.max(pd - backD, 0))} yd in front of the back line.`;
    const dropBack = (GOAL_X - pd) - d.x;
    const recovery = dropBack > 6;
    if (dropBack > 6) why = (S.id === 'recovering' ? 'Sprints back toward his own goal to rebuild the shape behind the ball. ' : `Drops back about ${Math.round(dropBack)} yd to stay connected to the shape. `) + why;
    if (farSide) why += ' On the far side he tucks in: the danger is near the ball, not out wide.';
    else if (Math.abs(y - home.y) > 4) why += ` The whole block slides toward the ball on our ${sideName(ball.y)}.`;
    plan.set(d.id, { x: GOAL_X - pd, y, job: back ? 'line' : 'block', why, sprint: recovery });
  }

  // 4. Press.
  const carrier = attackers.find((a) => Math.abs(a.x - ball.x) < 0.01 && Math.abs(a.y - ball.y) < 0.01) || ball;
  const inZone = bd <= S.press.zone || (Math.abs(ball.y - MID_Y) > 20 && bd <= S.press.wide);
  const taken = new Set();
  if (inZone) {
    const candidates = outfield.slice().sort((a, b) => dist(a, ball) - dist(b, ball));
    const p1 = candidates[0];
    if (p1) {
      const wide = Math.abs(ball.y - MID_Y) > 8;
      const inside = Math.sign(MID_Y - ball.y) || 1;
      let ux = 1, uy = 0;
      if (wide) { const n = Math.hypot(0.55, 0.85); ux = 0.55 / n; uy = (0.85 * inside) / n; }
      plan.set(p1.id, {
        x: ball.x + ux * MIN_GAP, y: ball.y + uy * MIN_GAP, job: 'press', sprint: true,
        why: wide
          ? `Presses the ${carrier.pos || 'ball'} on a curved run from the inside. That blocks the pass into the middle and shows him down the line, where the touchline acts as an extra defender.`
          : `Presses the ${carrier.pos || 'ball'} from the goal side to stop him playing forward through the middle.`,
      });
      taken.add(p1.id);
    }
    if (S.press.pressers >= 2 && p1) {
      const options = attackers
        .filter((a) => a !== carrier && !isKeeper(a) && dist(a, ball) < 24)
        .sort((a, b) => dist(a, ball) - dist(b, ball));
      const opt = options[0];
      if (opt) {
        const p2 = outfield.filter((d) => !taken.has(d.id))
          .sort((a, b) => dist(a, opt) - dist(b, opt))[0];
        if (p2 && dist(p2, opt) < 20) {
          const d0 = dist(opt, ball) || 1;
          plan.set(p2.id, {
            x: opt.x + ((ball.x - opt.x) / d0) * MIN_GAP,
            y: opt.y + ((ball.y - opt.y) / d0) * MIN_GAP,
            job: 'press-2', sprint: true,
            why: `Jumps onto the ${opt.pos}, standing in the passing lane to take away the easy pass. A press works in pairs: one player pressures the ball, the next one shuts the nearest option.`,
          });
          taken.add(p2.id);
        }
      }
    }
  }

  // 5. Man orientation for midfield and front units.
  if (S.man > 0) {
    const marked = new Set();
    for (const d of outfield) {
      if (taken.has(d.id)) continue;
      const t = plan.get(d.id);
      if (t.job !== 'block') continue;
      const target = attackers
        .filter((a) => a !== carrier && !isKeeper(a) && !marked.has(a.id) && dist(a, t) < 12)
        .sort((a, b) => dist(a, t) - dist(b, t))[0];
      if (!target) continue;
      marked.add(target.id);
      const spot = { x: target.x + 2.4, y: target.y + (MID_Y - target.y) * 0.08 };
      t.x = lerp(t.x, spot.x, S.man);
      t.y = lerp(t.y, spot.y, S.man);
      t.job = 'mark';
      t.why = `Tracks the ${target.pos} from the goal side. The ${S.label.toLowerCase()} is man-oriented in midfield, so the closest opponent is his responsibility.`;
    }
  }

  for (const t of plan.values()) { t.x = clamp(t.x, 1, 104); t.y = clamp(t.y, 1, 67); }
  return plan;
}

/* ============================ Attack ============================ */

/** The line attackers must not cross: second-deepest defender, or the ball. */
export function offsideLine(defenders, ball) {
  const xs = defenders.map((d) => d.x).sort((a, b) => b - a);
  const second = xs.length > 1 ? xs[1] : GOAL_X;
  return Math.max(second, ball.x);
}

/**
 * Where the team in possession (attacking x = 105) wants to be.
 * `defenders` should be the defence's NEW positions, so support players
 * read the picture they will actually face.
 */
export function planSupport({ ball, carrierId, attackers, defenders, homes, style, startBall }) {
  const S = typeof style === 'string' ? ATT_STYLES[style] : style;
  const rel = unitsByDepth(attackers, homes, (p) => p.x);
  const adv = ball.x - startBall.x;
  const maxX = offsideLine(defenders, ball) - 0.6;
  const side = Math.sign(ball.y - MID_Y) || 1;
  const wideBall = Math.abs(ball.y - MID_Y) > 16;

  const outfield = attackers.filter((p) => !isKeeper(p));
  const plan = new Map();
  const unitOf = (p) => rel.get(p.id).unit;
  const homeOf = (p) => homes.get(p.id) || p;
  const wideHome = (p) => Math.abs(homeOf(p).y - MID_Y) > 14;

  // Rest defence: the two most central players of the back unit.
  const restIds = new Set(outfield.filter((p) => unitOf(p) === 'back')
    .sort((a, b) => Math.abs(homeOf(a).y - MID_Y) - Math.abs(homeOf(b).y - MID_Y))
    .slice(0, 2).map((p) => p.id));

  for (const p of attackers) {
    if (p.id === carrierId) { plan.set(p.id, { x: p.x, y: p.y, job: 'ball', why: 'On the ball.' }); continue; }
    const home = homeOf(p);
    if (isKeeper(p)) {
      plan.set(p.id, { x: clamp(home.x + adv * 0.25, home.x, 24), y: MID_Y + (ball.y - MID_Y) * 0.2, job: 'keeper', why: 'Steps up behind the back line, ready as a safe back-pass option.' });
      continue;
    }
    const unit = unitOf(p);
    // Ball forward: the team steps up together. Ball back: the back line drops
    // to offer an angle, but forwards hold their height to keep the opponent
    // stretched, so recycling the ball does not drag the whole team backward.
    const back = { back: 0.55, mid: 0.3, front: 0.1 }[unit];
    let x = home.x + adv * (adv >= 0 ? S.advance[unit] : back);
    let y = wideHome(p) ? home.y : home.y + (ball.y - home.y) * 0.15;
    let why = unit === 'back' ? 'Steps up with the team behind the ball.' : 'Moves up with the play, keeping his place in the shape.';
    let job = 'shape';
    if (restIds.has(p.id)) {
      x = Math.min(x, Math.max(home.x, ball.x - 14));
      why = 'Stays behind the ball as rest defence, so a lost ball does not become a counterattack.';
      job = 'rest';
    }
    if (wideHome(p) && unit !== 'back') why = 'Holds the width on his touchline, stretching the defence and keeping the switch of play on.';
    plan.set(p.id, { x, y, job, why });
  }

  // Patterned runs.
  if (S.runs) {
    const carrier = attackers.find((p) => p.id === carrierId);
    const sameSide = (p) => Math.sign(homeOf(p).y - MID_Y) === side;
    const set = (p, x, y, job, why) => { if (p && p.id !== carrierId) plan.set(p.id, { x, y, job, why, sprint: true }); };

    if (wideBall && ball.x > 45 && carrier) {
      const fullback = outfield.find((p) => unitOf(p) === 'back' && wideHome(p) && sameSide(p));
      const winger = outfield.find((p) => unitOf(p) !== 'back' && wideHome(p) && sameSide(p));
      if (fullback && fullback.id !== carrierId) {
        set(fullback, Math.min(ball.x + 9, maxX), side < 0 ? 4 : 64, 'overlap',
          'Overlaps around the outside of the ball. That gives two attackers against one defender on this flank.');
      } else if (winger && winger.id !== carrierId) {
        set(winger, Math.min(ball.x + 10, maxX), MID_Y + side * 12, 'underlap',
          'Comes inside into the half-space and drags his full-back with him, opening the touchline for the player on the ball.');
      }
    }
    if (ball.x > 72 && carrier) {
      const fronts = outfield.filter((p) => unitOf(p) === 'front' && p.id !== carrierId);
      const striker = fronts.slice().sort((a, b) => Math.abs(homeOf(a).y - MID_Y) - Math.abs(homeOf(b).y - MID_Y))[0];
      if (wideBall) {
        set(striker, Math.min(maxX, 97), MID_Y + side * 4, 'near-post', 'Attacks the near post, ready for a low, hard ball across the six-yard box.');
        const farWing = fronts.find((p) => p !== striker && Math.sign(homeOf(p).y - MID_Y) === -side);
        set(farWing, Math.min(maxX, 95), MID_Y - side * 8, 'back-post', 'Arrives at the back post, where crosses that clear the first defender drop.');
        const mid = outfield.filter((p) => unitOf(p) === 'mid' && p.id !== carrierId)
          .sort((a, b) => Math.abs(homeOf(a).y - MID_Y) - Math.abs(homeOf(b).y - MID_Y))[0];
        set(mid, Math.min(maxX, 86), MID_Y + side * 6, 'cutback', 'Holds the edge of the box for the cutback, the pass defenders running back toward goal find hardest to stop.');
      } else if (striker) {
        set(striker, maxX, clamp(homeOf(striker).y, 26, 42), 'pin', 'Stands on the last defender’s shoulder to pin the back line and threaten a run in behind.');
      }
    }
  }

  // Offside discipline, then find space for the players near the ball.
  for (const [id, t] of plan) {
    if (id === carrierId) continue;
    const p = attackers.find((q) => q.id === id);
    if (isKeeper(p)) continue;
    if (t.x > maxX) { t.x = maxX; if (t.job === 'shape') t.why += ' He stops on the last defender’s line, so he stays onside.'; }
  }

  const chosen = [];
  const near = outfield
    .filter((p) => p.id !== carrierId && ['shape'].includes(plan.get(p.id).job) && dist(plan.get(p.id), ball) < S.supportRadius)
    .sort((a, b) => dist(plan.get(a.id), ball) - dist(plan.get(b.id), ball));
  for (const p of near) {
    const base = plan.get(p.id);
    let best = null;
    for (const r of [0, 3, 6]) {
      const steps = r === 0 ? 1 : 8;
      for (let k = 0; k < steps; k++) {
        const ang = (k / steps) * Math.PI * 2;
        const c = { x: base.x + Math.cos(ang) * r, y: clamp(base.y + Math.sin(ang) * r, 2, 66) };
        if (c.x > maxX || c.x < 2) continue;
        let sep = Infinity;
        for (const d of defenders) sep = Math.min(sep, dist(c, d));
        let score = Math.min(sep, 9) + (1 - laneRisk(ball, c, defenders).risk) * 7 - dist(c, base) * 0.35;
        const db = dist(c, ball);
        if (db < 8) score -= (8 - db) * 1.5;
        for (const o of chosen) { const g = dist(c, o); if (g < 8) score -= (8 - g) * 1.2; }
        if (!best || score > best.score) best = { ...c, score, sep };
      }
    }
    if (best) {
      const moved = dist(best, base);
      base.x = best.x; base.y = best.y;
      base.job = 'support';
      base.why = moved > 1.5
        ? `Moves into a pocket of space ${Math.round(best.sep)} yd from the nearest opponent, with a clear passing lane from the ball.`
        : `Already in a good pocket, ${Math.round(best.sep)} yd from the nearest opponent, so he holds still and stays available.`;
      chosen.push(best);
    }
  }
  for (const t of plan.values()) { t.x = clamp(t.x, 1, 104); t.y = clamp(t.y, 1, 67); }
  return plan;
}

/* ============================ Overlaps ============================ */

/** Push markers apart until no two are closer than MIN_GAP. `fixed` ids never move. */
export function separate(positions, fixed = new Set()) {
  const ids = [...positions.keys()];
  for (let iter = 0; iter < 6; iter++) {
    let moved = false;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = positions.get(ids[i]), b = positions.get(ids[j]);
        const d = dist(a, b);
        if (d >= MIN_GAP) continue;
        const fa = fixed.has(ids[i]), fb = fixed.has(ids[j]);
        if (fa && fb) continue;
        const ux = d > 0.001 ? (b.x - a.x) / d : 0, uy = d > 0.001 ? (b.y - a.y) / d : 1;
        const push = MIN_GAP - d;
        if (fa) { b.x += ux * push; b.y += uy * push; }
        else if (fb) { a.x -= ux * push; a.y -= uy * push; }
        else { a.x -= ux * push / 2; a.y -= uy * push / 2; b.x += ux * push / 2; b.y += uy * push / 2; }
        a.x = clamp(a.x, 1, 104); a.y = clamp(a.y, 1, 67); b.x = clamp(b.x, 1, 104); b.y = clamp(b.y, 1, 67);
        moved = true;
      }
    }
    if (!moved) break;
  }
  return positions;
}

/* ============================ One pass ============================ */

/**
 * Full reaction to one pass: both teams' new positions and the reason for
 * each movement. `from` / `to` are the passer and receiver.
 */
export function reactToPass({ from, to, passType = 'ground', ours, theirs, homes, styles, startBall }) {
  const travel = dist(from, to) / (SPEED[passType] || SPEED.ground);
  const dt = travel + SETTLE_TIME;
  const ball = { x: to.x, y: to.y };
  const defStyle = DEF_STYLES[styles.theirs] || DEF_STYLES.midBlock;
  const attStyle = ATT_STYLES[styles.ours] || ATT_STYLES.possession;

  const defPlan = planDefence({ ball, attackers: ours, defenders: theirs, homes, style: defStyle });
  const defNew = theirs.map((d) => {
    const t = defPlan.get(d.id);
    // Shifting with the block is a jog; pressing and recovery runs are sprints.
    const m = capMove(d, t, (t.sprint ? defStyle.sprint : defStyle.shift) * dt);
    return { ...d, x: m.x, y: m.y, why: m.capped ? `${t.why} He cannot get all the way there before the ball arrives, so he is still moving.` : t.why, job: t.job };
  });

  const supPlan = planSupport({ ball, carrierId: to.id, attackers: ours, defenders: defNew, homes, style: attStyle, startBall });
  const attNew = ours.map((p) => {
    const t = supPlan.get(p.id);
    if (p.id === to.id) return { ...p, why: t.why, job: t.job };
    const m = capMove(p, t, (t.sprint ? attStyle.sprint : attStyle.shift) * dt);
    return { ...p, x: m.x, y: m.y, why: t.why, job: t.job };
  });

  const all = new Map();
  for (const p of [...attNew, ...defNew]) all.set(p.id, { x: p.x, y: p.y });
  separate(all, new Set([to.id]));

  const out = { ours: new Map(), theirs: new Map(), styles: { theirs: defStyle, ours: attStyle } };
  for (const p of attNew) out.ours.set(p.id, { ...all.get(p.id), why: p.why, job: p.job });
  for (const p of defNew) out.theirs.set(p.id, { ...all.get(p.id), why: p.why, job: p.job });
  return out;
}
