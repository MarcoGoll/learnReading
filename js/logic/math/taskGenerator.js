import { createArithmeticTask, createNumberTask, crossesTen, toMissingNumberTask } from './task.js';
import { shuffle } from '../random.js';

/** Maximum number of tasks a config returns (large ranges are sampled evenly). */
export const MAX_TASKS = 400;

/**
 * Returns the integers from min to max.
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {Array<number>} Numbers.
 */
export function range(min, max) {
  return Array.from({ length: Math.max(0, max - min + 1) }, (_, index) => min + index);
}

/**
 * Picks at most `limit` items evenly spread over the list, so the sample is stable between calls.
 * @param {Array} items - Items.
 * @param {number} [limit=MAX_TASKS] - Maximum size.
 * @returns {Array} Sample.
 */
export function sampleEvenly(items, limit = MAX_TASKS) {
  if (items.length <= limit) return items;
  const step = items.length / limit;
  return range(0, limit - 1).map((index) => items[Math.floor(index * step)]);
}

/**
 * Checks the crossing rule of a config: "any", "none" (no crossing), or "only".
 * @param {object} task - Task.
 * @param {string} [crossing='any'] - Rule.
 * @returns {boolean} True if allowed.
 */
function matchesCrossing(task, crossing = 'any') {
  if (crossing === 'any') return true;
  return crossing === 'only' ? crossesTen(task) : !crossesTen(task);
}

/**
 * Checks the operand rules of an addition or subtraction config.
 * @param {object} task - Task.
 * @param {object} config - excludeUpTo (all numbers small), twoDigit (both operands >= 10), crossing;
 *   ranges above 10 never use 0 as an operand.
 * @returns {boolean} True if allowed.
 */
function matchesRules(task, config) {
  const numbers = [...task.operands, task.answer];
  if (config.max > 10 && task.operands.includes(0)) return false;
  if (config.excludeUpTo && numbers.every((number) => number <= config.excludeUpTo)) return false;
  if (config.twoDigit && task.operands.some((operand) => operand < 10)) return false;
  return matchesCrossing(task, config.crossing);
}

/**
 * Returns all additions a + b <= max of a config.
 * @param {object} config - max and rules.
 * @returns {Array<object>} Tasks.
 */
function additions(config) {
  return range(0, config.max).flatMap((first) => range(0, config.max - first)
    .map((second) => createArithmeticTask('add', first, second)))
    .filter((task) => matchesRules(task, config));
}

/**
 * Returns all subtractions a - b >= 0 with a <= max of a config.
 * @param {object} config - max and rules.
 * @returns {Array<object>} Tasks.
 */
function subtractions(config) {
  return range(0, config.max).flatMap((first) => range(0, first)
    .map((second) => createArithmeticTask('subtract', first, second)))
    .filter((task) => matchesRules(task, config));
}

/**
 * Returns all factor pairs 1-factorMax where at least one factor is one of the tables.
 * @param {Array<number>} tables - Times tables.
 * @param {number} [factorMax=10] - Largest factor.
 * @returns {Array<Array<number>>} Pairs [first, second].
 */
export function tablePairs(tables, factorMax = 10) {
  return range(1, factorMax).flatMap((first) => range(1, factorMax).map((second) => [first, second]))
    .filter(([first, second]) => tables.includes(first) || tables.includes(second));
}

/**
 * Returns the multiplications of the configured tables (both orders).
 * @param {object} config - tables and factorMax.
 * @returns {Array<object>} Tasks.
 */
function multiplications(config) {
  return tablePairs(config.tables, config.factorMax).map(([first, second]) => createArithmeticTask('multiply', first, second));
}

/**
 * Returns the divisions that invert the multiplications of the tables (always without remainder).
 * @param {object} config - tables and factorMax.
 * @returns {Array<object>} Tasks.
 */
function divisions(config) {
  return tablePairs(config.tables, config.factorMax).map(([first, second]) => createArithmeticTask('divide', first * second, second));
}

/**
 * Returns the number tasks of level 1.
 * @param {object} config - min, max, and types (count, pickQuantity, next, previous, nextTen, half).
 * @returns {Array<object>} Tasks.
 */
function numberTasks(config) {
  return config.types.flatMap((type) => range(config.min || 0, config.max)
    .filter((number) => isValidNumberTask(type, number, config))
    .map((number) => createNumberTask(type, number)));
}

/**
 * Checks whether a number task makes sense (e.g. no "before 0", only even halves).
 * @param {string} type - Task type.
 * @param {number} number - Number.
 * @param {object} config - Config with max.
 * @returns {boolean} True if valid.
 */
function isValidNumberTask(type, number, config) {
  if (type === 'previous') return number > 0;
  if (type === 'next') return number < config.max;
  if (type === 'nextTen') return number % 10 !== 0 && (Math.floor(number / 10) + 1) * 10 <= config.max;
  if (type === 'half') return number > 0 && number % 2 === 0;
  return true;
}

/**
 * Adds missing-number versions to every third task (used for mixed review levels).
 * @param {Array<object>} tasks - Arithmetic tasks.
 * @returns {Array<object>} Tasks with some missing-number tasks.
 */
function withMissingNumbers(tasks) {
  return tasks.map((task, index) => (index % 3 === 2 ? toMissingNumberTask(task, index % 2) : task));
}

/** Task builders by config kind. */
const BUILDERS = {
  numbers: numberTasks,
  add: additions,
  subtract: subtractions,
  mixedAddSubtract: (config) => [...additions(config), ...subtractions(config)],
  multiply: multiplications,
  divide: divisions,
  mixedMultiplyDivide: (config) => [...multiplications(config), ...divisions(config)]
};

/**
 * Returns the tasks of a level config, sampled evenly when there are more than MAX_TASKS.
 * @param {object} config - Level config with `kind` and its options.
 * @returns {Array<object>} Tasks.
 */
export function allTasks(config) {
  const tasks = sampleEvenly(BUILDERS[config.kind](config));
  return config.missingNumbers ? withMissingNumbers(tasks) : tasks;
}

/**
 * Returns a mix of tasks of several operations with an even share per operation (level 7).
 * @param {object} mixConfig - operations, max, tables.
 * @param {number} count - Number of tasks.
 * @param {Function} [randomFn=Math.random] - Random source.
 * @returns {Array<object>} Tasks.
 */
export function mixedTasks(mixConfig, count, randomFn = Math.random) {
  const pools = mixConfig.operations.map((operation) => shuffle(operationPool(operation, mixConfig), randomFn));
  const result = [];
  for (let i = 0; result.length < count && i < count * pools.length; i += 1) {
    const pool = pools[i % pools.length];
    const task = pool[Math.floor(i / pools.length)];
    if (task) result.push(task);
  }
  return result;
}

/**
 * Returns the task pool of one operation for the level 7 mix.
 * @param {string} operation - add, subtract, multiply, or divide.
 * @param {object} mixConfig - max and tables.
 * @returns {Array<object>} Tasks.
 */
function operationPool(operation, mixConfig) {
  const isTable = operation === 'multiply' || operation === 'divide';
  const config = isTable ? { kind: operation, tables: mixConfig.tables } : { kind: operation, max: mixConfig.max, excludeUpTo: mixConfig.excludeUpTo };
  return allTasks(config).filter((task) => task.operands.every((operand) => operand > 0));
}
