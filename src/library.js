/*
 * Coach Bobby Academy — Tactics Library
 * ------------------------------------------------------------------
 * Coach and club profiles.
 *
 * ACCURACY RULES for this file:
 *  - Every employment fact carries the date it was verified. Managerial
 *    jobs change constantly; an undated claim is a wrong claim waiting
 *    to happen.
 *  - Tactical descriptions are original prose describing durable,
 *    well-documented patterns of play — not quotes, not copied text.
 *  - Nothing here asserts a current squad, result or table position.
 *
 * Verified 13 August 2026 against Premier League, ESPN, MLSSoccer,
 * FIFPlay and club sources. See README for the source list.
 *
 * This module is self-registering: it injects its own tab and screen,
 * so app.js needs no knowledge of it.
 * ------------------------------------------------------------------
 */

const VERIFIED = '13 August 2026';

export const COACHES = [
  {
    id: 'maresca',
    name: 'Enzo Maresca',
    role: 'Head coach, Manchester City',
    since: 'Appointed for the 2026/27 season, succeeding Pep Guardiola',
    previously: 'Chelsea (2024–2026), Leicester City (2023–2024, promoted as Championship winners), Parma; assistant to Guardiola at Manchester City',
    formations: ['4-3-3 in possession', '3-2-5 / 3-2-2-3 attacking shape', 'back three formed by an inverting full-back'],
    philosophy: 'Positional play taken to its logical extreme. The pitch is divided into zones and players occupy them by rule rather than by instinct, so the team recreates the same numerical advantages in the same places every match. Possession is not the objective — it is the mechanism for arriving at controlled situations near the opponent goal with the defence already outnumbered.',
    buildup: 'Builds with a back three formed by a full-back stepping into midfield, giving a 3-2 base behind the ball. The two holding players sit either side of the opponent striker so at least one is always free. The goalkeeper is a genuine passing option, not an escape hatch.',
    pressing: 'Immediate counter-press on loss, using the structure the team was already in. Because the shape is deliberately compact around the ball, the players who lose it are the ones best placed to win it back within seconds.',
    transition: 'Prefers to slow the game and reorganise rather than counterattack. On winning the ball the first action is usually a secure pass to a free man, not a direct forward ball.',
    strengths: ['Territorial control against deep blocks', 'Creating a free man in buildup by rule rather than improvisation', 'Rest defence is built into the shape, so counters are rare'],
    limitations: ['Ball circulation can become slow and predictable if the final-third pass never arrives', 'Demands players who are comfortable in tight, defined zones', 'Against a compact low block, control does not always convert into clear chances'],
    lesson: 'Play "Build out against the press". Maresca-style buildup is exactly the problem that scenario poses — three pressers against four defenders means somebody is free by arithmetic. Your job is finding him before the ball reaches your feet.',
  },
  {
    id: 'alonso',
    name: 'Xabi Alonso',
    role: 'Head coach, Chelsea',
    since: 'Head coach for the 2026/27 Premier League season',
    previously: 'Real Madrid, Bayer Leverkusen (2022–2024, unbeaten Bundesliga title in 2023/24), Real Sociedad B',
    formations: ['3-4-2-1', '3-4-3', 'shifts to a back four in possession'],
    philosophy: 'Structured aggression. A back three provides security so that wing-backs and the two attacking midfielders can commit high without leaving the team exposed. The pattern is patient circulation to move the opponent, then a fast, vertical break into the space that movement created.',
    buildup: 'Back three plus a dropping midfielder, with wing-backs pinned high and wide to stretch the opponent horizontally. The two number tens occupy the space between the opponent midfield and defence, so a line-breaking pass always has a target.',
    pressing: 'Man-oriented pressing high up, with the back three stepping aggressively to keep the block compact. Triggers on backward passes and poor first touches.',
    transition: 'Genuinely two-footed here — capable of the slow reset and the immediate vertical break, chosen by the picture rather than by dogma. Set pieces are treated as a primary weapon rather than an afterthought.',
    strengths: ['Attacking width and central penetration at the same time', 'Set-piece design', 'Squad management and rotation without losing structure'],
    limitations: ['Wing-backs carry an enormous physical load', 'The back three can be isolated when the press is beaten in midfield', 'Needs two-tens who defend as hard as they create'],
    lesson: 'Play "Reach the winger cleanly". The Alonso pattern is stretching a compact block horizontally until a lane opens — which is the same problem, one level simpler.',
  },
  {
    id: 'allegri',
    name: 'Massimiliano Allegri',
    role: 'Head coach, Napoli',
    since: 'Appointed July 2026, succeeding Antonio Conte',
    previously: 'AC Milan, Juventus (two spells, five consecutive Serie A titles from 2014, two Champions League finals), Cagliari',
    formations: ['4-3-3', '3-5-2', 'adjusts to the specific opponent'],
    philosophy: 'Pragmatism as a principle rather than a compromise. The shape and plan are chosen for the opponent and the game state, not imposed regardless. Defensive solidity is treated as the foundation everything else is built on, and a one-goal win is a complete performance.',
    buildup: 'Comparatively direct. Willing to bypass midfield with a longer ball to a target forward and play from the second ball, especially against a high press. Less concerned with possession share than with where possession is held.',
    pressing: 'A mid-block more often than a high press. Concedes territory deliberately, stays compact between the lines, and springs when the opponent commits numbers forward.',
    transition: 'This is the core strength. Absorbing pressure and countering with speed and numbers is a deliberate plan, not a fallback.',
    strengths: ['Defensive organisation and compactness', 'Game management with a lead', 'Adapting the plan to the specific opponent', 'Counterattacking'],
    limitations: ['Can cede control and territory for long spells', 'Style has drawn criticism as reactive against weaker opposition', 'Depends on forwards who can hold the ball alone'],
    lesson: 'Play "Protect the lead without inviting pressure". Managing risk by game state is the Allegri question in its purest form.',
  },
  {
    id: 'kovac',
    name: 'Niko Kovač',
    role: 'Head coach, Borussia Dortmund',
    since: 'In charge since 2025',
    previously: 'VfL Wolfsburg, AS Monaco, Bayern Munich (domestic double in 2018/19), Eintracht Frankfurt (DFB-Pokal winner), Croatia national team',
    formations: ['4-2-3-1', '3-4-2-1'],
    philosophy: 'Organisation before expression. Dortmund under Kovač are built to be hard to play through first and dangerous in transition second — a notable shift from the club’s heavy-metal identity, which prioritised chaos and vertical speed above defensive shape.',
    buildup: 'Direct and low-risk. Prefers to move the ball forward quickly rather than invite pressure with elaborate patterns near the goal.',
    pressing: 'Disciplined and structured, typically triggered from a mid-block rather than a permanent high press. Compactness between the lines is the priority.',
    transition: 'Dortmund’s traditional strength and still the primary route to goal — quick, vertical, using pace in wide areas the moment possession changes hands.',
    strengths: ['Defensive structure and discipline', 'Counterattacking with pace', 'Man management of a young squad'],
    limitations: ['Less penetrative against a deep block', 'Style can feel cautious for the club’s expectations', 'Creativity depends heavily on individuals in transition'],
    lesson: 'Play "The first pass in transition". The first action after winning the ball is the entire Dortmund identity, and the scenario forces you to choose between counter and secure.',
  },
  {
    id: 'guardiola',
    name: 'Pep Guardiola',
    role: 'Historical profile — foundational to modern positional play',
    since: 'Left Manchester City after the 2025/26 season; verified ' + VERIFIED,
    previously: 'Barcelona (2008–2012), Bayern Munich (2013–2016), Manchester City (2016–2026)',
    formations: ['4-3-3', '3-2-4-1', 'inverted full-backs forming a midfield box'],
    philosophy: 'The originator, in the modern era, of the idea that positioning creates advantages before the ball ever moves. Players occupy zones so that passing lanes exist by geometry rather than by improvisation. Every idea in the Maresca and Alonso profiles above traces back through this coaching tree.',
    buildup: 'Goalkeeper and centre-backs as genuine playmakers; full-backs invert into midfield to create central overloads; wingers hold maximum width to stretch the defence.',
    pressing: 'The five-second rule — win the ball back immediately after losing it, while the opponent is still disorganised, or drop into shape.',
    transition: 'Counter-pressing rather than counterattacking. Losing the ball is treated as the moment to win it back, not the moment to defend.',
    strengths: ['Sustained territorial dominance', 'Systematic creation of numerical superiority', 'Enormous coaching influence across the modern game'],
    limitations: ['Historically criticised for over-complicating knockout matches', 'The system demands technically exceptional players'],
    lesson: 'Read "Creating the free player" in the Team structure unit — it is the single idea underneath everything in this profile.',
  },
  {
    id: 'conte',
    name: 'Antonio Conte',
    role: 'Historical profile — left Napoli in 2026',
    since: 'Departed Napoli in 2026; verified ' + VERIFIED,
    previously: 'Napoli, Tottenham Hotspur, Inter Milan (2020/21 Serie A title), Chelsea (2016/17 Premier League title), Juventus, Italy',
    formations: ['3-5-2', '3-4-3'],
    philosophy: 'Intensity as a system. A back three with aggressive wing-backs, drilled relentlessly until the movements are automatic. Every player knows exactly where to be in every phase, and the physical demands are extreme by design.',
    buildup: 'Back three splits wide, wing-backs push extremely high, and the ball is progressed quickly through the midfield trio into the forwards. Direct rather than elaborate.',
    pressing: 'Aggressive and man-oriented, with wing-backs jumping onto opposition full-backs and the back three stepping to keep the block compact.',
    transition: 'Fast and vertical. Two forwards give an immediate outlet, so counterattacks begin with a pass rather than a dribble.',
    strengths: ['Immediate impact — historically improves teams inside one season', 'Defensive solidity from the back three', 'Drilled, repeatable attacking patterns'],
    limitations: ['Physical demands lead to fatigue and injuries late in seasons', 'Relationships with boards have often become strained', 'Rigid shape can be hard to adjust mid-match'],
    lesson: 'Compare with the Allegri profile above. Both are pragmatists, but Conte imposes a drilled pattern while Allegri adapts to the opponent — worth understanding as two different answers to the same question.',
  },
];

