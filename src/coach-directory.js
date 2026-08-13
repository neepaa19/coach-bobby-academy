/*
 * Coach Bobby Academy — Coach Directory
 * ------------------------------------------------------------------
 * Who is actually in charge, league by league, for the 2026/27 season.
 *
 * ACCURACY RULES:
 *  - Every league carries the date it was checked and the source used.
 *  - Entries marked `unverified` were NOT confirmed for 2026/27.
 *    They are shown as unknown rather than guessed. An invented name is
 *    worse than an admitted gap.
 *  - This is a directory, not a tactical profile. The deep profiles with
 *    philosophy, pressing and buildup live in library.js.
 *
 * Self-registering: appends a section to the Library screen, so neither
 * app.js nor library.js needs to know it exists.
 * ------------------------------------------------------------------
 */

const CHECKED = '13 August 2026';

export const LEAGUES = [
  {
    id: 'epl',
    name: 'Premier League',
    country: 'England',
    tier: 1,
    source: 'premierleague.com 2026/27 manager line-up, cross-checked against a second published list',
    confidence: 'Cross-checked against two independent sources',
    clubs: [
      ['Arsenal', 'Mikel Arteta'],
      ['Aston Villa', 'Unai Emery'],
      ['AFC Bournemouth', 'Marco Rose'],
      ['Brentford', 'Keith Andrews'],
      ['Brighton & Hove Albion', 'Fabian Hürzeler'],
      ['Chelsea', 'Xabi Alonso'],
      ['Coventry City', 'Frank Lampard'],
      ['Crystal Palace', 'Pierre Sage'],
      ['Everton', 'David Moyes'],
      ['Fulham', 'Álvaro Arbeloa'],
      ['Hull City', 'Sergej Jakirović'],
      ['Ipswich Town', 'Gary O’Neil'],
      ['Leeds United', 'Daniel Farke'],
      ['Liverpool', 'Andoni Iraola'],
      ['Manchester City', 'Enzo Maresca'],
      ['Manchester United', 'Michael Carrick'],
      ['Newcastle United', 'Matthias Jaissle'],
      ['Nottingham Forest', 'Oliver Glasner'],
      ['Sunderland', 'Régis Le Bris'],
      ['Tottenham Hotspur', 'Roberto De Zerbi'],
    ],
  },
  {
    id: 'laliga',
    name: 'LaLiga',
    country: 'Spain',
    tier: 1,
    source: 'FIFPlay LaLiga 2026/27 head coaches; Real Madrid confirmed separately via Wikipedia club season page',
    confidence: 'Single league source; the highest-profile entry double-checked',
    clubs: [
      ['Deportivo Alavés', 'Quique Sánchez Flores'],
      ['Athletic Club', 'Edin Terzić'],
      ['Atlético Madrid', 'Diego Simeone'],
      ['FC Barcelona', 'Hansi Flick'],
      ['Real Betis', 'Manuel Pellegrini'],
      ['Celta Vigo', 'Claudio Giráldez'],
      ['Deportivo La Coruña', 'Antonio Hidalgo'],
      ['Elche CF', 'Eder Sarabia'],
      ['RCD Espanyol', 'Manolo González'],
      ['Getafe CF', 'José Bordalás'],
      ['Levante UD', 'Luís Castro'],
      ['Málaga CF', 'Juanfran Funes'],
      ['CA Osasuna', 'Luis Miguel Ramis'],
      ['Racing Santander', 'José Alberto López'],
      ['Rayo Vallecano', 'Beñat San José'],
      ['Real Madrid', 'José Mourinho'],
      ['Real Sociedad', 'Pellegrino Matarazzo'],
      ['Sevilla FC', 'Luis García Plaza'],
      ['Valencia CF', 'Carlos Corberán'],
      ['Villarreal CF', 'Íñigo Pérez'],
    ],
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    tier: 1,
    source: 'FIFPlay Bundesliga 2026/27 head coaches',
    confidence: 'Single league source',
    clubs: [
      ['FC Augsburg', 'Manuel Baum'],
      ['Bayer Leverkusen', 'Kasper Hjulmand'],
      ['FC Bayern München', 'Vincent Kompany'],
      ['Borussia Dortmund', 'Niko Kovač'],
      ['Borussia Mönchengladbach', 'Eugen Polanski'],
      ['SV Elversberg', 'Horst Steffen'],
      ['Eintracht Frankfurt', 'Albert Riera'],
      ['SC Freiburg', 'Julian Schuster'],
      ['Hamburger SV', 'Merlin Polzin'],
      ['TSG Hoffenheim', 'Christian Ilzer'],
      ['1. FC Köln', 'René Wagner'],
      ['RB Leipzig', 'Ole Werner'],
      ['1. FSV Mainz 05', 'Urs Fischer'],
      ['SC Paderborn 07', 'Lukas Kwasniok'],
      ['FC Schalke 04', 'Miron Muslić'],
      ['VfB Stuttgart', 'Sebastian Hoeneß'],
      ['1. FC Union Berlin', 'Marie-Louise Eta'],
      ['SV Werder Bremen', 'Daniel Thioune'],
    ],
  },
  {
    id: 'seriea',
    name: 'Serie A',
    country: 'Italy',
    tier: 1,
    source: 'Wikipedia 2026/27 Serie A managerial changes table; Napoli confirmed separately via ESPN',
    confidence: 'Only clubs that made a confirmed 2026/27 appointment are listed. The rest are open — see note.',
    note: 'Serie A had an unusually turbulent 2025/26 with several in-season changes, so carrying last season’s names forward would be guessing. Only confirmed 2026/27 appointments appear here; the remaining clubs are marked unverified until I can source them properly.',
    clubs: [
      ['AC Milan', 'Rúben Amorim'],
      ['Atalanta', 'Maurizio Sarri'],
      ['Bologna', 'Domenico Tedesco'],
      ['Fiorentina', 'Fabio Grosso'],
      ['Lazio', 'Gennaro Gattuso'],
      ['AC Monza', 'Ivan Juric'],
      ['Napoli', 'Massimiliano Allegri'],
      ['Sassuolo', 'Alberto Aquilani'],
      ['Torino', 'Davide Abate'],
      ['Cagliari', null],
      ['Como', null],
      ['Frosinone', null],
      ['Genoa', null],
      ['Inter Milan', null],
      ['Juventus', null],
      ['Lecce', null],
      ['Parma', null],
      ['AS Roma', null],
      ['Udinese', null],
      ['Venezia', null],
    ],
  },
  {
    id: 'ligue1',
    name: 'Ligue 1',
    country: 'France',
    tier: 1,
    source: 'ligue1.com report on the 2026 summer coaching changes',
    confidence: 'Confirmed new appointments only. A record twelve clubs changed coach, so unlisted clubs are genuinely uncertain.',
    note: 'Ligue 1 set a 21st-century record with twelve managerial changes in one summer, which is exactly why the clubs I have not sourced are left blank rather than assumed.',
    clubs: [
      ['Angers SCO', 'Alexandre Dujeux'],
      ['AJ Auxerre', 'Will Still'],
      ['RC Lens', 'Dino Toppmöller'],
      ['LOSC Lille', 'Davide Ancelotti'],
      ['FC Lorient', 'Olivier Pantaloni'],
      ['AS Monaco', 'Filipe Luís'],
      ['OGC Nice', 'Claude Puel'],
      ['Paris FC', 'Liam Rosenior'],
      ['RC Strasbourg', 'Hugo Oliveira'],
      ['Toulouse FC', 'Jacob Neestrup Askou'],
      ['Olympique de Marseille', null],
      ['Paris Saint-Germain', null],
      ['Olympique Lyonnais', null],
      ['Stade Rennais', null],
      ['Stade Brestois', null],
      ['FC Nantes', null],
      ['Le Havre AC', null],
      ['Metz', null],
    ],
  },
  {
    id: 'mls',
    name: 'Major League Soccer',
    country: 'USA & Canada',
    tier: 1,
    source: 'MLSSoccer.com and Wikipedia 2026 Philadelphia Union season',
    confidence: 'Only the club you follow is verified so far',
    note: 'MLS runs a spring-to-autumn calendar, so 2026 is mid-season and in-season changes are common. The rest of the league is queued.',
    clubs: [
      ['Philadelphia Union', 'Ryan Richter (interim)'],
    ],
  },
];

