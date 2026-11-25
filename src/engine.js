/*
 * Coach Bobby Academy — Decision Engine
 * ------------------------------------------------------------------
 * Pure, deterministic tactical evaluation. No DOM, no randomness.
 * Every number this file produces can be traced to a named football
 * factor and re-derived by hand. Percentages are TACTICAL ESTIMATES
 * from the weights below — they are not measured probabilities.
 *
 * Pitch coordinate system (yards):
 *   x: 0 = our own goal line, 105 = opponent goal line. We always attack +x.
 *   y: 0 = left touchline, 68 = right touchline.
 * ------------------------------------------------------------------
 */

export const PITCH = { length: 105, width: 68 };
export const GOAL = { x: 105, y: 34 };

/* Speeds in yards/second. Used for ball-travel and recovery timing. */
export const SPEED = {
  ground: 14,
  driven: 20,
  through: 16,
  chip: 12,
  defenderRecovery: 6.4,
  playerJog: 4.2,
  carry: 5.2,          // running with the ball at match speed
};

/*
 * How far a player really gets in `t` seconds. Nobody reacts instantly
 * or starts at top speed: about a third of a second to read the pass,
 * then roughly a second to accelerate. Used by both the scoring and the
 * movement, so the board and the percentages always agree.
 */
export const REACTION_TIME = 0.35;
export const ACCEL_TIME = 1.0;
export function runDistance(t, topSpeed) {
  const go = t - REACTION_TIME;
  if (go <= 0) return 0;
  if (go <= ACCEL_TIME) return 0.5 * topSpeed * (go * go) / ACCEL_TIME;
  return topSpeed * (go - ACCEL_TIME / 2);
}

/*
 * WEIGHTS — the published scoring model.
 * Each key maps to the maximum magnitude that factor can contribute to
 * a pass's confidence estimate. Documented in docs/Scoring_Model.md.
 */
export const WEIGHTS = {
  base: 58,
  separation: 20,
  lane: 24,
  passerPressure: 14,
  distance: 16,
  recovery: 18,
  progression: 10,
  linesBroken: 8,
  angle: 6,
  typeFit: 10,
};

/*
 * Speed units. The engine works in yards per second because the pitch is in
 * yards, but nobody thinks in yards per second — the app displays mph or km/h.
 */
export const SPEED_UNITS = {
  mph: { label: 'mph', factor: 2.045455 },
  kph: { label: 'km/h', factor: 3.291840 },
};

/** Convert a yards-per-second value into a display string in the given unit. */
export function formatSpeed(ydsPerSec, unit = 'mph') {
  const u = SPEED_UNITS[unit] || SPEED_UNITS.mph;
  return `${Math.round(ydsPerSec * u.factor)} ${u.label}`;
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const round1 = (v) => Math.round(v * 10) / 10;

/** Perpendicular distance from point p to segment ab, plus how far along (0..1). */
export function pointToSegment(p, a, b) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return { distance: dist(p, a), t: 0 };
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
  t = clamp(t, 0, 1);
  const proj = { x: a.x + t * abx, y: a.y + t * aby };
  return { distance: dist(p, proj), t };
}

/** Distance from a player to the opponent goal. */
export const distanceToGoal = (p) => dist(p, GOAL);

/** Nearest opponent to a point, with its distance. */
export function nearestDefender(point, defenders) {
  let best = null, bestD = Infinity;
  for (const d of defenders) {
    const dd = dist(point, d);
    if (dd < bestD) { bestD = dd; best = d; }
  }
  return { defender: best, distance: bestD };
}

/**
 * How much separation does the receiver actually keep by the time the
 * ball arrives? Starting separation minus the ground the nearest
 * defender can cover during ball flight.
 */
export function effectiveSeparation(receiver, defenders, travelTime) {
  const { defender, distance } = nearestDefender(receiver, defenders);
  const closing = runDistance(travelTime, SPEED.defenderRecovery);
  // A defender only closes the gap he is actually oriented to close.
  // Ball-side defenders recover faster than those behind the receiver.
  const behind = defender && defender.x < receiver.x ? 0.75 : 1;
  const eff = distance - closing * behind;
  return {
    start: distance,
    closing: closing * behind,
    effective: eff,
    defender,
  };
}

