/**
 * Math content profiles: per math journey the 7 levels with title, task config, input type,
 * visual help, and goal size, plus the settings of the level 7 adventures.
 * aidMode "always" shows the picture all the time, "onRequest" via the help button and after a mistake.
 */

/** Goal sizes of levels 1-6 (different tasks correct at the first attempt) and variants of level 7. */
const GOALS = { 1: 10, 2: 15, 3: 15, 4: 20, 5: 15, 6: 15, 7: 3 };

/** Units of the goal texts per operation kind. */
const UNITS = {
  numbers: 'Zahlen-Aufgaben', add: 'Plus-Aufgaben', subtract: 'Minus-Aufgaben', mixedAddSubtract: 'Plus- und Minus-Aufgaben',
  multiply: 'Mal-Aufgaben', divide: 'Geteilt-Aufgaben', mixedMultiplyDivide: 'Einmaleins-Aufgaben'
};

/**
 * Builds one level entry with the shared goal size and unit.
 * @param {number} level - Level 1-6.
 * @param {string} title - Map title.
 * @param {object} config - Task config (kind and options).
 * @param {object} display - input ("cards" or "pad"), aid, and aidMode.
 * @returns {object} Level entry.
 */
function level(level, title, config, display) {
  return { title, config, goal: GOALS[level], unit: UNITS[config.kind], ...display };
}

/** First math journey: numbers up to 10, plus/minus up to 20, core times tables. */
const STEGOSAURUS = {
  levels: {
    1: level(1, 'Zahlen', { kind: 'numbers', min: 0, max: 10, types: ['count', 'pickQuantity'] }, { input: 'cards', aid: 'dots', aidMode: 'always' }),
    2: level(2, 'Plus', { kind: 'add', max: 10, maxZeroTasksPerRound: 2 }, { input: 'pad', aid: 'insects', aidMode: 'always' }),
    3: level(3, 'Minus', { kind: 'subtract', max: 10, maxTrivialTasksPerRound: 2 }, { input: 'pad', aid: 'insects', aidMode: 'always' }),
    4: level(4, 'Bis 20', { kind: 'mixedAddSubtract', max: 20, excludeUpTo: 10, crossingShare: 0.5 }, { input: 'pad', aid: 'tenFrame', aidMode: 'onRequest' }),
    5: level(5, 'Mal', { kind: 'multiply', tables: [1, 2, 5, 10], factorMax: 10 }, { input: 'pad', aid: 'eggRows', aidMode: 'onRequest' }),
    6: level(6, 'Geteilt', { kind: 'divide', tables: [1, 2, 5, 10], factorMax: 10 }, { input: 'pad', aid: 'sharing', aidMode: 'onRequest' })
  },
  challenge: { operations: ['add', 'subtract', 'multiply', 'divide'], max: 20, tables: [1, 2, 5, 10], wallMax: 20, lineMax: 20 }
};

/** Second math journey: numbers up to 100 and times tables 3, 4, 6. */
const ANKYLOSAURUS = {
  levels: {
    1: level(1, 'Zahlen bis 100', { kind: 'numbers', min: 10, max: 100, types: ['count', 'pickQuantity'] }, { input: 'cards', aid: 'tensAndUnits', aidMode: 'always' }),
    2: level(2, 'Plus bis 100', { kind: 'add', max: 100, excludeUpTo: 20, crossing: 'none' }, { input: 'pad', aid: 'tensAndUnits', aidMode: 'always' }),
    3: level(3, 'Minus bis 100', { kind: 'subtract', max: 100, excludeUpTo: 20, crossing: 'none' }, { input: 'pad', aid: 'tensAndUnits', aidMode: 'always' }),
    4: level(4, 'Mit Übergang', { kind: 'mixedAddSubtract', max: 100, excludeUpTo: 20, crossing: 'only' }, { input: 'pad', aid: 'tensAndUnits', aidMode: 'onRequest' }),
    5: level(5, 'Mal', { kind: 'multiply', tables: [3, 4, 6], factorMax: 10 }, { input: 'pad', aid: 'eggRows', aidMode: 'onRequest' }),
    6: level(6, 'Geteilt', { kind: 'divide', tables: [3, 4, 6], factorMax: 10 }, { input: 'pad', aid: 'sharing', aidMode: 'onRequest' })
  },
  challenge: { operations: ['add', 'subtract', 'multiply', 'divide'], max: 100, excludeUpTo: 20, tables: [3, 4, 6], wallMax: 100, lineMax: 100 }
};

/** Third math journey: two-digit numbers up to 100 and the full times table. */
const PARASAUROLOPHUS = {
  levels: {
    1: level(1, 'Zahlen-Profi', { kind: 'numbers', min: 1, max: 100, types: ['next', 'previous', 'nextTen', 'half'] }, { input: 'cards', aid: 'numberLine', aidMode: 'always' }),
    2: level(2, 'Plus-Profi', { kind: 'add', max: 100, twoDigit: true }, { input: 'pad', aid: 'tensAndUnits', aidMode: 'onRequest' }),
    3: level(3, 'Minus-Profi', { kind: 'subtract', max: 100, twoDigit: true }, { input: 'pad', aid: 'tensAndUnits', aidMode: 'onRequest' }),
    4: level(4, 'Gemischt', { kind: 'mixedAddSubtract', max: 100, excludeUpTo: 20, missingNumbers: true }, { input: 'pad', aid: 'tensAndUnits', aidMode: 'onRequest' }),
    5: level(5, 'Mal', { kind: 'multiply', tables: [7, 8, 9], factorMax: 10 }, { input: 'pad', aid: 'eggRows', aidMode: 'onRequest' }),
    6: level(6, 'Einmaleins', { kind: 'mixedMultiplyDivide', tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], factorMax: 10 }, { input: 'pad', aid: 'eggRows', aidMode: 'onRequest' })
  },
  challenge: { operations: ['add', 'subtract', 'multiply', 'divide'], max: 100, excludeUpTo: 20, tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], wallMax: 100, lineMax: 100 }
};

/** Math profiles by journey id. */
export const MATH_PROFILES = { stegosaurus: STEGOSAURUS, ankylosaurus: ANKYLOSAURUS, parasaurolophus: PARASAUROLOPHUS };

/** Title of level 7 on the map. */
export const CHALLENGE_TITLE = 'Abenteuer';

/** Variants needed to complete level 7. */
export const MATH_VARIANTS_TO_COMPLETE = GOALS[7];

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
