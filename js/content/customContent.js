import { registerCustomWords, wordById } from '../data/allWords.js';
import { SYLLABLES, registerCustomSyllables, extraSyllables, syllableEntry } from '../data/syllables.js';
import { journeysForWord } from '../logic/customWords.js';

/**
 * Returns the custom content of a state (empty lists for states without it).
 * @param {object} state - Game state.
 * @returns {{customWords: Array<object>, hiddenWordIds: Array<string>}} Content.
 */
export function contentOf(state) {
  const content = (state && state.content) || {};
  return { customWords: content.customWords || [], hiddenWordIds: content.hiddenWordIds || [] };
}

/**
 * Registers the custom words and their new syllables, so that wordById and syllableById find them.
 * @param {object} state - Game state.
 */
export function registerCustomContent(state) {
  const { customWords } = contentOf(state);
  registerCustomWords(customWords);
  registerCustomSyllables(extraSyllables(customWords.flatMap((word) => word.syllables)));
}

/**
 * Returns the custom words that belong to a journey.
 * @param {object} state - Game state.
 * @param {string} journeyId - Journey id.
 * @returns {Array<object>} Custom words.
 */
export function customWordsOf(state, journeyId) {
  return contentOf(state).customWords.filter((word) => journeysForWord(word).includes(journeyId));
}

/**
 * Returns syllable entries for syllable ids (built-in entry if it exists, otherwise a new one).
 * @param {Array<string>} ids - Syllable ids.
 * @returns {Array<object>} Syllable entries.
 */
export function syllableEntriesFor(ids) {
  return [...new Set(ids)].map((id) => SYLLABLES.find((syllable) => syllable.id === id) || syllableEntry(id));
}

/**
 * Returns a filter for practice keys: words that were deleted or hidden are not practiced any more.
 * @param {object} state - Game state.
 * @returns {Function} Takes a history key, returns true if it may be practiced.
 */
export function practiceKeyFilter(state) {
  const hidden = new Set(contentOf(state).hiddenWordIds);
  return (key) => {
    const [type, id] = key.split(':');
    return type !== 'word' || (Boolean(wordById(id)) && !hidden.has(id));
  };
}

/**
 * Ensures the state has a content object and returns it.
 * @param {object} state - Game state (mutated).
 * @returns {object} Content object.
 */
function ensureContent(state) {
  if (!state.content) state.content = { customWords: [], hiddenWordIds: [] };
  return state.content;
}

/**
 * Adds a custom word to the state.
 * @param {object} state - Game state (mutated).
 * @param {object} word - Parsed and validated custom word.
 */
export function addCustomWord(state, word) {
  ensureContent(state).customWords.push(word);
}

/**
 * Deletes a custom word for good.
 * @param {object} state - Game state (mutated).
 * @param {string} wordId - Word id.
 */
export function deleteCustomWord(state, wordId) {
  const content = ensureContent(state);
  content.customWords = content.customWords.filter((word) => word.id !== wordId);
}

/**
 * Hides a built-in word or shows it again.
 * @param {object} state - Game state (mutated).
 * @param {string} wordId - Word id.
 * @param {boolean} isHidden - True to hide, false to show.
 */
export function setWordHidden(state, wordId, isHidden) {
  const content = ensureContent(state);
  const others = content.hiddenWordIds.filter((id) => id !== wordId);
  content.hiddenWordIds = isHidden ? [...others, wordId] : others;
}
