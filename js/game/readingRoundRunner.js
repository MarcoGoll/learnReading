import { el, wait } from '../components/dom.js';
import { createJudgeControls } from '../components/judgeControls.js';
import { bounce, wiggle, burstStars, flyPoints } from '../components/effects.js';
import { createReadingRound, correctItems } from '../logic/readingRound.js';
import { createRoundSession } from '../logic/roundSession.js';
import { playSound } from '../audio/soundPlayer.js';
import { store } from '../state/store.js';
import { createLevelLayout } from './levelLayout.js';
import { readAloudAfterWrong, createReadAloudButton } from './readAloud.js';

/** Pause after a correct answer before the next item appears. */
const NEXT_ITEM_DELAY_MS = 700;

/**
 * Runs a read-aloud round judged by the adult (levels 1-3, sentence reading, practice).
 * @param {HTMLElement} container - Screen container.
 * @param {object} config - Round configuration.
 * @param {string} config.title - Screen title.
 * @param {number|string} config.recordLevel - Level whose record is shown.
 * @param {string} [config.hint] - Hint for the adult.
 * @param {Array} config.items - Items of the round.
 * @param {Function} config.renderItem - Creates the card content of an item.
 * @param {Function} config.historyKey - Returns the history key of an item.
 * @param {Function} config.speakText - Returns the text to read aloud, or null.
 * @param {number} config.level - Level used for base points.
 * @param {Function} [config.recordOptions] - Returns per-item scoring options ({ base }).
 * @param {number} [config.goalLevel] - Level whose goal banner is shown.
 * @param {Function} [config.goalIdOf] - Returns the pool id of a correct item for the goal progress.
 * @param {Function} config.onFinished - Called with (results, session) when the round ends.
 * @returns {Function} Cleanup function.
 */
export function runReadingRound(container, config) {
  const layout = createLevelLayout(container, config);
  const round = createReadingRound(config.items);
  const session = createRoundSession({ level: config.level, updateState: store.updateState });
  const card = el('div', { className: 'level-screen__card card', attrs: { 'aria-live': 'polite' } });
  const speaker = createReadAloudButton(() => (round.current() ? config.speakText(round.current()) : null));
  layout.stage.append(card, speaker);
  const context = { config, round, session, layout, card, speaker, controls: null, isActive: true };
  context.controls = createJudgeControls(layout.footer, buildCallbacks(context));
  showCurrent(context);
  return () => {
    context.isActive = false;
    context.controls.destroy();
  };
}

/**
 * Shows the current item, or finishes the round when no item is left.
 * @param {object} context - Round context.
 */
function showCurrent(context) {
  if (!context.isActive) {
    return;
  }
  const item = context.round.current();
  if (!item) {
    context.isActive = false;
    context.controls.destroy();
    context.config.onFinished(context.round.results(), context.session);
    return;
  }
  updateGoal(context);
  context.card.replaceChildren(context.config.renderItem(item));
  context.speaker.classList.toggle('read-aloud-button--unavailable', !context.config.speakText(item));
  context.controls.setEnabled(true);
}

/**
 * Updates the goal banner with the items judged correct in this round.
 * @param {object} context - Round context.
 */
function updateGoal(context) {
  const { config, round, layout } = context;
  if (config.goalIdOf) {
    layout.showGoal(correctItems(round.results()).map(config.goalIdOf));
  }
}

/**
 * Builds the judge control callbacks of a round.
 * @param {object} context - Round context.
 * @returns {object} Callbacks.
 */
function buildCallbacks(context) {
  const { round, session, config } = context;
  return {
    onCorrect: () => handleJudgement(context, true),
    onWrong: () => handleJudgement(context, false),
    onSkip: () => { round.skip(); showCurrent(context); },
    onNotYet: () => {
      const item = round.current();
      round.notYet();
      session.record(config.historyKey(item), 'notYet');
      showCurrent(context);
    },
    onUndo: () => {
      round.undo();
      session.undo();
      context.layout.scoreBoard.update(session.roundScore(), session.streak());
      showCurrent(context);
    },
    canUndo: () => round.canUndo() && session.canUndo()
  };
}

/**
 * Handles a correct or wrong judgement: records it, plays feedback, and moves on.
 * @param {object} context - Round context.
 * @param {boolean} isCorrect - Judgement.
 */
async function handleJudgement(context, isCorrect) {
  const { round, session, config, layout, card } = context;
  const item = round.current();
  round.judge(isCorrect);
  const options = config.recordOptions ? config.recordOptions(item) : {};
  const result = session.record(config.historyKey(item), isCorrect ? 'correct' : 'wrong', options);
  layout.scoreBoard.update(session.roundScore(), session.streak());
  layout.companion.react(isCorrect ? 'correct' : 'wrong');
  updateGoal(context);
  context.controls.setEnabled(false);
  if (isCorrect) {
    await showCorrectFeedback(card, layout, result);
  } else {
    playSound('wrong');
    wiggle(card);
    await Promise.all([readAloudAfterWrong(config.speakText(item)), wait(NEXT_ITEM_DELAY_MS)]);
  }
  showCurrent(context);
}

/**
 * Plays the feedback of a correct answer.
 * @param {HTMLElement} card - Item card.
 * @param {object} layout - Level layout.
 * @param {{points: number, streak: number}} result - Recorded result.
 * @returns {Promise<void>} Resolves after the feedback delay.
 */
function showCorrectFeedback(card, layout, result) {
  playSound('correct');
  bounce(card);
  burstStars(card);
  flyPoints(card, layout.scoreBoard.scoreElement, result.points);
  return wait(NEXT_ITEM_DELAY_MS);
}
