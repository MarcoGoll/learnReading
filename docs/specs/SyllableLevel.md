# Spec: SyllableLevel (Epic7)

## Overview / Goal

Level 2. Open syllables made from the letters mastered in level 1 are read aloud. Correct syllables earn 20 points each and form the syllable pool for level 3.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Syllable form | Open syllables only: consonant + vowel (ma, lo, schu, mei) and single vowels (o, a, au) | Easiest form; basis of most beginner words (Ma-ma, O-ma, Sa-la-mi) |
| Source | Built-in list of sensible German open syllables, filtered to syllables whose letters are all in `pools.letters` | Avoids odd combinations such as "qö" or "yü" |
| Round size | Max. 10 syllables per round; first unmastered syllables that complete words of the journey (words with the fewest missing syllables first), then other unmastered ones, then random mastered ones | Short enough for a beginning reader's attention span; a round without mistakes reaches the word goal instead of collecting syllables that belong to no word |
| Completion | Level 2 is completed once at least 5 words of the level 3 word list can be built from `pools.syllables` | Guarantees that level 3 is playable |

## Technical Details

### Data (`js/data/syllables.js`)

```js
{ id: 'ma', letters: ['m', 'a'] }
{ id: 'schu', letters: ['sch', 'u'] }
{ id: 'au', letters: ['au'] }
```

The list covers all sensible combinations of the level 1 consonants with the level 1 vowels (excluding rare or awkward ones like "qa", "xö", "yu", "cä"). Syllables are displayed in lowercase.

### Pure logic (`js/logic/syllableLevel.js`, unit tested)

- `availableSyllables(letterPool)` -> syllables whose letters are all in the pool
- `buildRound(available, syllablePool, maxSize = 10)` -> new ones first (shuffled), filled up with mastered ones (shuffled)
- `isLevelTwoComplete(syllablePool, wordList)` -> true if at least 5 words consist only of pool syllables (uses `buildableWords` from WordReadingLevel)

### Flow

1. Start level 2 -> build a round from the available syllables.
2. Reading round with JudgeControls (correct / wrong / skip / not yet / undo); each correct syllable earns 20 points (plus streak bonus).
3. Round end -> merge correct syllables into `pools.syllables` -> summary -> check completion; on first completion: dino stage 2.
4. If not completed, the summary says how many more words are needed ("Noch 2 Wörter bis Level 3!") and offers "Nochmal spielen".
5. If the letter pool cannot produce 5 words at all, the summary suggests learning more letters in level 1 ("Lerne in Level 1 noch mehr Buchstaben!").

### Display

The syllable is shown very large in Andika; the vowel part is colored differently from the consonant part (e.g. vowel red, consonant blue) as a reading aid. BEM block: `syllable-card`.

## Acceptance Criteria

- Only syllables whose letters are all in the letter pool appear.
- A round contains at most 10 syllables, unmastered ones first.
- Each correct syllable earns 20 points (plus streak bonus) and is added to the syllable pool.
- Level 2 is completed exactly when at least 5 level 3 words can be built from the syllable pool; the dino then takes its first steps.
- The summary shows the missing number of words, or suggests level 1 if no 5 words are reachable with the current letters.
- `syllableLevel.js` has unit tests for filtering, round building, and completion.

## Open Risks / Assumptions

- Whether 5 words are reachable depends on the letters and the word list; a large word list (see WordReadingLevel) reduces the risk of a dead end.
