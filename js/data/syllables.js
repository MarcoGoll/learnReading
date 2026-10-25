import { splitIntoLetters, isVowel, COMBINATIONS } from './letters.js';
import { ALL_WORDS } from './allWords.js';

/** Consonants combined with every basic vowel to form the core syllables. */
const CORE_CONSONANTS = ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'w', 'z', 'sch'];

/** Vowels used for the core syllables (plus single-vowel syllables). */
const CORE_VOWELS = ['a', 'e', 'i', 'o', 'u', 'au', 'ei'];

/** Single-vowel syllables such as the "O" in "O-ma". */
const SINGLE_VOWELS = ['a', 'e', 'i', 'o', 'u', 'au', 'ei', 'eu'];

/**
 * Builds the sorted list of unique syllable ids: core combinations plus all word syllables.
 * @returns {Array<string>} Syllable ids.
 */
function collectSyllableIds() {
  const ids = new Set(SINGLE_VOWELS);
  CORE_CONSONANTS.forEach((consonant) => {
    CORE_VOWELS.forEach((vowel) => ids.add(consonant + vowel));
  });
  ALL_WORDS.forEach((word) => word.syllables.forEach((syllable) => ids.add(syllable)));
  return [...ids].sort();
}

/** Ids of the letter combinations. */
const COMBINATION_IDS = new Set(COMBINATIONS.map((item) => item.id));

/**
 * Checks whether a sound ends a syllable openly (vowel; y counts as vowel at the end, as in "Py-ra-mi-de").
 * @param {string} letterId - Last sound of a syllable.
 * @returns {boolean} True for an open ending.
 */
function endsOpen(letterId) {
  return isVowel(letterId) || letterId === 'y';
}

/**
 * Builds a syllable entry with its sounds and whether it is closed (ends with a consonant)
 * or contains a letter combination.
 * @param {string} id - Syllable id.
 * @returns {{id: string, letters: Array<string>, closed: boolean, hasCombination: boolean}} Syllable.
 */
export function syllableEntry(id) {
  const letters = splitIntoLetters(id);
  return {
    id,
    letters,
    closed: !endsOpen(letters[letters.length - 1]),
    hasCombination: letters.some((letterId) => COMBINATION_IDS.has(letterId))
  };
}

/** All syllables of the game (open and closed) with their sounds. */
export const SYLLABLES = collectSyllableIds().map(syllableEntry);

/** Open syllables without letter combinations (first journey). */
export const OPEN_SYLLABLES = SYLLABLES.filter((syllable) => !syllable.closed && !syllable.hasCombination);

/** Syllables of custom words that are not part of the built-in list (replaced on every content change). */
let customSyllables = [];

/**
 * Replaces the registered custom syllables, so that syllableById also finds them.
 * @param {Array<object>} syllables - Syllable entries.
 */
export function registerCustomSyllables(syllables) {
  customSyllables = syllables;
}

/**
 * Returns syllable entries for the given ids that are not in the built-in list.
 * @param {Array<string>} ids - Syllable ids.
 * @returns {Array<object>} New syllable entries.
 */
export function extraSyllables(ids) {
  const known = new Set(SYLLABLES.map((syllable) => syllable.id));
  return [...new Set(ids)].filter((id) => !known.has(id)).map(syllableEntry);
}

/**
 * Finds a syllable (built-in or from a custom word) by id.
 * @param {string} id - Syllable id.
 * @returns {object|undefined} Syllable entry.
 */
export function syllableById(id) {
  return SYLLABLES.find((syllable) => syllable.id === id) || customSyllables.find((syllable) => syllable.id === id);
}
