/*
 * Coach Bobby Academy — Scenario & curriculum data
 * ------------------------------------------------------------------
 * Data only. No rendering, no scoring. Every scenario is a static
 * 11v11 picture plus an objective; the engine does the judging.
 *
 * Coordinates in yards. We always attack toward x = 105.
 * ------------------------------------------------------------------
 */

/** Build a squad from a compact spec: [id, position, x, y, role?] */
const squad = (rows) =>
  rows.map(([id, pos, x, y, role]) => ({ id, pos, x, y, role: role || 'outfield' }));

/* ---------- Opponent shapes, already in our attacking frame ---------- */

const opp442MidBlock = squad([
  ['o-gk', 'GK', 101, 34, 'keeper'],
  ['o-rb', 'RB', 88, 14], ['o-rcb', 'RCB', 90, 27], ['o-lcb', 'LCB', 90, 41], ['o-lb', 'LB', 88, 54],
  ['o-rm', 'RM', 74, 15], ['o-rcm', 'RCM', 74, 28], ['o-lcm', 'LCM', 74, 40], ['o-lm', 'LM', 74, 53],
  ['o-rs', 'ST', 60, 29], ['o-ls', 'ST', 60, 39],
]);

const opp433HighPress = squad([
  ['o-gk', 'GK', 100, 34, 'keeper'],
  ['o-rb', 'RB', 74, 12], ['o-rcb', 'RCB', 78, 28], ['o-lcb', 'LCB', 78, 40], ['o-lb', 'LB', 74, 56],
  ['o-dm', 'DM', 62, 34], ['o-rcm', 'RCM', 52, 25], ['o-lcm', 'LCM', 52, 43],
  ['o-rw', 'RW', 34, 17], ['o-st', 'ST', 30, 34], ['o-lw', 'LW', 34, 51],
]);

const oppLowBlock = squad([
  ['o-gk', 'GK', 102, 34, 'keeper'],
  ['o-rb', 'RB', 94, 18], ['o-rcb', 'RCB', 96, 29], ['o-lcb', 'LCB', 96, 39], ['o-lb', 'LB', 94, 50],
  ['o-rm', 'RM', 86, 20], ['o-rcm', 'RCM', 87, 30], ['o-lcm', 'LCM', 87, 38], ['o-lm', 'LM', 86, 48],
  ['o-am', 'AM', 78, 34], ['o-st', 'ST', 68, 34],
]);

const oppTransition = squad([
  ['o-gk', 'GK', 101, 34, 'keeper'],
  ['o-rb', 'RB', 70, 12], ['o-rcb', 'RCB', 82, 30], ['o-lcb', 'LCB', 84, 41], ['o-lb', 'LB', 68, 58],
  ['o-dm', 'DM', 66, 33], ['o-rcm', 'RCM', 50, 24], ['o-lcm', 'LCM', 48, 44],
  ['o-rw', 'RW', 40, 14], ['o-st', 'ST', 38, 36], ['o-lw', 'LW', 42, 54],
]);

/* ---------------------------- Scenarios ---------------------------- */

