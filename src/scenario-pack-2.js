/*
 * Coach Bobby Academy — Scenario Pack 2
 * ------------------------------------------------------------------
 * Six additional scenarios, filling out the Combination play, Foundation,
 * Final third and Game management units.
 *
 * This is a content pack: it appends to the SCENARIOS and CURRICULUM
 * arrays exported by scenarios.js rather than editing them. ES module
 * scripts all evaluate before DOMContentLoaded, so app.js sees the full
 * list by the time it boots. Packs keep scenario content additive and
 * reviewable one file at a time.
 *
 * Coordinates in yards. We always attack toward x = 105.
 * ------------------------------------------------------------------
 */

import { SCENARIOS, CURRICULUM } from './scenarios.js';

const squad = (rows) =>
  rows.map(([id, pos, x, y, role]) => ({ id, pos, x, y, role: role || 'outfield' }));

/* ---------- Opponent shapes for this pack ---------- */

const midBlock442 = squad([
  ['o-gk', 'GK', 101, 34, 'keeper'],
  ['o-rb', 'RB', 86, 13], ['o-rcb', 'RCB', 89, 28], ['o-lcb', 'LCB', 89, 40], ['o-lb', 'LB', 86, 55],
  ['o-rm', 'RM', 72, 14], ['o-rcm', 'RCM', 72, 29], ['o-lcm', 'LCM', 72, 39], ['o-lm', 'LM', 72, 54],
  ['o-rs', 'ST', 58, 30], ['o-ls', 'ST', 58, 38],
]);

const narrowBlock = squad([
  ['o-gk', 'GK', 101, 34, 'keeper'],
  ['o-rb', 'RB', 88, 22], ['o-rcb', 'RCB', 90, 30], ['o-lcb', 'LCB', 90, 38], ['o-lb', 'LB', 88, 46],
  ['o-dm', 'DM', 80, 34], ['o-rcm', 'RCM', 76, 27], ['o-lcm', 'LCM', 76, 41],
  ['o-rw', 'RW', 66, 26], ['o-st', 'ST', 62, 34], ['o-lw', 'LW', 66, 42],
]);

const deepBlock = squad([
  ['o-gk', 'GK', 102, 34, 'keeper'],
  ['o-rb', 'RB', 95, 20], ['o-rcb', 'RCB', 97, 30], ['o-lcb', 'LCB', 97, 38], ['o-lb', 'LB', 95, 48],
  ['o-rm', 'RM', 89, 22], ['o-rcm', 'RCM', 90, 31], ['o-lcm', 'LCM', 90, 37], ['o-lm', 'LM', 89, 46],
  ['o-am', 'AM', 82, 34], ['o-st', 'ST', 74, 34],
]);

const pressing433 = squad([
  ['o-gk', 'GK', 99, 34, 'keeper'],
  ['o-rb', 'RB', 70, 14], ['o-rcb', 'RCB', 74, 29], ['o-lcb', 'LCB', 74, 39], ['o-lb', 'LB', 70, 54],
  ['o-dm', 'DM', 58, 34], ['o-rcm', 'RCM', 48, 26], ['o-lcm', 'LCM', 48, 42],
  ['o-rw', 'RW', 30, 18], ['o-st', 'ST', 26, 34], ['o-lw', 'LW', 30, 50],
]);

const highLine = squad([
  ['o-gk', 'GK', 96, 34, 'keeper'],
  ['o-rb', 'RB', 66, 12], ['o-rcb', 'RCB', 70, 30], ['o-lcb', 'LCB', 70, 38], ['o-lb', 'LB', 66, 56],
  ['o-dm', 'DM', 60, 34], ['o-rcm', 'RCM', 54, 25], ['o-lcm', 'LCM', 54, 43],
  ['o-rw', 'RW', 44, 16], ['o-st', 'ST', 40, 34], ['o-lw', 'LW', 44, 52],
]);

/* ---------------------------- Scenarios ---------------------------- */

