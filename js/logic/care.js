/** The three needs of a dino and the care action that fills each. */
export const CARE_ACTIONS = { feed: 'hunger', play: 'fun', clean: 'clean' };

/** Decrease of each need per day (in percent points). */
export const DECREASE_PER_DAY = 33;

/** Increase of a need by one care action. */
export const ACTION_GAIN = 50;

/** Milliseconds per day. */
const DAY_MS = 24 * 60 * 60 * 1000;

/** Needs below this value change the dino's mood. */
const MOOD_THRESHOLD = 50;

/**
 * Returns the needs after the decrease since the last update.
 * A care state that was never updated (updatedAt 0) counts as freshly filled.
 * @param {object} care - Care state { hunger, fun, clean, updatedAt }.
 * @param {number} now - Current time in milliseconds.
 * @returns {{hunger: number, fun: number, clean: number}} Current needs (0-100).
 */
export function currentNeeds(care, now) {
  const elapsedDays = care.updatedAt > 0 ? Math.max(0, now - care.updatedAt) / DAY_MS : 0;
  const decrease = elapsedDays * DECREASE_PER_DAY;
  const decreased = (value) => Math.max(0, Math.round(value - decrease));
  return { hunger: decreased(care.hunger), fun: decreased(care.fun), clean: decreased(care.clean) };
}

/**
 * Applies a care action: the decreased needs are stored and the action's need rises by 50.
 * @param {object} care - Care state.
 * @param {string} action - "feed", "play", or "clean".
 * @param {number} now - Current time in milliseconds.
 * @returns {object} New care state.
 */
export function applyCareAction(care, action, now) {
  const needs = currentNeeds(care, now);
  const need = CARE_ACTIONS[action];
  return { ...needs, [need]: Math.min(100, needs[need] + ACTION_GAIN), updatedAt: now };
}

/**
 * Returns the action for the lowest need (suggested to the child).
 * @param {object} needs - Current needs.
 * @returns {string} Action name.
 */
export function suggestedAction(needs) {
  return Object.entries(CARE_ACTIONS)
    .sort(([, needA], [, needB]) => needs[needA] - needs[needB])[0][0];
}

/**
 * Returns the mood of a dino from its needs.
 * @param {object} needs - Current needs.
 * @returns {string} "happy", "hungry", "bored", or "dirty".
 */
export function moodOf(needs) {
  const lowest = Object.entries({ hungry: needs.hunger, bored: needs.fun, dirty: needs.clean })
    .sort(([, valueA], [, valueB]) => valueA - valueB)[0];
  return lowest[1] < MOOD_THRESHOLD ? lowest[0] : 'happy';
}
