/*
 * Coach Bobby Academy — Set Pieces
 * ------------------------------------------------------------------
 * A studio for attacking corners: drag your runners, choose the
 * delivery, and get an explainable estimate of whether the routine
 * actually threatens the goal — plus a library of standard routines
 * with the coaching reasoning behind each one.
 *
 * The evaluation follows the same rule as the passing engine: every
 * number traces to a named factor, nothing is random, and the estimate
 * is labelled as a tactical estimate rather than a probability.
 *
 * Self-registering: injects its own tab and screen, so app.js needs no
 * knowledge of it.
 *
 * Coordinates: the attacking penalty area, in yards, on the standard
 * 105 x 68 pitch. Goal line is x = 105, goal centre y = 34.
 * ------------------------------------------------------------------
 */

const STORE_KEY = 'cba.setpieces.v1';

const GOAL = { x: 105, y: 34 };
const NEAR_POST = { x: 105, y: 30.3 };
const FAR_POST = { x: 105, y: 37.7 };
const SIX_YARD = { x0: 99.1, y0: 24.85, x1: 105, y1: 43.15 };
const PEN_AREA = { x0: 88.1, y0: 13.85, x1: 105, y1: 54.15 };

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round1 = (v) => Math.round(v * 10) / 10;
const inBox = (p) => p.x >= PEN_AREA.x0 && p.y >= PEN_AREA.y0 && p.y <= PEN_AREA.y1;
const inSixYard = (p) => p.x >= SIX_YARD.x0 && p.y >= SIX_YARD.y0 && p.y <= SIX_YARD.y1;

/* ---------------------------- Delivery types ---------------------------- */

export const DELIVERIES = {
  'driven-near': {
    label: 'Driven to the near post',
    blurb: 'Flat and fast to the near post. The defence has almost no time to react, but the margin for error is small and a flick-on is usually the finish rather than a clean header.',
    target: NEAR_POST,
    hangTime: 0.9,
    keeperRisk: 0.34,
    contactBonus: 0.16,
  },
  'driven-far': {
    label: 'Driven to the far post',
    blurb: 'Fast and flat across the six-yard box. Beats the first defender and the keeper, and arrives at attackers running onto it.',
    target: FAR_POST,
    hangTime: 1.15,
    keeperRisk: 0.2,
    contactBonus: 0.1,
  },
  'curled-near': {
    label: 'Inswinger to the near post',
    blurb: 'Curls toward goal. The flight does half the work — a touch of any kind can send it in — but it also curls into the keeper’s territory.',
    target: { x: 103.5, y: 30.6 },
    hangTime: 1.25,
    keeperRisk: 0.42,
    contactBonus: 0.2,
  },
  'curled-far': {
    label: 'Outswinger to the far post',
    blurb: 'Curls away from the keeper toward the far side of the box, so attackers attack the ball moving toward goal with nobody able to claim it.',
    target: { x: 101.5, y: 39.5 },
    hangTime: 1.5,
    keeperRisk: 0.12,
    contactBonus: 0.05,
  },
  'chipped-central': {
    label: 'Chipped to the penalty spot',
    blurb: 'Hangs in the air onto the edge of the six-yard box. Gives your biggest player time to attack it — and gives every defender time to find him.',
    target: { x: 99.5, y: 34 },
    hangTime: 1.9,
    keeperRisk: 0.3,
    contactBonus: 0,
  },
  'short': {
    label: 'Short corner',
    blurb: 'Two players combine to create a crossing angle from deeper. Drags defenders out of the box and turns a set piece back into open play — which is often exactly the point.',
    target: { x: 96, y: 46 },
    hangTime: 0.8,
    keeperRisk: 0.05,
    contactBonus: -0.05,
    isShort: true,
  },
};

/* ---------------------------- Routine library ---------------------------- */

