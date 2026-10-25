import { el, icon } from './dom.js';
import { currentNeeds, moodOf } from '../logic/care.js';

/** Icons and labels of the three needs. */
const NEEDS = [
  { key: 'hunger', iconName: 'restaurant', label: 'Satt' },
  { key: 'fun', iconName: 'sports_baseball', label: 'Spaß' },
  { key: 'clean', iconName: 'cleaning_services', label: 'Sauber' }
];

/** Small poop pile shown next to a dino with a dirty nest. */
export const POOP_SVG = '<svg viewBox="0 0 60 50" class="care__poop" aria-hidden="true"><path d="M8 46 Q4 36 16 34 Q12 24 24 22 Q22 12 32 10 Q36 4 38 12 Q48 14 44 24 Q56 26 52 36 Q60 46 48 46 Z" fill="#8d6e63"/><circle cx="24" cy="32" r="2.5" fill="#fff"/><circle cx="34" cy="32" r="2.5" fill="#fff"/><path d="M24 39 Q29 43 34 39" stroke="#fff" stroke-width="2" fill="none"/><path d="M14 12 q2 -6 0 -10 M48 10 q2 -6 0 -10" stroke="#9e9e9e" stroke-width="2" fill="none"/></svg>';

/** Short texts for the mood of a dino. */
const MOOD_TEXTS = { happy: 'ist glücklich', hungry: 'hat Hunger', bored: 'ist langweilig', dirty: 'braucht ein sauberes Nest' };

/**
 * Creates the three care bars of a dino (hunger, fun, cleanliness).
 * @param {object} care - Care state of the dino.
 * @param {number} [now=Date.now()] - Current time.
 * @returns {HTMLElement} Bars element.
 */
export function createCareBars(care, now = Date.now()) {
  const needs = currentNeeds(care, now);
  return el('div', { className: 'care-bars', attrs: { 'aria-label': 'Wie geht es deinem Dino?' } }, NEEDS.map((need) => {
    const fill = el('span', { className: `care-bars__fill${needs[need.key] < 50 ? ' care-bars__fill--low' : ''}` });
    fill.style.width = `${needs[need.key]}%`;
    return el('div', { className: 'care-bars__row', attrs: { title: `${need.label}: ${needs[need.key]} %` } }, [
      icon(need.iconName, 'care-bars__icon'),
      el('span', { className: 'care-bars__bar' }, [fill])
    ]);
  }));
}

/**
 * Returns the mood text of a dino, e.g. "Rexi hat Hunger".
 * @param {string} name - Dino name.
 * @param {object} care - Care state.
 * @param {number} [now=Date.now()] - Current time.
 * @returns {string} Text.
 */
export function moodText(name, care, now = Date.now()) {
  return `${name} ${MOOD_TEXTS[moodOf(currentNeeds(care, now))]}`;
}

/**
 * Adds mood decorations to a dino container: poop pile for a dirty nest, mood class for animations.
 * @param {HTMLElement} container - Element that contains the dino (gets position relative).
 * @param {object} care - Care state.
 * @param {number} [now=Date.now()] - Current time.
 */
export function decorateMood(container, care, now = Date.now()) {
  const mood = moodOf(currentNeeds(care, now));
  container.classList.add('care__host', `care__host--${mood}`);
  if (mood === 'dirty' || currentNeeds(care, now).clean < 50) {
    container.append(el('span', { className: 'care__poop-wrap', html: POOP_SVG }));
  }
}
