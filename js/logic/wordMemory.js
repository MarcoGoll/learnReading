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
  return { deck, revealedOnce: [], matchedWordIds: [], pairMistakes: {}, openCardId: null };
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
    markRevealed(game, cardId);
    return { event: 'firstCard' };
  }
  const firstCardId = game.openCardId;
  game.openCardId = null;
  const isMatch = partnerId(firstCardId) === cardId;
  if (isMatch) {
    game.matchedWordIds.push(cardById(game, cardId).wordId);
  } else {
    countMistakes(game, [firstCardId, cardId]);
  }
  markRevealed(game, cardId);
  return { event: isMatch ? 'match' : 'mismatch', firstCardId };
}

/**
 * Counts a mismatch against each card's pair if the card was seen before and its partner too.
 * @param {object} game - Memory game state (mutated).
 * @param {Array<string>} cardIds - The two mismatched cards.
 */
function countMistakes(game, cardIds) {
  cardIds.forEach((cardId) => {
    const knewBoth = game.revealedOnce.includes(cardId) && game.revealedOnce.includes(partnerId(cardId));
    if (knewBoth) {
      const wordId = cardById(game, cardId).wordId;
      game.pairMistakes[wordId] = (game.pairMistakes[wordId] || 0) + 1;
    }
  });
}

/**
 * Marks a card as revealed at least once.
 * @param {object} game - Memory game state (mutated).
 * @param {string} cardId - Card id.
 */
function markRevealed(game, cardId) {
  if (!game.revealedOnce.includes(cardId)) {
    game.revealedOnce.push(cardId);
  }
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
 * Checks whether a pair counts as correct (no mistake after both cards were known).
 * @param {object} game - Memory game state.
 * @param {string} wordId - Word id of the pair.
 * @returns {boolean} True if correct.
 */
export function isPairCorrect(game, wordId) {
  return !game.pairMistakes[wordId];
}

/**
 * Checks whether all pairs are found.
 * @param {object} game - Memory game state.
 * @returns {boolean} True when finished.
 */
export function isFinished(game) {
  return game.matchedWordIds.length * 2 === game.deck.length;
}
