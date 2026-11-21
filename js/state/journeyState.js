import { journeyById, nextJourney, JOURNEYS, journeysOfSubject, subjectOf } from '../data/journeys.js';

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
 * Returns the subject of the active journey.
 * @param {object} state - Game state.
 * @returns {string} "reading" or "math".
 */
export function activeSubject(state) {
  return subjectOf(state.activeJourney);
}

/**
 * Remembers a journey as the last played one of its subject.
 * @param {object} state - Game state (mutated).
 * @param {string} journeyId - Journey id.
 */
function rememberJourney(state, journeyId) {
  if (!state.lastJourneyBySubject) state.lastJourneyBySubject = {};
  state.lastJourneyBySubject[subjectOf(journeyId)] = journeyId;
}

/**
 * Unlocks the journey after the given one within its subject (its egg appears in the valley).
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
  rememberJourney(state, journeyId);
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
  rememberJourney(state, journeyId);
  return true;
}

/**
 * Switches to the world of a subject: the last played journey of that subject becomes active.
 * On the first visit of the math world this is its first journey, which may not be started yet.
 * @param {object} state - Game state (mutated).
 * @param {string} subject - "reading" or "math".
 * @returns {object} Journey state of the now active journey.
 */
export function switchSubject(state, subject) {
  rememberJourney(state, state.activeJourney);
  const remembered = state.lastJourneyBySubject[subject];
  const isValid = remembered && subjectOf(remembered) === subject && state.journeys[remembered].unlocked;
  state.activeJourney = isValid ? remembered : journeysOfSubject(subject)[0].id;
  return activeJourney(state);
}

/**
 * Returns the journey whose egg waits in the valley (unlocked but not started), if any.
 * @param {object} state - Game state.
 * @param {string} [subject] - Only look at this subject; all subjects when omitted.
 * @returns {object|undefined} Journey definition.
 */
export function waitingEgg(state, subject) {
  const candidates = subject ? journeysOfSubject(subject) : JOURNEYS;
  return candidates.find((journey) => state.journeys[journey.id].unlocked && !state.journeys[journey.id].started);
}

/**
 * Checks whether all dinos of a subject are fully grown.
 * @param {object} state - Game state.
 * @param {string} [subject='reading'] - Subject.
 * @returns {boolean} True when every journey of the subject reached stage 5.
 */
export function isFamilyComplete(state, subject = 'reading') {
  return journeysOfSubject(subject).every((journey) => state.journeys[journey.id].dinoStage >= 5);
}
