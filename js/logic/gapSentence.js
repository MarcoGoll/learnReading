import { shuffle } from './random.js';
import { roundWithRepeats } from './sentences.js';

/**
 * Returns the token positions of a sentence that may become the gap: learned words from the
 * material, but no noun directly after "ist" (an adjective could fit there as well).
 * @param {object} sentence - Sentence entry.
 * @param {Array<object>} materialWords - Words of the child's material.
 * @returns {Array<number>} Token indexes.
 */
export function gapCandidates(sentence, materialWords) {
  return sentence.tokens.map((token, index) => ({ token, index }))
    .filter(({ token, index }) => {
      const word = materialWords.find((candidate) => candidate.id === token);
      const afterIst = index > 0 && sentence.tokens[index - 1] === 'ist';
      return word && !(word.type === 'noun' && afterIst);
    })
    .map(({ index }) => index);
}

/**
 * Builds a gap task: one learned word is removed; two distractors of another word type are added.
 * @param {object} sentence - Sentence entry.
 * @param {Array<object>} materialWords - Words of the child's material.
 * @param {Array<object>} fallbackWords - Buildable words used when the material is too small.
 * @param {Function} [randomFn] - Random number source.
 * @returns {object|null} Task or null when the sentence has no gap candidate.
 */
export function buildTask(sentence, materialWords, fallbackWords, randomFn = Math.random) {
  const candidates = gapCandidates(sentence, materialWords);
  if (candidates.length === 0) {
    return null;
  }
  const gapIndex = candidates[Math.floor(randomFn() * candidates.length)];
  const answer = materialWords.find((word) => word.id === sentence.tokens[gapIndex]);
  const distractors = pickOtherType(answer, materialWords, fallbackWords, randomFn);
  return { sentence, gapIndex, answer, options: shuffle([answer, ...distractors], randomFn) };
}

/**
 * Picks two words of a different type than the answer, preferably from the material.
 * @param {object} answer - Answer word.
 * @param {Array<object>} materialWords - Words of the child's material.
 * @param {Array<object>} fallbackWords - Fallback words.
 * @param {Function} randomFn - Random number source.
 * @returns {Array<object>} Distractors.
 */
function pickOtherType(answer, materialWords, fallbackWords, randomFn) {
  const otherType = (word) => word.type !== answer.type;
  const fromMaterial = shuffle(materialWords.filter(otherType), randomFn).slice(0, 2);
  const usedIds = new Set(fromMaterial.map((word) => word.id));
  const extra = shuffle(fallbackWords.filter((word) => otherType(word) && !usedIds.has(word.id)), randomFn);
  return [...fromMaterial, ...extra].slice(0, 2);
}

/**
 * Builds a round of gap tasks from available sentences.
 * @param {Array<object>} sentences - Available sentences.
 * @param {Array<object>} materialWords - Words of the child's material.
 * @param {Array<object>} fallbackWords - Fallback words.
 * @param {number} [size=6] - Round size.
 * @param {Function} [randomFn] - Random number source.
 * @returns {Array<object>} Tasks.
 */
export function buildRound(sentences, materialWords, fallbackWords, size = 6, randomFn = Math.random) {
  const usable = sentences.filter((sentence) => gapCandidates(sentence, materialWords).length > 0);
  return roundWithRepeats(usable, size, randomFn)
    .map((sentence) => buildTask(sentence, materialWords, fallbackWords, randomFn));
}
