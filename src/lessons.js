/*
 * Coach Bobby Academy — Lesson missions
 * ------------------------------------------------------------------
 * A lesson names the idea being taught and turns it into a short
 * checklist the board can verify while you play. Each item is a rule
 * about the picture on the pitch (who is where, which player has the
 * ball, how risky each action was), so "draw the press, then break it"
 * is checked from the actual positions, not from which player you
 * happened to pick.
 *
 * `history` is the list of pictures the sequence went through:
 *   history[0]  the opening picture
 *   history[i]  the picture after action i, with that action's `step`
 * Each picture: { ball, carrierId, ours, theirs, step? }.
 *
 * Pure functions: no DOM, no randomness.
 * ------------------------------------------------------------------
 */

import { dist } from './engine.js';
import { unitOfPos } from './tactics.js';

const MID_Y = 34;

/**
 * Pressers drawn to the ball: their forwards and midfielders within
 * `radius` yards of it. Defenders who simply held their line do not count,
 * and neither does anyone near the ball once it is already in their half.
 */
const pressersNear = (pic, radius, maxX) => (pic.ball.x > maxX ? 0 : pic.theirs.filter((o) =>
  o.role !== 'keeper' && ['front', 'mid'].includes(unitOfPos(o.pos)) && dist(o, pic.ball) <= radius).length);

/**
 * Live view of a "draw" item for the current picture: which of their
 * players count as drawn right now, and what is still missing.
 */
export function drawProgress(item, pic) {
  const radius = item.radius || 20, maxX = item.maxX || 52.5;
  const ids = pic.ball.x > maxX ? [] : pic.theirs
    .filter((o) => o.role !== 'keeper' && ['front', 'mid'].includes(unitOfPos(o.pos)) && dist(o, pic.ball) <= radius)
    .map((o) => o.id);
  const wide = !item.wide || Math.abs(pic.ball.y - MID_Y) >= 14;
  return { ids, count: ids.length, need: item.count, wide, inHalf: pic.ball.x <= maxX };
}

/** Our outfield players goal-side of the ball (closer to our own goal). */
const behindBall = (pic) => pic.ours.filter((p) => p.role !== 'keeper' && p.id !== pic.carrierId && p.x < pic.ball.x - 2).length;

const carrierOf = (pic) => pic.ours.find((p) => p.id === pic.carrierId);

/**
 * Status of every mission item for the sequence so far.
 * Returns [{ id, label, done, broken, detail, at }] where `at` is the
 * action number that completed the item (0 = already true at the start).
 */