export const SCENARIOS = [
  {
    id: 'build-vs-press',
    title: 'Build out against the press',
    subtitle: 'Chelsea-style buildup vs an aggressive 4-3-3',
    difficulty: 1,
    unit: 'structure',
    context: {
      phase: 'Buildup — our goal kick, ball in play',
      gameState: '0-0, 22nd minute',
      opponent: 'Aggressive 4-3-3 press, front three man-marking the back four',
      instruction: 'They press with three and leave their midfield stepping high. Find the pass that takes their front line out of the game.',
    },
    objective: 'Get the ball to a midfielder beyond the opponent’s front three, with the ball still under control.',
    objectiveCheck: { reachZone: { x: 42, y: 8, w: 26, h: 52 } },
    maxActions: 4,
    concepts: ['buildup', 'playing-through-pressure', 'breaking-lines', 'creating-a-free-player'],
    view: { x: 0, y: 0, w: 78, h: 68 },
    startCarrier: 'u-rcb',
    ours: squad([
      ['u-gk', 'GK', 8, 34, 'keeper'],
      ['u-rb', 'RB', 26, 8], ['u-rcb', 'RCB', 20, 26], ['u-lcb', 'LCB', 20, 42], ['u-lb', 'LB', 26, 60],
      ['u-dm', 'DM', 34, 34], ['u-rcm', 'RCM', 46, 22], ['u-lcm', 'LCM', 46, 46],
      ['u-rw', 'RW', 62, 8], ['u-st', 'ST', 62, 34], ['u-lw', 'LW', 62, 60],
    ]),
    theirs: opp433HighPress,
  },

  {
    id: 'reach-the-winger',
    title: 'Reach the winger cleanly',
    subtitle: 'Progressing against a 4-4-2 mid block',
    difficulty: 1,
    unit: 'foundation',
    context: {
      phase: 'Settled possession in our half',
      gameState: '1-1, 55th minute',
      opponent: '4-4-2 mid block, compact between the lines',
      instruction: 'They are compact centrally and narrow. The space is wide — the question is how you get there without giving the ball away.',
    },
    objective: 'Get the ball to the right winger with separation, without forcing a 50/50.',
    objectiveCheck: { reachPlayer: 'u-rw' },
    maxActions: 4,
    concepts: ['support-angles', 'switching-play', 'passing-lanes', 'weak-side'],
    view: { x: 12, y: 0, w: 80, h: 68 },
    startCarrier: 'u-lcb',
    ours: squad([
      ['u-gk', 'GK', 12, 34, 'keeper'],
      ['u-rb', 'RB', 40, 10], ['u-rcb', 'RCB', 28, 26], ['u-lcb', 'LCB', 28, 42], ['u-lb', 'LB', 40, 58],
      ['u-dm', 'DM', 40, 34], ['u-rcm', 'RCM', 52, 24], ['u-lcm', 'LCM', 52, 44],
      ['u-rw', 'RW', 66, 9], ['u-st', 'ST', 66, 34], ['u-lw', 'LW', 66, 59],
    ]),
    theirs: opp442MidBlock,
  },

  {
    id: 'third-man-final-third',
    title: 'Third man into the cutback zone',
    subtitle: 'Napoli-style final-third movement',
    difficulty: 2,
    unit: 'final-third',
    context: {
      phase: 'Attacking third, ball on the right',
      gameState: '0-1 down, 68th minute',
      opponent: 'Deep 4-4-1-1 low block, two banks inside the box',
      instruction: 'Nobody is free in the box. The way in is a combination that drags a defender out and releases a third player behind him.',
    },
    objective: 'Work the ball into the cutback zone at the edge of the six-yard box.',
    objectiveCheck: { reachZone: { x: 88, y: 22, w: 13, h: 24 } },
    maxActions: 5,
    concepts: ['third-man', 'cutbacks', 'box-occupation', 'timing-runs', 'overlap'],
    view: { x: 52, y: 0, w: 53, h: 68 },
    startCarrier: 'u-rcm',
    ours: squad([
      ['u-gk', 'GK', 20, 34, 'keeper'],
      ['u-rb', 'RB', 76, 8], ['u-rcb', 'RCB', 58, 26], ['u-lcb', 'LCB', 58, 42], ['u-lb', 'LB', 70, 60],
      ['u-dm', 'DM', 66, 34], ['u-rcm', 'RCM', 78, 22], ['u-lcm', 'LCM', 76, 44],
      ['u-rw', 'RW', 86, 12], ['u-st', 'ST', 88, 33], ['u-lw', 'LW', 86, 55],
    ]),
    theirs: oppLowBlock,
  },

  {
    id: 'counter-first-pass',
    title: 'The first pass in transition',
    subtitle: 'Dortmund-style counterattack',
    difficulty: 2,
    unit: 'transition',
    context: {
      phase: 'We have just won the ball in midfield',
      gameState: '0-0, 71st minute',
      opponent: 'Committed forward — their full-backs are high and their rest defence is two',
      instruction: 'You have three seconds before they recover their shape. The first pass decides whether this is a counterattack or just possession.',
    },
    objective: 'Advance the ball at least 26 yards toward goal before their shape recovers.',
    objectiveCheck: { minProgression: 26 },
    maxActions: 3,
    concepts: ['counterattack-decisions', 'through-balls', 'breaking-lines', 'timing-runs'],
    view: { x: 20, y: 0, w: 85, h: 68 },
    startCarrier: 'u-dm',
    ours: squad([
      ['u-gk', 'GK', 10, 34, 'keeper'],
      ['u-rb', 'RB', 38, 10], ['u-rcb', 'RCB', 32, 27], ['u-lcb', 'LCB', 32, 41], ['u-lb', 'LB', 38, 58],
      ['u-dm', 'DM', 52, 34], ['u-rcm', 'RCM', 58, 22], ['u-lcm', 'LCM', 56, 46],
      ['u-rw', 'RW', 74, 12], ['u-st', 'ST', 72, 36], ['u-lw', 'LW', 70, 56],
    ]),
    theirs: oppTransition,
  },

  {
    id: 'protect-the-lead',
    title: 'Protect the lead without inviting pressure',
    subtitle: 'Game management with ten minutes left',
    difficulty: 3,
    unit: 'management',
    context: {
      phase: 'Settled possession, we lead',
      gameState: '1-0 up, 82nd minute',
      opponent: 'Chasing the game — pressing high, back line pushed up',
      instruction: 'Keeping the ball is worth more than territory here, but a sequence that never threatens invites them onto you. Find the balance.',
    },
    objective: 'Move the ball at least 14 yards upfield while keeping every action a low-risk one.',
    objectiveCheck: { minProgression: 14 },
    maxActions: 5,
    concepts: ['game-state', 'risk-management', 'securing-possession', 'rest-defence', 'possession-vs-penetration'],
    view: { x: 0, y: 0, w: 82, h: 68 },
    startCarrier: 'u-dm',
    ours: squad([
      ['u-gk', 'GK', 9, 34, 'keeper'],
      ['u-rb', 'RB', 30, 9], ['u-rcb', 'RCB', 22, 27], ['u-lcb', 'LCB', 22, 41], ['u-lb', 'LB', 30, 59],
      ['u-dm', 'DM', 36, 34], ['u-rcm', 'RCM', 48, 23], ['u-lcm', 'LCM', 48, 45],
      ['u-rw', 'RW', 64, 10], ['u-st', 'ST', 62, 34], ['u-lw', 'LW', 64, 58],
    ]),
    theirs: opp433HighPress.map((q) => ({ ...q, x: Math.max(4, q.x - 5) })),
  },
];

