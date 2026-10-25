# Epics - learnReading

Status values: `planned -> specified -> in progress -> done`

## Core

### Epic1: GameFoundation
- **Status:** done
- **Description:** Project skeleton of the web app with start screen, navigation between levels, and a central game state. Progress (learned letters, syllables, words, current level) is saved in the browser and survives a reload. The game can be reset.

### Epic2: JudgeControls
- **Status:** done
- **Description:** Reusable controls that let the adult mark every read-aloud item as correct or wrong. They work the same in all reading levels and are easy to use next to the child.

### Epic3: ScoreAndHighscore
- **Status:** done
- **Description:** Points for every correct item, with higher point values in higher levels. A highscore is kept and shown so the child can try to beat it.

### Epic4: DinoEvolution
- **Status:** done
- **Description:** A dinosaur that grows with the child's progress, shown as animated SVGs. Each completed level unlocks exactly one new stage: egg, hatched baby, first steps, first caught insect, and so on, until the dino is fully grown after the final level.

### Epic5: SoundsAndEffects
- **Status:** done
- **Description:** Funny sounds and animations for correct and wrong answers, dino evolution, and other key moments. They keep the child attentive and make progress feel rewarding.

## Levels

### Epic6: LetterLevel
- **Status:** done
- **Description:** Level 1. The adult selects which letters the child knows; the child reads them aloud one by one. Every correctly read letter earns points (lowest value) and is passed on to level 2.

### Epic7: SyllableLevel
- **Status:** done
- **Description:** Level 2. Syllables are built from the letters mastered in level 1 and read aloud. Every correctly read syllable earns more points and is passed on to level 3.

### Epic8: WordReadingLevel
- **Status:** done
- **Description:** Level 3. Syllables from level 2 are combined into simple words that the child reads aloud. Every correctly read word earns points.

### Epic9: DragDropWordLevel
- **Status:** done
- **Description:** Level 4. The child builds words by dragging syllables together (mouse and touch). Every correctly built word earns points and is passed on to level 5.

### Epic10: ChallengeLevel
- **Status:** done
- **Description:** Level 5 as a frame for several game variants that use the words from level 4. Defines how variants are chosen and when level 5 counts as completed, which makes the dino fully grown.

## Level 5 Variants

### Epic11: SentenceReadingVariant
- **Status:** done
- **Description:** Short, simple sentences are built from the learned words and read aloud by the child. The adult marks each sentence as correct or wrong.

### Epic12: WordPictureVariant
- **Status:** done
- **Description:** The child reads a word and assigns it to the matching picture. This checks reading comprehension, not only pronunciation.

### Epic13: FindTheWordVariant
- **Status:** done
- **Description:** The adult says a word and the child taps it among several displayed words. This trains careful reading of similar-looking words.

### Epic14: GapSentenceVariant
- **Status:** done
- **Description:** A short sentence is missing one word; the child picks the fitting word from several options.

### Epic15: WordMemoryVariant
- **Status:** done
- **Description:** A memory game with word cards and picture cards; the child finds the matching pairs.

### Epic16: SentenceBuilderVariant
- **Status:** done
- **Description:** Like level 4, but with words: the child builds a sentence from shuffled words via drag and drop.

## Extras

### Epic17: ParentStatistics
- **Status:** done
- **Description:** An overview for the adult showing which letters, syllables, and words the child has mastered and which are often read wrong.

### Epic18: PracticeDifficultItems
- **Status:** done
- **Description:** A repetition mode that specifically asks for letters, syllables, and words that were often read wrong.

### Epic19: ReadAloudHelp
- **Status:** done
- **Description:** On request, a letter, syllable, or word is spoken aloud by the browser so the child can hear how it sounds.

### Epic20: RewardCollection
- **Status:** done
- **Description:** Collectible rewards (e.g. dino accessories or stickers) that the child unlocks with points, as an additional motivation besides highscore and dino evolution.

## Release

### Epic21: Deployment
- **Status:** in progress
- **Note:** Build, test gate, and `vercel.json` are done. Missing: connecting the GitHub repository to a Vercel project (one-time step by the user), so the first production deployment has not happened yet.
- **Description:** Publishing the game via free static hosting so it can be opened by link on laptop and tablet.

## Long-term Motivation (after the first journey)

### Epic22: DinoJourneys
- **Status:** specified
- **Description:** When the T-Rex is fully grown, it lays an egg with the next dino species, and a new journey starts. Each species is one difficulty stage with its own pass through the levels and harder content. The child can switch back to any unlocked, easier dino at any time.

### Epic23: NewDinoSpecies
- **Status:** specified
- **Description:** Three more species - Triceratops, long-neck (Brachiosaurus), and pterosaur - each with its own growth stages, idle animations, and evolution scenes, in the same style as the T-Rex.

### Epic24: DinoValley
- **Status:** specified
- **Description:** A valley on the home screen where all hatched dinos of the collection live. The child sees its collection there and chooses which dino (and therefore which difficulty) to play with.

### Epic25: ClosedSyllables
- **Status:** specified
- **Description:** New learning content for harder journeys: syllables ending in a consonant (mal, Hund, Ball), which allow many more words.

### Epic26: LetterCombinations
- **Status:** specified
- **Description:** New learning content: letter combinations such as St, Sp, Pf, Qu, ck, ng, nk, and double consonants.

### Epic27: LongWords
- **Status:** specified
- **Description:** New learning content: words with 3-4 syllables and compound words (Haus-tür).

### Epic28: ShortStories
- **Status:** specified
- **Description:** New learning content: short stories of 3-4 sentences that the child reads, followed by a simple comprehension question.

### Epic29: LevelStars
- **Status:** specified
- **Description:** Every level can earn up to 3 stars depending on how well a round went. Missing stars on the level map give a reason to replay levels.

### Epic30: DinoCare
- **Status:** specified
- **Description:** Tamagotchi-like care: every completed round gives the dino something - food, a game, or a clean nest (poop removed) - with a short animation. The care state slowly decreases over time, which gives a gentle reason to keep playing, also with easier dinos.