export const ROUTINES = [
  {
    id: 'near-post-flick',
    name: 'Near-post flick-on',
    type: 'Attacking corner',
    delivery: 'driven-near',
    idea: 'One tall runner attacks the near post early and only needs to change the ball’s direction. Two more attack the far post and the six-yard line behind him, where the flick is going.',
    why: 'A ball that is already travelling fast needs only a touch to become unsaveable. It also attacks the one area a goalkeeper cannot comfortably reach, because coming for a driven near-post ball means crossing the whole six-yard box.',
    watch: 'The flick runner must arrive late and moving. Standing at the near post waiting for it lets a defender simply stand in front of him.',
    youth: 'For 8- and 9-year-olds this rarely works, because they cannot yet drive a ball flat with pace from the corner. Teach the short corner instead and let them create the angle by playing football.',
  },
  {
    id: 'far-post-overload',
    name: 'Far-post overload',
    type: 'Attacking corner',
    delivery: 'curled-far',
    idea: 'Four attackers start centrally and move together to the far post as the ball is struck, arriving in a group the defence cannot individually pick up.',
    why: 'An outswinger curls away from the goalkeeper, so nobody in green is coming to claim it. Attackers meet the ball running toward goal while defenders are backpedalling — the header is downward and the keeper is moving the wrong way.',
    watch: 'If the group starts at the far post rather than moving to it, defenders simply mark them there. The movement is the routine.',
    youth: 'The simplified version: everybody starts on the penalty spot and runs to the back post together on the coach’s call. Young players understand "run there together" far better than assigned zones.',
  },
  {
    id: 'screen-and-attack',
    name: 'Screen the keeper',
    type: 'Attacking corner',
    delivery: 'curled-near',
    idea: 'Two attackers occupy the goalkeeper’s path inside the six-yard box without touching him, while the runners attack the space in front.',
    why: 'An inswinging corner is dangerous only if the keeper cannot claim it. Legally occupying his route to the ball converts his biggest advantage into a liability.',
    watch: 'This lives on the edge of a foul. Blocking is holding; occupying space is not. Coach it as "be somewhere first," never as "stop him getting there."',
    youth: 'Do not coach this to children. It teaches gamesmanship before it teaches football, and at that age nobody is claiming crosses anyway.',
  },
  {
    id: 'short-corner-overload',
    name: 'Short corner, 2v1',
    type: 'Attacking corner',
    delivery: 'short',
    idea: 'Two players go short against one defender. If the defence sends a second, the box is now one defender lighter — cross then. If they send nobody, you have a free man to cross from a better angle.',
    why: 'This is the only corner routine that is guaranteed to create an advantage somewhere, because the opponent must choose which advantage to concede.',
    watch: 'The player receiving short must be able to cross with the outside foot or beat a defender. If he can only pass backwards, the routine wastes the set piece.',
    youth: 'The best corner routine for young travel teams by a distance. It turns a dead ball into a 2v1 they can actually solve, and every touch is a real football decision.',
  },
  {
    id: 'defending-zonal-hybrid',
    name: 'Defending: hybrid zonal',
    type: 'Defending corner',
    delivery: null,
    idea: 'Four defenders hold fixed zones across the six-yard line, two or three man-mark the opponent’s biggest threats, one stands on each post, and one holds the edge of the box for the clearance.',
    why: 'Pure zonal marking concedes headers to runners attacking a static line. Pure man-marking lets attackers drag defenders anywhere they want and open the space. The hybrid protects the dangerous ground and still tracks the dangerous people.',
    watch: 'The edge-of-box player is not optional. Most goals from corners come from the second ball, not the first contact.',
    youth: 'At 8 and 9, mark space, not people — "you stand here and head anything that comes near you." Man-marking asks a child to watch two things at once, and they will watch neither.',
  },
  {
    id: 'wide-free-kick',
    name: 'Wide free kick, back-post run',
    type: 'Wide free kick',
    delivery: 'driven-far',
    idea: 'Attackers form a line on the edge of the box and break at the moment of the strike, with the deepest runner attacking the far post behind the defensive line.',
    why: 'A wide free kick is delivered against a defence facing the ball and worried about offside. A line that breaks together is impossible to track individually, and the far-post runner is the one nobody is watching.',
    watch: 'Timing beats positioning here. Break early and it is offside; break late and the ball has gone.',
    youth: 'Teach the run, not the delivery. Young players who learn to arrive as the ball arrives will score for the rest of their lives.',
  },
];

