/*
 * Coach Bobby Academy — application shell, tactical board and UI wiring.
 * ------------------------------------------------------------------
 * Presentation only. All judging lives in engine.js, all progress in
 * mastery.js, all content in scenarios.js.
 * ------------------------------------------------------------------
 */

import {
  evaluatePass, evaluateCarry, evaluateShot, SHOT_RANGE, rankPassTypes, inferPassType, rankOptions, evaluateSequence,
  distanceToGoal, dist, round1, clamp, SPEED, WEIGHTS, formatSpeed, SPEED_UNITS, checkObjective,
} from './engine.js';
import { bestSequence } from './planner.js';
import { missionStatus, snapshot, drawProgress } from './lessons.js';
import { formationById, formationFromText, shape, LEVEL_NAMES } from './formations.js';
import * as Mastery from './mastery.js';
import { SCENARIOS, CURRICULUM, YOUTH_TRANSLATIONS } from './scenarios.js';
import { reactToPass, styleFor, separate, unitOfPos, DEF_STYLES, ATT_STYLES } from './tactics.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
/** SVG element factory. The board is SVG, so this is the common case. */
const el = (tag, attrs = {}, text) => {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
};

/**
 * HTML element factory. Separate from el() on purpose: an HTML tag built
 * with createElementNS(SVG_NS, …) is a real element with the right class
 * attribute, matches CSS selectors, and renders as absolutely nothing.
 * That failure is silent, so the two factories stay visibly distinct.
 */
const htm = (tag, attrs = {}, text) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
};

/* Display units for every speed the app quotes. Stored on the device. */
const UNIT_KEY = 'cba.speedUnit';
const Units = {
  get() {
    try { return localStorage.getItem(UNIT_KEY) === 'kph' ? 'kph' : 'mph'; } catch { return 'mph'; }
  },
  set(u) {
    try { localStorage.setItem(UNIT_KEY, u); } catch {}
  },
};
const speed = (ydsPerSec) => formatSpeed(ydsPerSec, Units.get());

/*
 * Orientation. Pitch data is always in yards with x = 0 our goal line and
 * x = 105 theirs, y = 0 our right touchline. On a phone the pitch is drawn
 * vertically, attacking up the screen, because a tall phone fits a tall
 * pitch at almost twice the size. Wider screens draw it attacking right.
 * One SVG transform does the mapping; text gets the inverse transform so
 * labels always read the right way up.
 */
const ORIENT = {
  vertical: {
    root: 'matrix(0 -1 -1 0 68 105)',   // screen x = 68 - y, screen y = 105 - x
    text: 'matrix(0 -1 -1 0 0 0)',
    view: (v) => `${68 - v.y - v.h} ${105 - v.x - v.w} ${v.h} ${v.w}`,
    ball: { x: -2.6, y: 0 },              // just below the marker on screen
    arrow: '↑', direction: 'We attack up the pitch',
  },
  horizontal: {
    root: 'matrix(1 0 0 -1 0 68)',       // screen x = x, screen y = 68 - y
    text: 'matrix(1 0 0 -1 0 0)',
    view: (v) => `${v.x} ${68 - v.y - v.h} ${v.w} ${v.h}`,
    ball: { x: 0, y: -2.6 },
    arrow: '→', direction: 'We attack this way',
  },
};
const pickOrientation = () => (window.matchMedia('(max-width: 700px)').matches ? 'vertical' : 'horizontal');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================ State ============================ */

const State = {
  scenario: null,
  ours: [],
  theirs: [],
  homes: new Map(),      // id -> original position, used as the shape anchor
  carrierId: null,
  sequence: [],
  submitted: false,
  analysis: null,
  busy: false,
  profile: Mastery.load(),
  styles: { ours: 'possession', theirs: 'midBlock' },
  reasons: new Map(),    // id -> why that player is where he is right now
  startBall: null,
};

/* ============================ Board ============================ */

const Board = {
  svg: null,
  layers: {},

  orient: ORIENT.vertical,

  mount(container) {
    container.innerHTML = '';
    this.orientName = pickOrientation();
    this.orient = ORIENT[this.orientName];
    container.dataset.orient = this.orientName;
    const svg = el('svg', { class: 'pitch', preserveAspectRatio: 'xMidYMid meet' });
    this.svg = svg;
    const root = el('g', { class: 'l-root', transform: this.orient.root });
    svg.appendChild(root);
    this.root = root;
    this.layers.pitch = el('g', { class: 'l-pitch' });
    this.layers.zones = el('g', { class: 'l-zones' });
    this.layers.carry = el('g', { class: 'l-carry' });
    this.layers.arrows = el('g', { class: 'l-arrows' });
    this.layers.theirs = el('g', { class: 'l-theirs' });
    this.layers.ours = el('g', { class: 'l-ours' });
    this.layers.ball = el('g', { class: 'l-ball' });
    Object.values(this.layers).forEach((l) => root.appendChild(l));
    container.appendChild(svg);
    const hint = document.createElement('div');
    hint.id = 'goalHint';
    hint.className = `goal-hint ${this.orientName}`;
    hint.hidden = true;
    container.appendChild(hint);
  },

  setView(view) {
    this.view = view;
    this.svg.setAttribute('viewBox', this.orient.view(view));
    const hint = document.getElementById('goalHint');
    if (hint) hint.hidden = view.x + view.w >= 104;
  },

  drawPitch() {
    const g = this.layers.pitch;
    g.innerHTML = '';
    const line = (attrs) => g.appendChild(el('rect', { fill: 'none', stroke: 'var(--pitch-line)', 'stroke-width': 0.32, ...attrs }));
    g.appendChild(el('rect', { x: 0, y: 0, width: 105, height: 68, fill: 'url(#turf)' }));
    line({ x: 0.4, y: 0.4, width: 104.2, height: 67.2 });
    g.appendChild(el('line', { x1: 52.5, y1: 0.4, x2: 52.5, y2: 67.6, stroke: 'var(--pitch-line)', 'stroke-width': 0.32 }));
    g.appendChild(el('circle', { cx: 52.5, cy: 34, r: 9.15, fill: 'none', stroke: 'var(--pitch-line)', 'stroke-width': 0.32 }));
    // Both penalty areas and six-yard boxes.
    line({ x: 0.4, y: 13.85, width: 16.5, height: 40.3 });
    line({ x: 88.1, y: 13.85, width: 16.5, height: 40.3 });
    line({ x: 0.4, y: 24.85, width: 5.5, height: 18.3 });
    line({ x: 99.1, y: 24.85, width: 5.5, height: 18.3 });
    g.appendChild(el('circle', { cx: 11, cy: 34, r: 0.4, fill: 'var(--pitch-line)' }));
    g.appendChild(el('circle', { cx: 94, cy: 34, r: 0.4, fill: 'var(--pitch-line)' }));
    // The goals, 8 yd wide, sitting behind each goal line.
    g.appendChild(el('rect', { x: -2, y: 30, width: 2, height: 8, class: 'goal-net ours' }));
    g.appendChild(el('rect', { x: 105, y: 30, width: 2, height: 8, class: 'goal-net theirs' }));
  },

  drawZone(zone) {
    this.layers.zones.innerHTML = '';
    if (!zone) return;
    this.layers.zones.appendChild(el('rect', {
      x: zone.x, y: zone.y, width: zone.w, height: zone.h,
      class: 'target-zone', rx: 1,
    }));
  },

  /** One <g> per player: circle + label live in the same transform, so a
   *  label can never drift away from its marker. */
  drawTeam(layerName, players, opts = {}) {
    const layer = this.layers[layerName];
    layer.innerHTML = '';
    for (const p of players) {
      const g = el('g', {
        class: `player ${opts.className || ''}${p.role === 'keeper' ? ' keeper' : ''}`,
        transform: `translate(${p.x} ${p.y})`,
        'data-id': p.id,
      });
      g.appendChild(el('circle', { r: 2.6, class: 'hit' }));
      g.appendChild(el('circle', { r: 1.85, class: 'marker' }));
      const t = el('g', { transform: this.orient.text });
      t.appendChild(el('text', { y: 0.58, class: 'plabel' + (p.pos.length > 2 ? ' long' : '') }, p.pos));
      g.appendChild(t);
      layer.appendChild(g);
      p._node = g;
    }
  },

  move(player, x, y) {
    player.x = x; player.y = y;
    if (player._node) player._node.setAttribute('transform', `translate(${x} ${y})`);
  },

  drawBall(pos) {
    this.layers.ball.innerHTML = '';
    const o = this.orient.ball;
    const g = el('g', { class: 'ball', transform: `translate(${pos.x + o.x} ${pos.y + o.y})` });
    g.appendChild(el('circle', { r: 1.05, class: 'ball-outer' }));
    g.appendChild(el('circle', { r: 0.62, class: 'ball-inner' }));
    this.layers.ball.appendChild(g);
    this._ball = g;
  },

  moveBall(x, y) {
    const o = this.orient.ball;
    if (this._ball) this._ball.setAttribute('transform', `translate(${x + o.x} ${y + o.y})`);
  },

  clearArrows() { this.layers.arrows.innerHTML = ''; },

  arrow(from, to, label, cls, at = 0.5, meta = null) {
    const g = this.layers.arrows;
    const id = `ah-${cls}`;
    if (!this.svg.querySelector(`#${id}`)) {
      let defs = this.svg.querySelector('defs');
      if (!defs) { defs = el('defs'); this.svg.insertBefore(defs, this.svg.firstChild); }
      const m = el('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 4.5, markerHeight: 4.5, orient: 'auto-start-reverse' });
      m.appendChild(el('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: `ah ${cls}` }));
      defs.appendChild(m);
    }
    // Shorten so the head stops at the edge of the marker.
    const d = dist(from, to) || 1;
    const ux = (to.x - from.x) / d, uy = (to.y - from.y) / d;
    const a = { x: from.x + ux * 2.6, y: from.y + uy * 2.6 };
    const b = { x: to.x - ux * 3.1, y: to.y - uy * 3.1 };
    g.appendChild(el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: `route ${cls}`, 'marker-end': `url(#${id})` }));
    // A 3-yard-wide transparent line over the top, so a fingertip can hit it.
    const hit = el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'route-hit', 'data-route': cls });
    if (meta) hit.setAttribute('data-meta', JSON.stringify(meta));
    g.appendChild(hit);
    if (label) {
      const mx = a.x + (b.x - a.x) * at, my = a.y + (b.y - a.y) * at;
      const t = el('g', { transform: `translate(${mx} ${my}) ${this.orient.text}`, class: `route-tag ${cls}` });
      const w = label.length * 1.35 + 2.4;
      t.appendChild(el('rect', { x: -w / 2, y: -1.9, width: w, height: 3.8, rx: 1.9 }));
      t.appendChild(el('text', { y: 0.65 }, label));
      g.appendChild(t);
    }
  },

  /** Pitch coordinates (yards) of a screen tap, whatever the orientation. */
  toPitch(clientX, clientY) {
    const pt = this.svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const m = this.root.getScreenCTM();
    if (!m) return null;
    const q = pt.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  },

  showCarryRange(center, r) {
    const g = this.layers.carry;
    g.innerHTML = '';
    if (!center) return;
    g.appendChild(el('circle', { cx: center.x, cy: center.y, r, class: 'carry-ring' }));
  },

  setSelectable(ids) {
    $$('.player', this.svg).forEach((n) => n.classList.toggle('selectable', ids.includes(n.dataset.id)));
  },

  setCarrier(id) {
    $$('.player', this.svg).forEach((n) => n.classList.toggle('carrier', n.dataset.id === id));
  },
};

