import { el, button, wait, restartAnimation } from '../components/dom.js';
import { createDino } from '../components/dino.js';
import { POOP_SVG, createCareBars } from '../components/careBars.js';
import { burstStars } from '../components/effects.js';
import { currentNeeds, applyCareAction, suggestedAction } from '../logic/care.js';
import { activeJourney, activeJourneyDef } from '../state/journeyState.js';
import { store } from '../state/store.js';
import { playSound } from '../audio/soundPlayer.js';

/** Care actions with icon and label. */
const ACTIONS = [
  { action: 'feed', iconName: 'restaurant', label: 'Füttern' },
  { action: 'play', iconName: 'sports_baseball', label: 'Spielen' },
  { action: 'clean', iconName: 'cleaning_services', label: 'Sauber machen' }
];

/** Small props flying to the dino for each action. */
const PROPS = {
  feed: '<svg viewBox="0 0 40 40"><path d="M20 4 Q36 10 30 30 Q20 38 10 30 Q4 10 20 4 Z" fill="#66bb6a"/><path d="M20 6 V32" stroke="#2e7d32" stroke-width="2"/><circle cx="30" cy="8" r="6" fill="#e53935"/></svg>',
  play: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#ff7043"/><path d="M6 16 Q20 24 34 16 M8 28 Q20 20 32 28" stroke="#fff" stroke-width="3" fill="none"/></svg>',
  clean: '<svg viewBox="0 0 40 40"><path d="M28 2 L18 22" stroke="#8d6e63" stroke-width="4" stroke-linecap="round"/><path d="M10 20 h18 l-4 16 h-18 Z" fill="#ffca28"/></svg>'
};

/** Duration of a care animation. */
const ANIMATION_MS = 2400;

/**
 * Plays the animation of a care action on the stage.
 * @param {HTMLElement} stage - Stage with the dino.
 * @param {string} action - Care action.
 */
async function animateAction(stage, action) {
  const prop = el('span', { className: `care__prop care__prop--${action}`, html: PROPS[action] });
  stage.append(prop);
  playSound('reward');
  const poop = stage.querySelector('.care__poop-wrap');
  if (action === 'clean' && poop) {
    poop.classList.add('care__poop-wrap--gone');
  }
  await wait(900);
  restartAnimation(stage.querySelector('.dino'), 'dino--cheer');
  burstStars(stage.querySelector('.dino'), 8);
  await wait(ANIMATION_MS - 900);
}

/**
 * Builds one action button; the suggested action pulses.
 * @param {object} definition - Action definition.
 * @param {boolean} isSuggested - Whether this is the suggested action.
 * @param {Function} onChoose - Called with the action.
 * @returns {HTMLButtonElement} Button.
 */
function actionButton(definition, isSuggested, onChoose) {
  return button({
    className: `care__action${isSuggested ? ' care__action--suggested' : ''}`,
    iconName: definition.iconName,
    label: definition.label,
    onClick: () => onChoose(definition.action)
  });
}

/**
 * Builds the status area with the three need bars of the active dino.
 * @param {object} care - Care state of the dino.
 * @returns {HTMLElement} Status element.
 */
function careStatus(care) {
  return el('div', { className: 'care__status' }, [createCareBars(care)]);
}

/**
 * Shows the care screen after a round: the child sees the current needs and feeds, plays with,
 * or cleans up after the active dino. A poop pile stays next to a dirty dino until it is cleaned.
 * @param {HTMLElement} container - Screen container.
 * @returns {Promise<void>} Resolves after the chosen action's animation.
 */
export function showCareScreen(container) {
  const state = store.getState();
  const journey = activeJourney(state);
  const needs = currentNeeds(journey.care, Date.now());
  const suggestion = suggestedAction(needs);
  const stage = el('div', { className: 'care__stage' }, [createDino(activeJourneyDef(state).species, journey.dinoStage, journey.worn)]);
  if (needs.clean < 50) stage.append(el('span', { className: 'care__poop-wrap', html: POOP_SVG }));
  let status = careStatus(journey.care);
  return new Promise((resolve) => {
    let isDone = false;
    const choose = async (action) => {
      if (isDone) return;
      isDone = true;
      store.updateState((current) => { activeJourney(current).care = applyCareAction(activeJourney(current).care, action, Date.now()); });
      const updatedStatus = careStatus(activeJourney(store.getState()).care);
      status.replaceWith(updatedStatus);
      status = updatedStatus;
      buttons.querySelectorAll('button').forEach((element) => { element.disabled = true; });
      await animateAction(stage, action);
      resolve();
    };
    const buttons = el('div', { className: 'care__actions' }, ACTIONS.map((definition) => actionButton(definition, definition.action === suggestion, choose)));
    container.replaceChildren(el('section', { className: 'care card' }, [
      el('h2', { className: 'care__title', text: `Was braucht ${journey.dinoName} jetzt?` }), status, stage, buttons
    ]));
  });
}