/* ---------------------------- Curriculum ---------------------------- */

export const CURRICULUM = [
  {
    id: 'foundation',
    name: 'Foundation',
    blurb: 'Zones, support angles, scanning, and the difference between keeping the ball and going somewhere with it.',
    lessons: [
      { id: 'reach-the-winger', kind: 'scenario', title: 'Reach the winger cleanly' },
      { id: 'lanes', kind: 'reading', title: 'What a passing lane actually is', body: 'A lane is not the straight line between two players. It is the straight line minus every opponent who can get a foot, a hip or a head into it before the ball passes. That is why the engine measures the closest opponent to the line of the pass, not just whether someone is standing in front of you.' },
      { id: 'possession-penetration', kind: 'reading', title: 'Possession vs penetration', body: 'Keeping the ball is a method. Getting closer to their goal is the objective. A sequence of six safe passes that finishes exactly where it started has not coached anybody anything. The app grades both: how safe each action was, and how much ground the sequence actually gained.' },
    ],
  },
  {
    id: 'structure',
    name: 'Team structure',
    blurb: 'Buildup shapes, breaking lines, overloads, and keeping a rest defence behind the ball.',
    lessons: [
      { id: 'build-vs-press', kind: 'scenario', title: 'Build out against the press' },
      { id: 'free-player', kind: 'reading', title: 'Creating the free player', body: 'A press that man-marks four defenders with three forwards always leaves someone unmarked. Your job is to find who it is before the ball arrives at your feet — which is a scanning problem, not a passing problem.' },
    ],
  },
  {
    id: 'transition',
    name: 'Transition',
    blurb: 'The first action after winning or losing the ball, and when to counter rather than settle.',
    lessons: [
      { id: 'counter-first-pass', kind: 'scenario', title: 'The first pass in transition' },
      { id: 'counter-or-secure', kind: 'reading', title: 'Counter or secure?', body: 'Counterattack when there is space behind their last line and a runner already moving into it. Secure the ball when there is not. The mistake is deciding before you have looked — forcing a 50/50 forward pass because the moment felt like a counterattack.' },
    ],
  },
  {
    id: 'final-third',
    name: 'Final third',
    blurb: 'Box occupation, cutbacks, third-man runs and creating shots against a deep block.',
    lessons: [
      { id: 'third-man-final-third', kind: 'scenario', title: 'Third man into the cutback zone' },
      { id: 'cutback', kind: 'reading', title: 'Why the cutback beats the cross', body: 'A ball pulled back from the goal line arrives at attackers running toward goal, while defenders are running the wrong way and the keeper is facing the wrong post. A cross from deep arrives at players who are static and defenders who are facing the ball. Against a low block the cutback zone is the target, not the penalty spot.' },
    ],
  },
  {
    id: 'management',
    name: 'Game management',
    blurb: 'Protecting a lead, chasing a goal, and managing risk by game state.',
    lessons: [
      { id: 'protect-the-lead', kind: 'scenario', title: 'Protect the lead without inviting pressure' },
    ],
  },
];