/**
 * Lane risk: the most threatening defender sitting in the passing lane.
 * Returns 0 (clear) .. 1 (blocked). Defenders near the middle of the
 * lane are more dangerous than ones hugging either end.
 */
export function laneRisk(from, to, defenders, passType = 'ground') {
  let worst = 0, culprit = null, gap = Infinity;
  for (const d of defenders) {
    const { distance, t } = pointToSegment(d, from, to);
    if (t <= 0.02 || t >= 0.98) continue;
    // Chips and lobs clear defenders who are not right on top of the passer.
    const aerialRelief = passType === 'chip' ? (t > 0.15 ? 0.28 : 0.8) : 1;
    const centrality = Math.sin(Math.PI * t); // peaks mid-lane
    const proximity = clamp(1 - distance / 7.5, 0, 1);
    const risk = proximity * (0.55 + 0.45 * centrality) * aerialRelief;
    if (risk > worst) { worst = risk; culprit = d; gap = distance; }
  }
  return { risk: clamp(worst, 0, 1), defender: culprit, gap: gap === Infinity ? null : gap };
}

/** Count opponents the pass plays past along the attacking axis. */
export function linesBroken(from, to, defenders) {
  if (to.x <= from.x + 1) return 0;
  return defenders.filter((d) => d.x > from.x + 0.5 && d.x < to.x - 0.5).length;
}

/** How square/backward is the pass? 1 = straight forward, 0 = straight back. */
export function forwardness(from, to) {
  const dx = to.x - from.x;
  const d = dist(from, to);
  if (d === 0) return 0.5;
  return (dx / d + 1) / 2;
}

const TYPE_LABEL = {
  ground: 'Ground pass',
  driven: 'Driven pass',
  through: 'Through ball',
  chip: 'Lofted / chipped pass',
};

/**
 * Evaluate a single pass. Returns a confidence estimate plus the
 * itemised reasons that produced it — this is what Why Mode renders.
 */
