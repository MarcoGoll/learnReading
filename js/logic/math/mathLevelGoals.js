import { mathProfileOf, MATH_VARIANTS_TO_COMPLETE } from '../../content/mathProfiles.js';
import { mergeUnique } from '../random.js';

/** Base points per correct first attempt of each math level. */
export const MATH_BASE_POINTS = { 1: 10, 2: 20, 3: 20, 4: 30, 5: 40, 6: 40, 7: 50 };

/**
 * Returns the base points of a math level.
 * @param {number} level - Level 1-7.
 * @returns {number} Base points.
 */
export function mathBasePoints(level) {
  return MATH_BASE_POINTS[level] || 0;
}

/**
 * Returns the goal of a math level of the active journey, including the running round.
 * Levels 1-6 count different tasks answered correctly at the first attempt; level 7 counts passed variants.
 * @param {number} level - Level 1-7.
 * @param {object} state - Game state (active journey must be a math journey).
 * @param {Array<string>} [roundIds=[]] - Ids mastered in the running round (or passed variants).
 * @returns {{text: string, current: number, target: number, detail: string, isReached: boolean, completesImmediately: boolean, wasCompleted: boolean, unit: string}} Goal.
 */
export function mathLevelGoal(level, state, roundIds = []) {
  const journey = state.journeys[state.activeJourney];
  const isChallenge = level === 7;
  const entry = isChallenge ? null : mathProfileOf(state.activeJourney).levels[level];
  const target = isChallenge ? MATH_VARIANTS_TO_COMPLETE : entry.goal;
  const known = isChallenge ? journey.passedVariants : (journey.mastered[level] || []);
  const current = Math.min(mergeUnique(known, roundIds).length, target);
  const unit = isChallenge ? 'Abenteuer' : entry.unit;
  const text = isChallenge
    ? `Ziel: ${target} verschiedene Abenteuer schaffen (je mindestens die Hälfte richtig)`
    : `Ziel: ${target} verschiedene ${unit} auf Anhieb richtig`;
  return {
    text,
    current,
    target,
    unit,
    detail: `${current} von ${target} ${unit}`,
    isReached: current >= target,
    completesImmediately: isChallenge,
    wasCompleted: journey.completedLevels.includes(level)
  };
}

/**
 * Checks whether a math level's goal is reached in the active journey.
 * @param {number} level - Level 1-7.
 * @param {object} state - Game state.
 * @returns {boolean} True when complete.
 */
export function isMathLevelComplete(level, state) {
  return mathLevelGoal(level, state).isReached;
}

/**
 * Returns the short hint text of a math level (what is missing).
 * @param {number} level - Level 1-7.
 * @param {object} goal - Goal from mathLevelGoal.
 * @returns {{short: string, tip: string}} Hint parts.
 */
export function mathHintParts(level, goal) {
  const missing = goal.target - goal.current;
  if (missing <= 0) return { short: 'Ziel erreicht, spiele eine Runde, um das Level abzuschließen', tip: '' };
  if (level === 7) {
    return { short: `noch ${missing} verschiedene Abenteuer schaffen`, tip: 'Jedes Abenteuer zählt nur einmal. Probiere eines ohne Haken.' };
  }
  return { short: `noch ${missing} ${goal.unit} auf Anhieb richtig lösen`, tip: '' };
}
