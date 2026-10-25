import { parseSentenceSpecs } from './sentences.js';

/** Sentences of the long-neck journey, each with at least one long word (2-4 words). */
const SPECS = [
  'Ich telefoniere.', 'Ich balanciere.', 'Ich marschiere.', 'Ich spaziere.', 'Ich musiziere.',
  'Ich sortiere.', 'Ich kassiere.',
  'Das ist wunderbar.', 'Das ist fantastisch.', 'Oma hat eine Ananas.', 'Opa hat eine Gitarre.',
  'Mama hat eine Kartoffel.', 'Papa hat ein Telefon.', 'Ich esse Marmelade.', 'Ich esse Apfelkuchen.',
  'Ich esse Nudelsuppe.', 'Ich esse Apfelmus.', 'Ich habe Geschenke.', 'Wo ist das Kaninchen?',
  'Wo ist die Schultasche?', 'Wo ist der Kalender?', 'Das ist ein Regenbogen.', 'Das ist eine Pyramide.',
  'Das ist ein Baumhaus.', 'Die Haustür ist rot.', 'Das Karussell ist toll.', 'Die Badewanne ist voll.',
  'Die Waschmaschine ist laut.', 'Der Computer ist fantastisch.', 'Die Familie ist da.|da ist die familie',
  'Opa ist im Baumhaus.|im baumhaus ist opa', 'Ich spiele Gitarre.', 'Ich baue ein Baumhaus.'
];

/** Sentences of the long-neck journey. */
export const SENTENCES_LONGNECK = parseSentenceSpecs(SPECS, 'l');
