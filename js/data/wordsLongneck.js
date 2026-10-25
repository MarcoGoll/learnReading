import { parseWordSpecs } from './wordParser.js';

/**
 * New words of the long-neck journey: words with 3-4 syllables and compound words.
 * Compound words name their part words with "=part+part" (ids from any word list).
 * The long-neck journey also uses the 3+ syllable words of the earlier lists.
 */
const WORD_SPECS = [
  // Long words
  'Di-no-sau-ri-er n', 'Kar-tof-fel n p', 'Pap-ri-ka n', 'A-na-nas n p', 'Mar-me-la-de n p', 'Ham-pel-mann n',
  'Re-gen-bo-gen n p', 'Py-ra-mi-de n p', 'Ka-nin-chen n p', 'Gi-tar-re n p', 'Ka-rot-te n p', 'Te-le-fon n p',
  'Ka-len-der n p', 'Com-pu-ter n p', 'Mu-se-um n', 'Fa-mi-li-e n p', 'Ge-schen-ke n p',
  'Ka-rus-sell n p', 'Ba-de-wan-ne n p', 'Wasch-ma-schi-ne n p', 'Kas-per-le n', 'Kin-der-gar-ten n',
  'Schul-ta-sche n p', 'Ka-ra-wa-ne n',
  // Compound words
  'Nu-del-sup-pe n =nudel+suppe', 'Haus-tür n p =haus+tür', 'Di-no-ei n p =dino+ei', 'Baum-haus n p =baum+haus',
  'Fisch-sup-pe n =fisch+suppe', 'Kä-se-ku-chen n p =käse+kuchen', 'Maus-loch n =maus+loch',
  'Was-ser-ei-mer n =wasser+eimer', 'So-fa-kis-sen n =sofa+kissen', 'Au-to-rei-fen n =auto+reifen',
  'La-ma-fell n =lama+fell', 'Bett-de-cke n =bett+decke', 'Tisch-lam-pe n p =tisch+lampe', 'Koch-topf n =koch+topf',
  'Ti-ger-en-te n =tiger+ente', 'I-gel-nest n =igel+nest', 'Was-ser-me-lo-ne n p =wasser+melone',
  'Ring-fin-ger n =ring+finger', 'Baum-stamm n =baum+stamm', 'Ball-spiel n =ball+spiel',
  'Spiel-zim-mer n =spiel+zimmer', 'Was-ser-ball n =wasser+ball', 'Ap-fel-mus n =apfel+mus',
  'Ap-fel-baum n p =apfel+baum', 'Ap-fel-ku-chen n =apfel+kuchen', 'Do-mi-no-stein n =domino+stein',
  'Ki-no-kas-se n =kino+kasse', 'Ho-nig-ku-chen n =honig+kuchen',
  // Verbs and adjectives with 3+ syllables
  'te-le-fo-nie-re v', 'ba-lan-cie-re v', 'mar-schie-re v', 'spa-zie-re v', 'mu-si-zie-re v', 'ra-sie-re v',
  'sor-tie-re v', 'kas-sie-re v', 'wun-der-bar a', 'fan-tas-tisch a'
];

/** New words of the long-neck journey. */
export const WORDS_LONGNECK = parseWordSpecs(WORD_SPECS);
