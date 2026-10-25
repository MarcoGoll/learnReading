/** Streak length from which points are doubled. */
export const STREAK_THRESHOLD = 3;

/**
 * Returns the base points per correct item of a level (10, 20, ..., 50).
 * @param {number} level - Level number (1-5).
 * @returns {number} Base points.
 */
export function basePoints(level) {
  return level * 10;
}

/**
 * Applies the streak bonus to a point value.
 * @param {number} points - Points before the bonus.
 * @param {number} streakLength - Streak length including the current item.
 * @returns {number} Points after the bonus.
 */
export function withStreakBonus(points, streakLength) {
  return streakLength >= STREAK_THRESHOLD ? points * 2 : points;
}

/**
 * Returns the points for one correct item.
 * @param {number} level - Level number (1-5).
 * @param {number} streakLength - Streak length including the current item.
 * @returns {number} Points.
 */
export function pointsForCorrect(level, streakLength) {
  return withStreakBonus(basePoints(level), streakLength);
}

/**
 * Returns the points for an attempt-based task (levels 4 and SentenceBuilder).
 * @param {number} base - Base points of the task.
 * @param {number} attempt - 1 for the first attempt, 2 for the second, 3 for failed.
 * @param {number} streakLength - Streak length including the current item.
 * @returns {number} Points.
 */
export function pointsForAttempt(base, attempt, streakLength) {
  if (attempt === 1) {
    return withStreakBonus(base, streakLength);
  }
  return attempt === 2 ? base / 2 : 0;
}

/**
 * Applies a round score to the level records.
 * @param {object} levelRecords - Records by level number.
 * @param {number|string} level - Level the round was played in.
 * @param {number} roundScore - Score of the finished round.
 * @returns {{levelRecords: object, isNewRecord: boolean}} Updated records and record flag.
 */
export function applyRoundResult(levelRecords, level, roundScore) {
  const previousRecord = levelRecords[level] || 0;
  const isNewRecord = roundScore > previousRecord;
  const updatedRecords = { ...levelRecords };
  if (isNewRecord) {
    updatedRecords[level] = roundScore;
  }
  return { levelRecords: updatedRecords, isNewRecord };
}
