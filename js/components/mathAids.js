import { el } from './dom.js';
import { AID_COLORS, insect, crossMark, egg, food, plateDino, tenBar, unitCube, frameCell, svgWrap } from './mathAidShapes.js';

/** Insects per row in the insect pictures. */
const INSECTS_PER_ROW = 5;

/**
 * Places objects in rows of five (ten frame layout, so 7 = 5 + 2 is visible).
 * @param {number} count - Number of objects.
 * @param {Function} draw - Called with (x, y, index), returns markup.
 * @param {number} [offsetX=0] - Left offset.
 * @returns {{markup: string, width: number, height: number}} Placed objects.
 */
function inRows(count, draw, offsetX = 0) {
  const markup = Array.from({ length: count }, (_, index) => {
    const column = index % INSECTS_PER_ROW;
    const row = Math.floor(index / INSECTS_PER_ROW);
    return draw(offsetX + 20 + column * 34, 22 + row * 36, index);
  }).join('');
  const rows = Math.max(1, Math.ceil(count / INSECTS_PER_ROW));
  const columns = Math.max(1, Math.min(count, INSECTS_PER_ROW));
  return { markup, width: 20 + columns * 34, height: 10 + rows * 36 };
}

/**
 * Draws a quantity: insects in rows of five up to 20, ten bars and cubes above.
 * @param {number} number - Quantity.
 * @returns {string} SVG markup.
 */
export function quantitySvg(number) {
  if (number > 20) return tensAndUnitsSvg([number], null);
  if (number === 0) {
    const frame = Array.from({ length: 10 }, (_, index) => frameCell(10 + (index % 5) * 26, 10 + Math.floor(index / 5) * 26, null)).join('');
    return svgWrap(150, 66, frame);
  }
  const placed = inRows(number, (x, y) => insect(x, y, AID_COLORS.first));
  return svgWrap(placed.width, placed.height, placed.markup);
}

/**
 * Draws an addition or subtraction with insects: two groups, or crossed-out insects flying away.
 * @param {object} task - Task.
 * @returns {string} SVG markup.
 */
function insectSvg(task) {
  const [first, second] = task.operands;
  if (task.operation === 'subtract') {
    const placed = inRows(first, (x, y, index) => (index >= first - second
      ? insect(x, y, AID_COLORS.faded, 'math-aid__insect--leaving') + crossMark(x, y)
      : insect(x, y, AID_COLORS.first)));
    return svgWrap(placed.width, placed.height, placed.markup);
  }
  const left = inRows(first, (x, y) => insect(x, y, AID_COLORS.first));
  const right = inRows(second, (x, y) => insect(x, y, AID_COLORS.second), left.width + 30);
  const plus = `<text x="${left.width + 14}" y="36" class="math-aid__sign">+</text>`;
  return svgWrap(left.width + right.width + 30, Math.max(left.height, right.height), left.markup + plus + right.markup);
}

/**
 * Draws a twenty frame: first operand in one colour, then the second (addition) or crosses (subtraction).
 * @param {object} task - Task (numbers up to 20).
 * @returns {string} SVG markup.
 */
function tenFrameSvg(task) {
  const [first, second] = task.operands;
  const colorOf = (index) => {
    if (task.operation === 'add') return index < first ? AID_COLORS.first : index < first + second ? AID_COLORS.second : null;
    return index < first ? (index >= first - second ? AID_COLORS.faded : AID_COLORS.first) : null;
  };
  const cells = Array.from({ length: 20 }, (_, index) => {
    const x = 8 + (index % 10) * 26 + (index % 10 >= 5 ? 6 : 0);
    const y = 8 + Math.floor(index / 10) * 26;
    const isCrossed = task.operation === 'subtract' && index < first && index >= first - second;
    return frameCell(x, y, colorOf(index)) + (isCrossed ? crossMark(x + 12, y + 12) : '');
  });
  return svgWrap(280, 64, cells.join(''));
}

/**
 * Draws numbers as ten bars and unit cubes, side by side with the operation sign between them.
 * @param {Array<number>} numbers - One or two numbers.
 * @param {string|null} sign - "+", "-", or null.
 * @returns {string} SVG markup.
 */
export function tensAndUnitsSvg(numbers, sign) {
  let x = 6;
  const groups = numbers.map((number, groupIndex) => {
    const color = groupIndex === 0 ? AID_COLORS.first : AID_COLORS.second;
    const tens = Array.from({ length: Math.floor(number / 10) }, (_, index) => tenBar(x + index * 13, 6, color)).join('');
    x += Math.floor(number / 10) * 13 + 4;
    const units = Array.from({ length: number % 10 }, (_, index) => unitCube(x + Math.floor(index / 5) * 13, 46 + (index % 5) * 8, color)).join('');
    x += Math.ceil((number % 10) / 5) * 13 + 6;
    const signMarkup = sign && groupIndex === 0 ? `<text x="${x}" y="52" class="math-aid__sign">${sign}</text>` : '';
    if (signMarkup) x += 26;
    return tens + units + signMarkup;
  });
  return svgWrap(Math.max(60, x), 92, groups.join(''));
}

