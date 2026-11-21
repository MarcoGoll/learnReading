/** Minimum judged tasks for a round to earn stars. */
export const MIN_TASKS_FOR_STARS = 3;

/** Stars of a full reading journey (5 levels x 3 stars). */
export const MAX_JOURNEY_STARS = 15;

/**
 * Returns the maximum stars of a journey with the given number of levels.
 * @param {number} levelCount - Levels of the journey.
 * @returns {number} Maximum stars (3 per level).
 */
export function maxJourneyStars(levelCount) {
  return levelCount * 3;
}

/**
 * Returns the stars of a round: 1 from 50 %, 2 from 75 %, 3 for 100 % without "not yet".
 * @param {number} correctCount - Correct tasks.
 * @param {number} taskCount - Judged tasks (without "not yet").
 * @param {number} notYetCount - Items marked "not yet".
 * @returns {number} Stars 0-3.
 */
export function starsForRound(correctCount, taskCount, notYetCount) {
  if (taskCount < MIN_TASKS_FOR_STARS) {
    return 0;
  }
  const accuracy = correctCount / taskCount;
  if (accuracy === 1 && notYetCount === 0) return 3;
  if (accuracy >= 0.75) return 2;
  return accuracy >= 0.5 ? 1 : 0;
}

/**
 * Stores the stars of a level if they improve the previous best.
 * @param {object} starsByLevel - Best stars per level.
 * @param {number} level - Level.
 * @param {number} stars - Stars of the round.
 * @returns {{starsByLevel: object, previous: number, best: number}} Updated stars.
 */
export function applyStars(starsByLevel, level, stars) {
  const previous = starsByLevel[level] || 0;
  const best = Math.max(previous, stars);
  return { starsByLevel: { ...starsByLevel, [level]: best }, previous, best };
}

/**
 * Returns the total stars of a journey.
 * @param {object} starsByLevel - Best stars per level.
 * @returns {number} Total stars.
 */
export function journeyStarTotal(starsByLevel) {
  return Object.values(starsByLevel).reduce((sum, stars) => sum + stars, 0);
}

/**
 * Checks whether all stars of a journey are collected.
 * @param {object} starsByLevel - Best stars per level.
 * @param {number} [maxStars=MAX_JOURNEY_STARS] - Maximum stars of the journey.
 * @returns {boolean} True when all stars are collected.
 */
export function hasAllStars(starsByLevel, maxStars = MAX_JOURNEY_STARS) {
  return journeyStarTotal(starsByLevel) >= maxStars;
}
