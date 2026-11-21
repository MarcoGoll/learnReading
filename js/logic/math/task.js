/** Display symbols of the operations (German school notation). */
export const OPERATOR_SYMBOLS = { add: '+', subtract: '-', multiply: '·', divide: ':' };

/** Spoken words of the operations. */
export const OPERATOR_WORDS = { add: 'plus', subtract: 'minus', multiply: 'mal', divide: 'geteilt durch' };

/** Id separators of the operations (kept stable for history keys). */
const ID_SEPARATORS = { add: '+', subtract: '-', multiply: '*', divide: ':' };

/** Visual help used by default for each operation. */
const DEFAULT_AIDS = { add: 'insects', subtract: 'insects', multiply: 'eggRows', divide: 'sharing' };

/**
 * Computes the result of an operation.
 * @param {string} operation - add, subtract, multiply, or divide.
 * @param {number} first - First operand.
 * @param {number} second - Second operand.
 * @returns {number} Result.
 */
export function compute(operation, first, second) {
  if (operation === 'add') return first + second;
  if (operation === 'subtract') return first - second;
  if (operation === 'multiply') return first * second;
  return first / second;
}

/**
 * Creates an arithmetic task such as 3 + 4.
 * @param {string} operation - add, subtract, multiply, or divide.
 * @param {number} first - First operand.
 * @param {number} second - Second operand.
 * @returns {object} Task.
 */
export function createArithmeticTask(operation, first, second) {
  const symbol = OPERATOR_SYMBOLS[operation];
  return {
    id: `${operation}:${first}${ID_SEPARATORS[operation]}${second}`,
    operation,
    operands: [first, second],
    answer: compute(operation, first, second),
    missingIndex: null,
    text: `${first} ${symbol} ${second} = ?`,
    speech: `${first} ${OPERATOR_WORDS[operation]} ${second}`,
    aid: DEFAULT_AIDS[operation]
  };
}

/** Texts of the number tasks (level 1): display text and speech per type. */
const NUMBER_TEXTS = {
  count: (number) => ({ text: 'Wie viele sind das?', speech: 'Wie viele sind das?', answer: number }),
  pickQuantity: (number) => ({ text: `Wo sind ${number}?`, speech: `Wo sind ${number}?`, answer: number }),
  next: (number) => ({ text: `Welche Zahl kommt nach ${number}?`, speech: `Welche Zahl kommt nach ${number}?`, answer: number + 1 }),
  previous: (number) => ({ text: `Welche Zahl kommt vor ${number}?`, speech: `Welche Zahl kommt vor ${number}?`, answer: number - 1 }),
  nextTen: (number) => ({ text: `Welcher Zehner kommt nach ${number}?`, speech: `Welcher Zehner kommt nach ${number}?`, answer: (Math.floor(number / 10) + 1) * 10 }),
  half: (number) => ({ text: `Die Hälfte von ${number}?`, speech: `Was ist die Hälfte von ${number}?`, answer: number / 2 })
};

/**
 * Creates a number task of level 1 (count, pickQuantity, next, previous, nextTen, half).
 * @param {string} type - Task type.
 * @param {number} number - Number the task is about.
 * @returns {object} Task.
 */
export function createNumberTask(type, number) {
  const texts = NUMBER_TEXTS[type](number);
  return {
    id: `${type}:${number}`,
    operation: type,
    operands: [number],
    answer: texts.answer,
    missingIndex: null,
    text: texts.text,
    speech: texts.speech,
    aid: type === 'count' || type === 'pickQuantity' ? 'quantity' : 'numberLine'
  };
}

/**
 * Turns an arithmetic task into a missing-number task (3 + _ = 7).
 * @param {object} task - Arithmetic task.
 * @param {number} missingIndex - 0 or 1: which operand is missing.
 * @returns {object} Missing-number task.
 */
export function toMissingNumberTask(task, missingIndex) {
  const parts = task.operands.map((operand, index) => (index === missingIndex ? '_' : String(operand)));
  const spoken = task.operands.map((operand, index) => (index === missingIndex ? 'wie viel' : String(operand)));
  const word = OPERATOR_WORDS[task.operation];
  return {
    ...task,
    id: `missing:${task.id}:${missingIndex}`,
    missingIndex,
    answer: task.operands[missingIndex],
    text: `${parts[0]} ${OPERATOR_SYMBOLS[task.operation]} ${parts[1]} = ${task.answer}`,
    speech: `${spoken[0]} ${word} ${spoken[1]} ist ${task.answer}?`
  };
}

/**
 * Returns the spoken solution of a task, e.g. "3 plus 4 ist 7".
 * @param {object} task - Task.
 * @returns {string} Solution text.
 */
export function solutionSpeech(task) {
  if (!OPERATOR_WORDS[task.operation]) {
    return `Die Lösung ist ${task.answer}.`;
  }
  const [first, second] = task.operands;
  return `${first} ${OPERATOR_WORDS[task.operation]} ${second} ist ${compute(task.operation, first, second)}`;
}

/**
 * Checks whether an addition or subtraction crosses a ten (8 + 5, 13 - 6, 38 + 5).
 * @param {object} task - Task.
 * @returns {boolean} True when the units cross a ten.
 */
export function crossesTen(task) {
  const [first, second] = task.operands;
  if (task.operation === 'add') return (first % 10) + (second % 10) >= 10;
  if (task.operation === 'subtract') return first % 10 < second % 10;
  return false;
}

/**
 * Returns the history key of a math task.
 * @param {object} task - Task.
 * @returns {string} Key with the "math:" prefix.
 */
export function mathHistoryKey(task) {
  return `math:${task.id}`;
}

/**
 * Turns a displayed expression such as "3 · 5" into spoken German ("3 mal 5").
 * @param {string} text - Displayed expression.
 * @returns {string} Spoken text.
 */
export function spokenExpression(text) {
  const words = { '+': 'plus', '-': 'minus', '·': 'mal', ':': 'geteilt durch', '=': 'ist', _: 'wie viel', '?': '' };
  return text.split(' ').map((part) => (words[part] === undefined ? part : words[part])).join(' ').trim();
}
