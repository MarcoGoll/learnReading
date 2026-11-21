import { el, wait } from '../../components/dom.js';
import { burstStars, flyPoints } from '../../components/effects.js';
import { mixedTasks } from '../../logic/math/taskGenerator.js';
import { buildMathDeck, createMathMemoryGame, flipMathCard, isMathMemoryFinished, isMemoryPassed, MATH_PAIR_COUNT } from '../../logic/math/mathMemory.js';
import { mathHistoryKey, spokenExpression } from '../../logic/math/task.js';
import { mathBasePoints } from '../../logic/math/mathLevelGoals.js';
import { createRoundSession } from '../../logic/roundSession.js';
import { playSound } from '../../audio/soundPlayer.js';
import { store } from '../../state/store.js';
import { activeJourneyDef } from '../../state/journeyState.js';
import { createLevelLayout } from '../../game/levelLayout.js';
import { createTaskSpeakerButton } from '../../game/readAloud.js';
import { halfRuleResult } from './variantResult.js';

/** Time before mismatched cards flip back. */
const FLIP_BACK_MS = 1200;

/**
 * Creates the button of a memory card with a dino back and a task or result face.
 * @param {object} card - Memory card.
 * @param {string} species - Species of the active dino (card back).
 * @param {Function} onFlip - Called with the card id.
 * @returns {HTMLButtonElement} Card button.
 */
function cardButton(card, species, onFlip) {
  const face = el('span', { className: `memory-board__face memory-card memory-card--${card.kind}`, text: card.text });
  const element = el('button', { className: 'memory-board__card', attrs: { type: 'button', 'aria-label': 'Karte' } }, [
    el('span', { className: 'memory-board__back' }, [el('img', { attrs: { src: `assets/svg/dino/${species}/stage-1.svg`, alt: '' } })]),
    face
  ]);
  element.addEventListener('click', () => onFlip(card.id));
  return element;
}

/**
 * Handles a found pair: records it (correct only when found without a previous miss) and plays feedback.
 * @param {object} context - Game context.
 * @param {string} cardId - Second card of the pair.
 * @param {object} flipResult - Result of flipMathCard.
 */
function onMatch(context, cardId, flipResult) {
  const card = context.game.deck.find((entry) => entry.id === cardId);
  const base = mathBasePoints(7);
  const result = flipResult.isFirstTry
    ? context.session.record(mathHistoryKey(card.task), 'correct', { base })
    : context.session.record(mathHistoryKey(card.task), 'wrong', { consolationPoints: base / 2 });
  [flipResult.firstCardId, cardId].forEach((id) => context.elements.get(id).classList.add('memory-board__card--matched'));
  context.layout.scoreBoard.update(context.session.roundScore(), context.session.streak());
  context.layout.companion.react('correct');
  playSound('correct');
  burstStars(context.elements.get(cardId));
  flyPoints(context.elements.get(cardId), context.layout.scoreBoard.scoreElement, result.points);
}

/**
 * Flips a card and reacts to the resulting event.
 * @param {object} context - Game context.
 * @param {string} cardId - Flipped card.
 */
async function onFlip(context, cardId) {
  const element = context.elements.get(cardId);
  if (context.locked || element.classList.contains('memory-board__card--flipped')) return;
  element.classList.add('memory-board__card--flipped');
  context.lastText = context.game.deck.find((card) => card.id === cardId).text;
  const flipResult = flipMathCard(context.game, cardId);
  if (flipResult.event === 'match') onMatch(context, cardId, flipResult);
  if (flipResult.event === 'mismatch') await flipBack(context, [flipResult.firstCardId, cardId]);
  if (isMathMemoryFinished(context.game)) {
    context.locked = true;
    await wait(1500);
    context.finish(memoryResult(context));
  }
}

/**
 * Plays the mismatch feedback and turns both cards face down again.
 * @param {object} context - Game context.
 * @param {Array<string>} cardIds - The two mismatched cards.
 */
async function flipBack(context, cardIds) {
  context.locked = true;
  playSound('wrong');
  context.layout.companion.react('wrong');
  await wait(FLIP_BACK_MS);
  cardIds.forEach((id) => context.elements.get(id).classList.remove('memory-board__card--flipped'));
  context.locked = false;
}

/**
 * Builds the round result: passed when all pairs were found within the allowed moves.
 * @param {object} context - Game context.
 * @returns {object} Result for the summary.
 */
function memoryResult(context) {
  const { game, session } = context;
  const pairCount = game.deck.length / 2;
  const result = halfRuleResult(session, session.correctCount(), pairCount, isMemoryPassed(game.matchedPairIds.length, pairCount, game.moves));
  return { ...result, resultText: `Alle ${pairCount} Paare in ${game.moves} Zügen gefunden`, neededText: 'Schaffe es in höchstens 12 Zügen.' };
}

/** Level 7 variant: memory with task cards and result cards. */
export const mathMemoryVariant = {
  id: 'mathMemory',
  title: 'Rechen-Memory',
  picture: 'mathMemory',

  /**
   * Runs one memory game.
   * @param {HTMLElement} container - Screen container.
   * @param {{challenge: object}} context - Variant context.
   * @param {Function} finish - Called with the round result.
   * @returns {Function} Cleanup function.
   */
  run(container, { challenge }, finish) {
    const layout = createLevelLayout(container, { title: 'Rechen-Memory', recordLevel: 7, goalLevel: 7 });
    const game = createMathMemoryGame(buildMathDeck(mixedTasks(challenge, 30), MATH_PAIR_COUNT));
    const context = { game, layout, finish, locked: false, elements: new Map(), lastText: null };
    context.session = createRoundSession({ level: 7, updateState: store.updateState });
    const species = activeJourneyDef(store.getState()).species;
    const board = el('div', { className: 'memory-board' });
    game.deck.forEach((card) => {
      const element = cardButton(card, species, (cardId) => onFlip(context, cardId));
      context.elements.set(card.id, element);
      board.append(element);
    });
    const speaker = createTaskSpeakerButton(() => context.lastText && spokenExpression(context.lastText));
    layout.stage.replaceChildren(el('div', { className: 'math-variant__tools' }, [speaker]), board);
    return () => { context.locked = true; };
  }
};
