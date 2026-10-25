# Change Log

Log of all code changes. Read this file before adding a new entry to determine the next free ID. Format per entry:

```
## CHG-XXXX - <short description>
- Timestamp: <ISO 8601>
- Files: <affected files>
```

Referenceable by the user, e.g. "revert CHG-0012" or "adjust CHG-0012 again".

---

## CHG-0001 - Translate all template files to English
- Timestamp: 2026-07-29T14:36:26+02:00
- Files: CLAUDE.md, README.md, .claude/commands/roadmap.md, .claude/commands/brainstorming.md, .claude/commands/spec.md, .claude/commands/dev.md, docs/change-log.md

## CHG-0002 - Implement GameFoundation (state, store, router, home screen, parent gate)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: index.html, package.json, .gitignore, css/base.css, css/components/top-bar.css, css/components/dialog.css, css/components/home.css, js/main.js, js/router.js, js/state/defaultState.js, js/state/store.js, js/logic/random.js, js/logic/levelProgress.js, js/components/dom.js, js/components/dialog.js, js/components/topBar.js, js/components/svgLoader.js, js/game/parentGate.js, js/screens/home.js, assets/fonts/*, assets/icons/*, tests/helpers.js, tests/state.test.js

## CHG-0003 - Implement JudgeControls and the shared reading round
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/components/judgeControls.js, css/components/judge-controls.css, js/logic/readingRound.js, js/game/readingRoundRunner.js, js/game/levelLayout.js, css/components/level-screen.css, tests/readingRound.test.js

## CHG-0004 - Implement ScoreAndHighscore
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/logic/scoring.js, js/logic/roundSession.js, js/components/scoreBoard.js, css/components/score-board.css, js/components/roundSummary.js, css/components/round-summary.css, js/game/levelFlow.js, tests/scoring.test.js

## CHG-0005 - Implement DinoEvolution (six dino stages, idle animations, evolution scenes)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: assets/svg/dino/stage-0.svg ... stage-5.svg, js/components/dino.js, js/components/evolutionScene.js, css/components/dino.css, css/components/evolution-scene.css

## CHG-0006 - Implement SoundsAndEffects (CC0 sounds, music, effects, companion dino)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: assets/sounds/*.mp3, assets/sounds/LICENSES.md, js/audio/soundPlayer.js, js/components/effects.js, css/components/effects.css

## CHG-0007 - Implement LetterLevel (level 1)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/data/letters.js, js/logic/letterLevel.js, js/screens/level1.js, js/components/itemCards.js, css/components/item-cards.css, css/components/letter-select.css, tests/levels.test.js

## CHG-0008 - Implement SyllableLevel (level 2)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/data/syllables.js, js/logic/syllableLevel.js, js/screens/level2.js, tests/levels.test.js

## CHG-0009 - Implement WordReadingLevel (level 3) with a word list of 180 words
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/data/words.js, js/logic/wordLevel.js, js/screens/level3.js, tests/data.test.js, tests/levels.test.js

## CHG-0010 - Implement DragDropWordLevel (level 4) with speech synthesis
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/audio/speech.js, js/components/dragBoard.js, js/game/spokenTarget.js, js/game/buildTaskRunner.js, js/logic/dragDropLevel.js, js/screens/level4.js, css/components/drag-task.css, tests/variants.test.js

## CHG-0011 - Implement ChallengeLevel (level 5 menu and variant registry)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/logic/challengeLevel.js, js/screens/challenge.js, js/screens/challenge/variantRegistry.js, js/screens/challenge/variantContext.js, css/components/challenge.css

## CHG-0012 - Implement SentenceReadingVariant with sight words and sentence list
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/data/sightWords.js, js/data/sentences.js, js/logic/sentences.js, js/screens/challenge/sentenceReading.js

