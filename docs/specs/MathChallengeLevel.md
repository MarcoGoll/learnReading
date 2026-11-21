# Spec: MathChallengeLevel (Epic46)

## Overview / Goal

Math level 7 ("Abenteuer") is the final level of every math journey, built like reading level 5: a menu of four math variants. Each variant mixes all operations of the current journey. Completing the level makes the math dino fully grown.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Variants | MissingNumberVariant, MathMemoryVariant, NumberWallVariant, NumberLineVariant | Defined in /brainstorming |
| Passing a variant | At least half of the tasks of a variant round correct (`isRoundPassed`) | Same rule as reading level 5 |
| Completion | 3 of 4 different variants passed | Same rule as reading; one variant may be skipped |
| Material | Mix of all operations of the active math journey (plus, minus, times, divided) in the journey's number range | Level 7 repeats everything from levels 1-6 |
| Points | 50 base points per correct task (first attempt), half at the second attempt where a variant has attempts | MathTaskEngine scale |
| Stars | Per variant round with `starsForRound`; the best result of all variants counts as the level 7 stars | Same as reading level 5 |
| Replay | Passed variants stay playable for points and stars | Long-term motivation |

## Technical Details

- Routes: `/math/level/7` (menu) and `/math/level/7/<variantId>`.
- `js/screens/mathChallenge.js`: menu like `js/screens/challenge.js` (cards with picture, title, check badge for passed variants, progress text "2 von 3 Abenteuern geschafft").
- `js/screens/mathChallenge/variantRegistry.js`: `MATH_VARIANTS = [missingNumber, mathMemory, numberWall, numberLine]`; each variant exports `{ id, title, picture, run(container, context) }`; all variants are always available (generated tasks need no material).
- `js/screens/mathChallenge/variantContext.js`: builds `{ mixConfig, randomFn }` from the active math profile: `mixConfig = { operations: ['add', 'subtract', 'multiply', 'divide'], range, tables }`.
- Mixed task generation: `mixedTasks(mixConfig, count, randomFn)` in `js/logic/math/taskGenerator.js` with an even share of the four operations.
- Passed variants are stored in the existing `journey.passedVariants` of the math journey.
- Completion: `finishRound` with `isComplete = (state) => passedVariants.length >= 3`; level 7 completion sets stage 5 and unlocks the next math journey (MathJourneys).
- Final scene: the existing "ausgewachsen" evolution scene with the math species.
- Picture cards: new SVGs `assets/svg/pictures/mathMissingNumber.svg`, `mathMemory.svg`, `numberWall.svg`, `numberLine.svg`.

## Acceptance Criteria

- Level 7 shows a menu with four variant cards; passed variants have a check badge.
- A variant counts as passed with at least half of its tasks correct.
- After 3 different passed variants the level is completed, the math dino becomes fully grown, and the next math journey egg appears in the valley.
- Every variant uses tasks with all operations of the active math journey within its number range.
- Points, stars, records, care reward, and round summary work as in the other levels.
- Unit tests cover the completion rule, the operation mix, and the variant registry.
