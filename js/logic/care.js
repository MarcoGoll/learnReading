/** The two needs of a dino and the care action that fills each (cleaning has no need bar). */
export const CARE_ACTIONS = { feed: 'hunger', play: 'fun' };

/** Decrease of each need per day (in percent points). */
export const DECREASE_PER_DAY = 33;

/** Increase of a need by one care action. */
export const ACTION_GAIN = 50;

/** Time after feeding until a poop pile appears. */
export const POOP_DELAY_MS = 3 * 60 * 60 * 1000;

/** Milliseconds per day. */
const DAY_MS = 24 * 60 * 60 * 1000;

/** Needs below this value change the dino's mood. */
const MOOD_THRESHOLD = 50;

/**
 * Returns the needs after the decrease since the last update.
 * A care state that was never updated (updatedAt 0) counts as freshly filled.
 * @param {object} care - Care state { hunger, fun, poopAt, updatedAt }.
 * @param {number} now - Current time in milliseconds.
 * @returns {{hunger: number, fun: number}} Current needs (0-100).
 */
export function currentNeeds(care, now) {
  const elapsedDays = care.updatedAt > 0 ? Math.max(0, now - care.updatedAt) / DAY_MS : 0;
  const decrease = elapsedDays * DECREASE_PER_DAY;
  const decreased = (value) => Math.max(0, Math.round(value - decrease));
  return { hunger: decreased(care.hunger), fun: decreased(care.fun) };
}

/**
 * Checks whether a poop pile lies next to the dino.
 * @param {object} care - Care state.
 * @param {number} now - Current time in milliseconds.
 * @returns {boolean} True if a pile is there.
 */
export function hasPoop(care, now) {
  return care.poopAt > 0 && now >= care.poopAt;
}

/**
 * Returns the poop time after an action: feeding schedules a pile (if none is pending), cleaning removes it.
 * @param {object} care - Care state.
 * @param {string} action - Care action.
 * @param {number} now - Current time in milliseconds.
 * @returns {number} New poopAt value (0 = none).
 */
function poopTimeAfter(care, action, now) {
  if (action === 'clean') return 0;
  const poopAt = care.poopAt || 0;
  return action === 'feed' && poopAt === 0 ? now + POOP_DELAY_MS : poopAt;
}

/**
 * Applies a care action: the decreased needs are stored, feeding and playing raise their need by 50,
 * feeding schedules a poop pile, and cleaning removes it.
 * @param {object} care - Care state.
 * @param {string} action - "feed", "play", or "clean".
 * @param {number} now - Current time in milliseconds.
 * @returns {object} New care state.
 */
export function applyCareAction(care, action, now) {
  const needs = currentNeeds(care, now);
  const need = CARE_ACTIONS[action];
  const raised = need ? { [need]: Math.min(100, needs[need] + ACTION_GAIN) } : {};
  return { ...needs, ...raised, poopAt: poopTimeAfter(care, action, now), updatedAt: now };
}

/**
 * Returns the suggested action: cleaning while a pile is there, otherwise the action for the lowest need.
 * @param {object} care - Care state.
 * @param {number} now - Current time in milliseconds.
 * @returns {string} Action name.
 */
export function suggestedAction(care, now) {
  if (hasPoop(care, now)) return 'clean';
  const needs = currentNeeds(care, now);
  return Object.entries(CARE_ACTIONS).sort(([, needA], [, needB]) => needs[needA] - needs[needB])[0][0];
}

/**
 * Returns the mood of a dino: dirty while a pile is there, otherwise from its lowest need.
 * @param {object} care - Care state.
 * @param {number} now - Current time in milliseconds.
 * @returns {string} "happy", "hungry", "bored", or "dirty".
 */
export function moodOf(care, now) {
  if (hasPoop(care, now)) return 'dirty';
  const needs = currentNeeds(care, now);
  const lowest = Object.entries({ hungry: needs.hunger, bored: needs.fun }).sort(([, valueA], [, valueB]) => valueA - valueB)[0];
  return lowest[1] < MOOD_THRESHOLD ? lowest[0] : 'happy';
}
