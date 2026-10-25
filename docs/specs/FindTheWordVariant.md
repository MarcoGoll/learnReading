# Spec: FindTheWordVariant (Epic13)

## Overview / Goal

Level 5 variant: a word is spoken aloud; the child taps it among four displayed words. Similar-looking distractors train careful reading. The game validates automatically.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Announcement | Browser speech synthesis with repeat button; without a German voice, the adult "Wort zeigen" fallback (as in DragDropWordLevel) | Same behavior as level 4; the child can play alone |
| Options | 4 words; distractors similar to the target are preferred | Trains careful reading (Rose / Hose / Dose) |
| Wrong choice | Wrong word wiggles, correct word lights up, task counts as wrong (same as WordPictureVariant) | Consistent across choice variants; no trial and error |
| Round size | 6 tasks | Consistent with WordPictureVariant |

## Technical Details

### Pure logic (`js/logic/findTheWord.js`, unit tested)

- `similarityScore(wordA, wordB)` -> higher when words share syllables, the first letter, or the length in syllables
- `buildTask(target, wordMaterial, allWords)` -> `{ target, options: shuffled([target, 3 distractors]) }`
  - Distractors come from the child's word material, sorted by similarity (top candidates, then random among them to keep variety).
  - If the material has fewer than 3 other words, distractors are filled from buildable words of the word list (all syllables known).
- `buildRound(wordMaterial, size = 6)` -> random targets without repeats where possible

Uses `js/audio/speech.js` from DragDropWordLevel.

### Variant registration

`id: 'findTheWord'`, title "Wort finden"; available with at least 4 words in the material.

### Display and flow

- Speaker button large at the top (word is spoken automatically at the start of each task), four word cards in a 2x2 grid, words with colored syllables. BEM block `word-choice` (element `__option`, modifiers `--correct`, `--wrong`).
- Correct: 50 base points (plus streak bonus), `correct` sound; wrong: wiggle, correct word highlighted for about 1.5 s, streak reset.
- "Weiter" button for the adult skips a task. After 6 tasks the result goes to ChallengeLevel.

## Acceptance Criteria

- Each task speaks the target word automatically; the speaker button repeats it.
- Four words are shown, exactly one is the target; distractors are preferably similar to it.
- Without a German voice, "Wort zeigen" shows the target to the adult for about 3 seconds.
- Correct tap earns 50 points (plus streak bonus); wrong tap shows the correct word.
- `findTheWord.js` has unit tests for similarity, distractor selection, and the fallback.

## Open Risks / Assumptions

- Speech synthesis may pronounce some words imperfectly; the adult can always help.
