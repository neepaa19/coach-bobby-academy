# Movement Model

How players move after every pass. Code: `src/tactics.js`. Tests: `tests/tactics.test.mjs`.

Every movement comes from the **team style**, not from fixed nudges, and every player
records **why** he moved. Tap any opponent on the board to read it; hold a teammate to
see it in the pass preview.

## Defending styles

| Style | Back line (yd from own goal) | Block length | Width | Presses when | Pressers | Man-oriented |
|---|---|---|---|---|---|---|
| High press | ball depth − 20, between 24 and 46 | 34 | 44 | anywhere | 2 | strong |
| Mid block | ball depth − 24, between 16 and 36 | 30 | 40 | ball in midfield, or wide | 1 | light |
| Low block | ball depth − 26, between 11 and 20 | 24 | 36 | ball near the box | 1 | minimal |
| Recovering | ball depth − 24, between 14 and 32 | 28 | 40 | ball near goal | 1 | none, everyone sprints back |

Rules applied in order:

1. **Line height.** The back unit holds one flat line at the style's height.
2. **Block length.** Midfield and forwards spread in front of the line in their formation order.
3. **Slide and squeeze.** The block's centre follows the ball across, and the team narrows to the style width, so the far side tucks in.
4. **Press.** The nearest player presses on a curved run from the inside (blocking the pass into the middle, showing the carrier down the line). A high press sends a second player to stand in the lane of the easiest option.
5. **Marking.** Man-oriented styles pull midfielders goal-side of the nearest opponent.

## Attacking style (possession build-up)

- The team steps up as the ball goes forward. On a backward pass the back line drops to give an angle, but forwards hold their height.
- The two most central back-line players stay behind the ball as rest defence.
- **Offside discipline:** no attacker finishes beyond the second-last defender (or the ball).
- Players near the ball choose the nearby spot with the most space and the clearest lane from the ball.
- Patterned runs: overlap or underlap when the ball is wide, plus near-post, back-post and cutback runs in the final third.

## Time and speed

Players move at most what they can cover while the ball travels plus a quarter of a second
for the receiver's first touch. Nobody reacts instantly: about 0.35s to read the pass, then
about a second to reach top speed (`runDistance` in `engine.js`, shared with the scoring).
Shifting with the block is a jog (4.4–5.0 yd/s); pressing, recovery runs and attacking runs are
sprints (6.6–7.0 yd/s). So a quick switch of play genuinely beats a sliding defence.

## Dribbling

A carry is treated as a "pass to yourself" at 5.2 yd/s with the ball, up to 15 yd. Defenders
react to it exactly as to a pass. Scored in `evaluateCarry` (engine.js).

## Honesty

These are **coaching models of each style**, not measurements of any real team. Real-team
profiles (planned for Match Prep) will be built on top of these styles, with sources and dates.
