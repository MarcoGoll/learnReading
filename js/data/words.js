/**
 * Word list for levels 3-5. Each entry is "Syl-la-bles type [p]":
 * type n = noun, v = verb (first person singular), a = adjective; "p" marks words with a picture
 * under assets/svg/pictures/<id>.svg. Every word consists only of open syllables.
 */
const WORD_SPECS = [
  // Nouns: family and people
  'Ma-ma n p', 'Pa-pa n p', 'O-ma n p', 'O-pa n p', 'Da-me n', 'Rie-se n', 'Mu-mi-e n', 'Po-li-zei n',
  // Nouns: animals
  'La-ma n p', 'Ha-se n p', 'Ra-be n p', 'Bie-ne n p', 'Zie-ge n p', 'Eu-le n p', 'Rau-pe n p',
  'Tau-be n p', 'Mö-we n p', 'Lö-we n p', 'Mei-se n', 'Ma-de n', 'Pu-ma n', 'Ko-a-la n p', 'E-mu n',
  'U-hu n p', 'Pu-te n', 'Di-no n p', 'Pa-pa-gei n', 'Ka-ka-du n', 'Bo-a n', 'Me-du-se n', 'Ko-ra-le n',
  // Nouns: food
  'Sa-la-mi n p', 'To-ma-te n p', 'Li-mo n p', 'Ba-na-ne n p', 'Me-lo-ne n p', 'Ki-wi n p',
  'Ro-si-ne n', 'Scho-ko-la-de n p', 'Li-mo-na-de n', 'Ka-ka-o n p', 'Ei n p', 'Kä-se n p',
  'Fei-ge n p', 'Rü-be n p', 'Ma-ro-ne n', 'Ge-mü-se n', 'Keu-le n', 'Scho-te n', 'Wa-be n', 'Heu n',
  // Nouns: things at home
  'So-fa n p', 'Ro-se n p', 'Ho-se n p', 'Do-se n p', 'Va-se n p', 'Sei-fe n p', 'Lei-ne n',
  'Du-sche n p', 'Ta-sche n p', 'Wä-sche n', 'Kü-che n', 'Sche-re n p', 'Scha-le n', 'Schu-he n p',
  'Sä-ge n p', 'Lu-pe n p', 'Tu-be n p', 'Tü-te n p', 'Wie-ge n p', 'Li-li-e n p', 'Ka-pu-ze n',
  'Ta-pe-te n', 'Ku-li n', 'Mi-ne n', 'Ki-lo n', 'Sa-che n', 'Wa-re n', 'Ro-be n', 'Ga-ra-ge n p',
  // Nouns: body
  'Na-se n p', 'Au-ge n p', 'Bei-ne n', 'Ze-he n', 'Wa-de n', 'Beu-le n',
  // Nouns: vehicles, music, toys, technology
  'Au-to n p', 'Mo-fa n p', 'Ka-nu n p', 'U-fo n p', 'Ra-ke-te n p', 'Lo-ko-mo-ti-ve n',
  'Ma-schi-ne n', 'Ka-bi-ne n', 'Bo-je n', 'Ko-je n', 'Tu-ba n p', 'Gei-ge n p', 'U-ku-le-le n',
  'Ka-me-ra n p', 'Ra-di-o n p', 'Vi-de-o n', 'Fo-to n', 'Do-mi-no n p', 'Ti-pi n p', 'Hu-pe n',
  'Ku-fe n', 'Ru-te n', 'Si-re-ne n',
  // Nouns: places and other
  'Schu-le n p', 'Wie-se n p', 'Dü-ne n', 'La-wi-ne n', 'Ki-no n', 'Bü-ro n', 'Sau-na n', 'Bu-de n',
  'Ru-i-ne n', 'Bau n', 'Rei-se n', 'Pau-se n', 'Sei-te n', 'Na-me n', 'Ka-ra-te n', 'Pa-ra-de n',
  // Verbs (first person singular)
  'ma-le v', 'le-se v', 'ru-fe v', 'bau-e v', 're-de v', 'sa-ge v', 'ma-che v', 'ko-che v', 'ra-te v',
  'la-che v', 'ho-le v', 'ge-be v', 'se-he v', 'ge-he v', 'le-ge v', 'lie-ge v', 'fe-ge v',
  'schau-e v', 'kau-fe v', 'lau-fe v', 'su-che v', 'le-be v', 'lie-be v', 'ha-be v', 'ba-de v',
  'la-de v', 'wi-sche v', 'mi-sche v', 'tau-sche v', 'zei-ge v', 'rei-te v', 'wei-ne v', 'heu-le v',
  'to-be v', 'lo-be v', 'ru-de-re v', 'hö-re v', 'sau-se v', 'lau-sche v', 'ja-ge v', 'nä-he v',
  'ru-he v', 'ra-se v',
  // Adjectives
  'li-la a', 'ro-sa a', 'lei-se a', 'mü-de a', 'bö-se a', 'wei-se a', 'fau-le a', 'neu-e a',
  'schö-ne a', 'ro-te a', 'gu-te a', 'sau-re a'
];

/** Word types used in the specs. */
const TYPE_NAMES = { n: 'noun', v: 'verb', a: 'adjective' };

/**
 * Replaces German umlauts so the id can be used as a file name.
 * @param {string} text - Lowercase text.
 * @returns {string} ASCII text.
 */
function toAscii(text) {
  return text.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
}

/**
 * Parses a word spec into a word entry.
 * @param {string} spec - Spec such as "Ma-ma n p".
 * @returns {{id: string, display: string, syllables: Array<string>, type: string, picture?: string}} Word.
 */
function parseWord(spec) {
  const [syllableText, typeCode, pictureFlag] = spec.split(' ');
  const parts = syllableText.split('-');
  const display = parts.join('');
  const id = display.toLowerCase();
  const word = { id, display, syllables: parts.map((part) => part.toLowerCase()), type: TYPE_NAMES[typeCode] };
  if (pictureFlag === 'p') {
    word.picture = toAscii(id);
  }
  return word;
}

/**
 * Removes entries whose id already appeared earlier.
 * @param {Array<object>} words - Parsed words.
 * @returns {Array<object>} Words with unique ids.
 */
function uniqueById(words) {
  const seen = new Set();
  return words.filter((word) => !seen.has(word.id) && seen.add(word.id));
}

/** All words of the game. */
export const WORDS = uniqueById(WORD_SPECS.map(parseWord));

/**
 * Finds a word by id.
 * @param {string} id - Word id.
 * @returns {object|undefined} Word entry.
 */
export function wordById(id) {
  return WORDS.find((word) => word.id === id);
}

/**
 * Returns the display parts of a word, one per syllable, keeping the original case.
 * @param {object} word - Word entry.
 * @returns {Array<string>} Display syllables such as ["Ma", "ma"].
 */
export function displaySyllables(word) {
  const parts = [];
  let offset = 0;
  word.syllables.forEach((syllable) => {
    parts.push(word.display.slice(offset, offset + syllable.length));
    offset += syllable.length;
  });
  return parts;
}
