import { shuffle } from './random.js';
import { roundWithRepeats } from './sentences.js';

/** Minimum number of learned nouns with a picture for the picture variants. */
export const MIN_PICTURE_TARGETS = 3;

/**
 * Returns the learned nouns that have a picture.
 * @param {Array<string>} wordIds - Word material ids.
 * @param {Array<object>} words - All words.
 * @returns {Array<object>} Picture targets.
 */
export function pictureTargets(wordIds, words) {
  return words.filter((word) => word.picture && wordIds.includes(word.id));
}

/**
 * Builds a task with the target and two random other pictured nouns.
 * @param {object} target - Target word.
 * @param {Array<object>} allPictureWords - All words with pictures.
 * @param {Function} [randomFn] - Random number source.
 * @returns {{word: object, options: Array<object>}} Task.
 */
export function buildTask(target, allPictureWords, randomFn = Math.random) {
  const others = allPictureWords.filter((word) => word.id !== target.id);
  const distractors = shuffle(others, randomFn).slice(0, 2);
  return { word: target, options: shuffle([target, ...distractors], randomFn) };
}

/**
 * Builds a round of picture targets.
 * @param {Array<object>} targets - Picture targets.
 * @param {number} [size=6] - Round size.
 * @param {Function} [randomFn] - Random number source.
 * @returns {Array<object>} Round targets.
 */
export function buildRound(targets, size = 6, randomFn = Math.random) {
  return roundWithRepeats(targets, size, randomFn);
}