/* ---------------------------- Evaluation ---------------------------- */

export const WEIGHTS = {
  base: 46,
  contactQuality: 22,
  boxNumbers: 16,
  keeperRisk: 18,
  movement: 14,
  restDefence: 10,
  crowding: 8,
};

/**
 * Evaluate an attacking-corner routine. Explainable, deterministic.
 * `runners` are attacker positions, `defenders` the opponent shape.
 */
export function evaluateRoutine(runners, defenders, deliveryKey) {
  const d = DELIVERIES[deliveryKey];
  const factors = [];
  const add = (points, label, detail) => {
    factors.push({ points: Math.round(points), label, detail });
    return points;
  };
  let score = WEIGHTS.base;

  // 1. Is anybody actually attacking the delivery?
  const distances = runners.map((r) => dist(r, d.target)).sort((a, b) => a - b);
  const closest = distances[0] != null ? distances[0] : 99;
  const contact = clamp(1 - (closest - 2) / 9, 0, 1);
  score += add(
    (contact - 0.35) * WEIGHTS.contactQuality + d.contactBonus * WEIGHTS.contactQuality,
    contact > 0.6 ? 'A runner attacks the delivery' : 'Nobody is attacking where the ball lands',
    `Nearest attacker is ${round1(closest)} yd from where this delivery arrives. A set piece is only as good as the contact at the end of it.`
  );

  // 2. Numbers in the box.
  const attackersIn = runners.filter(inBox).length;
  const defendersIn = defenders.filter(inBox).length;
  const diff = attackersIn - defendersIn;
  // A defending side always commits more bodies to its own box, so parity is
  // the wrong baseline. Three down is normal; the question is better or worse
  // than normal.
  score += add(
    clamp((diff + 3) / 3, -1, 1) * WEIGHTS.boxNumbers,
    diff >= -2 ? `Good numbers in the box at ${attackersIn}v${defendersIn}` : `Heavily outnumbered ${attackersIn}v${defendersIn} in the box`,
    'Corners are won by arriving with enough bodies that the defence cannot pick everybody up, not by putting everybody in the box regardless.'
  );

  // 3. Goalkeeper.
  const keeperExposure = d.keeperRisk * (inSixYard(d.target) ? 1.25 : 1);
  const screeners = runners.filter((r) => inSixYard(r)).length;
  const screenRelief = clamp(screeners * 0.22, 0, 0.44);
  score += add(
    -(keeperExposure - screenRelief) * WEIGHTS.keeperRisk,
    keeperExposure - screenRelief < 0.15 ? 'The keeper cannot easily claim this' : 'The delivery invites the goalkeeper',
    `This delivery hangs for about ${d.hangTime}s${screeners ? `, and ${screeners} attacker${screeners > 1 ? 's are' : ' is'} occupying the six-yard box` : ''}. The longer the ball is in the air near the six-yard box, the more it belongs to the keeper.`
  );

  // 4. Are runners moving toward the ball, or standing in it?
  const spread = spreadOf(runners);
  const converging = runners.filter((r) => dist(r, d.target) > 4 && dist(r, d.target) < 16).length;
  score += add(
    (clamp(converging / 3, 0, 1) - 0.3) * WEIGHTS.movement,
    converging >= 2 ? 'Runners arrive from distance' : 'Runners are static in the target area',
    'Attackers who start in the space they want to attack get marked there. Attackers who arrive into it are almost impossible to track.'
  );

  // 5. Rest defence — who is protecting against the counter?
  const outside = runners.filter((r) => !inBox(r)).length;
  score += add(
    (clamp(outside / 2, 0, 1) - 0.4) * WEIGHTS.restDefence,
    outside >= 1 ? 'Cover for the second ball' : 'Nobody covering the edge of the box',
    'Most corners are cleared, not scored. The player on the edge decides whether a clearance becomes another attack or their counterattack.'
  );

  // 6. Crowding — too many bodies in the same square yard.
  if (spread < 6 && runners.length > 2) {
    score += add(
      -clamp((6 - spread) / 5, 0, 1) * WEIGHTS.crowding,
      'Runners are bunched together',
      `Your attackers are spread over only ${round1(spread)} yd. One defender can mark two players who are standing next to each other.`
    );
  }

  const rating = Math.round(clamp(score, 4, 94));
  return {
    rating,
    delivery: d,
    factors: factors.filter((f) => f.points !== 0),
    metrics: {
      nearestToDelivery: round1(closest),
      attackersInBox: attackersIn,
      defendersInBox: defendersIn,
      inSixYard: screeners,
      coveringOutside: outside,
      spread: round1(spread),
      hangTime: d.hangTime,
    },
  };
}

