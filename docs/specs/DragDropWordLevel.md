# Spec: DragDropWordLevel (Epic9)

## Overview / Goal

Level 4. A word from the word pool is spoken aloud (and shown as a picture for nouns); the child builds it by dragging syllable tiles into slots. Correctly built words earn 40 points and form the pool for level 5.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Target word | Spoken via the browser's speech synthesis (German voice), repeat button; nouns additionally show their picture | Trains building words from sounds without showing the word |
| No German voice | A small "Wort zeigen" button for the adult briefly shows the target word so the adult can say it | Works on every device |
| Distractors | 1-2 additional known syllables from the syllable pool | Child must look carefully without being overwhelmed |
| Validation | Automatic as soon as all slots are filled; wrong -> tiles jump back, second attempt allowed; after the second wrong attempt the correct word is shown | Unambiguous, so no adult judgement needed |
| Points | 1st attempt: 40 (streak bonus applies); 2nd attempt: 20, streak ends; failed: 0 | Rewards care without punishing |
| Round / completion | Up to 5 words per round from `pools.words` (unbuilt words first); level 4 is completed when `pools.builtWords` has at least 5 words (built in 1st or 2nd attempt) | Short rounds; enough material for level 5 |

## Technical Details

### Speech module (`js/audio/speech.js`, shared with ReadAloudHelp)

```js
/** Returns true if a German voice is available. */
hasGermanVoice() -> Promise<boolean>
/** Speaks the text with a German voice at a slightly slower rate (0.8). */
speak(text)
```

Uses the Web Speech API (`speechSynthesis`, `lang: 'de-DE'`). Voices load asynchronously, so `hasGermanVoice` waits for the `voiceschanged` event (with a timeout).

### Pure logic (`js/logic/dragDropLevel.js`, unit tested)

- `buildTask(word, syllablePool)` -> `{ word, slots: n, tiles: shuffled(word syllables + 1-2 distractors) }`; distractors are different from the word's syllables
- `checkAnswer(task, placedSyllableIds)` -> boolean (compares syllable ids in order, so duplicate syllables like "ma ma" work)
- `pointsForAttempt(attempt, streakLength)` -> 40 / doubled with streak, 20, or 0
- `isLevelFourComplete(builtWordPool)` -> `length >= 5`

### Interaction

- Pointer Events (mouse, touch, pen) for dragging; tiles snap into the nearest free slot when dropped close enough, otherwise return to the tray.
- Alternative: tapping a tile moves it into the next free slot; tapping a placed tile moves it back. Helps small hands on a tablet.
- Sounds: `dragPickup`, `dragSnap`, `correct`, `wrong` (SoundsAndEffects).
- When correct: the word is shown with colored syllables and spoken once more.
- BEM blocks: `syllable-tile` (modifiers `--dragging`, `--placed`), `word-slots`, `drag-task`.

### Flow

1. Start -> pick up to 5 words (unbuilt first) -> first task, word is spoken automatically.
2. Child builds -> automatic check -> points / second attempt / reveal.
3. After the last task -> merge built words into `pools.builtWords` -> summary -> on first completion: dino stage 4 (first roar).
4. Undo and "Noch nicht" from JudgeControls are not used here; a "Weiter" button lets the adult skip a word (no points, not added).

## Acceptance Criteria

- The target word is spoken automatically and can be repeated; nouns show their picture.
- Without a German voice, the "Wort zeigen" button is available and shows the word for about 3 seconds.
- Tiles contain the word's syllables plus 1-2 distractors, in random order.
- Tiles can be placed by dragging (mouse and touch) and by tapping.
- A correct word on the 1st attempt earns 40 points (plus streak bonus), on the 2nd attempt 20; after two wrong attempts the word is shown and earns 0.
- Level 4 is completed once 5 different words have been built; the dino roars.
- `dragDropLevel.js` has unit tests for task building, checking (including duplicate syllables), and points.

## Open Risks / Assumptions

- Quality and availability of German voices differ between devices; the adult fallback covers missing voices.
- Words without a picture (verbs, adjectives) rely on speech or the adult.
