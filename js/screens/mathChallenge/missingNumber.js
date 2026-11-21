import { mixedTasks } from '../../logic/math/taskGenerator.js';
import { toMissingNumberTask } from '../../logic/math/task.js';
import { ROUND_SIZE } from '../../logic/math/taskSelection.js';
import { runMathTasks } from '../../game/mathRoundRunner.js';
import { halfRuleResult } from './variantResult.js';

/**
 * Creates the gap tasks of a round: mixed operations, random gap position.
 * @param {object} challenge - Challenge settings of the journey.
 * @param {Function} [randomFn=Math.random] - Random source.
 * @returns {Array<object>} Missing-number tasks.
 */
export function missingNumberTasks(challenge, randomFn = Math.random) {
  return mixedTasks(challenge, ROUND_SIZE, randomFn).map((task) => toMissingNumberTask(task, randomFn() < 0.5 ? 0 : 1));
}

/** Level 7 variant: tasks with a missing operand (3 + _ = 7). */
export const missingNumberVariant = {
  id: 'missingNumber',
  title: 'Zahlen-Lücke',
  picture: 'mathMissingNumber',

  /**
   * Runs one round of gap tasks.
   * @param {HTMLElement} container - Screen container.
   * @param {{challenge: object}} context - Variant context.
   * @param {Function} finish - Called with the round result.
   * @returns {Function} Cleanup function.
   */
  run(container, { challenge }, finish) {
    const tasks = missingNumberTasks(challenge);
    return runMathTasks(container, {
      title: 'Zahlen-Lücke',
      level: 7,
      tasks,
      display: { input: 'pad', aid: 'insects', aidMode: 'onRequest' },
      onFinished: (session, masteredIds, solvedCount) => finish(halfRuleResult(session, solvedCount, tasks.length))
    });
  }
};
