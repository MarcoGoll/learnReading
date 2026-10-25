import { el, button, wait } from './dom.js';
import { createDino } from './dino.js';
import { confetti } from './effects.js';
import { playSound } from '../audio/soundPlayer.js';

/** Texts per species and stage ({name} is replaced by the dino name). */
const STAGE_TEXTS = {
  trex: { 1: '{name} ist geschlüpft!', 2: '{name} macht die ersten Schritte!', 3: '{name} hat das erste Insekt gefangen!', 4: '{name} brüllt zum ersten Mal!', 5: '{name} ist ausgewachsen!' },
  triceratops: { 1: '{name} ist geschlüpft!', 2: '{name} macht die ersten Schritte!', 3: '{name} schiebt mit den Hörnern einen Ast weg!', 4: '{name} räumt einen Stein aus dem Weg!', 5: '{name} ist ausgewachsen!' },
  longneck: { 1: '{name} ist geschlüpft!', 2: '{name} macht die ersten Schritte!', 3: '{name} frisst Blätter ganz oben vom Baum!', 4: '{name} watet durch einen See!', 5: '{name} ist ausgewachsen!' },
  pterosaur: { 1: '{name} ist geschlüpft!', 2: '{name} schlägt mit den Flügeln!', 3: '{name} fliegt zum ersten Mal!', 4: '{name} fängt einen Fisch!', 5: '{name} ist ausgewachsen!' }
};

/** Small SVG props: egg shell, dragonfly, branch, stone, leaves, waves, fish, roar text. */
const PROP_MARKUP = {
  shell: '<svg viewBox="0 0 100 40" class="evolution-scene__shell"><path d="M5 30 L20 5 L32 20 L45 4 L55 30 Z" fill="#fff8e1" stroke="#e0c98f" stroke-width="3"/><path d="M60 30 L70 8 L82 22 L95 6 L96 32 Z" fill="#fff8e1" stroke="#e0c98f" stroke-width="3"/></svg>',
  dragonfly: '<svg viewBox="0 0 60 40" class="evolution-scene__flyer"><ellipse cx="30" cy="22" rx="22" ry="4" fill="#26a69a"/><ellipse cx="22" cy="12" rx="10" ry="6" fill="#b2ebf2" opacity="0.8"/><ellipse cx="36" cy="12" rx="10" ry="6" fill="#b2ebf2" opacity="0.8"/><circle cx="52" cy="22" r="5" fill="#00796b"/></svg>',
  roar: '<span class="evolution-scene__roar">Roooar!</span>',
  branch: '<svg viewBox="0 0 120 40" class="evolution-scene__pushed"><path d="M5 25 L110 20" stroke="#795548" stroke-width="10" stroke-linecap="round"/><path d="M40 22 q10 -18 24 -16 M80 21 q8 -14 22 -12" stroke="#795548" stroke-width="5" fill="none"/><ellipse cx="66" cy="6" rx="10" ry="5" fill="#66bb6a"/><ellipse cx="104" cy="9" rx="10" ry="5" fill="#66bb6a"/></svg>',
  stone: '<svg viewBox="0 0 80 60" class="evolution-scene__pushed"><path d="M6 56 Q2 20 30 12 Q60 4 74 30 Q80 56 60 58 Z" fill="#9e9e9e"/><path d="M24 30 q10 -6 20 0" stroke="#757575" stroke-width="4" fill="none"/></svg>',
  leaves: '<svg viewBox="0 0 120 60" class="evolution-scene__treetop"><ellipse cx="60" cy="30" rx="58" ry="28" fill="#43a047"/><ellipse cx="30" cy="24" rx="20" ry="12" fill="#66bb6a"/><ellipse cx="88" cy="22" rx="18" ry="11" fill="#66bb6a"/></svg>',
  lake: '<svg viewBox="0 0 200 50" class="evolution-scene__lake"><ellipse cx="100" cy="30" rx="98" ry="20" fill="#4fc3f7"/><path d="M30 28 q10 -6 20 0 t20 0 M110 34 q10 -6 20 0 t20 0" stroke="#e1f5fe" stroke-width="3" fill="none"/></svg>',
  fish: '<svg viewBox="0 0 60 30" class="evolution-scene__flyer"><ellipse cx="26" cy="15" rx="20" ry="10" fill="#ff9800"/><path d="M44 15 L58 4 L58 26 Z" fill="#fb8c00"/><circle cx="16" cy="12" r="2.5" fill="#263238"/></svg>',
  cloud: '<svg viewBox="0 0 120 50" class="evolution-scene__cloud"><ellipse cx="60" cy="32" rx="52" ry="16" fill="#fff"/><ellipse cx="44" cy="22" rx="22" ry="16" fill="#fff"/><ellipse cx="76" cy="20" rx="20" ry="14" fill="#fff"/></svg>'
};

