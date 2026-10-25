import { preferThenFill } from './random.js';
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
 * Builds a level 2 round: unmastered syllables first, filled up with mastered ones.
 * @param {Array<object>} available - Available syllables.
 * @param {Array<string>} syllablePool - Mastered syllable ids.
 * @param {number} [maxSize=10] - Maximum round size.
 * @param {Function} [randomFn] - Random number source.
 * @returns {Array<object>} Round syllables.
 */
export function buildRound(available, syllablePool, maxSize = 10, randomFn = Math.random) {
  const unmastered = available.filter((syllable) => !syllablePool.includes(syllable.id));
  const mastered = available.filter((syllable) => syllablePool.includes(syllable.id));
  return preferThenFill(unmastered, mastered, maxSize, randomFn);
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
