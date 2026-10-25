import { el, restartAnimation } from './dom.js';
import { getSvg, getSvgInner } from './svgLoader.js';
import { REWARDS } from '../data/rewards.js';

/** Highest dino stage. */
export const MAX_STAGE = 5;

/**
 * Returns the SVG path of a dino stage.
 * @param {number} stage - Stage 0-5.
 * @returns {string} Path.
 */
export function dinoPath(stage) {
  return `assets/svg/dino/stage-${stage}.svg`;
}

/**
 * Returns the SVG path of an accessory.
 * @param {string} rewardId - Reward id.
 * @returns {string} Path.
 */
export function accessoryPath(rewardId) {
  return `assets/svg/accessories/${rewardId}.svg`;
}

/**
 * Returns all SVG paths needed by dino and accessories (for preloading).
 * @returns {Array<string>} Paths.
 */
export function dinoAssetPaths() {
  const stages = Array.from({ length: MAX_STAGE + 1 }, (_, stage) => dinoPath(stage));
  return [...stages, ...REWARDS.map((reward) => accessoryPath(reward.id))];
}

/**
 * Places the worn accessories into the anchor groups of a dino element.
 * @param {HTMLElement} dinoElement - Element containing the dino SVG.
 * @param {object} worn - Worn accessories by slot.
 */
export function applyAccessories(dinoElement, worn) {
  ['head', 'eyes', 'neck'].forEach((slot) => {
    const anchor = dinoElement.querySelector(`.dino__anchor--${slot}`);
    if (anchor) {
      anchor.innerHTML = worn && worn[slot] ? getSvgInner(accessoryPath(worn[slot])) : '';
    }
  });
}

/**
 * Creates a dino element of a stage with its idle animation and accessories.
 * @param {number} stage - Stage 0-5.
 * @param {object} worn - Worn accessories by slot.
 * @param {string} [extraClass] - Additional CSS classes.
 * @returns {HTMLElement} Dino element.
 */
export function createDino(stage, worn, extraClass = '') {
  const dinoElement = el('div', {
    className: `dino dino--stage-${stage} ${extraClass}`.trim(),
    html: getSvg(dinoPath(stage)),
    attrs: { role: 'img', 'aria-label': `Dino Stufe ${stage}` }
  });
  applyAccessories(dinoElement, worn);
  return dinoElement;
}

/**
 * Renders a dino into a container, replacing its content.
 * @param {HTMLElement} container - Target container.
 * @param {number} stage - Stage 0-5.
 * @param {object} worn - Worn accessories by slot.
 * @returns {HTMLElement} Dino element.
 */
export function renderDino(container, stage, worn) {
  const dinoElement = createDino(stage, worn);
  container.replaceChildren(dinoElement);
  return dinoElement;
}

/**
 * Creates the small companion dino shown during levels.
 * @param {HTMLElement} container - Target container.
 * @param {number} stage - Stage 0-5.
 * @param {object} worn - Worn accessories by slot.
 * @returns {{react: Function, destroy: Function}} Companion API.
 */
export function createCompanionDino(container, stage, worn) {
  const dinoElement = createDino(stage, worn, 'dino--companion');
  container.append(dinoElement);
  return {
    react(kind) {
      dinoElement.classList.remove('dino--cheer', 'dino--puzzled');
      restartAnimation(dinoElement, kind === 'correct' ? 'dino--cheer' : 'dino--puzzled');
    },
    destroy() {
      dinoElement.remove();
    }
  };
}
