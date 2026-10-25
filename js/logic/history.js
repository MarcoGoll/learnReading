/** Number of days kept in the daily activity log. */
export const ACTIVITY_DAYS_KEPT = 60;

/**
 * Returns today's date as ISO string (YYYY-MM-DD) in local time.
 * @param {Date} [date=new Date()] - Date to format.
 * @returns {string} Date string.
 */
export function dateString(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Builds the history key of an item.
 * @param {string} type - Item type: letter, syllable, word, or sentence.
 * @param {string} id - Item id.
 * @returns {string} History key such as "word:mama".
 */
export function itemKey(type, id) {
  return `${type}:${id}`;
}

/**
 * Creates an empty history entry.
 * @returns {object} History entry.
 */
function emptyEntry() {
  return { correct: 0, wrong: 0, notYet: 0, consecutiveCorrect: 0, lastSeen: '' };
}

/**
 * Records one result of an item in the state's history and daily activity.
 * @param {object} state - Game state (mutated).
 * @param {string} key - History key of the item.
 * @param {string} result - "correct", "wrong", or "notYet".
 * @param {string} today - Current date string.
 */
export function recordResult(state, key, result, today) {
  const entry = state.history[key] || emptyEntry();
  entry[result] += 1;
  entry.consecutiveCorrect = updatedConsecutive(entry.consecutiveCorrect, result);
  entry.lastSeen = today;
  state.history[key] = entry;
  if (result !== 'notYet') {
    state.dailyActivity[today] = (state.dailyActivity[today] || 0) + 1;
    pruneActivity(state.dailyActivity, today);
  }
}

/**
 * Returns the new number of consecutive correct answers after a result.
 * @param {number} consecutive - Previous count.
 * @param {string} result - New result.
 * @returns {number} Updated count.
 */
function updatedConsecutive(consecutive, result) {
  if (result === 'correct') {
    return consecutive + 1;
  }
  return result === 'wrong' ? 0 : consecutive;
}

/**
 * Removes activity entries older than the kept number of days.
 * @param {object} dailyActivity - Activity by date (mutated).
 * @param {string} today - Current date string.
 */
function pruneActivity(dailyActivity, today) {
  const oldestKept = new Date(`${today}T00:00:00`);
  oldestKept.setDate(oldestKept.getDate() - ACTIVITY_DAYS_KEPT);
  const oldestKey = dateString(oldestKept);
  Object.keys(dailyActivity).forEach((date) => {
    if (date < oldestKey) {
      delete dailyActivity[date];
    }
  });
}
