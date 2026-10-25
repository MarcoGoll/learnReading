# Spec: ScoreAndHighscore (Epic3)

## Overview / Goal

Points for every correct item, rising with the level, plus a record per level that the child can try to beat. Total points are shown as a long-term number that keeps growing.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Base points | Level 1 = 10, level 2 = 20, level 3 = 30, level 4 = 40, level 5 = 50 per correct item | Large numbers feel exciting; clear increase per level |
| Highscore | One record per level: the best score of a single round in that level | Fair comparison (level 1 does not compete with level 5); something concrete to beat |
| Total points | Sum of all points ever earned, shown on the home screen | Long-term progress that always grows |
| Wrong answers | No deduction; wrong simply earns 0 | Learning to read should not feel like punishment |
| Streak bonus | From the 3rd correct item in a row, each further correct item earns double base points; a wrong answer resets the streak; skip does not affect it | Extra incentive to stay focused |

## Technical Details

### State

```js
score: {
  total: 0,                         // all points ever earned
  levelRecords: { 1: 0, 2: 0, ... } // best round score per level
}
```

The running score of the current round lives only in the level module (not persisted until the round ends). `total` is updated after every judgement so points are not lost if the page is closed mid-round.

### Pure logic (`js/logic/scoring.js`, unit tested)

```js
/** Returns the points for one correct item. */
pointsForCorrect(level, streakLength)   // streakLength includes the current item
// streakLength >= 3 -> basePoints(level) * 2, else basePoints(level)

/** Returns updated records and whether a new record was set. */
applyRoundResult(levelRecords, level, roundScore) -> { levelRecords, isNewRecord }
```

Undo (JudgeControls) subtracts exactly the points the undone judgement added and restores the previous streak.

### UI

- During a round: score display at the top (round score, current level record next to it, streak indicator from 3 in a row, e.g. "3er-Serie!").
- Points fly from the item to the score display with a short animation (SoundsAndEffects).
- Round end screen: round score, level record, total points; on a new record a celebration (animation and sound) with the text "Neuer Rekord!".
- Home screen: total points; level map shows each level's record.
- BEM blocks: `score-board`, `round-summary`.

### Other modes

- Level 5 variants use 50 base points (the level 5 record covers all variants together).
- Scoring for PracticeDifficultItems and point spending for RewardCollection are defined in their specs.

## Acceptance Criteria

- A correct item in level n earns n * 10 points; from the 3rd correct item in a row, double.
- A wrong answer earns 0 points and resets the streak; skip does not change the streak.
- Undo restores the score and streak exactly as before the undone judgement.
- At the end of a round, a higher round score than the level record replaces the record and triggers the "new record" celebration.
- Total points and records survive a page reload.
- `scoring.js` has unit tests for base points, streak bonus, and record updates.

## Open Risks / Assumptions

- Rounds with more items yield higher scores, so records depend on the size of the pool. Accepted: a growing pool reflects real progress.
