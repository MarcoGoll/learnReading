import { pointsForAttempt, withStreakBonus, basePoints } from './scoring.js';
import { recordResult, dateString } from './history.js';

/**
 * Tracks round score and streak, adds points to the total, records history,
 * and can undo the last recorded result.
 */
class RoundSession {
  /**
   * Creates a session.
   * @param {object} options - Session options.
   * @param {number} options.level - Level whose base points are used by default.
   * @param {Function} options.updateState - Store update function taking a mutator.
   * @param {string} [options.today] - Date string used for history.
   */
  constructor({ level, updateState, today = dateString() }) {
    this.level = level;
    this.updateState = updateState;
    this.today = today;
    this.counters = { roundScore: 0, streak: 0, correctCount: 0, taskCount: 0, notYetCount: 0 };
    this.lastUndo = null;
  }

  /** @returns {number} Score of the round so far. */
  roundScore() { return this.counters.roundScore; }

  /** @returns {number} Current streak of correct results. */
  streak() { return this.counters.streak; }

  /** @returns {number} Number of correct results. */
  correctCount() { return this.counters.correctCount; }

  /** @returns {number} Number of judged results (without "not yet"). */
  taskCount() { return this.counters.taskCount; }

  /** @returns {number} Number of items marked "not yet". */
  notYetCount() { return this.counters.notYetCount; }

  /** @returns {{correctCount: number, taskCount: number, notYetCount: number}} Counts for the stars. */
  stats() {
    return { correctCount: this.counters.correctCount, taskCount: this.counters.taskCount, notYetCount: this.counters.notYetCount };
  }

  /** @returns {boolean} True if the last result can be undone. */
  canUndo() { return this.lastUndo !== null; }

  /**
   * Records a result, adds its points to the total, and stores it in the history.
   * @param {string|null} key - History key of the item (null to skip history).
   * @param {string} result - "correct", "wrong", or "notYet".
   * @param {object} [options] - attempt, base, and consolationPoints (see applyResult).
   * @returns {{points: number, streak: number}} Earned points and the new streak.
   */
  record(key, result, options = {}) {
    const before = { ...this.counters };
    const points = applyResult(this.counters, result, { level: this.level, ...options });
    const undo = { before, key };
    this.updateState((state) => {
      undo.stateBefore = snapshotState(state, key, this.today);
      state.score.total += points;
      if (key) recordResult(state, key, result, this.today);
    });
    this.lastUndo = undo;
    return { points, streak: this.counters.streak };
  }

  /**
   * Undoes the last recorded result (counters, total points, history, activity).
   */
  undo() {
    if (!this.lastUndo) {
      return;
    }
    const undo = this.lastUndo;
    Object.assign(this.counters, undo.before);
    this.updateState((state) => restoreState(state, undo.key, this.today, undo.stateBefore));
    this.lastUndo = null;
  }
}

/**
 * Creates a round session.
 * @param {object} options - See RoundSession constructor.
 * @returns {RoundSession} Session.
 */
export function createRoundSession(options) {
  return new RoundSession(options);
}

/**
 * Updates the counters for one result and returns the earned points.
 * @param {object} counters - Round counters (mutated).
 * @param {string} result - "correct", "wrong", or "notYet".
 * @param {object} options - level and optional attempt (1, 2), base points, and consolation points
 *   (points for a wrong result that still earns something, e.g. a memory pair found with mistakes).
 * @returns {number} Earned points.
 */
function applyResult(counters, result, { level, attempt = 1, base = basePoints(level), consolationPoints = 0 }) {
  if (result === 'notYet') {
    counters.notYetCount += 1;
    return 0;
  }
  counters.taskCount += 1;
  if (result === 'wrong') {
    counters.streak = 0;
    counters.roundScore += consolationPoints;
    return consolationPoints;
  }
  counters.correctCount += 1;
  counters.streak = attempt === 1 ? counters.streak + 1 : 0;
  const points = attempt === 1 ? withStreakBonus(base, counters.streak) : pointsForAttempt(base, attempt, 0);
  counters.roundScore += points;
  return points;
}

/**
 * Captures the parts of the state that a recorded result changes.
 * @param {object} state - Game state.
 * @param {string|null} key - History key.
 * @param {string} today - Date string.
 * @returns {object} Snapshot.
 */
function snapshotState(state, key, today) {
  const entry = key ? state.history[key] : undefined;
  return {
    total: state.score.total,
    entry: entry ? { ...entry } : undefined,
    activity: state.dailyActivity[today]
  };
}

/**
 * Restores a snapshot taken by snapshotState.
 * @param {object} state - Game state (mutated).
 * @param {string|null} key - History key.
 * @param {string} today - Date string.
 * @param {object} snapshot - Snapshot to restore.
 */
function restoreState(state, key, today, snapshot) {
  state.score.total = snapshot.total;
  if (key) {
    restoreValue(state.history, key, snapshot.entry);
  }
  restoreValue(state.dailyActivity, today, snapshot.activity);
}

/**
 * Sets an object property to a value, or deletes it when the value is undefined.
 * @param {object} target - Object to change.
 * @param {string} key - Property name.
 * @param {*} value - Value to restore.
 */
function restoreValue(target, key, value) {
  if (value === undefined) {
    delete target[key];
  } else {
    target[key] = value;
  }
}
