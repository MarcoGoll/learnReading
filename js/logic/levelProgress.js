import { mergeUnique } from './random.js';
import { applyRoundResult } from './scoring.js';
import { LEVEL_COUNT } from '../state/defaultState.js';

/** Pool key of each level whose correct items are passed on. */
export const POOL_BY_LEVEL = { 1: 'letters', 2: 'syllables', 3: 'words', 4: 'builtWords' };

/**
 * Checks whether a level can be played.
 * @param {object} state - Game state.
 * @param {number} level - Level number.
 * @returns {boolean} True if unlocked.
 */
export function isLevelUnlocked(state, level) {
  return level >= 1 && level <= Math.min(state.currentLevel, LEVEL_COUNT);
}

/**
 * Marks a level as completed (first time only), unlocks the next level, and advances the dino.
 * @param {object} state - Game state (mutated).
 * @param {number} level - Completed level.
 * @returns {boolean} True if the level was completed for the first time now.
 */
export function completeLevel(state, level) {
  if (state.completedLevels.includes(level)) {
    return false;
  }
  state.completedLevels.push(level);
  state.currentLevel = Math.max(state.currentLevel, level + 1);
  state.dinoStage = Math.max(state.dinoStage, level);
  return true;
}

/**
 * Applies the end of a round: merges correct items into the level pool, updates the record,
 * and completes the level if its completion rule is met.
 * @param {object} state - Game state (mutated).
 * @param {object} roundResult - Result of the round.
 * @param {number} roundResult.level - Level number.
 * @param {Array<string>} roundResult.correctIds - Ids of correct items.
 * @param {number} roundResult.roundScore - Round score.
 * @param {Function} roundResult.isComplete - Completion rule taking the updated state.
 * @returns {{isNewRecord: boolean, levelCompletedNow: boolean}} Outcome.
 */
export function finishRound(state, { level, correctIds, roundScore, isComplete }) {
  const poolKey = POOL_BY_LEVEL[level];
  if (poolKey) {
    state.pools[poolKey] = mergeUnique(state.pools[poolKey], correctIds);
  }
  const recordResult = applyRoundResult(state.score.levelRecords, level, roundScore);
  state.score.levelRecords = recordResult.levelRecords;
  const levelCompletedNow = isComplete(state) ? completeLevel(state, level) : false;
  return { isNewRecord: recordResult.isNewRecord, levelCompletedNow };
}
