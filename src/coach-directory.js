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
    source: 'premierleague.com manager list plus Sky Sports club pages and, where needed, the club’s own site',
    confidence: 'All 20 re-verified against two or more independent sources',
    note: 'Re-checked from scratch on 13 August 2026 and every entry held. Three are worth a footnote: Newcastle was missing from the official Premier League managers page, so Jaissle rests on Sky Sports plus the club’s own site; Brentford and Sunderland could only be corroborated by premierleague.com plus Wikipedia. Promoted: Coventry, Hull, Ipswich — Leeds came up in 2025, not 2026.',
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
    source: 'Club official staff pages plus football-espana.net and worldfootball.net, cross-checked against the 2026/27 LaLiga composition',
    confidence: 'All 20 re-verified against two or more independent sources',
    note: 'Re-checked from scratch on 13 August 2026. One entry was wrong: Eder Sarabia resigned from Elche on 27 May 2026 and Martín Anselmi replaced him. Mourinho took the Real Madrid job on 11 June after Arbeloa, which cross-checks against Portugal, where Marco Silva replaced him at Benfica. Íñigo Pérez moved from Rayo to Villarreal, and Beñat San José took his place at Rayo.',
    clubs: [
      ['Deportivo Alavés', 'Quique Sánchez Flores'],
      ['Athletic Club', 'Edin Terzić'],
      ['Atlético Madrid', 'Diego Simeone'],
      ['FC Barcelona', 'Hansi Flick'],
      ['Real Betis', 'Manuel Pellegrini'],
      ['Celta Vigo', 'Claudio Giráldez'],
      ['Deportivo La Coruña', 'Antonio Hidalgo'],
      ['Elche CF', 'Martín Anselmi'],
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
    source: 'bundesliga.com club pages and fussballdaten.de, with a third source on every contested entry',
    confidence: 'All 18 re-verified against two or more independent sources',
    note: 'This league was re-checked from scratch on 13 August 2026 and six entries were wrong, so it is worth saying which: Leverkusen, Elversberg, Frankfurt, Leipzig, Paderborn and Union Berlin. Two of the corrections cross-check against other leagues in this directory — Carles Martínez Novell left Toulouse for Leverkusen, and Mauro Lustrinelli left Thun for Union Berlin. A warning for anyone re-checking: English Wikipedia’s individual club pages were stale, while its season page was current.',
    clubs: [
      ['FC Augsburg', 'Manuel Baum'],
      ['Bayer Leverkusen', 'Carles Martínez Novell'],
      ['FC Bayern München', 'Vincent Kompany'],
      ['Borussia Dortmund', 'Niko Kovač'],
      ['Borussia Mönchengladbach', 'Eugen Polanski'],
      ['SV Elversberg', 'Vincent Wagner'],
      ['Eintracht Frankfurt', 'Adi Hütter'],
      ['SC Freiburg', 'Julian Schuster'],
      ['Hamburger SV', 'Merlin Polzin'],
      ['TSG Hoffenheim', 'Christian Ilzer'],
      ['1. FC Köln', 'René Wagner'],
      ['RB Leipzig', 'Martín Demichelis'],
      ['1. FSV Mainz 05', 'Urs Fischer'],
      ['SC Paderborn 07', 'Ralf Kettemann'],
      ['FC Schalke 04', 'Miron Muslić'],
      ['VfB Stuttgart', 'Sebastian Hoeneß'],
      ['1. FC Union Berlin', 'Mauro Lustrinelli'],
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
    id: 'superlig',
    name: 'Süper Lig',
    country: 'Turkey',
    tier: 1,
    source: 'Anadolu Ajansı season dossier (10 Aug 2026) and Sporanki’s coach table (11 Aug 2026), cross-checked against club and Wikipedia records',
    confidence: 'All 18 confirmed against two or more independent sources; the four summer changes were verified individually',
    note: 'Only four benches changed. Two of them cross-check neatly against Serie A: Tedesco left Fenerbahçe for Bologna and Italiano left Bologna for Beşiktaş, so each move is corroborated from both ends. Amedspor and Çorum FK are in the top flight for the first time; Erzurumspor returns after five years. Relegated: Antalyaspor, Kayserispor, Fatih Karagümrük.',
    clubs: [
      ['Alanyaspor', 'João Pereira'],
      ['Amedspor', 'Besnik Hasi'],
      ['Başakşehir', 'Nuri Şahin'],
      ['Beşiktaş', 'Vincenzo Italiano'],
      ['Çaykur Rizespor', 'Recep Uçar'],
      ['Çorum FK', 'Uğur Uçar'],
      ['Erzurumspor FK', 'Serkan Özbalta'],
      ['Eyüpspor', 'Özhan Pulat'],
      ['Fenerbahçe', 'İsmail Kartal'],
      ['Galatasaray', 'Okan Buruk'],
      ['Gaziantep FK', 'Mirel Rădoi'],
      ['Gençlerbirliği', 'Metin Diyadin'],
      ['Göztepe', 'Stanimir Stoilov'],
      ['Kasımpaşa', 'Emre Belözoğlu'],
      ['Kocaelispor', 'Selçuk İnan'],
      ['Konyaspor', 'İlhan Palut'],
      ['Samsunspor', 'Thorsten Fink'],
      ['Trabzonspor', 'Fatih Tekke'],
    ],
  },
  {
    id: 'austria',
    name: 'Austrian Bundesliga',
    country: 'Austria',
    tier: 1,
    source: 'bundesliga.at official club coach pages, each re-confirmed against the club’s own site or weltfussball.at',
    confidence: 'All 12 confirmed against two or more independent sources',
    note: 'Danny Röhl took the Salzburg job in June 2026 after leaving Rangers — which is corroborated from the Scottish side, where Rangers replaced him with Derek McInnes. Fabio Ingolitsch went from Altach to Sturm Graz and won the title in his first half-season. Austria Lustenau came up from the 2. Liga.',
    clubs: [
      ['Austria Lustenau', 'Markus Mader'],
      ['Austria Wien', 'Stephan Helm'],
      ['Grazer AK', 'Ferdinand Feldhofer'],
      ['LASK', 'Dietmar Kühbauer'],
      ['Rapid Wien', 'Johannes Hoff Thorup'],
      ['Red Bull Salzburg', 'Danny Röhl'],
      ['SCR Altach', 'Ognjen Zarić'],
      ['Sturm Graz', 'Fabio Ingolitsch'],
      ['SV Ried', 'Mario Despotović'],
      ['TSV Hartberg', 'Markus Schopp'],
      ['Wolfsberger AC', 'Thomas Silberberger'],
      ['WSG Tirol', 'Philipp Semlic'],
    ],
  },
  {
    id: 'swiss',
    name: 'Swiss Super League',
    country: 'Switzerland',
    tier: 1,
    source: 'sfl.ch and club first-team pages, cross-checked against Blick, watson and fussballdaten.de',
    confidence: 'All 12 confirmed against two or more independent sources',
    note: 'Two traps caught here. Marvin Compper, who left for Antwerp in August 2026, was St. Gallen’s ASSISTANT — Enrico Maassen is still the head coach. And FC Luzern’s new coach is Udo Portmann, not Jörg: several outlets carried the wrong first name, and the club’s own announcement settles it. Thun are reigning champions after Mauro Lustrinelli left for Union Berlin. Promoted: Vaduz. Relegated: Winterthur.',
    clubs: [
      ['Basel', 'Stephan Lichtsteiner'],
      ['Grasshopper', 'Peter Zeidler'],
      ['Lausanne-Sport', 'Luka Elsner'],
      ['Lugano', 'Mattia Croci-Torti'],
      ['Luzern', 'Udo Portmann'],
      ['Servette', 'Jocelyn Gourvennec'],
      ['Sion', 'Didier Tholot'],
      ['St. Gallen', 'Enrico Maassen'],
      ['Thun', 'Gian-Luca Privitelli'],
      ['Vaduz', 'Marc Schneider'],
      ['Young Boys', 'Gerardo Seoane'],
      ['Zürich', 'Marcel Koller'],
    ],
  },
  {
    id: 'greece',
    name: 'Super League Greece',
    country: 'Greece',
    tier: 1,
    source: 'Club official sites and Gazzetta.gr, cross-checked against the 2026/27 league composition published by Super League Greece',
    confidence: 'All 14 confirmed against two or more independent sources',
    note: 'Jacob Neestrup went from FC Copenhagen to Panathinaikos in May 2026 — corroborated from the Danish side, where Bo Svensson replaced him. Walter Mazzarri dropping to newly promoted Iraklis is the eye-catching one. Olympiacos still have Mendilibar, though Greek media were reporting the club was weighing a change as of mid-August, so treat that entry as the most likely to move. Promoted: Iraklis, Kalamata. Relegated: AEL, Panserraikos.',
    clubs: [
      ['AEK Athens', 'Marko Nikolić'],
      ['Aris', 'Michalis Grigoriou'],
      ['Asteras Tripolis', 'Georgios Antonopoulos'],
      ['Atromitos', 'Dušan Kerkez'],
      ['Iraklis', 'Walter Mazzarri'],
      ['Kalamata', 'Panagiotis Christofileas'],
      ['Kifisia', 'Sebastián Leto'],
      ['Levadiakos', 'Ilias Charalambous'],
      ['OFI Crete', 'Christos Kontis'],
      ['Olympiacos', 'José Luis Mendilibar'],
      ['PAOK', 'Alessio Lisci'],
      ['Panathinaikos', 'Jacob Neestrup'],
      ['Panetolikos', 'Giannis Anastasiou'],
      ['Volos', 'Kostas Bratsos'],
    ],
  },
  {
    id: 'denmark',
    name: 'Danish Superliga',
    country: 'Denmark',
    tier: 1,
    source: 'Club first-team pages plus bold.dk and tipsbladet.dk, cross-checked for every summer change',
    confidence: 'All 12 confirmed against two or more independent sources',
    note: 'Lyngby genuinely run two head coaches — Bjelland and Jespersen are both listed as cheftræner on the club’s own staff page, so single-manager databases showing only one of them are incomplete rather than wrong. Thomas Thomasberg turns up at OB after Randers and Midtjylland, and Jakob Poulsen won the title at AGF a year after leaving Viborg. Promoted: Lyngby, AC Horsens.',
    clubs: [
      ['AC Horsens', 'Niki Zimling'],
      ['AGF', 'Jakob Poulsen'],
      ['Brøndby', 'Thomas Nørgaard'],
      ['FC Copenhagen', 'Bo Svensson'],
      ['FC Midtjylland', 'Mike Tullberg'],
      ['Lyngby', 'Andreas Bjelland & Mikkel Jespersen'],
      ['Nordsjælland', 'Jens Fønsskov Olsen'],
      ['OB', 'Thomas Thomasberg'],
      ['Randers FC', 'Rasmus Bertelsen'],
      ['Silkeborg', 'Morten Dahm Kjærgaard'],
      ['Sønderjyske', 'Fatah Abdirahman'],
      ['Viborg', 'Nickolai Lund'],
    ],
  },
  {
    id: 'championship',
    name: 'EFL Championship',
    country: 'England',
    tier: 2,
    source: 'Club official announcements plus an independent outlet for every entry (BBC Sport, Sky Sports, local press); composition cross-checked against Sky Sports and West Brom’s published line-up',
    confidence: 'All 24 confirmed against two or more independent sources',
    note: 'Lincoln City genuinely run two head coaches, Chris Cohen and Tom Shaw, appointed jointly on 29 May 2026 after Michael Skubala left for Bristol City. Worth a warning for anyone re-checking this league: Wikipedia’s Championship tables returned stale names — it had Watford under Cioffi and Bristol City under Rosenior, both wrong. Promoted from League One: Bolton, Cardiff, Lincoln. Relegated from the Premier League: Burnley, West Ham, Wolves. Down to League One: Leicester, Oxford, Sheffield Wednesday.',
    clubs: [
      ['Birmingham City', 'Chris Davies'],
      ['Blackburn Rovers', 'Tony Mowbray'],
      ['Bolton Wanderers', 'Steven Schumacher'],
      ['Bristol City', 'Michael Skubala'],
      ['Burnley', 'Nicky Hayen'],
      ['Cardiff City', 'Brian Barry-Murphy'],
      ['Charlton Athletic', 'Nathan Jones'],
      ['Derby County', 'John Eustace'],
      ['Lincoln City', 'Chris Cohen & Tom Shaw'],
      ['Middlesbrough', 'Kim Hellberg'],
      ['Millwall', 'Alex Neil'],
      ['Norwich City', 'Philippe Clement'],
      ['Portsmouth', 'John Mousinho'],
      ['Preston North End', 'Paul Heckingbottom'],
      ['Queens Park Rangers', 'Julien Stéphan'],
      ['Sheffield United', 'Chris Wilder'],
      ['Southampton', 'Tonda Eckert'],
      ['Stoke City', 'Mark Robins'],
      ['Swansea City', 'Vítor Matos'],
      ['Watford', 'Alessio Dionisi'],
      ['West Bromwich Albion', 'James Morrison'],
      ['West Ham United', 'Nuno Espírito Santo'],
      ['Wolverhampton Wanderers', 'César Peixoto'],
      ['Wrexham', 'Phil Parkinson'],
    ],
  },
  {
    id: 'eliteserien',
    name: 'Eliteserien',
    country: 'Norway',
    tier: 1,
    source: 'Club squad and staff pages plus VG, TV 2, Dagbladet and Fotmob',
    confidence: 'All 16 confirmed against two or more independent sources',
    note: 'This is a spring-to-autumn league, so August 2026 is mid-season and six clubs had already changed coach during it. The chain worth knowing: Alfred Johansson was sacked by Rosenborg in May and Freyr Alexandersson, sacked by Brann in June, took the Rosenborg job — while Brann hired Eirik Horneland from Saint-Étienne. Molde announced Sindre Tjelmeland in December but he could not start until 24 May. Kjetil Knutsen was linked with Strasbourg in July and stayed.',
    clubs: [
      ['Aalesund', 'Kjetil Rekdal'],
      ['Bodø/Glimt', 'Kjetil Knutsen'],
      ['Brann', 'Eirik Horneland'],
      ['Fredrikstad', 'Casper Røjkjær'],
      ['HamKam', 'Thomas Myhre'],
      ['KFUM Oslo', 'Jørgen Isnes'],
      ['Kristiansund', 'Amund Skiri'],
      ['Lillestrøm', 'Hans Erik Ødegaard'],
      ['Molde', 'Sindre Tjelmeland'],
      ['Rosenborg', 'Freyr Alexandersson'],
      ['Sandefjord', 'Andreas Tegström'],
      ['Sarpsborg 08', 'Even Sel'],
      ['Start', 'Azar Karadas'],
      ['Tromsø', 'Jørgen Vik'],
      ['Viking', 'Morten Jensen'],
      ['Vålerenga', 'Johannes Moesgaard'],
    ],
  },
  {
    id: 'allsvenskan',
    name: 'Allsvenskan',
    country: 'Sweden',
    tier: 1,
    source: 'Club official pages plus allsvenskan.se, Fotbollskanalen, SVT and GP',
    confidence: 'All 16 confirmed against two or more independent sources',
    note: 'Mid-season, and volatile: five clubs changed coach during 2026. Two entries are honestly provisional and labelled that way — Stuart Baxter at Halmstad was described by the club chairman as an interim solution, and Joachim Björklund was promoted from assistant at IFK Göteborg on a tillsvidare (until-further-notice) basis. Malmö hired Gaute Helstrup away from Bodø/Glimt’s staff, which cross-checks against Norway.',
    clubs: [
      ['AIK', 'José Riveiro'],
      ['BK Häcken', 'Jens Gustafsson'],
      ['Degerfors IF', 'Henok Goitom'],
      ['Djurgårdens IF', 'Jani Honkavaara'],
      ['GAIS', 'Fredrik Holmberg'],
      ['Halmstads BK', 'Stuart Baxter (interim)'],
      ['Hammarby IF', 'Henrik Rydström'],
      ['IF Brommapojkarna', 'Ulf Kristiansson'],
      ['IF Elfsborg', 'Björn Hamberg'],
      ['IFK Göteborg', 'Joachim Björklund'],
      ['IK Sirius', 'Andreas Engelmark'],
      ['Kalmar FF', 'Toni Koskela'],
      ['Malmö FF', 'Gaute Helstrup'],
      ['Mjällby AIF', 'Karl Marius Aksum'],
      ['Västerås SK', 'Alexander Rubin'],
      ['Örgryte IS', 'Andreas Holmberg'],
    ],
  },
  {
    id: 'ekstraklasa',
    name: 'Ekstraklasa',
    country: 'Poland',
    tier: 1,
    source: 'ekstraklasa.org club profiles and club official announcements, cross-checked against Sportowe Fakty, Interia and regional press',
    confidence: 'All 18 confirmed against two or more independent sources',
    note: 'Wieczysta Kraków are in the top flight for the first time in their history. Two coaches were already under public pressure in the opening weeks — Dawid Kroczek at Raków despite a contract to 2028, and Rafał Górak at GKS Katowice — so those are the entries most likely to change first.',
    clubs: [
      ['Cracovia', 'Bartosz Grzelak'],
      ['GKS Katowice', 'Rafał Górak'],
      ['Górnik Zabrze', 'Michal Gašparík'],
      ['Jagiellonia Białystok', 'Adrian Siemieniec'],
      ['Korona Kielce', 'Jacek Zieliński'],
      ['Lech Poznań', 'Niels Frederiksen'],
      ['Legia Warsaw', 'Marek Papszun'],
      ['Motor Lublin', 'Mariusz Misiura'],
      ['Piast Gliwice', 'Daniel Myśliwiec'],
      ['Pogoń Szczecin', 'Óscar García Junyent'],
      ['Radomiak Radom', 'Tomasz Kaczmarek'],
      ['Raków Częstochowa', 'Dawid Kroczek'],
      ['Śląsk Wrocław', 'Ante Šimundža'],
      ['Widzew Łódź', 'Aleksandar Vuković'],
      ['Wieczysta Kraków', 'Kazimierz Moskal'],
      ['Wisła Kraków', 'Mariusz Jop'],
      ['Wisła Płock', 'Adam Majewski'],
      ['Zagłębie Lubin', 'Leszek Ojrzyński'],
    ],
  },
  {
    id: 'chanceliga',
    name: 'Chance Liga',
    country: 'Czechia',
    tier: 1,
    source: 'chanceliga.cz club pages and club official announcements, cross-checked against iSport, iRozhlas and regional Deník titles',
    confidence: 'All 16 confirmed against two or more independent sources',
    note: 'The sixteenth place is unusual: Artis Brno took it after Karviná dropped its appeal over match-fixing sanctions and Táborsko declined promotion, with Dukla Prague relegated and weighing legal action. Martin Hyský was still Plzeň’s coach on 13 August only because the owner overruled a sporting director who wanted him gone, so treat that entry as fragile.',
    clubs: [
      ['Artis Brno', 'Roman Nádvorník'],
      ['Baník Ostrava', 'Roman Skuhravý'],
      ['Bohemians 1905', 'Jaroslav Veselý'],
      ['Hradec Králové', 'David Horejš'],
      ['Jablonec', 'Luboš Kozel'],
      ['Mladá Boleslav', 'Aleš Majer'],
      ['Pardubice', 'Jan Trousil'],
      ['Sigma Olomouc', 'Pavel Hapal'],
      ['Slavia Prague', 'Jindřich Trpišovský'],
      ['Slovácko', 'Jan Jelínek'],
      ['Slovan Liberec', 'Branislav Fodrek'],
      ['Sparta Prague', 'Brian Priske'],
      ['Teplice', 'Zdenko Frťala'],
      ['Viktoria Plzeň', 'Martin Hyský'],
      ['Zbrojovka Brno', 'Martin Svědík'],
      ['Zlín', 'Bronislav Červenka'],
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

function openLeague(l) {
  $('#sheetTitle').textContent = `${l.name} — ${l.country}`;
  $('#sheetBody').innerHTML = leagueDetail(l);
  $('#sheet').hidden = false;
  document.body.classList.add('sheet-open');
}

/* A flat index so one search box can answer "who coaches X" across every
   league at once, which is the question people actually arrive with. */
const INDEX = LEAGUES.flatMap((l) =>
  l.clubs.map(([club, coach]) => ({ club, coach, league: l }))
);

const norm = (s) => String(s)
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // fold accents: "Sanchez" finds "Sánchez"
  .replace(/[øØ]/g, 'o').replace(/[æÆ]/g, 'ae').replace(/[đĐ]/g, 'd').replace(/[łŁ]/g, 'l');

function searchRows(q) {
  const n = norm(q);
  if (n.length < 2) return null;
  return INDEX
    .filter((r) => norm(r.club).includes(n) || (r.coach && norm(r.coach).includes(n)))
    .slice(0, 40);
}

function cardFor(l) {
  const known = l.clubs.filter(([, coach]) => coach).length;
  return `
    <button class="lesson lib-card" data-league="${l.id}">
      <span class="lesson-kind">${esc(l.country)} · ${known}/${l.clubs.length} verified</span>
      <span class="lesson-title">${esc(l.name)}</span>
      <span class="lesson-go">Open →</span>
    </button>`;
}

function render(host) {
  const c = counts();
  const countries = new Set(LEAGUES.map((l) => l.country)).size;

  // Tier 1 first, then alphabetical by country — 20 cards in source order
  // is a pile; grouped and sorted it is a list you can scan.
  const tiers = [...new Set(LEAGUES.map((l) => l.tier))].sort((a, b) => a - b);
  const byTier = tiers.map((t) => ({
    tier: t,
    leagues: LEAGUES.filter((l) => l.tier === t)
      .slice()
      .sort((a, b) => a.country.localeCompare(b.country)),
  }));

  const section = document.createElement('section');
  section.className = 'unit';
  section.innerHTML = `
    <h3>Coach directory</h3>
    <p class="unit-blurb">Who is in charge where, for the 2026/27 season. ${c.known} clubs across ${LEAGUES.length} leagues and ${countries} countries${c.unknown ? `, with ${c.unknown} still open and honestly marked as such` : ' — every one checked against two or more independent sources'}. Checked ${CHECKED}.</p>

    <div class="dir-search">
      <input type="search" id="dirSearch" placeholder="Search a club or a coach" autocomplete="off"
             aria-label="Search the coach directory by club or coach name" />
    </div>
    <div id="dirResults" class="dir-results" hidden></div>

    <div id="dirBrowse">
      ${byTier.map((g) => `
        <p class="dir-tier">${g.tier === 1 ? 'Top flight' : `Tier ${g.tier}`}</p>
        <div class="lessons">${g.leagues.map(cardFor).join('')}</div>`).join('')}
    </div>

    <p class="dir-foot">Next up: English League One, Croatia, Serbia, Ukraine, Romania and Hungary, then the rest of MLS. The goal is tiers 1–3 of every European country. This list grows every session rather than pretending to be complete.</p>`;

  host.appendChild(section);

  $$('.lib-card[data-league]', section).forEach((b) => {
    b.onclick = () => openLeague(LEAGUES.find((x) => x.id === b.dataset.league));
  });

  const input = $('#dirSearch', section);
  const results = $('#dirResults', section);
  const browse = $('#dirBrowse', section);

  input.oninput = () => {
    const rows = searchRows(input.value);
    if (!rows) {
      results.hidden = true;
      browse.hidden = false;
      return;
    }
    browse.hidden = true;
    results.hidden = false;
    results.innerHTML = rows.length
      ? `<p class="dir-count">${rows.length}${rows.length === 40 ? '+' : ''} match${rows.length === 1 ? '' : 'es'}</p>
         <ul class="dir-list">${rows.map((r) => `
           <li class="dir-row dir-hit" data-league="${r.league.id}">
             <span class="dir-club">${esc(r.club)}<em>${esc(r.league.name)}</em></span>
             <span class="dir-coach">${r.coach ? esc(r.coach) : 'Not verified'}</span>
           </li>`).join('')}</ul>`
      : `<p class="empty">Nothing for “${esc(input.value)}”. This directory covers ${LEAGUES.length} leagues so far — if the club is in a league not yet listed, it genuinely is not here rather than misfiled.</p>`;
    $$('.dir-hit', results).forEach((row) => {
      row.onclick = () => openLeague(LEAGUES.find((x) => x.id === row.dataset.league));
    });
  };
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
