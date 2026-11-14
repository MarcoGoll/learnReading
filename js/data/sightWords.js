/** Sight words ("Merkwoerter") that may appear in sentences without being learned. */
export const SIGHT_WORDS = ['ich', 'du', 'die', 'der', 'das', 'ist', 'und', 'ein', 'eine', 'hat', 'im', 'mit', 'da', 'wo', 'so'];

/** Additional sight words of the short stories (pterosaur journey). */
export const STORY_SIGHT_WORDS = [
  'einen', 'auf', 'in', 'auch', 'er', 'sie', 'es', 'nicht', 'wir', 'war', 'bin', 'mir', 'dem', 'den',
  'will', 'bald', 'weg', 'jetzt', 'was', 'wer', 'wen',
  'dann', 'zu', 'an', 'aus', 'von', 'mein', 'meine', 'dein', 'deine', 'sehr', 'kein', 'keine', 'heute', 'noch',
  'schon', 'gern', 'hier', 'am', 'zum', 'ins', 'oder', 'aber', 'wie', 'sein', 'seine', 'ihr', 'ihre', 'uns',
  'mich', 'dich', 'sich', 'dir', 'ihn', 'ihm', 'alle', 'zwei', 'drei', 'einem', 'einer', 'unter', 'hinter',
  'neben', 'vor', 'nach', 'bei', 'denn', 'wieder', 'immer', 'nun', 'zur', 'vom', 'beim', 'ans', 'um',
  'durch', 'über', 'wohin', 'worauf', 'womit', 'wem', 'hin', 'oben', 'viele', 'keinen'
];

/** All sight words. */
export const ALL_SIGHT_WORDS = [...SIGHT_WORDS, ...STORY_SIGHT_WORDS];
