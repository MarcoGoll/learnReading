import { WORDS, wordById } from '../../data/words.js';
import { SYLLABLES } from '../../data/syllables.js';
import { SENTENCES, SIGHT_WORDS } from '../../data/sentences.js';
import { wordMaterial } from '../../logic/challengeLevel.js';
import { buildableWords } from '../../logic/wordLevel.js';
import { availableSentences } from '../../logic/sentences.js';
import { pictureTargets } from '../../logic/wordPicture.js';

/**
 * Collects the word material of the child for the level 5 variants.
 * @param {object} state - Game state.
 * @returns {object} Material: wordIds, words, fallbackWords, sentences, pictureTargets.
 */
export function collectMaterial(state) {
  const wordIds = wordMaterial(state.pools);
  const words = wordIds.map(wordById).filter(Boolean);
  const syllableIds = state.pools.syllables.length > 0 ? state.pools.syllables : SYLLABLES.map((syllable) => syllable.id);
  return {
    wordIds,
    words,
    fallbackWords: buildableWords(syllableIds, WORDS),
    sentences: availableSentences(wordIds, SENTENCES, SIGHT_WORDS),
    pictureTargets: pictureTargets(wordIds, WORDS)
  };
}
