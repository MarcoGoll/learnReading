# Spec: PracticeDifficultItems (Epic18)

## Overview / Goal

A practice mode that specifically asks for letters, syllables, and words that were often read wrong. It appears as a "practice island" on the level map whenever there are difficult items.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Difficult item | At least 2 wrong answers and success rate below 70 % | Single slips do not count |
| No longer difficult | 3 correct answers in a row (also across practice rounds) | Real learning evidence instead of a lucky hit |
| Access | "Übungsinsel" on the level map, only visible when difficult items exist | The child can start it on its own |
| Points | Base points of the item's level (letters 10, syllables 20, words 30, plus streak bonus) count toward total points; no record, no dino stage | Practicing is rewarded but does not replace level progress |

## Technical Details

### Rule (`difficultItems` in `js/logic/statistics.js`, shared with ParentStatistics)

```js
isDifficult(entry) = entry.wrong >= 2
                  && successRate(entry) < 0.7
                  && entry.consecutiveCorrect < 3
```

`consecutiveCorrect` resets to 0 on every wrong answer, so an item becomes difficult again after new mistakes.

### Practiced item types

Letters, syllables, and words (read aloud and judged by the adult). Sentences are not practiced here.

### Flow

1. Level map shows the practice island with a badge (number of difficult items) when `difficultItems(history).length > 0`; route `#/practice`.
2. Round: up to 8 difficult items, those with the lowest success rate first; display matches the original level (letter pair tile, colored syllable, colored word).
3. JudgeControls (correct / wrong / skip / not yet / undo); results are recorded in `history`.
4. Round end: summary with points and the items that are no longer difficult ("Geschafft: ma, Rose!").
5. When no difficult items remain, the island disappears with a short celebration.

### Pure logic (`js/logic/practice.js`, unit tested)

- `buildPracticeRound(history, maxSize = 8)` -> item keys sorted by success rate ascending
- `pointsForPracticeItem(itemKey, streakLength)` -> base points of the item type, doubled from a streak of 3

## Acceptance Criteria

- The practice island only appears when difficult items exist and shows their number.
- An item becomes difficult with at least 2 wrong answers and a success rate below 70 %.
- An item leaves the practice list after 3 correct answers in a row.
- Practice points count toward total points, but do not change records or the dino stage.
- `practice.js` and the difficulty rule have unit tests.

## Open Risks / Assumptions

- Depends on the history data defined in ParentStatistics; both epics should share the same `history.js` module.
