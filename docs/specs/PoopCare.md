# Spec: PoopCare (Epic35)

## Overview / Goal

A cleanliness bar makes no sense: a dino is either dirty (poop pile there) or clean. The bar is removed; the pile follows feeding.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Bars | Only two bars remain: hunger and fun | Cleanliness is a yes/no state |
| Poop | 3 hours after feeding a poop pile appears (if none is pending already) | Like a real pet; natural cause and effect |
| Cleaning | The "Sauber machen" button is only shown while a pile is there; cleaning removes it completely | Cleaning only makes sense with a pile |
| Suggestion / mood | A pile is the most urgent need: suggested action "clean", mood "dirty" | The pile is clearly visible |
| Old saves | The old `clean` value is ignored; every dino starts clean | Simple, no punishment |

## Technical Details

- Care state: `{ hunger, fun, poopAt, updatedAt }`; `poopAt` is the time the pile appears (0 = none pending).
- `hasPoop(care, now)`, `applyCareAction` (feed sets `poopAt = now + 3 h` if 0; clean sets `poopAt = 0`), `suggestedAction`, `moodOf` in `js/logic/care.js`.

## Acceptance Criteria

- Home screen, valley, and care screen show no cleanliness bar.
- 3 hours after feeding a pile is shown next to the dino.
- The clean button appears only with a pile; afterwards the pile is gone and stays gone until the next feeding.
- Unit tests cover the poop timing, cleaning, suggestion, and mood.
