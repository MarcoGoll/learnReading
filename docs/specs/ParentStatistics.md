# Spec: ParentStatistics (Epic17)

## Overview / Goal

A statistics page in the parent area showing what the child has mastered, which items are often wrong, and how much the child practiced over the last 14 days.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Content | Overview per category (letters, syllables, words, sentences) with success rate per item, a "Oft falsch" list at the top, and a bar chart "Geübte Aufgaben pro Tag" for the last 14 days | Gives the adult a complete picture and a clear focus |
| Access | Inside the parent area (behind the parent gate from GameFoundation), route `#/parents/stats` | Statistics are for the adult, not the child |
| "Often wrong" definition | Same rule as PracticeDifficultItems (at least 2 wrong, rate below 70 %, not 3 correct in a row since) | One consistent definition |

## Technical Details

### History data (recorded by all levels and variants)

```js
history: {
  'letter:m':     { correct: 4, wrong: 1, notYet: 0, consecutiveCorrect: 2, lastSeen: '2026-10-25' },
  'syllable:ma':  { ... },
  'word:mama':    { ... },
  'sentence:s02': { ... }
},
dailyActivity: { '2026-10-25': 23 }   // number of judged / answered tasks per day
```

- Recorded via one function `recordResult(state, itemKey, result)` with `result` in `correct | wrong | notYet` (`js/logic/history.js`, unit tested).
- Sources: levels 1-3 (letters, syllables, words), level 4 (word), FindTheWord / WordPicture / GapSentence / WordMemory (the target word), SentenceReading / SentenceBuilder (sentence), PracticeDifficultItems (the practiced item).
- Undo in JudgeControls also reverts the history entry.
- Skip does not record anything. `dailyActivity` keeps only the last 60 days.

### Page layout (`js/screens/parentStats.js`)

1. **Oft falsch:** list of difficult items (display text, success rate, number of attempts), sorted by success rate ascending.
2. **Verlauf:** bar chart of `dailyActivity` for the last 14 days, drawn as inline SVG (no chart library); days without activity show an empty bar.
3. **Übersicht:** four collapsible sections (Buchstaben, Silben, Wörter, Sätze); each item as a small tile with its success rate, colored green (>= 80 %), yellow (50-79 %), red (< 50 %); untried items are not shown.

BEM blocks: `parent-stats`, `stats-chart`, `stats-item`.

### Pure logic (`js/logic/statistics.js`, unit tested)

- `successRate(entry)` -> correct / (correct + wrong), `null` if no judged attempts
- `difficultItems(history)` -> shared with PracticeDifficultItems
- `activityLastDays(dailyActivity, days = 14, today)` -> array of `{ date, count }`

## Acceptance Criteria

- The statistics page is only reachable through the parent area.
- "Oft falsch" lists exactly the items matching the difficulty rule, sorted by success rate.
- The bar chart shows the last 14 days including days without activity.
- The overview shows every tried item with its success rate and color.
- Undoing a judgement also reverts its history entry.
- `history.js` and `statistics.js` have unit tests.

## Open Risks / Assumptions

- History grows with use; with a few hundred items it stays well below localStorage limits.
