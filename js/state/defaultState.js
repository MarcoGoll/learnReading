/** Current version of the persisted state format. */
export const STATE_VERSION = 1;

/** Number of levels in the game. */
export const LEVEL_COUNT = 5;

/**
 * Creates a fresh game state for the first start or after a reset.
 * @returns {object} Default game state.
 */
export function createDefaultState() {
  return {
    version: STATE_VERSION,
    currentLevel: 1,
    completedLevels: [],
    pools: { letters: [], syllables: [], words: [], builtWords: [] },
    score: { total: 0, levelRecords: {} },
    dinoStage: 0,
    dinoName: '',
    settings: { soundsEnabled: true, musicEnabled: true, readAloudAfterWrong: true },
    rewards: { unlocked: [], worn: { head: null, eyes: null, neck: null } },
    challenge: { passedVariants: [] },
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
 * Turns raw stored data into a valid state; invalid data falls back to the default state.
 * @param {*} rawState - Parsed data from storage.
 * @returns {object} Valid game state.
 */
export function normalizeState(rawState) {
  if (!isPlainObject(rawState) || rawState.version !== STATE_VERSION) {
    return createDefaultState();
  }
  return mergeWithDefaults(createDefaultState(), rawState);
}
