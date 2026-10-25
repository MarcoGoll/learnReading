import { mergeUnique } from './random.js';
import { applyRoundResult } from './scoring.js';
import { starsForRound, applyStars } from './stars.js';
import { LEVEL_COUNT } from '../state/defaultState.js';
import { activeJourney, unlockNextJourney } from '../state/journeyState.js';

/** Shared pool key of each level whose correct items are passed on. */
export const POOL_BY_LEVEL = { 1: 'letters', 2: 'syllables', 3: 'words', 4: 'builtWords' };

/**
 * Checks whether a level of the active journey can be played.
 * @param {object} state - Game state.
 * @param {number} level - Level number.
 * @returns {boolean} True if unlocked.
 */
export function isLevelUnlocked(state, level) {
  const journey = activeJourney(state);
  return Boolean(journey && journey.started) && level >= 1 && level <= Math.min(journey.currentLevel, LEVEL_COUNT);
}

/**
 * Marks a level of a journey as completed (first time only), unlocks the next level, and advances the dino.
 * @param {object} journey - Journey state (mutated).
 * @param {number} level - Completed level.
 * @returns {boolean} True if the level was completed for the first time now.
 */
export function completeLevel(journey, level) {
  if (journey.completedLevels.includes(level)) {
    return false;
  }
  journey.completedLevels.push(level);
  journey.currentLevel = Math.max(journey.currentLevel, level + 1);
  journey.dinoStage = Math.max(journey.dinoStage, level);
  return true;
}

/**
 * Merges correct items into the shared pools and into the journey's mastered items.
 * @param {object} state - Game state (mutated).
 * @param {object} journey - Active journey (mutated).
 * @param {number} level - Level.
 * @param {Array<string>} correctIds - Correct item ids.
 */
function mergeCorrectItems(state, journey, level, correctIds) {
  const poolKey = POOL_BY_LEVEL[level];
  if (poolKey) {
    state.pools[poolKey] = mergeUnique(state.pools[poolKey], correctIds);
  }
  if (journey.mastered[level]) {
    journey.mastered[level] = mergeUnique(journey.mastered[level], correctIds);
  }
}

/**
 * Applies the end of a round in the active journey: merges correct items, updates record and stars,
 * completes the level if its rule is met, and unlocks the next journey after level 5.
 * @param {object} state - Game state (mutated).
 * @param {object} roundResult - Result of the round.
 * @param {number} roundResult.level - Level number.
 * @param {Array<string>} roundResult.correctIds - Ids of correct items.
 * @param {number} roundResult.roundScore - Round score.
 * @param {Function} roundResult.isComplete - Completion rule taking the updated state.
 * @param {object} [roundResult.stats] - correctCount, taskCount, notYetCount for the stars.
 * @returns {object} Outcome: isNewRecord, levelCompletedNow, stars, previousStars, unlockedJourney.
 */
export function finishRound(state, { level, correctIds, roundScore, isComplete, stats }) {
  const journey = activeJourney(state);
  mergeCorrectItems(state, journey, level, correctIds);
  const recordResult = applyRoundResult(journey.levelRecords, level, roundScore);
  journey.levelRecords = recordResult.levelRecords;
  const roundStars = stats ? starsForRound(stats.correctCount, stats.taskCount, stats.notYetCount) : 0;
  const starResult = applyStars(journey.stars, level, roundStars);
  journey.stars = starResult.starsByLevel;
  const levelCompletedNow = isComplete(state) ? completeLevel(journey, level) : false;
  const unlockedJourney = levelCompletedNow && level === LEVEL_COUNT ? unlockNextJourney(state, state.activeJourney) : null;
  return {
    isNewRecord: recordResult.isNewRecord,
    levelCompletedNow,
    stars: roundStars,
    previousStars: starResult.previous,
    unlockedJourney
  };
}
