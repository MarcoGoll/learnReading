# Spec: LetterLevel (Epic6)

## Overview / Goal

Level 1. The adult selects which letters and sounds the child knows; the child then reads them aloud one by one. Correctly read items earn 10 points each and form the letter pool for level 2.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Item set | A-Z, Ä, Ö, Ü plus the common sounds Au, Ei, Eu, Ie, Ch, Sch | German alphabet plus the most important sounds for first words |
| Upper / lower case | Shown as one pair item ("M m", "Sch sch"), like in a primer | One item = one sound; syllables and words later use normal spelling |
| Minimum to complete | Pool contains at least 2 vowels and 5 consonants | Enough material for varied syllables and first words |
| Vowel / consonant classification | Vowels: A E I O U Ä Ö Ü and Au Ei Eu Ie; consonants: all other letters plus Ch, Sch | Diphthongs and Ie act as the vowel core of a syllable |
| Hint for the adult | Small hint text: "Es zählt der Laut (mmm), nicht der Buchstabenname (em)." | Matches how reading is taught at school; the decision stays with the adult |
| "Not yet" | Available via JudgeControls ("Noch nicht") | The adult can skip items the child cannot read yet |

## Technical Details

### Data (`js/data/letters.js`)

```js
{ id: 'm', display: 'M m', type: 'consonant' }
{ id: 'au', display: 'Au au', type: 'vowel' }
{ id: 'sch', display: 'Sch sch', type: 'consonant' }
```

`id` is the lowercase form and is what is stored in `pools.letters`.

### Flow

1. **Selection screen:** grid of all 35 items (large tiles, single letters first, then sounds). The adult taps the items the child knows; buttons "Alle auswählen" and "Auswahl leeren". Items already in the pool are marked with a small star but are not preselected. "Los geht's" is enabled once at least one item is selected.
2. **Reading round:** selected items in random order, one at a time, displayed very large in Andika; the companion dino and score board are visible; JudgeControls below.
3. **Round end:** correct items are merged into `pools.letters`; round summary (ScoreAndHighscore); if the pool now has at least 2 vowels and 5 consonants and level 1 was not completed before -> level completed and dino stage 1 (DinoEvolution).
4. If the minimum is not reached, the summary shows what is still missing in a friendly way (e.g. "Noch 1 Selbstlaut und 2 Mitlaute bis Level 2!") and offers "Nochmal spielen".

### Pure logic (`js/logic/letterLevel.js`, unit tested)

- `isLevelOneComplete(letterPool)` -> boolean
- `missingForCompletion(letterPool)` -> `{ vowels, consonants }`

## Acceptance Criteria

- The selection screen shows A-Z, Ä, Ö, Ü, Au, Ei, Eu, Ie, Ch, Sch as pair tiles.
- Only selected items appear in the round, in random order, each shown once (plus skipped items again at the end).
- Each correct item earns 10 points (streak bonus per ScoreAndHighscore) and is added to the letter pool.
- "Noch nicht" items are not added to the pool and are selectable again next time.
- Level 1 is completed exactly when the pool contains at least 2 vowels and 5 consonants; the dino then hatches.
- If not completed, the summary names the missing number of vowels / consonants.
- The adult hint about sounds is visible during the round.
- `letterLevel.js` has unit tests for completion and missing counts.

## Open Risks / Assumptions

- Y is treated as a consonant; ß is not included (it never starts a word and has no uppercase in common use).
