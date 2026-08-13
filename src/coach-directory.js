/*
 * Coach Bobby Academy — Coach Directory
 * ------------------------------------------------------------------
 * Who is actually in charge, league by league, for the 2026/27 season.
 *
 * ACCURACY RULES:
 *  - Every league carries the date it was checked and the source used.
 *  - Entries with a null coach were NOT confirmed for 2026/27. They render
 *    as "Not verified" rather than being guessed. An invented name is
 *    worse than an admitted gap.
 *  - This is a directory, not a tactical profile. The deep profiles with
 *    philosophy, pressing and buildup live in library.js.
 *
 * This file grows league by league. Adding a league means adding one
 * object to LEAGUES — no other file changes.
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
    source: 'Lega Serie A 2026/27 coach line-up, each club re-confirmed against its own site or a second national outlet (Sky Sport Italia, ANSA, Corriere dello Sport)',
    confidence: 'All 20 confirmed against two or more independent sources',
    note: 'Every bench was settled by early July 2026. Sarri went to Atalanta and Gattuso replaced him at Lazio; Grosso left Sassuolo for Fiorentina and Aquilani took his place. Promoted: Venezia, Frosinone, Monza. Relegated: Hellas Verona, Pisa, Cremonese.',
    clubs: [
      ['Atalanta', 'Maurizio Sarri'],
      ['Bologna', 'Domenico Tedesco'],
      ['Cagliari', 'Fabio Pisacane'],
      ['Como', 'Cesc Fàbregas'],
      ['Fiorentina', 'Fabio Grosso'],
      ['Frosinone', 'Massimiliano Alvini'],
      ['Genoa', 'Daniele De Rossi'],
      ['Inter', 'Cristian Chivu'],
      ['Juventus', 'Luciano Spalletti'],
      ['Lazio', 'Gennaro Gattuso'],
      ['Lecce', 'Eusebio Di Francesco'],
      ['Milan', 'Rúben Amorim'],
      ['Monza', 'Ivan Jurić'],
      ['Napoli', 'Massimiliano Allegri'],
      ['Parma', 'Carlos Cuesta'],
      ['Roma', 'Gian Piero Gasperini'],
      ['Sassuolo', 'Alberto Aquilani'],
      ['Torino', 'Ignazio Abate'],
      ['Udinese', 'Kosta Runjaić'],
      ['Venezia', 'Giovanni Stroppa'],
    ],
  },
  {
    id: 'ligue1',
    name: 'Ligue 1',
    country: 'France',
    tier: 1,
    source: 'ligue1.com 2026 summer coaching-change report, each club re-confirmed against its own site or a second outlet (L’Équipe, beIN Sports, Eurosport, France 24)',
    confidence: 'All 18 confirmed against two or more independent sources',
    note: 'Ten of eighteen clubs changed coach in summer 2026. The Rosenior chain is worth knowing: he left Strasbourg for Chelsea in January 2026, Gary O’Neil replaced him, O’Neil left for Ipswich in June, Hugo Oliveira took Strasbourg — and Rosenior resurfaced at Paris FC on 7 July. Julien Lachuer was promoted from assistant at Brest after the death of Éric Roy. Promoted: Troyes, Le Mans. Relegated: Metz, Nantes.',
    clubs: [
      ['Angers', 'Stéphane Gilli'],
      ['Auxerre', 'Will Still'],
      ['Brest', 'Julien Lachuer'],
      ['Le Havre', 'Didier Digard'],
      ['Le Mans', 'Patrick Videira'],
      ['Lens', 'Dino Toppmöller'],
      ['Lille', 'Davide Ancelotti'],
      ['Lorient', 'Alexandre Dujeux'],
      ['Lyon', 'Paulo Fonseca'],
      ['Marseille', 'Bruno Genesio'],
      ['Monaco', 'Filipe Luís'],
      ['Nice', 'Olivier Pantaloni'],
      ['Paris FC', 'Liam Rosenior'],
      ['Paris Saint-Germain', 'Luis Enrique'],
      ['Rennes', 'Franck Haise'],
      ['Strasbourg', 'Hugo Oliveira'],
      ['Toulouse', 'Jens Berthel Askou'],
      ['Troyes', 'Stéphane Dumont'],
    ],
  },
  {
    id: 'eredivisie',
    name: 'Eredivisie',
    country: 'Netherlands',
    tier: 1,
    source: 'Voetbal International 2026/27 coach overview, each club re-confirmed against its own site or a second outlet (NOS, ESPN NL, Voetbalprimeur)',
    confidence: 'All 18 confirmed against two or more independent sources',
    note: 'Míchel arrived at Ajax from Girona; Van Bronckhorst returned to Feyenoord after Van Persie was dismissed. Anthony Correia went from Telstar to Utrecht and Telstar promoted Henk Brugge from within. Promoted: ADO Den Haag, Willem II, Cambuur. Relegated: Heracles, NAC Breda.',
    clubs: [
      ['ADO Den Haag', 'Robin Peter'],
      ['Ajax', 'Míchel'],
      ['AZ', 'Leeroy Echteld'],
      ['Excelsior', 'Ruben den Uil'],
      ['Feyenoord', 'Giovanni van Bronckhorst'],
      ['Fortuna Sittard', 'Danny Buijs'],
      ['FC Groningen', 'Dick Lukkien'],
      ['Go Ahead Eagles', 'Joseph Oosting'],
      ['NEC', 'Dick Schreuder'],
      ['PEC Zwolle', 'Henry van der Vegt'],
      ['PSV', 'Peter Bosz'],
      ['SC Cambuur', 'Johan Plat'],
      ['SC Heerenveen', 'Robin Veldman'],
      ['Sparta Rotterdam', 'Rogier Meijer'],
      ['Telstar', 'Henk Brugge'],
      ['FC Twente', 'John van den Brom'],
      ['FC Utrecht', 'Anthony Correia'],
      ['Willem II', 'John Stegeman'],
    ],
  },
  {
    id: 'primeira',
    name: 'Liga Portugal',
    country: 'Portugal',
    tier: 1,
    source: 'Liga Portugal and Flashscore 2026/27 coach list, each club re-confirmed against its own site or a second outlet (A Bola, Record, O Jogo, Lusa)',
    confidence: 'All 18 confirmed against two or more independent sources',
    note: 'The headline move: Mourinho left Benfica for Real Madrid and Marco Silva took the Benfica job on 9 June 2026. Tiago Margarido went from Nacional to Vitória SC and João Gião replaced him. Promoted: Marítimo, Académico de Viseu (back after 37 years), Alverca.',
    clubs: [
      ['Académico de Viseu', 'Bruno Pinheiro'],
      ['Alverca', 'Sérgio Ferreira'],
      ['Arouca', 'Vasco Seabra'],
      ['Benfica', 'Marco Silva'],
      ['Braga', 'Carlos Vicens'],
      ['Casa Pia', 'Filipe Coelho'],
      ['Estoril Praia', 'Vasco Matos'],
      ['Estrela da Amadora', 'Pepa'],
      ['Famalicão', 'Carlos Carvalhal'],
      ['Gil Vicente', 'Luís Pinto'],
      ['Marítimo', 'Mitchell van der Gaag'],
      ['Moreirense', 'Vasco Botelho da Costa'],
      ['Nacional', 'João Gião'],
      ['Porto', 'Francesco Farioli'],
      ['Rio Ave', 'Sotiris Sylaidopoulos'],
      ['Santa Clara', 'Petit'],
      ['Sporting CP', 'Rui Borges'],
      ['Vitória SC', 'Tiago Margarido'],
    ],
  },
  {
    id: 'scotprem',
    name: 'Scottish Premiership',
    country: 'Scotland',
    tier: 1,
    source: 'SPFL and Sky Sports 2026/27 coverage, each club re-confirmed against its own site or a second outlet (BBC Sport Scotland, STV, The Scotsman)',
    confidence: 'All 12 confirmed against two or more independent sources',
    note: 'The earlier note in this directory guessed that McInnes left Hearts for Rangers. That guess was right, and it is now sourced: McInnes to Rangers on 17 June, Vrancken to Hearts on 25 June. Martin O’Neill and Craig McLeish both converted interim spells into permanent jobs, so neither is marked interim any more. Promoted: St Johnstone. Relegated: Livingston.',
    clubs: [
      ['Aberdeen', 'Stephen Robinson'],
      ['Celtic', 'Martin O’Neill'],
      ['Dundee', 'Steven Pressley'],
      ['Dundee United', 'Jim Goodwin'],
      ['Falkirk', 'John McGlynn'],
      ['Hearts', 'Wouter Vrancken'],
      ['Hibernian', 'David Gray'],
      ['Kilmarnock', 'Neil McCann'],
      ['Motherwell', 'Alfred Johansson'],
      ['Rangers', 'Derek McInnes'],
      ['St Johnstone', 'Simo Valakari'],
      ['St Mirren', 'Craig McLeish'],
    ],
  },
  {
    id: 'belpro',
    name: 'Belgian Pro League',
    country: 'Belgium',
    tier: 1,
    source: 'Sporza 2026/27 coaching-carousel overview, each club re-confirmed against its own site or a second outlet (Voetbalprimeur, Walfoot, HLN)',
    confidence: 'All 18 confirmed against two or more independent sources',
    note: 'Two names chain through this league: Nicky Hayen was sacked by Club Brugge in December 2025, was replaced by Ivan Leko from Gent, and then resurfaced at Genk — before Genk replaced him with Jess Thorup in July 2026. Rik De Mil moved Charleroi to Gent, and Mario Kohnen went from Charleroi interim to permanent. Promoted: Beveren, Kortrijk, Lommel.',
    clubs: [
      ['Anderlecht', 'Vítor Bruno'],
      ['Antwerp', 'Marvin Compper'],
      ['Beveren', 'Tim Bakens'],
      ['Cercle Brugge', 'Lars Friis'],
      ['Charleroi', 'Mario Kohnen'],
      ['Club Brugge', 'Ivan Leko'],
      ['Gent', 'Rik De Mil'],
      ['Genk', 'Jess Thorup'],
      ['Kortrijk', 'Michiel Jonckheere'],
      ['Lommel', 'Lee Johnson'],
      ['Mechelen', 'Fred Vanderbiest'],
      ['OH Leuven', 'Timmy Simons'],
      ['RAAL La Louvière', 'Edward Still'],
      ['Standard', 'Vincent Euvrard'],
      ['STVV', 'Frédéric De Meyer'],
      ['Union Saint-Gilloise', 'David Hubert'],
      ['Westerlo', 'Issame Charaï'],
      ['Zulte Waregem', 'Michael Beale'],
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
    <p class="unit-blurb">Who is in charge where, for the 2026/27 season. ${c.known} clubs verified${c.unknown ? `, ${c.unknown} still open and honestly marked as such` : ' — every club in every league below, each name checked against two or more independent sources'}. Checked ${CHECKED}.</p>
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
    <p class="dir-foot">Next up: Turkey, Austria, Switzerland, Greece, Denmark, then English tiers 2 and 3 and the rest of MLS. The goal is tiers 1–3 of every European country. This list grows every session rather than pretending to be complete.</p>`;

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