/**
 * Draws a multiplication as rows of eggs (a rows with b eggs).
 * @param {object} task - Task.
 * @returns {string} SVG markup.
 */
function eggRowsSvg(task) {
  const [rows, perRow] = task.operands;
  const size = rows * perRow > 50 ? 0.7 : 1;
  const gap = 20 * size;
  const markup = Array.from({ length: rows * perRow }, (_, index) => egg(14 + (index % perRow) * gap, 14 + Math.floor(index / perRow) * (gap + 2), size)).join('');
  return svgWrap(20 + perRow * gap, 20 + rows * (gap + 2), markup);
}

/**
 * Draws a division as sharing: the food heap, or the food shared fairly on the plates when solved.
 * @param {object} task - Task (dividend, divisor).
 * @param {boolean} isSolved - Whether the fair sharing is shown.
 * @returns {string} SVG markup.
 */
function sharingSvg(task, isSolved) {
  const [total, plates] = task.operands;
  const share = total / plates;
  const dinos = Array.from({ length: plates }, (_, index) => plateDino(6, 18 + index * 26)).join('');
  if (isSolved) {
    const pieces = Array.from({ length: total }, (_, index) => food(44 + (index % share) * 15, 18 + Math.floor(index / share) * 26)).join('');
    return svgWrap(60 + share * 15, 12 + plates * 26, dinos + pieces);
  }
  const heap = Array.from({ length: total }, (_, index) => food(60 + (index % 10) * 15, 18 + Math.floor(index / 10) * 16)).join('');
  return svgWrap(220, Math.max(12 + plates * 26, 30 + Math.ceil(total / 10) * 16), dinos + heap);
}

/**
 * Draws a small number line around a number (level 1 of journey 3).
 * @param {object} task - Number task.
 * @returns {string} SVG markup.
 */
function numberLineSvg(task) {
  const number = task.operands[0];
  const start = Math.max(0, Math.min(number - 5, 90));
  const marks = Array.from({ length: 11 }, (_, index) => {
    const value = start + index;
    const x = 14 + index * 26;
    const isTarget = value === number;
    return `<path d="M${x} 24 V${value % 10 === 0 ? 40 : 34}" stroke="#37474f" stroke-width="2"/>`
      + `<text x="${x}" y="56" class="math-aid__label${isTarget ? ' math-aid__label--target' : ''}">${value}</text>`;
  }).join('');
  return svgWrap(290, 64, `<path d="M6 30 H284" stroke="#37474f" stroke-width="3"/>${marks}`);
}

/**
 * Draws a missing-number task: before solving only the known operand and a question mark,
 * afterwards the full picture of the completed task.
 * @param {object} task - Missing-number task.
 * @param {string} aid - Aid type.
 * @param {boolean} isSolved - Whether the solution is shown.
 * @returns {string} SVG markup.
 */
function missingSvg(task, aid, isSolved) {
  const complete = { ...task, missingIndex: null };
  if (isSolved) return aidMarkup(complete, aid, true);
  const known = task.operands[1 - task.missingIndex];
  return known > 20 ? tensAndUnitsSvg([known], null) : quantitySvg(known);
}

/**
 * Returns the SVG markup of a task's picture.
 * @param {object} task - Task.
 * @param {string} aid - Aid type from the level profile.
 * @param {boolean} [isSolved=false] - Whether the solution is shown (sharing).
 * @returns {string} SVG markup.
 */
export function aidMarkup(task, aid, isSolved = false) {
  if (task.missingIndex !== null && task.missingIndex !== undefined) {
    return missingSvg(task, aid, isSolved);
  }
  if (task.operation === 'count' || task.operation === 'pickQuantity') return quantitySvg(task.operands[0]);
  if (aid === 'numberLine') return numberLineSvg(task);
  if (task.operation === 'multiply') return eggRowsSvg(task);
  if (task.operation === 'divide') return sharingSvg(task, isSolved);
  const isLarge = Math.max(...task.operands, task.answer) > 20;
  if (aid === 'tensAndUnits' || isLarge) return tensAndUnitsSvg(task.operands, task.operation === 'add' ? '+' : '-');
  return aid === 'tenFrame' ? tenFrameSvg(task) : insectSvg(task);
}

/**
 * Creates the picture element of a task.
 * @param {object} task - Task.
 * @param {string} aid - Aid type.
 * @param {boolean} [isSolved=false] - Whether the solution is shown.
 * @returns {HTMLElement} Picture element.
 */
export function createAid(task, aid, isSolved = false) {
  return el('div', { className: `math-aid math-aid--${aid}`, html: aidMarkup(task, aid, isSolved) });
}
