/** Subjects of the game: each has its own worlds of journeys. */
export const SUBJECTS = ['reading', 'math'];

/** All dino journeys; `order` counts per subject, each journey is one difficulty stage. */
export const JOURNEYS = [
  { id: 'trex', species: 'trex', subject: 'reading', levelCount: 5, order: 1, speciesName: 'T-Rex', title: 'Reise 1: T-Rex' },
  { id: 'triceratops', species: 'triceratops', subject: 'reading', levelCount: 5, order: 2, speciesName: 'Triceratops', title: 'Reise 2: Triceratops' },
  { id: 'longneck', species: 'longneck', subject: 'reading', levelCount: 5, order: 3, speciesName: 'Langhals', title: 'Reise 3: Langhals' },
  { id: 'pterosaur', species: 'pterosaur', subject: 'reading', levelCount: 5, order: 4, speciesName: 'Flugsaurier', title: 'Reise 4: Flugsaurier' },
  { id: 'stegosaurus', species: 'stegosaurus', subject: 'math', levelCount: 7, order: 1, speciesName: 'Stegosaurus', title: 'Rechen-Reise 1: Stegosaurus' },
  { id: 'ankylosaurus', species: 'ankylosaurus', subject: 'math', levelCount: 7, order: 2, speciesName: 'Panzersaurier', title: 'Rechen-Reise 2: Panzersaurier' },
  { id: 'parasaurolophus', species: 'parasaurolophus', subject: 'math', levelCount: 7, order: 3, speciesName: 'Kammsaurier', title: 'Rechen-Reise 3: Kammsaurier' }
];

/**
 * Finds a journey definition by id.
 * @param {string} id - Journey id.
 * @returns {object|undefined} Journey definition.
 */
export function journeyById(id) {
  return JOURNEYS.find((journey) => journey.id === id);
}

/**
 * Returns the journeys of one subject in order.
 * @param {string} subject - "reading" or "math".
 * @returns {Array<object>} Journey definitions.
 */
export function journeysOfSubject(subject) {
  return JOURNEYS.filter((journey) => journey.subject === subject);
}

/**
 * Returns the subject of a journey.
 * @param {string} id - Journey id.
 * @returns {string} "reading" or "math" (reading for unknown ids).
 */
export function subjectOf(id) {
  const journey = journeyById(id);
  return journey ? journey.subject : 'reading';
}

/**
 * Returns the number of levels of a journey.
 * @param {string} id - Journey id.
 * @returns {number} Level count (5 for reading, 7 for math).
 */
export function levelCountOf(id) {
  const journey = journeyById(id);
  return journey ? journey.levelCount : 5;
}

/**
 * Returns the journey that follows the given one within the same subject.
 * @param {string} id - Journey id.
 * @returns {object|undefined} Next journey or undefined after the last one.
 */
export function nextJourney(id) {
  const current = journeyById(id);
  return current
    ? JOURNEYS.find((journey) => journey.subject === current.subject && journey.order === current.order + 1)
    : undefined;
}
