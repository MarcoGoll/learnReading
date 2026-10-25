import { parseWordSpecs } from './wordParser.js';

/**
 * Word list of the Triceratops journey: words with closed syllables (ending in a consonant)
 * and letter combinations (St, Sp, Pf, Qu, ck, ng, nk, double consonants). Same spec format as words.js.
 */
const WORD_SPECS = [
  // Nouns: things
  'Ball n p', 'Bett n p', 'Tisch n p', 'Buch n p', 'Dach n', 'Topf n p', 'Sack n', 'Rock n p', 'Stock n p',
  'Stein n p', 'Ring n p', 'Bank n p', 'Kan-ne n p', 'Pup-pe n p', 'Tel-ler n p', 'Kof-fer n p', 'Ham-mer n p',
  'Bus n p', 'Hut n p', 'Schiff n p', 'Tas-se n p', 'Haus n p', 'Zaun n', 'Mes-ser n', 'Kis-sen n', 'Löf-fel n',
  'Ga-bel n', 'Pin-sel n', 'Man-tel n', 'Ja-cke n', 'Müt-ze n', 'Lam-pe n p', 'Ker-ze n', 'Fen-ster n',
  'Spie-gel n', 'Pfan-ne n', 'Zan-ge n', 'An-ker n p', 'We-cker n', 'Be-cher n', 'Tür n', 'Loch n', 'Stall n',
  'Zim-mer n', 'Kas-se n', 'Ei-mer n', 'De-cke n', 'Rei-fen n', 'Spiel n',
  // Nouns: nature and food
  'Son-ne n p', 'Wol-ke n p', 'Baum n p', 'Tan-ne n p', 'Nuss n p', 'Nest n p', 'Ast n', 'Stamm n', 'Was-ser n',
  'Ku-chen n p', 'Nu-del n p', 'Sup-pe n p', 'Ap-fel n p', 'Mus n', 'Gur-ke n', 'Tul-pe n', 'Ho-nig n',
  // Nouns: animals
  'Fisch n p', 'Spin-ne n p', 'Qual-le n p', 'Bär n p', 'Lamm n', 'Schaf n p', 'Maus n p', 'E-sel n p',
  'I-gel n p', 'Ti-ger n p', 'Af-fe n p', 'En-te n p', 'Kä-fer n', 'Ka-mel n', 'Kat-ze n p', 'Da-ckel n',
  'Pfau n', 'Pfo-te n', 'Fell n',
  // Nouns: people and body
  'Mut-ter n', 'Mann n', 'Bein n', 'Bauch n', 'Kopf n', 'Zopf n', 'Koch n', 'Fin-ger n', 'Win-ter n',
  // Verbs (first person singular)
  'spie-le v', 'stel-le v', 'ren-ne v', 'kom-me v', 'fal-le v', 'sin-ge v', 'tan-ze v', 'ki-cke v',
  'pa-cke v', 'ba-cke v', 'ste-cke v', 'pfei-fe v', 'ken-ne v', 'win-ke v', 'den-ke v', 'hal-te v',
  'fin-de v', 'bin-de v', 'wer-fe v', 'hel-fe v', 'ler-ne v', 'war-te v', 'es-se v', 'schen-ke v',
  // Adjectives
  'dick a', 'dünn a', 'nass a', 'satt a', 'hell a', 'toll a', 'voll a', 'still a', 'dun-kel a',
  'lus-tig a', 'lang a', 'nett a', 'rot a', 'laut a', 'fit a'
];

/** Words of the Triceratops journey. */
export const WORDS_TRICERATOPS = parseWordSpecs(WORD_SPECS);
