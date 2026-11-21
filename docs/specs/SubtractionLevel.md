# Spec: SubtractionLevel (Epic42)

## Overview / Goal

Math level 3 of the first math journey: subtraction up to 10, supported by a picture of insects flying away.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Task range | a - b with 0 <= b <= a <= 10 | 66 tasks, result never negative |
| Input | Number pad | Real calculating |
| Visual help | Always shown: a insects, b of them are crossed out and fly away | Makes "taking away" visible |
| Goal | 15 different tasks correct at the first attempt | Same size as addition |
| Points | 20 base points | MathTaskEngine scale |
| Weighting | Tasks with b = 0 or b = a make up at most 2 of 10 tasks per round | Avoids trivial tasks |

## Technical Details

- Level config: `{ kind: 'subtract', max: 10, input: 'pad', aid: 'insects', aidMode: 'always', goal: 15, maxTrivialTasksPerRound: 2 }`.
- Task ids: `subtract:7-3`; display `7 - 3 = ?`; speech "7 minus 3".
- Visual help: a insects in a row; the last b insects are shown faded with wings; after a correct answer they fly out of the picture (CSS animation).
- No new dino stage after completion (mapping in MathJourneys); stars, points, and the level 4 unlock as usual.

## Acceptance Criteria

- All tasks have results from 0 to 10; the minuend is never smaller than the subtrahend.
- The picture shows a insects with exactly b flying away.
- A round contains at most 2 trivial tasks (b = 0 or b = a).
- The level is completed after 15 different tasks were answered correctly at the first attempt; level 4 opens, the dino stage stays at 2.
- Unit tests cover the generator (66 tasks) and the trivial-task limit.
