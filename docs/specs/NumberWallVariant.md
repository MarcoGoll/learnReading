# Spec: NumberWallVariant (Epic49)

## Overview / Goal

A level 7 variant with number walls (Rechenmauern): each brick is the sum of the two bricks below it. The child fills in the missing bricks with the number pad.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Size | 3 rows, 6 bricks (3 at the bottom, 2 in the middle, 1 at the top) | Compact for tablets, classic first-grade form |
| Gaps | 2-3 missing bricks per wall, always solvable step by step | Solvable without guessing |
| Operation | Addition only (missing lower bricks require subtraction) | The classic number wall rule |
| Range | Top brick at most 20 in journey 1; up to 100 in journeys 2 and 3 (HarderMathContent) | Matches the journey's number range |
| Round | 4 walls per round; each gap is one task (8-12 tasks) | Enough tasks for stars |
| Attempts | Two attempts per brick, then the brick shows the solution | MathTaskEngine pattern |

## Technical Details

- `js/logic/math/numberWall.js`: `createWall(maxTop, randomFn)` returns `{ bricks: [b0, b1, b2, m0, m1, top], gaps: [indices] }`; `isWallSolvable(wall)` checks that every gap can be computed from known bricks (step-by-step propagation).
- Gap patterns: chosen randomly from patterns that include at least one lower or middle brick (requiring subtraction) when the journey has subtraction.
- `js/screens/mathChallenge/numberWall.js`: BEM block `number-wall` (`number-wall__row`, `number-wall__brick`, `number-wall__brick--gap`, `number-wall__brick--active`, `number-wall__brick--solved`). The child taps a gap brick, enters the value on the number pad, OK checks it.
- Passed: at least half of all gap bricks of the round correct.
- History key: `math:wall:<b0>-<b1>-<b2>:<gapIndex>`.

## Acceptance Criteria

- Each wall has 6 bricks in 3 rows; every brick equals the sum of the two bricks below it.
- Each wall has 2-3 gaps and can be solved step by step without guessing.
- The top brick never exceeds the journey's limit (20 in journey 1).
- A round has 4 walls; with at least half of the gaps correct the variant is passed.
- Unit tests cover wall generation, the sum rule, the limit, and the solvability check.
