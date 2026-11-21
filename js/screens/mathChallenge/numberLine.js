import { el, button, wait } from '../../components/dom.js';
import { bounce, wiggle, burstStars, flyPoints } from '../../components/effects.js';
import { createDino } from '../../components/dino.js';
import { hopPath, numberLineTasks, numberAt } from '../../logic/math/numberLine.js';
import { mathHistoryKey, solutionSpeech } from '../../logic/math/task.js';
import { mathBasePoints } from '../../logic/math/mathLevelGoals.js';
import { ROUND_SIZE } from '../../logic/math/taskSelection.js';
import { createRoundSession } from '../../logic/roundSession.js';
import { playSound } from '../../audio/soundPlayer.js';
import { store } from '../../state/store.js';
import { activeJourney, activeJourneyDef } from '../../state/journeyState.js';
import { createLevelLayout } from '../../game/levelLayout.js';
import { createTaskSpeakerButton, readAloudAfterWrong } from '../../game/readAloud.js';
import { halfRuleResult } from './variantResult.js';

/** Left and right end of the axis in view box units (view box width 1000). */
const AXIS = { left: 40, right: 960, y: 100 };

/** Duration of one hop. */
const HOP_MS = 550;

/**
 * Returns the x position of a number on the axis.
 * @param {number} value - Number.
 * @param {number} max - Largest number of the line.
 * @returns {number} X in view box units.
 */
function xOf(value, max) {
  return AXIS.left + (value / max) * (AXIS.right - AXIS.left);
}

/**
 * Returns the marks and labels of the line: every number up to 20, labels every ten up to 100.
 * @param {number} max - Largest number.
 * @returns {string} SVG markup.
 */
function marksMarkup(max) {
  const labelStep = max > 20 ? 10 : 1;
  return Array.from({ length: max + 1 }, (_, value) => {
    const x = xOf(value, max);
    const isTen = value % 10 === 0;
    const mark = `<path class="number-line__mark${isTen ? ' number-line__mark--ten' : ''}" d="M${x} ${AXIS.y - (isTen ? 16 : 9)} V${AXIS.y + (isTen ? 16 : 9)}"/>`;
    const label = value % labelStep === 0 ? `<text class="number-line__label" x="${x}" y="${AXIS.y + 42}">${value}</text>` : '';
    return mark + label;
  }).join('');
}

/**
 * Creates the number line with axis, arcs layer, selection marker, and the hopping dino.
 * @param {object} context - Variant context.
 * @returns {HTMLElement} Line element.
 */
function lineElement(context) {
  const { max } = context;
  const svg = `<svg viewBox="0 0 1000 160" class="number-line__svg"><path class="number-line__axis" d="M${AXIS.left - 20} ${AXIS.y} H${AXIS.right + 20}"/>`
    + `${marksMarkup(max)}<g class="number-line__arcs"></g><g class="number-line__selection" visibility="hidden"><circle r="16" cy="${AXIS.y}"/><text y="${AXIS.y - 26}"></text></g></svg>`;
  const state = store.getState();
  const journey = activeJourney(state);
  context.dino = el('div', { className: 'number-line__dino' }, [createDino(activeJourneyDef(state).species, journey.dinoStage, journey.worn)]);
  const line = el('div', { className: 'number-line', html: svg }, []);
  line.append(context.dino);
  line.addEventListener('pointerdown', (event) => select(context, event));
  return line;
}

/**
 * Moves the dino to a number.
 * @param {object} context - Variant context.
 * @param {number} value - Number.
 */
function placeDino(context, value) {
  context.dino.style.left = `${xOf(value, context.max) / 10}%`;
}

/**
 * Selects the number nearest to the tap position and shows it in the selection bubble.
 * @param {object} context - Variant context.
 * @param {PointerEvent} event - Tap event.
 */
function select(context, event) {
  if (context.locked) return;
  const svg = context.line.querySelector('svg');
  const box = svg.getBoundingClientRect();
  const x = ((event.clientX - box.left) / box.width) * 1000;
  const value = numberAt((x - AXIS.left) / (AXIS.right - AXIS.left), context.max);
  context.selected = value;
  const selection = svg.querySelector('.number-line__selection');
  selection.setAttribute('visibility', 'visible');
  selection.setAttribute('transform', `translate(${xOf(value, context.max)} 0)`);
  selection.querySelector('text').textContent = String(value);
  context.okButton.disabled = false;
  playSound('click');
}

