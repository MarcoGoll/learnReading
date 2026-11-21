# Spec: DivisionLevel (Epic45)

## Overview / Goal

Math level 6 of the first math journey: division as the inverse of multiplication with the tables 1, 2, 5, and 10, always without remainder. The picture shows food shared fairly among dinos.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Task range | p : t with p = f · t, f in 1-10, t in the configured tables (journey 1: 1, 2, 5, 10); additionally p : f = t for the same products | Inverse of exactly what was learned in level 5; no remainder |
| Divisor | Never 0 | - |
| Input | Number pad | - |
| Visual help | "Sharing": p food pieces distributed onto t little dinos (one row per dino) via help button and after a wrong attempt | Division as fair sharing is the most intuitive model for children |
| Goal | 15 different tasks correct at the first attempt | - |
| Points | 40 base points | MathTaskEngine scale |
| Display | Operator `:`, speech "geteilt durch" | German school notation |

## Technical Details

- Level config: `{ kind: 'divide', tables: [1, 2, 5, 10], factorMax: 10, input: 'pad', aid: 'sharing', aidMode: 'onRequest', goal: 15 }`.
- Task ids: `divide:15:5`; display `15 : 5 = ?`; speech "15 geteilt durch 5".
- Sharing aid: t small dino heads in a column, each with a row of p / t food pieces after the solution; before solving, the p pieces are shown as a heap and t empty plates; after a wrong second attempt the pieces move onto the plates (CSS animation).
- Dino stage after completion: 4. Level 7 opens.

## Acceptance Criteria

- Every division task has an integer result and a divisor from 1 to 10.
- Every task of journey 1 is the inverse of a level 5 task of the same journey.
- The sharing picture matches the task and shows the fair distribution after solving.
- The level is completed after 15 different tasks were answered correctly at the first attempt; the dino reaches stage 4.
- Unit tests check for remainder-free tasks, divisor range, and correspondence with the multiplication tasks.
