# Spec: NumberLevel (Epic40)

## Overview / Goal

Math level 1 of the first math journey: the child recognizes numbers and quantities from 0 to 10, in both directions - counting a quantity and finding the quantity that matches a number.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Task types | Mixed: `count` (count the dots/insects, tap the number) and `pickQuantity` (see a number, tap the matching quantity picture) | Trains both directions of number sense |
| Number range | 0-10 | Basis for addition and subtraction up to 10 |
| Input | 3-4 answer cards (MathTaskEngine) | The child may not write digits yet |
| Visual help | Always shown (the quantity itself is the task) | - |
| Goal | 10 different tasks correct at the first attempt | 22 possible tasks (11 numbers x 2 types); goal is reachable in 1-2 rounds |
| Points | 10 base points, half at the second attempt | MathTaskEngine scale |

## Technical Details

- Level config in `js/content/mathProfiles.js`: `{ kind: 'numbers', max: 10, types: ['count', 'pickQuantity'], input: 'cards', aid: 'dots', goal: 10 }`.
- Task ids: `count:7`, `pickQuantity:7`.
- `count`: the quantity is drawn with `mathAid('dots', n)` (ten frame layout above 5, so 7 = 5 + 2 is visible); for 0 an empty frame is shown. The cards show numbers.
- `pickQuantity`: the number is shown large; the cards show quantity pictures with distractors n +- 1 and n +- 2 (within 0-10).
- Speech text for ReadTaskAloud: `count` -> "Wie viele Käfer sind das?", `pickQuantity` -> "Wo sind 7 Käfer?".
- Within a round the two types alternate randomly; at most 6 tasks of one type.

## Acceptance Criteria

- A round of level 1 contains `count` and `pickQuantity` tasks with numbers 0-10.
- Quantities above 5 are shown in a ten frame layout; 0 shows an empty frame.
- Cards contain exactly one correct answer and plausible close distractors.
- The level is completed after 10 different tasks were answered correctly at the first attempt; the Stegosaurus hatches (stage 1).
- Unit tests cover task generation (22 tasks), distractor ranges, and the goal count.

## Open Risks / Assumptions

- Assumption: dots are shown as insects in the dino theme; the picture type is a pure design choice of `mathAids.js`.