/** Props per species and stage. */
const SCENE_PROPS = {
  trex: { 1: ['shell'], 3: ['dragonfly'], 4: ['roar'] },
  triceratops: { 1: ['shell'], 3: ['branch'], 4: ['stone'] },
  longneck: { 1: ['shell'], 3: ['leaves'], 4: ['lake'] },
  pterosaur: { 1: ['shell'], 3: ['cloud'], 4: ['fish'] }
};

/** Time after which a tap may end the scene early. */
const SKIP_DELAY_MS = 2000;

/** Total duration of a scene. */
const SCENE_DURATION_MS = 5500;

/**
 * Builds the overlay markup of a scene.
 * @param {string} species - Species id.
 * @param {number} stage - New stage.
 * @param {string} text - Caption.
 * @param {object} worn - Worn accessories.
 * @returns {HTMLElement} Overlay.
 */
function buildOverlay(species, stage, text, worn) {
  const props = (SCENE_PROPS[species][stage] || []).map((name) => PROP_MARKUP[name]).join('');
  const stageArea = el('div', { className: 'evolution-scene__stage' }, [
    createDino(species, stage - 1, worn, 'evolution-scene__old'),
    createDino(species, stage, worn, 'evolution-scene__new'),
    props ? el('div', { className: 'evolution-scene__props', html: props }) : null
  ]);
  return el('div', {
    className: `evolution-scene evolution-scene--${species} evolution-scene--stage-${stage}`,
    attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': text }
  }, [stageArea, el('p', { className: 'evolution-scene__text', text })]);
}

/**
 * Returns the sound event of an evolution.
 * @param {string} species - Species id.
 * @param {number} stage - New stage.
 * @returns {string} Sound event name.
 */
function sceneSound(species, stage) {
  return species === 'pterosaur' && (stage === 2 || stage === 3) ? 'whoosh' : `evolution${stage}`;
}

/**
 * Plays the full-screen evolution scene of a new stage.
 * @param {string} species - Species id.
 * @param {number} stage - New stage (1-5).
 * @param {string} dinoName - Name of the dino.
 * @param {object} worn - Worn accessories.
 * @returns {Promise<void>} Resolves when the scene ends.
 */
export function playEvolutionScene(species, stage, dinoName, worn) {
  const text = STAGE_TEXTS[species][stage].replace('{name}', dinoName || 'Dein Dino');
  const overlay = buildOverlay(species, stage, text, worn);
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
    runSceneTimeline(overlay, species, stage, finish);
  });
}

/**
 * Runs the timed steps of a scene: change, sound, effects, and the continue button.
 * @param {HTMLElement} overlay - Scene overlay.
 * @param {string} species - Species id.
 * @param {number} stage - New stage.
 * @param {Function} finish - Ends the scene.
 */
async function runSceneTimeline(overlay, species, stage, finish) {
  await wait(1400);
  overlay.classList.add('evolution-scene--changed');
  playSound(sceneSound(species, stage));
  if (stage === 5) {
    confetti(120);
  }
  await wait(SKIP_DELAY_MS - 1400 + 600);
  overlay.addEventListener('click', finish);
  overlay.append(button({ className: 'big-button evolution-scene__continue', iconName: 'arrow_forward', label: 'Weiter', onClick: finish }));
  await wait(SCENE_DURATION_MS);
  finish();
}
