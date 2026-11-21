# Spec: SubjectSelection (Epic36)

## Overview / Goal

The home screen offers two worlds: **Lesen** (reading) and **Rechnen** (math). The child switches between them with two large tabs at the top of the home screen. Each world shows its own active dino and its own level map; points, shop, and dino valley stay shared.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Switching | Two large tabs "Lesen" / "Rechnen" at the top of the home screen | One tap, no extra screen; the dino and its map stay in view |
| Remembered dino | Each tab remembers the last played dino (journey) of its world | Returning to a world continues where the child left off |
| First visit of the math world | The first math journey (Stegosaurus) is unlocked from the start; on the first visit of the math tab, its egg is shown and the naming dialog opens | Math is independent of reading progress |
| Level map | The map shows the levels of the active journey: 5 islands in the reading world, 7 islands in the math world, with titles from the journey's profile | Same map component, different level count |
| Practice island | Only shown in the reading world | Practice of math task types is not part of this expansion |
| Shared elements | Points, wardrobe button, next reward, valley button stay identical in both worlds | Both subjects pay into the same shop |
| Dino valley | Shows reading dinos and math dinos in two labelled groups ("Lese-Dinos", "Rechen-Dinos"); tapping a math dino switches to the math world | Collection stays in one place, the world follows the chosen dino |

## Technical Details

### State (part of the version 3 migration, see MathJourneys)

```js
{
  activeJourney: 'trex',                                   // currently played journey (any subject)
  lastJourneyBySubject: { reading: 'trex', math: 'stegosaurus' }
}
```

- The subject of the active journey is derived from its definition (`journeyById(id).subject`), so there is no separate `activeSubject` field that could get out of sync.
- `switchSubject(state, subject)` in `js/state/journeyState.js`: stores the current journey in `lastJourneyBySubject[currentSubject]`, then sets `activeJourney = lastJourneyBySubject[subject]`. Returns the journey state, which may be `started: false` (first visit -> naming dialog).
- `switchJourney` and `startJourney` also update `lastJourneyBySubject` for the journey's subject.

### UI

- New component `js/components/subjectTabs.js` with BEM block `subject-tabs` (`subject-tabs__tab`, `subject-tabs__tab--active`, `subject-tabs__icon`, `subject-tabs__label`). Icons from Google Fonts icons: `menu_book` (Lesen) and `calculate` (Rechnen), stored under `assets/icons/`.
- The tabs are rendered at the top of `js/screens/home.js`, large touch targets (min. 64 px high).
- The home screen reads the level titles and level count from the active journey (reading: existing `LEVEL_TITLES`; math: profile titles from MathJourneys).
- The level islands navigate to `/level/<n>` (reading) or `/math/level/<n>` (math), depending on the subject.
- Switching plays the existing `click` sound and re-renders the home screen.

### Flow

1. Child taps "Rechnen" -> `switchSubject(state, 'math')`.
2. If the math journey is not started yet: the egg of the math species is shown together with the naming dialog (same dialog as for new reading journeys, with a short math intro text: "Ein neues Ei! Dieser Dino liebt Zahlen. Wie soll er heißen?").
3. Otherwise the home screen shows the math dino, its care bars, and the 7-level map.

## Acceptance Criteria

- The home screen shows two tabs "Lesen" and "Rechnen"; the active tab is visually highlighted.
- Tapping "Rechnen" for the first time shows the Stegosaurus egg and asks for a name; afterwards the math level map with 7 levels is shown.
- Switching back to "Lesen" shows the last played reading dino with unchanged progress.
- Each tab remembers its last played dino across reloads.
- Points, wardrobe, and valley buttons look and behave the same in both worlds.
- The practice island only appears in the reading world.
- The valley shows reading and math dinos in two groups; tapping a math dino activates the math world.
- Unit tests cover `switchSubject` (first visit, remembered journey, round trip).

## Open Risks / Assumptions

- The home screen file is already 218 lines; the tabs live in their own component so the file stays below 400 lines.
- Assumption: no separate world-specific background; a subtle colour accent per tab is enough.

## Implementation Notes

- If the naming dialog of the first math visit is cancelled, the game switches back to the reading world (the egg keeps waiting).
- The "Neues Ei!" badge of the valley button only counts eggs of the current world.
