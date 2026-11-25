/*
 * Formation library tests. Run with:  node tests/formations.test.mjs
 * Every formation must be a real, playable eleven in BOTH phases, and
 * mirroring for the opponent must keep left and right on the right side.
 */
import assert from 'node:assert/strict';
import { FORMATIONS, shape, formationFromText, LEVEL_NAMES } from '../src/formations.js';
import { unitOfPos } from '../src/tactics.js';

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
};

console.log('formations');

test('every formation has 11 players, one keeper, unique ids', () => {
  for (const f of FORMATIONS) {
    assert.equal(f.slots.length, 11, f.id);
    assert.equal(f.slots.filter((s) => s.role === 'keeper').length, 1, f.id);
    assert.equal(new Set(f.slots.map((s) => s.id)).size, 11, f.id);
  }
});

test('every formation has both shapes, a level and an explanation of each phase', () => {
  for (const f of FORMATIONS) {
    assert.ok(LEVEL_NAMES[f.level], `${f.id} level`);
    assert.ok(f.oopHow && f.ipHow && f.oopName && f.ipName, `${f.id} phase text`);
    assert.ok(f.strengths.length && f.weaknesses.length, `${f.id} strengths/weaknesses`);
  }
});

test('the outfield count adds up to the formation name (where the name is numbers)', () => {
  for (const f of FORMATIONS) {
    const nums = f.id.match(/^\d(-\d)+$/) ? f.id.split('-').map(Number) : null;
    if (nums) assert.equal(nums.reduce((a, b) => a + b, 0), 10, f.id);
  }
});

test('every position label maps to a unit the movement engine understands', () => {
  for (const f of FORMATIONS) for (const s of f.slots) assert.ok(unitOfPos(s.pos), `${f.id} ${s.pos}`);
});

test('nobody stands on top of anyone else, in either phase', () => {
  for (const f of FORMATIONS) for (const phase of ['oop', 'ip']) {
    const pts = f.slots.map((s) => s[phase]);
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      assert.ok(d >= 4, `${f.id} ${phase}: ${f.slots[i].pos} and ${f.slots[j].pos} ${d.toFixed(1)} yd`);
    }
  }
});

test('teams attack further forward in possession than they defend out of it', () => {
  for (const f of FORMATIONS) {
    const avg = (phase) => f.slots.filter((s) => s.role !== 'keeper').reduce((a, s) => a + s[phase].x, 0) / 10;
    assert.ok(avg('ip') > avg('oop') + 8, `${f.id}: ip ${avg('ip').toFixed(1)} vs oop ${avg('oop').toFixed(1)}`);
  }
});

test('mirroring for the opponent keeps right-sided players on their right (our left)', () => {
  for (const f of FORMATIONS) {
    const ours = shape(f.id, 'oop', 'ours'), theirs = shape(f.id, 'oop', 'theirs');
    for (let i = 0; i < ours.length; i++) {
      if (/^R/.test(ours[i].pos)) { assert.ok(ours[i].y < 34, `${f.id} our ${ours[i].pos}`); assert.ok(theirs[i].y > 34, `${f.id} their ${theirs[i].pos}`); }
      assert.ok(theirs[i].x > 52.5 || ours[i].x >= 52.5, `${f.id} their ${theirs[i].pos} should be in their half`);
    }
  }
});

test('formations are recognised from a scenario brief', () => {
  assert.equal(formationFromText('Deep 4-4-1-1 low block'), '4-4-1-1');
  assert.equal(formationFromText('Aggressive 4-3-3 press'), '4-3-3');
  assert.equal(formationFromText('Their whole block has slid'), null);
});

console.log(`\n${passed} passing`);