## CHG-0013 - Implement WordPictureVariant with 61 word pictures
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: assets/svg/pictures/*.svg, js/logic/wordPicture.js, js/game/choiceTaskRunner.js, js/screens/challenge/wordPicture.js

## CHG-0014 - Implement FindTheWordVariant
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/logic/findTheWord.js, js/screens/challenge/findTheWord.js

## CHG-0015 - Implement GapSentenceVariant
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/logic/gapSentence.js, js/screens/challenge/gapSentence.js

## CHG-0016 - Implement WordMemoryVariant
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/logic/wordMemory.js, js/screens/challenge/wordMemory.js, css/components/memory-board.css

## CHG-0017 - Implement SentenceBuilderVariant
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/logic/sentenceBuilder.js, js/screens/challenge/sentenceBuilder.js

## CHG-0018 - Implement ParentStatistics (history, difficult items, 14-day chart)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/logic/history.js, js/logic/statistics.js, js/screens/parents.js, js/screens/parentStats.js, css/components/parents.css, tests/progress.test.js

## CHG-0019 - Implement PracticeDifficultItems (practice island)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/logic/practice.js, js/screens/practice.js, tests/progress.test.js

## CHG-0020 - Implement ReadAloudHelp (speech after wrong answers, adult speaker button)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: js/game/readAloud.js, js/game/readingRoundRunner.js, js/screens/parents.js

## CHG-0021 - Implement RewardCollection (12 accessories, wardrobe)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: assets/svg/accessories/*.svg, js/data/rewards.js, js/logic/rewards.js, js/screens/wardrobe.js, css/components/wardrobe.css, tests/progress.test.js, tests/data.test.js

## CHG-0022 - Add Deployment configuration (Vercel build with test gate)
- Timestamp: 2026-10-25T15:50:04+01:00
- Files: vercel.json, package.json, scripts/buildDist.js, .gitignore

## CHG-0023 - Keep animations running with reduced motion (fix missing flying points and evolution scenes in Chrome)
- Timestamp: 2026-10-25T16:10:30+01:00
- Files: css/base.css, css/components/evolution-scene.css, css/components/memory-board.css, docs/specs/SoundsAndEffects.md, docs/specs/DinoEvolution.md

## CHG-0024 - Show level goals clearly (goal banner, live progress, clear summary, progress on level map)
- Timestamp: 2026-10-25T16:10:30+01:00
- Files: js/logic/levelGoals.js, js/components/goalBanner.js, css/components/goal-banner.css, js/game/levelLayout.js, js/game/readingRoundRunner.js, js/game/buildTaskRunner.js, js/game/choiceTaskRunner.js, js/game/levelFlow.js, js/components/roundSummary.js, js/screens/home.js, js/screens/level1.js, js/screens/level2.js, js/screens/level3.js, js/screens/level4.js, js/screens/challenge.js, js/screens/challenge/sentenceReading.js, js/screens/challenge/sentenceBuilder.js, js/screens/challenge/wordMemory.js, css/components/home.css, css/components/letter-select.css, css/components/round-summary.css, index.html, tests/levelGoals.test.js, docs/specs/GameFoundation.md

## CHG-0025 - Use one plain sound each for correct and wrong answers
- Timestamp: 2026-10-25T16:21:58+01:00
- Files: assets/sounds/correct.mp3, assets/sounds/wrong.mp3 (replace correct-1..3, wrong-1..2, streak), assets/sounds/LICENSES.md, js/audio/soundPlayer.js, js/game/readingRoundRunner.js, js/game/buildTaskRunner.js, js/game/choiceTaskRunner.js, js/screens/challenge/wordMemory.js, docs/specs/SoundsAndEffects.md

## CHG-0026 - Level 1 goal: 8 letters, with a vowel hint for adults
- Timestamp: 2026-10-25T16:21:58+01:00
- Files: js/logic/letterLevel.js, js/logic/levelGoals.js, js/screens/level1.js, js/screens/level2.js, css/components/letter-select.css, tests/levels.test.js, tests/levelGoals.test.js, docs/specs/LetterLevel.md

## CHG-0027 - Add intro story to the naming dialog and a personal greeting
- Timestamp: 2026-10-25T16:21:58+01:00
- Files: js/components/dialog.js, js/screens/home.js, css/components/dialog.css, docs/specs/DinoEvolution.md

## CHG-0028 - Fix distorted sounds (normalize to -6 dB peak, limiter, lower playback volume)
- Timestamp: 2026-10-25T16:31:53+01:00
- Files: assets/sounds/*.mp3, assets/sounds/LICENSES.md, js/audio/soundPlayer.js

## CHG-0029 - Implement DinoJourneys (state version 2 with migration, journey helpers, content profiles)
- Timestamp: 2026-10-25T17:16:09+01:00
- Files: js/data/journeys.js, js/state/defaultState.js, js/state/store.js, js/state/journeyState.js, js/content/profiles.js, js/content/levelRules.js, js/logic/levelProgress.js, js/logic/levelGoals.js, js/game/levelFlow.js, js/game/levelLayout.js, js/screens/home.js, js/screens/level1.js, js/screens/level2.js, js/screens/level3.js, js/screens/level4.js, js/screens/challenge.js, js/screens/challenge/variantContext.js, js/screens/challenge/variantRegistry.js, js/screens/parents.js, js/screens/wardrobe.js, js/screens/parentStats.js, tests/state.test.js, tests/levels.test.js, tests/levelGoals.test.js, tests/journeys.test.js

## CHG-0030 - Implement NewDinoSpecies (Triceratops, long-neck, pterosaur; species-specific evolution scenes)
- Timestamp: 2026-10-25T17:16:09+01:00
- Files: assets/svg/dino/trex/* (moved), assets/svg/dino/triceratops/*, assets/svg/dino/longneck/*, assets/svg/dino/pterosaur/*, js/components/dino.js, js/components/evolutionScene.js, css/components/dino.css, css/components/evolution-scene.css, assets/sounds/whoosh.mp3, assets/sounds/LICENSES.md, js/audio/soundPlayer.js, index.html

## CHG-0031 - Implement DinoValley (valley screen, egg hatching, family celebration)
- Timestamp: 2026-10-25T17:16:09+01:00
- Files: js/screens/valley.js, css/components/valley.css, js/main.js, js/screens/home.js, css/components/home.css, assets/icons/park.svg, assets/icons/egg.svg, assets/icons/pets.svg

## CHG-0032 - Implement LetterCombinations and ClosedSyllables (Triceratops content)
- Timestamp: 2026-10-25T17:16:09+01:00
- Files: js/data/letters.js, js/data/syllables.js, js/data/wordParser.js, js/data/words.js, js/data/wordsTriceratops.js, js/data/sentencesTriceratops.js, js/data/allWords.js, js/data/allSentences.js, js/data/sentences.js, js/components/itemCards.js, css/components/item-cards.css, assets/svg/pictures/* (42 new), tests/content.test.js

## CHG-0033 - Implement LongWords (long-neck content, compound words built from part words)
- Timestamp: 2026-10-25T17:16:09+01:00
- Files: js/data/wordsLongneck.js, js/data/sentencesLongneck.js, js/logic/dragDropLevel.js, js/game/spokenTarget.js, js/screens/level4.js, css/components/drag-task.css, assets/svg/pictures/* (26 new)

## CHG-0034 - Implement ShortStories (20 stories, story level 3, story adventure)
- Timestamp: 2026-10-25T17:16:09+01:00
- Files: js/data/stories.js, js/data/sightWords.js, js/game/storyRunner.js, js/screens/challenge/story.js, css/components/story.css

## CHG-0035 - Implement LevelStars (stars per level, special accessories)
- Timestamp: 2026-10-25T17:16:09+01:00
- Files: js/logic/stars.js, js/logic/roundSession.js, js/logic/rewards.js, js/data/rewards.js, js/components/roundSummary.js, css/components/round-summary.css, assets/svg/accessories/goldenCape.svg, assets/svg/accessories/hornFlowers.svg, assets/svg/accessories/rainbowScarf.svg, assets/svg/accessories/aviatorGoggles.svg

## CHG-0036 - Implement DinoCare (needs, care screen after rounds, mood display)
- Timestamp: 2026-10-25T17:16:09+01:00
- Files: js/logic/care.js, js/components/careBars.js, js/game/careFlow.js, css/components/care.css, assets/icons/restaurant.svg, assets/icons/sports_baseball.svg, assets/icons/cleaning_services.svg

## CHG-0037 - Care after evolution, need bars on care screen, Triceratops level 1 goal 1, level 2 hint
- Timestamp: 2026-10-25T19:21:38+01:00
- Files: js/game/levelFlow.js, js/game/careFlow.js, css/components/care.css, js/content/levelRules.js, js/logic/levelGoals.js, js/screens/level2.js, tests/levelGoals.test.js, docs/specs/DinoCare.md, docs/specs/LetterCombinations.md

## CHG-0038 - Level 2 rounds prefer syllables that complete words
- Timestamp: 2026-10-25T19:26:20+01:00
- Files: js/logic/syllableLevel.js, js/screens/level2.js, tests/levels.test.js, docs/specs/SyllableLevel.md

## CHG-0039 - Random movement patterns for dinos in the valley
- Timestamp: 2026-10-25T19:27:43+01:00
- Files: js/screens/valley.js, css/components/valley.css

## CHG-0040 - Keep letters, syllables, words, and sentences inside their white cards
- Timestamp: 2026-10-25T19:30:37+01:00
- Files: js/components/fitText.js (new), js/main.js, css/components/level-screen.css

## CHG-0041 - Dev server without browser caching
- Timestamp: 2026-10-25T19:37:18+01:00
- Files: scripts/devServer.py (new), package.json

## CHG-0042 - Memory: every found pair counts as correct, mismatches are no mistakes
- Timestamp: 2026-10-25T19:37:18+01:00
- Files: js/logic/wordMemory.js, js/screens/challenge/wordMemory.js, tests/variants.test.js, docs/specs/WordMemoryVariant.md

## CHG-0043 - 12 new wardrobe accessories, steeper point thresholds after the first three
- Timestamp: 2026-10-25T19:39:54+01:00
- Files: js/data/rewards.js, assets/svg/accessories/{partyHat,wizardHat,cowboyHat,vikingHelmet,starGlasses,monocle,divingMask,nerdGlasses,pearlNecklace,bandana,bellCollar,flowerLei}.svg (new), tests/progress.test.js, docs/specs/RewardCollection.md

## CHG-0044 - Wardrobe: buy accessories with points instead of automatic unlocking
- Timestamp: 2026-10-25T19:52:40+01:00
- Files: js/data/rewards.js, js/logic/rewards.js, js/state/defaultState.js, js/screens/wardrobe.js, css/components/wardrobe.css, js/screens/home.js, css/components/home.css, js/components/roundSummary.js, js/game/levelFlow.js, js/screens/challenge.js, js/screens/practice.js, tests/progress.test.js, tests/data.test.js, docs/specs/RewardCollection.md

## CHG-0045 - Implement CustomWords (add own words, delete them, hide built-in words in the parent area)
- Timestamp: 2026-10-25T20:13:45+01:00
- Files: js/logic/customWords.js (new), js/content/customContent.js (new), js/screens/parentWords.js (new), css/components/parent-words.css (new), assets/icons/add.svg, assets/icons/visibility_off.svg, assets/icons/search.svg (new), js/content/profiles.js, js/data/allWords.js, js/data/syllables.js, js/state/defaultState.js, js/logic/practice.js, js/screens/practice.js, js/screens/home.js, js/screens/parents.js, js/main.js, index.html, tests/customWords.test.js (new), docs/specs/CustomWords.md, docs/epics.md

## CHG-0046 - Collapsible word groups on the word management page, plural fix in the unknown-sounds hint
- Timestamp: 2026-10-25T20:16:48+01:00
- Files: js/screens/parentWords.js, css/components/parent-words.css
