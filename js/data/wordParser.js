/** Word types used in the specs. */
const TYPE_NAMES = { n: 'noun', v: 'verb', a: 'adjective' };

/**
 * Replaces German umlauts and sharp s so the id can be used as a file name.
 * @param {string} text - Lowercase text.
 * @returns {string} ASCII text.
 */
export function toAscii(text) {
  return text.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
}

/**
 * Parses a word spec "Syl-la-bles type [p] [=part+part]" into a word entry.
 * type n = noun, v = verb, a = adjective; "p" marks a picture under assets/svg/pictures/<ascii id>.svg;
 * "=haus+tür" marks a compound word and names the ids of its part words.
 * Ids keep umlauts (saved games reference them); only picture file names are ASCII.
 * @param {string} spec - Spec such as "Haus-tür n p =haus+tür".
 * @returns {object} Word entry: id, display, syllables, type, picture?, parts?.
 */
export function parseWord(spec) {
  const [syllableText, typeCode, ...flags] = spec.split(' ');
  const parts = syllableText.split('-');
  const display = parts.join('');
  const id = display.toLowerCase();
  const word = { id, display, syllables: parts.map((part) => part.toLowerCase()), type: TYPE_NAMES[typeCode] };
  if (flags.includes('p')) {
    word.picture = toAscii(id);
  }
  const compound = flags.find((flag) => flag.startsWith('='));
  if (compound) {
    word.parts = compound.slice(1).split('+');
  }
  return word;
}

/**
 * Parses a list of word specs and removes entries whose id already appeared.
 * @param {Array<string>} specs - Word specs.
 * @returns {Array<object>} Word entries with unique ids.
 */
export function parseWordSpecs(specs) {
  const seen = new Set();
  return specs.map(parseWord).filter((word) => !seen.has(word.id) && seen.add(word.id));
}

/**
 * Returns the display parts of a word, one per syllable, keeping the original case.
 * @param {object} word - Word entry.
 * @returns {Array<string>} Display syllables such as ["Ma", "ma"].
 */
export function displaySyllables(word) {
  const result = [];
  let offset = 0;
  word.syllables.forEach((syllable) => {
    result.push(word.display.slice(offset, offset + syllable.length));
    offset += syllable.length;
  });
  return result;
}
