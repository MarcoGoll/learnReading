import { shuffle } from './random.js';

/**
 * Returns the sentences whose learned-word tokens are all in the word material.
 * Every sentence must contain at least one learned word; sight words are always allowed.
 * @param {Array<string>} wordIds - Word material ids.
 * @param {Array<object>} sentences - All sentences.
 * @param {Array<string>} sightWords - Sight words.
 * @returns {Array<object>} Available sentences.
 */
export function availableSentences(wordIds, sentences, sightWords) {
  const known = new Set(wordIds);
  return sentences.filter((sentence) => {
    const learnedTokens = sentence.tokens.filter((token) => !sightWords.includes(token));
    return learnedTokens.length > 0 && learnedTokens.every((token) => known.has(token));
  });
}

/**
 * Builds a round of random sentences without repeats.
 * @param {Array<object>} available - Available sentences.
 * @param {number} [size=5] - Round size.
 * @param {Function} [randomFn] - Random number source.
 * @returns {Array<object>} Round sentences.
 */
export function buildRound(available, size = 5, randomFn = Math.random) {
  return shuffle(available, randomFn).slice(0, size);
}

/**
 * Builds a round of targets, repeating targets only when fewer than the round size exist.
 * @param {Array} targets - Possible targets.
 * @param {number} size - Round size.
 * @param {Function} [randomFn] - Random number source.
 * @returns {Array} Round targets.
 */
export function roundWithRepeats(targets, size, randomFn = Math.random) {
  if (targets.length === 0) {
    return [];
  }
  const round = shuffle(targets, randomFn).slice(0, size);
  while (round.length < size) {
    round.push(targets[Math.floor(randomFn() * targets.length)]);
  }
  return round;
}
