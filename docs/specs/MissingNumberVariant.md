# Spec: MissingNumberVariant (Epic47)

## Overview / Goal

A level 7 variant with tasks where one operand is missing instead of the result (3 + _ = 7). The child finds the missing number on the number pad.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Task form | `a op _ = c` or `_ op b = c`; the gap position is random | Both positions train thinking in inverse operations |
| Operations | Mix of the journey (plus, minus, times, divided) | MathChallengeLevel |
| Round | 10 tasks, two attempts each (MathTaskEngine pattern) | Same rhythm as levels 1-6 |
| Input | Number pad | - |
| Visual help | Help button shows the matching aid (insects / ten frame / egg rows / sharing) with the gap as "?" | Consistent help |
| Validity | Only tasks with a unique, integer solution; for times and divided no gap where 0 would make the solution ambiguous | Avoid unsolvable tasks |

## Technical Details

- `js/screens/mathChallenge/missingNumber.js` uses `mathRoundRunner` with tasks from `mixedTasks` turned into gap tasks: `toMissingNumberTask(task, missingIndex)` sets `missingIndex` and `answer = operands[missingIndex]`, display e.g. `3 + _ = 7`, speech "3 plus wie viel ist 7?".
- Excluded: multiplication tasks with a 0 factor in the gap position (none exist, factors start at 1) and division tasks with the gap on the dividend when the result would exceed the journey range.
- Passed: at least 5 of 10 correct (first or second attempt).
- History key: `math:missing:<taskId>:<missingIndex>`.

## Acceptance Criteria

- A round shows 10 gap tasks with a mix of operations and both gap positions.
- Every gap task has exactly one integer solution within the journey range.
- The display uses an underscore box for the gap; the speech text reads the task naturally.
- With at least 5 correct answers the variant counts as passed.
- Unit tests cover the conversion into gap tasks and the uniqueness of the solution.
