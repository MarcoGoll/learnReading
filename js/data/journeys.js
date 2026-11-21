/** Subjects of the game: each has its own worlds of journeys. */
export const SUBJECTS = ['reading', 'math'];

/**
 * All dino journeys. Reading journeys are difficulty stages (`order` counts per subject, the next one hatches
 * after the previous one); the math journeys are one dino per operation, all available from the start.
 */
export const JOURNEYS = [
  { id: 'trex', species: 'trex', subject: 'reading', levelCount: 5, order: 1, speciesName: 'T-Rex', title: 'Reise 1: T-Rex' },
  { id: 'triceratops', species: 'triceratops', subject: 'reading', levelCount: 5, order: 2, speciesName: 'Triceratops', title: 'Reise 2: Triceratops' },
  { id: 'longneck', species: 'longneck', subject: 'reading', levelCount: 5, order: 3, speciesName: 'Langhals', title: 'Reise 3: Langhals' },
  { id: 'pterosaur', species: 'pterosaur', subject: 'reading', levelCount: 5, order: 4, speciesName: 'Flugsaurier', title: 'Reise 4: Flugsaurier' },
  {
    id: 'stegosaurus', species: 'stegosaurus', subject: 'math', operation: 'add', levelCount: 7, order: 1,
    speciesName: 'Stegosaurus', title: 'Plus-Dino: Stegosaurus',
    intro: 'Im Ei wartet ein kleiner Stegosaurus. Er liebt Plus-Aufgaben: Mit ihm zählst du und rechnest Plus.'
  },
  {
    id: 'ankylosaurus', species: 'ankylosaurus', subject: 'math', operation: 'subtract', levelCount: 7, order: 1,
    speciesName: 'Panzersaurier', title: 'Minus-Dino: Panzersaurier',
    intro: 'Im Ei wartet ein kleiner Panzersaurier. Er liebt Minus-Aufgaben: Mit ihm rechnest du Minus.'
  },
  {
    id: 'parasaurolophus', species: 'parasaurolophus', subject: 'math', operation: 'multiply', levelCount: 7, order: 1,
    speciesName: 'Kammsaurier', title: 'Mal-Dino: Kammsaurier',
    intro: 'Im Ei wartet ein kleiner Kammsaurier. Er liebt Mal-Aufgaben: Mit ihm lernst du das Einmaleins.'
  },
  {
    id: 'pachycephalosaurus', species: 'pachycephalosaurus', subject: 'math', operation: 'divide', levelCount: 7, order: 1,
    speciesName: 'Dickkopfsaurier', title: 'Geteilt-Dino: Dickkopfsaurier',
    intro: 'Im Ei wartet ein kleiner Dickkopfsaurier. Er liebt Geteilt-Aufgaben: Mit ihm verteilst du gerecht.'
  }
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
 * Returns the reading journey that follows the given one (math dinos have no successor).
 * @param {string} id - Journey id.
 * @returns {object|undefined} Next journey or undefined after the last one.
 */
export function nextJourney(id) {
  const current = journeyById(id);
  if (!current || current.subject === 'math') return undefined;
  return JOURNEYS.find((journey) => journey.subject === current.subject && journey.order === current.order + 1);
}
