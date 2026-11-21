import { mergeUnique } from './random.js';
import { applyRoundResult } from './scoring.js';
import { starsForRound, applyStars } from './stars.js';
import { levelCountOf, subjectOf } from '../data/journeys.js';
import { activeJourney, unlockNextJourney } from '../state/journeyState.js';

/** Shared pool key of each reading level whose correct items are passed on. */
export const POOL_BY_LEVEL = { 1: 'letters', 2: 'syllables', 3: 'words', 4: 'builtWords' };

/** Dino stage reached by completing a math level; levels 3 and 5 give no new stage. */
export const MATH_STAGE_BY_LEVEL = { 1: 1, 2: 2, 4: 3, 6: 4, 7: 5 };

/**
 * Returns the dino stage reached by completing a level of a subject.
 * @param {string} subject - "reading" or "math".
 * @param {number} level - Completed level.
 * @returns {number} Stage (0 when the level gives no stage).
 */
export function stageForLevel(subject, level) {
  return subject === 'math' ? (MATH_STAGE_BY_LEVEL[level] || 0) : level;
}

/**
 * Checks whether a level of the active journey can be played.
 * @param {object} state - Game state.
 * @param {number} level - Level number.
 * @returns {boolean} True if unlocked.
 */
export function isLevelUnlocked(state, level) {
  const journey = activeJourney(state);
  const levelCount = levelCountOf(state.activeJourney);
  return Boolean(journey && journey.started) && level >= 1 && level <= Math.min(journey.currentLevel, levelCount);
}

/**
 * Marks a level of a journey as completed (first time only), unlocks the next level, and advances the dino.
 * @param {object} journey - Journey state (mutated).
 * @param {number} level - Completed level.
 * @param {string} [subject='reading'] - Subject of the journey (decides the reached dino stage).
 * @returns {boolean} True if the level was completed for the first time now.
 */
export function completeLevel(journey, level, subject = 'reading') {
  if (journey.completedLevels.includes(level)) {
    return false;
  }
  journey.completedLevels.push(level);
  journey.currentLevel = Math.max(journey.currentLevel, level + 1);
  journey.dinoStage = Math.max(journey.dinoStage, stageForLevel(subject, level));
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
  const poolKey = subjectOf(state.activeJourney) === 'reading' ? POOL_BY_LEVEL[level] : null;
  if (poolKey) {
    state.pools[poolKey] = mergeUnique(state.pools[poolKey], correctIds);
  }
  if (journey.mastered[level]) {
    journey.mastered[level] = mergeUnique(journey.mastered[level], correctIds);
  }
}

/**
 * Applies the end of a round in the active journey: merges correct items, updates record and stars,
 * completes the level if its rule is met, and unlocks the next journey after the journey's last level.
 * @param {object} state - Game state (mutated).
 * @param {object} roundResult - Result of the round.
 * @param {number} roundResult.level - Level number.
 * @param {Array<string>} roundResult.correctIds - Ids of correct items.
 * @param {number} roundResult.roundScore - Round score.
 * @param {Function} roundResult.isComplete - Completion rule taking the updated state.
 * @param {object} [roundResult.stats] - correctCount, taskCount, notYetCount for the stars.
 * @returns {object} Outcome: isNewRecord, levelCompletedNow, stageChanged, stars, previousStars, unlockedJourney.
 */
export function finishRound(state, { level, correctIds, roundScore, isComplete, stats }) {
  const journey = activeJourney(state);
  mergeCorrectItems(state, journey, level, correctIds);
  const recordResult = applyRoundResult(journey.levelRecords, level, roundScore);
  journey.levelRecords = recordResult.levelRecords;
  const roundStars = stats ? starsForRound(stats.correctCount, stats.taskCount, stats.notYetCount) : 0;
  const starResult = applyStars(journey.stars, level, roundStars);
  journey.stars = starResult.starsByLevel;
  const subject = subjectOf(state.activeJourney);
  const stageBefore = journey.dinoStage;
  const levelCompletedNow = isComplete(state) ? completeLevel(journey, level, subject) : false;
  const isLastLevel = level === levelCountOf(state.activeJourney);
  const unlockedJourney = levelCompletedNow && isLastLevel ? unlockNextJourney(state, state.activeJourney) : null;
  return {
    stageChanged: journey.dinoStage > stageBefore,
    isNewRecord: recordResult.isNewRecord,
    levelCompletedNow,
    stars: roundStars,
    previousStars: starResult.previous,
    unlockedJourney
  };
}
