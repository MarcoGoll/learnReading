import { parseSentenceSpecs } from './sentences.js';

/** Sentences of the Triceratops journey (2-4 words, see sentences.js for the format). */
const SPECS = [
  'Ich spiele Ball.', 'Ich lerne.', 'Ich singe.', 'Ich tanze.', 'Ich renne.', 'Ich kicke.', 'Ich pfeife.',
  'Ich denke.', 'Ich warte.', 'Ich helfe Mama.', 'Ich backe Kuchen.', 'Ich esse Suppe.', 'Ich winke Oma.',
  'Ich finde Papa.', 'Ich esse eine Nudel.', 'Der Ball ist rot.', 'Das Bett ist toll.', 'Der Fisch ist nass.',
  'Die Katze ist satt.', 'Der Tiger ist lustig.', 'Die Ente ist nass.', 'Der Affe ist toll.',
  'Die Sonne ist hell.', 'Die Wolke ist dunkel.', 'Der Bus ist voll.', 'Die Tasse ist voll.', 'Der Hut ist rot.',
  'Der Igel ist dick.', 'Der Esel ist still.', 'Das Schaf ist dick.', 'Der Bus ist laut.',
  'Oma hat eine Tasse.', 'Opa hat ein Schiff.', 'Papa hat ein Messer.', 'Mama hat eine Kanne.',
  'Wo ist der Ball?', 'Wo ist die Katze?', 'Wo ist das Buch?', 'Das ist ein Bär.', 'Das ist eine Spinne.',
  'Opa ist im Haus.|im haus ist opa', 'Mama ist im Bus.|im bus ist mama', 'Der Fisch ist da.|da ist der fisch'
];

/** Sentences of the Triceratops journey. */
export const SENTENCES_TRICERATOPS = parseSentenceSpecs(SPECS, 't');
