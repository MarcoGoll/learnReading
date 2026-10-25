import { splitIntoLetters, isVowel, ALL_SOUND_ITEMS, COMBINATIONS } from '../data/letters.js';

/** Single characters that are sounds of the game (a-z, ä, ö, ü). */
const ALLOWED_CHARACTERS = new Set(ALL_SOUND_ITEMS.map((item) => item.id).filter((id) => id.length === 1));

/** Consonant units that are split between two syllables (Tel-ler, Fin-ger, Fens-ter, Ap-fel). */
const SPLITTABLE_UNITS = new Set(['ll', 'mm', 'nn', 'ss', 'tt', 'ff', 'pp', 'ng', 'nk', 'st', 'sp', 'pf']);

/** Ids of the letter combinations (for the journey assignment). */
const COMBINATION_IDS = new Set(COMBINATIONS.map((item) => item.id));

/** Journeys that can receive custom words (the pterosaur reads stories). */
export const CUSTOM_WORD_JOURNEYS = ['trex', 'triceratops', 'longneck'];

/**
 * Checks whether a sound unit is a vowel for syllable splitting (y counts as vowel, as in "Py-ra-mi-de").
 * @param {string} unit - Sound id.
 * @returns {boolean} True for vowels.
 */
function isVowelUnit(unit) {
  return isVowel(unit) || unit === 'y';
}

/**
 * Splits a lowercase word into sound units, where splittable double sounds become single letters.
 * @param {string} lowerText - Lowercase word.
 * @returns {Array<string>} Units such as ["t", "e", "l", "l", "e", "r"].
 */
function splitUnits(lowerText) {
  return splitIntoLetters(lowerText).flatMap((unit) => (SPLITTABLE_UNITS.has(unit) ? unit.split('') : [unit]));
}

/**
 * Returns the unit indexes where a new syllable starts: of the consonants between two vowels,
 * the last one begins the next syllable; two different vowels next to each other are split as well
 * (equal ones such as "ee" in "Beere" stay together).
 * @param {Array<string>} units - Sound units.
 * @returns {Array<number>} Start indexes of the syllables after the first.
 */
function syllableStarts(units) {
  const vowelIndexes = units.map((unit, index) => (isVowelUnit(unit) ? index : -1)).filter((index) => index >= 0);
  const starts = [];
  for (let i = 1; i < vowelIndexes.length; i++) {
    const consonantCount = vowelIndexes[i] - vowelIndexes[i - 1] - 1;
    const isLongVowel = consonantCount === 0 && units[vowelIndexes[i]] === units[vowelIndexes[i - 1]];
    if (!isLongVowel) starts.push(consonantCount === 0 ? vowelIndexes[i] : vowelIndexes[i] - 1);
  }
  return starts;
}

/**
 * Suggests the syllables of a word, keeping the original case ("Banane" -> ["Ba", "na", "ne"]).
 * Words with characters that are no sound of the game are returned as one part.
 * @param {string} display - Word as typed.
 * @returns {Array<string>} Display syllables.
 */
export function suggestSyllables(display) {
  if (!hasOnlyAllowedCharacters(display)) {
    return [display];
  }
  const units = splitUnits(display.toLowerCase());
  const bounds = [0, ...syllableStarts(units), units.length];
  const lengths = bounds.slice(1).map((end, index) => units.slice(bounds[index], end).join('').length);
  let offset = 0;
  return lengths.map((length) => {
    const part = display.slice(offset, offset + length);
    offset += length;
    return part;
  });
}

/**
 * Checks whether a text consists only of letters that are sounds of the game.
 * @param {string} text - Text without hyphens.
 * @returns {boolean} True if valid.
 */
function hasOnlyAllowedCharacters(text) {
  return text.length > 0 && text.toLowerCase().split('').every((character) => ALLOWED_CHARACTERS.has(character));
}

/**
 * Builds a custom word from the input of the adult. With hyphens ("Ba-na-ne") the split is taken
 * as typed, without hyphens the suggestion is used. Capitalized words are nouns.
 * @param {string} text - Input text.
 * @returns {object} Word entry { id, display, syllables, type, custom: true }; parts may be empty.
 */
export function parseCustomWord(text) {
  const trimmed = text.trim();
  const parts = trimmed.includes('-') ? trimmed.split('-') : suggestSyllables(trimmed);
  const display = parts.join('');
  const firstLetter = display.charAt(0);
  const isNoun = firstLetter !== firstLetter.toLowerCase();
  return { id: display.toLowerCase(), display, syllables: parts.map((part) => part.toLowerCase()), type: isNoun ? 'noun' : 'other', custom: true };
}

/**
 * Checks a parsed custom word.
 * @param {object} word - Parsed word.
 * @param {Set<string>} existingIds - Ids of all visible words (built-in and custom).
 * @param {Set<string>} hiddenIds - Ids of hidden built-in words.
 * @returns {string|null} Error code (empty, invalidCharacters, emptySyllable, duplicate, hiddenDuplicate) or null.
 */
export function validateCustomWord(word, existingIds, hiddenIds) {
  if (word.display.length === 0) return 'empty';
  if (!hasOnlyAllowedCharacters(word.display)) return 'invalidCharacters';
  if (word.syllables.some((syllable) => syllable.length === 0)) return 'emptySyllable';
  if (hiddenIds.has(word.id)) return 'hiddenDuplicate';
  if (existingIds.has(word.id)) return 'duplicate';
  return null;
}

/**
 * Returns the sounds of a word that are not in the letter pool yet.
 * @param {object} word - Word entry.
 * @param {Array<string>} letterPool - Mastered sound ids.
 * @returns {Array<string>} Unknown sound ids (unique, in order).
 */
export function unknownSounds(word, letterPool) {
  const known = new Set(letterPool);
  const sounds = word.syllables.flatMap((syllable) => splitIntoLetters(syllable));
  return [...new Set(sounds.filter((sound) => !known.has(sound)))];
}

/**
 * Returns the journeys a custom word belongs to: closed syllables or letter combinations -> Triceratops,
 * otherwise T-Rex; 3 or more syllables additionally long-neck.
 * @param {object} word - Word entry.
 * @returns {Array<string>} Journey ids.
 */
export function journeysForWord(word) {
  const soundsPerSyllable = word.syllables.map((syllable) => splitIntoLetters(syllable));
  const hasCombination = soundsPerSyllable.some((sounds) => sounds.some((sound) => COMBINATION_IDS.has(sound)));
  const hasClosed = soundsPerSyllable.some((sounds) => !isVowelUnit(sounds[sounds.length - 1]));
  const journeys = [hasCombination || hasClosed ? 'triceratops' : 'trex'];
  if (word.syllables.length >= 3) journeys.push('longneck');
  return journeys;
}
