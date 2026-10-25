# Spec: WordMemoryVariant (Epic15)

## Overview / Goal

Level 5 variant: a memory game with word cards and picture cards. The child finds matching word-picture pairs; reading the word cards is required to match them.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Size | 6 pairs / 12 cards (fewer pairs only if the material does not allow 6, minimum 4) | Classic memory size, as chosen by the user |
| Pair type | One word card + one picture card per learned noun | Matching requires reading |
| Points | 50 base points per found pair (plus streak bonus for consecutive "correct" pairs) | Consistent with level 5 scoring |
| "Correct" pair | Every found pair counts as correct; mismatches are not counted as mistakes | In memory it is normal to find nothing for 3-4 turns; mistakes must not cost points, stars, or the round |
| Round passed | At least half of the pairs are correct (rule from ChallengeLevel) | Same rule as all variants |

## Technical Details

### Pure logic (`js/logic/wordMemory.js`, unit tested)

- `buildDeck(pictureTargets, pairCount = 6)` -> shuffled array of 12 cards `{ cardId, wordId, kind: 'word' | 'picture' }`
- Game state object: `matchedWordIds`, `openCardId`
- `flip(gameState, cardId)` -> returns the next state and an event (`firstCard`, `match`, `mismatch`)
- `pictureTargets` from WordPictureVariant (learned nouns with picture)

### Variant registration

`id: 'wordMemory'`, title "Wort-Memory"; available with at least 4 learned nouns that have a picture.

### Display and flow

- Grid of 12 cards (4x3 in landscape, 3x4 in portrait), card back with a dino footprint. BEM block `memory-board`, element `__card`, modifiers `--flipped`, `--matched`.
- Flip animation (CSS 3D rotate, fade with reduced motion). Two cards open: match -> both stay open with a glow, the word is spoken once, `correct` sound, points; mismatch -> `wrong` sound (soft), cards flip back after about 1.2 s.
- Game ends when all pairs are found -> result `{ correctCount: correct pairs, taskCount: pairs }` to ChallengeLevel.

## Acceptance Criteria

- The deck has 6 word cards and 6 matching picture cards of learned nouns (4-5 pairs if the material is smaller; greyed out below 4).
- Two open cards are compared; matches stay open, mismatches flip back.
- Each found pair earns 50 points; correct pairs extend the streak.
- A pair only loses its "correct" status through a mismatch made after both of its cards had been seen.
- The round is passed with at least half of the pairs correct.
- `wordMemory.js` has unit tests for deck building, flip events, and the correct-pair rule.

## Open Risks / Assumptions

- Requires at least 4 learned nouns with pictures; depends on picture coverage (WordPictureVariant).
