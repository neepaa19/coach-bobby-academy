# Version History

## v1
- Initial tactical prototype

## v2
- Improved layout
- Better lesson structure

## v3
- Coach IQ foundation
- Better scenario presentation

## v4
- Animated tactical lessons
- "Why" explanations

## v5
- Improved passing routes
- Better visual guidance

## v6
- Multi-step tactical lessons
- Sequence analysis
- Better passing logic

## v7
- Multi-pass tactical engine
- Defensive reactions
- Sequence history
- Undo & restart
- Target player objectives
- Branching tactical routes
- Initial GitHub documentation

---

## v8

Shipped August 2026 (the docs still listed it as planned).

### v8 scope

- Smooth defender animations
- Smooth attacking support movement
- Hold-to-preview pass analysis
- Automatic pass type selection
- Exact receiver separation
- Distance to goal
- Geometry analysis
- Coaching Library foundation
- Coach Repository foundation
- Player Repository foundation

---

## v9 — Movement and interface revamp (November 2026)

- **Team styles drive every player**: high press, mid block, low block, recovering (opponent); possession build-up (us). See `docs/Movement_Model.md`.
- Pressing in pairs with curved runs, flat back lines, block slide and squeeze, man-oriented midfield where the style calls for it.
- Attackers stay onside, find pockets with clear lanes, make overlaps and box runs; forwards hold height on backward passes.
- Nobody teleports: jog and sprint speeds limit every run to the ball's travel time.
- Tap any opponent to see why he moved; hold a teammate to see why he is there. Style chips explain each team's plan.
- Vertical pitch on phones (attacking up the screen), about twice the size; the camera widens to follow play.
- Compact scenario card; the Finish bar no longer covers players; markers never overlap; the two teams are visually distinct.
- Fixed opponent left/right labels (their right back now faces our left winger).
- Fixed the high-press scenario's 35-yard gap between midfield and defence.
- Scoring: "through ball" only when there is space beyond the receiver; the primary recommendation no longer goes to a pass the defence is favourite to win.
- New `tests/tactics.test.mjs` (8 tests), 3 new engine tests; both run in CI.
- **Best sequence**: after you finish, the engine searches for the strongest full multi-pass route (same scoring, same movement) and can play it on the board with a pass-by-pass caption (`src/planner.js`).
- **Live goal tracker** above the pitch ("Not there yet · 3 passes left" / "Goal reached"); Finish stays quiet until the goal is reached and asks for a second tap if you stop early; the analysis says plainly when you stopped with passes left.
- **Dribbling**: tap the player on the ball, then tap open grass within 15 yd, to run with it. Carries are scored with their own explained factors (space on arrival, opponents able to step into the run, pressure, length, ground gained, opponents carried past) and count as actions. The best-sequence finder can dribble too.
- **Realistic closing speed**: every player now needs about 0.35s to react and about a second to reach top speed, in both the scoring and the movement. Players only keep adjusting for a quarter of a second after the ball arrives (previously over half a second at full sprint from the instant of the pass).
- **Lesson format (first lesson: Build out against the press)**: a named lesson ("Beating a press: draw it, then break it"), the idea in plain English, and a 3-part checklist that ticks off live above the pitch (draw the press, break it, stay safe). Checks are made from the positions on the pitch (`src/lessons.js`), the grading and the best-sequence finder use the checklist, and the analysis opens with a lesson debrief. The other 10 scenarios still use single goals until the format is approved.
- **Formation library** (`src/formations.js`): 12 formations in five levels (foundations to rare and historical), each with an out-of-possession and an in-possession shape, how each phase works, strengths and weaknesses. Tests in `tests/formations.test.mjs`.
- **Shape card**: tap either team button above the pitch to see that team's formation, toggling between "without the ball" and "with the ball" with players gliding between the two. The press lesson explains both teams' shapes.
- Docs: `Curriculum_Plan.md` (draft for approval) and `Decision_Register.md`.
- **"Draw the press" made visible**: the checklist shows a live count (e.g. "Draw the press 1/3") and the opponents who count get a white ring on the pitch; tapping the checklist opens a plain-English explanation of every item. Team buttons shortened so the pitch stays in view.
- **Mission briefing**: lessons open with "Your mission" (each checklist item, and "when all are ticked, tap Finish") before the first move. "Front three" now names the players (RW, ST or LW), and once the press is drawn those targets glow green on the pitch.
- **Pass preview fixed on phones**: holding a teammate used to open the preview below the pitch, off the bottom of the screen. It now pops up at the top, leading with the risk ("58% · Medium risk"), and the pitch stays visible underneath. "Through ball" is now only offered for passes in behind the defence.
- **Shooting with expected goals (xG)**: within 35 yd of goal a Shoot button appears. It first shows the chance ("14 in 100 shots like this go in") and why (angle of goal, opponents in the way, keeper position, pressure), and flags a better-placed teammate; the shot ends the move. The outcome is never randomised. Keepers now cover the angle toward the ball. The best-sequence finder can shoot; all 11 scenarios are now solvable.
- **Press lesson now ends with a chance**: "draw it, break it, punish it". New checklist step "Create a chance": a shot worth 12 in 100 or better, or a counterattack with at least as many of your players as theirs ahead of the ball. Up to 6 actions.
