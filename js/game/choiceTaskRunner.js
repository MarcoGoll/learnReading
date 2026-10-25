import { el, button, wait } from '../components/dom.js';
import { bounce, wiggle, burstStars, flyPoints } from '../components/effects.js';
import { createRoundSession } from '../logic/roundSession.js';
import { playSound } from '../audio/soundPlayer.js';
import { store } from '../state/store.js';
import { createLevelLayout } from './levelLayout.js';

/** Time the correct option stays highlighted after a wrong choice. */
const SHOW_CORRECT_MS = 1500;

/** Pause after a correct choice. */
const CORRECT_DELAY_MS = 900;

/**
 * Runs a series of choice tasks validated by the game (WordPicture, FindTheWord, GapSentence).
 * @param {HTMLElement} container - Screen container.
 * @param {object} config - Configuration.
 * @param {string} config.title - Screen title.
 * @param {Array<object>} config.tasks - Tasks.
 * @param {Function} config.renderPrompt - Returns { element, onShow } for a task.
 * @param {Function} config.optionsOf - Returns the options of a task.
 * @param {Function} config.renderOption - Returns the content of an option.
 * @param {Function} config.isCorrect - Checks (task, option).
 * @param {Function} config.historyKey - Returns the history key of a task.
 * @param {Function} [config.afterAnswer] - Async hook after an answer (task, prompt).
 * @param {string} config.optionsClass - BEM block of the option list.
 * @param {Function} config.onFinished - Called with (correctCount, taskCount, session).
 * @returns {Function} Cleanup function.
 */
export function runChoiceTasks(container, config) {
  const layout = createLevelLayout(container, { title: config.title, recordLevel: 5, goalLevel: 5 });
  const session = createRoundSession({ level: 5, updateState: store.updateState });
  const context = { config, layout, session, index: 0, isActive: true };
  showTask(context);
  return () => { context.isActive = false; };
}

/**
 * Shows the current task or finishes the series.
 * @param {object} context - Runner context.
 */
function showTask(context) {
  if (!context.isActive) return;
  const { config, layout, session } = context;
  const task = config.tasks[context.index];
  if (!task) {
    context.isActive = false;
    config.onFinished(session.correctCount(), session.taskCount(), session);
    return;
  }
  const prompt = config.renderPrompt(task);
  const taskState = { task, prompt, answered: false, optionElements: [] };
  const optionList = el('div', { className: config.optionsClass });
  config.optionsOf(task).forEach((option) => {
    const optionElement = el('button', { className: `${config.optionsClass}__option`, attrs: { type: 'button' } }, [config.renderOption(option)]);
    optionElement.addEventListener('click', () => choose(context, taskState, option, optionElement));
    taskState.optionElements.push({ option, element: optionElement });
    optionList.append(optionElement);
  });
  layout.stage.replaceChildren(el('div', { className: 'choice-task card' }, [prompt.element, optionList]));
  layout.footer.replaceChildren(button({ className: 'small-button', iconName: 'skip_next', label: 'Weiter', onClick: () => advance(context, taskState) }));
  if (prompt.onShow) prompt.onShow();
}

/**
 * Moves to the next task once.
 * @param {object} context - Runner context.
 * @param {object} taskState - Current task state.
 */
function advance(context, taskState) {
  if (taskState.moved) return;
  taskState.moved = true;
  context.index += 1;
  showTask(context);
}

/**
 * Handles the choice of an option.
 * @param {object} context - Runner context.
 * @param {object} taskState - Current task state.
 * @param {*} option - Chosen option.
 * @param {HTMLElement} optionElement - Chosen option element.
 */
async function choose(context, taskState, option, optionElement) {
  if (taskState.answered) return;
  taskState.answered = true;
  const { config, session, layout } = context;
  const isCorrect = config.isCorrect(taskState.task, option);
  const result = session.record(config.historyKey(taskState.task), isCorrect ? 'correct' : 'wrong');
  layout.scoreBoard.update(session.roundScore(), session.streak());
  layout.companion.react(isCorrect ? 'correct' : 'wrong');
  if (isCorrect) {
    showCorrectChoice(optionElement, layout, result);
  } else {
    showWrongChoice(config, taskState, optionElement);
  }
  await Promise.all([
    config.afterAnswer ? config.afterAnswer(taskState.task, taskState.prompt) : null,
    wait(isCorrect ? CORRECT_DELAY_MS : SHOW_CORRECT_MS)
  ]);
  advance(context, taskState);
}

/**
 * Plays the feedback of a correct choice.
 * @param {HTMLElement} optionElement - Chosen option.
 * @param {object} layout - Level layout.
 * @param {{points: number, streak: number}} result - Recorded result.
 */
function showCorrectChoice(optionElement, layout, result) {
  optionElement.classList.add('choice-task__option--correct');
  playSound('correct');
  bounce(optionElement);
  burstStars(optionElement);
  flyPoints(optionElement, layout.scoreBoard.scoreElement, result.points);
}

/**
 * Plays the feedback of a wrong choice and highlights the correct option.
 * @param {object} config - Runner configuration.
 * @param {object} taskState - Current task state.
 * @param {HTMLElement} optionElement - Chosen option.
 */
function showWrongChoice(config, taskState, optionElement) {
  playSound('wrong');
  optionElement.classList.add('choice-task__option--wrong');
  wiggle(optionElement);
  const correct = taskState.optionElements.find(({ option }) => config.isCorrect(taskState.task, option));
  if (correct) correct.element.classList.add('choice-task__option--correct');
}