function spreadOf(pts) {
  if (pts.length < 2) return 99;
  let max = 0;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) max = Math.max(max, dist(pts[i], pts[j]));
  }
  return max;
}

/* ---------------------------- Default shapes ---------------------------- */

export const DEFAULT_RUNNERS = () => ([
  { id: 'r1', pos: 'ST', x: 99, y: 31 },
  { id: 'r2', pos: 'CB', x: 97, y: 35 },
  { id: 'r3', pos: 'CB', x: 96, y: 39 },
  { id: 'r4', pos: 'AM', x: 93, y: 34 },
  { id: 'r5', pos: 'CM', x: 86, y: 34 },
]);

export const DEFAULT_DEFENDERS = () => ([
  { id: 'd1', pos: 'GK', x: 103.6, y: 34, role: 'keeper' },
  { id: 'd2', pos: 'D', x: 100.5, y: 28 },
  { id: 'd3', pos: 'D', x: 100.5, y: 32 },
  { id: 'd4', pos: 'D', x: 100.5, y: 36 },
  { id: 'd5', pos: 'D', x: 100.5, y: 40 },
  { id: 'd6', pos: 'D', x: 97, y: 31 },
  { id: 'd7', pos: 'D', x: 97, y: 37 },
  { id: 'd8', pos: 'D', x: 91, y: 34 },
]);

/* ============================ Rendering ============================ */

const SVG_NS = 'http://www.w3.org/2000/svg';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const el = (tag, attrs = {}, text) => {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
};

const Studio = {
  runners: DEFAULT_RUNNERS(),
  defenders: DEFAULT_DEFENDERS(),
  delivery: 'curled-far',
  result: null,
  svg: null,
};

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; }
}
function saveAll(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch {}
}

function drawStudio(host) {
  const svg = el('svg', { class: 'pitch sp-pitch', viewBox: '84 11 23 46', preserveAspectRatio: 'xMidYMid meet' });
  Studio.svg = svg;

  const defs = el('defs');
  const grad = el('linearGradient', { id: 'sp-turf', x1: 0, y1: 0, x2: 1, y2: 0 });
  grad.appendChild(el('stop', { offset: '0%', 'stop-color': 'var(--turf-2)' }));
  grad.appendChild(el('stop', { offset: '100%', 'stop-color': 'var(--turf-1)' }));
  defs.appendChild(grad);
  svg.appendChild(defs);

  svg.appendChild(el('rect', { x: 84, y: 11, width: 23, height: 46, fill: 'url(#sp-turf)' }));
  const line = (a) => svg.appendChild(el('rect', { fill: 'none', stroke: 'var(--pitch-line)', 'stroke-width': 0.3, ...a }));
  line({ x: 88.1, y: 13.85, width: 16.5, height: 40.3 });
  line({ x: 99.1, y: 24.85, width: 5.5, height: 18.3 });
  svg.appendChild(el('line', { x1: 104.7, y1: 11, x2: 104.7, y2: 57, stroke: 'var(--pitch-line)', 'stroke-width': 0.3 }));
  svg.appendChild(el('rect', { x: 104.7, y: 30.3, width: 1.4, height: 7.4, fill: 'rgba(255,255,255,.22)', stroke: 'var(--pitch-line)', 'stroke-width': 0.28 }));
  svg.appendChild(el('circle', { cx: 94, cy: 34, r: 0.35, fill: 'var(--pitch-line)' }));

  Studio.layerTarget = el('g');
  Studio.layerDef = el('g');
  Studio.layerRun = el('g');
  svg.appendChild(Studio.layerTarget);
  svg.appendChild(Studio.layerDef);
  svg.appendChild(Studio.layerRun);

  host.innerHTML = '';
  host.appendChild(svg);
  redraw();
  attachDrag();
}