/* -------------------- Age-appropriate translations -------------------- */

export const YOUTH_TRANSLATIONS = [
  {
    concept: 'Support angles',
    pro: 'Receive on the half-turn at an angle that lets you see both the ball and the space beyond it.',
    cue: '"Stand where you can see both goals."',
    activity: '4v2 in a 20x20 square. A point for the possession team every six passes, but only if every receiver was standing on an angle, not directly behind the passer.',
    mistake: 'Eight-year-olds run straight at the ball, so everyone ends up in one line and the lane disappears.',
    success: 'Players start checking their shoulder before the ball reaches them.',
  },
  {
    concept: 'Breaking lines',
    pro: 'Prefer the pass that eliminates opponents over the pass that only retains possession.',
    cue: '"Can you pass past somebody? Then do that."',
    activity: 'Three-zone game, 6v6. A goal counts double if the build-up included a pass that went from zone one to zone three.',
    mistake: 'At this age they will try the forward pass every time and lose it. Reward the attempt, coach the selection.',
    success: 'Players start looking forward first and sideways second.',
  },
  {
    concept: 'Possession vs penetration',
    pro: 'Circulation is only useful if it eventually moves the defence and creates a way through.',
    cue: '"Keep it until you can go forward — then go."',
    activity: '5v5 with two end zones. Team must complete four passes before scoring, so they experience keeping it, then attacking.',
    mistake: 'Passing sideways forever because it feels safe and gets praised.',
    success: 'A player recognises the moment the opposition shifts and plays forward immediately.',
  },
  {
    concept: 'Scanning',
    pro: 'Check your shoulders repeatedly before receiving so the first touch is already a decision.',
    cue: '"Look before it comes."',
    activity: 'Coach holds up a number of fingers behind the receiving player; the receiver has to call the number as the ball arrives.',
    mistake: 'They look once, freeze, then look at the ball the whole way.',
    success: 'First touch goes away from pressure without the player having to think about it.',
  },
];
