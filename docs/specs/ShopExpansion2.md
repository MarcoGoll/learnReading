# Spec: ShopExpansion2 (Epic54)

## Overview / Goal

Twenty more wardrobe accessories as long-term goals, now that the math world brings in more points.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Price range | All above 15000 points: 15 accessories from 16000 to 24000, 5 super accessories from 60000 to 100000 | Chosen by the user ("eher teuer"); keeps point rewards sorted by price, super accessories stay the most expensive |
| Themes | Mixed: fun items, math items, and jobs | Chosen by the user |
| Slots | Head, eyes, and neck spread over all items | Every dino can wear several new items at once |
| Graphics | New SVGs under `assets/svg/accessories/` in the existing style; super accessories sparkle like the existing ones | Same as ShopExpansion |

## New Accessories

| Price | Name | Slot | Theme |
|-------|------|------|-------|
| 16000 | Zylinder (topHat) | head | fun |
| 16500 | Schwimmbrille (swimGoggles) | eyes | fun |
| 17000 | Zahlen-Kette (numberChain) | neck | math |
| 17500 | Feuerwehrhelm (firefighterHelmet) | head | job |
| 18000 | Rechenbrille (calculatorGlasses) | eyes | math |
| 18500 | Stethoskop (stethoscope) | neck | job |
| 19000 | Sombrero (sombrero) | head | fun |
| 19500 | Forscherbrille (labGoggles) | eyes | job |
| 20000 | Rechenrahmen-Kette (abacusNecklace) | neck | math |
| 21000 | Polizeimütze (policeCap) | head | job |
| 21500 | Schweißerbrille (welderGoggles) | eyes | job |
| 22000 | Konfetti-Schleife (partyBow) | neck | fun |
| 23000 | Bauarbeiterhelm (constructionHelmet) | head | job |
| 23500 | Doktorhut (graduationCap) | head | math |
| 24000 | Astronautenhelm (astronautHelmet) | head | job |
| 60000 | Einmaleins-Krone (timesTableCrown), super | head | math |
| 70000 | Kristallbrille (crystalGlasses), super | eyes | fun |
| 80000 | Goldene Rechenkette (goldenNumberChain), super | neck | math |
| 90000 | Drachenflügel (dragonWings), super | neck | fun |
| 100000 | Sonnenkrone (sunCrown), super | head | fun |

## Acceptance Criteria

- 20 new buyable accessories with SVGs; point rewards stay sorted by price.
- The five new super accessories are marked in the wardrobe and sparkle when worn.
- Existing tests pass.
