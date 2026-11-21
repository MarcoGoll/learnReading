# Spec: MathJourneys (Epic38)

## Overview / Goal

Math gets three own dino journeys, modelled as additional entries in the existing journey system. Each math journey has 7 levels, its own dino, progress, stars, records, care, and worn accessories. Points, rewards, and the valley are shared with reading. Progress in one subject never blocks the other.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Model | Three more entries in `JOURNEYS` with `subject: 'math'` and `levelCount: 7`; reading journeys get `subject: 'reading'`, `levelCount: 5` | Maximal reuse of progress, stars, care, wardrobe, valley |
| Journeys | 1 Stegosaurus, 2 Ankylosaurus (Panzersaurier), 3 Parasaurolophus (Kammsaurier) | Chosen in /spec (see MathDinoSpecies) |
| Availability | Math journey 1 is unlocked from the start (not started: egg + naming on first visit); journeys 2 and 3 are unlocked one after another when the previous math dino is fully grown | Same flow as reading journeys |
| Level completion (1-6) | A level is completed when a number of different tasks was answered correctly at the first attempt (collected across rounds) | Fits the goal bar on the map; rewards breadth instead of luck |
| Level 7 | Completed with 3 of 4 passed variants (MathChallengeLevel) | Same rule as reading level 5 |
| Dino stages | Same 6 pictures (egg + 5 stages); mapping level -> stage: 1 -> 1, 2 -> 2, 4 -> 3, 6 -> 4, 7 -> 5; levels 3 and 5 give no new stage | No extra artwork |
| Celebration | One celebration per world: the existing one for the 4 reading dinos, a new one for the 3 math dinos ("Deine Rechen-Dino-Familie ist komplett!") | No subject waits for the other |
| Shared | Total points, unlocked rewards, history, settings, valley | Both subjects pay into the same shop |

## Technical Details

### Journey definitions (`js/data/journeys.js`)

```js
{ id: 'trex', subject: 'reading', levelCount: 5, ... },          // existing four get subject + levelCount
{ id: 'stegosaurus', species: 'stegosaurus', subject: 'math', levelCount: 7, order: 1,
  speciesName: 'Stegosaurus', title: 'Rechen-Reise 1: Stegosaurus' },
{ id: 'ankylosaurus', species: 'ankylosaurus', subject: 'math', levelCount: 7, order: 2,
  speciesName: 'Panzersaurier', title: 'Rechen-Reise 2: Panzersaurier' },
{ id: 'parasaurolophus', species: 'parasaurolophus', subject: 'math', levelCount: 7, order: 3,
  speciesName: 'Kammsaurier', title: 'Rechen-Reise 3: Kammsaurier' }
```

- `order` is counted per subject; `nextJourney(id)` only returns journeys of the same subject.
- New helpers: `journeysOfSubject(subject)`, `subjectOf(journeyId)`.

### Math content profiles (`js/content/mathProfiles.js`)

One profile per math journey with level titles, level configs (MathTaskEngine), goal targets, and visual help. Journey 1:

| Level | Title | Config | Input | Aid | Goal (different tasks) |
|-------|-------|--------|-------|-----|------------------------|
| 1 | Zahlen | count + pickQuantity, 0-10 | cards | dots | 10 |
| 2 | Plus | add, sum <= 10, with 0 | pad | insects | 15 |
| 3 | Minus | subtract, 0-10, result >= 0 | pad | insects | 15 |
| 4 | Bis 20 | mixed add/subtract up to 20, 50 % crossing ten | pad | tenFrame (on request) | 20 |
| 5 | Mal | multiply, tables 1, 2, 5, 10 | pad | eggRows (on request) | 15 |
| 6 | Geteilt | divide, inverse of tables 1, 2, 5, 10, no remainder | pad | sharing (on request) | 15 |
| 7 | Abenteuer | variants, mix of all operations of this journey | - | - | 3 variants |

Journeys 2 and 3 are defined in HarderMathContent.

### State version 3 (with migration from version 2)

- `STATE_VERSION = 3`. `migrateFromVersion2(state)`: adds the three math journeys (`createJourneyState`), sets `stegosaurus.unlocked = true` (not started), adds `lastJourneyBySubject: { reading: state.activeJourney, math: 'stegosaurus' }` and `mathFamilyCelebrated: false`, sets `version: 3`.
- Math journey state uses the existing fields; `mastered` gets keys 1-6 (ids of tasks answered correctly at the first attempt).
- `LEVEL_COUNT` is replaced by `journeyById(id).levelCount` in `levelProgress.js`, `progressHints.js`, and `stars.js` (`MAX_JOURNEY_STARS` becomes `maxJourneyStars(levelCount) = levelCount * 3`).
- `completeLevel` uses a stage mapping per subject: reading `stage = level`, math `MATH_STAGE_BY_LEVEL = { 1: 1, 2: 2, 4: 3, 6: 4, 7: 5 }`.
- `finishRound` unlocks the next journey of the same subject when the last level of the journey (`levelCount`) is completed.
- `isFamilyComplete(state, subject)` checks only the journeys of one subject; the valley shows the reading celebration (`familyCelebrated`) and the math celebration (`mathFamilyCelebrated`) separately.
- `waitingEgg(state, subject)`: the valley may show one waiting egg per subject.

### Goals and hints

- `js/logic/math/mathLevelGoals.js`: `mathLevelGoal(level, state, roundIds)` with texts like "Ziel: 15 verschiedene Plus-Aufgaben auf Anhieb richtig" and the same return shape as `levelGoal`, so `goalBanner`, the map, and the round summary can show it.
- `progressHints.js` gets a math branch ("Löse noch 4 Plus-Aufgaben auf Anhieb richtig.").

## Acceptance Criteria

- An existing version 2 save is migrated to version 3 without loss; the Stegosaurus journey is unlocked but not started.
- Each math journey has 7 levels; level 1 is open at the start, every further level opens after the previous one is completed.
- Levels 1-6 complete when their goal number of different tasks was answered correctly at the first attempt.
- The dino stage follows the mapping 1 -> 1, 2 -> 2, 4 -> 3, 6 -> 4, 7 -> 5.
- After the Stegosaurus is fully grown, the Ankylosaurus egg appears in the valley; after that the Parasaurolophus egg.
- Reading journeys still unlock only reading journeys; math journeys only math journeys.
- Points earned in math count towards the shared total and the shop; stars, records, care, and worn accessories are kept per math dino.
- The math celebration plays once when all 3 math dinos are fully grown.
- Unit tests cover the migration, the stage mapping, unlocking per subject, goals, and `maxJourneyStars`.

## Open Risks / Assumptions

- Replacing `LEVEL_COUNT` touches several modules; the existing reading tests must keep passing unchanged.
- Star rewards that require "all stars of a journey" also apply to math journeys (21 stars).

## Implementation Notes

- `finishRound` returns `stageChanged`; the evolution scene only plays when the dino reached a new stage.
- Goals carry `completesImmediately` (reading level 5, math level 7) for the goal banner text.
