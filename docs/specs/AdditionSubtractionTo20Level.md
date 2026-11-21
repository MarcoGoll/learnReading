# Spec: AdditionSubtractionTo20Level (Epic43)

## Overview / Goal

Math level 4 of the first math journey: mixed addition and subtraction up to 20, about half of the tasks with crossing ten (8 + 5, 13 - 6). The twenty frame helps on request.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Task range | Addition a + b <= 20 and subtraction a - b >= 0 with a <= 20; at least one number > 10 or crossing ten (tasks that belong to level 2/3 are excluded) | The level adds something new compared to levels 2 and 3 |
| Mix | Plus and minus randomly mixed; about 5 of 10 tasks per round with crossing ten | Crossing ten is the key skill of this level |
| Input | Number pad | - |
| Visual help | Twenty frame (two rows of ten) via help button and automatically after a wrong attempt | From counting towards mental arithmetic |
| Goal | 20 different tasks correct at the first attempt | Larger task set |
| Points | 30 base points | MathTaskEngine scale |

## Technical Details

- Level config: `{ kind: 'mixedAddSubtract', max: 20, crossingShare: 0.5, excludeUpTo: 10, input: 'pad', aid: 'tenFrame', aidMode: 'onRequest', goal: 20 }`.
- Crossing ten: addition when the units of a plus b reach 10 or more across the 10 boundary (`a < 10 < a + b` or `a % 10 + b % 10 >= 10`); subtraction when `a > 10 > a - b` or the units of a are smaller than b.
- Task ids `add:8+5`, `subtract:13-6`; ids are shared with other levels only if the same task appears there (it does not, because of `excludeUpTo`).
- Twenty frame aid: first operand filled in one colour, for addition the second operand in a second colour (filling the first ten first), for subtraction the subtrahend is crossed out from the end.
- Dino stage after completion: 3.

## Acceptance Criteria

- No task of level 4 exceeds 20 or goes below 0, and no task is a pure level 2/3 task.
- About half of the tasks of a round cross ten (4-6 of 10).
- The help button shows the twenty frame; after a wrong first attempt it appears automatically.
- The level is completed after 20 different tasks were answered correctly at the first attempt; the dino reaches stage 3.
- Unit tests cover the crossing detection, the exclusion of level 2/3 tasks, and the crossing share per round.
