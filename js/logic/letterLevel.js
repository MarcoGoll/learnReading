import { letterById } from '../data/letters.js';

/** Number of mastered letters needed to complete level 1. */
export const MIN_LETTERS = 8;

/** Recommended number of vowels so that good syllables and words can be built (hint for adults). */
export const RECOMMENDED_VOWELS = 2;

/**
 * Counts the known letter items in a pool.
 * @param {Array<string>} letterPool - Letter ids.
 * @returns {number} Number of known letters.
 */
function countLetters(letterPool) {
  return letterPool.filter((id) => letterById(id)).length;
}

/**
 * Counts the vowels in a list of letter ids.
 * @param {Array<string>} letterIds - Letter ids.
 * @returns {number} Number of vowels.
 */
export function countVowels(letterIds) {
  return letterIds.filter((id) => letterById(id)?.type === 'vowel').length;
}

/**
 * Returns how many letters are still missing to complete level 1.
 * @param {Array<string>} letterPool - Letter ids.
 * @returns {number} Missing letters (0 when enough).
 */
export function missingLetters(letterPool) {
  return Math.max(0, MIN_LETTERS - countLetters(letterPool));
}

/**
 * Checks whether the letter pool completes level 1.
 * @param {Array<string>} letterPool - Letter ids.
 * @returns {boolean} True with at least 8 mastered letters.
 */
export function isLevelOneComplete(letterPool) {
  return missingLetters(letterPool) === 0;
}
