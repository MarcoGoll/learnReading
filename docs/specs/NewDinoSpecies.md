# Spec: NewDinoSpecies (Epic23)

## Overview / Goal

Three more dino species - Triceratops, long-neck (Brachiosaurus), and pterosaur - each with an egg, 5 growth stages, idle animations, and evolution scenes in the same flat style as the T-Rex. Each species shows its own special ability while growing up.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Stages | Per species: 0 egg, 1 hatch, 2-4 species-specific steps, 5 fully grown (see table) | Each species shows what makes it special |
| Colors | T-Rex green, Triceratops orange, long-neck blue, pterosaur purple; eggs with matching spots | Species are distinguishable at a glance in the valley |
| Style | Same flat SVG style, same 200x200 viewBox, same CSS class structure (`dino__head`, `dino__eye`, `dino__tail`, `dino__leg`, anchors) | Idle animations, companion reactions, and accessories work without special cases |

## Technical Details

### Stages

| Stage | Triceratops | Long-neck | Pterosaur |
|-------|-------------|-----------|-----------|
| 0 | Orange-spotted egg wobbles | Blue-spotted egg wobbles | Purple-spotted egg wobbles |
| 1 | Hatches from the egg | Hatches from the egg | Hatches from the egg |
| 2 | First steps | First steps | Flaps its wings |
| 3 | Pushes a branch with its horns | Eats leaves high up in a tree | First small hop-flight |
| 4 | Clears a stone out of the way | Wades through a lake | Catches a fish |
| 5 | Fully grown, big frill and horns | Fully grown, very long neck | Fully grown, glides in the sky |

### Files

- SVGs under `assets/svg/dino/<species>/stage-0.svg` ... `stage-5.svg`; the T-Rex files move to `assets/svg/dino/trex/` (the old paths are updated everywhere).
- Every stage SVG contains the anchor groups `dino__anchor--head`, `--eyes`, `--neck`, so the existing accessories fit (anchor positions are set per species).
- Evolution scene props (branch, stone, tree, lake, fish) are small inline SVGs in the scene module, like the existing dragonfly and rock.

### Code changes

- `dinoPath(stage)` becomes `dinoPath(species, stage)`; `createDino`, `renderDino`, `createCompanionDino`, and `playEvolutionScene` receive the species of the active journey.
- Evolution texts per species and stage, e.g. Triceratops stage 3: "{name} schiebt mit den Hörnern einen Ast weg!", long-neck stage 3: "{name} frisst Blätter ganz oben vom Baum!", pterosaur stage 3: "{name} fliegt zum ersten Mal!".
- Sounds: existing evolution sounds are reused (egg crack, steps, impact, roar/stomp); the pterosaur uses a "whoosh" sound from the Kenney packs (CC0) for flight stages, normalized like the other sounds.

## Acceptance Criteria

- Each new species has 6 stage SVGs in its own color, with the anchor groups for accessories.
- Each stage has an idle animation (blink, breathe, tail or wing movement).
- Each evolution plays a species-specific scene with text and sound.
- Accessories sit correctly on every stage of every species.
- The companion dino in the levels is the active dino of the current journey.
- The T-Rex works unchanged after its files moved.

## Open Risks / Assumptions

- Drawing 18 new stage SVGs plus scene props is the biggest effort of this epic; the style stays deliberately simple.
