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

import { evaluatePass, inferPassType, rankOptions, evaluateSequence, checkObjective } from './engine.js';
import { reactToPass } from './tactics.js';

const BEAM = 8;      // partial sequences kept per depth
const BRANCH = 8;    // passes tried from each position

const snap = (p) => ({ x: p.x, y: p.y, id: p.id, pos: p.pos });

function apply(state, receiverId, homes, styles, startBall) {
  const from = state.ours.find((p) => p.id === state.carrierId);
  const to = state.ours.find((p) => p.id === receiverId);
  const passType = inferPassType(from, to, { defenders: state.theirs, teammates: state.ours });
  const result = evaluatePass(from, to, { defenders: state.theirs, teammates: state.ours, passType });
  const step = { from: snap(from), to: snap(to), fromLabel: from.pos, toLabel: to.pos, result };
  const plan = reactToPass({ from, to, passType, ours: state.ours, theirs: state.theirs, homes, styles, startBall });
  return {
    ours: state.ours.map((p) => ({ ...p, x: plan.ours.get(p.id).x, y: plan.ours.get(p.id).y })),
    theirs: state.theirs.map((p) => ({ ...p, x: plan.theirs.get(p.id).x, y: plan.theirs.get(p.id).y })),
    carrierId: receiverId,
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
      const ranked = rankOptions(carrier, state.ours, state.theirs).all
        // The keeper is a reset, not a route to the objective.
        .filter((o) => o.player.role !== 'keeper')
        .slice(0, BRANCH);
      for (const o of ranked) {
        // Never pass straight back to the player who just gave you the ball.
        const last = state.sequence[state.sequence.length - 1];
        if (last && last.from.id === o.player.id) continue;
        const child = apply(state, o.player.id, homes, styles, startBall);
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
