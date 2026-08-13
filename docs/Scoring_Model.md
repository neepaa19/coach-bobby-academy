# The Scoring Model

Everything the app shows as a percentage comes from this model. It is deterministic:
the same picture always produces the same number. Nothing is random.

**These are tactical estimates, not measured probabilities.** They express how a
well-defined set of football factors combine, not a statistically validated chance of
completion. That distinction is stated in the app wherever a number appears.

---

## Coordinates and units

- Distances are in **yards** on a 105 × 68 pitch.
- `x = 0` is our own goal line, `x = 105` is the opponent's. We always attack `+x`.
- Ball speeds: ground 14 yd/s, driven 20 yd/s, through 16 yd/s, lofted 12 yd/s.
- Defender recovery speed: 6.4 yd/s.

The app displays these as mph by default, with a km/h toggle inside Why Mode. The engine
calculates in yards per second because the pitch is measured in yards; the conversion is
display-only and never affects a score.

---

## Pass confidence

Each pass starts at a **base of 58** and is adjusted by the factors below. The result is
clamped to 3–97, because no pass in football is certain and none is impossible.

| Factor | Max influence | What it measures |
|---|---|---|
| Receiver separation | ±20 | Space the receiver still has **when the ball arrives**, not when it is played |
| Passing lane | −24 | The closest opponent to the line of the pass, weighted toward mid-lane |
| Pressure on the passer | −14 | Distance from the ball to the nearest opponent |
| Pass distance | −16 | Execution risk rising with length and travel time |
| Defensive recovery | −18 | Whether the covering defender arrives before the receiver does |
| Territory gained | ±10 | Change in distance to the opponent's goal |
| Lines broken | +8 | Opponents the pass eliminates along the attacking axis |
| Pass angle | −6 | Square passes in our own half, which are the dangerous ones to lose |
| Pass type fit | ±10 | Whether the chosen delivery suits the geometry |

### Effective separation

The number that matters is not how much space a receiver has now, it is how much he has
when the ball reaches him:

```
travelTime        = passDistance / ballSpeed(passType)
closingDistance   = 6.4 yd/s × travelTime × orientation
effectiveSeparation = startingSeparation − closingDistance
```

`orientation` is 0.75 for a defender positioned behind the receiver, because a defender
facing the wrong way recovers less ground than one already goal-side.

### Lane risk

For every opponent, the perpendicular distance to the line of the pass is measured, along
with how far along that line the opponent sits. Opponents near the middle of the lane are
more dangerous than opponents near either end. A lofted pass reduces the risk from any
opponent who is not standing right on top of the passer.

### Pass type fit

- **Driven** rewards longer range, penalised under 22 yd where it is simply harder to control.
- **Through ball** rewards a forward-angled pass with space behind; penalised when there is
  no runner and no space.
- **Lofted** rewards a blocked lane; penalised when the floor was available.
- **Ground** rewards short, clean pictures; penalised over distance or through traffic.

When you do not choose a type, the engine plays the highest-rated one for that picture.

---

## Sequence rating

```
rating = averageConfidence × 0.5
       + clamp(totalProgression, −25, 40) × 0.8
       + linesBroken × 3.5
       − (45 − weakestPass) × 0.9      if any pass fell below 45
       + 14                            if the objective was met
       − 10                            if the action limit was exceeded
```

If any pass falls below 45, the sequence verdict is **lost** and the rating is capped at
44 — however much ground it covered before it broke down. A sequence is only as strong as
its riskiest action, which is exactly how possession is actually lost.

---

## Option ranking

After submission the app ranks every available option from the opening picture:

```
value = confidence × 0.62 + clamp(progression, −20, 26) × 1.5 + linesBroken × 4
```

- **Primary** — highest value: the best blend of likely to arrive and worth playing.
- **Secondary** — second highest. Frequently defensible.
- **Safest** — highest raw confidence, shown separately when it is not the primary. This
  is the point: the safest pass and the best pass are often not the same pass, and
  coaching means knowing when to take which.

Options are never shown before submission.

---

## Mastery

Concepts hold a value from 0 to 1, built only from evidence produced by graded sequences.

```
step = delta × 0.16 × variety × difficulty × headroom
```

- `variety` is 1 on a scenario you have not solved before, 0.35 on a repeat.
- `difficulty` scales with the scenario level.
- `headroom` shrinks gains as a concept approaches mastery.

The consequence is deliberate: **repeating one easy scenario cannot max out a concept.**
Mastery requires varied evidence across different pictures, which is what distinguishes
demonstrated understanding from a lucky answer. It also means the overall percentage
moves slowly early on — that is the model working, not a bug.

Levels: Not yet tested (0), Aware (0.18), Developing (0.42), Secure (0.66), Mastered (0.86).

---

## Tuning

All weights live in `WEIGHTS` and `SPEED` at the top of `src/engine.js`. Changing a weight
changes every percentage in the app consistently, and `tests/engine.test.mjs` will catch a
change that inverts the scoring direction or breaks the weakest-pass rule.

If a scenario's judgement feels wrong to a coach, that is a tuning problem, and this file
is where the argument should start.
