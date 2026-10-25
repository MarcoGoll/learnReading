# Spec: DinoEvolution (Epic4)

## Overview / Goal

A cute T-Rex grows with the child's progress. Each completed level unlocks exactly one new stage, presented as a short full-screen scene. The child names the dino at the first start.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Species | Cute T-Rex | Best-known dino among children; big head and small arms suit funny animations |
| Coupling | One stage per completed level (first completion only) | Simple and easy for the child to understand |
| Stage 4 | First roar on a rock | Works well as animation with a funny sound |
| Name | Chosen at first start (adult types it), stored in the state, used on home screen and in texts | Strengthens the child's attachment |
| Intro | The naming dialog starts with a short story (an egg in the jungle that the child helps grow); after naming, a greeting "Die Reise von <Name> beginnt!" explains that every completed level lets the dino grow | Gives the child a reason to play |
| Presentation | Full-screen scene (about 4-6 s) with sound after a level is completed for the first time; afterwards the dino is shown in its new stage on the home screen with an idle animation | Makes the evolution a highlight |

## Technical Details

### Stages

| Stage | Unlocked by | Idle on home screen | Evolution scene |
|-------|-------------|---------------------|-----------------|
| 0 Egg | Start | Egg wobbles gently from time to time | - |
| 1 Baby | Level 1 | Baby blinks, breathes | Egg cracks, baby hatches |
| 2 First steps | Level 2 | Little dino tips from foot to foot | Baby stands up wobbly and takes first steps |
| 3 First insect | Level 3 | Dino looks around, tail wags | Dino chases a dragonfly and snaps it |
| 4 First roar | Level 4 | Young dino on a rock, chest out | Dino climbs a rock and roars (screen shakes slightly) |
| 5 Fully grown | Level 5 | Big T-Rex, idle stomp | Dino grows big, stomps, confetti, "<Name> ist ausgewachsen!" |

### Graphics and animation

- Hand-written, simple flat SVGs under `assets/svg/dino/` (one file per stage, plus separate parts like eggshell, dragonfly, rock where needed).
- SVGs are inlined into the DOM so their parts (eyes, tail, legs) can be animated with CSS keyframes; JS only starts/ends scenes and sequences steps.
- Animations also run with `prefers-reduced-motion`; only the screen shake of stage 4 is dropped there.
- BEM blocks: `dino` (modifiers `--stage-0` ... `--stage-5`), `evolution-scene`.

### Component API

```js
/** Renders the dino of the given stage with its idle animation. */
renderDino(containerElement, stage)

/** Plays the full-screen evolution scene for the new stage; resolves when finished or skipped. */
playEvolutionScene(newStage, dinoName) -> Promise<void>
```

The scene can be ended early by a tap after 2 s (in case it is replayed).

### State

`dinoStage` (0-5) and `dinoName` (string, max. 20 characters) in the game state. Naming happens in a first-start dialog ("Wie soll dein Dino heißen?") before the home screen; the name can be changed in the parent area.

### Flow

Level completed for the first time -> foundation increases `dinoStage` -> round summary -> `playEvolutionScene` with sound (SoundsAndEffects) -> home screen with the new stage.

## Acceptance Criteria

- First start asks for the dino name; the name is shown on the home screen and in the evolution texts.
- On first start, the home screen shows the egg (stage 0).
- Completing level n for the first time plays the scene for stage n once and leaves the dino at stage n; replaying a completed level does not advance the dino.
- Each stage has its own idle animation on the home screen.
- After level 5, the fully grown dino is shown with confetti and a congratulation text.
- With `prefers-reduced-motion`, the scenes still play; only the screen shake is removed.
- The stage survives a page reload.

## Open Risks / Assumptions

- The quality of hand-written SVGs is limited; the style is deliberately simple. Graphics can be refined later without changing the logic.
