/*
 * Coach Bobby Academy — Mastery model
 * ------------------------------------------------------------------
 * An ALEKS-style competence tracker. Each tactical concept holds a
 * confidence value in 0..1 built from evidence, not from a score.
 *
 * Storage: this device only (localStorage). There is no account and no
 * server. Clearing the browser clears the profile. The UI says so.
 * ------------------------------------------------------------------
 */

const STORE_KEY = 'cba.mastery.v1';

export const DOMAINS = [
  { id: 'foundation', name: 'Foundation', concepts: ['scanning', 'support-angles', 'passing-lanes', 'body-orientation', 'receiving-under-pressure', 'possession-vs-penetration'] },
  { id: 'combination', name: 'Combination play', concepts: ['give-and-go', 'overlap', 'underlap', 'third-man', 'creating-a-free-player', 'weak-side'] },
  { id: 'structure', name: 'Team structure', concepts: ['buildup', 'breaking-lines', 'overloads', 'rest-defence', 'compactness', 'pressing-triggers'] },
  { id: 'transition', name: 'Transition', concepts: ['counterattack-decisions', 'delaying-counters', 'recovery-shape', 'securing-possession', 'playing-through-pressure'] },
  { id: 'final-third', name: 'Final third', concepts: ['box-occupation', 'crossing-decisions', 'cutbacks', 'through-balls', 'timing-runs', 'switching-play'] },
  { id: 'management', name: 'Game management', concepts: ['game-state', 'risk-management', 'opponent-adaptation', 'youth-translation'] },
];

export const CONCEPT_NAMES = {
  'scanning': 'Scanning before receiving',
  'support-angles': 'Support angles',
  'passing-lanes': 'Passing lanes',
  'body-orientation': 'Body orientation',
  'receiving-under-pressure': 'Receiving away from pressure',
  'possession-vs-penetration': 'Possession vs penetration',
  'give-and-go': 'Give-and-go',
  'overlap': 'Overlaps',
  'underlap': 'Underlaps',
  'third-man': 'Third-man combinations',
  'creating-a-free-player': 'Creating a free player',
  'weak-side': 'Weak-side recognition',
  'buildup': 'Building out from the back',
  'breaking-lines': 'Breaking lines',
  'overloads': 'Overloads',
  'rest-defence': 'Rest defence',
  'compactness': 'Defensive compactness',
  'pressing-triggers': 'Pressing triggers',
  'counterattack-decisions': 'Counterattack decisions',
  'delaying-counters': 'Delaying counters',
  'recovery-shape': 'Recovery shape',
  'securing-possession': 'Securing possession',
  'playing-through-pressure': 'Playing through pressure',
  'box-occupation': 'Box occupation',
  'crossing-decisions': 'Crossing decisions',
  'cutbacks': 'Cutbacks',
  'through-balls': 'Through balls',
  'timing-runs': 'Timing runs',
  'switching-play': 'Switching play',
  'game-state': 'Game-state management',
  'risk-management': 'Risk management',
  'opponent-adaptation': 'Adapting to the opponent',
  'youth-translation': 'Translating to young players',
};

export const LEVELS = [
  { min: 0.00, key: 'untested', label: 'Not yet tested' },
  { min: 0.18, key: 'aware', label: 'Aware' },
  { min: 0.42, key: 'developing', label: 'Developing' },
  { min: 0.66, key: 'secure', label: 'Secure' },
  { min: 0.86, key: 'mastered', label: 'Mastered' },
];

export function levelFor(value) {
  let out = LEVELS[0];
  for (const l of LEVELS) if (value >= l.min) out = l;
  return out;
}

function blank() {
  return { concepts: {}, history: [], badges: [], attempts: 0, solved: 0, updated: null };
}

export function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    return { ...blank(), ...parsed };
  } catch {
    return blank();
  }
}

export function save(profile) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(profile));
  } catch { /* storage unavailable — profile stays in memory for this visit */ }
  return profile;
}

export function reset() {
  try { localStorage.removeItem(STORE_KEY); } catch {}
  return blank();
}

/**
 * Fold one graded sequence into the profile.
 * Gains are damped as a concept approaches mastery, so a concept cannot
 * be maxed out by repeating one easy scenario — it needs varied evidence.
 */