export function evaluatePass(from, to, ctx) {
  const { defenders = [], teammates = [], passType = 'ground' } = ctx || {};
  const d = dist(from, to);
  const travelTime = d / SPEED[passType];
  const sep = effectiveSeparation(to, defenders, travelTime);
  const lane = laneRisk(from, to, defenders, passType);
  const pressure = nearestDefender(from, defenders);
  const broke = linesBroken(from, to, defenders);
  const fwd = forwardness(from, to);
  const goalBefore = distanceToGoal(from);
  const goalAfter = distanceToGoal(to);
  const progression = goalBefore - goalAfter;

  const factors = [];
  const add = (points, label, detail) => {
    factors.push({ points: Math.round(points), label, detail });
    return points;
  };

  let score = WEIGHTS.base;

  // 1. Receiver separation when the ball arrives.
  const sepNorm = clamp((sep.effective - 1.5) / 8, -1, 1);
  score += add(
    sepNorm * WEIGHTS.separation,
    sep.effective >= 4 ? 'Receiver has room' : sep.effective >= 1.5 ? 'Receiver has a little room' : 'Receiver is tight',
    `${round1(sep.start)} yd of starting separation; the nearest defender closes about ${round1(sep.closing)} yd while the ball travels, leaving roughly ${round1(sep.effective)} yd on the ball's arrival.`
  );

  // 2. Passing lane.
  score += add(
    -lane.risk * WEIGHTS.lane,
    lane.risk < 0.2 ? 'Passing lane is clear' : lane.risk < 0.5 ? 'Lane is partly covered' : 'Lane is contested',
    lane.defender
      ? `An opponent sits about ${round1(lane.gap)} yd off the line of the pass.`
      : 'No opponent is positioned between passer and receiver.'
  );

  // 3. Pressure on the passer.
  const pressNorm = clamp(1 - pressure.distance / 9, 0, 1);
  score += add(
    -pressNorm * WEIGHTS.passerPressure,
    pressNorm > 0.55 ? 'Passer is under pressure' : 'Passer has time',
    `Nearest opponent to the ball is ${round1(pressure.distance)} yd away.`
  );

  // 4. Pass distance — longer passes carry more execution risk.
  const distPenalty = clamp((d - 18) / 34, 0, 1);
  score += add(
    -distPenalty * WEIGHTS.distance,
    d < 18 ? 'Comfortable range' : d < 34 ? 'Medium-range pass' : 'Long pass',
    `${round1(d)} yd, roughly ${round1(travelTime)}s of ball travel.`
  );

  // 5. Can the defence recover to the ball before the receiver does?
  const recoveryTrouble = clamp(-sep.effective / 4, 0, 1);
  if (recoveryTrouble > 0.02) {
    score += add(
      -recoveryTrouble * WEIGHTS.recovery,
      'Defence can arrive first',
      'On these distances the covering defender gets to the ball at the same moment as the receiver, or sooner.'
    );
  }

  // 6. Territory gained.
  score += add(
    clamp(progression / 25, -1, 1) * WEIGHTS.progression,
    progression > 3 ? 'Moves play toward goal' : progression < -3 ? 'Plays away from goal' : 'Holds field position',
    `Distance to goal goes from ${round1(goalBefore)} yd to ${round1(goalAfter)} yd.`
  );

  // 7. Lines broken.
  if (broke > 0) {
    score += add(
      clamp(broke / 3, 0, 1) * WEIGHTS.linesBroken,
      `Plays past ${broke} opponent${broke > 1 ? 's' : ''}`,
      'Passes that eliminate opponents are worth more than passes that simply keep the ball.'
    );
  }

  // 8. Angle quality — very square passes across your own half are risky.
  const squareRisk = (1 - Math.abs(fwd - 0.5) * 2) * clamp(1 - from.x / 60, 0, 1);
  if (squareRisk > 0.15) {
    score += add(
      -squareRisk * WEIGHTS.angle,
      'Square pass in a risky area',
      'Sideways passes in your own half are the ones that get intercepted into shooting positions.'
    );
  }

  // 9. Does the chosen pass type fit the picture?
  // Space behind: no opponent just goal-side of the receiver, so a ball
  // played beyond him can be run onto rather than played to feet.
  const spaceBehind = !defenders.some((o) => o.x > to.x && o.x - to.x < 9 && Math.abs(o.y - to.y) < 7);
  const fit = passTypeFit(passType, { d, lane, sep, fwd, spaceBehind });
  score += add(fit.points * WEIGHTS.typeFit, fit.label, fit.detail);

  const confidence = Math.round(clamp(score, 3, 97));

  return {
    confidence,
    passType,
    passTypeLabel: TYPE_LABEL[passType],
    factors: factors.filter((f) => f.points !== 0),
    metrics: {
      passDistance: round1(d),
      travelTime: round1(travelTime),
      startingSeparation: round1(sep.start),
      closingDistance: round1(sep.closing),
      effectiveSeparation: round1(sep.effective),
      laneRisk: Math.round(lane.risk * 100),
      pressureOnPasser: round1(pressure.distance),
      distanceToGoalBefore: round1(goalBefore),
      distanceToGoalAfter: round1(goalAfter),
      progression: round1(progression),
      linesBroken: broke,
    },
  };
}

/*
 * CARRY_WEIGHTS — running with the ball. Same idea as passing: a base,
 * then named factors with fixed maximum influence.
 */
export const CARRY_WEIGHTS = {
  base: 76,
  space: 16,      // room at the destination when he gets there
  path: 34,       // an opponent able to step into the run
  pressure: 10,   // pressed as he starts
  distance: 14,   // long carries give the defence time
  progression: 10,
  beaten: 8,      // opponents carried past
};

/**
 * Evaluate a carry: the player on the ball runs with it from `from` to
 * `to`. Defenders react with the same reaction-and-acceleration model as
 * for passes, while the carrier travels at match speed with the ball.
 */
