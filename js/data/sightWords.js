/** Sight words ("Merkwoerter") that may appear in sentences without being learned. */
export const SIGHT_WORDS = ['ich', 'du', 'die', 'der', 'das', 'ist', 'und', 'ein', 'eine', 'hat', 'im', 'mit', 'da', 'wo', 'so'];

/** Additional sight words of the short stories (pterosaur journey). */
export const STORY_SIGHT_WORDS = [
  'einen', 'auf', 'in', 'auch', 'er', 'sie', 'es', 'nicht', 'wir', 'war', 'bin', 'mir', 'dem', 'den',
  'will', 'bald', 'weg', 'jetzt', 'was', 'wer', 'wen'
];

/** All sight words. */
export const ALL_SIGHT_WORDS = [...SIGHT_WORDS, ...STORY_SIGHT_WORDS];
