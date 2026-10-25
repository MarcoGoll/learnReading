import { WORDS } from './words.js';
import { WORDS_TRICERATOPS } from './wordsTriceratops.js';
import { WORDS_LONGNECK } from './wordsLongneck.js';

/**
 * Merges word lists, keeping the first entry of every id.
 * @param {Array<Array<object>>} lists - Word lists.
 * @returns {Array<object>} Unique words.
 */
function mergeLists(lists) {
  const seen = new Set();
  return lists.flat().filter((word) => !seen.has(word.id) && seen.add(word.id));
}

/** All words of all journeys. */
export const ALL_WORDS = mergeLists([WORDS, WORDS_TRICERATOPS, WORDS_LONGNECK]);

/** Lookup table of all words by id. */
const WORDS_BY_ID = new Map(ALL_WORDS.map((word) => [word.id, word]));

/** Lookup table of the custom words added by adults (replaced on every content change). */
let customWordsById = new Map();

/**
 * Replaces the registered custom words, so that wordById also finds them.
 * @param {Array<object>} words - Custom word entries.
 */
export function registerCustomWords(words) {
  customWordsById = new Map(words.map((word) => [word.id, word]));
}

/**
 * Finds a word of any journey (built-in or custom) by id.
 * @param {string} id - Word id.
 * @returns {object|undefined} Word entry.
 */
export function wordById(id) {
  return WORDS_BY_ID.get(id) || customWordsById.get(id);
}
