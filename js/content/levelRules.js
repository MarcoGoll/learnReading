import { activeJourney } from '../state/journeyState.js';
import { activeProfile, reviewItems } from './profiles.js';
import { wordById } from '../data/allWords.js';
import { mergeUnique, shuffle } from '../logic/random.js';
import { buildableWords } from '../logic/wordLevel.js';
import { availableSyllables } from '../logic/syllableLevel.js';

/** Goal size per level (level 3 of the story journey: completed stories). */
const GOAL_TARGETS = { 1: 8, 2: 5, 3: 5, 4: 5, 5: 3 };

/** Mastered letter combinations needed in level 1 of the Triceratops journey. */
const COMBINATION_GOAL = 1;

/** Completed stories needed in level 3 of the story journey. */
const STORY_GOAL = 4;

/** Size of a review round in level 1. */
const REVIEW_ROUND_SIZE = 10;

/**
 * Returns the goal size of a level in the active journey.
 * @param {number} level - Level 1-5.
 * @param {object} state - Game state.
 * @returns {number} Target.
 */
export function goalTarget(level, state) {
  const profile = activeProfile(state);
  if (level === 1 && profile.level1.mode === 'select' && profile.level1.items[0].type === 'combination') {
    return COMBINATION_GOAL;
  }
  return level === 3 && profile.level3Mode === 'stories' ? STORY_GOAL : GOAL_TARGETS[level];
}

/**
 * Returns the ids of the profile's words.
 * @param {object} profile - Content profile.
 * @returns {Set<string>} Word ids.
 */
function profileWordIds(profile) {
  return new Set(profile.words.map((word) => word.id));
}

/**
 * Counts the progress of a level in the active journey, including ids of the running round.
 * @param {number} level - Level 1-5.
 * @param {object} state - Game state.
 * @param {Array<string>} [roundIds=[]] - Ids mastered in the running round (passed variants for level 5).
 * @returns {number} Progress count.
 */
export function goalCount(level, state, roundIds = []) {
  const journey = activeJourney(state);
  const profile = activeProfile(state);
  if (level === 5) {
    return mergeUnique(journey.passedVariants, roundIds).length;
  }
  const mastered = mergeUnique(journey.mastered[level], roundIds);
  if (level === 1) {
    const allowed = profile.level1.mode === 'select' ? new Set(profile.level1.items.map((item) => item.id)) : null;
    return allowed ? mastered.filter((id) => allowed.has(id)).length : mastered.length;
  }
  if (level === 2) {
    return buildableWords(mastered, profile.words).length;
  }
  if (level === 3 && profile.level3Mode === 'stories') {
    return mastered.length;
  }
  const wordIds = profileWordIds(profile);
  return mastered.filter((id) => wordIds.has(id)).length;
}

/**
 * Checks whether a level of the active journey is complete.
 * @param {number} level - Level 1-5.
 * @param {object} state - Game state.
 * @returns {boolean} True when the goal is reached.
 */
export function isLevelComplete(level, state) {
  return goalCount(level, state) >= goalTarget(level, state);
}

/**
 * Returns the level 1 items of the active journey: selectable items or a random review round.
 * @param {object} state - Game state.
 * @returns {{mode: string, items: Array<object>}} Mode and items.
 */
export function level1Items(state) {
  const profile = activeProfile(state);
  if (profile.level1.mode === 'select') {
    return { mode: 'select', items: profile.level1.items };
  }
  return { mode: 'review', items: shuffle(reviewItems(state)).slice(0, REVIEW_ROUND_SIZE) };
}

/**
 * Returns the syllables available in level 2 of the active journey.
 * @param {object} state - Game state.
 * @returns {Array<object>} Syllables whose sounds are all known.
 */
export function level2Syllables(state) {
  return availableSyllables(state.pools.letters, activeProfile(state).syllableSource);
}

/**
 * Returns the words that can be read in level 3 (and built in the story journey's level 4).
 * @param {object} state - Game state.
 * @returns {Array<object>} Buildable words of the profile.
 */
export function readableWords(state) {
  return buildableWords(state.pools.syllables, activeProfile(state).words);
}

/**
 * Returns the words that can be built in level 4 of the active journey.
 * @param {object} state - Game state.
 * @returns {Array<object>} Words.
 */
export function level4Words(state) {
  const profile = activeProfile(state);
  if (profile.level3Mode === 'stories') {
    return readableWords(state);
  }
  const wordIds = profileWordIds(profile);
  return activeJourney(state).mastered[3].filter((id) => wordIds.has(id)).map(wordById).filter(Boolean);
}

/**
 * Returns the word ids that form the level 5 material of the active journey.
 * @param {object} state - Game state.
 * @returns {Array<string>} Word ids.
 */
export function level5WordIds(state) {
  const journey = activeJourney(state);
  const extra = activeProfile(state).level3Mode === 'stories'
    ? readableWords(state).map((word) => word.id)
    : journey.mastered[3];
  const wordIds = profileWordIds(activeProfile(state));
  return mergeUnique(journey.mastered[4], extra).filter((id) => wordIds.has(id));
}
