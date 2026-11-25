/*
 * Coach Bobby Academy — Formation library
 * ------------------------------------------------------------------
 * Every formation has TWO shapes, because real teams do:
 *   oop  out of possession — how the team defends (usually a mid block)
 *   ip   in possession     — how the team spreads out to attack
 * A 4-3-3 that defends as a 4-1-4-1 and attacks as a 3-2-5 is still
 * "a 4-3-3"; the label is the starting point, the shapes are the truth.
 *
 * Levels layer the curriculum from basic to rare:
 *   1 foundations  2 common  3 back threes and wing-backs
 *   4 modern positional and narrow shapes  5 rare and historical
 *
 * Coordinates are yards in OUR frame: x = 0 our goal line, 105 theirs;
 * y = 0 our right touchline. The shapes are representative teaching
 * models of each formation at a typical moment (defending in a mid block,
 * attacking from the middle third). The movement engine stretches and
 * shifts them by team style and ball position. Historical associations
 * are the commonly cited ones and are marked as such.
 *
 * Data only: no DOM, no scoring.
 * ------------------------------------------------------------------
 */

/** Slot spec: [id, position, oopX, oopY, ipX, ipY] */
const slots = (rows) => rows.map(([id, pos, ox, oy, ix, iy]) => ({
  id, pos, role: pos === 'GK' ? 'keeper' : 'outfield', oop: { x: ox, y: oy }, ip: { x: ix, y: iy },
}));