export function applyEvidence(profile, evidence, meta) {
  const next = { ...profile, concepts: { ...profile.concepts } };
  next.attempts += 1;
  if (meta && meta.verdict === 'success') next.solved += 1;

  for (const e of evidence) {
    const cur = next.concepts[e.concept] || { value: 0, evidence: [], seenScenarios: [] };
    const scenarios = new Set(cur.seenScenarios);
    const isNewScenario = meta && !scenarios.has(meta.scenarioId);
    if (meta) scenarios.add(meta.scenarioId);

    // Variety multiplier: repeating the same scenario yields much less.
    const variety = isNewScenario ? 1 : 0.35;
    // Difficulty multiplier: harder scenarios move the needle more.
    const difficulty = 0.8 + 0.25 * ((meta && meta.difficulty) || 1);
    const headroom = e.delta > 0 ? (1 - cur.value) : 1;

    const step = e.delta * 0.16 * variety * difficulty * headroom;
    const value = Math.max(0, Math.min(1, cur.value + step));

    next.concepts[e.concept] = {
      value,
      seenScenarios: [...scenarios],
      evidence: [
        { when: Date.now(), why: e.why, delta: Math.round(step * 100) / 100, scenario: meta && meta.scenarioTitle },
        ...cur.evidence,
      ].slice(0, 8),
    };
  }

  if (meta) {
    next.history = [
      { when: Date.now(), scenarioId: meta.scenarioId, title: meta.scenarioTitle, rating: meta.rating, verdict: meta.verdict },
      ...profile.history,
    ].slice(0, 60);
  }
  next.updated = Date.now();
  next.badges = earnedBadges(next);
  return save(next);
}

export function domainScore(profile, domain) {
  const vals = domain.concepts.map((c) => (profile.concepts[c] ? profile.concepts[c].value : 0));
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function overallScore(profile) {
  const all = DOMAINS.map((d) => domainScore(profile, d));
  return all.reduce((a, b) => a + b, 0) / all.length;
}

/** Concepts with the most room to improve that have already been touched. */
export function weakestConcepts(profile, n = 4) {
  return Object.entries(profile.concepts)
    .map(([id, v]) => ({ id, name: CONCEPT_NAMES[id] || id, value: v.value }))
    .filter((c) => c.value < 0.66)
    .sort((a, b) => a.value - b.value)
    .slice(0, n);
}

export const BADGES = [
  {
    id: 'first-sequence',
    name: 'First Sequence',
    earn: (p) => p.attempts >= 1,
    means: 'You completed and submitted a full passing sequence.',
    how: 'Awarded the first time you press Finish Sequence.',
    next: 'Solve a scenario outright to earn Objective Met.',
  },
  {
    id: 'objective-met',
    name: 'Objective Met',
    earn: (p) => p.solved >= 1,
    means: 'You solved a scenario’s stated tactical objective.',
    how: 'Awarded when a submitted sequence meets the objective without a pass the defence was favourite to win.',
    next: 'Repeat it on a harder scenario.',
  },
  {
    id: 'line-breaker',
    name: 'Line Breaker',
    earn: (p) => (p.concepts['breaking-lines'] || {}).value >= 0.5,
    means: 'You reliably find passes that eliminate opponents rather than passes that only keep the ball.',
    how: 'Built from sequences where you played past two or more opponents at sensible risk.',
    next: 'Work on doing it against a compact block, where the lanes are tighter.',
  },
  {
    id: 'weak-side',
    name: 'Weak-Side Eyes',
    earn: (p) => (p.concepts['switching-play'] || {}).value >= 0.5,
    means: 'You look away from the ball and use the far side of the pitch.',
    how: 'Built from sequences containing a switch of more than 24 yards.',
    next: 'Switch play and then attack the space immediately, rather than switching and pausing.',
  },
  {
    id: 'composure',
    name: 'Composure',
    earn: (p) => (p.concepts['playing-through-pressure'] || {}).value >= 0.5,
    means: 'You keep the ball moving through pressure instead of forcing a 50/50.',
    how: 'Built from three-plus action sequences where every pass stayed above the risk threshold.',
    next: 'Hold that composure while still progressing the ball.',
  },
];

export function earnedBadges(profile) {
  return BADGES.filter((b) => b.earn(profile)).map((b) => b.id);
}