function redraw() {
  const d = DELIVERIES[Studio.delivery];
  Studio.layerTarget.innerHTML = '';
  Studio.layerTarget.appendChild(el('circle', { cx: d.target.x, cy: d.target.y, r: 2.6, class: 'sp-target' }));
  Studio.layerTarget.appendChild(el('circle', { cx: d.target.x, cy: d.target.y, r: 0.5, class: 'sp-target-dot' }));
  Studio.layerTarget.appendChild(el('line', { x1: 105, y1: 55, x2: d.target.x, y2: d.target.y, class: 'sp-flight' }));

  Studio.layerDef.innerHTML = '';
  for (const p of Studio.defenders) {
    const g = el('g', { class: `sp-player sp-def${p.role === 'keeper' ? ' sp-gk' : ''}`, transform: `translate(${p.x} ${p.y})` });
    g.appendChild(el('circle', { r: 1.5, class: 'marker' }));
    g.appendChild(el('text', { y: 0.55, class: 'plabel' }, p.pos));
    Studio.layerDef.appendChild(g);
  }

  Studio.layerRun.innerHTML = '';
  for (const p of Studio.runners) {
    const g = el('g', { class: 'sp-player sp-run', transform: `translate(${p.x} ${p.y})`, 'data-id': p.id });
    g.appendChild(el('circle', { r: 2.6, class: 'hit' }));
    g.appendChild(el('circle', { r: 1.7, class: 'marker' }));
    g.appendChild(el('text', { y: 0.6, class: 'plabel' }, p.pos));
    Studio.layerRun.appendChild(g);
    p._node = g;
  }
}

function attachDrag() {
  const svg = Studio.svg;
  let dragging = null;
  const toPitch = (e) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  svg.addEventListener('pointerdown', (e) => {
    const node = e.target.closest && e.target.closest('.sp-run');
    if (!node) return;
    dragging = Studio.runners.find((r) => r.id === node.dataset.id);
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const p = toPitch(e);
    dragging.x = clamp(p.x, 85, 104.4);
    dragging.y = clamp(p.y, 12, 56);
    dragging._node.setAttribute('transform', `translate(${dragging.x} ${dragging.y})`);
    e.preventDefault();
  });
  const end = () => { dragging = null; };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
}

function renderResult() {
  const box = $('#spResult');
  if (!Studio.result) { box.hidden = true; box.innerHTML = ''; return; }
  const r = Studio.result;
  const m = r.metrics;
  box.hidden = false;
  box.innerHTML = `
    <div class="verdict verdict-${r.rating >= 62 ? 'success' : r.rating >= 42 ? 'partial' : 'lost'}">
      <div class="verdict-top">
        <h3>${r.rating >= 62 ? 'This routine threatens the goal.' : r.rating >= 42 ? 'Workable, but the defence is favourite.' : 'This routine does not threaten the goal.'}</h3>
        <div class="rating"><b>${r.rating}</b><span>routine rating</span></div>
      </div>
      <div class="summary-grid">
        <div><b>${m.nearestToDelivery} yd</b><span>to delivery</span></div>
        <div><b>${m.attackersInBox}v${m.defendersInBox}</b><span>in the box</span></div>
        <div><b>${m.hangTime}s</b><span>in the air</span></div>
        <div><b>${m.coveringOutside}</b><span>covering</span></div>
      </div>
    </div>
    <ul class="factors">
      ${r.factors.map((f) => `
        <li class="${f.points >= 0 ? 'pos' : 'neg'}">
          <span class="fpts">${f.points > 0 ? '+' : ''}${f.points}</span>
          <span class="fbody"><b>${esc(f.label)}</b><em>${esc(f.detail)}</em></span>
        </li>`).join('')}
    </ul>
    <p class="preview-foot">A tactical estimate from the weights in this module — not a measured probability. Deterministic: the same picture always gives the same number.</p>`;
}

