# Spec: MathOperationDinos (Epic53)

## Overview / Goal

Playing showed that the first math dino was too hard: plus, minus, times, and divided all came up in one journey. The math world is therefore split by operation. There is one dino per operation; all four are available from the start and independent, so the child practises the operation that is hard and still reaches the last level with the others. This replaces the three difficulty journeys (MathJourneys, HarderMathContent); task engine, aids, number pad, read-aloud, and variants stay.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Dinos | Plus = Stegosaurus, Minus = Panzersaurier (Ankylosaurus), Mal = Kammsaurier (Parasaurolophus), Geteilt = Dickkopfsaurier (Pachycephalosaurus, new) | Reuses the three drawn species; the dome head is clearly different from all others |
| Availability | All four unlocked from the start; each asks for a name on its first visit (egg) | Progress in one operation never blocks another |
| Plus ladder | L1 numbers and quantities up to 10, L2 plus up to 10, L3 up to 20 without crossing ten, L4 up to 20 with crossing, L5 up to 100 without crossing tens, L6 up to 100 with crossing, L7 adventures | Small steps; numbers belong before the first addition |
| Minus ladder | L1 minus up to 5, L2 up to 10, L3 up to 20 without crossing, L4 up to 20 with crossing, L5 up to 100 without crossing, L6 up to 100 with crossing, L7 adventures | Same ladder as plus |
| Times / divided ladder | L1 tables 1, 2, 10; L2 table 5; L3 tables 3, 4; L4 table 6; L5 tables 7, 8, 9; L6 all tables mixed; L7 adventures. Divided is always the inverse of the tables, without remainder | One or two new tables per level |
| Switching | In the math world a bar with four large buttons (+, -, ·, :) and a small dino picture sits below the Lesen/Rechnen tabs | One tap, no detour via the valley |
| Adventures | Only tasks of the dino's operation. Plus and minus: missing number, memory, number wall, number line (3 of 4 needed). Times: missing number, memory, number line jumps (all 3 needed). Divided: missing number, memory, new adventure "Futter verteilen" (all 3 needed) | Every adventure fits its operation; always 3 passed adventures complete level 7 |
| Existing progress | The math world starts completely anew: all math dinos become eggs again, math records, stars, and math history are removed. Total points and bought accessories stay | Chosen by the user; the old levels do not match the new ladders |
| Dino stages | Unchanged mapping 1 -> 1, 2 -> 2, 4 -> 3, 6 -> 4, 7 -> 5 | Same pictures (egg + 5 stages) |
| Celebration | The math celebration plays once when all four math dinos are fully grown | - |

## Technical Details

### Journeys (`js/data/journeys.js`)

```js
{ id: 'stegosaurus',        operation: 'add',      title: 'Plus-Dino: Stegosaurus',       speciesName: 'Stegosaurus' },
{ id: 'ankylosaurus',       operation: 'subtract', title: 'Minus-Dino: Panzersaurier',    speciesName: 'Panzersaurier' },
{ id: 'parasaurolophus',    operation: 'multiply', title: 'Mal-Dino: Kammsaurier',        speciesName: 'Kammsaurier' },
{ id: 'pachycephalosaurus', operation: 'divide',   title: 'Geteilt-Dino: Dickkopfsaurier', speciesName: 'Dickkopfsaurier' }
// all: subject 'math', levelCount 7, order 1 (no successor), plus an intro text for the egg dialog
```

- `nextJourney` returns nothing for math journeys (all are unlocked from the start).
- `createJourneyState` unlocks every math journey (not started).

### Profiles (`js/content/mathProfiles.js`)

| Dino | L1 | L2 | L3 | L4 | L5 | L6 |
|------|----|----|----|----|----|----|
| Plus | numbers 0-10 (cards), goal 10 | add <= 10, goal 15 | add <= 20 no crossing, goal 15 | add <= 20 crossing, goal 15 | add <= 100 no crossing, goal 15 | add <= 100 crossing, goal 15 |
| Minus | subtract <= 5, goal 10 | subtract <= 10, goal 15 | <= 20 no crossing, goal 15 | <= 20 crossing, goal 15 | <= 100 no crossing, goal 15 | <= 100 crossing, goal 15 |
| Mal | tables 1, 2, 10, goal 15 | table 5, goal 12 | tables 3, 4, goal 15 | table 6, goal 12 | tables 7, 8, 9, goal 15 | all tables, goal 20 |
| Geteilt | same tables as inverse divisions, same goals | | | | | |

Visual help: always in L1-L3 for plus/minus (L5 with tens and units always), on request from L4; eggs / sharing always in L1-L2, on request afterwards.

Adventure settings per profile: `{ operations: [operation], max, tables, wallMax, lineMax, variants: [...] }` (plus/minus range 100; times line 0-100).

### State version 4 (migration from version 3)

- All math journeys are replaced by fresh journey states (unlocked, not started); `lastJourneyBySubject.math = 'stegosaurus'`; `mathFamilyCelebrated = false`; history keys starting with `math:` are removed.
- If a math journey was active, the active journey becomes the last reading journey.

### Variants

- `numberLineTasks` uses the operations of the profile (division is never placed on the line).
- Number wall: `createWall(maxTop, randomFn, mode)`; mode `add` uses only gaps that need addition (upper bricks), mode `subtract` only patterns that need at least one subtraction.
- New variant `shareFood` ("Futter verteilen", `js/logic/math/shareFood.js`, `js/screens/mathChallenge/shareFood.js`): a heap of food (total <= 30) and 2-5 small dinos. The child taps a dino to give it one piece and taps a piece on a plate to take it back. When the heap is empty the game checks whether every dino got the same amount: fair -> solved (shows "15 : 5 = 3"); not fair -> second attempt (pieces return to the heap); second failure -> the fair sharing is shown. 6 tasks per round; passed with at least half solved.
- Variant registry: each profile lists its variants; the menu shows only those.

### UI

- `js/components/operationBar.js` (BEM block `operation-bar`): four buttons with the operation sign and the small dino (stage picture), the active one highlighted; shown on the home screen in the math world.
- Choosing an unstarted dino shows its egg and the naming dialog; cancelling returns to the previously active math dino (or to reading when none is started).
- Valley: the math group shows four spots.

## Acceptance Criteria

- The math world has four dinos (plus, minus, times, divided), all available from the start; each starts as an egg and asks for a name on its first visit.
- The operation bar switches between the four dinos with one tap; the reading world does not show it.
- Each dino's levels contain only its own operation (the plus dino also has the numbers level) with the ladders listed above.
- Level 7 of each dino offers only the adventures of its operation and is completed with 3 passed adventures.
- "Futter verteilen" works with taps on dinos and plates; fair sharing solves the task, unfair sharing allows a second attempt.
- A version 3 save is migrated: reading progress, total points, and accessories stay; all math dinos start as eggs; math history is removed.
- The math celebration plays once when all four math dinos are fully grown.
- Unit tests cover the profiles (ranges, tables, operation per dino), the migration, the wall modes, the share-food logic, and the variant lists.

## Open Risks / Assumptions

- The Dickkopfsaurier is generated by `scripts/generateMathDinos.js` like the other math species.
- Goal sizes may need tuning after real play.

## Implementation Notes

- The operation signs of the bar are drawn as SVG, because the small dot and colon of the font were hard to see.
- Number ranges above 10 never use 0 as an operand (e.g. no "12 - 0" in the levels up to 20).
- The naming dialog has no cancel button, so the fallback after a cancelled naming (back to the previous dino) only applies when the dialog is closed otherwise.

