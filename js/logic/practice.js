import { difficultItems } from './statistics.js';
import { withStreakBonus } from './scoring.js';

/** Item types that can be practiced. */
export const PRACTICE_TYPES = ['letter', 'syllable', 'word'];

/** Base points per practiced item type. */
const PRACTICE_BASE = { letter: 10, syllable: 20, word: 30 };

/**
 * Builds a practice round of difficult items (lowest success rate first).
 * @param {object} history - History by item key.
 * @param {number} [maxSize=8] - Maximum round size.
 * @param {Function} [isAllowed] - Returns false for keys that must not be practiced (deleted or hidden words).
 * @returns {Array<string>} Item keys.
 */
export function buildPracticeRound(history, maxSize = 8, isAllowed = () => true) {
  return difficultItems(history, PRACTICE_TYPES).filter((item) => isAllowed(item.key)).slice(0, maxSize).map((item) => item.key);
}

/**
 * Returns the base points of a practiced item.
 * @param {string} key - Item key such as "word:mama".
 * @returns {number} Base points.
 */
export function practiceBasePoints(key) {
  return PRACTICE_BASE[key.split(':')[0]] || 0;
}

/**
 * Returns the points for a correctly practiced item.
 * @param {string} key - Item key.
 * @param {number} streakLength - Streak length including the current item.
 * @returns {number} Points.
 */
export function pointsForPracticeItem(key, streakLength) {
  return withStreakBonus(practiceBasePoints(key), streakLength);
}

/**
 * Counts the difficult items that can be practiced.
 * @param {object} history - History by item key.
 * @param {Function} [isAllowed] - Returns false for keys that must not be practiced (deleted or hidden words).
 * @returns {number} Number of difficult practice items.
 */
export function practiceItemCount(history, isAllowed = () => true) {
  return difficultItems(history, PRACTICE_TYPES).filter((item) => isAllowed(item.key)).length;
}
