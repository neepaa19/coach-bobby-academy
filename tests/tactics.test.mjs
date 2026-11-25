/*
 * Team-style movement tests. Run with:  node tests/tactics.test.mjs
 * These protect the things that make the board believable: nobody runs
 * offside, nobody teleports, markers never overlap, styles really differ,
 * and every movement comes with a reason.
 */
import assert from 'node:assert/strict';
import { SCENARIOS } from '../src/scenarios.js';
import '../src/scenario-pack-2.js';
import { reactToPass, styleFor, offsideLine, MIN_GAP, DEF_STYLES, ATT_STYLES } from '../src/tactics.js';
import { SPEED, dist } from '../src/engine.js';
import { bestSequence } from '../src/planner.js';

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; }
};

/** Play a scenario's first pass to a given receiver with a given opponent style. */
function play(scenarioId, receiverId, theirStyle) {
  const s = SCENARIOS.find((x) => x.id === scenarioId);
  const ours = s.ours.map((p) => ({ ...p }));
  const theirs = s.theirs.map((p) => ({ ...p }));
  const homes = new Map([...ours, ...theirs].map((p) => [p.id, { x: p.x, y: p.y }]));
  const from = ours.find((p) => p.id === s.startCarrier);
  const to = ours.find((p) => p.id === receiverId);
  const styles = { ...styleFor(s), ...(theirStyle ? { theirs: theirStyle } : {}) };
  const r = reactToPass({ from, to, passType: 'ground', ours, theirs, homes, styles, startBall: { x: from.x, y: from.y } });
  return { s, ours, theirs, from, to, r, styles };
}

/** Every scenario, every outfield receiver. */
function* everyPass() {
  for (const s of SCENARIOS) {
    for (const rec of s.ours) {
      if (rec.id === s.startCarrier || rec.role === 'keeper') continue;
      yield play(s.id, rec.id);
    }
  }
}

console.log('tactics');

test('the same pass always produces the same movement', () => {
  const a = play('build-vs-press', 'u-rb').r, b = play('build-vs-press', 'u-rb').r;
  assert.deepEqual([...a.theirs.entries()], [...b.theirs.entries()]);
  assert.deepEqual([...a.ours.entries()], [...b.ours.entries()]);
});

test('a high press holds its back line much higher than a low block', () => {
  const backX = (r, theirs) => {
    const backs = theirs.filter((p) => /B$/.test(p.pos));
    return backs.reduce((a, p) => a + r.theirs.get(p.id).x, 0) / backs.length;
  };
  const hi = play('build-vs-press', 'u-rb', 'highPress');
  const lo = play('build-vs-press', 'u-rb', 'lowBlock');
  // Lower x = further from their own goal = a higher line.
  assert.ok(backX(lo.r, lo.theirs) - backX(hi.r, hi.theirs) > 8,
    `high ${backX(hi.r, hi.theirs).toFixed(1)} vs low ${backX(lo.r, lo.theirs).toFixed(1)}`);
});

test('a high press sends two players; a low block does not press 70 yards from goal', () => {
  const hi = play('build-vs-press', 'u-rb', 'highPress');
  const lo = play('build-vs-press', 'u-rb', 'lowBlock');
  const jobs = (r) => [...r.theirs.values()].map((t) => t.job);
  assert.ok(jobs(hi.r).includes('press') && jobs(hi.r).includes('press-2'), jobs(hi.r).join(','));
  assert.ok(!jobs(lo.r).includes('press'), jobs(lo.r).join(','));
});

test('no attacker finishes a pass in an offside position', () => {
  const problems = [];
  for (const { s, r, to, ours } of everyPass()) {
    const defs = [...r.theirs.values()];
    const line = offsideLine(defs, to);
    for (const [id, t] of r.ours) {
      if (id === to.id) continue;
      // A player who was already beyond the line when the pass was played is
      // allowed to still be retreating, as long as he is heading back.
      const before = ours.find((p) => p.id === id);
      if (before.x > line && t.x < before.x) continue;
      if (t.x > line + 0.75) problems.push(`${s.id} -> ${to.pos}: ${id} at ${t.x.toFixed(1)}, line ${line.toFixed(1)}`);
    }
  }
  assert.deepEqual(problems.slice(0, 5), []);
});

test('no two players end up overlapping on the board', () => {
  const problems = [];
  for (const { s, r, to } of everyPass()) {
    const all = [...r.ours.entries(), ...r.theirs.entries()];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const d = dist(all[i][1], all[j][1]);
      if (d < MIN_GAP - 0.1) problems.push(`${s.id} -> ${to.pos}: ${all[i][0]} / ${all[j][0]} ${d.toFixed(2)} yd`);
    }
  }
  assert.deepEqual(problems.slice(0, 5), []);
});

test('nobody covers more ground than he could run while the ball travels', () => {
  const problems = [];
  for (const { s, r, from, to, ours, theirs, styles } of everyPass()) {
    const dt = dist(from, to) / SPEED.ground + 0.55;
    const capD = DEF_STYLES[styles.theirs].sprint * dt + MIN_GAP; // + room for overlap nudges
    const capA = ATT_STYLES[styles.ours].sprint * dt + MIN_GAP;
    for (const p of theirs) { const m = dist(p, r.theirs.get(p.id)); if (m > capD) problems.push(`${s.id} ${p.pos} ran ${m.toFixed(1)}`); }
    for (const p of ours) { const m = dist(p, r.ours.get(p.id)); if (m > capA) problems.push(`${s.id} ${p.pos} ran ${m.toFixed(1)}`); }
  }
  assert.deepEqual(problems.slice(0, 5), []);
});

test('every player has a reason for where he is', () => {
  for (const { r } of everyPass()) {
    for (const t of [...r.ours.values(), ...r.theirs.values()]) assert.ok(t.why && t.why.length > 10, 'missing reason');
  }
});

test('every scenario resolves to a known style', () => {
  for (const s of SCENARIOS) {
    const st = styleFor(s);
    assert.ok(DEF_STYLES[st.theirs], `${s.id}: ${st.theirs}`);
    assert.ok(ATT_STYLES[st.ours], `${s.id}: ${st.ours}`);
  }
});


function best(id) {
  const s = SCENARIOS.find((x) => x.id === id);
  const ours = s.ours.map((p) => ({ ...p })), theirs = s.theirs.map((p) => ({ ...p }));
  const homes = new Map([...ours, ...theirs].map((p) => [p.id, { x: p.x, y: p.y }]));
  const c = ours.find((p) => p.id === s.startCarrier);
  return { s, b: bestSequence({ scenario: s, ours, theirs, homes, styles: styleFor(s), startBall: { x: c.x, y: c.y } }) };
}

test('the best-sequence planner is deterministic and stays inside the action limit', () => {
  for (const sc of SCENARIOS) {
    const a = best(sc.id).b, b = best(sc.id).b;
    assert.deepEqual(a.sequence.map((x) => x.to.id), b.sequence.map((x) => x.to.id), sc.id);
    assert.ok(a.sequence.length >= 1 && a.sequence.length <= (sc.maxActions || 5), sc.id);
    assert.ok(a.sequence.every((x) => !/GK/.test(x.toLabel)), `${sc.id} routes through the keeper`);
  }
});

test('the planner solves the straightforward scenarios', () => {
  for (const id of ['reach-the-winger', 'beat-the-first-line', 'build-vs-press']) {
    assert.ok(best(id).b.objectiveMet, `${id} not solved`);
  }
});

console.log(`\n${passed} passing`);
