import { el, wait } from '../../components/dom.js';
import { bounce, wiggle, burstStars, flyPoints } from '../../components/effects.js';
import { createNumberPad } from '../../components/numberPad.js';
import { createWallRound, wallHistoryKey, brickSpeech } from '../../logic/math/numberWall.js';
import { mathBasePoints } from '../../logic/math/mathLevelGoals.js';
import { createRoundSession } from '../../logic/roundSession.js';
import { playSound } from '../../audio/soundPlayer.js';
import { store } from '../../state/store.js';
import { createLevelLayout } from '../../game/levelLayout.js';
import { createTaskSpeakerButton, readAloudAfterWrong } from '../../game/readAloud.js';
import { halfRuleResult } from './variantResult.js';

/** Brick indices per row, top row first. */
const ROWS = [[5], [3, 4], [0, 1, 2]];

/** Pause after a finished wall. */
const WALL_DONE_MS = 1200;

/**
 * Creates the brick elements of a wall; gap bricks can be tapped to become active.
 * @param {object} context - Variant context.
 * @returns {HTMLElement} Wall element.
 */
function wallElement(context) {
  const { wall } = context;
  context.bricks = new Map();
  return el('div', { className: 'number-wall' }, ROWS.map((row) => el('div', { className: 'number-wall__row' }, row.map((index) => {
    const isGap = wall.gaps.includes(index);
    const brick = el('button', {
      className: `number-wall__brick${isGap ? ' number-wall__brick--gap' : ''}`,
      text: isGap ? '?' : String(wall.bricks[index]),
      attrs: { type: 'button' }
    });
    brick.disabled = !isGap;
    brick.addEventListener('click', () => activate(context, index));
    context.bricks.set(index, brick);
    return brick;
  }))));
}

/**
 * Makes a gap brick the active one (the number pad fills it).
 * @param {object} context - Variant context.
 * @param {number} index - Brick index.
 */
function activate(context, index) {
  if (context.locked || !context.open.includes(index)) return;
  context.active = index;
  context.attempt = 1;
  context.bricks.forEach((brick, brickIndex) => brick.classList.toggle('number-wall__brick--active', brickIndex === index));
  context.pad.clear();
}

/**
 * Shows the next wall of the round or finishes the round.
 * @param {object} context - Variant context.
 */
function showWall(context) {
  context.wall = context.walls[context.wallIndex];
  if (!context.wall) {
    context.pad.destroy();
    context.finish(halfRuleResult(context.session, context.solved, context.gapCount));
    return;
  }
  context.open = [...context.wall.gaps];
  context.wallArea.replaceChildren(wallElement(context));
  activate(context, context.open[0]);
}

/**
 * Checks the entered value of the active brick.
 * @param {object} context - Variant context.
 * @param {number} value - Entered number.
 */
async function submit(context, value) {
  if (context.locked || context.active === null) return;
  const index = context.active;
  const brick = context.bricks.get(index);
  if (value === context.wall.bricks[index]) {
    rewardBrick(context, index, brick);
  } else if (context.attempt === 1) {
    context.attempt = 2;
    playSound('wrong');
    wiggle(brick);
    context.pad.clear();
    return;
  } else {
    await failBrick(context, index, brick);
  }
  await closeBrick(context, index);
}

/**
 * Records a solved brick with full points (first attempt) or half points (second attempt).
 * @param {object} context - Variant context.
 * @param {number} index - Brick index.
 * @param {HTMLElement} brick - Brick element.
 */
function rewardBrick(context, index, brick) {
  const base = mathBasePoints(7);
  const key = wallHistoryKey(context.wall, index);
  const result = context.attempt === 1
    ? context.session.record(key, 'correct', { base })
    : context.session.record(key, 'wrong', { consolationPoints: base / 2 });
  context.solved += 1;
  brick.classList.add('number-wall__brick--solved');
  playSound('correct');
  bounce(brick);
  burstStars(brick);
  flyPoints(brick, context.layout.scoreBoard.scoreElement, result.points);
  context.layout.companion.react('correct');
}

/**
 * Records a failed brick and shows its value (read aloud when enabled).
 * @param {object} context - Variant context.
 * @param {number} index - Brick index.
 * @param {HTMLElement} brick - Brick element.
 */
async function failBrick(context, index, brick) {
  context.locked = true;
  context.session.record(wallHistoryKey(context.wall, index), 'wrong');
  playSound('wrong');
  context.layout.companion.react('wrong');
  brick.classList.add('number-wall__brick--shown');
  brick.textContent = String(context.wall.bricks[index]);
  await readAloudAfterWrong(`Die Lösung ist ${context.wall.bricks[index]}.`);
  context.locked = false;
}

/**
 * Fills a brick with its value and moves on to the next gap or wall.
 * @param {object} context - Variant context.
 * @param {number} index - Finished brick index.
 */
async function closeBrick(context, index) {
  const brick = context.bricks.get(index);
  brick.textContent = String(context.wall.bricks[index]);
  brick.disabled = true;
  brick.classList.remove('number-wall__brick--active');
  context.open = context.open.filter((gap) => gap !== index);
  context.active = null;
  context.layout.scoreBoard.update(context.session.roundScore(), context.session.streak());
  if (context.open.length > 0) {
    activate(context, context.open[0]);
    return;
  }
  context.locked = true;
  await wait(WALL_DONE_MS);
  context.locked = false;
  context.wallIndex += 1;
  showWall(context);
}

/** Level 7 variant: number walls (each brick is the sum of the two bricks below). */
export const numberWallVariant = {
  id: 'numberWall',
  title: 'Rechenmauer',
  picture: 'numberWall',

  /**
   * Runs one round of four number walls.
   * @param {HTMLElement} container - Screen container.
   * @param {{challenge: object}} variantContext - Variant context.
   * @param {Function} finish - Called with the round result.
   * @returns {Function} Cleanup function.
   */
  run(container, { challenge }, finish) {
    const layout = createLevelLayout(container, { title: 'Rechenmauer', recordLevel: 7, goalLevel: 7 });
    const walls = createWallRound(challenge.wallMax, Math.random, challenge.wallMode);
    const context = { layout, walls, finish, wallIndex: 0, solved: 0, gapCount: walls.reduce((sum, wall) => sum + wall.gaps.length, 0), active: null, locked: false };
    context.session = createRoundSession({ level: 7, updateState: store.updateState });
    context.pad = createNumberPad({ onSubmit: (value) => submit(context, value) });
    context.wallArea = el('div', { className: 'math-variant__wall' });
    const speaker = createTaskSpeakerButton(() => (context.active === null ? null : brickSpeech(context.wall, context.active)));
    layout.stage.replaceChildren(el('div', { className: 'math-task card' }, [el('div', { className: 'math-variant__tools' }, [speaker]), context.wallArea, context.pad.element]));
    showWall(context);
    return () => { context.locked = true; context.pad.destroy(); };
  }
};