/* ==================== Opponent & support movement ==================== */

/**
 * Both teams' reaction to a pass, from the team styles in tactics.js.
 * Returns Maps of id -> { x, y, why } and records the reasons so the
 * learner can tap any player and ask why he moved.
 */
function planReaction(from, to, passType) {
  const plan = reactToPass({
    from, to, passType,
    ours: State.ours, theirs: State.theirs, homes: State.homes,
    styles: State.styles, startBall: State.startBall,
  });
  for (const [id, t] of plan.ours) State.reasons.set(id, t.why);
  for (const [id, t] of plan.theirs) State.reasons.set(id, t.why);
  return plan;
}

/* ============================ Animation ============================ */

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/**
 * Runs the ball to its destination and shifts both teams while it travels.
 * Resolves only when everything has finished — the next decision state is
 * never presented mid-animation.
 */
function animatePass(from, to, passType) {
  const carry = from.id === to.id;
  const travelMs = clamp((dist(from, to) / SPEED[passType]) * 1000, 420, carry ? 3200 : 1500);
  const settleMs = 520;
  const total = travelMs + settleMs;

  const plan = planReaction(from, to, passType);
  const defTargets = plan.theirs;
  const supTargets = plan.ours;
  const startPos = new Map();
  [...State.ours, ...State.theirs].forEach((p) => startPos.set(p.id, { x: p.x, y: p.y }));

  // The camera follows the play: widen the view so nobody walks off the board.
  const v0 = Board.view;
  const after = [...State.ours, ...State.theirs].map((p) => ({ ...p, ...(supTargets.get(p.id) || defTargets.get(p.id) || {}) }));
  const fit = fitView(State.scenario, after);
  const v1x0 = Math.min(v0.x, fit.x), v1y0 = Math.min(v0.y, fit.y);
  const v1 = { x: v1x0, y: v1y0, w: Math.max(v0.x + v0.w, fit.x + fit.w) - v1x0, h: Math.max(v0.y + v0.h, fit.y + fit.h) - v1y0 };
  const lerpView = (t) => ({ x: v0.x + (v1.x - v0.x) * t, y: v0.y + (v1.y - v0.y) * t, w: v0.w + (v1.w - v0.w) * t, h: v0.h + (v1.h - v0.h) * t });

  if (reducedMotion()) {
    for (const p of State.theirs) { const t = defTargets.get(p.id); if (t) Board.move(p, t.x, t.y); }
    for (const p of State.ours) { const t = supTargets.get(p.id); if (t) Board.move(p, t.x, t.y); }
    Board.moveBall(to.x, to.y);
    Board.setView(v1);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const t0 = performance.now();
    const tick = (now) => {
      const elapsed = now - t0;
      // Ball: travels for travelMs, then sits at the receiver.
      const bt = clamp(elapsed / travelMs, 0, 1);
      const be = easeInOut(bt);
      Board.moveBall(from.x + (to.x - from.x) * be, from.y + (to.y - from.y) * be);

      // Players: react across the whole window, slightly lagging the ball.
      const pt = clamp((elapsed - 90) / (total - 90), 0, 1);
      const pe = easeInOut(pt);
      Board.setView(lerpView(pe));
      for (const p of State.theirs) {
        const s = startPos.get(p.id), t = defTargets.get(p.id);
        if (t) Board.move(p, s.x + (t.x - s.x) * pe, s.y + (t.y - s.y) * pe);
      }
      for (const p of State.ours) {
        const s = startPos.get(p.id), t = supTargets.get(p.id);
        if (!t) continue;
        // On a carry the runner moves with the ball, not with the team's lag.
        if (carry && p.id === to.id) Board.move(p, s.x + (t.x - s.x) * be, s.y + (t.y - s.y) * be);
        else Board.move(p, s.x + (t.x - s.x) * pe, s.y + (t.y - s.y) * pe);
      }

      if (elapsed < total) requestAnimationFrame(tick);
      else { if (carry) { const c = State.ours.find((p) => p.id === to.id); Board.move(c, to.x, to.y); } Board.moveBall(to.x, to.y); resolve(); }
    };
    requestAnimationFrame(tick);
  });
}

/* ============================ Scenario flow ============================ */

function loadScenario(id) {
  const s = SCENARIOS.find((x) => x.id === id) || SCENARIOS[0];
  State.scenario = s;
  // Authored pictures sometimes stack two players on one spot. Nudge them
  // apart once, so every marker can be seen and tapped; this nudged picture
  // is the scenario's starting point everywhere (board, undo, review).
  const spots = new Map([...s.ours, ...s.theirs].map((p) => [p.id, { x: p.x, y: p.y }]));
  separate(spots, new Set([s.startCarrier]));
  State.startOurs = s.ours.map((p) => ({ ...p, ...spots.get(p.id) }));
  State.startTheirs = s.theirs.map((p) => ({ ...p, ...spots.get(p.id) }));
  State.ours = State.startOurs.map((p) => ({ ...p }));
  State.theirs = State.startTheirs.map((p) => ({ ...p }));
  State.homes = new Map([...State.ours, ...State.theirs].map((p) => [p.id, { x: p.x, y: p.y }]));
  State.carrierId = s.startCarrier;
  State.styles = styleFor(s);
  const sc = State.ours.find((p) => p.id === s.startCarrier);
  State.startBall = { x: sc.x, y: sc.y };
  resetReasons();
  State.best = null;
  State.carryMode = false;
  State.history = [snapshot(State.ours, State.theirs, s.startCarrier)];
  if ($('#boardCaption')) $('#boardCaption').hidden = true;
  State.sequence = [];
  State.submitted = false;
  State.analysis = null;
  State.busy = false;

  Board.setView(fitView(s));
  Board.drawPitch();
  Board.drawZone(s.objectiveCheck && s.objectiveCheck.reachZone);
  Board.drawTeam('theirs', State.theirs, { className: 'them' });
  Board.drawTeam('ours', State.ours, { className: 'us' });
  Board.clearArrows();
  $('#routeKey').hidden = true;
  const c = carrier();
  Board.drawBall({ x: c.x, y: c.y });

  renderScenarioHeader();
  renderStyleChips();
  $('.direction').innerHTML = `<i aria-hidden="true">${Board.orient.arrow}</i> ${Board.orient.direction}`;
  refreshBoardState();
  renderSequence();
  $('#analysis').hidden = true;
  $('#analysis').innerHTML = '';
  attachBoardHandlers();
  if (s.lesson && State.briefedFor !== s.id) showBriefing(s);
}

/** Before the first move of a lesson: exactly what you are trying to do, and when you are done. */
function showBriefing(s) {
  State.briefedFor = s.id;
  if (!$('#sheet')) return;
  openSheet('Your mission', `
    <p class="brief-lesson"><span class="objective-tag">Lesson</span> ${s.lesson.title}</p>
    <ol class="brief-steps">
      ${s.mission.items.map((i) => `<li><b>${i.label.split(':')[0]}</b><span>${(() => { const t = i.label.split(':').slice(1).join(':').trim(); return t.charAt(0).toUpperCase() + t.slice(1); })()}.</span></li>`).join('')}
    </ol>
    <p class="brief-done">The checklist above the pitch ticks off as you go. <b>When all ${s.mission.items.length} are ticked, tap Finish.</b> You have up to ${s.maxActions || 5} actions: passes, or dribbles (tap the player on the ball, then tap open grass).</p>
    <button class="btn btn-primary btn-block" id="briefStart">Start</button>`);
  $('#briefStart').onclick = closeSheet;
}

/**
 * The scenario may declare a focus crop, but no player may ever be cut off:
 * the declared view is expanded until every marker on both teams fits.
 */
