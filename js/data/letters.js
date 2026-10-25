/**
 * Builds a letter item.
 * @param {string} id - Lowercase letter or sound.
 * @param {string} type - "vowel" or "consonant".
 * @returns {{id: string, display: string, type: string}} Letter item.
 */
function letter(id, type) {
  const upper = id.charAt(0).toUpperCase() + id.slice(1);
  return { id, display: `${upper} ${id}`, type };
}

const VOWEL_IDS = ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'];
const VOWEL_SOUND_IDS = ['au', 'ei', 'eu', 'ie'];
const CONSONANT_SOUND_IDS = ['ch', 'sch'];

/** All letters and sounds of level 1: single letters first, then sounds. */
export const LETTERS = [
  ...'abcdefghijklmnopqrstuvwxyz'.split('').map((id) => letter(id, VOWEL_IDS.includes(id) ? 'vowel' : 'consonant')),
  ...['ä', 'ö', 'ü'].map((id) => letter(id, 'vowel')),
  ...VOWEL_SOUND_IDS.map((id) => letter(id, 'vowel')),
  ...CONSONANT_SOUND_IDS.map((id) => letter(id, 'consonant'))
];

/** Letter ids ordered for greedy splitting (longest first). */
export const LETTER_IDS_LONGEST_FIRST = LETTERS.map((item) => item.id).sort((first, second) => second.length - first.length);

/**
 * Finds a letter item by id.
 * @param {string} id - Letter id.
 * @returns {object|undefined} Letter item.
 */
export function letterById(id) {
  return LETTERS.find((item) => item.id === id);
}

/**
 * Splits a lowercase syllable into letter ids, preferring the longest matching sound.
 * @param {string} text - Lowercase syllable such as "schu".
 * @returns {Array<string>} Letter ids such as ["sch", "u"].
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

