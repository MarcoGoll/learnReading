# Spec: DinoJourneys (Epic22)

## Overview / Goal

After the first dino (T-Rex) is fully grown, the game continues with further "journeys". Each journey belongs to one dino species and is one difficulty stage with its own content focus. The child can switch back to an easier, already unlocked dino at any time without losing anything.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Journeys | 4 journeys: T-Rex, Triceratops, long-neck, pterosaur (species in NewDinoSpecies) | Clear progression; the collection is complete after 4 |
| Content per journey | T-Rex: current content (open syllables). Triceratops: letter combinations + closed syllables. Long-neck: long and compound words. Pterosaur: short stories | Clear increase in difficulty; each journey feels new |
| Level structure | Every journey has the same 5 level types (sounds, syllables, words, building, adventures) with the journey's content | Known rules; no need to learn new controls |
| Stored per journey | Current level, completed levels, dino stage, dino name, level records, stars (LevelStars), passed adventures, worn accessories, care state (DinoCare) | Each dino has its own progress |
| Shared across journeys | Learned letters/syllables/words (pools), total points, unlocked rewards, history, settings | Switching to an easier dino loses nothing |
| Accessories | Unlocked once for all dinos; each dino wears its own | Every dino looks different in the valley |
| Start of the next journey | When a dino is fully grown, an egg of the next species appears in the dino valley; the journey starts when the child taps the egg (naming dialog for the new dino) | The child decides when to start |
| End | When all 4 dinos are fully grown: big celebration in the valley ("Deine Dino-Familie ist komplett!"); afterwards all journeys stay playable | Stars and care keep motivation |

## Technical Details

### Journey definitions (`js/data/journeys.js`)

```js
{ id: 'trex',        species: 'trex',        order: 1, content: 'open' },
{ id: 'triceratops', species: 'triceratops', order: 2, content: 'combinations' },
{ id: 'longneck',    species: 'longneck',    order: 3, content: 'longWords' },
{ id: 'pterosaur',   species: 'pterosaur',   order: 4, content: 'stories' }
```

Each content profile defines, per level, which items are used and what the goal is:

| Level | open (T-Rex) | combinations (Triceratops) | longWords (long-neck) | stories (pterosaur) |
|-------|--------------|----------------------------|-----------------------|---------------------|
| 1 Sounds | letters (8) | letter combinations (LetterCombinations) | letters + combinations as review | letters + combinations as review |
| 2 Syllables | open syllables | closed syllables (ClosedSyllables) | open + closed syllables | open + closed syllables |
| 3 Words | open-syllable words | words with closed syllables / combinations | long and compound words (LongWords) | words of the stories |
| 4 Building | build words | build those words | build long words (more tiles) | build words of the stories |
| 5 Adventures | 6 variants | 6 variants with the journey's words | 6 variants with long words | ShortStories as an extra variant plus the existing ones |

The exact item lists and goals are defined in the content epics (ClosedSyllables, LetterCombinations, LongWords, ShortStories). The level screens receive a `content profile` instead of reading the global lists directly.

### State (version 2, with migration)

```js
{
  version: 2,
  activeJourney: 'trex',
  journeys: {
    trex: {
      unlocked: true, started: true, dinoName: 'Rexi',
      currentLevel: 1, completedLevels: [], dinoStage: 0,
      levelRecords: {}, stars: {}, passedVariants: [], worn: { head: null, eyes: null, neck: null },
      care: { hunger: 100, fun: 100, clean: 100, updatedAt: 0 }
    },
    triceratops: { unlocked: false, started: false, ... },
    ...
  },
  pools: { letters, syllables, words, builtWords },    // shared
  score: { total },                                      // shared
  rewards: { unlocked: [] },                             // shared
  familyCelebrated: false,
  settings, history, dailyActivity                       // shared
}
```

- `normalizeState` migrates a version 1 state: the old top-level fields (`currentLevel`, `completedLevels`, `dinoStage`, `dinoName`, `levelRecords`, `passedVariants`, `worn`) move into `journeys.trex`.
- Helpers `activeJourneyState(state)` and `journeyById(id)`; existing code reads level progress through these helpers instead of the top level.

### Flow

1. Level 5 of a journey is completed -> final scene "ausgewachsen" -> the next journey becomes `unlocked` -> an egg of the next species appears in the dino valley (with a pulsing hint "Ein neues Ei!").
2. The child taps the egg in the valley -> naming dialog with a short intro for the new species -> `started: true`, `activeJourney` = new journey -> home screen shows the new egg (stage 0) and the level map of this journey.
3. Switching: in the valley the child taps another started dino -> `activeJourney` changes -> home screen and level map show that dino's progress.
4. When all 4 dinos are fully grown for the first time: celebration in the valley, `familyCelebrated: true`.

## Acceptance Criteria

- An existing save (version 1) is migrated without loss into the T-Rex journey.
- After the T-Rex is fully grown, a Triceratops egg appears in the valley; tapping it asks for a name and starts the new journey at level 1 with stage 0.
- Each journey keeps its own levels, stage, name, records, passed adventures, and worn accessories.
- Learned items, total points, unlocked rewards, and history are shared across journeys.
- Switching to another started dino shows its progress; nothing is lost.
- Level screens use the content of the active journey.
- After all 4 dinos are fully grown, the family celebration plays once; all journeys remain playable.
- Unit tests cover the migration, journey switching, and unlocking of the next journey.

## Open Risks / Assumptions

- The level screens must be refactored to work with content profiles; this is the largest technical change of the new epics.
- The ShortStories variant is only available in the pterosaur journey.