function fitView(s, players) {
  const all = (players || [...s.ours, ...s.theirs]).filter((p) => p.role !== 'keeper');
  const pad = 4.5;
  let x0 = Math.min(...all.map((p) => p.x)) - pad;
  let x1 = Math.max(...all.map((p) => p.x)) + pad;
  let y0 = Math.min(...all.map((p) => p.y)) - pad;
  let y1 = Math.max(...all.map((p) => p.y)) + pad;
  if (s.view) {
    x0 = Math.min(x0, s.view.x); y0 = Math.min(y0, s.view.y);
    x1 = Math.max(x1, s.view.x + s.view.w); y1 = Math.max(y1, s.view.y + s.view.h);
  }
  if (s.objectiveCheck && s.objectiveCheck.reachZone) {
    const z = s.objectiveCheck.reachZone;
    x0 = Math.min(x0, z.x - 2); y0 = Math.min(y0, z.y - 2);
    x1 = Math.max(x1, z.x + z.w + 2); y1 = Math.max(y1, z.y + z.h + 2);
  }
  x0 = clamp(x0, 0, 105); x1 = clamp(x1, 0, 105);
  // When the view reaches either end, show the goal behind the line too.
  if (x0 <= 1) x0 = -2.6;
  if (x1 >= 104) x1 = 107.6;
  y0 = clamp(y0, 0, 68); y1 = clamp(y1, 0, 68);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Before any pass, every player is simply where the scenario put him. */
function resetReasons() {
  State.reasons = new Map();
  const them = DEF_STYLES[State.styles.theirs];
  for (const p of State.theirs) State.reasons.set(p.id, `Starting position. The opponent is playing a ${them.label.toLowerCase()}: tap the style chip above the pitch to see what that means.`);
  for (const p of State.ours) State.reasons.set(p.id, 'Starting position for this scenario.');
}

const carrier = () => State.ours.find((p) => p.id === State.carrierId);
const outfieldTeammates = () => State.ours.filter((p) => p.id !== State.carrierId);

/** Ring the opponents who currently count as "drawn" by the ball. */
function highlightDrawn(ids) {
  $$('.l-theirs .player', Board.svg).forEach((n) => n.classList.toggle('drawn', ids.includes(n.dataset.id)));
}

/** The scenario objective in a few words, for the live tracker. */
function goalShort(s) {
  const o = s.objectiveCheck || {};
  if (o.reachZone) return 'Get the ball into the green zone';
  if (o.reachPlayer) { const p = s.ours.find((q) => q.id === o.reachPlayer); return `Get the ball to the ${p ? p.pos : 'target player'}`; }
  if (o.minProgression != null) return `Move the ball ${o.minProgression}+ yd closer to goal`;
  return 'Complete the objective';
}

const mission = () => (State.scenario.mission ? missionStatus(State.scenario.mission, State.history) : null);
const goalMet = () => {
  if (!State.sequence.length) return false;
  const m = mission();
  return m ? m.every((x) => x.done) : checkObjective(State.sequence, State.scenario);
};

/** Live tracker above the pitch: where you stand against the objective right now. */
function renderGoalStatus() {
  const box = $('#goalStatus');
  if (!box) return;
  const max = State.scenario.maxActions || 5;
  const left = max - State.sequence.length;
  const goal = goalShort(State.scenario);
  let cls = 'todo', html;
  if (State.submitted) { box.hidden = true; $$('.l-ours .player.target', Board.svg).forEach((n) => n.classList.remove('target')); return; }
  box.hidden = false;
  const m = mission();
  highlightDrawn([]);
  if (m) {
    // Live count for "draw" items, with the drawn opponents ringed on the pitch.
    const pic = State.history[State.history.length - 1];
    const extra = {};
    for (const item of State.scenario.mission.items) {
      if (item.type !== 'draw') continue;
      const st = m.find((x) => x.id === item.id);
      if (st.done) continue;
      const pr = drawProgress(item, pic);
      highlightDrawn(pr.ids);
      extra[item.id] = !pr.inHalf ? '' : ` ${Math.min(pr.count, pr.need)}/${pr.need}${pr.count >= pr.need && !pr.wide ? ' · go wide' : ''}`;
    }
    // Once the first step is done, light up the players the ball must reach next.
    const targets = [];
    for (const item of State.scenario.mission.items) {
      if (item.type !== 'reach') continue;
      const st = m.find((x) => x.id === item.id);
      const ready = !item.after || (m.find((x) => x.id === item.after) || {}).done;
      if (!st.done && ready) {
        for (const p of State.ours) if (item.units.includes(unitOfPos(p.pos)) && p.id !== State.carrierId) targets.push(p.id);
      }
    }
    $$('.l-ours .player', Board.svg).forEach((n) => n.classList.toggle('target', targets.includes(n.dataset.id)));
    const items = m.map((x) => `<li class="${x.done ? 'done' : x.broken ? 'broken' : ''}"><i>${x.done ? '✓' : x.broken ? '✗' : ''}</i>${x.label.split(':')[0]}${extra[x.id] || ''}</li>`).join('');
    const all = m.every((x) => x.done);
    box.className = `goal-status mission ${all ? 'met' : m.some((x) => x.broken) ? 'out' : 'open'}`;
    box.innerHTML = `<ul class="checklist">${items}</ul><span class="mission-left">${all ? 'Lesson complete. Finish now.' : `${left} action${left === 1 ? '' : 's'} left`}<br><u>What do these mean?</u></span>`;
    box.onclick = () => openSheet('This lesson’s checklist', `
      <p class="style-summary">${State.scenario.lesson.idea}</p>
      ${State.scenario.mission.items.map((i) => `<div class="explain-item"><b>${i.label.split(':')[0]}</b><p>${(() => { const t = i.label.split(':').slice(1).join(':').trim(); return t.charAt(0).toUpperCase() + t.slice(1); })()}.</p><p class="muted small">${i.why}</p>${i.type === 'draw' ? '<p class="small">On the pitch, opponents who count as drawn get a white ring, and the checklist shows how many you have so far.</p>' : ''}</div>`).join('')}`);
    return;
  }
  if (!State.sequence.length) {
    html = `<b>🎯 ${goal} · up to ${max} actions</b><span>Pass or dribble. Most solutions need more than one action.</span>`;
  } else if (goalMet()) {
    cls = 'met';
    html = `<b>✓ Goal reached</b><span>Finish now, or keep going if you can improve the position.</span>`;
  } else if (left > 0) {
    cls = 'open';
    html = `<b>Not there yet · ${left} action${left === 1 ? '' : 's'} left</b><span>${goal}. Pass, or tap the player on the ball to dribble.</span>`;
  } else {
    cls = 'out';
    html = `<b>No actions left</b><span>The goal was not reached. Finish to see how you did and watch the best sequence.</span>`;
  }
  box.className = `goal-status ${cls}`;
  box.onclick = null;
  box.innerHTML = html;
}

function refreshBoardState() {
  // While reviewing, the board is rewound to the opening picture, so the carrier
  // shown must be the one who actually faced that decision.
  const shownCarrierId = State.submitted ? State.scenario.startCarrier : State.carrierId;
  Board.setCarrier(shownCarrierId);
  Board.setSelectable(State.submitted ? [] : outfieldTeammates().map((p) => p.id));
  const used = State.sequence.length;
  const max = State.scenario.maxActions || 5;
  $('#actionsUsed').textContent = `${used} / ${max}`;
  const shown = State.ours.find((p) => p.id === shownCarrierId);
  $('#carrierLabel').textContent = shown ? shown.pos : '—';
  $('#finishBtn').disabled = State.submitted || used === 0;
  $('#undoBtn').disabled = State.submitted || used === 0;
  State.confirmFinish = false;
  if (State.carryMode && (State.submitted || State.busy)) setCarryMode(false);
  const met = goalMet();
  $('#finishBtn').textContent = State.submitted ? 'Sequence submitted' : met ? 'Finish sequence ✓' : 'Finish sequence';
  $('#finishBtn').classList.toggle('goal-met', met && !State.submitted);
  $('#finishBtn').classList.remove('confirm');
  renderGoalStatus();
  refreshShootButton();
  const gh = $('#goalHint');
  const cc = State.ours.find((p) => p.id === shownCarrierId);
  if (gh && cc) gh.textContent = `${Board.orient.arrow} Their goal · ${Math.round(distanceToGoal(cc))} yd from the ball`;
  $('#stateBadge').textContent = State.submitted ? 'Reviewing' : used === 0 ? 'Your move' : 'In progress';
  $('#stateBadge').className = `badge ${State.submitted ? 'badge-review' : 'badge-live'}`;
  $('.action-bar').hidden = State.submitted;
  document.body.classList.toggle('no-action-bar', State.submitted);
}

async function playPass(receiver, passType) {
  if (State.busy || State.submitted) return;
  const max = State.scenario.maxActions || 5;
  if (State.sequence.length >= max) {
    toast(`That is the action limit for this scenario (${max}). Finish the sequence to see the analysis.`);
    return;
  }
  const from = carrier();
  const type = passType || inferPassType(from, receiver, { defenders: State.theirs, teammates: State.ours });
  const result = evaluatePass(from, receiver, { defenders: State.theirs, teammates: State.ours, passType: type });

  State.busy = true;
  $('#board').classList.add('busy');
  hidePreview();

  const fromSnapshot = { x: from.x, y: from.y, id: from.id, pos: from.pos };
  await animatePass(from, receiver, type);

  State.sequence.push({
    from: fromSnapshot,
    to: { x: receiver.x, y: receiver.y, id: receiver.id, pos: receiver.pos },
    fromLabel: from.pos,
    toLabel: receiver.pos,
    result,
  });
  State.carrierId = receiver.id;
  State.history.push(snapshot(State.ours, State.theirs, State.carrierId, State.sequence[State.sequence.length - 1]));
  State.busy = false;
  $('#board').classList.remove('busy');
  refreshBoardState();
  renderSequence();
}

/* ------------------------------ Shooting ------------------------------ */

/** The number shown for an action: pass/carry success, or a shot's xG. */
const actionPct = (st) => (st.result.kind === 'shot' ? `${st.result.xg.toFixed(2)} xG` : `${st.result.confidence}%`);

function refreshShootButton() {
  const btn = $('#shootBtn');
  if (!btn) return;
  const c = carrier();
  const inRange = c && !State.submitted && distanceToGoal(c) <= SHOT_RANGE && c.x > 60;
  btn.hidden = !inRange;
  btn.disabled = State.busy;
}

/** First a look at the chance (like the pass preview), then the shot. */
function previewShot() {
  if (State.busy || State.submitted) return;
  const c = carrier();
  const r = evaluateShot(c, { defenders: State.theirs, teammates: State.ours });
  previewOpen = true;
  const box = $('#preview');
  const band = r.xg >= 0.2 ? 'low' : r.xg >= 0.1 ? 'medium' : 'high';
  box.innerHTML = `
    <div class="preview-head"><strong>${c.pos} shoots</strong><button class="icon-btn" id="previewClose" aria-label="Close">✕</button></div>
    <div class="preview-risk risk-${band}">
      <b>${Math.round(r.xg * 100)}</b>
      <span><em>${band === 'low' ? 'Good chance' : band === 'medium' ? 'Half-chance' : 'Low-quality shot'}</em>of 100 shots like this, about ${Math.round(r.xg * 100)} go in (${r.xg.toFixed(2)} xG)</span>
    </div>
    <ul class="shot-factors">${r.factors.map((f) => `<li class="${f.points > 0 ? 'pos' : f.points < 0 ? 'neg' : ''}"><b>${f.label}</b> ${f.detail}</li>`).join('')}</ul>
    <div class="row-actions"><button class="btn btn-ghost" id="shotCancel">Keep the ball</button><button class="btn btn-primary" id="shotGo">Shoot</button></div>`;
  box.hidden = false;
  $('#previewClose').onclick = hidePreview;
  $('#shotCancel').onclick = hidePreview;
  $('#shotGo').onclick = () => { hidePreview(); playShot(); };
}

async function playShot() {
  if (State.busy || State.submitted) return;
  const max = State.scenario.maxActions || 5;
  if (State.sequence.length >= max) { toast(`That is the action limit for this scenario (${max}).`); return; }
  const c = carrier();
  const result = evaluateShot(c, { defenders: State.theirs, teammates: State.ours });
  State.busy = true;
  $('#board').classList.add('busy');
  refreshShootButton();
  // The ball flies at the far side of the goal; the outcome is never simulated.
  const aim = { x: 105.5, y: c.y < 34 ? 36.5 : 31.5 };
  await animateBallTo(c, aim, 520);
  const snap = { x: c.x, y: c.y, id: c.id, pos: c.pos };
  State.sequence.push({ kind: 'shot', from: snap, to: snap, fromLabel: c.pos, toLabel: c.pos, result });
  State.history.push(snapshot(State.ours, State.theirs, State.carrierId, State.sequence[State.sequence.length - 1]));
  toast(`${Math.round(result.xg * 100)} in 100 shots like that go in (${result.xg.toFixed(2)} xG).`);
  State.busy = false;
  $('#board').classList.remove('busy');
  renderSequence();
  finishSequence(true); // a shot ends the move
}

function animateBallTo(from, to, ms) {
  return new Promise((resolve) => {
    if (reducedMotion()) { Board.moveBall(to.x, to.y); resolve(); return; }
    const t0 = performance.now();
    const tick = (now) => {
      const t = clamp((now - t0) / ms, 0, 1);
      Board.moveBall(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
      if (t < 1) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  });
}

/* ------------------------------ Carrying ------------------------------ */

const CARRY_MAX = 15; // yards per carry: beyond that it is a solo run, not a carry

function setCarryMode(on) {
  State.carryMode = on && !State.submitted && !State.busy;
  const c = carrier();
  Board.showCarryRange(State.carryMode ? c : null, CARRY_MAX);
  $('#board').classList.toggle('carry-mode', State.carryMode);
  if (State.carryMode) toast('Dribble: tap where he should run with the ball (up to 15 yd). Tap him again to cancel.');
}

async function playCarry(point) {
  if (State.busy || State.submitted) return;
  const max = State.scenario.maxActions || 5;
  if (State.sequence.length >= max) {
    toast(`That is the action limit for this scenario (${max}). Finish the sequence to see the analysis.`);
    return;
  }
  const from = carrier();
  // Clamp to range and pitch, and stop short of running into an opponent.
  let dx = point.x - from.x, dy = point.y - from.y;
  let d = Math.hypot(dx, dy);
  if (d < 2) { setCarryMode(false); return; }
  if (d > CARRY_MAX) { dx *= CARRY_MAX / d; dy *= CARRY_MAX / d; d = CARRY_MAX; }
  let dest = { x: clamp(from.x + dx, 1.5, 103.5), y: clamp(from.y + dy, 1.5, 66.5) };
  for (const o of State.theirs) {
    const gap = dist(dest, o);
    if (gap < 2.6) {
      const back = Math.max(0, dist(from, dest) - (2.6 - gap));
      const dd = dist(from, dest) || 1;
      dest = { x: from.x + ((dest.x - from.x) / dd) * back, y: from.y + ((dest.y - from.y) / dd) * back };
    }
  }
  const result = evaluateCarry(from, dest, { defenders: State.theirs });
  setCarryMode(false);
  State.busy = true;
  $('#board').classList.add('busy');
  hidePreview();
  const fromSnapshot = { x: from.x, y: from.y, id: from.id, pos: from.pos };
  const target = { ...from, x: dest.x, y: dest.y };
  await animatePass(from, target, 'carry');
  State.sequence.push({
    kind: 'carry',
    from: fromSnapshot,
    to: { x: dest.x, y: dest.y, id: from.id, pos: from.pos },
    fromLabel: from.pos,
    toLabel: from.pos,
    result,
  });
  State.history.push(snapshot(State.ours, State.theirs, State.carrierId, State.sequence[State.sequence.length - 1]));
  State.busy = false;
  $('#board').classList.remove('busy');
  refreshBoardState();
  renderSequence();
}

function undo() {
  if (!State.sequence.length || State.submitted) return;
  State.sequence.pop();
  // Rebuild deterministically from the scenario rather than reversing physics.
  const s = State.scenario;
  State.ours = State.startOurs.map((p) => ({ ...p }));
  State.theirs = State.startTheirs.map((p) => ({ ...p }));
  Board.setView(fitView(s));
  Board.drawTeam('theirs', State.theirs, { className: 'them' });
  Board.drawTeam('ours', State.ours, { className: 'us' });
  State.carrierId = s.startCarrier;
  resetReasons();
  State.history = [snapshot(State.ours, State.theirs, s.startCarrier)];
  const replay = [...State.sequence];
  State.sequence = [];
  const c0 = carrier();
  Board.drawBall({ x: c0.x, y: c0.y });
  for (const step of replay) {
    const rec = State.ours.find((p) => p.id === step.to.id);
    const target = step.kind === 'carry' ? { ...rec, x: step.to.x, y: step.to.y } : rec;
    const plan = planReaction(carrier(), target, step.result.passType);
    const defTargets = plan.theirs;
    const supTargets = plan.ours;
    for (const p of State.theirs) { const t = defTargets.get(p.id); if (t) Board.move(p, t.x, t.y); }
    for (const p of State.ours) { const t = supTargets.get(p.id); if (t) Board.move(p, t.x, t.y); }
    State.carrierId = rec.id;
    State.sequence.push(step);
    State.history.push(snapshot(State.ours, State.theirs, State.carrierId, step));
  }
  if (State.sequence.length) {
    const a = fitView(s), b = fitView(s, [...State.ours, ...State.theirs]);
    const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y);
    Board.setView({ x: x0, y: y0, w: Math.max(a.x + a.w, b.x + b.w) - x0, h: Math.max(a.y + a.h, b.y + b.h) - y0 });
  }
  const c = carrier();
  Board.moveBall(c.x, c.y);
  attachBoardHandlers();
  refreshBoardState();
  renderSequence();
}

function finishSequence(force) {
  if (State.submitted || !State.sequence.length) return;
  const max = State.scenario.maxActions || 5;
  // Stopping before the goal is allowed, but never by accident.
  if (force !== true && !goalMet() && State.sequence.length < max && !State.confirmFinish) {
    State.confirmFinish = true;
    const btn = $('#finishBtn');
    btn.textContent = 'Goal not reached · tap again to finish anyway';
    btn.classList.add('confirm');
    clearTimeout(State._confirmTimer);
    State._confirmTimer = setTimeout(() => { if (!State.submitted) refreshBoardState(); }, 4000);
    return;
  }
  clearTimeout(State._confirmTimer);
  const analysis = evaluateSequence(State.sequence, State.scenario, { objectiveMet: goalMet() });
  State.best = bestSequence({
    scenario: State.scenario,
    ours: State.startOurs.map((p) => ({ ...p })),
    theirs: State.startTheirs.map((p) => ({ ...p })),
    homes: State.homes, styles: State.styles, startBall: State.startBall,
  });
  State.submitted = true;
  State.analysis = analysis;

  State.profile = Mastery.applyEvidence(State.profile, analysis.concepts, {
    scenarioId: State.scenario.id,
    scenarioTitle: State.scenario.title,
    difficulty: State.scenario.difficulty || 1,
    rating: analysis.rating,
    verdict: analysis.verdict,
  });

  drawPostSubmissionOptions();
  refreshBoardState();
  renderSequence();
  renderAnalysis(analysis);
  renderProfile();
  $('#analysis').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

/** Primary / secondary / safety arrows — only ever drawn after submission. */
function drawPostSubmissionOptions() {
  Board.clearArrows();
  const first = State.sequence[0];
  const startOurs = State.startOurs.map((p) => ({ ...p }));
  const startTheirs = State.startTheirs.map((p) => ({ ...p }));
  const startCarrier = startOurs.find((p) => p.id === State.scenario.startCarrier);
  const ranked = rankOptions(startCarrier, startOurs, startTheirs);

  // Put every marker back where it stood when the decision was made. The options
  // below describe THAT picture, and drawing them over the final, post-movement
  // board made them point at space that is no longer open.
  for (const p of State.ours) {
    const home = State.startOurs.find((q) => q.id === p.id);
    if (home) Board.move(p, home.x, home.y);
  }
  for (const p of State.theirs) {
    const home = State.startTheirs.find((q) => q.id === p.id);
    if (home) Board.move(p, home.x, home.y);
  }
  Board.moveBall(startCarrier.x, startCarrier.y);
  Board.setView(fitView(State.scenario));
  resetReasons();

  const metaFor = (o) => o && ({
    from: startCarrier.pos, to: o.player.pos, confidence: o.confidence,
    passType: o.passTypeLabel, progression: o.progression, separation: o.effectiveSeparation,
  });
  if (ranked.primary) Board.arrow(startCarrier, ranked.primary.player, null, 'primary', 0.5, metaFor(ranked.primary));
  if (ranked.secondary) Board.arrow(startCarrier, ranked.secondary.player, null, 'secondary', 0.5, metaFor(ranked.secondary));
  if (ranked.safety) Board.arrow(startCarrier, ranked.safety.player, null, 'safety', 0.5, metaFor(ranked.safety));
  Board.arrow(startCarrier, { x: first.to.x, y: first.to.y }, null, 'yours', 0.5, {
    from: first.fromLabel, to: first.toLabel, confidence: first.result.confidence,
    passType: first.result.passTypeLabel, progression: first.result.metrics.progression,
    separation: first.result.metrics.effectiveSeparation, yours: true,
  });
  attachRouteHandlers();
  $('#routeKey').hidden = false;
  State._ranked = ranked;
}

/* ==================== Route explanations (tap or hold) ==================== */

const ROUTE_MEANING = {
  primary: {
    name: 'Primary option',
    what: 'The pass the engine rates highest overall.',
    how: 'It blends how likely the ball was to arrive with how much the pass actually achieved — territory gained and opponents taken out of the game. It is not simply the safest ball.',
  },
  secondary: {
    name: 'Secondary option',
    what: 'The next best pass from the same picture.',
    how: 'Usually genuinely defensible. Where the primary and secondary are close, either choice is good coaching and the difference is style, not correctness.',
  },
  safety: {
    name: 'Safest option',
    what: 'The pass most likely to simply arrive.',
    how: 'Shown separately when it is not the primary — which is the whole point. The safest ball and the best ball are often different, and knowing when to take which is the skill.',
  },
  yours: {
    name: 'Your pass',
    what: 'The first pass you actually played.',
    how: 'Compare its shape against the coloured routes. If yours sits on top of the primary, you saw what the engine saw.',
  },
};

function showRouteDetail(cls, meta) {
  const m = ROUTE_MEANING[cls];
  if (!m) return;
  const detail = meta ? `
    <div class="route-facts">
      <div><span>Pass</span><b>${meta.from} → ${meta.to}</b></div>
      <div><span>Confidence</span><b>${meta.confidence}%</b></div>
      <div><span>Delivery</span><b>${meta.passType}</b></div>
      <div><span>Receiver keeps</span><b>${meta.separation} yd</b></div>
      <div><span>Toward goal</span><b>${meta.progression > 0 ? '+' : ''}${meta.progression} yd</b></div>
    </div>` : '';
  openSheet(m.name, `
    <p class="sheet-lead">${m.what}</p>
    ${detail}
    <h4>How it is chosen</h4><p>${m.how}</p>
    <p class="sheet-foot">Confidence is a tactical estimate from the published scoring model, not a measured probability. Open Why Mode for the factors behind it.</p>`);
}

/** Every route line and every key swatch explains itself on tap or hold. */
function attachRouteHandlers() {
  $$('.route-hit', Board.svg).forEach((line) => {
    const open = (e) => {
      e.preventDefault();
      const raw = line.getAttribute('data-meta');
      showRouteDetail(line.dataset.route, raw ? JSON.parse(raw) : null);
    };
    line.onclick = open;
    line.oncontextmenu = open;
  });
  $$('#routeKey span[data-route]').forEach((chip) => {
    chip.onclick = () => showRouteDetail(chip.dataset.route, null);
  });
}

/* ============================ Board input ============================ */

let pressTimer = null, pressTarget = null, previewOpen = false;

function attachBoardHandlers() {
  const svg = Board.svg;
  svg.oncontextmenu = (e) => e.preventDefault();

  const playerFromEvent = (e) => {
    const node = e.target.closest && e.target.closest('.player');
    if (!node) return null;
    return State.ours.find((p) => p.id === node.dataset.id) || null;
  };

  const down = (e) => {
    if (State.busy || State.submitted) return;
    const p = playerFromEvent(e);
    if (!p || p.id === State.carrierId) return;
    pressTarget = p;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => { showPreview(p); pressTimer = null; }, 380);
  };
  const up = (e) => {
    if (State.busy) return;
    // Opponents are not pass targets: a tap asks why he is standing there.
    const oppNode = e.target.closest && e.target.closest('.l-theirs .player');
    if (oppNode) {
      const opp = State.theirs.find((p) => p.id === oppNode.dataset.id);
      if (opp) showWhy(opp, 'them');
      return;
    }
    if (State.submitted) return;
    const tapped = playerFromEvent(e);
    if (tapped && tapped.id === State.carrierId) { setCarryMode(!State.carryMode); return; }
    if (State.carryMode && !tapped) {
      const pt = Board.toPitch(e.clientX, e.clientY);
      if (pt) playCarry(pt);
      return;
    }
    if (State.carryMode && tapped) setCarryMode(false);
    const wasHold = pressTimer === null && previewOpen;
    clearTimeout(pressTimer);
    if (wasHold) { pressTarget = null; return; }
    pressTimer = null;
    const p = playerFromEvent(e);
    if (p && pressTarget && p.id === pressTarget.id) playPass(p);
    pressTarget = null;
  };
  const cancel = () => { clearTimeout(pressTimer); pressTimer = null; pressTarget = null; };

  svg.onpointerdown = down;
  svg.onpointerup = up;
  svg.onpointercancel = cancel;
  svg.onpointerleave = cancel;
}

function showPreview(receiver) {
  previewOpen = true;
  const from = carrier();
  const types = rankPassTypes(from, receiver, { defenders: State.theirs, teammates: State.ours });
  const top = types[0];
  const m = top.metrics;
  const box = $('#preview');
  const band = top.confidence >= 75 ? 'low' : top.confidence >= 55 ? 'medium' : 'high';
  box.innerHTML = `
    <div class="preview-head">
      <strong>${from.pos} → ${receiver.pos}</strong>
      <button class="icon-btn" id="previewClose" aria-label="Close preview">✕</button>
    </div>
    <div class="preview-risk risk-${band}">
      <b>${top.confidence}%</b>
      <span><em>${band === 'low' ? 'Low' : band === 'medium' ? 'Medium' : 'High'} risk</em>chance this ${top.label.toLowerCase()} gets through</span>
    </div>
    <div class="preview-grid">
      <div><span>Receiver separation</span><b>${m.effectiveSeparation} yd</b><em>on the ball's arrival</em></div>
      <div><span>Pass distance</span><b>${m.passDistance} yd</b><em>${m.travelTime}s at ${speed(SPEED[top.passType])}</em></div>
      <div><span>Receiver to goal</span><b>${m.distanceToGoalAfter} yd</b><em>from ${m.distanceToGoalBefore} yd now</em></div>
      <div><span>Lane traffic</span><b>${m.laneRisk}%</b><em>0% is a clear lane</em></div>
    </div>
    <div class="preview-types">
      <div class="preview-types-title">Best pass types here <span class="hint">tactical estimate</span></div>
      ${types.slice(0, 3).map((t, i) => `
        <button class="type-row${i === 0 ? ' best' : ''}" data-type="${t.passType}">
          <span class="tname">${t.label}</span>
          <span class="tbar"><i style="width:${t.confidence}%"></i></span>
          <span class="tval">${t.confidence}%</span>
        </button>`).join('')}
    </div>
    <p class="preview-why"><b>Why he is there:</b> ${State.reasons.get(receiver.id) || ''}</p>
    <p class="preview-foot">Tap a pass type to play it, or release and tap the player to let the engine choose.</p>
  `;
  box.hidden = false;
  $('#previewClose').onclick = hidePreview;
  $$('.type-row', box).forEach((btn) => {
    btn.onclick = () => { hidePreview(); playPass(receiver, btn.dataset.type); };
  });
}

/** Tap an opponent: who he is and why he is standing exactly there. */
function showWhy(player, side) {
  previewOpen = true;
  const box = $('#preview');
  const style = side === 'them' ? DEF_STYLES[State.styles.theirs] : ATT_STYLES[State.styles.ours];
  box.innerHTML = `
    <div class="preview-head">
      <strong><span class="who ${side}">${side === 'them' ? 'Their' : 'Our'} ${player.pos}</span></strong>
      <button class="icon-btn" id="previewClose" aria-label="Close">✕</button>
    </div>
    <p class="why-text">${State.reasons.get(player.id) || ''}</p>
    <p class="preview-foot">${style.label}. Tap the style chip above the pitch for the full picture.</p>
  `;
  box.hidden = false;
  $('#previewClose').onclick = hidePreview;
}

/** Which formation each team uses in this scenario (explicit, or read from the brief). */
function formationsFor(s) {
  const f = s.formations || {};
  return {
    ours: f.ours || '4-3-3',
    theirs: f.theirs || formationFromText(s.context && s.context.opponent),
  };
}

/**
 * A small pitch showing one formation, with a toggle between its shape
 * without the ball and with it. Players glide between the two so you can
 * see who moves where, and why.
 */
function shapeCardHTML(formationId, side, phase) {
  const f = formationById(formationId);
  if (!f) return '';
  const uid = `shape-${side}`;
  return `
    <div class="shape-card" id="${uid}" data-formation="${f.id}" data-side="${side}" data-phase="${phase}">
      <div class="shape-head">
        <b>${f.name}</b><span class="shape-level">Level ${f.level} · ${LEVEL_NAMES[f.level]}</span>
      </div>
      <div class="shape-toggle" role="tablist">
        <button data-phase="oop" class="${phase === 'oop' ? 'on' : ''}">Without the ball</button>
        <button data-phase="ip" class="${phase === 'ip' ? 'on' : ''}">With the ball</button>
      </div>
      <svg class="shape-pitch ${side}" viewBox="0 0 68 105" aria-label="${f.name} shape">
        <rect x="0" y="0" width="68" height="105" class="sp-turf"/>
        <rect x="0.4" y="0.4" width="67.2" height="104.2" class="sp-line"/>
        <line x1="0.4" y1="52.5" x2="67.6" y2="52.5" class="sp-line"/>
        <circle cx="34" cy="52.5" r="9.15" class="sp-line"/>
        <rect x="13.85" y="0.4" width="40.3" height="16.5" class="sp-line"/>
        <rect x="13.85" y="88.1" width="40.3" height="16.5" class="sp-line"/>
        <g class="sp-players"></g>
      </svg>
      <p class="shape-phase-name"></p>
      <p class="shape-how"></p>
      <div class="shape-sw">
        <div><h5>Strengths</h5><ul>${f.strengths.map((x) => `<li>${x}</li>`).join('')}</ul></div>
        <div><h5>Weaknesses</h5><ul>${f.weaknesses.map((x) => `<li>${x}</li>`).join('')}</ul></div>
      </div>
    </div>`;
}

function mountShapeCard(card) {
  if (!card) return;
  const f = formationById(card.dataset.formation);
  const side = card.dataset.side;
  const g = card.querySelector('.sp-players');
  const nodes = new Map();
  const place = (phase, animate) => {
    card.dataset.phase = phase;
    card.querySelectorAll('.shape-toggle button').forEach((b) => b.classList.toggle('on', b.dataset.phase === phase));
    card.querySelector('.shape-phase-name').textContent = phase === 'ip' ? f.ipName : f.oopName;
    card.querySelector('.shape-how').textContent = phase === 'ip' ? f.ipHow : f.oopHow;
    for (const p of shape(f.id, phase, side)) {
      let n = nodes.get(p.id);
      if (!n) {
        n = document.createElementNS(SVG_NS, 'g');
        n.setAttribute('class', `sp-player ${side}${p.role === 'keeper' ? ' keeper' : ''}`);
        n.innerHTML = `<circle r="2.3"></circle><text y="0.75">${p.pos}</text>`;
        g.appendChild(n);
        nodes.set(p.id, n);
      }
      n.style.transition = animate && !reducedMotion() ? 'transform .7s ease' : 'none';
      // Same orientation as the board: attacking up, our right on the right.
      n.style.transform = `translate(${68 - p.y}px, ${105 - p.x}px)`;
    }
  };
  place(card.dataset.phase, false);
  card.querySelectorAll('.shape-toggle button').forEach((b) => { b.onclick = () => place(b.dataset.phase, true); });
}

/** The style chips: what each team is trying to do, in plain English. */
function renderStyleChips() {
  const them = DEF_STYLES[State.styles.theirs];
  const us = ATT_STYLES[State.styles.ours];
  const host = $('#styleChips');
  if (!host) return;
  const fm = formationsFor(State.scenario);
  host.innerHTML = `
    <button class="style-chip them" data-side="them"><i></i>Them: ${fm.theirs ? fm.theirs + ' ' : ''}${them.short}</button>
    <button class="style-chip us" data-side="us"><i></i>Us: ${fm.ours} ${us.short}</button>`;
  $$('.style-chip', host).forEach((b) => {
    b.onclick = () => {
      const isThem = b.dataset.side === 'them';
      const st = isThem ? them : us;
      const fid = isThem ? fm.theirs : fm.ours;
      openSheet(`${isThem ? 'Them' : 'Us'}: ${fid ? fid + ', ' : ''}${st.label.toLowerCase()}`, `
        ${fid ? shapeCardHTML(fid, isThem ? 'theirs' : 'ours', isThem ? 'oop' : 'ip') : ''}
        <h4 class="style-title">How they play it: ${st.label}</h4>
        <p class="style-summary">${st.summary}</p>
        <p class="muted small">Shapes and styles are coaching models used to move every player on the board, not claims about any particular real team. Tap any opponent on the pitch to see why he moved.</p>`);
      mountShapeCard($('#sheetBody .shape-card'));
    };
  });
}

function hidePreview() {
  previewOpen = false;
  const box = $('#preview');
  if (box) { box.hidden = true; box.innerHTML = ''; }
}

/* ============================ Rendering ============================ */

function renderScenarioHeader() {
  const s = State.scenario;
  $('#scenarioTitle').textContent = s.title;
  $('#scenarioSubtitle').textContent = s.subtitle;
  $('#ctxPhase').textContent = s.context.phase;
  $('#ctxState').textContent = s.context.gameState;
  $('#ctxOpponent').textContent = s.context.opponent;
  $('#ctxInstruction').textContent = s.context.instruction;
  $('#objectiveText').textContent = s.lesson ? s.lesson.title : s.objective;
  $('.objective-tag').textContent = s.lesson ? 'Lesson' : 'Goal';
  const lessonBox = $('#lessonIdea');
  if (lessonBox) {
    lessonBox.hidden = !s.lesson;
    if (s.lesson) lessonBox.innerHTML = `<p>${s.lesson.idea}</p>${s.lesson.shapes ? `<p class="lesson-shapes"><b>The shapes.</b> ${s.lesson.shapes} <span class="muted">Tap the team buttons above the pitch to see each shape with and without the ball.</span></p>` : ''}<ol class="lesson-list">${s.mission.items.map((i) => `<li><b>${i.label.split(':')[0]}:</b> ${i.label.split(':').slice(1).join(':').trim()}</li>`).join('')}</ol>`;
  }
}

function renderSequence() {
  const wrap = $('#sequence');
  if (!State.sequence.length) {
    wrap.innerHTML = '<p class="empty">Tap a teammate to pass. Hold a teammate to preview the pass. Tap the player on the ball, then tap open grass, to dribble into space.</p>';
    return;
  }
  wrap.innerHTML = State.sequence.map((s, i) => `
    <div class="seq-step">
      <span class="seq-n">${i + 1}</span>
      <span class="seq-body"><b>${s.kind === 'carry' ? `${s.fromLabel} runs ${s.result.metrics.passDistance} yd` : s.kind === 'shot' ? `${s.fromLabel} shoots from ${s.result.metrics.passDistance} yd` : `${s.fromLabel} → ${s.toLabel}`}</b><em>${s.result.passTypeLabel}</em></span>
      <span class="seq-pct${s.kind !== 'shot' && s.result.confidence < 45 ? ' risky' : ''}">${State.submitted ? actionPct(s) : '•'}</span>
    </div>`).join('');
}

/** The lesson checklist, item by item, with what happened and why it matters. */
function lessonDebrief(a) {
  const s = State.scenario;
  if (!s.lesson) return '';
  const m = missionStatus(s.mission, State.history);
  const line = s.lesson.debrief[a.verdict === 'success' ? 'success' : a.verdict === 'lost' ? 'lost' : 'partial'];
  return `
    <section class="debrief">
      <h4>Lesson: ${s.lesson.title}</h4>
      <ul class="debrief-items">
        ${m.map((x) => `<li class="${x.done ? 'done' : 'missed'}"><i>${x.done ? '✓' : '✗'}</i><div><b>${x.label}</b><p>${x.detail}</p><em>${x.why}</em></div></li>`).join('')}
      </ul>
      <p class="debrief-coach">${line}</p>
    </section>`;
}

/** Said plainly when the learner stopped short with passes still in hand. */
function earlyStopNote(a) {
  const max = State.scenario.maxActions || 5;
  const n = State.sequence.length;
  if (a.verdict === 'success' || n >= max || State.scenario.lesson || State.sequence.some((x) => x.kind === 'shot')) return '';
  const left = max - n;
  return `<li class="note note-warn"><b>You stopped after ${n} action${n === 1 ? '' : 's'}</b> with ${left} still available. ${goalShort(State.scenario)} was the goal; a sequence is allowed to take several passes to get there.</li>`;
}

/** The engine's best full sequence from the opening picture, next to yours. */
function bestSequenceCard(a) {
  const b = State.best;
  if (!b || !b.sequence.length) return '';
  const steps = b.sequence.map((st, i) => `
    <li><span class="bs-n">${i + 1}</span><span class="bs-body"><b>${st.kind === 'carry' ? `${st.fromLabel} runs ${st.result.metrics.passDistance} yd` : st.kind === 'shot' ? `${st.fromLabel} shoots` : `${st.fromLabel} → ${st.toLabel}`}</b><em>${st.result.passTypeLabel}</em></span><span class="bs-pct${st.kind !== 'shot' && st.result.confidence < 50 ? ' risky' : ''}">${actionPct(st)}</span></li>`).join('');
  return `
    <section class="best-seq">
      <div class="best-head">
        <h4>Best sequence the engine found</h4>
        <span class="best-rating">${b.analysis.rating}<em>rating</em></span>
      </div>
      <p class="best-compare">Yours: ${a.summary.passes} action${a.summary.passes === 1 ? '' : 's'}, rated ${a.rating}. Best found: ${b.sequence.length} action${b.sequence.length === 1 ? '' : 's'}, rated ${b.analysis.rating}${b.objectiveMet ? ', objective met' : ''}.</p>
      <ol class="best-steps">${steps}</ol>
      ${b.objectiveMet ? '' : '<p class="best-note">Even the best route found here does not fully reach the goal, so this scenario is genuinely hard. Some of these goals need a pass into a teammate\'s run, which the board cannot play yet.</p>'}
      <div class="replay-row">
        <button class="btn btn-ghost" id="watchMineBtn">▶ Replay mine</button>
        <button class="btn btn-primary" id="watchBestBtn">▶ Watch the best</button>
      </div>
      <p class="best-foot">Played with the same scoring and the same defensive movement as your own passes. It is the strongest route the engine found, not the only good answer.</p>
    </section>`;
}

function renderAnalysis(a) {
  const panel = $('#analysis');
  panel.hidden = false;
  const ranked = State._ranked || {};
  const optionRow = (o, tag, cls) => o ? `
    <div class="opt ${cls}">
      <span class="opt-tag">${tag}</span>
      <span class="opt-name">Pass to ${o.player.pos}</span>
      <span class="opt-pct">${o.confidence}%</span>
      <p class="opt-why">${o.passTypeLabel}. ${o.progression > 3 ? `Gains ${o.progression} yd toward goal.` : o.progression < -3 ? `Concedes ${Math.abs(o.progression)} yd of territory but is a secure option.` : 'Holds field position.'} Receiver keeps about ${o.effectiveSeparation} yd when the ball arrives.</p>
    </div>` : '';

  panel.innerHTML = `
    <div class="verdict verdict-${a.verdict}">
      <div class="verdict-top">
        <h3>${a.headline}</h3>
        <div class="rating"><b>${a.rating}</b><span>sequence rating</span></div>
      </div>
      <div class="summary-grid">
        <div><b>${a.summary.passes}</b><span>actions</span></div>
        <div><b>${a.summary.averageConfidence}%</b><span>average pass</span></div>
        <div><b>${a.summary.weakestPass}%</b><span>weakest pass</span></div>
        <div><b>${a.summary.progression} yd</b><span>toward goal</span></div>
      </div>
    </div>

    ${lessonDebrief(a)}
    <ul class="notes">
      ${earlyStopNote(a)}
      ${a.notes.map((n) => `<li class="note note-${n.tone}">${n.text}</li>`).join('')}
    </ul>

    ${bestSequenceCard(a)}
    <p class="watch-hint">The arrows on the pitch show the options from the opening picture. Tap any coloured line, or a swatch in the key, to see that pass and its confidence.</p>

    <p class="reveal-lead">Three things sit underneath, in the order most people want them. Open only what you need.</p>

    <section class="why-block">
      <button class="why-toggle" id="whyToggle" aria-expanded="false">
        <span class="why-icon">?</span>
        <span class="why-copy"><b>Why Mode</b><em>See the factors behind every percentage in this sequence</em></span>
        <span class="chev">▾</span>
      </button>
      <div class="why-body" id="whyBody" hidden>
        <p class="why-scope">This explains <b>each individual pass</b> you played, then the sequence as a whole. Percentages are tactical estimates produced by the published scoring model — not measured probabilities.</p>
        ${State.sequence.map((s, i) => `
          <div class="why-pass">
            <h4>${s.kind === 'carry' ? `Action ${i + 1}: ${s.fromLabel} runs with the ball` : s.kind === 'shot' ? `Action ${i + 1}: ${s.fromLabel} shoots` : `Action ${i + 1}: ${s.fromLabel} → ${s.toLabel}`} <span class="why-pct">${actionPct(s)}</span></h4>
            <p class="why-type">${s.kind === 'shot'
              ? `Shot · ${s.result.metrics.passDistance} yd out · ${s.result.metrics.angleDeg}° of goal to aim at · about ${Math.round(s.result.xg * 100)} in 100 go in`
              : s.kind === 'carry'
              ? `Carry · ${s.result.metrics.passDistance} yd at ${speed(SPEED.carry)} · ${s.result.metrics.travelTime}s · about ${s.result.metrics.effectiveSeparation} yd of space when he arrives`
              : `${s.result.passTypeLabel} · ${s.result.metrics.passDistance} yd at ${speed(SPEED[s.result.passType])} · ${s.result.metrics.travelTime}s travel · receiver keeps ${s.result.metrics.effectiveSeparation} yd`}</p>
            <ul class="factors">
              ${s.result.factors.map((f) => `
                <li class="${f.points >= 0 ? 'pos' : 'neg'}">
                  <span class="fpts">${s.kind === 'shot' ? (f.points > 0 ? '▲' : f.points < 0 ? '▼' : '•') : `${f.points > 0 ? '+' : ''}${f.points}`}</span>
                  <span class="fbody"><b>${f.label}</b><em>${f.detail}</em></span>
                </li>`).join('')}
            </ul>
          </div>`).join('')}
        <div class="why-pass">
          <h4>The sequence as a whole</h4>
          <p class="why-type">A sequence is capped by its riskiest action. Territory gained and opponents eliminated are then added on top, and meeting the stated objective is worth a further bonus.</p>
        </div>
        <details class="model-details">
          <summary>The scoring model in full</summary>
          <p>Every pass starts at a base of ${WEIGHTS.base} and is adjusted by named factors, each with a fixed maximum influence:</p>
          <ul>
            ${Object.entries(WEIGHTS).filter(([k]) => k !== 'base').map(([k, v]) => `<li><b>${k.replace(/([A-Z])/g, ' $1').toLowerCase()}</b> — up to ${v} points</li>`).join('')}
          </ul>
          <div class="units-row">
            <span>Show speeds in</span>
            <span class="units-toggle">
              ${Object.entries(SPEED_UNITS).map(([k, u]) => `<button class="chip${Units.get() === k ? ' lvl-mastered' : ''}" data-unit="${k}">${u.label}</button>`).join('')}
            </span>
          </div>
          <p>A covering defender is assumed to recover at ${speed(SPEED.defenderRecovery)}. Ball speeds are ${speed(SPEED.ground)} on the ground, ${speed(SPEED.driven)} driven, ${speed(SPEED.through)} for a through ball and ${speed(SPEED.chip)} lofted. Nothing in the engine is random — the same picture always produces the same number.</p>
        </details>
      </div>
    </section>

    <section class="why-block">
      <button class="why-toggle" id="optionsToggle" aria-expanded="false">
        <span class="why-icon">⇄</span>
        <span class="why-copy"><b>How the options ranked</b><em>${ranked.primary ? `The engine's first choice was ${ranked.primary.player.pos} at ${ranked.primary.confidence}%` : 'The alternatives you had at the moment of the decision'}</em></span>
        <span class="chev">▾</span>
      </button>
      <div class="why-body" id="optionsBody" hidden>
        <p class="options-note">The board above has been rewound to the opening picture, because these options describe the decision you faced <em>before</em> anyone moved. More than one is defensible — the ranking blends how likely the pass was to arrive with how much it actually achieved.</p>
        ${optionRow(ranked.primary, 'PRIMARY', 'primary')}
        ${optionRow(ranked.secondary, 'SECONDARY', 'secondary')}
        ${optionRow(ranked.safety, 'SAFETY', 'safety')}
      </div>
    </section>

    <section class="why-block">
      <button class="why-toggle" id="masteryToggle" aria-expanded="false">
        <span class="why-icon">◉</span>
        <span class="why-copy"><b>What this told the mastery model</b><em>${a.concepts.length ? `${a.concepts.length} concept${a.concepts.length === 1 ? '' : 's'} moved on your profile` : 'No concept evidence from this sequence'}</em></span>
        <span class="chev">▾</span>
      </button>
      <div class="why-body" id="masteryBody" hidden>
        ${a.concepts.length ? `<ul class="concept-list">${
          a.concepts.map((c) => `<li class="${c.delta >= 0 ? 'pos' : 'neg'}"><b>${Mastery.CONCEPT_NAMES[c.concept] || c.concept}</b><em>${c.why}</em></li>`).join('')
        }</ul>` : '<p class="empty">This sequence did not produce evidence for any tracked concept. That usually means it ended before the scenario\'s teaching moment.</p>'}
      </div>
    </section>

    <div class="analysis-actions">
      <button class="btn btn-ghost" id="retryBtn">Try this scenario again</button>
      <button class="btn btn-ghost" id="nextScenarioBtn">Next scenario</button>
    </div>
  `;

  $$('.units-toggle .chip', panel).forEach((b) => {
    b.onclick = (e) => {
      e.preventDefault();
      Units.set(b.dataset.unit);
      const open = !$('#whyBody').hidden;
      renderAnalysis(a);
      if (open) $('#whyToggle').click();
    };
  });

  // One disclosure behaviour for all three sections, so they read as one system.
  for (const [btnId, bodyId] of [
    ['whyToggle', 'whyBody'],
    ['optionsToggle', 'optionsBody'],
    ['masteryToggle', 'masteryBody'],
  ]) {
    const btn = $('#' + btnId), body = $('#' + bodyId);
    if (!btn || !body) continue;
    btn.onclick = () => {
      const open = body.hidden;
      body.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.classList.toggle('open', open);
      if (open) btn.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    };
  }
  if ($('#watchBestBtn')) $('#watchBestBtn').onclick = () => playSequence('best');
  if ($('#watchMineBtn')) $('#watchMineBtn').onclick = () => playSequence('mine');
  $('#retryBtn').onclick = () => loadScenario(State.scenario.id);
  $('#nextScenarioBtn').onclick = () => {
    const i = SCENARIOS.findIndex((s) => s.id === State.scenario.id);
    loadScenario(SCENARIOS[(i + 1) % SCENARIOS.length].id);
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };
}

/**
 * Play the engine's recommended route as an animation, so the user can watch
 * the ball travel and the defence react rather than reading a static arrow.
 * Restores the opening picture and the arrows when it finishes.
 */
/**
 * Replays a full sequence on the board from the opening picture, action by
 * action, with a caption: either yours ('mine') or the engine's best ('best').
 * Both use the same movement, so the two can be compared directly.
 */
async function playSequence(which) {
  const b = State.best;
  const steps = which === 'mine' ? State.sequence : b && b.sequence;
  if (!steps || !steps.length || State.busy) return;
  const btns = ['#watchBestBtn', '#watchMineBtn'].map((id) => $(id)).filter(Boolean);
  const btn = which === 'mine' ? $('#watchMineBtn') : $('#watchBestBtn');
  const label = which === 'mine' ? 'Your sequence' : 'Best sequence';
  const cap = $('#boardCaption');
  State.busy = true;
  $('#board').classList.add('busy');
  btns.forEach((x) => { x.disabled = true; });
  if (btn) btn.textContent = 'Playing…';
  $('#board').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });

  // Back to the opening picture with nothing drawn over it.
  Board.clearArrows();
  $('#routeKey').hidden = true;
  for (const p of State.ours) { const h = State.startOurs.find((q) => q.id === p.id); Board.move(p, h.x, h.y); }
  for (const p of State.theirs) { const h = State.startTheirs.find((q) => q.id === p.id); Board.move(p, h.x, h.y); }
  Board.setView(fitView(State.scenario));
  let carrierNode = State.ours.find((p) => p.id === State.scenario.startCarrier);
  Board.setCarrier(carrierNode.id);
  Board.moveBall(carrierNode.x, carrierNode.y);
  cap.hidden = false;
  cap.className = `board-caption ${which}`;
  cap.innerHTML = `<b>${label}</b> from the opening picture`;
  await new Promise((r) => setTimeout(r, 700));

  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    const node = State.ours.find((p) => p.id === st.to.id);
    const head = `<b>${label} · ${i + 1} of ${steps.length}</b>`;
    if (st.kind === 'shot') {
      cap.innerHTML = `${head} ${st.fromLabel} shoots · ${st.result.xg.toFixed(2)} xG (about ${Math.round(st.result.xg * 100)} in 100 go in)`;
      await animateBallTo(carrierNode, { x: 105.5, y: carrierNode.y < 34 ? 36.5 : 31.5 }, 520);
      await new Promise((r) => setTimeout(r, 900));
      continue;
    }
    const receiver = st.kind === 'carry' ? { ...node, x: st.to.x, y: st.to.y } : node;
    cap.innerHTML = st.kind === 'carry'
      ? `${head} ${st.fromLabel} runs ${st.result.metrics.passDistance} yd with the ball · ${st.result.confidence}%`
      : `${head} ${st.fromLabel} → ${st.toLabel} · ${st.result.passTypeLabel} · ${st.result.confidence}%`;
    await animatePass(carrierNode, receiver, st.result.passType);
    Board.setCarrier(node.id);
    carrierNode = node;
    await new Promise((r) => setTimeout(r, 650));
  }
  const done = which === 'mine'
    ? (State.analysis.verdict === 'success' ? '<b>✓ You completed it</b> That was your sequence.' : `<b>End of your sequence</b> ${State.analysis.headline}`)
    : (b.objectiveMet ? '<b>✓ Objective reached</b> That is the best sequence the engine found.' : '<b>End of the best sequence</b> The closest the engine got to the goal.');
  cap.innerHTML = done;
  await new Promise((r) => setTimeout(r, 1500));
  cap.hidden = true;

  // Restore the review picture and its arrows.
  drawPostSubmissionOptions();
  refreshBoardState();
  State.busy = false;
  $('#board').classList.remove('busy');
  btns.forEach((x) => { x.disabled = false; });
  if ($('#watchMineBtn')) $('#watchMineBtn').textContent = '▶ Replay mine';
  if ($('#watchBestBtn')) $('#watchBestBtn').textContent = '▶ Watch the best';
}

/* ---------------------------- Profile ---------------------------- */

function renderProfile() {
  const p = State.profile;
  const overall = Mastery.overallScore(p);
  const pct = overall * 100;
  $('#profileOverall').textContent = `${pct > 0 && pct < 10 ? pct.toFixed(1) : Math.round(pct)}%`;
  $('#profileLevel').textContent = Mastery.levelFor(overall).label;
  $('#profileAttempts').textContent = p.attempts;
  $('#profileSolved').textContent = p.solved;

  // A wall of zeros tells a new user nothing. Say what to do instead.
  const fresh = p.attempts === 0;
  const hero = $('.profile-hero');
  if (hero) hero.classList.toggle('is-empty', fresh);
  let starter = $('#profileStarter');
  if (fresh) {
    if (!starter) {
      starter = htm('div', { class: 'starter', id: 'profileStarter' });
      hero.appendChild(starter);
    }
    starter.innerHTML = `
      <p><b>Nothing measured yet.</b> This profile is built entirely from sequences you finish — there is no starting score and nothing is assumed about you.</p>
      <p>One scenario is enough to move six of these numbers. Start with <b>Build out against the press</b>: it tests the single skill everything else rests on, which is finding the free man before the ball reaches your feet.</p>
      <button class="btn btn-primary" id="starterBtn">Play your first scenario</button>`;
    $('#starterBtn').onclick = () => {
      loadScenario(SCENARIOS[0].id);
      switchTab('train');
      window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    };
  } else if (starter) {
    starter.remove();
  }

  $('#domainList').innerHTML = Mastery.DOMAINS.map((d) => {
    const v = Mastery.domainScore(p, d);
    const lvl = Mastery.levelFor(v);
    return `
      <div class="domain">
        <div class="domain-top"><b>${d.name}</b><span class="lvl lvl-${lvl.key}">${lvl.label}</span></div>
        <div class="meter"><i style="width:${Math.max(2, v * 100)}%"></i></div>
        <div class="concepts">
          ${d.concepts.map((c) => {
            const cv = p.concepts[c] ? p.concepts[c].value : 0;
            return `<button class="chip lvl-${Mastery.levelFor(cv).key}" data-concept="${c}">${Mastery.CONCEPT_NAMES[c] || c}</button>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');

  $$('#domainList .chip').forEach((b) => { b.onclick = () => showConceptDetail(b.dataset.concept); });

  const weak = Mastery.weakestConcepts(p);
  $('#recommendations').innerHTML = weak.length
    ? `<p>Based on your evidence so far, these are the concepts to work on next:</p><ul>${
      weak.map((w) => `<li><b>${w.name}</b> — ${Math.round(w.value * 100)}% and rising only when you solve scenarios that actually test it.</li>`).join('')
    }</ul>`
    : '<p class="empty">Nothing to recommend yet. Finish one sequence and this becomes a ranked list of the concepts your own decisions were weakest on.</p>';

  $('#badgeList').innerHTML = Mastery.BADGES.map((b) => {
    const earned = p.badges.includes(b.id);
    return `<button class="badge-card${earned ? ' earned' : ''}" data-badge="${b.id}">
      <span class="badge-dot">${earned ? '★' : '☆'}</span>
      <span class="badge-name">${b.name}</span>
      <span class="badge-state">${earned ? 'Earned' : 'Not yet'}</span>
    </button>`;
  }).join('');
  $$('#badgeList .badge-card').forEach((b) => { b.onclick = () => showBadgeDetail(b.dataset.badge); });

  $('#historyList').innerHTML = p.history.length
    ? p.history.slice(0, 8).map((h) => `<li><b>${h.title}</b><span class="h-${h.verdict}">${h.verdict}</span><em>${h.rating}</em></li>`).join('')
    : '<li class="empty">No sequences yet. Every one you finish is logged here with its verdict and rating, so you can see whether your reading is improving over weeks rather than guessing.</li>';
}

function showConceptDetail(id) {
  const c = State.profile.concepts[id];
  const name = Mastery.CONCEPT_NAMES[id] || id;
  const v = c ? c.value : 0;
  openSheet(name, `
    <p class="sheet-lead">${Mastery.levelFor(v).label} — ${Math.round(v * 100)}%</p>
    <div class="meter big"><i style="width:${Math.max(2, v * 100)}%"></i></div>
    <h4>Evidence</h4>
    ${c && c.evidence.length
      ? `<ul class="evidence">${c.evidence.map((e) => `<li><b>${e.delta > 0 ? '+' : ''}${e.delta}</b><span>${e.why}${e.scenario ? ` <em>(${e.scenario})</em>` : ''}</span></li>`).join('')}</ul>`
      : '<p class="empty">No evidence yet. This concept moves when you play a sequence that tests it.</p>'}
    <p class="sheet-foot">Levels rise faster on new scenarios than on repeats, and faster on harder ones. Repeating one easy scenario cannot max a concept out.</p>
  `);
}

function showBadgeDetail(id) {
  const b = Mastery.BADGES.find((x) => x.id === id);
  const earned = State.profile.badges.includes(id);
  openSheet(b.name, `
    <p class="sheet-lead">${earned ? 'Earned' : 'Not earned yet'}</p>
    <h4>What it means</h4><p>${b.means}</p>
    <h4>How it is earned</h4><p>${b.how}</p>
    <h4>What comes next</h4><p>${b.next}</p>
  `);
}

/* ---------------------------- Curriculum ---------------------------- */

function renderCurriculum() {
  $('#curriculum').innerHTML = CURRICULUM.map((unit) => `
    <section class="unit">
      <h3>${unit.name}</h3>
      <p class="unit-blurb">${unit.blurb}</p>
      <div class="lessons">
        ${unit.lessons.map((l) => l.kind === 'scenario'
          ? `<button class="lesson lesson-scenario" data-scenario="${l.id}">
               <span class="lesson-kind">Interactive scenario</span>
               <span class="lesson-title">${l.title}</span>
               <span class="lesson-go">Play →</span>
             </button>`
          : `<button class="lesson lesson-reading" data-reading="${unit.id}:${l.id}">
               <span class="lesson-kind">Reading</span>
               <span class="lesson-title">${l.title}</span>
               <span class="lesson-go">Open →</span>
             </button>`).join('')}
      </div>
    </section>`).join('') + `
    <section class="unit">
      <h3>Coaching 8- and 9-year-olds</h3>
      <p class="unit-blurb">The same concepts, translated into language and activities that work for a young travel side.</p>
      <div class="youth">
        ${YOUTH_TRANSLATIONS.map((y) => `
          <details class="youth-card">
            <summary>${y.concept}</summary>
            <p><b>The professional idea.</b> ${y.pro}</p>
            <p><b>The cue you actually say.</b> ${y.cue}</p>
            <p><b>An activity.</b> ${y.activity}</p>
            <p><b>What normally goes wrong.</b> ${y.mistake}</p>
            <p><b>What success looks like.</b> ${y.success}</p>
          </details>`).join('')}
      </div>
    </section>`;

  $$('#curriculum .lesson-scenario').forEach((b) => {
    b.onclick = () => { loadScenario(b.dataset.scenario); switchTab('train'); window.scrollTo({ top: 0 }); };
  });
  $$('#curriculum .lesson-reading').forEach((b) => {
    b.onclick = () => {
      const [unitId, lessonId] = b.dataset.reading.split(':');
      const unit = CURRICULUM.find((u) => u.id === unitId);
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      openSheet(lesson.title, `<p>${lesson.body}</p>`);
    };
  });
}

function renderScenarioPicker() {
  $('#scenarioPicker').innerHTML = SCENARIOS.map((s) => `
    <button class="pick${s.id === (State.scenario && State.scenario.id) ? ' active' : ''}" data-id="${s.id}">
      <span class="pick-title">${s.title}</span>
      <span class="pick-sub">${s.subtitle}</span>
      <span class="pick-diff">Level ${s.difficulty}</span>
    </button>`).join('');
  $$('#scenarioPicker .pick').forEach((b) => {
    b.onclick = () => { loadScenario(b.dataset.id); renderScenarioPicker(); closeSheet(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  });
}

/* ---------------------------- Chrome ---------------------------- */

function switchTab(name) {
  document.body.dataset.tab = name;
  $$('.screen').forEach((s) => { s.hidden = s.dataset.screen !== name; });
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  if (name === 'profile') renderProfile();
  window.scrollTo({ top: 0 });
}

function openSheet(title, html) {
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = html;
  $('#sheet').hidden = false;
  document.body.classList.add('sheet-open');
}
function closeSheet() {
  $('#sheet').hidden = true;
  document.body.classList.remove('sheet-open');
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}

/* ---------------------------- Boot ---------------------------- */

function boot() {
  Board.mount($('#board'));
  // Turf gradient lives in defs so the pitch reads as a pitch, not a green box.
  const defs = el('defs');
  const grad = el('linearGradient', { id: 'turf', x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.appendChild(el('stop', { offset: '0%', 'stop-color': 'var(--turf-1)' }));
  grad.appendChild(el('stop', { offset: '100%', 'stop-color': 'var(--turf-2)' }));
  defs.appendChild(grad);
  Board.svg.insertBefore(defs, Board.svg.firstChild);

  $$('.tab').forEach((t) => { t.onclick = () => switchTab(t.dataset.tab); });
  // Feature modules switch screens themselves; record the active tab for all of them
  // so the train-only status badge never shows on another screen.
  $('.tabbar').addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (t) document.body.dataset.tab = t.dataset.tab;
  });
  $('#finishBtn').onclick = () => finishSequence();
  $('#shootBtn').onclick = previewShot;
  $('#undoBtn').onclick = undo;
  $('#restartBtn').onclick = () => loadScenario(State.scenario.id);
  $('#pickerBtn').onclick = () => { renderScenarioPicker(); openSheet('Choose a scenario', $('#scenarioPickerHost').innerHTML); $('#sheetBody').innerHTML = ''; $('#sheetBody').appendChild($('#scenarioPicker')); };
  $('#sheetClose').onclick = closeSheet;
  $('#sheetBackdrop').onclick = closeSheet;
  $('#resetProfileBtn').onclick = () => {
    if (confirm('Clear your mastery profile on this device? This cannot be undone.')) {
      State.profile = Mastery.reset();
      renderProfile();
    }
  };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeSheet(); hidePreview(); } });

  renderCurriculum();
  renderScenarioPicker();
  renderProfile();
  loadScenario(SCENARIOS[0].id);
  switchTab('train');
  maybeShowFirstRun();
}

/* ------------------------- First run -------------------------
 * A new user lands on a full 11v11 board with no idea that holding a
 * player previews the pass. Three cards, once, dismissible, then never
 * again. Not a help page — a help page is something you have to go find.
 */
const FIRST_RUN_KEY = 'cba.seenIntro.v1';

const FIRST_RUN_CARDS = [
  {
    art: '⚽',
    title: 'This is a decision, not a quiz',
    body: 'You are the player on the ball. Pick where it goes. There is no single right answer hidden behind the screen — the engine scores whatever you choose against what was actually available.',
  },
  {
    art: '👆',
    title: 'Tap to pass, hold to look first',
    body: 'Tap a teammate and the ball travels there. <b>Press and hold</b> instead and you get a preview: the confidence, the pass type, and how much space the receiver keeps when the ball arrives. Holding costs nothing.',
  },
  {
    art: '▶',
    title: 'Finish, then watch it back',
    body: 'When you are done, hit <b>Finish Sequence</b>. You get a rating, the reasoning behind every percentage, and a replay of the route the engine would have played. Tap any line on the pitch to interrogate it.',
  },
];

function maybeShowFirstRun() {
  let seen = false;
  try { seen = localStorage.getItem(FIRST_RUN_KEY) === '1'; } catch (_) { seen = false; }
  if (seen) return;
  showFirstRun();
}

function showFirstRun() {
  let i = 0;
  const host = htm('div', { class: 'intro', id: 'intro' });
  host.innerHTML = `
    <div class="intro-backdrop"></div>
    <div class="intro-panel" role="dialog" aria-modal="true" aria-labelledby="introTitle">
      <div class="intro-art" id="introArt"></div>
      <h2 id="introTitle"></h2>
      <p id="introBody"></p>
      <div class="intro-dots" id="introDots"></div>
      <div class="intro-actions">
        <button class="btn btn-ghost btn-sm" id="introSkip">Skip</button>
        <button class="btn btn-primary" id="introNext">Next</button>
      </div>
    </div>`;
  document.body.appendChild(host);
  document.body.classList.add('sheet-open');

  const paint = () => {
    const c = FIRST_RUN_CARDS[i];
    $('#introArt', host).textContent = c.art;
    $('#introTitle', host).textContent = c.title;
    $('#introBody', host).innerHTML = c.body;
    $('#introDots', host).innerHTML = FIRST_RUN_CARDS
      .map((_, n) => `<i class="${n === i ? 'on' : ''}"></i>`).join('');
    $('#introNext', host).textContent = i === FIRST_RUN_CARDS.length - 1 ? 'Start' : 'Next';
  };

  const done = () => {
    try { localStorage.setItem(FIRST_RUN_KEY, '1'); } catch (_) { /* private mode — show again, no harm */ }
    host.remove();
    document.body.classList.remove('sheet-open');
  };

  $('#introNext', host).onclick = () => { i += 1; i >= FIRST_RUN_CARDS.length ? done() : paint(); };
  $('#introSkip', host).onclick = done;
  paint();
}

document.addEventListener('DOMContentLoaded', boot);
