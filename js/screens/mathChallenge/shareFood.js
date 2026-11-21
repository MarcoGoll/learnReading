import { el, wait } from '../../components/dom.js';
import { bounce, wiggle, burstStars, flyPoints } from '../../components/effects.js';
import { food, plateDino, svgWrap } from '../../components/mathAidShapes.js';
import { shareTasks, createSharing, givePiece, takePiece, isShared, isFair } from '../../logic/math/shareFood.js';
import { mathHistoryKey } from '../../logic/math/task.js';
import { mathBasePoints } from '../../logic/math/mathLevelGoals.js';
import { createRoundSession } from '../../logic/roundSession.js';
import { playSound } from '../../audio/soundPlayer.js';
import { store } from '../../state/store.js';
import { createLevelLayout } from '../../game/levelLayout.js';
import { createTaskSpeakerButton, readAloudAfterWrong } from '../../game/readAloud.js';
import { halfRuleResult } from './variantResult.js';

/** Pause after a finished task. */
const TASK_DONE_MS = 1600;

/**
 * Returns the instruction text of a task.
 * @param {object} task - Division task.
 * @returns {string} Text.
 */
function instruction(task) {
  return `Verteile ${task.operands[0]} Beeren gerecht an ${task.operands[1]} Dinos!`;
}

/**
 * Renders the heap and the plates of the current sharing state.
 * @param {object} context - Variant context.
 */
function renderBoard(context) {
  const { sharing } = context;
  const heapPieces = Array.from({ length: sharing.heap }, (_, index) => food(14 + (index % 10) * 16, 14 + Math.floor(index / 10) * 16)).join('');
  context.heap.innerHTML = sharing.heap > 0 ? svgWrap(176, 12 + Math.ceil(sharing.heap / 10) * 16, heapPieces) : '';
  context.plates.replaceChildren(...sharing.plates.map((count, plate) => plateRow(context, count, plate)));
}

/**
 * Creates one dino row: tapping the dino gives a piece, tapping the plate takes one back.
 * @param {object} context - Variant context.
 * @param {number} count - Pieces on the plate.
 * @param {number} plate - Dino index.
 * @returns {HTMLElement} Row.
 */
function plateRow(context, count, plate) {
  const pieces = Array.from({ length: count }, (_, index) => food(10 + index * 15, 14)).join('');
  const dino = el('button', { className: 'share-food__dino', attrs: { type: 'button', 'aria-label': `Dino ${plate + 1} bekommt eine Beere` }, html: svgWrap(32, 28, plateDino(2, 14)) });
  const plateButton = el('button', { className: 'share-food__plate', attrs: { type: 'button', 'aria-label': `Beere von Dino ${plate + 1} zurücklegen` }, html: svgWrap(Math.max(30, 16 + count * 15), 28, pieces) });
  dino.addEventListener('click', () => onGive(context, plate));
  plateButton.addEventListener('click', () => onTake(context, plate));
  return el('div', { className: 'share-food__row' }, [dino, plateButton]);
}

/**
 * Gives a piece to a dino and checks the sharing once the heap is empty.
 * @param {object} context - Variant context.
 * @param {number} plate - Dino index.
 */
async function onGive(context, plate) {
  if (context.locked || !givePiece(context.sharing, plate)) return;
  playSound('click');
  renderBoard(context);
  if (isShared(context.sharing)) await check(context);
}

/**
 * Takes a piece back from a plate.
 * @param {object} context - Variant context.
 * @param {number} plate - Dino index.
 */
function onTake(context, plate) {
  if (context.locked || !takePiece(context.sharing, plate)) return;
  renderBoard(context);
}

/**
 * Checks the finished sharing: fair solves the task, unfair allows a second attempt, then shows the solution.
 * @param {object} context - Variant context.
 */
async function check(context) {
  if (isFair(context.sharing)) {
    reward(context);
  } else if (context.attempt === 1) {
    context.attempt = 2;
    playSound('wrong');
    wiggle(context.plates);
    context.layout.companion.react('wrong');
    await wait(900);
    context.sharing = createSharing(context.task);
    renderBoard(context);
    return;
  } else {
    await fail(context);
  }
  context.locked = true;
  await wait(TASK_DONE_MS);
  context.index += 1;
  showTask(context);
}

/**
 * Records a fair sharing with full or half points.
 * @param {object} context - Variant context.
 */
function reward(context) {
  const base = mathBasePoints(7);
  const key = mathHistoryKey(context.task);
  const result = context.attempt === 1
    ? context.session.record(key, 'correct', { base })
    : context.session.record(key, 'wrong', { consolationPoints: base / 2 });
  context.solved += 1;
  context.text.textContent = context.task.text.replace('?', String(context.task.answer));
  playSound('correct');
  bounce(context.plates);
  burstStars(context.plates);
  flyPoints(context.plates, context.layout.scoreBoard.scoreElement, result.points);
  updateBoard(context, 'correct');
}

/**
 * Records a failed task and shows the fair sharing.
 * @param {object} context - Variant context.
 */
async function fail(context) {
  context.session.record(mathHistoryKey(context.task), 'wrong');
  context.sharing = { heap: 0, plates: context.sharing.plates.map(() => context.task.answer) };
  renderBoard(context);
  context.text.textContent = context.task.text.replace('?', String(context.task.answer));
  playSound('wrong');
  updateBoard(context, 'wrong');
  await readAloudAfterWrong(`Jeder Dino bekommt ${context.task.answer} Beeren.`);
}

/**
 * Updates score board and companion.
 * @param {object} context - Variant context.
 * @param {string} reaction - "correct" or "wrong".
 */
function updateBoard(context, reaction) {
  context.layout.scoreBoard.update(context.session.roundScore(), context.session.streak());
  context.layout.companion.react(reaction);
}

/**
 * Shows the next task or finishes the round.
 * @param {object} context - Variant context.
 */
function showTask(context) {
  const task = context.tasks[context.index];
  if (!task) {
    context.finish(halfRuleResult(context.session, context.solved, context.tasks.length));
    return;
  }
  Object.assign(context, { task, attempt: 1, locked: false, sharing: createSharing(task) });
  context.text.textContent = instruction(task);
  renderBoard(context);
}

/** Level 7 variant of the divided dino: share food fairly among dinos by tapping. */
export const shareFoodVariant = {
  id: 'shareFood',
  title: 'Futter verteilen',
  picture: 'shareFood',

  /**
   * Runs one round of sharing tasks.
   * @param {HTMLElement} container - Screen container.
   * @param {object} variantContext - Variant context (unused: the tasks have their own small range).
   * @param {Function} finish - Called with the round result.
   * @returns {Function} Cleanup function.
   */
  run(container, variantContext, finish) {
    const layout = createLevelLayout(container, { title: 'Futter verteilen', recordLevel: 7, goalLevel: 7 });
    const context = { layout, finish, tasks: shareTasks(), index: 0, solved: 0 };
    context.session = createRoundSession({ level: 7, updateState: store.updateState });
    context.text = el('p', { className: 'math-task__text share-food__text' });
    context.heap = el('div', { className: 'share-food__heap' });
    context.plates = el('div', { className: 'share-food__plates' });
    const speaker = createTaskSpeakerButton(() => (context.task ? instruction(context.task) : null));
    layout.stage.replaceChildren(el('div', { className: 'math-task card share-food' }, [
      el('div', { className: 'math-task__header' }, [context.text, speaker]), context.heap, context.plates
    ]));
    showTask(context);
    return () => { context.locked = true; };
  }
};
