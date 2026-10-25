# Spec: ClosedSyllables (Epic25)

## Overview / Goal

New syllable and word content for the Triceratops journey (levels 2-5): syllables that end with a consonant (closed syllables) and words built from open and closed syllables, including the letter combinations from LetterCombinations.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Syllable forms | Consonant-vowel-consonant (mal, bal, son) and vowel-consonant (am, im, en); a letter combination counts as one consonant (stock = St-o-ck) | Covers most words such as Son-ne, Win-ter, Tisch |
| No consonant clusters | No syllables with two separate final consonants (Hund, Wurst) | Kept for later; too hard for this stage |
| Reading aid | Colored syllables as before; combinations underlined | Consistent with the first journey |
| Word list | About 120 words, made of open and closed syllables; nouns (with pictures where possible), verbs, adjectives | Enough material for all 5 levels and the adventures |
| Goals | Level 2: syllables for 5 words; level 3: 5 words read; level 4: 5 words built; level 5: 3 adventures | Same goal structure as the first journey |

## Technical Details

### Data

- `js/data/syllables.js`: closed syllables are added (generated from core consonants x vowels x final consonants, plus all syllables of the new words, minus awkward combinations); each syllable gets `closed: true/false`.
- `js/data/wordsTriceratops.js` (same spec format as `words.js`, e.g. `'Son-ne n p'`, `'Tisch n p'`, `'Ball n p'`, `'Stock n'`, `'spie-le v'`, `'dick a'`): about 120 words, every word containing at least one closed syllable or combination.
- Examples: Ball, Bett, Tisch, Fisch, Buch, Dach, Topf, Kopf, Zopf, Sack, Rock, Stock, Stein, Ring, Bank, Sonne, Kanne, Puppe, Teller, Wolke, Spinne, Qualle, Mutter, Winter, Koffer, Hammer.
- Sentences for the adventures: about 40 additional sentences in `js/data/sentencesTriceratops.js`, using these words and the sight words.
- Pictures: about 30 new picture SVGs for the most important nouns (for WordPicture and WordMemory in this journey).

### Content profile (Triceratops)

- Level 2 uses syllables whose letters (including combinations) are in `pools.letters` and that are closed or contain a combination.
- Levels 3-5 use the Triceratops word list and sentences.
- `buildableWords` works unchanged with the new syllable ids.

## Acceptance Criteria

- Closed syllables appear only in the Triceratops journey (and later journeys as review), never in the T-Rex journey.
- Every Triceratops word consists only of syllables from the syllable list (unit test).
- Every picture reference of the new words has an SVG file (unit test).
- All 5 levels of the Triceratops journey are playable with the new content and reach their goals.

## Open Risks / Assumptions

- Syllable boundaries in German are sometimes ambiguous (e.g. "Mut-ter"); the list uses the school hyphenation.
