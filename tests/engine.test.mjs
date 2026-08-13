/*
 * Engine tests. Run with:  node tests/engine.test.mjs
 * These protect the parts that are easy to break silently: scoring
 * direction, sequence grading, and the "weakest pass caps the sequence" rule.
 */
import assert from 'node:assert/strict';
import {
  evaluatePass, rankPassTypes, rankOptions, evaluateSequence,
  laneRisk, linesBroken, effectiveSeparation, distanceToGoal,
} from '../src/engine.js';

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
};

const P = (id, pos, x, y) => ({ id, pos, x, y, role: 'outfield' });

console.log('engine');

test('an open short pass scores higher than the same pass through traffic', () => {
  const from = P('a', 'CB', 30, 34), to = P('b', 'CM', 44, 34);
  const clear = evaluatePass(from, to, { defenders: [P('d', 'ST', 30, 62)] });
  const blocked = evaluatePass(from, to, { defenders: [P('d', 'ST', 37, 34.4)] });
  assert.ok(clear.confidence > blocked.confidence,
    `clear ${clear.confidence} should beat blocked ${blocked.confidence}`);
});

test('confidence always lands inside 3..97', () => {
  const from = P('a', 'CB', 5, 34);
  for (const to of [P('b', 'ST', 100, 34), P('b', 'CM', 8, 34), P('b', 'RW', 60, 2)]) {
    for (const d of [[], [P('d', 'ST', 6, 34)], Array.from({ length: 10 }, (_, i) => P('d' + i, 'X', 20 + i * 6, 34))]) {
      const r = evaluatePass(from, to, { defenders: d });
      assert.ok(r.confidence >= 3 && r.confidence <= 97, `got ${r.confidence}`);
    }
  }
});

test('the engine is deterministic', () => {
  const from = P('a', 'CB', 30, 30), to = P('b', 'CM', 50, 40);
  const ds = [P('d', 'CM', 40, 36)];
  const a = evaluatePass(from, to, { defenders: ds });
  const b = evaluatePass(from, to, { defenders: ds });
  assert.equal(a.confidence, b.confidence);
  assert.deepEqual(a.metrics, b.metrics);
});

test('effective separation shrinks as the ball spends longer in flight', () => {
  const receiver = P('r', 'ST', 60, 34);
  const defs = [P('d', 'CB', 68, 34)];
  const quick = effectiveSeparation(receiver, defs, 0.4);
  const slow = effectiveSeparation(receiver, defs, 1.6);
  assert.ok(slow.effective < quick.effective);
});

test('lane risk is zero when nobody is near the line of the pass', () => {
  const r = laneRisk(P('a', 'CB', 20, 34), P('b', 'CM', 40, 34), [P('d', 'X', 30, 60)]);
  assert.equal(r.risk, 0);
});

test('lines broken counts only opponents between passer and receiver', () => {
  const from = P('a', 'CB', 20, 34), to = P('b', 'ST', 60, 34);
  const defs = [P('d1', 'X', 30, 30), P('d2', 'X', 45, 40), P('d3', 'X', 70, 34), P('d4', 'X', 10, 34)];
  assert.equal(linesBroken(from, to, defs), 2);
});

test('a backward pass never counts as breaking lines', () => {
  assert.equal(linesBroken(P('a', 'CM', 60, 34), P('b', 'CB', 20, 34), [P('d', 'X', 40, 34)]), 0);
});

test('rankPassTypes returns four types, best first', () => {
  const types = rankPassTypes(P('a', 'CB', 30, 34), P('b', 'CM', 48, 34), { defenders: [P('d', 'X', 39, 36)] });
  assert.equal(types.length, 4);
  for (let i = 1; i < types.length; i++) assert.ok(types[i - 1].confidence >= types[i].confidence);
});

test('a lofted pass beats a ground pass when the lane is blocked', () => {
  const from = P('a', 'CB', 30, 34), to = P('b', 'CM', 50, 34);
  const defs = [P('d', 'X', 40, 34.2)];
  const ground = evaluatePass(from, to, { defenders: defs, passType: 'ground' });
  const chip = evaluatePass(from, to, { defenders: defs, passType: 'chip' });
  assert.ok(chip.confidence > ground.confidence);
});

