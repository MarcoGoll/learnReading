import { el, button, wait } from '../components/dom.js';
import { bounce, wiggle, burstStars, flyPoints } from '../components/effects.js';
import { createNumberPad } from '../components/numberPad.js';
import { createAnswerCards } from '../components/answerCards.js';
import { createAid } from '../components/mathAids.js';
import { createRoundSession } from '../logic/roundSession.js';
import { answerOptions } from '../logic/math/taskSelection.js';
import { mathHistoryKey, solutionSpeech } from '../logic/math/task.js';
import { mathBasePoints } from '../logic/math/mathLevelGoals.js';
import { playSound } from '../audio/soundPlayer.js';
import { store } from '../state/store.js';
import { createLevelLayout } from './levelLayout.js';
import { createTaskSpeakerButton, readAloudAfterWrong } from './readAloud.js';

/** Pause after a correct answer. */
const CORRECT_DELAY_MS = 1000;

/** Time the solution stays visible after the second wrong answer. */
const SOLUTION_MS = 2200;

/**
 * Runs a round of math tasks with automatic checking and two attempts per task.
 * @param {HTMLElement} container - Screen container.
 * @param {object} options - Round options.
 * @param {string} options.title - Screen title.
 * @param {number} options.level - Level (base points, record, and goal banner).
 * @param {Array<object>} options.tasks - Tasks of the round.
 * @param {object} options.display - input ("cards" or "pad"), aid, aidMode ("always" or "onRequest").
 * @param {{min: number, max: number}} [options.cardRange] - Range of the answer cards.
 * @param {Function} options.onFinished - Called with (session, masteredIds, solvedCount); solved counts
 *   tasks answered correctly at the first or second attempt.
 * @returns {Function} Cleanup function.
 */
export function runMathTasks(container, options) {
  const layout = createLevelLayout(container, { title: options.title, recordLevel: options.level, goalLevel: options.level });
  const session = createRoundSession({ level: options.level, updateState: store.updateState });
  const context = { options, layout, session, index: 0, isActive: true, masteredIds: [], solvedCount: 0, view: null };
  showTask(context);
  return () => {
    context.isActive = false;
    if (context.view && context.view.pad) context.view.pad.destroy();
  };
}

/**
 * Shows the current task or finishes the round.
 * @param {object} context - Runner context.
 */
function showTask(context) {
  if (!context.isActive) return;
  if (context.view && context.view.pad) context.view.pad.destroy();
  const task = context.options.tasks[context.index];
  if (!task) {
    context.isActive = false;
    context.options.onFinished(context.session, context.masteredIds, context.solvedCount);
    return;
  }
  context.view = buildTaskView(context, task);
  context.layout.stage.replaceChildren(context.view.element);
}

/**
 * Builds the view of one task: text, speaker button, picture, help button, and input.
 * @param {object} context - Runner context.
 * @param {object} task - Task.
 * @returns {object} View with element, text, aidArea, pad or cards, attempt.
 */
function buildTaskView(context, task) {
  const { display } = context.options;
  const view = { task, attempt: 1, isLocked: false };
  view.text = el('p', { className: 'math-task__text', text: task.text });
  view.aidArea = el('div', { className: 'math-task__aid' }, [createAid(task, display.aid)]);
  const hasAid = task.operation !== 'pickQuantity';
  view.aidArea.hidden = !hasAid || display.aidMode !== 'always';
  const help = !hasAid || display.aidMode === 'always' ? null : button({ className: 'small-button math-task__help', iconName: 'lightbulb', label: 'Hilfe', onClick: () => { view.aidArea.hidden = false; } });
  const input = createInput(context, view);
  view.element = el('div', { className: 'math-task card' }, [
    el('div', { className: 'math-task__header' }, [view.text, createTaskSpeakerButton(() => task.speech)]),
    view.aidArea, help, input
  ]);
  return view;
}

/**
 * Creates the input of a task: answer cards in card levels, otherwise the number pad.
 * @param {object} context - Runner context.
 * @param {object} view - Task view (gets pad or cards).
 * @returns {HTMLElement} Input element.
 */
