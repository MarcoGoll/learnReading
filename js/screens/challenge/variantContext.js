import { ALL_WORDS, wordById } from '../../data/allWords.js';
import { ALL_SIGHT_WORDS } from '../../data/sightWords.js';
import { activeProfile } from '../../content/profiles.js';
import { level5WordIds, readableWords } from '../../content/levelRules.js';
import { availableSentences } from '../../logic/sentences.js';
import { pictureTargets } from '../../logic/wordPicture.js';

/**
 * Collects the word material of the active journey for the level 5 variants.
 * @param {object} state - Game state.
 * @returns {object} Material: wordIds, words, fallbackWords, sentences, pictureTargets.
 */
export function collectMaterial(state) {
  const wordIds = level5WordIds(state);
  return {
    wordIds,
    words: wordIds.map(wordById).filter(Boolean),
    fallbackWords: readableWords(state),
    sentences: availableSentences(wordIds, activeProfile(state).sentences, ALL_SIGHT_WORDS),
    pictureTargets: pictureTargets(wordIds, ALL_WORDS)
  };
}
