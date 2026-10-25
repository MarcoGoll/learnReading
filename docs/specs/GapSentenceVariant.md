# Spec: GapSentenceVariant (Epic14)

## Overview / Goal

Level 5 variant: a short sentence is missing one learned word; the child picks the fitting word out of three. Afterwards the complete sentence is shown and read aloud. The game validates automatically.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Sentence source | Shared sentence list from SentenceReadingVariant (`js/data/sentences.js`) | No second list to maintain |
| Gap | One learned word token (never a sight word) is replaced by a gap | The child must read and understand the learned words |
| Distractors | Words of a different word type than the gap word (gap is a verb -> distractors are nouns / adjectives, etc.) | Automatic and usually unambiguous |
| Options | 3 words | Clear and manageable |
| After the choice | Automatic check; then the complete sentence is shown and read aloud via speech synthesis | Reinforces the sentence image |
| Wrong choice | Wrong word wiggles, correct word is inserted and highlighted, task counts as wrong | Consistent with the other choice variants |
| Round size | 6 tasks | Consistent with the other choice variants |

## Technical Details

### Pure logic (`js/logic/gapSentence.js`, unit tested)

- `gapCandidates(sentence, wordMaterial)` -> learned-word tokens of the sentence that are in the material
- `buildTask(sentence, wordMaterial, allWords)` -> `{ sentence, gapIndex, answer, options: shuffled([answer, 2 distractors]) }`
  - Distractors: words of a different `type` than the answer, preferably from the material; if not enough, from buildable words of the word list.
- `buildRound(availableSentences, wordMaterial, size = 6)` -> random sentences without repeats where possible

Uses `availableSentences` from SentenceReadingVariant and `speak` from `js/audio/speech.js` (silently skipped if no German voice exists).

### Variant registration

`id: 'gapSentence'`, title "Lückensatz"; available with at least 3 available sentences.

### Display and flow

- Sentence large at the top with a dashed gap box (`gap-sentence__gap`); sight words marked grey, learned words with colored syllables; three word cards below.
- Tap -> the word flies into the gap -> check -> feedback (sounds and effects) -> full sentence is spoken -> next task after a short pause or a tap on "Weiter".
- Correct: 50 base points (plus streak bonus). BEM block `gap-sentence`.

## Acceptance Criteria

- Each task shows a sentence with exactly one gap at a learned word; sight words are never gaps.
- Three options; distractors have a different word type than the answer.
- After the choice, the complete sentence is shown and spoken (if a German voice exists).
- Correct choice earns 50 points (plus streak bonus); wrong choice inserts and highlights the correct word.
- `gapSentence.js` has unit tests for gap selection and distractor types.

## Open Risks / Assumptions

- In rare cases a distractor of another word type may still fit grammatically (e.g. an adjective after "ist"); sentences in the list are written so that the gap position allows only one word type.
