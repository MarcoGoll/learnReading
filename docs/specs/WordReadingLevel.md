# Spec: WordReadingLevel (Epic8)

## Overview / Goal

Level 3. Simple words made only of syllables the child mastered in level 2 are read aloud. Correct words earn 30 points each and form the word pool for level 4.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Word list | Built-in list of about 200 child-friendly words made of open syllables: nouns, simple verbs, and adjectives | Verbs and adjectives are needed for sentences in level 5; a large list reduces dead ends |
| Reading aid | Syllables colored alternately blue / red (Ma\|ma) | Common in German primers; the child recognizes known syllables inside the word |
| Round size | Max. 8 words per round; words not yet in the pool first | Words are more demanding than syllables |
| Completion | At least 5 words in `pools.words` | Enough for a meaningful drag-and-drop round in level 4 |

## Technical Details

### Data (`js/data/words.js`)

```js
{ id: 'mama',   display: 'Mama',  syllables: ['ma', 'ma'],  type: 'noun',      picture: 'mama' }
{ id: 'tomate', display: 'Tomate', syllables: ['to', 'ma', 'te'], type: 'noun', picture: 'tomate' }
{ id: 'male',   display: 'male',  syllables: ['ma', 'le'],  type: 'verb' }
{ id: 'lila',   display: 'lila',  syllables: ['li', 'la'],  type: 'adjective' }
```

- `syllables` reference ids from `js/data/syllables.js`; every word consists only of open syllables.
- Nouns are capitalized in `display`; the capital first letter is the uppercase form of a letter pair from level 1.
- Verbs are in the first-person singular form ending in -e (male, rufe, lese, baue), since infinitives (-en) are closed syllables.
- `picture` (optional) references an SVG under `assets/svg/pictures/` and is used by WordPictureVariant and WordMemoryVariant.
- Examples: Mama, Papa, Oma, Opa, Sofa, Lama, Salami, Rose, Hose, Nase, Dose, Tomate, Limo, Auto (counter-example: Pizza is excluded because "piz" is a closed syllable); verbs: male, rufe, lese, baue, rede, sage; adjectives: lila, rosa, rote, leise.

### Pure logic (`js/logic/wordLevel.js`, unit tested)

- `buildableWords(syllablePool, wordList)` -> words whose syllables are all in the pool (also used by SyllableLevel)
- `buildRound(buildable, wordPool, maxSize = 8)` -> unmastered first, then mastered, each group shuffled
- `isLevelThreeComplete(wordPool)` -> `wordPool.length >= 5`

### Flow

1. Start level 3 -> build round from buildable words.
2. Reading round with JudgeControls; each correct word earns 30 points (plus streak bonus).
3. Round end -> merge correct words into `pools.words` -> summary -> on first completion: dino stage 3 (first insect).
4. If not completed: "Noch 2 Wörter bis Level 4!" and "Nochmal spielen".

### Display

Word shown very large in Andika, each syllable in its own `<span>` with alternating color classes (`word-card__syllable--odd` / `--even`). BEM block: `word-card`.

## Acceptance Criteria

- Only words whose syllables are all in the syllable pool appear.
- A round contains at most 8 words, unmastered ones first.
- Syllables are colored alternately blue and red.
- Each correct word earns 30 points (plus streak bonus) and is added to the word pool.
- Level 3 is completed when the word pool has at least 5 words; the dino catches its first insect.
- The word list contains about 200 entries, each consisting only of syllables from the syllable list (checked by a unit test).
- `wordLevel.js` has unit tests for buildable words, round building, and completion.

## Open Risks / Assumptions

- Writing a list of about 200 valid open-syllable words takes care; a unit test validates that all syllables exist in the syllable list.
- Not every noun gets a picture right away; picture coverage is defined in WordPictureVariant.
