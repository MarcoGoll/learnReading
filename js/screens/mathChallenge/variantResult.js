/**
 * Builds the result object every math variant passes to the summary (half rule: at least half solved).
 * @param {object} session - Round session.
 * @param {number} solvedCount - Solved tasks (counted for passing).
 * @param {number} taskCount - All tasks of the round.
 * @param {boolean} [isPassedOverride] - Own passing rule of a variant (e.g. memory moves).
 * @returns {{isPassed: boolean, resultText: string, neededText: string, session: object}} Result.
 */
export function halfRuleResult(session, solvedCount, taskCount, isPassedOverride) {
  const needed = Math.ceil(taskCount / 2);
  const isPassed = isPassedOverride === undefined ? taskCount > 0 && solvedCount >= needed : isPassedOverride;
  return {
    isPassed,
    resultText: `${solvedCount} von ${taskCount} richtig`,
    neededText: `Nötig sind ${needed}.`,
    session
  };
}
