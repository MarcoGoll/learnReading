# Spec: GameFoundation (Epic1)

## Overview / Goal

Project skeleton of the web app: start screen with dino and level map, navigation between screens, a central game state persisted in the browser, and a protected parent area with reset. All other epics build on this foundation.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Navigation | Level map on the start screen: completed levels selectable, next level open, later levels locked | Child sees progress; levels can be repeated; enforces level order (level N needs material from N-1) |
| Level completion | A round ends when every item was judged once (or marked "not yet"); the level counts as completed once the level's pool (after merging the round's correct items) reaches the level-specific minimum (defined in each level spec) | Guarantees the next level has enough material; replaying a level can fill up a pool that was too small |
| Repeating levels | Allowed; new correct items are **added** to the pool, existing items stay | Vocabulary grows with the child |
| Parent area | Gear icon opens a parent gate with a simple addition task (two numbers 5-9); parent area contains reset (and later statistics) | Prevents the child from resetting progress by accident |
| Layout | Landscape first, responsive; also usable in portrait | Laptop and tablet in landscape are the main use case |
| Font | Andika (SIL Open Font License), self-hosted under `assets/fonts/`, shown very large | Designed for beginning readers (unambiguous a, l, I); self-hosting keeps the look identical on all devices |
| Visual style | Colorful prehistoric world: bright flat SVG background (jungle, volcano), large rounded buttons | Fits the dino theme and appeals to the child |
| Routing | Hash routing (`#/`, `#/level/1`, `#/parents`, ...) | Browser back button works; no server configuration needed on static hosting |
| UI language | German (all visible texts); code and comments in English | Child and adult are German speakers; project convention for code |
| Testing (all epics) | Unit tests for pure logic (state, scoring, syllable/word generation) with the built-in Node test runner (`node --test`), files under `tests/`; UI is tested manually | No dependencies or build step needed; logic is where bugs hide |

## Technical Details

### Directory structure

```
index.html
css/
  base.css          variables, font-face, reset, layout
  components/*.css  one file per BEM block
js/
  main.js           bootstrap, router start
  router.js         hash router
  state/store.js    load/save/reset of the game state
  screens/*.js      one module per screen (home, level1..5, parents, ...)
  components/*.js   reusable UI parts (judge controls, dino, ...)
assets/
  fonts/            Andika woff2
  icons/            Google Material icons (SVG)
  svg/              background and dino SVGs
  sounds/           audio files (if used, see SoundsAndEffects)
```

Plain ES modules loaded via `<script type="module">`; no build step. A local static server is used for development (e.g. `python3 -m http.server`), because ES modules do not load from `file://`.

### Routes

| Hash | Screen |
|------|--------|
| `#/` | Home: dino, highscore, level map, gear icon |
| `#/level/<n>` | Level n (1-5); locked levels redirect to `#/` |
| `#/parents` | Parent area (only after passing the gate in the current session) |

Further routes (statistics, rewards, practice) are added by their epics.

### Game state (localStorage)

Stored as JSON under the key `learnReading.state`, with a `version` field for future migrations. Every change is saved immediately.

```js
{
  version: 1,
  currentLevel: 1,            // highest unlocked level (1-5), 6 = all done
  completedLevels: [],        // e.g. [1, 2]
  pools: {
    letters: [],              // mastered letters from level 1
    syllables: [],            // mastered syllables from level 2
    words: [],                // mastered words from level 3
    builtWords: []            // words built correctly in level 4
  },
  score: { total: 0, levelRecords: {} },  // details in ScoreAndHighscore
  dinoStage: 0,               // 0 = egg ... 5 = fully grown
  dinoName: '',               // chosen at first start (DinoEvolution)
  settings: { soundsEnabled: true, musicEnabled: true, readAloudAfterWrong: true },  // SoundsAndEffects, ReadAloudHelp
  rewards: { unlocked: [], worn: { head: null, eyes: null, neck: null } },          // RewardCollection
  challenge: { passedVariants: [] },                      // ChallengeLevel
  history: {},                // per-item results, used by ParentStatistics / PracticeDifficultItems
  dailyActivity: {}           // tasks per day, used by ParentStatistics
}
```

The store module exposes `loadState()`, `saveState(state)`, `updateState(mutatorFn)`, and `resetState()`. Invalid or missing data falls back to the default state.

### Flows

- **Start:** load state -> render home -> level map shows completed / open / locked levels.
- **Level end:** level module reports `{ correctItems }` -> foundation adds them to the pool (deduplicated) -> if the pool now meets the level minimum and the level was not completed before: mark completed, unlock next level, advance dino stage (DinoEvolution).
- **Parent gate:** gear icon -> addition task -> correct answer opens `#/parents`; wrong answer closes the dialog.
- **Reset:** in the parent area, with an additional confirmation dialog; resets the whole state including highscore.

## Acceptance Criteria

- Opening the app shows the home screen with dino, highscore, and level map; only level 1 is open on first start.
- After completing a level, the next level is unlocked and remains unlocked after a page reload.
- A completed level can be replayed; newly mastered items are added to the pool without removing existing ones.
- Navigating to a locked level via URL redirects to the home screen.
- The browser back button returns to the previous screen.
- The parent area is only reachable after solving the addition task; reset requires an additional confirmation.
- Layout works on a laptop and on a tablet in landscape and portrait without horizontal scrolling.
- All item texts are shown in Andika.

## Open Risks / Assumptions

- localStorage can be cleared by the browser (e.g. private mode or clearing site data); progress is then lost. Accepted for a private project.
- One child per device (no profiles).
