import { shuffle } from './random.js';

/**
 * Returns the sentences usable for the builder (3-4 tokens).
 * @param {Array<object>} sentences - Available sentences.
 * @returns {Array<object>} Builder sentences.
 */
export function builderSentences(sentences) {
  return sentences.filter((sentence) => sentence.tokens.length >= 3 && sentence.tokens.length <= 4);
}

/**
 * Checks whether a token order is a valid solution of the sentence.
 * @param {object} sentence - Sentence entry.
 * @param {Array<string>} tokens - Token order.
 * @returns {boolean} True for the listed order or a listed alternative.
 */
function isValidOrder(sentence, tokens) {
  return [sentence.tokens, ...sentence.alternatives]
    .some((order) => order.length === tokens.length && order.every((token, index) => tokens[index] === token));
}

/**
 * Builds a task whose tiles are the sentence tokens in an order that is not already a solution.
 * @param {object} sentence - Sentence entry.
 * @param {Function} [randomFn] - Random number source.
 * @returns {{sentence: object, slots: number, tiles: Array<{tileId: string, token: string}>}} Task.
 */
export function buildTask(sentence, randomFn = Math.random) {
  const tiles = sentence.tokens.map((token, index) => ({ tileId: `w${index}`, token }));
  let shuffled = shuffle(tiles, randomFn);
  for (let i = 0; i < 20 && isValidOrder(sentence, shuffled.map((tile) => tile.token)); i++) {
    shuffled = shuffle(tiles, randomFn);
  }
  if (isValidOrder(sentence, shuffled.map((tile) => tile.token))) {
    shuffled = [...tiles].reverse();
  }
  return { sentence, slots: tiles.length, tiles: shuffled };
}

/**
 * Checks the placed tokens against the sentence.
 * @param {object} task - Task from buildTask.
 * @param {Array<string>} placedTokens - Tokens in slot order.
 * @returns {boolean} True if correct.
 */
export function checkAnswer(task, placedTokens) {
  return isValidOrder(task.sentence, placedTokens);
}
