# Spec: DinoCare (Epic30)

## Overview / Goal

Tamagotchi-like care for every dino: after each finished round the child may feed the dino, play with it, or clean its nest (remove the poop), each with a short funny animation. The needs decrease gently over days. This gives a reason to keep playing, also with easier dinos after all journeys are done.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Needs | Three needs per dino: hunger (food), fun (play), cleanliness (nest) | Familiar Tamagotchi triad, easy to show |
| Earning care | After every finished round (at least 3 judged tasks) the child chooses one of three actions: feed, play, clean; the action for the lowest need blinks as a suggestion | The child decides; the hint teaches what the dino needs |
| Effect | One action raises its need by 50 % (max. 100 %) | 2 rounds fill a need completely |
| Decrease | Each need decreases by about one third per day (calculated from the time stamp, also while the game is closed); never below 0; no sickness, no death, no punishment | A gentle incentive without pressure |
| Per dino | Every dino has its own needs; the active dino (the one being played with) receives the care | Encourages playing with each dino |
| Display | Home screen and valley: three small bars with icons (food, ball, broom); the dino shows its mood: hungry dino looks longingly, bored dino yawns, dirty nest shows a small pile next to the dino | Visible without text |
| No care without learning | Care actions only after rounds, no free tapping | The child should read, not only care |

## Technical Details

### State (per journey)

```js
care: { hunger: 80, fun: 60, clean: 100, updatedAt: 1735000000000 }
```

### Pure logic (`js/logic/care.js`, unit tested)

- `currentNeeds(care, now)` -> needs after the decrease since `updatedAt` (33 points per 24 h, linear, min. 0)
- `applyCareAction(care, action, now)` -> new care (+50, max. 100, `updatedAt = now`)
- `suggestedAction(needs)` -> action with the lowest need
- `moodOf(needs)` -> `happy` (all >= 50), `hungry`, `bored`, or `dirty` (lowest need below 50)

### UI

- After the round summary ("Weiter") and after the evolution scene (if the dino grows): a care screen with the three need bars, the active dino (with the poop pile while cleanliness is below 50 %; it only disappears through cleaning) and three big buttons (food icon, ball icon, broom icon); the suggested one pulses. Tap -> animation (2-3 s) -> continue.
  - Feed: a leaf/berry flies to the dino, chewing animation, sound.
  - Play: a ball bounces, the dino jumps after it.
  - Clean: the poop pile next to the dino is swept away with sparkles.
- The poop pile and mood animations are small inline SVGs placed next to the dino element (BEM block `care`).
- Icons from Google Material Icons (`restaurant`/`nutrition`, `sports_baseball`, `cleaning_services`) under `assets/icons/`.
- Home screen and valley: `care-bars` component with three bars.

## Acceptance Criteria

- After a finished round with at least 3 judged tasks, the care screen appears; the action with the lowest need pulses.
- Each action raises its need by 50 % (max. 100 %) for the active dino only and plays its animation.
- Needs decrease by about one third per day, also while the game is closed, never below 0.
- Home screen and valley show the three needs per dino; a need below 50 % changes the dino's mood display (longing look, yawn, poop pile).
- No care action is possible without finishing a round.
- Unit tests cover decrease, actions, suggestion, and mood.

## Open Risks / Assumptions

- The time-based decrease uses the device clock; changing the clock changes the needs. Accepted.
