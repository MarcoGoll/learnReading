import { journeyById, nextJourney, JOURNEYS } from '../data/journeys.js';

/**
 * Returns the progress of the active journey (the dino the child currently plays with).
 * @param {object} state - Game state.
 * @returns {object} Journey state.
 */
export function activeJourney(state) {
  return state.journeys[state.activeJourney];
}

/**
 * Returns the definition (species, title, ...) of the active journey.
 * @param {object} state - Game state.
 * @returns {object} Journey definition.
 */
export function activeJourneyDef(state) {
  return journeyById(state.activeJourney);
}

/**
 * Unlocks the journey after the given one (its egg appears in the valley).
 * @param {object} state - Game state (mutated).
 * @param {string} journeyId - Journey that was completed.
 * @returns {object|null} Definition of the unlocked journey, or null after the last one.
 */
export function unlockNextJourney(state, journeyId) {
  const next = nextJourney(journeyId);
  if (!next || state.journeys[next.id].unlocked) {
    return null;
  }
  state.journeys[next.id].unlocked = true;
  return next;
}

/**
 * Starts an unlocked journey: names its dino and makes it active.
 * @param {object} state - Game state (mutated).
 * @param {string} journeyId - Journey to start.
 * @param {string} dinoName - Name of the new dino.
 * @returns {boolean} True if the journey was started.
 */
export function startJourney(state, journeyId, dinoName) {
  const journey = state.journeys[journeyId];
  if (!journey || !journey.unlocked) {
    return false;
  }
  journey.started = true;
  journey.dinoName = dinoName;
  state.activeJourney = journeyId;
  return true;
}

/**
 * Switches to another started journey.
 * @param {object} state - Game state (mutated).
 * @param {string} journeyId - Journey to switch to.
 * @returns {boolean} True if switched.
 */
export function switchJourney(state, journeyId) {
  const journey = state.journeys[journeyId];
  if (!journey || !journey.started) {
    return false;
  }
  state.activeJourney = journeyId;
  return true;
}

/**
 * Returns the journey whose egg waits in the valley (unlocked but not started), if any.
 * @param {object} state - Game state.
 * @returns {object|undefined} Journey definition.
 */
export function waitingEgg(state) {
  return JOURNEYS.find((journey) => state.journeys[journey.id].unlocked && !state.journeys[journey.id].started);
}

/**
 * Checks whether all dinos are fully grown.
 * @param {object} state - Game state.
 * @returns {boolean} True when every journey reached stage 5.
 */
export function isFamilyComplete(state) {
  return JOURNEYS.every((journey) => state.journeys[journey.id].dinoStage >= 5);
}