export const FORMATIONS = [
  /* ------------------------------ Level 1 ------------------------------ */
  {
    id: '4-4-2', name: '4-4-2', level: 1, family: 'Back four',
    oopName: '4-4-2: two banks of four', ipName: '4-2-4: wide midfielders push on',
    summary: 'Two lines of four with two strikers. The simplest way to cover the width of the pitch, and the shape most other formations are explained against.',
    oopHow: 'Two flat, compact lines of four slide across together. The two strikers screen the opponent’s holding midfielder and decide when the press starts.',
    ipHow: 'The wide midfielders push up beside the strikers and the full-backs step on behind them, so the team attacks with four across the front.',
    strengths: ['Every zone of the width is covered when defending', 'Two strikers can pressure two centre-backs', 'Simple partnerships: full-back with winger, striker with striker'],
    weaknesses: ['Only two central midfielders, so a team with three in the middle has a spare man', 'Space between the lines if the two banks drift apart'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rb', 'RB', 26, 10, 44, 8], ['rcb', 'RCB', 25, 27, 34, 25], ['lcb', 'LCB', 25, 41, 34, 43], ['lb', 'LB', 26, 58, 44, 60],
      ['rm', 'RM', 38, 10, 66, 9], ['rcm', 'RCM', 38, 28, 50, 28], ['lcm', 'LCM', 38, 40, 50, 40], ['lm', 'LM', 38, 58, 66, 59],
      ['rs', 'ST', 50, 30, 74, 29], ['ls', 'ST', 50, 38, 74, 39],
    ]),
  },
  {
    id: '4-3-3', name: '4-3-3', level: 1, family: 'Back four',
    oopName: '4-1-4-1: wingers drop into midfield', ipName: '3-2-5: a full-back steps inside',
    summary: 'Four defenders, a midfield three and three forwards. The most common shape in the modern game, built for controlling the middle.',
    oopHow: 'The wingers drop level with the two central midfielders, leaving the holding midfielder alone in front of the back four: a 4-1-4-1 that is hard to play through.',
    ipHow: 'One full-back steps inside next to the holding midfielder, the other three defenders spread across, and five attackers fill the five lanes across the pitch: a 3-2-5.',
    strengths: ['Three central midfielders against two gives a spare player', 'Five attackers can occupy every lane of the pitch', 'Natural triangles everywhere for short passing'],
    weaknesses: ['Wingers must work hard to defend, or the full-backs are exposed', 'A lone holding midfielder can be overloaded'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rb', 'RB', 28, 10, 46, 27], ['rcb', 'RCB', 26, 26, 36, 20], ['lcb', 'LCB', 26, 42, 36, 38], ['lb', 'LB', 28, 58, 38, 55],
      ['dm', 'DM', 35, 34, 48, 40],
      ['rcm', 'RCM', 42, 24, 64, 23], ['lcm', 'LCM', 42, 44, 64, 45],
      ['rw', 'RW', 43, 8, 72, 6], ['st', 'ST', 53, 34, 77, 34], ['lw', 'LW', 43, 60, 72, 62],
    ]),
  },
  {
    id: '4-2-3-1', name: '4-2-3-1', level: 1, family: 'Back four',
    oopName: '4-4-1-1: number 10 joins the striker', ipName: '2-3-5: both full-backs high',
    summary: 'A back four, two holding midfielders, three attacking midfielders behind one striker. Balanced, with a protected base and a creative number 10.',
    oopHow: 'The wide attackers drop into a midfield four and the number 10 steps up beside the striker to block the opponent’s pivot: a 4-4-1-1 that can become a 4-4-2 press.',
    ipHow: 'Both full-backs push high and wide, the wide attackers come inside, and one holding midfielder sits between the centre-backs’ passing lines: five attackers ahead of the ball.',
    strengths: ['Double pivot protects the back four', 'Number 10 links midfield to the striker', 'Easily becomes a 4-4-2 press'],
    weaknesses: ['Lone striker can be isolated', 'If both holding midfielders go forward, the centre is open on a counter'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rb', 'RB', 26, 10, 62, 6], ['rcb', 'RCB', 25, 27, 34, 23], ['lcb', 'LCB', 25, 41, 34, 45], ['lb', 'LB', 26, 58, 62, 62],
      ['rdm', 'RDM', 34, 29, 46, 28], ['ldm', 'LDM', 34, 39, 46, 40],
      ['ram', 'RM', 40, 10, 70, 22], ['am', 'AM', 46, 34, 62, 34], ['lam', 'LM', 40, 58, 70, 46],
      ['st', 'ST', 54, 34, 78, 34],
    ]),
  },

  /* ------------------------------ Level 2 ------------------------------ */
  {
    id: '4-1-4-1', name: '4-1-4-1', level: 2, family: 'Back four',
    oopName: '4-1-4-1: the screen', ipName: '4-3-3: eights push up',
    summary: 'A defensive 4-3-3: one holding midfielder screens the back four with a line of four in front of him.',
    oopHow: 'A compact line of four midfielders with a single screen behind them. Very hard to play through the middle.',
    ipHow: 'The two central midfielders push into the half-spaces and the shape becomes a 4-3-3 again.',
    strengths: ['Excellent protection of the space in front of the defence', 'Five midfielders across the pitch'],
    weaknesses: ['Lone striker gets little support on the counter', 'The screen can be pulled out of position'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rb', 'RB', 27, 10, 46, 8], ['rcb', 'RCB', 25, 27, 34, 26], ['lcb', 'LCB', 25, 41, 34, 42], ['lb', 'LB', 27, 58, 46, 60],
      ['dm', 'DM', 33, 34, 44, 34],
      ['rm', 'RM', 41, 10, 70, 8], ['rcm', 'RCM', 41, 27, 60, 24], ['lcm', 'LCM', 41, 41, 60, 44], ['lm', 'LM', 41, 58, 70, 60],
      ['st', 'ST', 53, 34, 76, 34],
    ]),
  },
  {
    id: '4-4-1-1', name: '4-4-1-1', level: 2, family: 'Back four',
    oopName: '4-4-1-1: deep and compact', ipName: '4-4-2: second striker joins',
    summary: 'A 4-4-2 where the second striker drops into the hole. Common for teams that defend deep and counter.',
    oopHow: 'Two banks of four stay narrow; the second striker drops onto the opponent’s holding midfielder.',
    ipHow: 'The second striker pushes up to join the striker, and the wide midfielders carry the ball forward on the counter.',
    strengths: ['Compact and hard to break down', 'Second striker is a ready outlet on the counter'],
    weaknesses: ['Can be pinned deep for long spells', 'Few players forward when the ball is won'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rb', 'RB', 22, 12, 40, 8], ['rcb', 'RCB', 21, 28, 32, 26], ['lcb', 'LCB', 21, 40, 32, 42], ['lb', 'LB', 22, 56, 40, 60],
      ['rm', 'RM', 32, 12, 62, 9], ['rcm', 'RCM', 32, 28, 48, 28], ['lcm', 'LCM', 32, 40, 48, 40], ['lm', 'LM', 32, 56, 62, 59],
      ['ss', 'AM', 40, 34, 68, 30], ['st', 'ST', 48, 34, 76, 38],
    ]),
  },

  /* ------------------------------ Level 3 ------------------------------ */
  {
    id: '3-5-2', name: '3-5-2', level: 3, family: 'Back three',
    oopName: '5-3-2: wing-backs drop', ipName: '3-1-4-2: wing-backs fly',
    summary: 'Three centre-backs, wing-backs covering a whole flank each, three central midfielders and two strikers.',
    oopHow: 'The wing-backs drop into the back line to make five, with a narrow three in midfield and two strikers: a 5-3-2.',
    ipHow: 'The wing-backs push up to the front line for width, one midfielder holds and two push on: a 3-1-4-2.',
    strengths: ['Three centre-backs against two strikers gives a spare defender', 'Strong in the centre with three midfielders and two strikers'],
    weaknesses: ['Each wing-back must cover an entire flank', 'Space behind the wing-backs on the counter'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rcb', 'RCB', 24, 22, 36, 18], ['cb', 'CB', 23, 34, 32, 34], ['lcb', 'LCB', 24, 46, 36, 50],
      ['rwb', 'RWB', 26, 6, 64, 5], ['lwb', 'LWB', 26, 62, 64, 63],
      ['dm', 'DM', 34, 34, 46, 34], ['rcm', 'RCM', 38, 24, 58, 24], ['lcm', 'LCM', 38, 44, 58, 44],
      ['rs', 'ST', 50, 29, 74, 29], ['ls', 'ST', 50, 39, 74, 39],
    ]),
  },
  {
    id: '3-4-3', name: '3-4-3', level: 3, family: 'Back three',
    oopName: '5-4-1: wing-backs and wide forwards drop', ipName: '3-2-5: wing-backs high',
    summary: 'A back three, a midfield four with wing-backs, and a front three with two forwards in the half-spaces.',
    oopHow: 'Wing-backs drop into a back five and the two wide forwards drop beside the central midfielders: a 5-4-1 that is very hard to break down.',
    ipHow: 'Wing-backs push up to the touchlines in the front line, the two inside forwards attack the half-spaces: three, two, then five across the front.',
    strengths: ['Fills all five attacking lanes naturally', 'Back five is solid without the ball'],
    weaknesses: ['Only two central midfielders against a three', 'Lone forward when defending deep'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rcb', 'RCB', 24, 22, 36, 18], ['cb', 'CB', 23, 34, 32, 34], ['lcb', 'LCB', 24, 46, 36, 50],
      ['rwb', 'RWB', 26, 6, 70, 5], ['rcm', 'RCM', 36, 28, 48, 28], ['lcm', 'LCM', 36, 40, 48, 40], ['lwb', 'LWB', 26, 62, 70, 63],
      ['rf', 'RF', 38, 14, 72, 22], ['st', 'ST', 50, 34, 78, 34], ['lf', 'LF', 38, 54, 72, 46],
    ]),
  },

  /* ------------------------------ Level 4 ------------------------------ */
  {
    id: '4-1-2-1-2', name: '4-1-2-1-2 (diamond)', level: 4, family: 'Narrow',
    oopName: '4-3-1-2: narrow diamond', ipName: '2-1-2-1-4: full-backs give all the width',
    summary: 'A midfield diamond behind two strikers. Dominant in the centre, with no natural wingers.',
    oopHow: 'Very narrow: the diamond protects the middle and invites the opponent wide, where the full-backs and shuttling midfielders must cover.',
    ipHow: 'The full-backs provide all of the width, high up the pitch, while the diamond and two strikers overload the centre.',
    strengths: ['Four central midfielders: control of the middle', 'Two strikers plus a number 10 between the lines'],
    weaknesses: ['No wingers, so the full-backs carry the whole flank', 'Vulnerable to switches of play'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rb', 'RB', 25, 12, 62, 6], ['rcb', 'RCB', 24, 27, 34, 25], ['lcb', 'LCB', 24, 41, 34, 43], ['lb', 'LB', 25, 56, 62, 62],
      ['dm', 'DM', 32, 34, 44, 34], ['rcm', 'RCM', 38, 24, 54, 24], ['lcm', 'LCM', 38, 44, 54, 44], ['am', 'AM', 45, 34, 64, 34],
      ['rs', 'ST', 52, 29, 76, 28], ['ls', 'ST', 52, 39, 76, 40],
    ]),
  },
  {
    id: '4-3-2-1', name: '4-3-2-1 (Christmas tree)', level: 4, family: 'Narrow',
    oopName: '4-5-1: the tree widens', ipName: '4-3-2-1: two tens behind the nine',
    summary: 'A midfield three, two attacking midfielders and one striker. Narrow and central, commonly associated with Carlo Ancelotti’s Milan.',
    oopHow: 'The two attacking midfielders drop wider into a midfield five, leaving a lone striker.',
    ipHow: 'The two attacking midfielders play in the pockets either side of the striker, and the full-backs supply the width.',
    strengths: ['Two players between the lines', 'Very strong centrally'],
    weaknesses: ['No natural width', 'Striker can be isolated'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rb', 'RB', 26, 10, 58, 6], ['rcb', 'RCB', 25, 27, 34, 25], ['lcb', 'LCB', 25, 41, 34, 43], ['lb', 'LB', 26, 58, 58, 62],
      ['rcm', 'RCM', 36, 22, 50, 22], ['dm', 'DM', 34, 34, 46, 34], ['lcm', 'LCM', 36, 46, 50, 46],
      ['ram', 'RAM', 42, 14, 66, 26], ['lam', 'LAM', 42, 54, 66, 42], ['st', 'ST', 52, 34, 78, 34],
    ]),
  },

  /* ------------------------------ Level 5 ------------------------------ */
  {
    id: '3-3-1-3', name: '3-3-1-3', level: 5, family: 'Rare',
    oopName: '3-3-1-3: man-to-man all over', ipName: '3-3-1-3: every line filled',
    summary: 'Three defenders, a midfield three, a number 10 and three forwards. Rare and very aggressive, commonly associated with Johan Cruyff’s Ajax and Barcelona and with Marcelo Bielsa.',
    oopHow: 'Usually played with tight man-marking all over the pitch and a very high line. Brave, risky, and exhausting.',
    ipHow: 'Every line of the pitch is occupied, so the ball can always find a player between the opponent’s lines.',
    strengths: ['Overloads every line of the opponent', 'Natural pressing pairs all over the pitch'],
    weaknesses: ['Only three defenders against a counter', 'Demands huge running and discipline'],
    slots: slots([
      ['gk', 'GK', 7, 34, 14, 34],
      ['rcb', 'RCB', 30, 20, 40, 18], ['cb', 'CB', 28, 34, 36, 34], ['lcb', 'LCB', 30, 48, 40, 50],
      ['rm', 'RM', 40, 12, 56, 10], ['dm', 'DM', 38, 34, 50, 34], ['lm', 'LM', 40, 56, 56, 58],
      ['am', 'AM', 48, 34, 66, 34],
      ['rw', 'RW', 54, 10, 76, 6], ['st', 'ST', 58, 34, 80, 34], ['lw', 'LW', 54, 58, 76, 62],
    ]),
  },
  {
    id: '4-2-4', name: '4-2-4', level: 5, family: 'Historical',
    oopName: '4-4-2: wingers drop', ipName: '4-2-4: four attackers',
    summary: 'Four defenders, two midfielders, four forwards. Commonly associated with Brazil’s 1958 World Cup win, and the ancestor of the 4-4-2.',
    oopHow: 'The two wingers drop back to make a midfield four, which is how the 4-4-2 was born.',
    ipHow: 'Four forwards stretch the whole width of the defence; only two midfielders hold the centre.',
    strengths: ['Four attackers occupy the entire back line', 'Width on both flanks'],
    weaknesses: ['Two midfielders are easily outnumbered', 'Huge demands on the wingers to get back'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rb', 'RB', 25, 10, 38, 8], ['rcb', 'RCB', 24, 27, 32, 26], ['lcb', 'LCB', 24, 41, 32, 42], ['lb', 'LB', 25, 58, 38, 60],
      ['rcm', 'RCM', 38, 28, 50, 28], ['lcm', 'LCM', 38, 40, 50, 40],
      ['rw', 'RW', 38, 10, 74, 6], ['rs', 'ST', 52, 29, 76, 27], ['ls', 'ST', 52, 39, 76, 41], ['lw', 'LW', 38, 58, 74, 62],
    ]),
  },
  {
    id: 'wm', name: 'WM (3-2-2-3)', level: 5, family: 'Historical',
    oopName: 'WM: the "M" defends', ipName: 'WM: the "W" attacks',
    summary: 'Three backs, two halves, two inside forwards and three forwards, making the letters W and M. Commonly associated with Herbert Chapman’s Arsenal of the 1920s and 30s.',
    oopHow: 'The centre-half drops between the two full-backs to stop the opposing centre-forward: the birth of the centre-back.',
    ipHow: 'Two inside forwards play behind three forwards, making a W shape in attack.',
    strengths: ['A dedicated centre-back for the first time', 'Balanced squares all over the pitch'],
    weaknesses: ['Outnumbered by modern midfields', 'Rigid man-to-man duties'],
    slots: slots([
      ['gk', 'GK', 5, 34, 10, 34],
      ['rb', 'RB', 24, 18, 32, 16], ['cb', 'CB', 22, 34, 30, 34], ['lb', 'LB', 24, 50, 32, 52],
      ['rh', 'RH', 34, 24, 46, 24], ['lh', 'LH', 34, 44, 46, 44],
      ['ri', 'RI', 44, 26, 62, 26], ['li', 'LI', 44, 42, 62, 42],
      ['rw', 'RW', 50, 10, 76, 6], ['st', 'ST', 54, 34, 80, 34], ['lw', 'LW', 50, 58, 76, 62],
    ]),
  },
];

export const LEVEL_NAMES = {
  1: 'Foundations',
  2: 'Common shapes',
  3: 'Back threes and wing-backs',
  4: 'Narrow and modern shapes',
  5: 'Rare and historical',
};

export const formationById = (id) => FORMATIONS.find((f) => f.id === id) || null;

/**
 * A formation's players in pitch coordinates for one phase and side.
 * side 'ours' attacks +x as stored; side 'theirs' is mirrored so they
 * attack -x, with their right side on OUR left (high y).
 */
export function shape(formationId, phase, side = 'ours', idPrefix) {
  const f = formationById(formationId);
  if (!f) return null;
  const pre = idPrefix || (side === 'ours' ? 'u-' : 'o-');
  return f.slots.map((s) => {
    const p = s[phase];
    return {
      id: pre + s.id, pos: s.pos, role: s.role,
      x: side === 'ours' ? p.x : 105 - p.x,
      y: side === 'ours' ? p.y : 68 - p.y,
    };
  });
}

/** Best guess at a formation from free text such as a scenario brief. */
export function formationFromText(text) {
  const t = (text || '').toLowerCase();
  const hit = FORMATIONS.find((f) => t.includes(f.id));
  return hit ? hit.id : null;
}