export const CLUBS = [
  {
    id: 'chelsea',
    name: 'Chelsea',
    league: 'Premier League, England',
    coach: 'Xabi Alonso (2026/27)',
    identity: 'A squad assembled around young players on long contracts, which makes coaching and development the central variable rather than recruitment alone.',
    formations: ['3-4-2-1', '4-2-3-1'],
    buildupNote: 'Back three with high wing-backs, two midfielders screening, and attacking midfielders working in the space between the opponent lines.',
    pressNote: 'High, man-oriented press with an aggressive defensive line.',
    transitionNote: 'Uses pace in wide areas; increasingly treats set pieces as a primary scoring route.',
    distinctive: 'A very young squad executing a demanding structural system — the interesting tactical question is how much complexity a young team can absorb before structure becomes a constraint.',
  },
  {
    id: 'napoli',
    name: 'Napoli',
    league: 'Serie A, Italy',
    coach: 'Massimiliano Allegri (from July 2026)',
    identity: 'Serie A champions in recent seasons under different coaches with quite different philosophies, which tells you the squad is adaptable rather than tied to one system.',
    formations: ['4-3-3', '3-5-2'],
    buildupNote: 'Under Allegri, more direct and more willing to play from second balls than the possession-heavy Napoli of the Spalletti era.',
    pressNote: 'Mid-block, compact between the lines, springing when the opponent overcommits.',
    transitionNote: 'Counterattacking is a deliberate plan rather than a fallback.',
    distinctive: 'Serie A rewards defensive organisation more than most leagues. Napoli under Allegri is a useful study in how a top squad wins without dominating possession.',
  },
  {
    id: 'dortmund',
    name: 'Borussia Dortmund',
    league: 'Bundesliga, Germany',
    coach: 'Niko Kovač (since 2025)',
    identity: 'Historically the archetype of vertical, high-speed attacking football and one of the best development clubs in Europe.',
    formations: ['4-2-3-1', '3-4-2-1'],
    buildupNote: 'Direct, avoiding elaborate patterns near their own goal.',
    pressNote: 'Structured mid-block rather than the permanent high press of the Klopp era.',
    transitionNote: 'Still the primary route to goal — quick and vertical, using pace in wide areas.',
    distinctive: 'A club in tension between its heavy-metal attacking identity and a more pragmatic present. Worth studying as an example of how a club culture and a coach’s principles negotiate with each other.',
  },
  {
    id: 'union',
    name: 'Philadelphia Union',
    league: 'Major League Soccer, USA',
    coach: 'Ryan Richter (interim, since May 2026, following Bradley Carnell’s departure)',
    identity: 'Built on an academy pipeline that produces first-team players and transfer value — the most relevant model in this library for youth coaching, because the club’s identity is the development system itself.',
    formations: ['4-4-2 diamond', '4-2-2-2'],
    buildupNote: 'Direct and vertical, prioritising getting the ball forward into pressing situations high up the pitch.',
    pressNote: 'Aggressive high pressing has been the club’s tactical signature — winning the ball in the opponent half rather than building elaborately from their own.',
    transitionNote: 'Attacks are frequently launched from a high turnover rather than from settled possession.',
    distinctive: 'The Union prove that a clear, simple, relentlessly coached identity beats a complicated one on a smaller budget. That is directly transferable to an 8- and 9-year-old travel side: pick two or three principles and coach them until they are automatic.',
  },
];