/**
 * Lets the dino hop along the path of the task and draws an arc for every hop.
 * @param {object} context - Variant context.
 * @param {Array<number>} path - Positions including the start.
 */
async function hop(context, path) {
  const arcs = context.line.querySelector('.number-line__arcs');
  for (let i = 1; i < path.length; i += 1) {
    const from = xOf(path[i - 1], context.max);
    const to = xOf(path[i], context.max);
    arcs.insertAdjacentHTML('beforeend', `<path class="number-line__arc" d="M${from} ${AXIS.y - 6} Q${(from + to) / 2} ${AXIS.y - 70} ${to} ${AXIS.y - 6}"/>`);
    context.dino.classList.add('number-line__dino--hopping');
    placeDino(context, path[i]);
    await wait(HOP_MS);
    context.dino.classList.remove('number-line__dino--hopping');
  }
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
  Object.assign(context, { task, attempt: 1, selected: null, locked: false });
  context.text.textContent = task.text;
  context.line.querySelector('.number-line__arcs').innerHTML = '';
  context.line.querySelector('.number-line__selection').setAttribute('visibility', 'hidden');
  context.okButton.disabled = true;
  placeDino(context, hopPath(task)[0]);
}

/**
 * Checks the selected number.
 * @param {object} context - Variant context.
 */
async function confirm(context) {
  if (context.locked || context.selected === null) return;
  const isCorrect = context.selected === context.task.answer;
  if (!isCorrect && context.attempt === 1) {
    context.attempt = 2;
    playSound('wrong');
    wiggle(context.line);
    context.layout.companion.react('wrong');
    return;
  }
  context.locked = true;
  await hop(context, hopPath(context.task));
  if (isCorrect) reward(context);
  else await fail(context);
  await wait(900);
  context.index += 1;
  showTask(context);
}

/**
 * Records a correct answer with full or half points.
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
  bounce(context.dino);
  burstStars(context.dino);
  flyPoints(context.dino, context.layout.scoreBoard.scoreElement, result.points);
  updateBoard(context, 'correct');
}

/**
 * Records a failed task; the dino already hopped to the correct number.
 * @param {object} context - Variant context.
 */
async function fail(context) {
  context.session.record(mathHistoryKey(context.task), 'wrong');
  context.text.textContent = context.task.text.replace('?', String(context.task.answer));
  playSound('wrong');
  updateBoard(context, 'wrong');
  await readAloudAfterWrong(solutionSpeech(context.task));
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

/** Level 7 variant: the dino hops along a number line to the solution. */
export const numberLineVariant = {
  id: 'numberLine',
  title: 'Zahlenstrahl',
  picture: 'numberLine',

  /**
   * Runs one number line round.
   * @param {HTMLElement} container - Screen container.
   * @param {{challenge: object}} variantContext - Variant context.
   * @param {Function} finish - Called with the round result.
   * @returns {Function} Cleanup function.
   */
  run(container, { challenge }, finish) {
    const layout = createLevelLayout(container, { title: 'Zahlenstrahl', recordLevel: 7, goalLevel: 7 });
    const context = { layout, finish, max: challenge.lineMax, tasks: numberLineTasks(challenge, ROUND_SIZE), index: 0, solved: 0 };
    context.session = createRoundSession({ level: 7, updateState: store.updateState });
    context.text = el('p', { className: 'math-task__text' });
    context.line = lineElement(context);
    context.okButton = button({ className: 'big-button number-line__ok', iconName: 'check', label: 'Fertig', onClick: () => confirm(context) });
    const speaker = createTaskSpeakerButton(() => (context.task ? context.task.speech : null));
    layout.stage.replaceChildren(el('div', { className: 'math-task card' }, [
      el('div', { className: 'math-task__header' }, [context.text, speaker]), context.line, context.okButton
    ]));
    showTask(context);
    return () => { context.locked = true; };
  }
};
