import { tokenize } from './sentences.js';

/**
 * Short stories of the pterosaur journey. Each story has 3-4 sentences, picture ids for its
 * illustration (existing word pictures shown side by side), and one comprehension question
 * whose answer and options are word ids with pictures.
 */
const STORY_SPECS = [
  ['st01', 'Der Ball', ['Ich spiele Ball.', 'Der Ball ist rot.', 'Jetzt ist der Ball im Wasser.'], ['ball', 'ente'], 'Was ist rot?', 'ball', ['ball', 'banane', 'kiwi']],
  ['st02', 'Oma hat Kuchen', ['Oma hat einen Kuchen.', 'Ich esse Kuchen.', 'Der Kuchen ist toll.'], ['oma', 'kuchen'], 'Was hat Oma?', 'kuchen', ['kuchen', 'hut', 'buch']],
  ['st03', 'Der Tiger', ['Ich sehe einen Tiger.', 'Der Tiger ist lustig.', 'Er hat einen Ball.'], ['tiger', 'ball'], 'Was sehe ich?', 'tiger', ['tiger', 'affe', 'löwe']],
  ['st04', 'Die Katze', ['Die Katze ist nass.', 'Sie war im Wasser.', 'Ich habe eine Decke.'], ['katze'], 'Wer ist nass?', 'katze', ['katze', 'hase', 'maus']],
  ['st05', 'Das Schiff', ['Opa hat ein Schiff.', 'Das Schiff ist im Wasser.', 'Ich winke Opa.'], ['opa', 'schiff'], 'Was hat Opa?', 'schiff', ['schiff', 'auto', 'bus']],
  ['st06', 'Die Suppe', ['Ich koche mit Mama.', 'Ich koche eine Suppe.', 'Die Suppe ist toll.'], ['mama', 'suppe'], 'Was koche ich?', 'suppe', ['suppe', 'kuchen', 'kakao']],
  ['st07', 'Der Igel', ['Ich sehe einen Igel.', 'Der Igel ist im Nest.', 'Er ist still.'], ['igel', 'nest'], 'Wo ist der Igel?', 'nest', ['nest', 'haus', 'bett']],
  ['st08', 'Die Spinne', ['Im Haus ist eine Spinne.', 'Ich rufe Papa.', 'Papa ist toll.'], ['spinne', 'papa'], 'Wen rufe ich?', 'papa', ['papa', 'oma', 'mama']],
  ['st09', 'Die Ente', ['Die Ente ist im Wasser.', 'Ich gebe der Ente eine Nudel.', 'Jetzt ist sie satt.'], ['ente', 'nudel'], 'Was gebe ich der Ente?', 'nudel', ['nudel', 'ball', 'buch']],
  ['st10', 'Der Hut', ['Oma hat einen Hut.', 'Der Hut ist rot.', 'Er ist toll.'], ['oma', 'hut'], 'Was hat Oma?', 'hut', ['hut', 'rock', 'bett']],
  ['st11', 'Die Sonne', ['Die Sonne ist hell.', 'Ich male die Sonne.', 'Ich male auch eine Wolke.'], ['sonne', 'wolke'], 'Was ist hell?', 'sonne', ['sonne', 'fisch', 'bus']],
  ['st12', 'Der Affe', ['Der Affe ist lustig.', 'Er hat eine Banane.', 'Ich lache.'], ['affe', 'banane'], 'Was hat der Affe?', 'banane', ['banane', 'apfel', 'kiwi']],
  ['st13', 'Ich bin müde', ['Ich bin müde.', 'Ich bin im Bett.', 'Mama ist da.'], ['bett', 'mama'], 'Wo bin ich?', 'bett', ['bett', 'bus', 'schiff']],
  ['st14', 'Die Puppe', ['Ich habe eine Puppe.', 'Die Puppe ist im Koffer.', 'Ich suche die Puppe.'], ['puppe', 'koffer'], 'Wo ist die Puppe?', 'koffer', ['koffer', 'tasse', 'kanne']],
  ['st15', 'Der Bär', ['Der Bär ist dick.', 'Er hat einen Fisch.', 'Jetzt ist er satt.'], ['bär', 'fisch'], 'Was hat der Bär?', 'fisch', ['fisch', 'ball', 'hut']],
  ['st16', 'Das Lama', ['Das Lama ist im Haus.', 'Es ist auf dem Sofa.', 'Ich lache.'], ['lama', 'sofa'], 'Wo ist das Lama?', 'sofa', ['sofa', 'bett', 'bus']],
  ['st17', 'Die Rakete', ['Ich baue mit Opa eine Rakete.', 'Die Rakete ist rot.', 'Sie ist toll.'], ['opa', 'rakete'], 'Was baue ich?', 'rakete', ['rakete', 'haus', 'schiff']],
  ['st18', 'Das Ei', ['Der Dino hat ein Ei.', 'Das Ei ist im Nest.', 'Bald ist das Ei auf.'], ['dino', 'ei'], 'Wo ist das Ei?', 'nest', ['nest', 'tasse', 'koffer']],
  ['st19', 'Die Schule', ['Ich gehe in die Schule.', 'Ich lese ein Buch.', 'Das Buch ist toll.'], ['schule', 'buch'], 'Was lese ich?', 'buch', ['buch', 'ball', 'hut']],
  ['st20', 'Der Fisch', ['Der Fisch ist im Wasser.', 'Die Katze will den Fisch.', 'Der Fisch ist weg.'], ['fisch', 'katze'], 'Wer will den Fisch?', 'katze', ['katze', 'maus', 'ente']]
];

/**
 * Turns a story spec into a story entry.
 * @param {Array} spec - [id, title, sentences, pictures, questionText, answer, options].
 * @returns {object} Story.
 */
function parseStory([id, title, sentences, pictures, questionText, answer, options]) {
  return {
    id,
    title,
    sentences: sentences.map((text, index) => ({ id: `${id}-${index + 1}`, text, tokens: tokenize(text), alternatives: [] })),
    pictures,
    question: { text: questionText, tokens: tokenize(questionText), answer, options }
  };
}

/** All stories. */
export const STORIES = STORY_SPECS.map(parseStory);

/**
 * Finds a story by id.
 * @param {string} id - Story id.
 * @returns {object|undefined} Story.
 */
export function storyById(id) {
  return STORIES.find((story) => story.id === id);
}

/**
 * Returns the ids of all words that occur in the stories (sentences and questions).
 * @param {Function} isWord - Returns true for token ids that are words.
 * @returns {Array<string>} Word ids.
 */
export function storyWordIds(isWord) {
  const tokens = STORIES.flatMap((story) => [...story.sentences.flatMap((sentence) => sentence.tokens), ...story.question.tokens]);
  return [...new Set(tokens.filter(isWord))];
}
