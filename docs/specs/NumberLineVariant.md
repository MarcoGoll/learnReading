# Spec: NumberLineVariant (Epic50)

## Overview / Goal

A level 7 variant with a number line: a task is shown above (e.g. 7 + 5), the child taps the solution on the number line, and the dino hops there step by step, showing the calculation.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Interaction | Tap the solution on the number line; the dino hops from the first operand to the tapped number | Works with mouse and touch without drag problems; the hops show the calculation |
| Range | 0-20 with marks for every number in journey 1; 0-100 with tens marks and ticks for units in journeys 2 and 3 | Matches the journey range |
| Operations | Plus and minus (times as repeated jumps: 3 · 4 = three jumps of 4) | Division has no natural number line picture; it is left out of this variant |
| Round | 10 tasks, two attempts each | MathTaskEngine pattern |
| Hops | After the answer the dino hops from a by b (single steps up to 10, otherwise one jump to the next ten, then steps); wrong: it hops to the correct number after the second attempt | Teaches strategies like "to 10 first" |

## Technical Details

- `js/logic/math/numberLine.js`: `hopPath(task)` returns the list of positions the dino visits (e.g. 8 + 5 -> [8, 10, 13] for the "to 10 first" strategy in journey 1; times: [0, 4, 8, 12]).
- `js/screens/mathChallenge/numberLine.js`: inline SVG number line, BEM block `number-line` (`number-line__axis`, `number-line__mark`, `number-line__mark--ten`, `number-line__dino`, `number-line__arc`). Hops are CSS transitions with arc paths drawn after each hop.
- In the 0-100 range, tapping chooses the nearest number; a magnifier bubble shows the chosen number before it is confirmed with OK.
- The small dino is the active math dino (`createCompanionDino`) in its current stage.
- Passed: at least 5 of 10 correct.
- History key: `math:line:<taskId>`.

## Acceptance Criteria

- The number line shows the journey's range with readable marks on a tablet.
- Tapping a number selects it; the dino hops along the computed path with visible arcs.
- Plus, minus, and times tasks appear; no division tasks.
- A wrong answer allows a second attempt; after that the dino hops to the correct number.
- With at least 5 correct answers the variant is passed.
- Unit tests cover `hopPath` for plus, minus (with crossing ten), and times.
