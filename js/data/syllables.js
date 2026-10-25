import { splitIntoLetters } from './letters.js';
import { WORDS } from './words.js';

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
  WORDS.forEach((word) => word.syllables.forEach((syllable) => ids.add(syllable)));
  return [...ids].sort();
}

/** All open syllables of the game with their letters. */
export const SYLLABLES = collectSyllableIds().map((id) => ({ id, letters: splitIntoLetters(id) }));

/**
 * Finds a syllable by id.
 * @param {string} id - Syllable id.
 * @returns {object|undefined} Syllable entry.
 */
export function syllableById(id) {
  return SYLLABLES.find((syllable) => syllable.id === id);
}
