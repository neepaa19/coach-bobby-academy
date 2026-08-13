# Coach Bobby Academy

An interactive soccer coaching education platform. It presents realistic 11v11 tactical
situations, lets you build a passing sequence, animates how the defence reacts to each
action, and then explains exactly why every decision scored the way it did.

Live: **https://coachbobby.netlify.app**

This is not a quiz and not a tactics board. The goal is measurable tactical reasoning:
every percentage the app shows is produced by a published, deterministic scoring model
that you can read, check, and argue with.

---

## Project structure

```
index.html            Application shell and all markup
styles.css            Mobile-first styling (iPhone Safari is the primary target)
netlify.toml          Netlify configuration (static, published from the repo root)
src/
  engine.js           Decision engine — pass scoring, sequence grading, option ranking.
                      Pure functions. No DOM, no randomness, fully unit-tested.
  mastery.js          Mastery model — concepts, levels, evidence, badges, local storage.
  scenarios.js        Scenario data, curriculum, youth coaching translations. Data only.
  app.js              Tactical board rendering, animation, interaction, UI wiring.
  library.js          Tactics Library — coach and club profiles, glossary. Self-registering.
tests/
  engine.test.mjs     Engine unit tests (node, no dependencies). Run in CI on every push.
  smoke.mjs           Full-app browser test at iPhone viewport (Playwright)
docs/
  Scoring_Model.md    The published scoring model, in full
.github/workflows/
  tests.yml           Runs the engine tests on every push and pull request
```

The separation matters: **scenario data is never mixed with presentation logic, and all
judging lives in `engine.js`**. Adding a scenario means adding a data object, not writing
code.

`library.js` is self-registering — it injects its own tab and screen, so `app.js` has no
knowledge of it. New sections can be added the same way without touching the core.

---

## Running it locally

The app uses native ES modules, so it needs to be served over HTTP rather than opened
from the filesystem.

```bash
python3 -m http.server 8080
# then open http://127.0.0.1:8080
```

## Tests

```bash
node tests/engine.test.mjs        # engine unit tests, no dependencies
node tests/smoke.mjs              # full-app browser test (needs a local server + Playwright)
```

The engine tests protect the things that break silently: scoring direction, the rule that
a sequence is capped by its riskiest pass, determinism, and the fact that an empty
sequence is never graded as a success. They run automatically on every push via GitHub
Actions.

---

## Deployment

`main` is the production branch. Netlify is connected to this repository and deploys
automatically:

1. Commit to `main`
2. Netlify detects the commit
3. Netlify publishes the repository root as a static site
4. https://coachbobby.netlify.app serves the new version

There is no build step — `netlify.toml` publishes `.` directly. No ZIP uploads, no manual
deploys. Typical deploy time is under ten seconds.

---

## The scoring model

Every pass starts at a base confidence and is adjusted by named football factors:
receiver separation when the ball actually arrives, traffic in the passing lane, pressure
on the passer, pass distance and travel time, whether the defence can recover first,
territory gained, opponents eliminated, pass angle, and whether the chosen pass type fits
the picture.

Full weights and the reasoning behind them are in [`docs/Scoring_Model.md`](docs/Scoring_Model.md),
and the app itself exposes the whole model inside Why Mode.

**These are tactical estimates, not measured probabilities.** The engine is a heuristic
with consistent, documented rules — it is deliberately explainable rather than
statistically validated, and the app says so wherever a percentage appears.

Speeds are displayed in mph, with a km/h toggle inside Why Mode. The engine calculates in
yards per second because the pitch is measured in yards.

---

## What exists today

- Interactive 11v11 tactical board, both teams visible, position labels bound to their
  markers so they can never drift apart
- Tap a teammate to pass; hold a teammate to preview separation, distance to goal, lane
  traffic and the ranked pass types before committing
- Multi-pass sequences with smooth, interpolated defensive shifting and attacking support
  movement after every action
- A persistent, unmistakable **Finish Sequence** control; nothing is evaluated and no
  answer is revealed until you submit
- Post-submission analysis: verdict, sequence rating, per-pass breakdown
- **Why Mode** — every scoring factor in plain language, plus the full model
- Primary / secondary / safest options shown only after submission
- Mastery model across six domains and 33 concepts, with evidence for every change
- Soccer IQ profile with levels, recommendations, badges and badge explanations
- Structured curriculum with scenario lessons, readings and youth coaching translations
- **Tactics Library** — six coach profiles, four club profiles, twelve-term glossary
- Progress stored on the device (localStorage). There is no account and no server, and
  the app does not claim otherwise.

## Roadmap

1. **Cloud profile sync** — Netlify Blobs so mastery data survives a cleared browser or a
   new device. Code belongs in Git; user data does not.
2. **Scenario editor** — an authoring tool that emits scenario data objects, so building a
   real curriculum does not mean hand-typing 22 coordinates per situation
3. **Set-piece module** — attacking and defending corners, free kicks, throw-ins, and a
   custom routine designer with delivery types (driven, chipped, curled, near/far post)
4. **Adaptive scenario selection** — serve the scenarios that target the weakest concepts
5. **Deeper curriculum** — more scenarios per unit, spaced review of weak concepts
6. **Draw-to-pass** input as an alternative to tap-to-pass, if it proves reliable on touch

## Accuracy

Tactical claims about real teams and coaches are time-sensitive. Every employment fact in
the Tactics Library carries the date it was verified; tactical descriptions are original
prose about durable, well-documented patterns of play. Nothing asserts a current squad,
result or table position, and no quotes are attributed to anyone.

Library facts verified 13 August 2026 against:

- Premier League — 2026/27 manager line-up
- ESPN — Maresca to Manchester City; Allegri to Napoli
- FIFPlay — Bundesliga 2026/27 head coaches
- MLSSoccer — Philadelphia Union head coach change, May 2026
- Wikipedia — 2026 Philadelphia Union season
