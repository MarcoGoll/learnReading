import { JOURNEYS } from '../data/journeys.js';
import { REWARDS } from '../data/rewards.js';
import { spentForUnlocked } from '../logic/rewards.js';

/** Current version of the persisted state format. */
export const STATE_VERSION = 2;

/** Number of levels in each journey. */
export const LEVEL_COUNT = 5;

/**
 * Creates the progress of one journey (one dino).
 * @param {boolean} isFirst - Whether this is the first journey (unlocked and started from the beginning).
 * @returns {object} Journey state.
 */
export function createJourneyState(isFirst) {
  return {
    unlocked: isFirst,
    started: isFirst,
    dinoName: '',
    currentLevel: 1,
    completedLevels: [],
    dinoStage: 0,
    levelRecords: {},
    stars: {},
    mastered: { 1: [], 2: [], 3: [], 4: [] },
    passedVariants: [],
    worn: { head: null, eyes: null, neck: null },
    care: { hunger: 100, fun: 100, clean: 100, updatedAt: 0 }
  };
}

/**
 * Creates a fresh game state for the first start or after a reset.
 * @returns {object} Default game state.
 */
export function createDefaultState() {
  const journeys = {};
  JOURNEYS.forEach((journey, index) => { journeys[journey.id] = createJourneyState(index === 0); });
  return {
    version: STATE_VERSION,
    activeJourney: JOURNEYS[0].id,
    journeys,
    pools: { letters: [], syllables: [], words: [], builtWords: [] },
    score: { total: 0 },
    settings: { soundsEnabled: true, musicEnabled: true, readAloudAfterWrong: true },
    rewards: { unlocked: [], spent: 0 },
    content: { customWords: [], hiddenWordIds: [] },
    familyCelebrated: false,
    history: {},
    dailyActivity: {}
  };
}

/**
 * Checks whether a value is a plain object.
 * @param {*} value - Value to check.
 * @returns {boolean} True for plain objects.
 */
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Deeply merges stored values into defaults, ignoring values of the wrong type.
 * Objects without fixed keys in the defaults (e.g. history) are taken over as stored.
 * @param {object} defaults - Default structure.
 * @param {object} stored - Stored (possibly partial or invalid) data.
 * @returns {object} Merged object.
 */
function mergeWithDefaults(defaults, stored) {
  const result = { ...defaults };
  Object.keys(stored).forEach((key) => {
    const defaultValue = defaults[key];
    const storedValue = stored[key];
    if (isPlainObject(defaultValue) && isPlainObject(storedValue)) {
      const hasFixedKeys = Object.keys(defaultValue).length > 0;
      result[key] = hasFixedKeys ? mergeWithDefaults(defaultValue, storedValue) : storedValue;
    } else if (defaultValue === undefined || defaultValue === null || typeof defaultValue === typeof storedValue) {
      result[key] = Array.isArray(defaultValue) && !Array.isArray(storedValue) ? defaultValue : storedValue;
    }
  });
  return result;
}

/**
 * Converts a version 1 state (one dino) into version 2 (journeys): the old progress becomes the T-Rex journey.
 * @param {object} oldState - Version 1 state.
 * @returns {object} Version 2 state (not yet normalized).
 */
export function migrateFromVersion1(oldState) {
  const migrated = createDefaultState();
  const pools = isPlainObject(oldState.pools) ? oldState.pools : {};
  const trex = migrated.journeys.trex;
  Object.assign(trex, {
    dinoName: oldState.dinoName || '',
    currentLevel: oldState.currentLevel || 1,
    completedLevels: oldState.completedLevels || [],
    dinoStage: oldState.dinoStage || 0,
    levelRecords: (oldState.score && oldState.score.levelRecords) || {},
    passedVariants: (oldState.challenge && oldState.challenge.passedVariants) || [],
    worn: (oldState.rewards && oldState.rewards.worn) || trex.worn,
    mastered: { 1: pools.letters || [], 2: pools.syllables || [], 3: pools.words || [], 4: pools.builtWords || [] }
  });
  return {
    ...migrated,
    journeys: migrated.journeys,
    pools: { ...migrated.pools, ...pools },
    score: { total: (oldState.score && oldState.score.total) || 0 },
    settings: { ...migrated.settings, ...(oldState.settings || {}) },
    rewards: { unlocked: (oldState.rewards && oldState.rewards.unlocked) || [], spent: 0 },
    history: oldState.history || {},
    dailyActivity: oldState.dailyActivity || {}
  };
}

/**
 * Turns raw stored data into a valid state; version 1 data is migrated, invalid data yields the default state.
 * @param {*} rawState - Parsed data from storage.
 * @returns {object} Valid game state.
 */
export function normalizeState(rawState) {
  if (!isPlainObject(rawState)) {
    return createDefaultState();
  }
  if (rawState.version === 1) {
    return normalizeState(migrateFromVersion1(rawState));
  }
  if (rawState.version !== STATE_VERSION) {
    return createDefaultState();
  }
  const state = mergeWithDefaults(createDefaultState(), rawState);
  if (!isPlainObject(rawState.rewards) || typeof rawState.rewards.spent !== 'number') {
    state.rewards.spent = spentForUnlocked(state.rewards.unlocked, state.score.total, REWARDS);
  }
  return state;
}
