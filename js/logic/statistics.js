import { dateString } from './history.js';

/** Minimum wrong answers for an item to count as difficult. */
export const MIN_WRONG = 2;

/** Success rate below which an item counts as difficult. */
export const DIFFICULT_RATE = 0.7;

/** Consecutive correct answers after which an item is no longer difficult. */
export const RESOLVED_STREAK = 3;

/**
 * Returns the success rate of a history entry.
 * @param {object} entry - History entry.
 * @returns {number|null} Rate in [0, 1] or null without judged attempts.
 */
export function successRate(entry) {
  const attempts = entry.correct + entry.wrong;
  return attempts === 0 ? null : entry.correct / attempts;
}

/**
 * Checks whether a history entry is difficult.
 * @param {object} entry - History entry.
 * @returns {boolean} True if difficult.
 */
export function isDifficult(entry) {
  return entry.wrong >= MIN_WRONG
    && successRate(entry) < DIFFICULT_RATE
    && entry.consecutiveCorrect < RESOLVED_STREAK;
}

/**
 * Returns all difficult items sorted by success rate (lowest first).
 * @param {object} history - History by item key.
 * @param {Array<string>} [types] - Allowed item types (prefix before ":"); all when omitted.
 * @returns {Array<{key: string, entry: object, rate: number}>} Difficult items.
 */
export function difficultItems(history, types) {
  return Object.entries(history)
    .filter(([key, entry]) => isDifficult(entry) && (!types || types.includes(key.split(':')[0])))
    .map(([key, entry]) => ({ key, entry, rate: successRate(entry) }))
    .sort((first, second) => first.rate - second.rate);
}

/**
 * Returns the activity of the last days, oldest first, including days without activity.
 * @param {object} dailyActivity - Tasks per date.
 * @param {number} [days=14] - Number of days.
 * @param {Date} [today=new Date()] - Current date.
 * @returns {Array<{date: string, count: number}>} Activity per day.
 */
export function activityLastDays(dailyActivity, days = 14, today = new Date()) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const date = dateString(day);
    result.push({ date, count: dailyActivity[date] || 0 });
  }
  return result;
}

/**
 * Groups history entries by item type.
 * @param {object} history - History by item key.
 * @returns {object} Entries by type: { letter: [...], syllable: [...], ... }.
 */
export function entriesByType(history) {
  const groups = { letter: [], syllable: [], word: [], sentence: [] };
  Object.entries(history).forEach(([key, entry]) => {
    const [type, id] = key.split(':');
    if (groups[type] && successRate(entry) !== null) {
      groups[type].push({ id, entry, rate: successRate(entry) });
    }
  });
  return groups;
}
