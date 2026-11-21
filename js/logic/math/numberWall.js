import { shuffle } from '../random.js';

/** Brick indices of a 3-row wall: bottom 0-2, middle 3-4, top 5. Each upper brick sums the two below. */
export const WALL_SUMS = { 3: [0, 1], 4: [1, 2], 5: [3, 4] };

/** Gap patterns that can be solved step by step (all need at least one subtraction or addition). */
const GAP_PATTERNS = [
  [3, 4, 5], [0, 4, 5], [2, 3, 5], [1, 5], [0, 4], [2, 3], [3, 5], [4, 5], [0, 2, 5], [1, 3]
];

/** Walls per round. */
export const WALLS_PER_ROUND = 4;

/**
 * Computes all bricks of a wall from its three bottom bricks.
 * @param {Array<number>} bottom - Three bottom bricks.
 * @returns {Array<number>} Six bricks.
 */
export function wallFromBottom(bottom) {
  const [first, second, third] = bottom;
  const middleLeft = first + second;
  const middleRight = second + third;
  return [first, second, third, middleLeft, middleRight, middleLeft + middleRight];
}

/**
 * Tries to fill the gaps step by step from the known bricks.
 * @param {Array<number|null>} bricks - Bricks with null for gaps.
 * @returns {Array<number|null>} Bricks after propagation.
 */
function propagate(bricks) {
  const result = [...bricks];
  let changed = true;
  while (changed) {
    changed = false;
    Object.entries(WALL_SUMS).forEach(([upper, [left, right]]) => {
      const values = [result[upper], result[left], result[right]];
      const missing = values.filter((value) => value === null).length;
      if (missing !== 1) return;
      if (result[upper] === null) result[upper] = result[left] + result[right];
      else if (result[left] === null) result[left] = result[upper] - result[right];
      else result[right] = result[upper] - result[left];
      changed = true;
    });
  }
  return result;
}

/**
 * Checks whether every gap of a wall can be computed from the known bricks.
 * @param {{bricks: Array<number>, gaps: Array<number>}} wall - Wall.
 * @returns {boolean} True if solvable without guessing.
 */
export function isWallSolvable(wall) {
  const withGaps = wall.bricks.map((brick, index) => (wall.gaps.includes(index) ? null : brick));
  return propagate(withGaps).every((brick, index) => brick === wall.bricks[index]);
}

/**
 * Creates a random wall whose top brick (a + 2b + c) does not exceed the limit.
 * @param {number} maxTop - Largest allowed top brick (20 or 100).
 * @param {Function} [randomFn=Math.random] - Random source.
 * @returns {{bricks: Array<number>, gaps: Array<number>}} Wall.
 */
export function createWall(maxTop, randomFn = Math.random) {
  const randomUpTo = (max) => 1 + Math.floor(randomFn() * Math.max(1, max));
  const second = randomUpTo(Math.floor((maxTop - 2) / 4));
  const first = randomUpTo(maxTop - 2 * second - 1);
  const third = randomUpTo(maxTop - 2 * second - first);
  const bricks = wallFromBottom([first, second, third]);
  const gaps = shuffle(GAP_PATTERNS, randomFn).find((pattern) => isWallSolvable({ bricks, gaps: pattern }));
  return { bricks, gaps: [...gaps].sort((left, right) => left - right) };
}

/**
 * Creates the walls of a round.
 * @param {number} maxTop - Largest top brick.
 * @param {Function} [randomFn=Math.random] - Random source.
 * @returns {Array<object>} Walls.
 */
export function createWallRound(maxTop, randomFn = Math.random) {
  return Array.from({ length: WALLS_PER_ROUND }, () => createWall(maxTop, randomFn));
}

/**
 * Returns the history key of a gap brick.
 * @param {object} wall - Wall.
 * @param {number} gapIndex - Brick index.
 * @returns {string} Key.
 */
export function wallHistoryKey(wall, gapIndex) {
  return `math:wall:${wall.bricks.slice(0, 3).join('-')}:${gapIndex}`;
}

/**
 * Returns the spoken text of a gap brick, e.g. "8 plus wie viel ist 13?". For a lower brick the
 * sum is preferred whose other bricks are visible.
 * @param {object} wall - Wall.
 * @param {number} index - Gap index.
 * @returns {string} Text.
 */
export function brickSpeech(wall, index) {
  const { bricks, gaps } = wall;
  if (WALL_SUMS[index]) {
    const [left, right] = WALL_SUMS[index];
    return `${bricks[left]} plus ${bricks[right]}`;
  }
  const sums = Object.entries(WALL_SUMS).filter(([, pair]) => pair.includes(index));
  const visible = sums.find(([upper, pair]) => !gaps.includes(Number(upper)) && !pair.some((brick) => brick !== index && gaps.includes(brick)));
  const [upper, [left, right]] = visible || sums[0];
  const other = index === left ? right : left;
  return `${bricks[other]} plus wie viel ist ${bricks[upper]}?`;
}
