import { shuffle } from './random.js';

/** Preferred number of pairs per game. */
export const PAIR_COUNT = 6;

/** Minimum number of pairs; with fewer picture targets the variant is unavailable. */
export const MIN_PAIRS = 4;

/**
 * Builds a shuffled memory deck with one word card and one picture card per target.
 * @param {Array<object>} targets - Learned nouns with pictures.
 * @param {number} [pairCount=6] - Desired number of pairs.
 * @param {Function} [randomFn] - Random number source.
 * @returns {Array<{cardId: string, wordId: string, kind: string}>} Cards.
 */
export function buildDeck(targets, pairCount = PAIR_COUNT, randomFn = Math.random) {
  const chosen = shuffle(targets, randomFn).slice(0, pairCount);
  const cards = chosen.flatMap((word) => [
    { cardId: `${word.id}-word`, wordId: word.id, kind: 'word' },
    { cardId: `${word.id}-picture`, wordId: word.id, kind: 'picture' }
  ]);
  return shuffle(cards, randomFn);
}

/**
 * Creates the initial game state for a deck.
 * @param {Array<object>} deck - Cards.
 * @returns {object} Memory game state.
 */
export function createMemoryGame(deck) {
  return { deck, matchedWordIds: [], openCardId: null };
}

/**
 * Returns the partner card id of a card.
 * @param {string} cardId - Card id.
 * @returns {string} Partner card id.
 */
function partnerId(cardId) {
  return cardId.endsWith('-word') ? cardId.replace(/-word$/, '-picture') : cardId.replace(/-picture$/, '-word');
}

/**
 * Flips a card and returns the resulting event.
 * @param {object} game - Memory game state (mutated).
 * @param {string} cardId - Flipped card.
 * @returns {{event: string, firstCardId?: string}} Event: firstCard, match, or mismatch.
 */
export function flip(game, cardId) {
  if (game.openCardId === null) {
    game.openCardId = cardId;
    return { event: 'firstCard' };
  }
  const firstCardId = game.openCardId;
  game.openCardId = null;
  const isMatch = partnerId(firstCardId) === cardId;
  if (isMatch) {
    game.matchedWordIds.push(cardById(game, cardId).wordId);
  }
  return { event: isMatch ? 'match' : 'mismatch', firstCardId };
}

/**
 * Finds a card of the deck.
 * @param {object} game - Memory game state.
 * @param {string} cardId - Card id.
 * @returns {object} Card.
 */
function cardById(game, cardId) {
  return game.deck.find((card) => card.cardId === cardId);
}

/**
 * Checks whether all pairs are found.
 * @param {object} game - Memory game state.
 * @returns {boolean} True when finished.
 */
export function isFinished(game) {
  return game.matchedWordIds.length * 2 === game.deck.length;
}
