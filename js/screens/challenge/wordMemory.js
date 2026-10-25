import { el, wait } from '../../components/dom.js';
import { wordCard } from '../../components/itemCards.js';
import { burstStars, flyPoints } from '../../components/effects.js';
import { wordById } from '../../data/allWords.js';
import { buildDeck, createMemoryGame, flip, isFinished, PAIR_COUNT, MIN_PAIRS } from '../../logic/wordMemory.js';
import { createRoundSession } from '../../logic/roundSession.js';
import { LEVEL_FIVE_BASE } from '../../logic/challengeLevel.js';
import { itemKey } from '../../logic/history.js';
import { playSound } from '../../audio/soundPlayer.js';
import { speak } from '../../audio/speech.js';
import { store } from '../../state/store.js';
import { createLevelLayout } from '../../game/levelLayout.js';

/** Time before mismatched cards flip back. */
const FLIP_BACK_MS = 1200;

/**
 * Creates the face of a memory card.
 * @param {object} card - Memory card.
 * @returns {HTMLElement} Card face.
 */
function cardFace(card) {
  const word = wordById(card.wordId);
  const content = card.kind === 'word'
    ? wordCard(word)
    : el('img', { className: 'memory-board__picture', attrs: { src: `assets/svg/pictures/${word.picture}.svg`, alt: '' } });
  return el('span', { className: 'memory-board__face' }, [content]);
}

/**
 * Creates the button of a memory card.
 * @param {object} card - Memory card.
 * @param {Function} onFlip - Called with the card id.
 * @returns {HTMLButtonElement} Card button.
 */
function cardButton(card, onFlip) {
  const element = el('button', { className: 'memory-board__card', attrs: { type: 'button', 'aria-label': 'Karte' } }, [
    el('span', { className: 'memory-board__back' }, [el('img', { attrs: { src: 'assets/svg/dino/trex/stage-1.svg', alt: '' } })]),
    cardFace(card)
  ]);
  element.addEventListener('click', () => onFlip(card.cardId));
  return element;
}

/**
 * Handles a found pair: records it, plays feedback, and speaks the word.
 * @param {object} context - Game context.
 * @param {string} cardId - Second card of the pair.
 */
function onMatch(context, cardId) {
  const { game, session, layout, elements } = context;
  const wordId = game.deck.find((card) => card.cardId === cardId).wordId;
  const result = session.record(itemKey('word', wordId), 'correct', { base: LEVEL_FIVE_BASE });
  [`${wordId}-word`, `${wordId}-picture`].forEach((id) => elements.get(id).classList.add('memory-board__card--matched'));
  layout.scoreBoard.update(session.roundScore(), session.streak());
  layout.companion.react('correct');
  playSound('correct');
  burstStars(elements.get(cardId));
  flyPoints(elements.get(cardId), layout.scoreBoard.scoreElement, result.points);
  speak(wordById(wordId).display);
}

/**
 * Flips a card and reacts to the resulting event.
 * @param {object} context - Game context.
 * @param {string} cardId - Flipped card.
 */
async function onFlip(context, cardId) {
  const { game, elements } = context;
  const element = elements.get(cardId);
  if (context.locked || element.classList.contains('memory-board__card--flipped')) return;
  element.classList.add('memory-board__card--flipped');
  const { event, firstCardId } = flip(game, cardId);
  if (event === 'match') {
    onMatch(context, cardId);
  } else if (event === 'mismatch') {
    context.locked = true;
    playSound('wrong');
    context.layout.companion.react('wrong');
    await wait(FLIP_BACK_MS);
    [firstCardId, cardId].forEach((id) => elements.get(id).classList.remove('memory-board__card--flipped'));
    context.locked = false;
  }
  if (isFinished(game)) {
    await wait(1500);
    context.finish(context.session.correctCount(), context.session.taskCount(), context.session);
  }
}

/** Level 5 variant: memory with word cards and picture cards. */
export const wordMemoryVariant = {
  id: 'wordMemory',
  title: 'Wort-Memory',
  picture: 'domino',
  unavailableHint: 'Lerne erst mindestens 4 Wörter mit Bildern!',

  /**
   * Checks whether enough learned nouns with pictures exist.
   * @param {object} material - Word material.
   * @returns {boolean} True with at least 4 picture targets.
   */
  isAvailable(material) {
    return material.pictureTargets.length >= MIN_PAIRS;
  },

  /**
   * Runs one memory game.
   * @param {HTMLElement} container - Screen container.
   * @param {object} material - Word material.
   * @param {Function} finish - Called with (correctCount, taskCount, session).
   * @returns {Function} Cleanup function.
   */
  run(container, material, finish) {
    const layout = createLevelLayout(container, { title: 'Wort-Memory', recordLevel: 5, goalLevel: 5 });
    const game = createMemoryGame(buildDeck(material.pictureTargets, Math.min(PAIR_COUNT, material.pictureTargets.length)));
    const context = { game, layout, finish, locked: false, elements: new Map() };
    context.session = createRoundSession({ level: 5, updateState: store.updateState });
    const board = el('div', { className: 'memory-board' });
    game.deck.forEach((card) => {
      const element = cardButton(card, (cardId) => onFlip(context, cardId));
      context.elements.set(card.cardId, element);
      board.append(element);
    });
    layout.stage.replaceChildren(board);
    return () => { context.locked = true; };
  }
};
