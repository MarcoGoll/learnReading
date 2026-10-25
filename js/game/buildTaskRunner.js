import { el, button, wait } from '../components/dom.js';
import { createDragBoard } from '../components/dragBoard.js';
import { bounce, wiggle, burstStars, flyPoints } from '../components/effects.js';
import { createRoundSession } from '../logic/roundSession.js';
import { playSound } from '../audio/soundPlayer.js';
import { speak } from '../audio/speech.js';
import { store } from '../state/store.js';
import { createLevelLayout } from './levelLayout.js';
import { createSpokenTarget } from './spokenTarget.js';

/** Pause after a solved task. */
const SOLVED_DELAY_MS = 1800;

/**
 * Runs a series of drag-and-drop build tasks (level 4 and SentenceBuilderVariant).
 * @param {HTMLElement} container - Screen container.
 * @param {object} config - Configuration.
 * @param {string} config.title - Screen title.
 * @param {number} config.level - Level for the record and base points.
 * @param {number} config.base - Base points per task.
 * @param {Array<object>} config.tasks - Tasks with slots and tiles.
 * @param {Function} config.targetFor - Returns { text, picture, revealLabel } of a task.
 * @param {Function} config.renderTile - Returns tile content for (tile, slotIndex).
 * @param {Function} config.check - Checks (task, placed tile ids).
 * @param {Function} config.solutionFor - Returns an element showing the solution.
 * @param {Function} config.historyKey - Returns the history key of a task.
 * @param {Function} [config.suffixFor] - Returns a fixed text after the slots.
 * @param {number} [config.goalLevel] - Level whose goal banner is shown.
 * @param {Function} [config.goalIdOf] - Returns the pool id of a solved task for the goal progress.
 * @param {Function} config.onFinished - Called with (results, session).
 * @returns {Function} Cleanup function.
 */
export function runBuildTasks(container, config) {
  const layout = createLevelLayout(container, { title: config.title, recordLevel: config.level, goalLevel: config.goalLevel });
  const session = createRoundSession({ level: config.level, updateState: store.updateState });
  const context = { config, layout, session, results: [], index: 0, isActive: true };
  showTask(context);
  return () => { context.isActive = false; };
}

/**
 * Shows the task at the current index or finishes the series.
 * @param {object} context - Runner context.
 */
function showTask(context) {
  if (!context.isActive) return;
  const { config, layout } = context;
  const task = config.tasks[context.index];
  if (!task) {
    context.isActive = false;
    config.onFinished(context.results, context.session);
    return;
  }
  const taskState = { task, attempt: 1, done: false };
  const target = createSpokenTarget(config.targetFor(task));
  taskState.board = createDragBoard({
    slotCount: task.slots, tiles: task.tiles, renderTile: config.renderTile,
    suffix: config.suffixFor ? config.suffixFor(task) : '',
    onComplete: (placed) => handleComplete(context, taskState, placed)
  });
  taskState.solution = el('div', { className: 'drag-task__solution' });
  layout.stage.replaceChildren(el('div', { className: 'drag-task card' }, [target.element, taskState.board.element, taskState.solution]));
  layout.footer.replaceChildren(button({ className: 'small-button', iconName: 'skip_next', label: 'Weiter', onClick: () => nextTask(context, taskState) }));
  target.speakNow();
}

/**
 * Moves on to the next task (also used by the adult skip button).
 * @param {object} context - Runner context.
 * @param {object} taskState - Current task state.
 */
function nextTask(context, taskState) {
  if (taskState.moved) return;
  taskState.moved = true;
  context.index += 1;
  showTask(context);
}

/**
 * Handles a filled board: checks the answer and gives feedback.
 * @param {object} context - Runner context.
 * @param {object} taskState - Current task state.
 * @param {Array<string>} placed - Tile ids in slot order.
 */
async function handleComplete(context, taskState, placed) {
  const { config, session, layout } = context;
  const isCorrect = config.check(taskState.task, placed);
  taskState.board.setLocked(true);
  if (!isCorrect && taskState.attempt === 1) {
    taskState.attempt = 2;
    await showWrongAttempt(layout, taskState);
    return;
  }
  const result = session.record(config.historyKey(taskState.task), isCorrect ? 'correct' : 'wrong', { attempt: taskState.attempt, base: config.base });
  context.results.push({ task: taskState.task, success: isCorrect });
  if (config.goalIdOf) {
    layout.showGoal(context.results.filter((entry) => entry.success).map((entry) => config.goalIdOf(entry.task)));
  }
  layout.scoreBoard.update(session.roundScore(), session.streak());
  layout.companion.react(isCorrect ? 'correct' : 'wrong');
  await showFinalFeedback(context, taskState, isCorrect, result);
  nextTask(context, taskState);
}

/**
 * Shows the feedback of a first wrong attempt and resets the tiles.
 * @param {object} layout - Level layout.
 * @param {object} taskState - Current task state.
 * @returns {Promise<void>} Resolves when the board is ready again.
 */
async function showWrongAttempt(layout, taskState) {
  playSound('wrong');
  layout.companion.react('wrong');
  wiggle(taskState.board.slotsElement);
  await wait(800);
  taskState.board.reset();
  taskState.board.setLocked(false);
}

/**
 * Shows the final feedback of a task: celebration or the revealed solution.
 * @param {object} context - Runner context.
 * @param {object} taskState - Current task state.
 * @param {boolean} isCorrect - Whether the task was solved.
 * @param {{points: number, streak: number}} result - Recorded result.
 * @returns {Promise<void>} Resolves after the pause.
 */
async function showFinalFeedback(context, taskState, isCorrect, result) {
  const { config, layout } = context;
  taskState.solution.replaceChildren(config.solutionFor(taskState.task));
  if (isCorrect) {
    playSound('correct');
    bounce(taskState.board.slotsElement);
    burstStars(taskState.board.slotsElement);
    flyPoints(taskState.board.slotsElement, layout.scoreBoard.scoreElement, result.points);
  } else {
    playSound('wrong');
    wiggle(taskState.solution);
  }
  await Promise.all([speak(config.targetFor(taskState.task).text), wait(SOLVED_DELAY_MS)]);
}
