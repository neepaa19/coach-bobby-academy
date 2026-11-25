/*
 * Coach Bobby Academy — Best-sequence planner
 * ------------------------------------------------------------------
 * Finds the strongest multi-pass sequence from a scenario's opening
 * picture, using exactly the same scoring (engine.js) and movement
 * (tactics.js) as the board. So when the app plays "the best sequence",
 * every pass and every defensive reaction is what would have happened if
 * you had played it yourself.
 *
 * Method: a small beam search. From each position it tries the most
 * promising passes, lets both teams react, and keeps the best few
 * partial sequences at every depth, up to the scenario's action limit.
 * Sequences are compared on the same grading the learner receives:
 * objective met first, then sequence rating, then fewer passes.
 *
 * Pure and deterministic: no DOM, no randomness.
 * ------------------------------------------------------------------
 */

import { evaluatePass, evaluateCarry, inferPassType, rankOptions, evaluateSequence, checkObjective, dist, clamp } from './engine.js';
import { reactToPass } from './tactics.js';

const BEAM = 8;      // partial sequences kept per depth
const BRANCH = 8;    // passes tried from each position

const snap = (p) => ({ x: p.x, y: p.y, id: p.id, pos: p.pos });

/** A few sensible places to run with the ball: straight on, and diagonally either way. */
function carryOptions(carrier, defenders) {
  const out = [];
  for (const deg of [0, 35, -35]) {
    const a = (deg * Math.PI) / 180;
    const dest = { x: clamp(carrier.x + Math.cos(a) * 10, 1.5, 103.5), y: clamp(carrier.y + Math.sin(a) * 10, 1.5, 66.5) };
    if (defenders.some((o) => dist(o, dest) < 2.6)) continue;
    const r = evaluateCarry(carrier, dest, { defenders });
    out.push({ carry: dest, confidence: r.confidence,
      value: r.confidence * 0.62 + clamp(r.metrics.progression, -20, 26) * 1.5 + r.metrics.linesBroken * 4 - Math.max(0, 55 - r.confidence) * 1.6 });
  }
  return out;
}

function apply(state, option, homes, styles, startBall) {
  const from = state.ours.find((p) => p.id === state.carrierId);
  let to, passType, result, kind;
  if (option.carry) {
    kind = 'carry';
    to = { ...from, x: option.carry.x, y: option.carry.y };
    passType = 'carry';
    result = evaluateCarry(from, to, { defenders: state.theirs });
  } else {
    to = state.ours.find((p) => p.id === option.player.id);
    passType = inferPassType(from, to, { defenders: state.theirs, teammates: state.ours });
    result = evaluatePass(from, to, { defenders: state.theirs, teammates: state.ours, passType });
  }
  const step = { kind, from: snap(from), to: snap(to), fromLabel: from.pos, toLabel: to.pos, result };
  const plan = reactToPass({ from, to, passType, ours: state.ours, theirs: state.theirs, homes, styles, startBall });
  return {
    ours: state.ours.map((p) => ({ ...p, x: plan.ours.get(p.id).x, y: plan.ours.get(p.id).y })),
    theirs: state.theirs.map((p) => ({ ...p, x: plan.theirs.get(p.id).x, y: plan.theirs.get(p.id).y })),
    carrierId: to.id,
    sequence: [...state.sequence, step],
  };
}

function grade(seq, scenario) {
  const a = evaluateSequence(seq, scenario);
  const met = checkObjective(seq, scenario) && a.verdict !== 'lost';
  // Objective first, then the rating the learner would get. A coach would
  // rather see a safe route than a lucky one, so the weakest pass counts too;
  // brevity breaks ties.
  return { analysis: a, met, key: (met ? 1000 : 0) + a.rating + a.summary.weakestPass * 0.5 - seq.length * 0.5 };
}

/**
 * @returns {{ sequence, analysis, objectiveMet }} or null when no pass exists.
 */
export function bestSequence({ scenario, ours, theirs, homes, styles, startBall }) {
  const max = scenario.maxActions || 5;
  let frontier = [{ ours, theirs, carrierId: scenario.startCarrier, sequence: [] }];
  let best = null;

  for (let depth = 0; depth < max; depth++) {
    const next = [];
    for (const state of frontier) {
      const carrier = state.ours.find((p) => p.id === state.carrierId);
      const last = state.sequence[state.sequence.length - 1];
      const passes = rankOptions(carrier, state.ours, state.theirs).all
        // The keeper is a reset, not a route to the objective.
        .filter((o) => o.player.role !== 'keeper')
        // Never pass straight back to the player who just gave you the ball.
        .filter((o) => !(last && last.kind !== 'carry' && last.from.id === o.player.id));
      // No more than one carry in a row: a second is usually better as a pass.
      const carries = last && last.kind === 'carry' ? [] : carryOptions(carrier, state.theirs);
      const ranked = [...passes, ...carries].sort((a, b) => b.value - a.value).slice(0, BRANCH);
      for (const o of ranked) {
        const child = apply(state, o, homes, styles, startBall);
        const g = grade(child.sequence, scenario);
        child.g = g;
        if (!best || g.key > best.g.key) best = child;
        // A sequence the defence wins, or one that already met the objective, stops here.
        if (g.analysis.verdict !== 'lost' && !g.met) next.push(child);
      }
    }
    if (!next.length) break;
    next.sort((a, b) => b.g.key - a.g.key);
    frontier = next.slice(0, BEAM);
  }

  if (!best) return null;
  return { sequence: best.sequence, analysis: best.g.analysis, objectiveMet: best.g.met };
}
