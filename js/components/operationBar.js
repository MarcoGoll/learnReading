import { el } from './dom.js';
import { createDino } from './dino.js';
import { journeysOfSubject } from '../data/journeys.js';

/** Operation signs drawn as SVG, so the small dot and colon stay clearly visible. */
const SIGN_MARKUP = {
  add: '<path d="M20 6 V34 M6 20 H34"/>',
  subtract: '<path d="M6 20 H34"/>',
  multiply: '<circle cx="20" cy="20" r="5"/>',
  divide: '<circle cx="20" cy="9" r="5"/><circle cx="20" cy="31" r="5"/>'
};

/** Spoken names of the operations (button labels for screen readers). */
const OPERATION_NAMES = { add: 'Plus', subtract: 'Minus', multiply: 'Mal', divide: 'Geteilt' };

/**
 * Creates the bar of the math world with one large button per operation dino (+, -, ·, :).
 * @param {object} state - Game state.
 * @param {Function} onSelect - Called with the chosen journey id (only when it differs from the active one).
 * @returns {HTMLElement} Bar.
 */
export function createOperationBar(state, onSelect) {
  return el('nav', { className: 'operation-bar', attrs: { 'aria-label': 'Rechen-Dinos' } }, journeysOfSubject('math').map((definition) => {
    const journey = state.journeys[definition.id];
    const isActive = state.activeJourney === definition.id;
    const button = el('button', {
      className: `operation-bar__button${isActive ? ' operation-bar__button--active' : ''}`,
      attrs: { type: 'button', 'aria-pressed': String(isActive), 'aria-label': `${OPERATION_NAMES[definition.operation]}-Dino` }
    }, [
      el('span', { className: 'operation-bar__sign', html: `<svg viewBox="0 0 40 40" aria-hidden="true">${SIGN_MARKUP[definition.operation]}</svg>` }),
      createDino(definition.species, journey.started ? journey.dinoStage : 0, journey.worn, 'operation-bar__dino')
    ]);
    button.addEventListener('click', () => { if (!isActive) onSelect(definition.id); });
    return button;
  }));
}
