# Spec: LevelStars (Epic29)

## Overview / Goal

Every level of every journey can earn up to 3 stars based on the accuracy of the best round. Missing stars on the level map give a clear reason to replay levels; all 15 stars of a journey unlock a special accessory for that dino.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Rule | Accuracy of a round = correct / judged tasks. 1 star: at least 50 %, 2 stars: at least 75 %, 3 stars: 100 % correct and no "Noch nicht" in the round. The best result per level is stored | Easy to understand; rewards accuracy |
| Minimum round size | Rounds with fewer than 3 judged tasks earn no stars | Prevents trivial 3-star rounds |
| Display | Level map: 3 star slots on every island; round summary: star animation (stars pop in one by one, new stars glow); dino valley: star total per dino ("12 von 15") | Visible where decisions are made |
| Bonus | All 15 stars of a journey unlock a special accessory for that dino only (T-Rex: golden cape, Triceratops: crown of flowers for horns, long-neck: rainbow scarf, pterosaur: aviator goggles) | Strong incentive to replay |

## Technical Details

### State

Per journey (DinoJourneys): `stars: { 1: 0, 2: 3, ... }` (best stars per level).

### Pure logic (`js/logic/stars.js`, unit tested)

- `starsForRound(correctCount, taskCount, notYetCount)` -> 0-3
- `applyStars(starsByLevel, level, stars)` -> `{ starsByLevel, newStars }` (only improvements count)
- `journeyStarTotal(starsByLevel)` -> 0-15
- `hasAllStars(starsByLevel)` -> boolean

### Integration

- The round session counts "not yet" results (`notYetCount`).
- `finishRound` / the challenge end apply stars; the summary receives `{ stars, previousStars }` and animates the difference.
- Special accessories are rewards with `journey` set and `threshold: null`; they are unlocked by `hasAllStars` and only shown in the wardrobe of their dino.

## Acceptance Criteria

- A round with 100 % correct and no "Noch nicht" earns 3 stars; 75-99 % earns 2; 50-74 % earns 1; below 50 % or fewer than 3 tasks earns none.
- Only better results replace the stored stars of a level.
- The level map shows the stars per level; the summary animates new stars; the valley shows the total per dino.
- All 15 stars of a journey unlock its special accessory once, with the reward popup.
- Unit tests cover the star rule and the improvement logic.

## Open Risks / Assumptions

- Level 4 counts a word solved in the 2nd attempt as correct for the accuracy; only the points are reduced.
