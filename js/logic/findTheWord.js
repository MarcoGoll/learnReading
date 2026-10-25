import { shuffle } from './random.js';
import { roundWithRepeats } from './sentences.js';

/** Number of distractor words per task. */
const DISTRACTOR_COUNT = 3;

/** Number of most similar candidates from which distractors are drawn. */
const SIMILAR_POOL_SIZE = 5;

/**
 * Scores how similar two words look (shared syllables, first letter, syllable count).
 * @param {object} wordA - First word.
 * @param {object} wordB - Second word.
 * @returns {number} Similarity score (higher is more similar).
 */
export function similarityScore(wordA, wordB) {
  const sharedSyllables = wordA.syllables.filter((syllable) => wordB.syllables.includes(syllable)).length;
  const sameFirstLetter = wordA.id.charAt(0) === wordB.id.charAt(0) ? 1 : 0;
  const sameLength = wordA.syllables.length === wordB.syllables.length ? 1 : 0;
  const sameEnding = wordA.syllables.at(-1) === wordB.syllables.at(-1) ? 1 : 0;
  return sharedSyllables * 2 + sameFirstLetter + sameLength + sameEnding;
}

/**
 * Picks distractors: the most similar candidates, shuffled for variety.
 * @param {object} target - Target word.
 * @param {Array<object>} candidates - Candidate words (without the target).
 * @param {number} count - Number of distractors.
 * @param {Function} randomFn - Random number source.
 * @returns {Array<object>} Distractors.
 */
function similarDistractors(target, candidates, count, randomFn) {
  const ranked = shuffle(candidates, randomFn)
    .sort((first, second) => similarityScore(target, second) - similarityScore(target, first));
  return shuffle(ranked.slice(0, Math.max(count, SIMILAR_POOL_SIZE)), randomFn).slice(0, count);
}

/**
 * Builds a task with the target and three distractors, preferring similar words from the material.
 * @param {object} target - Target word.
 * @param {Array<object>} materialWords - Words of the child's material.
 * @param {Array<object>} fallbackWords - Buildable words used when the material is too small.
 * @param {Function} [randomFn] - Random number source.
 * @returns {{target: object, options: Array<object>}} Task.
 */
export function buildTask(target, materialWords, fallbackWords, randomFn = Math.random) {
  const fromMaterial = materialWords.filter((word) => word.id !== target.id);
  let distractors = similarDistractors(target, fromMaterial, DISTRACTOR_COUNT, randomFn);
  if (distractors.length < DISTRACTOR_COUNT) {
    const usedIds = new Set([target.id, ...distractors.map((word) => word.id)]);
    const extra = fallbackWords.filter((word) => !usedIds.has(word.id));
    distractors = [...distractors, ...similarDistractors(target, extra, DISTRACTOR_COUNT - distractors.length, randomFn)];
  }
  return { target, options: shuffle([target, ...distractors], randomFn) };
}

/**
 * Builds a round of target words.
 * @param {Array<object>} materialWords - Words of the child's material.
 * @param {number} [size=6] - Round size.
 * @param {Function} [randomFn] - Random number source.
 * @returns {Array<object>} Round targets.
 */
export function buildRound(materialWords, size = 6, randomFn = Math.random) {
  return roundWithRepeats(materialWords, size, randomFn);
}
