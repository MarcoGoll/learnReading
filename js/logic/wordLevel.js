import { preferThenFill } from './random.js';

/** Words needed in the word pool to complete level 3. */
export const MIN_WORDS_LEVEL_THREE = 5;

/**
 * Returns the words that consist only of syllables from the pool.
 * @param {Array<string>} syllablePool - Mastered syllable ids.
 * @param {Array<object>} wordList - All words.
 * @returns {Array<object>} Buildable words.
 */
export function buildableWords(syllablePool, wordList) {
  const known = new Set(syllablePool);
  return wordList.filter((word) => word.syllables.every((syllable) => known.has(syllable)));
}

/**
 * Builds a level 3 round: words not yet mastered first, filled up with mastered ones.
 * @param {Array<object>} buildable - Buildable words.
 * @param {Array<string>} wordPool - Mastered word ids.
 * @param {number} [maxSize=8] - Maximum round size.
 * @param {Function} [randomFn] - Random number source.
 * @returns {Array<object>} Round words.
 */
export function buildRound(buildable, wordPool, maxSize = 8, randomFn = Math.random) {
  const unmastered = buildable.filter((word) => !wordPool.includes(word.id));
  const mastered = buildable.filter((word) => wordPool.includes(word.id));
  return preferThenFill(unmastered, mastered, maxSize, randomFn);
}

/**
 * Checks whether the word pool completes level 3.
 * @param {Array<string>} wordPool - Mastered word ids.
 * @returns {boolean} True with at least 5 words.
 */
export function isLevelThreeComplete(wordPool) {
  return wordPool.length >= MIN_WORDS_LEVEL_THREE;
}
