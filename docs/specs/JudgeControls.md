# Spec: JudgeControls (Epic2)

## Overview / Goal

A reusable component that lets the adult judge each read-aloud item as correct or wrong. It is used in every level and variant where the child reads aloud (levels 1-3, SentenceReadingVariant, PracticeDifficultItems) and works identically everywhere.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Input | Two large buttons (green check = correct, red X = wrong) plus keyboard shortcuts | Touch and mouse on tablet, fast operation on the laptop |
| Keyboard | Arrow right / Enter = correct, arrow left / Backspace = wrong, Space = skip, `n` = not yet, Ctrl+Z / `z` = undo | Easy to reach for the adult without looking |
| Undo | One-step undo of the last judgement, including its points and pool changes | Avoids frustration after a misclick |
| Skip | Skip button moves the current item to the end of the round without judgement or points | Child may be distracted for a moment |
| Not yet | "Noch nicht" button removes the current item from the round; it counts neither as correct nor as wrong and is not added to the pool; it can be chosen again in a later round | The adult can skip items the child cannot read yet, without discouraging the child |

## Technical Details

### Component API

```js
/**
 * Creates the judge controls and attaches them to a container.
 * @returns {{ destroy: Function, setEnabled: Function }}
 */
createJudgeControls(containerElement, {
  onCorrect: () => {},
  onWrong: () => {},
  onSkip: () => {},
  onNotYet: () => {},
  onUndo: () => {},
  canUndo: () => boolean
})
```

The component only reports the action; the level module owns the round logic (current item, queue, points). Undo is implemented by the level module keeping a stack with one entry (the last judgement).

### Shared round helper

To avoid duplicating round logic in every reading level, a pure module `js/logic/readingRound.js` manages:

- `queue` of remaining items, `results` (`{ item, correct }[]`), `lastAction` for undo
- `judge(correct)`, `skip()` (move item to end of queue), `notYet()` (remove item from the round, recorded as `notYet` in the results), `undo()`, `isFinished()`

It is covered by unit tests. "Not yet" does not change the streak and is undoable like a judgement.

### UI

- Buttons at the bottom of the screen, at least 80 px high, right-handed layout: wrong on the left, correct on the right; skip, "Noch nicht", and undo as smaller secondary buttons between them.
- Undo is disabled when there is nothing to undo.
- Buttons are briefly disabled (about 400 ms) after a judgement to prevent double taps.
- Each action triggers feedback via SoundsAndEffects (correct / wrong sound and animation).
- BEM block: `judge-controls` (elements `__button`, modifiers `--correct`, `--wrong`, `--skip`, `--undo`).
- Icons (check, close, skip_next, undo) from Google Material Icons, stored under `assets/icons/`.

## Acceptance Criteria

- Correct and wrong can be triggered by button and by keyboard; each triggers the matching callback exactly once.
- Undo reverts the last judgement including points; afterwards the same item is shown again; undo is then disabled until the next judgement.
- Skip moves the current item to the end of the round; it is shown again before the round ends.
- "Noch nicht" removes the current item from the round without points, without changing the streak, and without adding it to the pool.
- A round with only skipped items left does not loop forever: skipped items are shown again, and the adult can still judge them.
- Double taps within 400 ms do not cause two judgements.
- `readingRound.js` has unit tests for judge, skip, notYet, undo, and isFinished.

## Open Risks / Assumptions

- Keyboard shortcuts could be pressed by the child on a laptop; accepted, since undo exists.
