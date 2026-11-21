# Spec: HarderMathContent (Epic51)

> **Superseded:** the journey structure and contents of this spec were replaced by `MathOperationDinos.md` (one dino per operation, all available from the start).

## Overview / Goal

Content of the second and third math journey (Ankylosaurus and Parasaurolophus). They use the same 7 level types as journey 1 with larger number ranges and the remaining times tables, following the grade 2 curriculum.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Journey 2 | Numbers up to 100; plus/minus up to 100 without crossing tens (levels 2/3), with crossing tens (level 4); times tables 3, 4, 6 (levels 5/6) | Grade 2 curriculum, step by step |
| Journey 3 | Plus/minus up to 100 mixed with two-digit numbers; times tables 7, 8, 9; then the full times table mixed | Completes the small times table |
| Level types | Same 7 levels as journey 1, titles from the profile | No new controls to learn |
| Visual help | Ten bars and unit cubes (`tensAndUnits`) for numbers above 20; egg rows / sharing as in journey 1 | Place value becomes visible |
| Goals | Same goal sizes as journey 1 (10/15/15/20/15/15/3 variants) | Comparable effort per journey |

## Technical Details

Profiles in `js/content/mathProfiles.js`:

### Journey 2 (Ankylosaurus)

| Level | Title | Config | Aid |
|-------|-------|--------|-----|
| 1 | Zahlen bis 100 | count (tens and units picture -> number) + pickQuantity (number -> picture), 10-100 | tensAndUnits (always) |
| 2 | Plus bis 100 | add, sum <= 100, no crossing tens (e.g. 34 + 5, 30 + 40, 23 + 14) | tensAndUnits (always) |
| 3 | Minus bis 100 | subtract, no crossing tens (e.g. 47 - 3, 80 - 30, 58 - 26) | tensAndUnits (always) |
| 4 | Mit Übergang | mixed add/subtract up to 100 with crossing tens (e.g. 38 + 5, 52 - 7) | tensAndUnits (on request) |
| 5 | Mal | multiply, tables 3, 4, 6 | eggRows (on request) |
| 6 | Geteilt | divide, inverse of tables 3, 4, 6 | sharing (on request) |
| 7 | Abenteuer | variants, range 100, all operations | - |

### Journey 3 (Parasaurolophus)

| Level | Title | Config | Aid |
|-------|-------|--------|-----|
| 1 | Zahlen-Profi | numbers up to 100: neighbours, tens, and halves (e.g. "Welche Zahl kommt nach 59?") with cards | number line picture (always) |
| 2 | Plus-Profi | add two two-digit numbers up to 100, with and without crossing (e.g. 37 + 45) | tensAndUnits (on request) |
| 3 | Minus-Profi | subtract two two-digit numbers, with and without crossing (e.g. 82 - 47) | tensAndUnits (on request) |
| 4 | Gemischt | mixed plus/minus up to 100, including missing-number tasks | on request |
| 5 | Mal | multiply, tables 7, 8, 9 | eggRows (on request) |
| 6 | Einmaleins | multiply and divide mixed, all tables 1-10 | on request |
| 7 | Abenteuer | variants, range 100, all operations | - |

- New generator kinds in `taskGenerator.js`: `numbersTo100`, `numberNeighbours`, `addNoCrossing`, `subtractNoCrossing`, `addTwoDigit`, `subtractTwoDigit`, `mixedMultiplyDivide`. The existing kinds get a `max` parameter.
- Large task sets (e.g. thousands of two-digit additions) are not fully enumerated: `allTasks` returns a lazy sample of at most 400 tasks per config (seeded by `randomFn`), so the selection and goal logic stays the same.
- `tensAndUnits` aid: ten bars (sticks of 10) and unit cubes, at most 9 bars and 9 cubes per operand.
- Number wall: top brick up to 100; number line: 0-100 with tens marks.

## Acceptance Criteria

- Journey 2 and 3 levels use the number ranges and tables listed above; no task exceeds 100 or goes below 0.
- "Without crossing" and "with crossing" tasks are classified correctly (unit tests).
- The `tensAndUnits` picture matches the numbers of the task.
- Level 6 of journey 3 mixes multiplication and division of all tables 1-10.
- The level 7 variants of journeys 2 and 3 use range 100.
- Unit tests cover all new generator kinds, the range limits, and the 400-task sampling.

## Open Risks / Assumptions

- The jump from journey 1 to journey 2 (from 20 to 100) is large; the tens-and-units picture in levels 1-3 is meant to bridge it. Goal sizes may need tuning after real play.

## Implementation Notes

- Instead of separate generator kinds, the existing kinds take options: `crossing` ("none" / "only"), `twoDigit`, `excludeUpTo`, `missingNumbers`; number tasks support the types next, previous, nextTen, and half. Ranges above 20 never use 0 as an operand.
- Large task lists are sampled evenly (stable between calls) to at most 400 tasks.
