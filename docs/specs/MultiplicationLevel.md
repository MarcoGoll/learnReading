# Spec: MultiplicationLevel (Epic44)

## Overview / Goal

Math level 5 of the first math journey: multiplication with the core times tables 1, 2, 5, and 10, supported by rows of eggs.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Tables | 1, 2, 5, 10 (journey 1); further tables in journeys 2 and 3 (HarderMathContent) | Core tables of the primary school curriculum |
| Task range | a x b with a in 1-10 and b in the configured tables; both orders (3 x 5 and 5 x 3) | 64 tasks for journey 1 (all pairs 1-10 where at least one factor is a table); swapped tasks train commutativity |
| Input | Number pad | - |
| Visual help | Egg rows (a rows with b eggs) via help button and automatically after a wrong attempt | Repeated addition becomes visible |
| Goal | 15 different tasks correct at the first attempt | - |
| Points | 40 base points | MathTaskEngine scale |
| Display | Operator `·` (German school notation), speech "mal" | Matches what the child sees at school |

## Technical Details

- Level config: `{ kind: 'multiply', tables: [1, 2, 5, 10], factorMax: 10, input: 'pad', aid: 'eggRows', aidMode: 'onRequest', goal: 15 }`.
- Generation: for every table t and factor f in 1-10 the task `f · t`; the swapped task `t · f` is added when different; duplicates removed (e.g. 2 · 5 appears once per order).
- Task ids: `multiply:3*5`; display `3 · 5 = ?`; speech "3 mal 5".
- Egg rows aid: a rows of b eggs, at most 10 x 10; for products above 50 the eggs are drawn smaller.
- No new dino stage after completion (mapping); level 6 opens.

## Acceptance Criteria

- Every task of journey 1 contains a factor from the tables 1, 2, 5, 10; the other factor is 1-10.
- Both orders of a task can appear.
- The egg rows aid matches the task.
- The level is completed after 15 different tasks were answered correctly at the first attempt.
- Unit tests cover the generator (tables, order, no duplicates) and the display/speech texts.
