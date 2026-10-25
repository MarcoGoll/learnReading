# Spec: DinoValley (Epic24)

## Overview / Goal

A separate screen showing the child's dino family in a valley landscape. The child sees all dinos with their progress, starts new journeys by tapping eggs, and chooses which dino (and therefore which difficulty) to play with.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Place | Own screen `#/valley`, opened by a "Dino-Tal" button on the home screen | Home screen stays clear with the active dino and the level map |
| Content | Every dino in its current stage with accessories and name, below it the journey progress ("Level 3 von 5") and its stars (LevelStars); locked species as grey silhouette with "?" | The child sees the whole collection and what is still to come |
| Movement | Dinos walk slowly back and forth; the pterosaur circles in the sky (only once it can fly, stage 3+) | The valley feels alive |
| Selection | Tapping a started dino makes it active and goes to the home screen; tapping an available egg starts the new journey (naming dialog) | One tap, no extra confirmation |

## Technical Details

### Screen (`js/screens/valley.js`)

- Background: wide valley (meadow, lake for the long-neck, sky for the pterosaur), drawn as inline SVG.
- One "spot" per species (fixed area); inside it the dino element (`createDino(species, stage, worn)`) wrapped in a moving container.
- Under each dino: name, "Level x von 5" (or "ausgewachsen"), star count, care state icon (DinoCare).
- The active dino is marked (e.g. a glowing ring and "Du spielst gerade mit Rexi").
- States per species:
  - locked: silhouette + "?"
  - egg available (unlocked, not started): egg with pulsing hint "Tippe auf das Ei!"
  - started: dino in its stage
- Family celebration (DinoJourneys) is played here when all 4 dinos are fully grown for the first time: confetti, all dinos jump, text "Deine Dino-Familie ist komplett!".

### Movement (CSS)

- `valley__walker`: translateX back and forth over 6-10 s with a mirrored dino at the turning points (`scaleX(-1)`), each dino with a different duration so they do not move in sync.
- Pterosaur from stage 3: circular path in the upper area.
- The movement container is separate from the dino element, so idle animations keep running.

### Home screen

- New button "Dino-Tal" next to "Dino-Schrank"; a badge appears when an egg is waiting.
- The home screen title and level map show the active journey ("Reise 2: Triceratops").

## Acceptance Criteria

- The valley shows all 4 species: started dinos in their stage with name, progress, stars, and accessories; the available egg with a hint; locked species as silhouettes.
- Tapping a started dino makes it active; the home screen and level map then show its journey.
- Tapping an available egg asks for a name and starts the journey.
- Dinos move slowly; the pterosaur flies from stage 3.
- The home screen shows a badge on the valley button when an egg is waiting.
- The family celebration plays once when all 4 dinos are fully grown.

## Open Risks / Assumptions

- On a phone in portrait, the 4 spots are arranged in a 2x2 grid instead of a wide landscape.
