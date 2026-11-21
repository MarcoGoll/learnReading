import { shuffle } from '../random.js';
import { crossesTen, mathHistoryKey } from './task.js';

/** Number of tasks of a math round. */
export const ROUND_SIZE = 10;

/**
 * Builds the per-round limits of a level config (e.g. at most 2 tasks with 0, about half crossing ten).
 * @param {object} config - Level config.
 * @param {number} count - Round size.
 * @returns {Array<{matches: Function, max: number}>} Limits.
 */
export function roundLimits(config, count) {
  const limits = [];
  if (config.maxZeroTasksPerRound !== undefined) {
    limits.push({ matches: (task) => task.operands.includes(0), max: config.maxZeroTasksPerRound });
  }
  if (config.maxTrivialTasksPerRound !== undefined) {
    limits.push({ matches: (task) => task.operands[1] === 0 || task.operands[0] === task.operands[1], max: config.maxTrivialTasksPerRound });
  }
  if (config.crossingShare !== undefined) {
    const max = Math.ceil(count * config.crossingShare) + 1;
    limits.push({ matches: crossesTen, max }, { matches: (task) => !crossesTen(task), max: count - max + 2 });
  }
  if (config.kind === 'numbers' && config.types.length > 1) {
    config.types.forEach((type) => limits.push({ matches: (task) => task.operation === type, max: Math.ceil(count * 0.6) }));
  }
  return limits;
}

/**
 * Orders the tasks by priority: not mastered first (often wrong ones before the others), then mastered.
 * @param {Array<object>} tasks - Tasks of the level.
 * @param {Array<string>} masteredIds - Ids already mastered in this level.
 * @param {object} history - History by key.
 * @param {Function} randomFn - Random source.
 * @returns {Array<object>} Ordered tasks.
 */
function byPriority(tasks, masteredIds, history, randomFn) {
  const mastered = new Set(masteredIds);
  const wrongCount = (task) => (history[mathHistoryKey(task)] || { wrong: 0 }).wrong;
  const open = shuffle(tasks.filter((task) => !mastered.has(task.id)), randomFn);
  const oftenWrong = open.filter((task) => wrongCount(task) > 0).sort((first, second) => wrongCount(second) - wrongCount(first));
  const fresh = open.filter((task) => wrongCount(task) === 0);
  return [...oftenWrong, ...fresh, ...shuffle(tasks.filter((task) => mastered.has(task.id)), randomFn)];
}

/**
 * Checks whether a task still fits into the round limits.
 * @param {object} task - Task.
 * @param {Array<object>} picked - Already picked tasks.
 * @param {Array<object>} limits - Limits.
 * @returns {boolean} True if it fits.
 */
function fitsLimits(task, picked, limits) {
  return limits.every((limit) => !limit.matches(task) || picked.filter(limit.matches).length < limit.max);
}

/**
 * Selects the tasks of a round: prefers open and often wrong tasks, respects the round limits,
 * and fills up without limits when too few tasks fit. No task appears twice.
 * @param {Array<object>} tasks - Tasks of the level.
 * @param {object} options - Selection options.
 * @param {Array<string>} [options.masteredIds=[]] - Mastered ids of the level.
 * @param {object} [options.history={}] - History.
 * @param {object} [options.config={}] - Level config for the round limits.
 * @param {number} [options.count=ROUND_SIZE] - Round size.
 * @param {Function} [options.randomFn=Math.random] - Random source.
 * @returns {Array<object>} Round tasks in shuffled order.
 */
export function selectRoundTasks(tasks, { masteredIds = [], history = {}, config = {}, count = ROUND_SIZE, randomFn = Math.random } = {}) {
  const ordered = byPriority(tasks, masteredIds, history, randomFn);
  const limits = roundLimits(config, count);
  const picked = [];
  ordered.forEach((task) => {
    if (picked.length < count && fitsLimits(task, picked, limits)) picked.push(task);
  });
  ordered.forEach((task) => {
    if (picked.length < count && !picked.includes(task)) picked.push(task);
  });
  return shuffle(picked, randomFn);
}

/**
 * Returns answer options for a card task: the answer plus close distractors within the range.
 * @param {number} answer - Correct answer.
 * @param {object} [options] - Options.
 * @param {number} [options.min=0] - Smallest allowed option.
 * @param {number} [options.max=10] - Largest allowed option.
 * @param {number} [options.count=4] - Number of options.
 * @param {Function} [options.randomFn=Math.random] - Random source.
 * @returns {Array<number>} Shuffled options containing the answer once.
 */
export function answerOptions(answer, { min = 0, max = 10, count = 4, randomFn = Math.random } = {}) {
  const offsets = max > 20 ? [1, -10, 10, -1, 2, -2, 11, -11, 20, -20] : [1, -1, 2, -2, 3, -3];
  const candidates = offsets.map((offset) => answer + offset)
    .filter((value, index, list) => value >= min && value <= max && value !== answer && list.indexOf(value) === index);
  return shuffle([answer, ...candidates.slice(0, count - 1)], randomFn);
}
