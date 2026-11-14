# Spec: ProgressHints (Epic33)

## Overview / Goal

It is sometimes unclear why a level is not completed or the next level stays locked. Every dino now tells which level is next and what exactly is missing.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Level map | A hint box below the level map names the open level and what to do, e.g. "Es fehlen Silben: Spiele Level 1 und wähle mehr Buchstaben." | The adult sees directly what to do |
| Locked level | Tapping a locked level opens a dialog that names the level to finish first and its missing amount | Locked islands were silent before |
| Dino valley | Every hatched dino shows its next step, e.g. "Level 3: noch 2 Wörter lesen" | Overview over all dinos |
| Blockers | Detected blockers: too few letters for new syllables (level 2), too few syllables for new words (level 3), too few read words to build (level 4), same adventure played again (level 5) | These are the cases where playing the same level does not help |

## Technical Details

- Pure function `progressHint(journeyId, state)` in `js/logic/progressHints.js` returns `{ level, text }` for the next open level of a journey, using the existing goal rules (`levelGoal`).
- The function works for any journey, not only the active one.
- Unit tests cover each blocker.

## Acceptance Criteria

- The home screen shows a hint text for the open level below the level map (highlighted when the level is blocked).
- Tapping a locked level shows which level must be finished and what is missing.
- The valley shows the next step for every started dino; fully grown dinos show "ausgewachsen".
- Blocker texts point to the level that actually helps.
