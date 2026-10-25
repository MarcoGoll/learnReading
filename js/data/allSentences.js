import { SENTENCES } from './sentences.js';
import { SENTENCES_TRICERATOPS } from './sentencesTriceratops.js';
import { SENTENCES_LONGNECK } from './sentencesLongneck.js';
import { STORIES } from './stories.js';

/** All sentences of all journeys, including the sentences of the stories. */
export const ALL_SENTENCES = [
  ...SENTENCES,
  ...SENTENCES_TRICERATOPS,
  ...SENTENCES_LONGNECK,
  ...STORIES.flatMap((story) => story.sentences)
];

/** Lookup table of all sentences by id. */
const SENTENCES_BY_ID = new Map(ALL_SENTENCES.map((sentence) => [sentence.id, sentence]));

/**
 * Finds a sentence of any journey by id.
 * @param {string} id - Sentence id.
 * @returns {object|undefined} Sentence.
 */
export function sentenceById(id) {
  return SENTENCES_BY_ID.get(id);
}
