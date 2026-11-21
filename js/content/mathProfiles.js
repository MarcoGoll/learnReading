/**
 * Math content profiles: one dino per operation, each with 7 levels (title, task config, input type,
 * visual help, goal size) and the settings of its level 7 adventures.
 * aidMode "always" shows the picture all the time, "onRequest" via the help button and after a mistake.
 */

/** Units of the goal texts per task kind. */
const UNITS = {
  numbers: 'Zahlen-Aufgaben', add: 'Plus-Aufgaben', subtract: 'Minus-Aufgaben',
  multiply: 'Mal-Aufgaben', divide: 'Geteilt-Aufgaben'
};

/** Times tables per level of the times and divided dinos (level 6 mixes all). */
const TABLES_BY_LEVEL = { 1: [1, 2, 10], 2: [5], 3: [3, 4], 4: [6], 5: [7, 8, 9], 6: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };

/** Goal sizes of the times and divided levels (single tables have fewer tasks). */
const TABLE_GOALS = { 1: 15, 2: 12, 3: 15, 4: 12, 5: 15, 6: 20 };

/** Titles of the times and divided levels. */
const TABLE_TITLES = { 1: 'Reihen 1, 2, 10', 2: 'Reihe 5', 3: 'Reihen 3, 4', 4: 'Reihe 6', 5: 'Reihen 7, 8, 9', 6: 'Alle Reihen' };

/**
 * Builds one level entry.
 * @param {string} title - Map title.
 * @param {object} config - Task config (kind and options).
 * @param {number} goal - Different tasks to answer correctly at the first attempt.
 * @param {object} display - input ("cards" or "pad"), aid, and aidMode.
 * @returns {object} Level entry.
 */
function level(title, config, goal, display) {
  return { title, config, goal, unit: UNITS[config.kind], ...display };
}

/**
 * Builds the six levels of the plus or minus dino.
 * @param {string} kind - "add" or "subtract".
 * @param {object} first - Entry of level 1.
 * @param {object} second - Entry of level 2.
 * @returns {object} Levels 1-6.
 */
function lineLevels(kind, first, second) {
  const pad = (aid, aidMode) => ({ input: 'pad', aid, aidMode });
  return {
    1: first,
    2: second,
    3: level('Bis 20', { kind, max: 20, excludeUpTo: 10, crossing: 'none' }, 15, pad('tenFrame', 'always')),
    4: level('Bis 20 mit Übergang', { kind, max: 20, excludeUpTo: 10, crossing: 'only' }, 15, pad('tenFrame', 'onRequest')),
    5: level('Bis 100', { kind, max: 100, excludeUpTo: 20, crossing: 'none' }, 15, pad('tensAndUnits', 'always')),
    6: level('Bis 100 mit Übergang', { kind, max: 100, excludeUpTo: 20, crossing: 'only' }, 15, pad('tensAndUnits', 'onRequest'))
  };
}

/**
 * Builds the six levels of the times or divided dino.
 * @param {string} kind - "multiply" or "divide".
 * @param {string} aid - "eggRows" or "sharing".
 * @returns {object} Levels 1-6.
 */
function tableLevels(kind, aid) {
  return Object.fromEntries([1, 2, 3, 4, 5, 6].map((number) => [number, level(
    TABLE_TITLES[number],
    { kind, tables: TABLES_BY_LEVEL[number], factorMax: 10 },
    TABLE_GOALS[number],
    { input: 'pad', aid, aidMode: number <= 2 ? 'always' : 'onRequest' }
  )]));
}

/** Plus dino: numbers first, then plus up to 10, 20, and 100. */
const PLUS = {
  operation: 'add',
  levels: lineLevels('add',
    level('Zahlen', { kind: 'numbers', min: 0, max: 10, types: ['count', 'pickQuantity'] }, 10, { input: 'cards', aid: 'dots', aidMode: 'always' }),
    level('Plus bis 10', { kind: 'add', max: 10, maxZeroTasksPerRound: 2 }, 15, { input: 'pad', aid: 'insects', aidMode: 'always' })),
  challenge: { operations: ['add'], max: 100, tables: [], wallMax: 100, wallMode: 'add', lineMax: 100, variants: ['missingNumber', 'mathMemory', 'numberWall', 'numberLine'] }
};

/** Minus dino: minus up to 5, 10, 20, and 100. */
const MINUS = {
  operation: 'subtract',
  levels: lineLevels('subtract',
    level('Minus bis 5', { kind: 'subtract', max: 5, maxTrivialTasksPerRound: 3 }, 10, { input: 'pad', aid: 'insects', aidMode: 'always' }),
    level('Minus bis 10', { kind: 'subtract', max: 10, excludeUpTo: 5, maxTrivialTasksPerRound: 2 }, 15, { input: 'pad', aid: 'insects', aidMode: 'always' })),
  challenge: { operations: ['subtract'], max: 100, tables: [], wallMax: 100, wallMode: 'subtract', lineMax: 100, variants: ['missingNumber', 'mathMemory', 'numberWall', 'numberLine'] }
};

/** Times dino: one or two new tables per level. */
const TIMES = {
  operation: 'multiply',
  levels: tableLevels('multiply', 'eggRows'),
  challenge: { operations: ['multiply'], max: 100, tables: TABLES_BY_LEVEL[6], lineMax: 100, variants: ['missingNumber', 'mathMemory', 'numberLine'] }
};

/** Divided dino: the inverse of the times tables, always without remainder. */
const DIVIDED = {
  operation: 'divide',
  levels: tableLevels('divide', 'sharing'),
  challenge: { operations: ['divide'], max: 100, tables: TABLES_BY_LEVEL[6], variants: ['missingNumber', 'mathMemory', 'shareFood'] }
};

/** Math profiles by journey id. */
export const MATH_PROFILES = { stegosaurus: PLUS, ankylosaurus: MINUS, parasaurolophus: TIMES, pachycephalosaurus: DIVIDED };

/** Title of level 7 on the map. */
export const CHALLENGE_TITLE = 'Abenteuer';

/** Passed adventures needed to complete level 7 (every dino offers at least 3). */
export const MATH_VARIANTS_TO_COMPLETE = 3;

/**
 * Returns the math profile of a journey.
 * @param {string} journeyId - Math journey id.
 * @returns {object|undefined} Profile.
 */
export function mathProfileOf(journeyId) {
  return MATH_PROFILES[journeyId];
}

/**
 * Returns the map titles of a math journey's 7 levels.
 * @param {string} journeyId - Math journey id.
 * @returns {object} Titles by level.
 */
export function mathLevelTitles(journeyId) {
  const levels = MATH_PROFILES[journeyId].levels;
  return { ...Object.fromEntries(Object.entries(levels).map(([number, entry]) => [number, entry.title])), 7: CHALLENGE_TITLE };
}
