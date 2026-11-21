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
- **Status:** done
- **Description:** When the T-Rex is fully grown, it lays an egg with the next dino species, and a new journey starts. Each species is one difficulty stage with its own pass through the levels and harder content. The child can switch back to any unlocked, easier dino at any time.

### Epic23: NewDinoSpecies
- **Status:** done
- **Description:** Three more species - Triceratops, long-neck (Brachiosaurus), and pterosaur - each with its own growth stages, idle animations, and evolution scenes, in the same style as the T-Rex.

### Epic24: DinoValley
- **Status:** done
- **Description:** A valley on the home screen where all hatched dinos of the collection live. The child sees its collection there and chooses which dino (and therefore which difficulty) to play with.

### Epic25: ClosedSyllables
- **Status:** done
- **Description:** New learning content for harder journeys: syllables ending in a consonant (mal, Hund, Ball), which allow many more words.

### Epic26: LetterCombinations
- **Status:** done
- **Description:** New learning content: letter combinations such as St, Sp, Pf, Qu, ck, ng, nk, and double consonants.

### Epic27: LongWords
- **Status:** done
- **Description:** New learning content: words with 3-4 syllables and compound words (Haus-tür).

### Epic28: ShortStories
- **Status:** done
- **Description:** New learning content: short stories of 3-4 sentences that the child reads, followed by a simple comprehension question.

### Epic29: LevelStars
- **Status:** done
- **Description:** Every level can earn up to 3 stars depending on how well a round went. Missing stars on the level map give a reason to replay levels.

### Epic30: DinoCare
- **Status:** done
- **Description:** Tamagotchi-like care: every completed round gives the dino something - food, a game, or a clean nest (poop removed) - with a short animation. The care state slowly decreases over time, which gives a gentle reason to keep playing, also with easier dinos.

### Epic31: CustomWords
- **Status:** done
- **Description:** In the parent area, adults can add their own words (e.g. names of family members, pets, or words from school) and delete words. Only words are managed; the syllables of a word are derived from it and become available in the syllable level automatically.

## Variety and Clarity

### Epic32: ContentExpansion
- **Status:** done
- **Description:** Much more learning content for more variety: about ten times as many words, sentences, and stories where the learning structure allows it (the T-Rex keeps open syllables only), plus about 60 new word pictures.

### Epic33: ProgressHints
- **Status:** done
- **Description:** Clear hints on the level map and in the dino valley that explain for every dino which level is next and what exactly is missing to get further.

### Epic34: ShopExpansion
- **Status:** done
- **Description:** Ten more wardrobe accessories with rising prices and five super accessories with very high prices as a long-term goal.

### Epic35: PoopCare
- **Status:** done
- **Description:** The cleanliness bar is removed. A poop pile appears some hours after feeding; cleaning is only offered while a pile is there and makes the dino clean again.

## Math World - Foundation

### Epic36: SubjectSelection
- **Status:** done
- **Description:** The home screen lets the child choose between the reading world and the math world. Each world has its own level map, and the child can switch between them at any time.

### Epic37: MathTaskEngine
- **Status:** done
- **Description:** The shared basis of all math levels: the game generates arithmetic tasks itself and checks the answers automatically. The child answers on a large number pad or by picking one of a few options, without time pressure.

### Epic38: MathJourneys
- **Status:** done
- **Note:** reorganised by Epic53 MathOperationDinos (one dino per operation).
- **Description:** Math has its own dino journeys, separate from the reading journeys, so progress in one subject never blocks the other. Points, stars, shop, dino care, and the dino valley are shared with the reading world.

### Epic39: MathDinoSpecies
- **Status:** done
- **Note:** reorganised by Epic53 MathOperationDinos (one dino per operation).
- **Description:** Three new species for the three math journeys (for example Stegosaurus, Ankylosaurus, and Parasaurolophus), each with its own growth stages, idle animations, and evolution scenes in the existing style.

## Math Levels

### Epic40: NumberLevel
- **Status:** done
- **Description:** Math level 1. The child recognizes numbers and quantities up to 10, for example by counting dots and tapping the matching number.

### Epic41: AdditionLevel
- **Status:** done
- **Description:** Math level 2. Addition up to 10, supported by pictures such as insects the dino eats.

### Epic42: SubtractionLevel
- **Status:** done
- **Description:** Math level 3. Subtraction up to 10, supported by pictures such as insects flying away.

### Epic43: AdditionSubtractionTo20Level
- **Status:** done
- **Description:** Math level 4. Mixed addition and subtraction up to 20, including crossing ten, with helpers such as a ten frame or number line.

### Epic44: MultiplicationLevel
- **Status:** done
- **Description:** Math level 5. Multiplication, starting with the core times tables, supported by pictures such as rows of eggs.

### Epic45: DivisionLevel
- **Status:** done
- **Description:** Math level 6. Division as the inverse of multiplication, supported by pictures such as food shared among dinos.

### Epic46: MathChallengeLevel
- **Status:** done
- **Description:** Math level 7 as a frame for several math variants, like level 5 in the reading world. Completing it makes the math dino fully grown.

## Math Level 7 Variants

### Epic47: MissingNumberVariant
- **Status:** done
- **Description:** Tasks with a gap instead of the result (3 + _ = 7); the child finds the missing number.

### Epic48: MathMemoryVariant
- **Status:** done
- **Description:** A memory game with task cards and result cards; the child finds the matching pairs.

### Epic49: NumberWallVariant
- **Status:** done
- **Description:** Number walls where each brick is the sum of the two bricks below it; the child fills in the missing bricks.

### Epic50: NumberLineVariant
- **Status:** done
- **Description:** The dino jumps along a number line; the child moves it to the number that solves the task.

## Math Extras

### Epic51: HarderMathContent
- **Status:** done
- **Note:** reorganised by Epic53 MathOperationDinos (one dino per operation).
- **Description:** Larger number ranges and harder tasks for the second and third math journey, for example numbers up to 100 and the full times tables.

### Epic52: ReadTaskAloud
- **Status:** done
- **Description:** On request, a math task is spoken aloud by the browser, so the child can play the math world even while reading is still hard.

## Math World - Rework

### Epic53: MathOperationDinos
- **Status:** done
- **Description:** The math world is split by operation: one dino each for plus, minus, times, and divided, all available from the start and independent of each other. Each dino has its own 7 levels from easy to hard and adventures that only use its operation, so the child can practise what is hard and still finish the others. Replaces the three difficulty journeys of MathJourneys and HarderMathContent.