export const GLOSSARY = [
  { term: 'Positional play', def: 'Occupying defined zones of the pitch by rule, so that passing lanes and numerical advantages exist by geometry rather than improvisation.' },
  { term: 'Inverted full-back', def: 'A full-back who moves inside into central midfield in possession instead of overlapping down the touchline, creating a central overload.' },
  { term: 'Counter-press', def: 'Pressing immediately after losing the ball, while the opponent is still disorganised, rather than dropping back into shape.' },
  { term: 'Mid-block', def: 'A defensive shape set up around the halfway line — conceding territory in your own half deliberately, staying compact, and springing when the opponent commits.' },
  { term: 'Low block', def: 'A compact defensive shape close to your own goal, sacrificing territory almost entirely to remove the space behind the defence.' },
  { term: 'Rest defence', def: 'The players positioned behind the ball while you attack, whose job is to stop the counterattack before it starts.' },
  { term: 'Third man', def: 'A combination where player A passes to B, and B releases C — who was free the whole time because the defence was watching the first pass.' },
  { term: 'Breaking lines', def: 'A pass that eliminates one or more opponents by travelling past their line of defence, rather than sideways in front of it.' },
  { term: 'Overload', def: 'Deliberately creating more attackers than defenders in one area of the pitch, usually to force a defender to leave someone free.' },
  { term: 'Cover shadow', def: 'The area behind a pressing player that he blocks with his body — an opponent standing in it cannot be passed to.' },
  { term: 'Half-space', def: 'The vertical channel between the centre of the pitch and the touchline. Dangerous because a player there can see and reach both the middle and the wing.' },
  { term: 'Cutback', def: 'A ball pulled backwards from near the goal line to an attacker arriving at the edge of the six-yard box, running toward goal while defenders face the wrong way.' },
];

