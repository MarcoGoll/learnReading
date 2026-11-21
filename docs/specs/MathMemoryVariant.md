# Spec: MathMemoryVariant (Epic48)

## Overview / Goal

A memory game for level 7 with task cards and result cards (e.g. "3 + 4" and "7"). The child flips two cards at a time and finds the matching pairs.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Size | 6 pairs (12 cards) | Same as the word memory, fits on a tablet |
| Pairs | Task card + result card; all 6 results are different | Each card has exactly one partner |
| Operations | Mix of the journey | MathChallengeLevel |
| Scoring | Like the word memory: points per found pair, the number of moves decides the round result | Reuses `wordMemory` logic and layout |
| Passing | Passed when all pairs are found within at most 12 moves (counts as "at least half correct") | Translates the half rule into the memory mechanic |

## Technical Details

- `js/screens/mathChallenge/mathMemory.js` reuses the board and card flip of `js/screens/challenge/wordMemory.js` / `css/components/memory-board.css`; the deck is built with a new `buildMathDeck(tasks, pairCount = 6, randomFn)` in `js/logic/math/mathMemory.js`.
- Card faces: task card shows the task text without "= ?" (e.g. `3 · 5`), result card shows the number in a different card colour (BEM modifier `memory-card--result`).
- Stats for stars: `taskCount = 6`, `correctCount` = pairs found at the first try of each pair (both cards flipped without a previous miss on that pair).
- Points: 50 per pair found, streak bonus as in the word memory.

## Acceptance Criteria

- The board shows 12 face-down cards: 6 tasks and their 6 different results.
- Matching task and result stay open; non-matching cards flip back.
- The variant is passed when all pairs are found within 12 moves.
- Points and stars are awarded and shown in the round summary.
- Unit tests cover the deck (unique results, pairs) and the passing rule.
