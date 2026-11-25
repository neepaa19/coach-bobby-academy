/*
 * Lesson checklist tests. Run with:  node tests/lessons.test.mjs
 * The checklist must reward the idea (draw, then break, safely), not a
 * particular player, and must never tick an item that did not happen.
 */
import assert from 'node:assert/strict';
import { SCENARIOS } from '../src/scenarios.js';
import { missionStatus, snapshot } from '../src/lessons.js';
import { styleFor, reactToPass } from '../src/tactics.js';
import { evaluatePass, evaluateCarry, inferPassType } from '../src/engine.js';
import { bestSequence } from '../src/planner.js';

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
};

const s = SCENARIOS.find((x) => x.id === 'build-vs-press');

/** Play a list of actions: a player id is a pass, {carry:{x,y}} is a dribble. */
function play(actions) {
  let ours = s.ours.map((p) => ({ ...p })), theirs = s.theirs.map((p) => ({ ...p }));
  const homes = new Map([...ours, ...theirs].map((p) => [p.id, { x: p.x, y: p.y }]));
  let cid = s.startCarrier;
  const startBall = { ...ours.find((p) => p.id === cid) };
  const history = [snapshot(ours, theirs, cid)];
  for (const a of actions) {
    const from = ours.find((p) => p.id === cid);
    let to, passType, result;
    if (a.carry) { to = { ...from, ...a.carry }; passType = 'carry'; result = evaluateCarry(from, to, { defenders: theirs }); }
    else { to = ours.find((p) => p.id === a); passType = inferPassType(from, to, { defenders: theirs }); result = evaluatePass(from, to, { defenders: theirs, passType }); }
    const r = reactToPass({ from, to, passType, ours, theirs, homes, styles: styleFor(s), startBall });
    ours = ours.map((p) => ({ ...p, ...r.ours.get(p.id) }));
    theirs = theirs.map((p) => ({ ...p, ...r.theirs.get(p.id) }));
    cid = to.id;
    history.push(snapshot(ours, theirs, cid, { result }));
  }
  return Object.fromEntries(missionStatus(s.mission, history).map((m) => [m.id, m]));
}

console.log('lessons');

test('nothing is ticked before you play', () => {
  const m = play([]);
  assert.ok(!m.break.done && !m.safe.done);
});

test('going forward before drawing the press does not count as breaking it', () => {
  const m = play(['u-dm', 'u-st']);
  assert.equal(m.break.done, false);
});

test('a reckless action breaks "stay safe"', () => {
  const m = play(['u-rb', 'u-rcm', 'u-rb']); // the last pass is into a pressed player
  assert.equal(m.safe.broken, true);
});

test('the engine finds a route that completes the whole lesson', () => {
  const ours = s.ours.map((p) => ({ ...p })), theirs = s.theirs.map((p) => ({ ...p }));
  const homes = new Map([...ours, ...theirs].map((p) => [p.id, { x: p.x, y: p.y }]));
  const c = ours.find((p) => p.id === s.startCarrier);
  const b = bestSequence({ scenario: s, ours, theirs, homes, styles: styleFor(s), startBall: { x: c.x, y: c.y } });
  assert.ok(b.objectiveMet, b.sequence.map((x) => `${x.fromLabel}>${x.toLabel}`).join(' '));
});

console.log(`\n${passed} passing`);
