/** The four dino journeys in order; each journey is one difficulty stage. */
export const JOURNEYS = [
  { id: 'trex', species: 'trex', order: 1, speciesName: 'T-Rex', title: 'Reise 1: T-Rex' },
  { id: 'triceratops', species: 'triceratops', order: 2, speciesName: 'Triceratops', title: 'Reise 2: Triceratops' },
  { id: 'longneck', species: 'longneck', order: 3, speciesName: 'Langhals', title: 'Reise 3: Langhals' },
  { id: 'pterosaur', species: 'pterosaur', order: 4, speciesName: 'Flugsaurier', title: 'Reise 4: Flugsaurier' }
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
 * Returns the journey that follows the given one.
 * @param {string} id - Journey id.
 * @returns {object|undefined} Next journey or undefined after the last one.
 */
export function nextJourney(id) {
  const current = journeyById(id);
  return current ? JOURNEYS.find((journey) => journey.order === current.order + 1) : undefined;
}
