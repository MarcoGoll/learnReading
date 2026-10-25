# Spec: CustomWords (Epic31)

## Overview / Goal

In the parent area, adults can add their own words (names of family members, pets, words from school) and delete words. Only words are managed; their syllables are derived from them and appear in the syllable level automatically. Built-in words cannot be deleted for good, only hidden and shown again.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| What is managed | Only words; syllables are derived from the words | Syllables without words make no sense for the goals (level 2 counts buildable words) |
| Syllable split | The game suggests a split while typing ("Ba-na-ne"); the adult can correct it with hyphens | Comfortable and still always correct, since automatic German hyphenation is not always right |
| Journey | Assigned automatically: only open syllables without letter combinations -> T-Rex; closed syllables or letter combinations -> Triceratops; 3+ syllables -> additionally long-neck (same rule as built-in words). Never pterosaur (its words come from the stories) | Difficulty stays consistent with the journeys |
| Deleting | Own words are deleted for good; built-in words are only hidden and can be shown again | Nothing built-in is lost by accident |
| Pictures | Own words have no picture; they appear in reading, building, find-the-word, and as distractors in gap sentences, but not in picture variants (word-picture, memory) | No effort for the adults; picture variants need a picture |
| Word type | Capitalized -> noun, lower case -> other (verb/adjective); own words appear in gap sentences only as distractors | No extra question for the adults; there are no sentences for own words |
| Progress after delete/hide | Completed levels, stars, and the dino stage stay; the word no longer counts for open goals and no longer appears | No visible loss of progress for the child |
| Unknown sounds | Words may contain sounds the child has not selected in level 1 yet; a hint names them ("Enthält c, das noch nicht gelernt ist - das Wort erscheint, sobald alle Laute gelernt sind"). Characters that are no sound item of the game at all (spaces, digits, symbols, ß, é ...) are rejected | Allows names like "Cola" while staying honest about when they appear |
| Duplicates | A word whose id (lower case) already exists is rejected; if it is a hidden built-in word, the dialog offers to show it again | Ids must stay unique (history, pools, goals reference them) |
| UI | Parent area gets a button "Wörter verwalten" -> own page `#/parents/words`: input field with split suggestion at the top, below all words grouped by journey with a search field; own words are marked; each word has a delete (own) or hide/show (built-in) button | Stays clear with about 300 words |

## Technical Details

### State (`js/state/defaultState.js`)

```js
content: {
  customWords: [ { id: 'kalle', display: 'Kalle', syllables: ['kal', 'le'], type: 'noun', custom: true } ],
  hiddenWordIds: ['salami']
}
```

A custom word is stored as `{ id, display, syllables, type, custom: true }` (same shape as built-in words, no `picture`). `normalizeState` fills `content` with empty lists for older saves.

### Pure logic (`js/logic/customWords.js`, unit tested)

- `suggestSyllables(display)` -> display parts such as `['Ba', 'na', 'ne']`: split into sound units with `splitIntoLetters`; between two vowel units one consonant unit goes to the next syllable, of several consonant units the last one goes to the next syllable ("ck", "sch", "ch", "qu" stay together as one unit).
- `parseCustomWord(text)` -> `{ word, error }` from input such as "Ba-na-ne" (hyphens optional, then the suggestion is used); `type` from the first letter's case.
- `validateCustomWord(word, existingIds, hiddenIds)` -> error codes `empty`, `invalidCharacters`, `duplicate`, `hiddenDuplicate`.
- `unknownSounds(word, letterPool)` -> sounds of the word not yet in `pools.letters` (for the hint).
- `journeysForWord(word)` -> journey ids by the rule in the decisions table.

### Content integration

- `activeProfile(state)` / `profileOf(journeyId, state)` return the static profile merged with the custom words of that journey and without hidden word ids (cached per `content` change). All levels already read words through the profile.
- `syllableSource` of a merged profile additionally contains the syllables of its custom words (syllable entries built like the built-in ones).
- `wordById` and `syllableById` also find custom words and their syllables (a small registry updated from the state on load and after every change of `content`).
- Hidden or deleted words are filtered from the profile, so they no longer count in `goalCount` and no longer appear in rounds; `completedLevels`, stars, and `dinoStage` are never recomputed.

### Screen (`js/screens/parentWords.js`, route `#/parents/words`, behind the parent gate)

- Input "Neues Wort" -> live suggestion shown as colored syllables ("Ba-na-ne"); the adult can type hyphens to correct; button "Hinzufügen". Errors and the unknown-sounds hint appear below the input.
- Search field filters the list; groups "T-Rex", "Triceratops", "Langhals"; each row: word split into syllables, a mark "eigenes Wort", and a button "Löschen" (own word, with confirmation) or "Ausblenden"/"Einblenden" (built-in word).
- BEM block `parent-words`.

## Acceptance Criteria

- An adult can add "Ba-na-ne"; it appears in the list of the T-Rex journey and can be read in level 3 once its syllables are mastered; its syllables appear in level 2 once all sounds are learned.
- Typing "Banane" without hyphens shows the suggestion "Ba-na-ne"; a corrected split with hyphens is stored as typed.
- A word with a closed syllable (e.g. "Ball") is assigned to the Triceratops journey; a word with 3+ syllables is also in the long-neck journey.
- Own words can be deleted (with confirmation); built-in words can be hidden and shown again.
- Hidden/deleted words no longer appear in rounds and no longer count for open goals; completed levels and stars stay.
- Duplicates are rejected; a hidden built-in duplicate can be shown again from the dialog.
- Words with sounds not yet learned show the hint; words with invalid characters are rejected.
- Own words never appear in picture variants.
- Older saves load without errors (empty `content`).

## Open Risks / Assumptions

- The split suggestion is a simple rule and will be wrong for some words (compounds, prefixes); the adult corrects it.
- Words are stored only in this browser (localStorage), like the rest of the progress.
- Making profiles depend on the state touches many modules; existing tests must keep passing with an empty `content`.