function createInput(context, view) {
  const { task } = view;
  if (context.options.display.input === 'cards') {
    const range = context.options.cardRange || { min: 0, max: 10 };
    const values = answerOptions(task.answer, { ...range, count: 4 });
    view.cards = createAnswerCards({ values, showQuantities: task.operation === 'pickQuantity', onChoose: (value, card) => answer(context, view, value, card) });
    return view.cards.element;
  }
  view.pad = createNumberPad({ onSubmit: (value) => answer(context, view, value, view.pad.element) });
  return view.pad.element;
}

/**
 * Checks an answer and continues with feedback, a second attempt, or the solution.
 * @param {object} context - Runner context.
 * @param {object} view - Task view.
 * @param {number} value - Given answer.
 * @param {HTMLElement} target - Element to animate.
 */
async function answer(context, view, value, target) {
  if (view.isLocked || !context.isActive) return;
  if (value === view.task.answer) {
    await handleCorrect(context, view, target);
  } else if (view.attempt === 1) {
    handleFirstMistake(context, view, value, target);
    return;
  } else {
    await handleSecondMistake(context, view);
  }
  context.index += 1;
  showTask(context);
}

/**
 * Records a correct answer: full points at the first attempt, half points (and a broken streak) at the second.
 * @param {object} context - Runner context.
 * @param {object} view - Task view.
 * @param {HTMLElement} target - Element to animate.
 */
async function handleCorrect(context, view, target) {
  view.isLocked = true;
  const base = mathBasePoints(context.options.level);
  const key = mathHistoryKey(view.task);
  const result = view.attempt === 1
    ? context.session.record(key, 'correct', { base })
    : context.session.record(key, 'wrong', { consolationPoints: base / 2 });
  if (view.attempt === 1) context.masteredIds.push(view.task.id);
  context.solvedCount += 1;
  showSolution(context, view);
  playSound('correct');
  bounce(target);
  burstStars(target);
  flyPoints(target, context.layout.scoreBoard.scoreElement, result.points);
  updateBoard(context, 'correct');
  await wait(CORRECT_DELAY_MS);
}

/**
 * Handles a wrong first answer: wrong sound, picture appears, input is cleared for a second attempt.
 * @param {object} context - Runner context.
 * @param {object} view - Task view.
 * @param {number} value - Given answer.
 * @param {HTMLElement} target - Element to animate.
 */
function handleFirstMistake(context, view, value, target) {
  view.attempt = 2;
  playSound('wrong');
  wiggle(target);
  context.layout.companion.react('wrong');
  view.aidArea.hidden = view.task.operation === 'pickQuantity';
  if (view.pad) view.pad.clear();
  if (view.cards) {
    const card = view.cards.cardOf(value);
    card.classList.add('answer-cards__card--wrong');
    card.disabled = true;
  }
}

/**
 * Handles a wrong second answer: no points, the solution is shown (and read aloud if enabled).
 * @param {object} context - Runner context.
 * @param {object} view - Task view.
 */
async function handleSecondMistake(context, view) {
  view.isLocked = true;
  context.session.record(mathHistoryKey(view.task), 'wrong');
  playSound('wrong');
  updateBoard(context, 'wrong');
  showSolution(context, view);
  view.element.classList.add('math-task--solution');
  await Promise.all([readAloudAfterWrong(solutionSpeech(view.task)), wait(SOLUTION_MS)]);
}

/**
 * Shows the solution in the task text, the solved picture, and the correct card.
 * @param {object} context - Runner context.
 * @param {object} view - Task view.
 */
function showSolution(context, view) {
  const { task } = view;
  view.text.textContent = task.text.replace('?', String(task.answer)).replace('_', String(task.answer));
  view.text.classList.add('math-task__text--solved');
  if (task.operation !== 'count' && task.operation !== 'pickQuantity') {
    view.aidArea.replaceChildren(createAid(task, context.options.display.aid, true));
  }
  if (view.pad) view.pad.setDisabled(true);
  if (view.cards) {
    const card = view.cards.cardOf(task.answer);
    if (card) card.classList.add('answer-cards__card--correct');
    view.cards.setDisabled(true);
  }
}

/**
 * Updates score board, companion, and goal banner after a recorded task.
 * @param {object} context - Runner context.
 * @param {string} reaction - "correct" or "wrong".
 */
function updateBoard(context, reaction) {
  context.layout.scoreBoard.update(context.session.roundScore(), context.session.streak());
  context.layout.companion.react(reaction);
  context.layout.showGoal(context.masteredIds);
}
