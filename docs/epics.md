# Epics - learnReading

Status values: `planned -> specified -> in progress -> done`

## Core

### Epic1: GameFoundation
- **Status:** specified
- **Description:** Project skeleton of the web app with start screen, navigation between levels, and a central game state. Progress (learned letters, syllables, words, current level) is saved in the browser and survives a reload. The game can be reset.

### Epic2: JudgeControls
- **Status:** specified
- **Description:** Reusable controls that let the adult mark every read-aloud item as correct or wrong. They work the same in all reading levels and are easy to use next to the child.

### Epic3: ScoreAndHighscore
- **Status:** specified
- **Description:** Points for every correct item, with higher point values in higher levels. A highscore is kept and shown so the child can try to beat it.

### Epic4: DinoEvolution
- **Status:** specified
- **Description:** A dinosaur that grows with the child's progress, shown as animated SVGs. Each completed level unlocks exactly one new stage: egg, hatched baby, first steps, first caught insect, and so on, until the dino is fully grown after the final level.

### Epic5: SoundsAndEffects
- **Status:** specified
- **Description:** Funny sounds and animations for correct and wrong answers, dino evolution, and other key moments. They keep the child attentive and make progress feel rewarding.

## Levels

### Epic6: LetterLevel
- **Status:** specified
- **Description:** Level 1. The adult selects which letters the child knows; the child reads them aloud one by one. Every correctly read letter earns points (lowest value) and is passed on to level 2.

### Epic7: SyllableLevel
- **Status:** specified
- **Description:** Level 2. Syllables are built from the letters mastered in level 1 and read aloud. Every correctly read syllable earns more points and is passed on to level 3.

### Epic8: WordReadingLevel
- **Status:** specified
- **Description:** Level 3. Syllables from level 2 are combined into simple words that the child reads aloud. Every correctly read word earns points.

### Epic9: DragDropWordLevel
- **Status:** specified
- **Description:** Level 4. The child builds words by dragging syllables together (mouse and touch). Every correctly built word earns points and is passed on to level 5.

### Epic10: ChallengeLevel
- **Status:** specified
- **Description:** Level 5 as a frame for several game variants that use the words from level 4. Defines how variants are chosen and when level 5 counts as completed, which makes the dino fully grown.

## Level 5 Variants

### Epic11: SentenceReadingVariant
- **Status:** specified
- **Description:** Short, simple sentences are built from the learned words and read aloud by the child. The adult marks each sentence as correct or wrong.

### Epic12: WordPictureVariant
- **Status:** specified
- **Description:** The child reads a word and assigns it to the matching picture. This checks reading comprehension, not only pronunciation.

### Epic13: FindTheWordVariant
- **Status:** specified
- **Description:** The adult says a word and the child taps it among several displayed words. This trains careful reading of similar-looking words.

### Epic14: GapSentenceVariant
- **Status:** specified
- **Description:** A short sentence is missing one word; the child picks the fitting word from several options.

### Epic15: WordMemoryVariant
- **Status:** specified
- **Description:** A memory game with word cards and picture cards; the child finds the matching pairs.

### Epic16: SentenceBuilderVariant
- **Status:** specified
- **Description:** Like level 4, but with words: the child builds a sentence from shuffled words via drag and drop.

## Extras

### Epic17: ParentStatistics
- **Status:** specified
- **Description:** An overview for the adult showing which letters, syllables, and words the child has mastered and which are often read wrong.

### Epic18: PracticeDifficultItems
- **Status:** specified
- **Description:** A repetition mode that specifically asks for letters, syllables, and words that were often read wrong.

### Epic19: ReadAloudHelp
- **Status:** specified
- **Description:** On request, a letter, syllable, or word is spoken aloud by the browser so the child can hear how it sounds.

### Epic20: RewardCollection
- **Status:** specified
- **Description:** Collectible rewards (e.g. dino accessories or stickers) that the child unlocks with points, as an additional motivation besides highscore and dino evolution.

## Release

### Epic21: Deployment
- **Status:** specified
- **Description:** Publishing the game via free static hosting so it can be opened by link on laptop and tablet.