function renderSaved() {
  const list = loadSaved();
  const host = $('#spSaved');
  if (!host) return;
  host.innerHTML = list.length
    ? list.map((s, i) => `
      <div class="seq-step">
        <span class="seq-n">${i + 1}</span>
        <span class="seq-body"><b>${esc(s.name)}</b><em>${esc(DELIVERIES[s.delivery] ? DELIVERIES[s.delivery].label : s.delivery)} · rated ${s.rating}</em></span>
        <button class="btn btn-ghost btn-sm sp-load" data-i="${i}">Load</button>
      </div>`).join('')
    : '<p class="empty">No routines saved yet. Design one, test it, then save it.</p>';

  $$('.sp-load', host).forEach((b) => {
    b.onclick = () => {
      const s = loadSaved()[Number(b.dataset.i)];
      Studio.runners = s.runners.map((r) => ({ ...r }));
      Studio.delivery = s.delivery;
      Studio.result = null;
      $('#spDelivery').value = s.delivery;
      redraw();
      renderResult();
      updateDeliveryBlurb();
    };
  });
}

function updateDeliveryBlurb() {
  const d = DELIVERIES[Studio.delivery];
  $('#spBlurb').textContent = d.blurb;
}

function render(host) {
  host.innerHTML = `
    <div class="card intro-card">
      <h2>Set Pieces</h2>
      <p class="muted">Design an attacking corner, test whether it actually threatens the goal, and save the ones that work. Below the studio is a library of standard routines with the coaching reasoning behind each — including what to do differently with eight-year-olds.</p>
    </div>

    <div class="card board-card">
      <div class="board-meta">
        <span class="direction"><i aria-hidden="true">◎</i> Drag the blue runners</span>
        <span class="meta-item">Corner from the right</span>
      </div>
      <div id="spBoard" class="board"></div>
      <div class="legend">
        <span><i class="dot us"></i>Your runners</span>
        <span><i class="dot them"></i>Defenders</span>
        <span><i class="dot zone"></i>Where the ball lands</span>
      </div>

      <div class="sp-controls">
        <label class="sp-label" for="spDelivery">Delivery</label>
        <select id="spDelivery" class="sp-select">
          ${Object.entries(DELIVERIES).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('')}
        </select>
        <p class="sp-blurb" id="spBlurb"></p>
      </div>

      <div class="row-actions">
        <button class="btn btn-ghost" id="spReset">Reset shape</button>
        <button class="btn btn-ghost" id="spSave">Save routine</button>
      </div>
    </div>

    <div class="action-bar sp-bar">
      <button class="btn btn-finish" id="spTest">Test this routine</button>
    </div>

    <div id="spResult" class="card analysis" hidden></div>

    <div class="card">
      <h3 class="card-title">Saved routines</h3>
      <p class="muted small">Stored on this device.</p>
      <div id="spSaved" class="sequence"></div>
    </div>

    <section class="unit">
      <h3>Standard routines</h3>
      <p class="unit-blurb">What good teams actually do, why it works, and what breaks it.</p>
      <div class="lessons">
        ${ROUTINES.map((r) => `
          <button class="lesson lib-card" data-routine="${r.id}">
            <span class="lesson-kind">${esc(r.type)}</span>
            <span class="lesson-title">${esc(r.name)}</span>
            <span class="lesson-go">Open →</span>
          </button>`).join('')}
      </div>
    </section>
    <div class="spacer"></div>`;

  drawStudio($('#spBoard', host));
  updateDeliveryBlurb();
  renderSaved();

  $('#spDelivery').value = Studio.delivery;
  $('#spDelivery').onchange = (e) => {
    Studio.delivery = e.target.value;
    Studio.result = null;
    redraw();
    renderResult();
    updateDeliveryBlurb();
  };
  $('#spReset').onclick = () => {
    Studio.runners = DEFAULT_RUNNERS();
    Studio.result = null;
    redraw();
    renderResult();
  };
  $('#spTest').onclick = () => {
    Studio.result = evaluateRoutine(Studio.runners, Studio.defenders, Studio.delivery);
    renderResult();
    $('#spResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  $('#spSave').onclick = () => {
    const r = Studio.result || evaluateRoutine(Studio.runners, Studio.defenders, Studio.delivery);
    const name = prompt('Name this routine:', `${DELIVERIES[Studio.delivery].label} — ${new Date().toLocaleDateString()}`);
    if (!name) return;
    const list = loadSaved();
    list.unshift({
      name,
      delivery: Studio.delivery,
      rating: r.rating,
      runners: Studio.runners.map(({ id, pos, x, y }) => ({ id, pos, x: round1(x), y: round1(y) })),
    });
    saveAll(list.slice(0, 20));
    renderSaved();
  };

  $$('.lib-card[data-routine]', host).forEach((b) => {
    b.onclick = () => {
      const r = ROUTINES.find((x) => x.id === b.dataset.routine);
      $('#sheetTitle').textContent = r.name;
      $('#sheetBody').innerHTML = `
        <p class="sheet-lead">${esc(r.type)}${r.delivery ? ` · ${esc(DELIVERIES[r.delivery].label)}` : ''}</p>
        <h4>The idea</h4><p>${esc(r.idea)}</p>
        <h4>Why it works</h4><p>${esc(r.why)}</p>
        <h4>What breaks it</h4><p>${esc(r.watch)}</p>
        <h4>With 8- and 9-year-olds</h4><p>${esc(r.youth)}</p>
        ${r.delivery ? '<p class="sheet-foot">Tap Load below to build this delivery in the studio, then drag your runners to match.</p>' : ''}`;
      $('#sheet').hidden = false;
      document.body.classList.add('sheet-open');
      if (r.delivery) {
        Studio.delivery = r.delivery;
        $('#spDelivery').value = r.delivery;
        Studio.result = null;
        redraw();
        renderResult();
        updateDeliveryBlurb();
      }
    };
  });
}

/*
 * Each screen owns its own primary action. The set-piece bar shows only here;
 * the Finish Sequence bar must come back when the user returns to Train.
 */
function syncBar() {
  const spScreen = $('[data-screen="setpieces"]');
  const trainScreen = $('[data-screen="train"]');
  if (!spScreen || !trainScreen) return;
  const onSetPieces = !spScreen.hidden;
  const onTrain = !trainScreen.hidden;

  const bar = $('.sp-bar');
  if (bar) bar.hidden = !onSetPieces;

  const main = $('.action-bar:not(.sp-bar)');
  if (main) {
    // app.js adds this class once a sequence has been submitted, at which
    // point the Finish bar has no job on any screen.
    const submitted = document.body.classList.contains('no-action-bar');
    main.hidden = !onTrain || submitted;
  }
}

function show(name) {
  $$('.screen').forEach((s) => { s.hidden = s.dataset.screen !== name; });
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  syncBar();
  window.scrollTo({ top: 0 });
}

function install() {
  if ($('[data-screen="setpieces"]')) return;

  const screen = document.createElement('section');
  screen.className = 'screen';
  screen.dataset.screen = 'setpieces';
  screen.hidden = true;
  $('main').appendChild(screen);
  render(screen);

  const tabbar = $('.tabbar');
  const tab = document.createElement('button');
  tab.className = 'tab';
  tab.dataset.tab = 'setpieces';
  tab.innerHTML = '<span class="tab-ico">◈</span>Set Pieces';
  tabbar.appendChild(tab);
  tabbar.classList.remove('tabbar-4');
  tabbar.classList.add('tabbar-5');

  $$('.tab').forEach((t) => { t.addEventListener('click', () => show(t.dataset.tab)); });
  syncBar();
}

// Guarded so the scoring functions above can be imported and unit-tested
// in Node, where there is no document.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
}
