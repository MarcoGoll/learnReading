import { shuffle } from '../random.js';

/** Number of pairs of the math memory. */
export const MATH_PAIR_COUNT = 6;

/** Maximum moves for the memory to count as passed. */
export const MAX_PASSING_MOVES = 12;

/**
 * Builds a deck of task and result cards with different results.
 * @param {Array<object>} tasks - Candidate tasks.
 * @param {number} [pairCount=MATH_PAIR_COUNT] - Number of pairs.
 * @param {Function} [randomFn=Math.random] - Random source.
 * @returns {Array<{id: string, pairId: string, kind: string, text: string, task: object}>} Shuffled cards.
 */
export function buildMathDeck(tasks, pairCount = MATH_PAIR_COUNT, randomFn = Math.random) {
  const usedResults = new Set();
  const chosen = [];
  tasks.forEach((task) => {
    if (chosen.length < pairCount && !usedResults.has(task.answer)) {
      usedResults.add(task.answer);
      chosen.push(task);
    }
  });
  const cards = chosen.flatMap((task) => [
    { id: `${task.id}#task`, pairId: task.id, kind: 'task', text: task.text.replace(' = ?', ''), task },
    { id: `${task.id}#result`, pairId: task.id, kind: 'result', text: String(task.answer), task }
  ]);
  return shuffle(cards, randomFn);
}

/**
 * Checks whether the memory is passed: all pairs found within the allowed moves.
 * @param {number} foundPairs - Found pairs.
 * @param {number} pairCount - All pairs.
 * @param {number} moves - Moves (two flipped cards each).
 * @returns {boolean} True if passed.
 */
export function isMemoryPassed(foundPairs, pairCount, moves) {
  return foundPairs === pairCount && moves <= MAX_PASSING_MOVES;
}

/**
 * Creates the state of a math memory game.
 * @param {Array<object>} deck - Cards from buildMathDeck.
 * @returns {object} Game state.
 */
export function createMathMemoryGame(deck) {
  return { deck, openCardId: null, matchedPairIds: [], missedPairIds: [], moves: 0 };
}

/**
 * Flips a card: the first card of a move opens, the second one ends the move as match or mismatch.
 * @param {object} game - Game state (mutated).
 * @param {string} cardId - Flipped card id.
 * @returns {{event: string, firstCardId?: string, pairId?: string, isFirstTry?: boolean}} Event.
 */
export function flipMathCard(game, cardId) {
  if (game.openCardId === null) {
    game.openCardId = cardId;
    return { event: 'firstCard' };
  }
  const firstCardId = game.openCardId;
  game.openCardId = null;
  game.moves += 1;
  const first = game.deck.find((card) => card.id === firstCardId);
  const second = game.deck.find((card) => card.id === cardId);
  if (first.pairId === second.pairId) {
    game.matchedPairIds.push(first.pairId);
    return { event: 'match', firstCardId, pairId: first.pairId, isFirstTry: !game.missedPairIds.includes(first.pairId) };
  }
  game.missedPairIds.push(first.pairId, second.pairId);
  return { event: 'mismatch', firstCardId };
}

/**
 * Checks whether all pairs of the game are found.
 * @param {object} game - Game state.
 * @returns {boolean} True when finished.
 */
export function isMathMemoryFinished(game) {
  return game.matchedPairIds.length * 2 === game.deck.length;
}
