import { preferThenFill, shuffle } from './random.js';
import { buildableWords } from './wordLevel.js';

/** Number of buildable level 3 words needed to complete level 2. */
export const MIN_BUILDABLE_WORDS = 5;

/**
 * Returns the syllables whose letters are all in the letter pool.
 * @param {Array<string>} letterPool - Mastered letter ids.
 * @param {Array<object>} syllableList - All syllables.
 * @returns {Array<object>} Available syllables.
 */
export function availableSyllables(letterPool, syllableList) {
  const known = new Set(letterPool);
  return syllableList.filter((syllable) => syllable.letters.every((letterId) => known.has(letterId)));
}

/**
 * Returns the unmastered syllable ids that complete words, words with the fewest missing syllables first.
 * A word is only taken when all its missing syllables still fit into the round.
 * @param {Set<string>} availableIds - Ids of the available syllables.
 * @param {Set<string>} masteredIds - Ids of the mastered syllables.
 * @param {Array<object>} wordList - Words of the journey.
 * @param {number} maxSize - Maximum number of syllables.
 * @param {Function} randomFn - Random number source.
 * @returns {Array<string>} Syllable ids that complete words.
 */
export function wordCompletingSyllables(availableIds, masteredIds, wordList, maxSize, randomFn) {
  const missingOf = (word) => [...new Set(word.syllables.filter((syllable) => !masteredIds.has(syllable)))];
  const candidates = shuffle(wordList, randomFn)
    .filter((word) => word.syllables.every((syllable) => availableIds.has(syllable)))
    .map(missingOf).filter((missing) => missing.length > 0)
    .sort((first, second) => first.length - second.length);
  const chosen = new Set();
  candidates.forEach((missing) => {
    const added = missing.filter((syllable) => !chosen.has(syllable));
    if (chosen.size + added.length <= maxSize) added.forEach((syllable) => chosen.add(syllable));
  });
  return [...chosen];
}

/**
 * Builds a level 2 round: syllables that complete words first, then other unmastered syllables,
 * filled up with mastered ones. So a round read without mistakes makes as many words possible as it can.
 * @param {Array<object>} available - Available syllables.
 * @param {Array<string>} syllablePool - Mastered syllable ids.
 * @param {number} [maxSize=10] - Maximum round size.
 * @param {Function} [randomFn] - Random number source.
 * @param {Array<object>} [wordList=[]] - Words of the journey whose syllables are preferred.
 * @returns {Array<object>} Round syllables.
 */
export function buildRound(available, syllablePool, maxSize = 10, randomFn = Math.random, wordList = []) {
  const masteredIds = new Set(syllablePool);
  const focusIds = new Set(wordCompletingSyllables(new Set(available.map((syllable) => syllable.id)), masteredIds, wordList, maxSize, randomFn));
  const focus = available.filter((syllable) => focusIds.has(syllable.id));
  const unmastered = available.filter((syllable) => !masteredIds.has(syllable.id) && !focusIds.has(syllable.id));
  const mastered = available.filter((syllable) => masteredIds.has(syllable.id));
  const fresh = [...focus, ...preferThenFill(unmastered, [], maxSize - focus.length, randomFn)];
  return [...shuffle(fresh, randomFn), ...preferThenFill([], mastered, maxSize - fresh.length, randomFn)];
}

/**
 * Returns how many more buildable words are needed to complete level 2.
 * @param {Array<string>} syllablePool - Mastered syllable ids.
 * @param {Array<object>} wordList - All words.
 * @returns {number} Missing word count (0 when complete).
 */
export function missingWords(syllablePool, wordList) {
  return Math.max(0, MIN_BUILDABLE_WORDS - buildableWords(syllablePool, wordList).length);
}

/**
 * Checks whether the syllable pool completes level 2.
 * @param {Array<string>} syllablePool - Mastered syllable ids.
 * @param {Array<object>} wordList - All words.
 * @returns {boolean} True if at least 5 words can be built.
 */
export function isLevelTwoComplete(syllablePool, wordList) {
  return missingWords(syllablePool, wordList) === 0;
}

/**
 * Checks whether level 2 can still be completed with the current letters.
 * @param {Array<string>} letterPool - Mastered letter ids.
 * @param {Array<object>} syllableList - All syllables.
 * @param {Array<object>} wordList - All words.
 * @returns {boolean} True if all available syllables together allow 5 words.
 */
export function isReachableWithLetters(letterPool, syllableList, wordList) {
  const allAvailable = availableSyllables(letterPool, syllableList).map((syllable) => syllable.id);
  return isLevelTwoComplete(allAvailable, wordList);
}
