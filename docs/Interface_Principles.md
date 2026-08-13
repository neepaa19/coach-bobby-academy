# Interface Principles

Design rules for Coach Bobby Academy, drawn from Apple's Human Interface Guidelines
and adapted to what this app actually is: a coaching tool used one-handed, on an
iPhone, often standing on a touchline.

This is a working checklist, not a philosophy essay. Every rule below is testable.

---

## The three ideas everything else follows from

**Clarity.** The user should never have to work out what a control does. If a
button needs explaining, the button is wrong. In this app that means: no icon
without a label, no percentage without a reason, no gesture that isn't also
available as a tap.

**Deference.** The interface gets out of the way of the content. Here the content
is *the pitch*. Chrome, panels and text should never compete with the tactical
picture for attention — which is why the match brief collapses and the board sits
near the top of the screen.

**Depth.** Layering communicates hierarchy. The bottom sheet sits above the screen;
the analysis appears below the board because it comes after in time. Position on
screen should mirror position in the user's mental model.

---

## Hard rules — these are pass/fail

| Rule | Why | How to test |
|---|---|---|
| Every tap target ≥ 44×44pt | Apple's minimum for a fingertip | Automated audit in `tests/smoke.mjs` flags any visible button under 40px |
| No horizontal scrolling | Breaks the reading model on phones | Smoke test asserts `scrollWidth <= innerWidth` |
| Primary action always visible | The user must never hunt for "what now" | Finish Sequence is a fixed bar; it hides only once its job is done |
| Labels travel with their objects | A detached label is misinformation | Player circle + position label share one SVG transform group |
| Nothing is revealed before the user commits | Otherwise it's a quiz, not a decision | Smoke test asserts zero route arrows before submission |
| Respect `prefers-reduced-motion` | Motion sensitivity is real | Animation path short-circuits to instant positioning |

---

## Typography and hierarchy

- One idea per line at the top of every screen. The user reads the first line and
  knows where they are.
- Numbers that matter get size and weight; supporting text gets muted colour. The
  sequence rating is 1.7rem; the label under it is 0.66rem. That gap is the message.
- Never centre long text. Left-aligned text is faster to scan.
- Body text stays at 16px minimum so iOS Safari does not zoom on focus.

## Colour

- One accent colour carries "this is the action" — green throughout this app.
- Red means loss or danger only. Amber means partial or caution. Green means secure.
  These map to the verdict states, so colour is information rather than decoration.
- Colour is never the *only* signal. The verdict is also stated in words, because
  roughly one in twelve men has some form of colour vision deficiency, and this app
  is aimed at coaches.

## Motion

- Motion explains cause and effect. The ball travels so you see *where* it went; the
  defence shifts so you see *why* the next picture looks different.
- Nothing animates purely for decoration.
- The next decision state never appears mid-animation. Interaction is disabled while
  the board is moving, so the user can't act on a stale picture.

## Feedback

- Every action produces a visible result within 100ms, even if the result is just
  "selected".
- Errors explain the constraint, not the failure: "That is the action limit for this
  scenario (4)" beats "Invalid move".
- Nothing important is communicated by absence. If a thing is unavailable, say so.

---

## Where this app currently falls short

Written down honestly so it can be fixed rather than forgotten.

1. **Density.** The analysis panel presents verdict, four stats, notes, Why Mode,
   ranked options and mastery evidence in one column. That's a lot to land at once.
   It should reveal progressively — verdict first, detail on demand.
2. **The board is small on a phone.** The pitch has to fit 22 players in roughly a
   390×250 area. Position labels are near the legibility floor. Worth exploring a
   pinch-to-zoom or a tap-to-enlarge board.
3. **First run has no orientation.** A new user lands on a full tactical board with
   no idea that holding a player previews the pass. Needs a genuine first-run
   moment, not a help page.
4. **Empty states are thin.** The profile before any play is a row of zeros. It
   should say what to do next.
5. **No haptics.** iOS Safari supports limited haptic feedback; a tick on a
   successful pass would make the board feel physical.
6. **Set-piece studio has no undo.** Dragging is destructive with no way back.

---

## The test that matters

Hand the phone to a coach who has never seen it, say nothing, and watch. Every
question they ask out loud is a design defect. Every hesitation is a hierarchy
problem.

That test has not been run yet. Until it has, everything above is theory.

---

Sources: Apple Human Interface Guidelines (developer.apple.com/design), summarised
via published overviews August 2026. Adapted rather than copied — the specifics
above describe this app, not Apple's.