const PACK = [
  {
    id: 'beat-the-first-line',
    title: 'Break the first line',
    subtitle: 'Two strikers pressing, four defenders playing',
    difficulty: 1,
    unit: 'foundation',
    context: {
      phase: 'Buildup in our own third',
      gameState: '0-0, 12th minute',
      opponent: '4-4-2, front two pressing the centre-backs, midfield holding its line',
      instruction: 'Two of them are pressing four of you. Somebody is unmarked before you even touch the ball — the whole task is finding him and playing the pass that removes both strikers from the game.',
    },
    objective: 'Get the ball past both strikers to a player in midfield with the ball under control.',
    objectiveCheck: { reachZone: { x: 60, y: 8, w: 22, h: 52 } },
    maxActions: 4,
    concepts: ['buildup', 'scanning', 'breaking-lines', 'creating-a-free-player'],
    view: { x: 0, y: 0, w: 80, h: 68 },
    startCarrier: 'u-lcb',
    ours: squad([
      ['u-gk', 'GK', 10, 34, 'keeper'],
      ['u-rb', 'RB', 30, 9], ['u-rcb', 'RCB', 24, 27], ['u-lcb', 'LCB', 24, 41], ['u-lb', 'LB', 30, 59],
      ['u-dm', 'DM', 38, 34], ['u-rcm', 'RCM', 50, 24], ['u-lcm', 'LCM', 50, 44],
      ['u-rw', 'RW', 66, 10], ['u-st', 'ST', 66, 34], ['u-lw', 'LW', 66, 58],
    ]),
    theirs: midBlock442,
  },

  {
    id: 'overlap-left',
    title: 'The left back is arriving',
    subtitle: 'Creating a 2v1 with an overlapping run',
    difficulty: 2,
    unit: 'combination',
    context: {
      phase: 'Settled possession, ball on our left',
      gameState: '0-0, 34th minute',
      opponent: 'Narrow 4-3-3, the block has slid centrally and their right back is isolated',
      instruction: 'Your left winger has the ball and a defender in front of him. Your left back is arriving on the outside. Two players against one defender is an advantage — but only if you actually use it.',
    },
    objective: 'Get the ball into the space behind their right back, in the attacking third.',
    objectiveCheck: { reachZone: { x: 84, y: 44, w: 20, h: 22 } },
    maxActions: 4,
    concepts: ['overlap', 'creating-a-free-player', 'timing-runs', 'support-angles'],
    view: { x: 40, y: 0, w: 65, h: 68 },
    startCarrier: 'u-lw',
    ours: squad([
      ['u-gk', 'GK', 16, 34, 'keeper'],
      ['u-rb', 'RB', 68, 10], ['u-rcb', 'RCB', 54, 27], ['u-lcb', 'LCB', 54, 40], ['u-lb', 'LB', 74, 56],
      ['u-dm', 'DM', 58, 31], ['u-rcm', 'RCM', 72, 26], ['u-lcm', 'LCM', 70, 43],
      ['u-rw', 'RW', 84, 12], ['u-st', 'ST', 86, 34], ['u-lw', 'LW', 80, 55],
    ]),
    theirs: narrowBlock,
  },

  {
    id: 'give-and-go-out',
    title: 'Give-and-go out of pressure',
    subtitle: 'Using a wall pass to escape the press',
    difficulty: 2,
    unit: 'combination',
    context: {
      phase: 'Under pressure in midfield',
      gameState: '1-0 up, 40th minute',
      opponent: 'Aggressive 4-3-3, pressing man for man across midfield',
      instruction: 'You are marked and the man pressing you is committed. A first-time pass and an immediate run past him takes him out of the game entirely — but only if the receiver can play it back into space, not to your feet.',
    },
    objective: 'Advance at least 18 yards through the press without a pass the defence is favourite to win.',
    objectiveCheck: { minProgression: 18 },
    maxActions: 4,
    concepts: ['give-and-go', 'playing-through-pressure', 'third-man', 'receiving-under-pressure'],
    view: { x: 10, y: 0, w: 85, h: 68 },
    startCarrier: 'u-rcm',
    ours: squad([
      ['u-gk', 'GK', 12, 34, 'keeper'],
      ['u-rb', 'RB', 42, 10], ['u-rcb', 'RCB', 30, 27], ['u-lcb', 'LCB', 30, 41], ['u-lb', 'LB', 42, 58],
      ['u-dm', 'DM', 44, 34], ['u-rcm', 'RCM', 54, 26], ['u-lcm', 'LCM', 56, 44],
      ['u-rw', 'RW', 72, 11], ['u-st', 'ST', 70, 34], ['u-lw', 'LW', 72, 57],
    ]),
    theirs: pressing433,
  },

  {
    id: 'switch-to-free-man',
    title: 'Find the weak side',
    subtitle: 'Switching play against an overloaded block',
    difficulty: 2,
    unit: 'structure',
    context: {
      phase: 'Settled possession, ball on our right',
      gameState: '0-0, 58th minute',
      opponent: 'Their whole block has slid to the ball side, leaving the far side short',
      instruction: 'Everything is crowded where the ball is, which is exactly why the ball should not stay there. The player who is free is the one furthest from the action — the hard part is seeing him before the defence slides back across.',
    },
    objective: 'Get the ball to a player on the far side of the pitch, past the halfway line.',
    objectiveCheck: { reachZone: { x: 56, y: 44, w: 46, h: 22 } },
    maxActions: 4,
    concepts: ['switching-play', 'weak-side', 'scanning', 'passing-lanes'],
    view: { x: 14, y: 0, w: 88, h: 68 },
    startCarrier: 'u-rcm',
    ours: squad([
      ['u-gk', 'GK', 14, 34, 'keeper'],
      ['u-rb', 'RB', 60, 11], ['u-rcb', 'RCB', 34, 26], ['u-lcb', 'LCB', 34, 40], ['u-lb', 'LB', 52, 58],
      ['u-dm', 'DM', 46, 32], ['u-rcm', 'RCM', 58, 19], ['u-lcm', 'LCM', 52, 40],
      ['u-rw', 'RW', 74, 14], ['u-st', 'ST', 70, 30], ['u-lw', 'LW', 76, 58],
    ]),
    theirs: squad([
      ['o-gk', 'GK', 101, 34, 'keeper'],
      ['o-rb', 'RB', 84, 12], ['o-rcb', 'RCB', 86, 22], ['o-lcb', 'LCB', 87, 31], ['o-lb', 'LB', 86, 42],
      ['o-rm', 'RM', 70, 14], ['o-rcm', 'RCM', 70, 24], ['o-lcm', 'LCM', 71, 33], ['o-lm', 'LM', 72, 43],
      ['o-am', 'AM', 62, 22], ['o-st', 'ST', 60, 31],
    ]),
  },

  {
    id: 'cutback-or-cross',
    title: 'Cutback or cross?',
    subtitle: 'The decision on the byline',
    difficulty: 3,
    unit: 'final-third',
    context: {
      phase: 'Attacking third, ball wide right near the byline',
      gameState: '0-0, 74th minute',
      opponent: 'Deep block, both centre-backs goal-side, midfield recovering into the box',
      instruction: 'You are past the full-back with the ball near the goal line. A cross to the penalty spot meets defenders facing the ball. A ball pulled back meets attackers running onto it. One of those is much harder to defend.',
    },
    objective: 'Deliver the ball into the cutback zone at the near edge of the penalty area.',
    objectiveCheck: { reachZone: { x: 88, y: 26, w: 12, h: 18 } },
    maxActions: 3,
    concepts: ['cutbacks', 'crossing-decisions', 'box-occupation', 'timing-runs'],
    view: { x: 58, y: 0, w: 47, h: 68 },
    startCarrier: 'u-rw',
    ours: squad([
      ['u-gk', 'GK', 22, 34, 'keeper'],
      ['u-rb', 'RB', 82, 12], ['u-rcb', 'RCB', 62, 27], ['u-lcb', 'LCB', 62, 41], ['u-lb', 'LB', 74, 58],
      ['u-dm', 'DM', 70, 31], ['u-rcm', 'RCM', 84, 28], ['u-lcm', 'LCM', 80, 44],
      ['u-rw', 'RW', 96, 14], ['u-st', 'ST', 92, 33], ['u-lw', 'LW', 88, 50],
    ]),
    theirs: deepBlock,
  },

  {
    id: 'chasing-a-goal',
    title: 'Chasing a goal',
    subtitle: 'Eighty-eighth minute, one down',
    difficulty: 3,
    unit: 'management',
    context: {
      phase: 'We need a goal',
      gameState: '0-1 down, 88th minute',
      opponent: 'Protecting the lead — high line held deliberately, everybody behind the ball',
      instruction: 'The safe pass is worth nothing now. A sequence that keeps the ball and finishes 20 yards from their goal has achieved exactly as little as losing it. Risk that would be reckless at 0-0 is correct here.',
    },
    objective: 'Get the ball into the penalty area within three actions.',
    objectiveCheck: { reachZone: { x: 88, y: 14, w: 16, h: 40 } },
    maxActions: 3,
    concepts: ['game-state', 'risk-management', 'through-balls', 'breaking-lines', 'timing-runs'],
    view: { x: 24, y: 0, w: 81, h: 68 },
    startCarrier: 'u-dm',
    ours: squad([
      ['u-gk', 'GK', 20, 34, 'keeper'],
      ['u-rb', 'RB', 58, 10], ['u-rcb', 'RCB', 44, 26], ['u-lcb', 'LCB', 44, 42], ['u-lb', 'LB', 58, 58],
      ['u-dm', 'DM', 56, 34], ['u-rcm', 'RCM', 66, 24], ['u-lcm', 'LCM', 66, 44],
      ['u-rw', 'RW', 78, 12], ['u-st', 'ST', 76, 34], ['u-lw', 'LW', 78, 56],
    ]),
    theirs: highLine,
  },
];

