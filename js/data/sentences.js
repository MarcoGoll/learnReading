export { SIGHT_WORDS } from './sightWords.js';

/**
 * Sentence specs: the sentence text, optionally followed by "|" and alternative valid word orders
 * (lowercase tokens separated by spaces) used by the sentence builder.
 */
const SENTENCE_SPECS = [
  'Ich male.', 'Ich lese.', 'Ich lache.', 'Ich koche.', 'Ich bade.', 'Ich tobe.', 'Ich rufe.',
  'Ich baue.', 'Ich schaue.', 'Ich laufe.',
  'Mama ist da.|da ist mama', 'Papa ist da.|da ist papa', 'Oma ist da.|da ist oma',
  'Opa ist da.|da ist opa', 'Der Hase ist da.|da ist der hase', 'Die Ziege ist da.|da ist die ziege',
  'Das Auto ist da.|da ist das auto', 'Der Dino ist da.|da ist der dino',
  'Die Banane ist da.|da ist die banane', 'Die Seife ist da.|da ist die seife',
  'Mama ist müde.', 'Opa ist müde.', 'Der Löwe ist böse.', 'Die Eule ist weise.', 'Die Rose ist rosa.',
  'Die Hose ist lila.', 'Das Sofa ist lila.', 'Das Auto ist rosa.', 'Der Dino ist müde.',
  'Der Rabe ist böse.', 'Die Biene ist leise.', 'Mama ist so müde.', 'Opa ist so müde.',
  'Oma hat eine Tomate.', 'Opa hat eine Geige.', 'Papa hat eine Kamera.', 'Mama hat eine Tasche.',
  'Oma hat ein Ei.', 'Die Ziege hat Heu.', 'Das Lama hat Heu.', 'Opa hat eine Rübe.',
  'Papa hat ein Kanu.', 'Opa hat eine Tuba.', 'Oma hat Käse.', 'Opa hat ein Mofa.',
  'Wo ist Mama?', 'Wo ist Papa?', 'Wo ist die Dose?', 'Wo ist der Hase?', 'Wo ist die Lupe?',
  'Das ist Oma.', 'Das ist ein Uhu.', 'Das ist eine Möwe.', 'Das ist die Schule.', 'Das ist ein Ufo.',
  'Ich koche Kakao.', 'Ich habe Käse.', 'Ich suche Mama.', 'Ich rufe Oma.', 'Ich rufe Papa.',
  'Ich hole Limo.', 'Ich sehe Opa.', 'Ich sehe eine Biene.', 'Ich male ein Auto.',
  'Ich male eine Rose.', 'Ich baue eine Rakete.', 'Ich habe ein Ei.', 'Ich male ein Ufo.',
  'Ich liebe Mama.', 'Ich liebe Salami.', 'Ich habe eine Melone.', 'Ich sehe eine Raupe.',
  'Mama ist im Kino.|im kino ist mama', 'Papa ist im Kino.|im kino ist papa',
  'Opa ist im Auto.|im auto ist opa', 'Opa ist im Kanu.|im kanu ist opa',
  'Oma ist im Auto.|im auto ist oma', 'Oma ist im Tipi.|im tipi ist oma',
  'Ich male mit Oma.', 'Ich bade mit Papa.', 'Ich koche mit Mama.', 'Ich lese mit Opa.',
  'Ich male und lese.|ich lese und male', 'Ich lache und tobe.|ich tobe und lache'
];

/**
 * Splits a sentence text into lowercase tokens without punctuation.
 * @param {string} text - Sentence text.
 * @returns {Array<string>} Tokens.
 */
export function tokenize(text) {
  return text.replace(/[.?!,]/g, '').split(' ').map((token) => token.toLowerCase());
}

/**
 * Parses a sentence spec into a sentence entry.
 * @param {string} spec - Sentence spec.
 * @param {number} index - Position in the list, used for the id.
 * @returns {{id: string, text: string, tokens: Array<string>, alternatives: Array<Array<string>>}} Sentence.
 */
function parseSentence(spec, index) {
  const [text, ...alternativeTexts] = spec.split('|');
  return {
    id: `s${String(index + 1).padStart(2, '0')}`,
    text,
    tokens: tokenize(text),
    alternatives: alternativeTexts.map((alternative) => alternative.split(' '))
  };
}

/** All sentences of the game. */
export const SENTENCES = SENTENCE_SPECS.map(parseSentence);

/**
 * Finds a sentence by id.
 * @param {string} id - Sentence id.
 * @returns {object|undefined} Sentence entry.
 */
export function sentenceById(id) {
  return SENTENCES.find((sentence) => sentence.id === id);
}

/**
 * Returns the punctuation mark at the end of a sentence.
 * @param {object} sentence - Sentence entry.
 * @returns {string} "." or "?".
 */
export function endMark(sentence) {
  return sentence.text.endsWith('?') ? '?' : '.';
}
