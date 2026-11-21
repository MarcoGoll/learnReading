import { shuffle } from '../random.js';
import { createArithmeticTask } from './task.js';
import { range } from './taskGenerator.js';

/** Tasks per "Futter verteilen" round. */
export const SHARE_TASKS_PER_ROUND = 6;

/** Largest number of food pieces. */
export const MAX_FOOD = 30;

/**
 * Creates the division tasks of a round: 2-5 dinos, 1-6 pieces each, at most 30 pieces.
 * @param {Function} [randomFn=Math.random] - Random source.
 * @param {number} [count=SHARE_TASKS_PER_ROUND] - Number of tasks.
 * @returns {Array<object>} Division tasks (dividend = food, divisor = dinos).
 */
export function shareTasks(randomFn = Math.random, count = SHARE_TASKS_PER_ROUND) {
  const pairs = range(2, 5).flatMap((plates) => range(1, 6).map((share) => [plates, share]))
    .filter(([plates, share]) => plates * share <= MAX_FOOD);
  return shuffle(pairs, randomFn).slice(0, count).map(([plates, share]) => createArithmeticTask('divide', plates * share, plates));
}

/**
 * Creates the state of one sharing task: all food on the heap, empty plates.
 * @param {object} task - Division task.
 * @returns {{heap: number, plates: Array<number>}} Sharing state.
 */
export function createSharing(task) {
  return { heap: task.operands[0], plates: Array.from({ length: task.operands[1] }, () => 0) };
}

/**
 * Gives one piece from the heap to a dino.
 * @param {object} sharing - Sharing state (mutated).
 * @param {number} plate - Dino index.
 * @returns {boolean} True if a piece was given.
 */
export function givePiece(sharing, plate) {
  if (sharing.heap <= 0) return false;
  sharing.heap -= 1;
  sharing.plates[plate] += 1;
  return true;
}

/**
 * Takes one piece back from a dino's plate to the heap.
 * @param {object} sharing - Sharing state (mutated).
 * @param {number} plate - Dino index.
 * @returns {boolean} True if a piece was taken back.
 */
export function takePiece(sharing, plate) {
  if (sharing.plates[plate] <= 0) return false;
  sharing.plates[plate] -= 1;
  sharing.heap += 1;
  return true;
}

/**
 * Checks whether all food is shared.
 * @param {object} sharing - Sharing state.
 * @returns {boolean} True when the heap is empty.
 */
export function isShared(sharing) {
  return sharing.heap === 0;
}

/**
 * Checks whether every dino got the same amount.
 * @param {object} sharing - Sharing state.
 * @returns {boolean} True when fair.
 */
export function isFair(sharing) {
  return sharing.plates.every((count) => count === sharing.plates[0]);
}
