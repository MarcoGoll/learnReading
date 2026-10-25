import { el, button, wait } from './dom.js';
import { createDino } from './dino.js';
import { confetti } from './effects.js';
import { playSound } from '../audio/soundPlayer.js';

/** Texts shown after each evolution ({name} is replaced by the dino name). */
const STAGE_TEXTS = {
  1: '{name} ist geschlüpft!',
  2: '{name} macht die ersten Schritte!',
  3: '{name} hat das erste Insekt gefangen!',
  4: '{name} brüllt zum ersten Mal!',
  5: '{name} ist ausgewachsen!'
};

/** Small SVG props used by some scenes. */
const PROPS = {
  1: '<svg viewBox="0 0 100 40" class="evolution-scene__shell"><path d="M5 30 L20 5 L32 20 L45 4 L55 30 Z" fill="#fff8e1" stroke="#e0c98f" stroke-width="3"/><path d="M60 30 L70 8 L82 22 L95 6 L96 32 Z" fill="#fff8e1" stroke="#e0c98f" stroke-width="3"/></svg>',
  3: '<svg viewBox="0 0 60 40" class="evolution-scene__dragonfly"><ellipse cx="30" cy="22" rx="22" ry="4" fill="#26a69a"/><ellipse cx="22" cy="12" rx="10" ry="6" fill="#b2ebf2" opacity="0.8"/><ellipse cx="36" cy="12" rx="10" ry="6" fill="#b2ebf2" opacity="0.8"/><circle cx="52" cy="22" r="5" fill="#00796b"/></svg>',
  4: '<span class="evolution-scene__roar">Roooar!</span>'
};

/** Time after which a tap may end the scene early. */
const SKIP_DELAY_MS = 2000;

/** Total duration of a scene. */
const SCENE_DURATION_MS = 5500;

/**
 * Builds the overlay markup of a scene.
 * @param {number} stage - New stage.
 * @param {string} text - Caption.
 * @param {object} worn - Worn accessories.
 * @returns {{overlay: HTMLElement, stageArea: HTMLElement}} Elements.
 */
function buildOverlay(stage, text, worn) {
  const stageArea = el('div', { className: 'evolution-scene__stage' }, [
    createDino(stage - 1, worn, 'evolution-scene__old'),
    createDino(stage, worn, 'evolution-scene__new'),
    PROPS[stage] ? el('div', { className: 'evolution-scene__props', html: PROPS[stage] }) : null
  ]);
  const overlay = el('div', {
    className: `evolution-scene evolution-scene--stage-${stage}`,
    attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': text }
  }, [stageArea, el('p', { className: 'evolution-scene__text', text })]);
  return { overlay, stageArea };
}

/**
 * Plays the full-screen evolution scene of a new stage.
 * @param {number} stage - New stage (1-5).
 * @param {string} dinoName - Name of the dino.
 * @param {object} worn - Worn accessories.
 * @returns {Promise<void>} Resolves when the scene ends.
 */
export function playEvolutionScene(stage, dinoName, worn) {
  const text = STAGE_TEXTS[stage].replace('{name}', dinoName || 'Dein Dino');
  const { overlay } = buildOverlay(stage, text, worn);
  document.getElementById('overlay-root').append(overlay);
  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        overlay.remove();
        resolve();
      }
    };
    runSceneTimeline(overlay, stage, finish);
  });
}

/**
 * Runs the timed steps of a scene: change, sound, effects, and the continue button.
 * @param {HTMLElement} overlay - Scene overlay.
 * @param {number} stage - New stage.
 * @param {Function} finish - Ends the scene.
 */
async function runSceneTimeline(overlay, stage, finish) {
  await wait(1400);
  overlay.classList.add('evolution-scene--changed');
  playSound(`evolution${stage}`);
  if (stage === 5) {
    confetti(120);
  }
  await wait(SKIP_DELAY_MS - 1400 + 600);
  overlay.addEventListener('click', finish);
  overlay.append(button({ className: 'big-button evolution-scene__continue', iconName: 'arrow_forward', label: 'Weiter', onClick: finish }));
  await wait(SCENE_DURATION_MS);
  finish();
}
