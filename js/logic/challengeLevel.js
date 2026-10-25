import { mergeUnique } from './random.js';

/** Number of passed variants needed to complete level 5. */
export const VARIANTS_TO_COMPLETE = 3;

/** Base points of level 5 tasks. */
export const LEVEL_FIVE_BASE = 50;

/**
 * Checks whether a variant round is passed (at least half the tasks correct).
 * @param {number} correctCount - Correct tasks.
 * @param {number} taskCount - All tasks.
 * @returns {boolean} True if passed.
 */
export function isRoundPassed(correctCount, taskCount) {
  return taskCount > 0 && correctCount >= taskCount / 2;
}

/**
 * Checks whether level 5 is complete.
 * @param {Array<string>} passedVariants - Ids of passed variants.
 * @returns {boolean} True with at least 3 passed variants.
 */
export function isLevelFiveComplete(passedVariants) {
  return passedVariants.length >= VARIANTS_TO_COMPLETE;
}

/**
 * Returns the word material for level 5: built words first, then words read in level 3.
 * @param {object} pools - State pools.
 * @returns {Array<string>} Word ids.
 */
export function wordMaterial(pools) {
  return mergeUnique(pools.builtWords, pools.words);
}