test('rankOptions never suggests passing to yourself', () => {
  const carrier = P('a', 'CB', 30, 34);
  const mates = [carrier, P('b', 'CM', 45, 30), P('c', 'RW', 60, 10)];
  const r = rankOptions(carrier, mates, [P('d', 'X', 50, 40)]);
  assert.ok(r.all.every((o) => o.player.id !== 'a'));
  assert.equal(r.all.length, 2);
});

test('one terrible pass caps the whole sequence', () => {
  const scenario = { objective: 'test', objectiveCheck: { minProgression: 5 }, maxActions: 5, concepts: [] };
  const good = { from: P('a', 'CB', 30, 34), to: P('b', 'CM', 45, 34), toLabel: 'CM', result: { confidence: 85, passTypeLabel: 'Ground pass', metrics: { linesBroken: 1 } } };
  const bad = { from: P('b', 'CM', 45, 34), to: P('c', 'ST', 70, 34), toLabel: 'ST', result: { confidence: 18, passTypeLabel: 'Through ball', metrics: { linesBroken: 1 } } };
  const clean = evaluateSequence([good, { ...good, from: good.to, to: P('c', 'ST', 62, 34) }], scenario);
  const risky = evaluateSequence([good, bad], scenario);
  assert.ok(risky.rating < clean.rating, `risky ${risky.rating} should be below clean ${clean.rating}`);
  assert.equal(risky.verdict, 'lost');
});

test('an empty sequence is graded as empty, not as a success', () => {
  const r = evaluateSequence([], { objective: 'x', concepts: [] });
  assert.equal(r.rating, 0);
  assert.equal(r.verdict, 'empty');
});

test('meeting the objective produces success and concept evidence', () => {
  const scenario = { objective: 'reach the winger', objectiveCheck: { reachPlayer: 'w' }, maxActions: 4, concepts: ['switching-play'] };
  const step = { from: P('a', 'CB', 28, 42), to: P('w', 'RW', 66, 9), toLabel: 'RW', result: { confidence: 74, passTypeLabel: 'Driven pass', metrics: { linesBroken: 2 } } };
  const r = evaluateSequence([step], scenario);
  assert.equal(r.verdict, 'success');
  assert.ok(r.concepts.some((c) => c.concept === 'switching-play' && c.delta > 0));
});

test('distance to goal decreases as you move upfield', () => {
  assert.ok(distanceToGoal(P('a', 'X', 80, 34)) < distanceToGoal(P('b', 'X', 20, 34)));
});


/* --- Scenario data integrity -------------------------------------------
 * Two players authored on the same coordinates render as one circle and make
 * the engine believe the receiver has zero separation, so every pass to him
 * scores as impossible. This caught two real cases.
 */
import { SCENARIOS } from '../src/scenarios.js';
await import('../src/scenario-pack-2.js');

test('no two players in any scenario stand within 2.2 yards', () => {
  const problems = [];
  for (const s of SCENARIOS) {
    const all = [...s.ours, ...s.theirs];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const d = Math.hypot(all[i].x - all[j].x, all[i].y - all[j].y);
        if (d < 2.2) problems.push(`${s.id}: ${all[i].pos} and ${all[j].pos} are ${d.toFixed(1)} yd apart`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test('every scenario has 11 a side and a valid starting carrier', () => {
  for (const s of SCENARIOS) {
    assert.equal(s.ours.length, 11, `${s.id} our team`);
    assert.equal(s.theirs.length, 11, `${s.id} their team`);
    assert.ok(s.ours.some((p) => p.id === s.startCarrier), `${s.id} startCarrier exists`);
  }
});

test('every player sits inside the pitch', () => {
  for (const s of SCENARIOS) {
    for (const p of [...s.ours, ...s.theirs]) {
      assert.ok(p.x >= 0 && p.x <= 105 && p.y >= 0 && p.y <= 68, `${s.id} ${p.pos} at ${p.x},${p.y}`);
    }
  }
});

console.log(`\n${passed} passing`);
