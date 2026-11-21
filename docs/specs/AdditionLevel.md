# Spec: AdditionLevel (Epic41)

## Overview / Goal

Math level 2 of the first math journey: addition up to 10, supported by a picture of insects the dino eats.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Task range | a + b with a, b >= 0 and a + b <= 10 | 66 tasks; the 0 belongs to the curriculum |
| Input | Number pad (MathTaskEngine) | Real calculating |
| Visual help | Always shown: two groups of insects in different colours ("3 Käfer und 4 Käfer") | Counting all is allowed at this stage |
| Goal | 15 different tasks correct at the first attempt | Enough breadth before subtraction |
| Points | 20 base points | MathTaskEngine scale |
| Weighting | Tasks with 0 make up at most 2 of 10 tasks per round | Avoids too many trivial tasks |

## Technical Details

- Level config: `{ kind: 'add', max: 10, input: 'pad', aid: 'insects', aidMode: 'always', goal: 15, maxZeroTasksPerRound: 2 }`.
- Task ids: `add:3+4`; display `3 + 4 = ?`; speech "3 plus 4".
- Visual help `insects`: first group of a insects, a plus sign, second group of b insects; after a correct answer the dino "eats" them with a short animation (CSS), then the next task follows.
- Dino stage after completion: 2 (first steps).

## Acceptance Criteria

- All tasks of level 2 have a sum between 0 and 10; no negative numbers.
- The insect picture always matches the operands.
- A round contains at most 2 tasks with an operand 0.
- The level is completed after 15 different tasks were answered correctly at the first attempt; the dino reaches stage 2.
- Unit tests cover the generator (66 tasks) and the zero limit.