/* ---------------------------- Install ---------------------------- */

for (const s of PACK) {
  if (!SCENARIOS.some((x) => x.id === s.id)) SCENARIOS.push(s);
}

const CURRICULUM_ADDITIONS = [
  {
    unit: 'foundation',
    lessons: [{ id: 'beat-the-first-line', kind: 'scenario', title: 'Break the first line' }],
  },
  {
    unit: 'structure',
    lessons: [{ id: 'switch-to-free-man', kind: 'scenario', title: 'Find the weak side' }],
  },
  {
    unit: 'final-third',
    lessons: [{ id: 'cutback-or-cross', kind: 'scenario', title: 'Cutback or cross?' }],
  },
  {
    unit: 'management',
    lessons: [{ id: 'chasing-a-goal', kind: 'scenario', title: 'Chasing a goal' }],
  },
];

for (const add of CURRICULUM_ADDITIONS) {
  const unit = CURRICULUM.find((u) => u.id === add.unit);
  if (!unit) continue;
  for (const l of add.lessons) {
    if (!unit.lessons.some((x) => x.id === l.id)) unit.lessons.push(l);
  }
}

// Combination play had no unit of its own in the base curriculum.
if (!CURRICULUM.some((u) => u.id === 'combination')) {
  const structureIndex = CURRICULUM.findIndex((u) => u.id === 'structure');
  CURRICULUM.splice(structureIndex === -1 ? CURRICULUM.length : structureIndex, 0, {
    id: 'combination',
    name: 'Combination play',
    blurb: 'Give-and-goes, overlaps, third-man runs — the patterns that create a free player out of nothing.',
    lessons: [
      { id: 'overlap-left', kind: 'scenario', title: 'The left back is arriving' },
      { id: 'give-and-go-out', kind: 'scenario', title: 'Give-and-go out of pressure' },
      {
        id: 'third-man-reading',
        kind: 'reading',
        title: 'Why the third man is free',
        body: 'When you pass to a teammate, the defence reacts to the ball. Every defender adjusts toward the receiver — which means a third player, who was being watched a second ago, is now being watched by nobody. The combination is not a trick; it is a way of making the defence look at the wrong player at the right moment. Coaching point: the third man has to be moving before the second pass exists, or the space closes before he arrives.',
      },
      {
        id: 'overlap-reading',
        kind: 'reading',
        title: 'The overlap is a question, not a run',
        body: 'An overlapping full-back forces one defender to answer an unanswerable question: stay with the winger and the overlap is free, or follow the overlap and the winger can cut inside. The run is valuable whether or not it receives the ball, which is why players must keep making it even when they are not being found. Tell a young player "your run made the goal" when the ball went the other way — that is how they learn to keep making it.',
      },
    ],
  });
}