export function evaluateCarry(from, to, ctx) {
  const { defenders = [] } = ctx || {};
  const d = dist(from, to);
  const t = d / SPEED.carry;
  const W = CARRY_WEIGHTS;
  const factors = [];
  const add = (points, label, detail) => { factors.push({ points: Math.round(points), label, detail }); return points; };
  let score = W.base;

  // Room at the destination when he arrives.
  const sep = effectiveSeparation(to, defenders, t);
  score += add(clamp((sep.effective - 2) / 7, -1, 1) * W.space,
    sep.effective >= 4 ? 'Space to run into' : sep.effective >= 1.5 ? 'Some space to run into' : 'Running into a defender',
    `The nearest opponent to where he is going is ${round1(sep.start)} yd away and closes about ${round1(sep.closing)} yd while he runs, leaving roughly ${round1(sep.effective)} yd.`);

  // Can an opponent step into the run before he gets past?
  let pathRisk = 0, culprit = null;
  for (const o of defenders) {
    const { distance, t: along } = pointToSegment(o, from, to);
    if (along <= 0.05) continue;
    const reach = distance - runDistance(t * along, SPEED.defenderRecovery);
    const r = clamp(1 - reach / 2.5, 0, 1) * (along < 0.95 ? 1 : 0.6);
    if (r > pathRisk) { pathRisk = r; culprit = o; }
  }
  score += add(-pathRisk * W.path,
    pathRisk < 0.2 ? 'Clear run' : pathRisk < 0.6 ? 'An opponent can get close to the run' : 'An opponent can step into the run',
    culprit ? `The ${culprit.pos || 'opponent'} is near the line of the run and can get across in time.` : 'Nobody can get across the line of the run in time.');

  // Pressure as he starts.
  const press = nearestDefender(from, defenders);
  const pressNorm = clamp(1 - press.distance / 7, 0, 1);
  if (pressNorm > 0.05) score += add(-pressNorm * W.pressure, 'Pressed as he sets off', `An opponent is ${round1(press.distance)} yd away when he starts to run.`);

  // Long carries.
  const long = clamp((d - 10) / 12, 0, 1);
  if (long > 0) score += add(-long * W.distance, 'Long carry', `${round1(d)} yd with the ball, about ${round1(t)}s for the defence to react.`);

  // Ground gained and opponents carried past.
  const progression = distanceToGoal(from) - distanceToGoal(to);
  score += add(clamp(progression / 15, -1, 1) * W.progression,
    progression > 3 ? 'Drives toward goal' : progression < -3 ? 'Carries away from goal' : 'Holds field position',
    `Distance to goal goes from ${round1(distanceToGoal(from))} yd to ${round1(distanceToGoal(to))} yd.`);
  const beaten = to.x > from.x + 1
    ? defenders.filter((o) => o.x > from.x + 0.5 && o.x < to.x - 0.5 && pointToSegment(o, from, to).distance < 8).length : 0;
  if (beaten > 0) score += add(clamp(beaten / 2, 0, 1) * W.beaten, `Carries past ${beaten} opponent${beaten > 1 ? 's' : ''}`, 'Beating a player by running past him takes him out of the game just like a line-breaking pass.');

  const confidence = Math.round(clamp(score, 3, 97));
  return {
    confidence,
    kind: 'carry',
    passType: 'carry',
    passTypeLabel: 'Carry',
    factors: factors.filter((f) => f.points !== 0),
    metrics: {
      passDistance: round1(d),
      travelTime: round1(t),
      startingSeparation: round1(sep.start),
      closingDistance: round1(sep.closing),
      effectiveSeparation: round1(sep.effective),
      laneRisk: Math.round(pathRisk * 100),
      pressureOnPasser: round1(press.distance),
      distanceToGoalBefore: round1(distanceToGoal(from)),
      distanceToGoalAfter: round1(distanceToGoal(to)),
      progression: round1(progression),
      linesBroken: beaten,
    },
  };
}

/** How well a pass type suits the geometry. Returns -1..1 scaled points. */
function passTypeFit(type, { d, lane, sep, fwd, spaceBehind }) {
  switch (type) {
    case 'driven':
      return d > 22
        ? { points: 0.5, label: 'Driven ball suits the distance', detail: 'Driven passes cut the defence’s reaction time on longer range.' }
        : { points: -0.4, label: 'Driven ball is heavy here', detail: 'Over short range a driven pass is harder to control than a simple ground pass.' };
    case 'through':
      // A through ball is played into space for a runner. It only fits a
      // forward pass of real length with open grass beyond the receiver.
      return fwd > 0.68 && d >= 14 && spaceBehind && sep.effective > 1
        ? { points: 0.6, label: 'Through ball attacks the space behind', detail: 'There is open grass beyond the receiver, so the ball can be played into his run rather than to his feet.' }
        : { points: -0.7, label: 'No space to run into', detail: 'A through ball needs a forward run and open space beyond the receiver; here the pass is to feet.' };
    case 'chip':
      return lane.risk > 0.45
        ? { points: 0.55, label: 'Lofted ball clears the traffic', detail: 'Lifting the pass takes the covering defender out of the equation.' }
        : { points: -0.5, label: 'No need to lift it', detail: 'The lane is available on the floor, and ground passes are easier to control.' };
    default:
      return d < 26 && lane.risk < 0.5
        ? { points: 0.35, label: 'Ground pass is the simple option', detail: 'Short, on the floor, easy for the receiver to take on the half-turn.' }
        : { points: -0.2, label: 'Ground pass is ambitious here', detail: 'Either the distance or the traffic makes a rolled pass harder than it looks.' };
  }
}