/* ============================ Rendering ============================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function sheet(title, html) {
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = html;
  $('#sheet').hidden = false;
  document.body.classList.add('sheet-open');
}

function show(name) {
  $$('.screen').forEach((s) => { s.hidden = s.dataset.screen !== name; });
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  window.scrollTo({ top: 0 });
}

function coachDetail(c) {
  const list = (items) => `<ul class="lib-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
  return `
    <p class="sheet-lead">${esc(c.role)}</p>
    <p class="lib-dated">${esc(c.since)}</p>
    <h4>Tactical philosophy</h4><p>${esc(c.philosophy)}</p>
    <h4>Buildup</h4><p>${esc(c.buildup)}</p>
    <h4>Pressing</h4><p>${esc(c.pressing)}</p>
    <h4>Transition</h4><p>${esc(c.transition)}</p>
    <h4>Preferred shapes</h4>${list(c.formations)}
    <h4>Strengths</h4>${list(c.strengths)}
    <h4>Limitations</h4>${list(c.limitations)}
    <h4>Also managed</h4><p>${esc(c.previously)}</p>
    <h4>Try this next</h4><p>${esc(c.lesson)}</p>
    <p class="sheet-foot">Employment facts verified ${VERIFIED}. Managerial appointments change frequently — treat anything dated as a snapshot, not a permanent truth.</p>`;
}

function clubDetail(c) {
  return `
    <p class="sheet-lead">${esc(c.league)}</p>
    <p class="lib-dated">Head coach: ${esc(c.coach)} · verified ${VERIFIED}</p>
    <h4>Identity</h4><p>${esc(c.identity)}</p>
    <h4>Common shapes</h4><p>${c.formations.map(esc).join(' · ')}</p>
    <h4>Buildup</h4><p>${esc(c.buildupNote)}</p>
    <h4>Pressing and block</h4><p>${esc(c.pressNote)}</p>
    <h4>Transitions</h4><p>${esc(c.transitionNote)}</p>
    <h4>What makes them tactically distinctive</h4><p>${esc(c.distinctive)}</p>
    <p class="sheet-foot">Tactical tendencies describe durable patterns of play, not current form, squad or results.</p>`;
}

function render(host) {
  host.innerHTML = `
    <div class="card intro-card">
      <h2>Tactics Library</h2>
      <p class="muted">How elite coaches and clubs actually set their teams up — what they do in buildup, how they press, what happens the moment the ball changes hands, and where each approach is vulnerable. Tap any card for the full profile.</p>
    </div>

    <section class="unit">
      <h3>Coaches</h3>
      <p class="unit-blurb">Six profiles. Each one links to the scenario in this app that trains the same idea.</p>
      <div class="lessons">
        ${COACHES.map((c) => `
          <button class="lesson lib-card" data-coach="${c.id}">
            <span class="lesson-kind">${esc(c.role)}</span>
            <span class="lesson-title">${esc(c.name)}</span>
            <span class="lesson-go">Open →</span>
          </button>`).join('')}
      </div>
    </section>

    <section class="unit">
      <h3>Clubs</h3>
      <p class="unit-blurb">The four sides you follow, read tactically rather than as a fan.</p>
      <div class="lessons">
        ${CLUBS.map((c) => `
          <button class="lesson lib-card" data-club="${c.id}">
            <span class="lesson-kind">${esc(c.league)}</span>
            <span class="lesson-title">${esc(c.name)}</span>
            <span class="lesson-go">Open →</span>
          </button>`).join('')}
      </div>
    </section>

    <section class="unit">
      <h3>Glossary</h3>
      <p class="unit-blurb">Every term used anywhere in this app, in plain language.</p>
      <div class="youth">
        ${GLOSSARY.map((g) => `
          <details class="youth-card">
            <summary>${esc(g.term)}</summary>
            <p>${esc(g.def)}</p>
          </details>`).join('')}
      </div>
    </section>

    <div class="card">
      <p class="muted small">Employment facts in this library were verified on ${VERIFIED}. Tactical descriptions are original explanations of well-documented patterns of play. Nothing here asserts current squads, results or table positions, and no quotes are attributed to anyone.</p>
    </div>
    <div class="spacer"></div>`;

  $$('.lib-card', host).forEach((b) => {
    b.onclick = () => {
      if (b.dataset.coach) {
        const c = COACHES.find((x) => x.id === b.dataset.coach);
        sheet(c.name, coachDetail(c));
      } else {
        const c = CLUBS.find((x) => x.id === b.dataset.club);
        sheet(c.name, clubDetail(c));
      }
    };
  });
}

/** Inject the tab and screen so app.js needs no knowledge of this module. */
function install() {
  if ($('[data-screen="library"]')) return;

  const screen = document.createElement('section');
  screen.className = 'screen';
  screen.dataset.screen = 'library';
  screen.hidden = true;
  $('main').appendChild(screen);
  render(screen);

  const tabbar = $('.tabbar');
  const tab = document.createElement('button');
  tab.className = 'tab';
  tab.dataset.tab = 'library';
  tab.innerHTML = '<span class="tab-ico">◫</span>Library';
  tabbar.appendChild(tab);
  tabbar.classList.add('tabbar-4');

  // Every tab needs to know about the new screen, including the ones
  // app.js already wired up before this module loaded.
  $$('.tab').forEach((t) => { t.addEventListener('click', () => show(t.dataset.tab)); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', install);
} else {
  install();
}
