import { mixedTasks } from './taskGenerator.js';

/** Operations used on the number line (division has no natural number line picture). */
export const LINE_OPERATIONS = ['add', 'subtract', 'multiply'];

/**
 * Returns the hops of an addition or subtraction: up to the next ten first when the ten is crossed,
 * then the rest; small steps are made as one hop.
 * @param {number} start - Start number.
 * @param {number} change - Signed change.
 * @returns {Array<number>} Positions after each hop (without the start).
 */
function linearHops(start, change) {
  const target = start + change;
  const ten = change > 0 ? Math.ceil((start + 1) / 10) * 10 : Math.floor((start - 1) / 10) * 10;
  const crosses = change > 0 ? ten < target && ten > start : ten > target && ten < start;
  if (!crosses || start % 10 === 0) {
    return Math.abs(change) >= 10 && change % 10 !== 0 ? tensThenUnits(start, change) : [target];
  }
  return [ten, target];
}

/**
 * Splits a large change into a tens hop and a units hop (34 + 25 -> 54, 59).
 * @param {number} start - Start number.
 * @param {number} change - Signed change with |change| >= 10.
 * @returns {Array<number>} Positions.
 */
function tensThenUnits(start, change) {
  const tens = Math.trunc(change / 10) * 10;
  return [start + tens, start + change];
}

/**
 * Returns the positions the dino visits for a task, starting point included.
 * Plus/minus: from the first operand ("to the ten first" when crossing). Times: jumps of the second
 * factor starting at 0 (3 · 4 -> 0, 4, 8, 12).
 * @param {object} task - Task (add, subtract, or multiply).
 * @returns {Array<number>} Positions.
 */
export function hopPath(task) {
  const [first, second] = task.operands;
  if (task.operation === 'multiply') {
    return Array.from({ length: first + 1 }, (_, index) => index * second);
  }
  const change = task.operation === 'add' ? second : -second;
  return [first, ...linearHops(first, change)];
}

/**
 * Creates the tasks of a number line round: plus, minus, and times within the line range.
 * @param {object} challenge - Challenge settings of the journey (max, tables, lineMax).
 * @param {number} count - Number of tasks.
 * @param {Function} [randomFn=Math.random] - Random source.
 * @returns {Array<object>} Tasks.
 */
export function numberLineTasks(challenge, count, randomFn = Math.random) {
  const mix = { ...challenge, operations: LINE_OPERATIONS, max: challenge.lineMax };
  return mixedTasks(mix, count * 3, randomFn)
    .filter((task) => task.answer <= challenge.lineMax && (task.operation !== 'multiply' || task.operands[0] <= 10))
    .slice(0, count);
}

/**
 * Returns the nearest number on the line for a relative tap position.
 * @param {number} ratio - Tap position from 0 (left) to 1 (right).
 * @param {number} max - Largest number on the line.
 * @returns {number} Number.
 */
export function numberAt(ratio, max) {
  return Math.min(max, Math.max(0, Math.round(ratio * max)));
}
