# Spec: ReadAloudHelp (Epic19)

## Overview / Goal

After the child has tried to read an item and the adult judged it as wrong, the game speaks the correct reading aloud. The child hears the correct model only after its own attempt. Available for syllables, words, and sentences.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| When | Automatically after a "wrong" judgement; additionally a small speaker button for the adult during the task | Correct model only after the child's own attempt; the adult can still use it deliberately |
| Letters | No read-aloud help for single letters and sounds | Speech synthesis says the letter name ("em") instead of the sound ("mmm") |
| Engine | Browser speech synthesis via `js/audio/speech.js` (German voice, rate 0.8) | Already introduced in DragDropWordLevel |
| No German voice | The feature is silently disabled (speaker button hidden) | Nothing to fall back to; the adult reads instead |

## Technical Details

### Where it applies

| Screen | Item spoken |
|--------|-------------|
| Level 2 (syllables) | syllable, e.g. "ma" |
| Level 3 (words) | word |
| SentenceReadingVariant | full sentence |
| PracticeDifficultItems | syllable / word items (not letters) |

### Behavior

- After `onWrong`: wait for the `wrong` sound (about 600 ms), then `speak(item text)`; the next item appears only after the speech ends (or after a timeout of 4 s), so the child can listen.
- The adult speaker button sits next to the JudgeControls (small, not in the child's focus); BEM block `read-aloud-button`.
- Syllables are spoken as written; very short syllables (single vowels) are spoken as-is.
- Automatic speech respects the global sound toggle (SoundsAndEffects): if all sounds are off, nothing is spoken automatically.
- Parent area setting "Vorlesen nach Fehler" (on by default) to switch the automatic speech off; stored as `settings.readAloudAfterWrong`.

### Integration

`readingRound` (JudgeControls) gets an optional hook `afterWrong(item) -> Promise` that the level modules use to call the speech; no logic changes in the round itself.

## Acceptance Criteria

- After a "wrong" judgement for a syllable, word, or sentence, the correct reading is spoken automatically before the next item appears.
- For letters, nothing is spoken and no speaker button is shown.
- The adult speaker button speaks the current item on demand.
- Without a German voice, no speaker button appears and nothing is spoken.
- Muting all sounds or switching off "Vorlesen nach Fehler" stops the automatic speech.

## Open Risks / Assumptions

- Speech synthesis may pronounce isolated syllables oddly (e.g. "le"); accepted, the adult can correct.
