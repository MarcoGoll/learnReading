import { shuffle, preferThenFill } from './random.js';

/** Words needed in the built-word pool to complete level 4. */
export const MIN_BUILT_WORDS = 5;

/** Base points of level 4. */
export const LEVEL_FOUR_BASE = 40;

/**
 * Picks 1-2 distractor syllables from the pool that are not part of the word.
 * @param {object} word - Target word.
 * @param {Array<string>} syllablePool - Mastered syllable ids.
 * @param {Function} randomFn - Random number source.
 * @returns {Array<string>} Distractor syllable ids.
 */
export function pickDistractors(word, syllablePool, randomFn = Math.random) {
  const candidates = syllablePool.filter((syllable) => !word.syllables.includes(syllable));
  const count = randomFn() < 0.5 ? 1 : 2;
  return shuffle(candidates, randomFn).slice(0, count);
}

/**
 * Builds a drag-and-drop task for a word.
 * @param {object} word - Target word.
 * @param {Array<string>} syllablePool - Mastered syllable ids.
 * @param {Function} [randomFn] - Random number source.
 * @returns {{word: object, slots: number, tiles: Array<{tileId: string, syllable: string}>}} Task.
 */
export function buildTask(word, syllablePool, randomFn = Math.random) {
  const syllables = [...word.syllables, ...pickDistractors(word, syllablePool, randomFn)];
  const tiles = syllables.map((syllable, index) => ({ tileId: `t${index}`, syllable }));
  return { word, slots: word.syllables.length, tiles: shuffle(tiles, randomFn) };
}

/**
 * Checks whether the placed syllables form the word in the right order.
 * @param {object} task - Task from buildTask.
 * @param {Array<string>} placedSyllables - Syllable ids in slot order.
 * @returns {boolean} True if correct.
 */
export function checkAnswer(task, placedSyllables) {
  return placedSyllables.length === task.word.syllables.length
    && task.word.syllables.every((syllable, index) => placedSyllables[index] === syllable);
}

/**
 * Picks the words of a level 4 round: words not yet built first.
 * @param {Array<object>} words - Words of the word pool.
 * @param {Array<string>} builtWordPool - Already built word ids.
 * @param {number} [maxSize=5] - Maximum round size.
 * @param {Function} [randomFn] - Random number source.
 * @returns {Array<object>} Round words.
 */
export function buildRound(words, builtWordPool, maxSize = 5, randomFn = Math.random) {
  const unbuilt = words.filter((word) => !builtWordPool.includes(word.id));
  const built = words.filter((word) => builtWordPool.includes(word.id));
  return preferThenFill(unbuilt, built, maxSize, randomFn);
}

/**
 * Checks whether the built-word pool completes level 4.
 * @param {Array<string>} builtWordPool - Built word ids.
 * @returns {boolean} True with at least 5 words.
 */
export function isLevelFourComplete(builtWordPool) {
  return builtWordPool.length >= MIN_BUILT_WORDS;
}
