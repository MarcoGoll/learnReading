/**
 * Builds a letter item shown as an upper/lower case pair.
 * @param {string} id - Lowercase letter or sound.
 * @param {string} type - "vowel", "consonant", or "combination".
 * @returns {{id: string, display: string, type: string}} Letter item.
 */
function letter(id, type) {
  const upper = id.charAt(0).toUpperCase() + id.slice(1);
  return { id, display: `${upper} ${id}`, type };
}

const VOWEL_IDS = ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'];
const VOWEL_SOUND_IDS = ['au', 'ei', 'eu', 'ie'];
const CONSONANT_SOUND_IDS = ['ch', 'sch'];

/** All letters and sounds of the first journey: single letters first, then sounds. */
export const LETTERS = [
  ...'abcdefghijklmnopqrstuvwxyz'.split('').map((id) => letter(id, VOWEL_IDS.includes(id) ? 'vowel' : 'consonant')),
  ...['ä', 'ö', 'ü'].map((id) => letter(id, 'vowel')),
  ...VOWEL_SOUND_IDS.map((id) => letter(id, 'vowel')),
  ...CONSONANT_SOUND_IDS.map((id) => letter(id, 'consonant'))
];

/** Combinations that can start a word (shown as upper/lower case pair). */
const WORD_START_COMBINATIONS = ['st', 'sp', 'pf', 'qu'];

/** Combinations that never start a word (shown in lower case only). */
const INNER_COMBINATIONS = ['ck', 'ng', 'nk', 'll', 'mm', 'nn', 'ss', 'tt', 'ff', 'pp'];

/** Letter combinations of the Triceratops journey (read as one sound). */
export const COMBINATIONS = [
  ...WORD_START_COMBINATIONS.map((id) => letter(id, 'combination')),
  ...INNER_COMBINATIONS.map((id) => ({ id, display: id, type: 'combination' }))
];

/** All sound items of all journeys. */
export const ALL_SOUND_ITEMS = [...LETTERS, ...COMBINATIONS];

/** Sound ids ordered for greedy splitting (longest first). */
export const LETTER_IDS_LONGEST_FIRST = ALL_SOUND_ITEMS.map((item) => item.id).sort((first, second) => second.length - first.length);

/**
 * Finds a letter, sound, or combination item by id.
 * @param {string} id - Item id.
 * @returns {object|undefined} Item.
 */
export function letterById(id) {
  return ALL_SOUND_ITEMS.find((item) => item.id === id);
}

/**
 * Checks whether an item id is a vowel sound.
 * @param {string} id - Item id.
 * @returns {boolean} True for vowels.
 */
export function isVowel(id) {
  const item = letterById(id);
  return Boolean(item) && item.type === 'vowel';
}

/**
 * Splits a lowercase syllable into sound ids, preferring the longest matching sound.
 * @param {string} text - Lowercase syllable such as "stock".
 * @returns {Array<string>} Sound ids such as ["st", "o", "ck"].
 */
export function splitIntoLetters(text) {
  const parts = [];
  let rest = text;
  while (rest.length > 0) {
    const match = LETTER_IDS_LONGEST_FIRST.find((id) => rest.startsWith(id));
    if (!match) {
      throw new Error(`Unknown letter in "${text}"`);
    }
    parts.push(match);
    rest = rest.slice(match.length);
  }
  return parts;
}