/* ============================ Rendering ============================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function counts() {
  let known = 0, unknown = 0;
  for (const l of LEAGUES) for (const [, coach] of l.clubs) coach ? known++ : unknown++;
  return { known, unknown };
}

function leagueDetail(l) {
  const rows = l.clubs.map(([club, coach]) => `
    <li class="dir-row${coach ? '' : ' dir-unknown'}">
      <span class="dir-club">${esc(club)}</span>
      <span class="dir-coach">${coach ? esc(coach) : 'Not verified'}</span>
    </li>`).join('');
  return `
    <p class="sheet-lead">${esc(l.country)} · tier ${l.tier}</p>
    <p class="lib-dated">Checked ${CHECKED} · ${esc(l.confidence)}</p>
    ${l.note ? `<p class="dir-note">${esc(l.note)}</p>` : ''}
    <ul class="dir-list">${rows}</ul>
    <p class="sheet-foot">Source: ${esc(l.source)}. Managerial appointments change constantly — treat every name here as a snapshot taken on ${CHECKED}, not a permanent fact.</p>`;
}

function render(host) {
  const c = counts();
  const section = document.createElement('section');
  section.className = 'unit';
  section.innerHTML = `
    <h3>Coach directory</h3>
    <p class="unit-blurb">Who is in charge where, for the 2026/27 season. ${c.known} clubs verified, ${c.unknown} still open and honestly marked as such. Checked ${CHECKED}.</p>
    <div class="lessons">
      ${LEAGUES.map((l) => {
        const known = l.clubs.filter(([, coach]) => coach).length;
        return `
        <button class="lesson lib-card" data-league="${l.id}">
          <span class="lesson-kind">${esc(l.country)} · ${known}/${l.clubs.length} verified</span>
          <span class="lesson-title">${esc(l.name)}</span>
          <span class="lesson-go">Open →</span>
        </button>`;
      }).join('')}
    </div>
    <p class="dir-foot">Leagues still to research: Portugal, Netherlands, Belgium, Scotland, Turkey, Austria, Switzerland, Greece, Denmark, plus English tiers 2 and 3 and the rest of MLS. This list grows with each session rather than pretending to be complete.</p>`;

  host.appendChild(section);

  $$('.lib-card[data-league]', section).forEach((b) => {
    b.onclick = () => {
      const l = LEAGUES.find((x) => x.id === b.dataset.league);
      $('#sheetTitle').textContent = `${l.name} — ${l.country}`;
      $('#sheetBody').innerHTML = leagueDetail(l);
      $('#sheet').hidden = false;
      document.body.classList.add('sheet-open');
    };
  });
}

function install() {
  const lib = $('[data-screen="library"]');
  if (!lib || $('.lib-card[data-league]')) return false;
  render(lib);
  return true;
}

function boot() {
  // library.js builds its screen on DOMContentLoaded too; retry briefly if we win the race.
  if (install()) return;
  let tries = 0;
  const t = setInterval(() => {
    if (install() || ++tries > 40) clearInterval(t);
  }, 50);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
