# Spec: RewardCollection (Epic20)

## Overview / Goal

About 12 dino accessories (hat, sunglasses, scarf, crown, ...) are unlocked automatically at total-point thresholds. In the "Dino-Schrank" the child chooses what the dino wears. This adds a motivation besides highscore and dino evolution.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Unlocking | Automatically at total-point thresholds; points are not spent | Highscore and total points stay untouched; no loss feeling |
| Reward type | About 12 dino accessories the dino can wear | Strengthens the bond with the dino |
| Wearing | One accessory per slot (head, eyes, neck), combinable | Allows funny combinations without clutter |
| Visibility | Worn accessories appear on the home screen dino, the companion dino, and in evolution scenes | The child sees its choice everywhere |

## Technical Details

### Data (`js/data/rewards.js`)

| Threshold | Accessory | Slot |
|-----------|-----------|------|
| 100 | Red cap | head |
| 250 | Sunglasses | eyes |
| 500 | Striped scarf | neck |
| 800 | Flower crown | head |
| 1 200 | Bow tie | neck |
| 1 700 | Pirate hat | head |
| 2 300 | Heart glasses | eyes |
| 3 000 | Medal | neck |
| 4 000 | Explorer hat | head |
| 5 000 | Ski goggles | eyes |
| 6 500 | Superhero cape | neck |
| 8 000 | Golden crown | head |

```js
{ id: 'redCap', name: 'Rote Mütze', slot: 'head', threshold: 100, svg: 'assets/svg/accessories/red-cap.svg' }
```

### Placement on the dino

- Each dino stage SVG defines anchor points for the slots (`data-anchor-head`, `data-anchor-eyes`, `data-anchor-neck` with x, y, scale, rotation), including the egg (stage 0: head = top of the egg, eyes = middle, neck = lower third).
- Accessory SVGs are positioned on these anchors and move with the animated body part (placed inside the head / body group of the dino SVG).

### State

```js
rewards: {
  unlocked: ['redCap', 'sunglasses'],
  worn: { head: 'redCap', eyes: null, neck: null }
}
```

### Pure logic (`js/logic/rewards.js`, unit tested)

- `newlyUnlocked(previousTotal, newTotal, rewards)` -> rewards whose threshold was crossed
- `nextReward(total, rewards)` -> next reward and the missing points (for "Noch 120 Punkte bis zur Sonnenbrille!")

### Flow and UI

- After every point change, `newlyUnlocked` is checked; a crossed threshold shows a short unlock popup at the round summary ("Neu: Sonnenbrille!") with a sound.
- Home screen: wardrobe icon opens the "Dino-Schrank" (`#/wardrobe`): grid of all accessories, locked ones as silhouettes with their threshold; tap on an unlocked one puts it on / takes it off; preview dino in the current stage.
- Home screen shows a small progress hint toward the next reward.
- BEM blocks: `wardrobe`, `wardrobe__item` (modifiers `--locked`, `--worn`), `reward-popup`.

## Acceptance Criteria

- Crossing a threshold unlocks the accessory and shows the unlock popup once.
- Total points are not reduced by unlocking.
- In the wardrobe, unlocked accessories can be worn and removed; one accessory per slot.
- Worn accessories appear correctly placed on the dino in every stage, on the home screen and as the companion.
- Locked accessories show their threshold; the home screen shows progress to the next reward.
- `rewards.js` has unit tests for unlocking and next-reward calculation.
- Reset in the parent area also resets rewards.

## Open Risks / Assumptions

- Fitting accessories to 6 dino stages needs anchor points per stage; simple shapes keep this manageable.
- Thresholds are an estimate (a level 1 round gives about 100 points); they can be tuned later in `rewards.js`.
