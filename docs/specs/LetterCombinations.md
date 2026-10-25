# Spec: LetterCombinations (Epic26)

## Overview / Goal

New sound items for level 1 of the Triceratops journey: letter combinations that are read as one sound. They are the building blocks for the closed syllables and words of this journey.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Items | St, Sp, Pf, Qu, ck, ng, nk and the double consonants ll, mm, nn, ss, tt, ff, pp (14 items) | Most frequent combinations in first-grade words |
| Goal (Triceratops level 1) | 1 of the 14 items read correctly | The combinations build on known letters; one mastered combination is enough to move on |
| Display | Pair tiles like the letters ("St st", "Pf pf", "Qu qu"); combinations that never start a word are shown in lowercase only ("ck", "ng", "nk", "ll", ...) | Matches how they appear in words |
| Reading aid in words | Combinations are underlined inside syllables and words (in addition to the colored syllables) | The child recognizes them as one sound |
| Adult hint | "Es zählt der gemeinsame Laut (z. B. \"scht\" bei St), nicht die einzelnen Buchstaben." | Same principle as in level 1 |

## Technical Details

### Data

`js/data/letters.js` gets the 14 combination items with type `combination`:

```js
{ id: 'st', display: 'St st', type: 'combination' }
{ id: 'ck', display: 'ck', type: 'combination' }
```

- They are added to `splitIntoLetters` (longest match first), so syllables such as "stock" split into `st`, `o`, `ck`.
- Vowel / consonant classification for syllables: combinations count as consonants.
- They are stored in the shared `pools.letters`.

### Content profile

The Triceratops profile uses these 14 items for level 1 (selection screen shows only them); goal: 1 mastered combination. The T-Rex profile keeps its 35 items.

### Underlining

`syllableSpans` / `syllableCard` wrap combination letters in `<span class="item-card__combination">` (CSS: thick underline in the syllable color).

## Acceptance Criteria

- The Triceratops level 1 selection shows the 14 combinations as tiles.
- Level 1 of this journey is completed with 8 mastered combinations.
- Combinations are split correctly inside syllables and words and are underlined there.
- The T-Rex level 1 is unchanged.
- Unit tests cover splitting (e.g. "stock" -> st, o, ck; "bank" -> b, a, nk).

## Open Risks / Assumptions

- "ng" and "nk" are ambiguous in rare cases (e.g. "an-kommen"); the word list avoids such words.