/** Rank every pass type for a given pass. Used for the hold-to-preview card. */
export function rankPassTypes(from, to, ctx) {
  return ['ground', 'driven', 'through', 'chip']
    .map((passType) => {
      const r = evaluatePass(from, to, { ...ctx, passType });
      return { passType, label: TYPE_LABEL[passType], confidence: r.confidence, metrics: r.metrics };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

/** The engine's own choice of pass type when the user does not pick one. */
export function inferPassType(from, to, ctx) {
  return rankPassTypes(from, to, ctx)[0].passType;
}

/**
 * Rank every legal receiver from the current carrier. Used AFTER submission
 * to show primary / secondary / safety options. Never called before.
 */
export function rankOptions(carrier, teammates, defenders) {
  const opts = teammates
    .filter((t) => t.id !== carrier.id)
    .map((t) => {
      const passType = inferPassType(carrier, t, { defenders, teammates });
      const r = evaluatePass(carrier, t, { defenders, teammates, passType });
      return {
        player: t,
        confidence: r.confidence,
        passType,
        passTypeLabel: r.passTypeLabel,
        progression: r.metrics.progression,
        effectiveSeparation: r.metrics.effectiveSeparation,
        // Value blends safety with penetration — a 95% backward pass is not
        // automatically better coaching than an 80% line-breaking pass.
        value: r.confidence * 0.62 + clamp(r.metrics.progression, -20, 26) * 1.5 + r.metrics.linesBroken * 4
          // ...but a pass the defence is favourite to win is not a recommendation,
          // however far it travels. Below 55% the penalty grows quickly.
          - Math.max(0, 55 - r.confidence) * 1.6,
      };
    })
    .sort((a, b) => b.value - a.value);

  const safest = [...opts].sort((a, b) => b.confidence - a.confidence)[0];
  return {
    primary: opts[0] || null,
    secondary: opts[1] || null,
    tertiary: opts[2] || null,
    safety: safest && opts[0] && safest.player.id !== opts[0].player.id ? safest : null,
    all: opts,
  };
}

/**
 * Grade a completed sequence against the scenario objective.
 * Returns a verdict, a 0-100 sequence rating, and concept evidence.
 */
export function evaluateSequence(sequence, scenario, opts = {}) {
  if (!sequence.length) {
    return { rating: 0, verdict: 'empty', headline: 'No sequence was played.', notes: [], concepts: [] };
  }

  const confidences = sequence.map((s) => s.result.confidence);
  const weakest = Math.min(...confidences);
  const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const last = sequence[sequence.length - 1];
  const totalProgression = distanceToGoal(sequence[0].from) - distanceToGoal(last.to);
  const totalLines = sequence.reduce((a, s) => a + s.result.metrics.linesBroken, 0);

  // Survival: the sequence is only as strong as its weakest pass.
  const survived = weakest >= 45;
  // A lesson with a checklist decides the objective itself (see lessons.js).
  const objectiveMet = opts.objectiveMet != null ? opts.objectiveMet : checkObjective(sequence, scenario);

  let rating = mean * 0.5 + clamp(totalProgression, -25, 40) * 0.8 + totalLines * 3.5;
  if (!survived) rating -= (45 - weakest) * 0.9;
  if (objectiveMet) rating += 14;
  if (sequence.length > (scenario.maxActions || 5)) rating -= 10;
  // A sequence the defence wins cannot be presented as a strong sequence,
  // however much ground it covered before it broke down.
  if (!survived) rating = Math.min(rating, 44);
  rating = Math.round(clamp(rating, 0, 100));

  const notes = [];
  if (!survived) {
    const bad = sequence.find((s) => s.result.confidence === weakest);
    notes.push({
      tone: 'bad',
      text: bad.result.kind === 'carry'
        ? `The carry by ${bad.toLabel} is where this breaks down — an estimated ${weakest}% of keeping the ball. A sequence is only as safe as its riskiest action.`
        : `The ${bad.result.passTypeLabel.toLowerCase()} to ${bad.toLabel} is where this breaks down — an estimated ${weakest}% of getting through. A sequence is only as safe as its riskiest pass.`,
    });
  }
  if (totalProgression > 20) {
    notes.push({ tone: 'good', text: `The sequence moved the ball ${round1(totalProgression)} yd closer to goal.` });
  } else if (totalProgression < 2) {
    notes.push({ tone: 'warn', text: 'Possession was kept, but the ball finished no closer to goal. Keeping the ball is a means, not the objective.' });
  }
  if (totalLines >= 2) {
    notes.push({ tone: 'good', text: `You played past ${totalLines} opponents across the sequence — that is what separates progression from circulation.` });
  }
  if (objectiveMet) {
    notes.push({ tone: 'good', text: `Objective met: ${scenario.objective}` });
  } else {
    notes.push({ tone: 'warn', text: `Objective not met: ${scenario.objective}` });
  }

  const verdict = !survived ? 'lost' : objectiveMet ? 'success' : 'partial';
  const headline =
    verdict === 'success' ? 'Objective achieved.'
      : verdict === 'partial' ? 'Ball retained, objective missed.'
        : 'The defence wins this sequence.';

  return {
    rating, verdict, headline, notes,
    concepts: conceptEvidence(sequence, scenario, { survived, objectiveMet, totalProgression, totalLines }),
    summary: {
      passes: sequence.length,
      averageConfidence: Math.round(mean),
      weakestPass: weakest,
      progression: round1(totalProgression),
      linesBroken: totalLines,
    },
  };
}

export function checkObjective(sequence, scenario) {
  const last = sequence[sequence.length - 1];
  const o = scenario.objectiveCheck || {};
  if (o.reachPlayer) return last.to.id === o.reachPlayer;
  if (o.reachZone) {
    const z = o.reachZone;
    return last.to.x >= z.x && last.to.x <= z.x + z.w && last.to.y >= z.y && last.to.y <= z.y + z.h;
  }
  if (o.minProgression != null) {
    return distanceToGoal(sequence[0].from) - distanceToGoal(last.to) >= o.minProgression;
  }
  return false;
}

/**
 * Map what the user actually did onto tactical concepts. This is the
 * evidence the mastery model consumes — never a raw right/wrong flag.
 */
function conceptEvidence(sequence, scenario, ctx) {
  const ev = [];
  const push = (concept, delta, why) => ev.push({ concept, delta, why });

  for (const c of scenario.concepts || []) {
    push(c, ctx.objectiveMet && ctx.survived ? 1 : ctx.survived ? 0.25 : -0.6,
      ctx.objectiveMet ? 'Solved the scenario this concept was built around.' : 'Attempted the scenario but did not solve it.');
  }

  if (ctx.totalLines >= 2) push('breaking-lines', 0.8, 'Played past multiple opponents inside one sequence.');
  if (sequence.length >= 3 && ctx.survived) push('playing-through-pressure', 0.6, 'Strung together three or more secure actions under pressure.');
  if (ctx.totalProgression < 2 && ctx.survived) push('possession-vs-penetration', -0.4, 'Kept the ball without ever threatening the defence.');
  if (sequence.some((s) => s.result.metrics.linesBroken > 0 && s.result.confidence >= 65)) {
    push('breaking-lines', 0.5, 'Found a line-breaking pass that was also a sensible risk.');
  }
  if (sequence.some((s) => s.result.confidence < 35)) {
    push('rest-defence', -0.5, 'Played a pass the defence was favourite to win, which is how counterattacks start.');
  }
  const switched = sequence.some((s) => Math.abs(s.to.y - s.from.y) > 24);
  if (switched) push('switching-play', 0.7, 'Moved the ball across the pitch to the weak side.');

  return ev;
}
