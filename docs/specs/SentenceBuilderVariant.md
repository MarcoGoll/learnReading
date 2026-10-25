# Spec: SentenceBuilderVariant (Epic16)

## Overview / Goal

Level 5 variant: like level 4, but with words. A sentence is spoken aloud; the child builds it from shuffled word tiles via drag and drop. The game validates automatically.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Target sentence | Spoken via speech synthesis with repeat button; "Satz zeigen" fallback for the adult without a German voice | Same behavior as level 4 |
| Tiles | Only the words of the sentence, no distractors | Finding the order is hard enough |
| Fixed parts | Capital letter at the sentence start and the final period are given | The child focuses on word order |
| Attempts / points | 1st attempt: 50 (streak bonus applies); 2nd attempt: 25, streak ends; after two wrong attempts the sentence is shown, 0 points | Same scheme as level 4 |
| Round size | 5 sentences | Consistent with SentenceReadingVariant |

## Technical Details

### Reuse

- Sentences from `js/data/sentences.js` and `availableSentences` (SentenceReadingVariant), limited to sentences with 3-4 tokens (2 tokens are too easy to order).
- Drag-and-drop component and `speech.js` from DragDropWordLevel; the tile component is generalized to accept word tiles.

### Pure logic (`js/logic/sentenceBuilder.js`, unit tested)

- `buildTask(sentence)` -> `{ sentence, slots: tokens.length, tiles: shuffled(tokens) }`; the shuffle never returns the original order
- `checkAnswer(task, placedTokens)` -> compares token ids in order (duplicate tokens allowed)
- Points via the level 4 scheme with base 50

### Display

- Tiles show the words in their sentence form: the first word of the sentence is capitalized only once it sits in the first slot (the slot shows the capital letter), nouns keep their capital letter; sight words grey, learned words with colored syllables.
- A fixed period after the last slot.
- BEM blocks: `sentence-builder`, reusing `syllable-tile` styles via a shared `drag-tile` block.

### Variant registration

`id: 'sentenceBuilder'`, title "Satz bauen"; available with at least 3 available sentences of 3-4 tokens.

## Acceptance Criteria

- The target sentence is spoken automatically and can be repeated; without a German voice, "Satz zeigen" shows it to the adult for about 3 seconds.
- Tiles contain exactly the sentence's words in an order different from the solution.
- Tiles can be placed by dragging (mouse and touch) and by tapping.
- The check runs automatically when all slots are filled; points as defined (50 / 25 / 0).
- The sentence start is capitalized and the period is fixed.
- `sentenceBuilder.js` has unit tests for shuffling, checking, and points.

## Open Risks / Assumptions

- Some sentences may allow more than one valid order ("Oma ist da." / "Da ist Oma."); only the listed order counts. Sentences with ambiguous order should be avoided in the list.