export function missionStatus(mission, history) {
  const items = mission.items || [];
  const out = [];
  const doneAt = {};
  for (const item of items) {
    let done = false, broken = false, at = null, detail = '';

    if (item.type === 'draw') {
      // Pull several opponents toward the ball on one flank.
      for (let i = 0; i < history.length; i++) {
        const pic = history[i];
        const n = pressersNear(pic, item.radius || 20, item.maxX || 52.5);
        const wide = !item.wide || Math.abs(pic.ball.y - MID_Y) >= 14;
        if (n >= item.count && wide) { done = true; at = i; detail = `${n} of their players were drawn to the ball on the flank.`; break; }
      }
      if (!done) {
        const best = Math.max(...history.map((pic) => (Math.abs(pic.ball.y - MID_Y) >= 14 || !item.wide ? pressersNear(pic, item.radius || 20, item.maxX || 52.5) : 0)));
        detail = `At most ${best} of their players were drawn to the ball on a flank; the target was ${item.count}.`;
      }
    }

    if (item.type === 'reach') {
      // Get the ball to a player of the given unit beyond a line, optionally after another item.
      const after = item.after ? doneAt[item.after] : -1;
      for (let i = 1; i < history.length; i++) {
        if (after == null || i <= after) continue;
        const c = carrierOf(history[i]);
        if (c && item.units.includes(unitOfPos(c.pos)) && history[i].ball.x >= (item.minX || 0)) {
          done = true; at = i; detail = `The ${c.pos} had the ball in their half after action ${i}.`; break;
        }
      }
      if (!done) {
        const reachedEarly = history.slice(1).some((pic) => { const c = carrierOf(pic); return c && item.units.includes(unitOfPos(c.pos)) && pic.ball.x >= (item.minX || 0); });
        detail = reachedEarly && item.after && doneAt[item.after] == null
          ? 'You got the ball forward, but before drawing the press, so it was still waiting for you.'
          : 'The ball never reached one of your front three in their half.';
      }
    }

    if (item.type === 'chance') {
      // Finish the move: a shot worth taking, or a real counterattack.
      const after = item.after ? doneAt[item.after] : -1;
      for (let i = 1; i < history.length; i++) {
        if (after == null || i <= after) continue;
        const pic = history[i];
        const st = pic.step && pic.step.result;
        if (st && st.kind === 'shot') {
          if (st.xg >= (item.minXg || 0.12)) { done = true; at = i; detail = `A shot worth ${st.xg.toFixed(2)} xG: about ${Math.round(st.xg * 100)} in 100 like it go in.`; break; }
          detail = `The shot was only worth ${st.xg.toFixed(2)} xG (${Math.round(st.xg * 100)} in 100). A good chance is ${Math.round((item.minXg || 0.12) * 100)} in 100 or better.`;
          continue;
        }
        const c = carrierOf(pic);
        if (!c || !['front', 'mid'].includes(unitOfPos(c.pos)) || pic.ball.x < 60) continue;
        // Numbers: their outfield players goal-side of the ball against our attackers level or ahead.
        const theirs = pic.theirs.filter((o) => o.role !== 'keeper' && o.x > pic.ball.x).length;
        const ours = pic.ours.filter((p) => p.role !== 'keeper' && p.x >= pic.ball.x - 3).length; // includes the carrier
        const space = Math.min(...pic.theirs.map((o) => dist(o, pic.ball)));
        if (ours >= theirs && theirs <= (item.maxDefenders || 4) && space >= 4) {
          done = true; at = i;
          detail = `A real counterattack: ${ours} of your players against ${theirs} of theirs between the ball and goal, with the ${c.pos} in space.`;
          break;
        }
      }
      if (!done && !detail) detail = 'The move never produced a good shot or a counterattack with the numbers on your side.';
    }

    if (item.type === 'safe') {
      // Rest defence behind the ball and no reckless action, all the way through.
      const actions = history.slice(1);
      const badAction = actions.findIndex((pic) => pic.step && pic.step.result.kind !== 'shot' && pic.step.result.confidence < (item.minConfidence || 55));
      // Rest defence matters once the ball is moving forward, not at your own full-back.
      const thinRest = history.findIndex((pic, i) => i > 0 && pic.ball.x >= (item.fromX || 40) && behindBall(pic) < (item.behind || 3));
      broken = badAction >= 0 || thinRest >= 0;
      done = actions.length > 0 && !broken;
      if (badAction >= 0) detail = `Action ${badAction + 1} was a ${actions[badAction].step.result.confidence}% chance: the defence was close to winning it.`;
      else if (thinRest >= 0) detail = `After action ${thinRest}, with the ball past your own third, fewer than ${item.behind || 3} players were behind it. Lose it there and they counter.`;
      else detail = actions.length ? 'Every action was a sensible risk, with enough players behind the ball the whole time.' : '';
    }

    if (done && at != null) doneAt[item.id] = at;
    out.push({ id: item.id, label: item.label, why: item.why, done, broken, detail, at });
  }
  return out;
}

/** Every item complete? */
export const missionComplete = (mission, history) => missionStatus(mission, history).every((s) => s.done);

/** A picture snapshot for the history. */
export function snapshot(ours, theirs, carrierId, step) {
  const c = ours.find((p) => p.id === carrierId);
  return {
    ball: { x: c.x, y: c.y },
    carrierId,
    ours: ours.map((p) => ({ id: p.id, pos: p.pos, role: p.role, x: p.x, y: p.y })),
    theirs: theirs.map((p) => ({ id: p.id, pos: p.pos, role: p.role, x: p.x, y: p.y })),
    step,
  };
}
