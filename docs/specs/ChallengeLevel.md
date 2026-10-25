# Spec: ChallengeLevel (Epic10)

## Overview / Goal

Level 5 is a frame for several game variants (Epic11-16) that use the words mastered in levels 3 and 4. The child chooses a variant from a menu. Level 5 is completed (and the dino is fully grown) once rounds in 3 different variants have been passed.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Variant selection | Child picks from a menu of large illustrated cards ("islands") | Own choice increases motivation |
| Availability | All implemented variants are available immediately | Simple; the child can find a favorite |
| Round passed | At least half of the tasks in the round correct | Achievable, but not free |
| Level 5 completion | Rounds passed in 3 different variants | Requires variety without forcing all 6 |
| Points / record | 50 base points per correct task; one level 5 record for all variants (see ScoreAndHighscore) | Consistent with the scoring spec |

## Technical Details

### Variant registry (`js/screens/challenge/variantRegistry.js`)

Each variant module registers itself with:

```js
{
  id: 'sentenceReading',
  title: 'Sätze lesen',          // German UI text
  icon: 'assets/svg/variants/sentence-reading.svg',
  minWords: 3,                   // minimum material needed
  isAvailable: (state) => boolean,
  start: (containerElement, context) => Promise<{ correctCount, taskCount, roundScore }>
}
```

`context` provides the word material, the scoring helpers, the companion dino, and the sound player, so variants do not access the store directly.

### Material

- Primary source: `pools.builtWords` (words built in level 4).
- If a variant needs more items than available, it may additionally use `pools.words` (words read in level 3).
- If still not enough, the card is shown greyed out with a hint (e.g. "Lerne erst noch mehr Wörter in Level 3!").

### State

```js
challenge: {
  passedVariants: []   // ids of variants with at least one passed round
}
```

### Flow

1. `#/level/5` -> variant menu: one card per registered variant; passed variants show a badge; progress text "2 von 3 geschafft".
2. Card tap -> `#/level/5/<variantId>` -> variant runs its round.
3. Round end -> `passed = correctCount >= taskCount / 2` -> add the variant to `passedVariants` if passed -> summary with record check.
4. When `passedVariants.length` reaches 3 for the first time -> level 5 completed -> dino stage 5 (fully grown, final scene).
5. After completion, level 5 stays playable without limit (and all other levels too).

### Pure logic (`js/logic/challengeLevel.js`, unit tested)

- `isRoundPassed(correctCount, taskCount)`
- `isLevelFiveComplete(passedVariants)` -> `passedVariants.length >= 3`

## Acceptance Criteria

- Level 5 shows a menu with one card per implemented variant; passed variants are marked.
- Variants without enough material are greyed out with a hint.
- A round counts as passed with at least half the tasks correct.
- After rounds were passed in 3 different variants, the final dino scene plays once and the dino is fully grown.
- Correct tasks in variants earn 50 base points; the level 5 record is updated after each round.
- `challengeLevel.js` has unit tests for round passing and level completion.

## Open Risks / Assumptions

- Level 5 can only be completed once at least 3 variants are implemented; until then the dino stays at stage 4.
