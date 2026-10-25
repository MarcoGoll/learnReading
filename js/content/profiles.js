import { LETTERS, COMBINATIONS, letterById } from '../data/letters.js';
import { SYLLABLES, OPEN_SYLLABLES } from '../data/syllables.js';
import { WORDS } from '../data/words.js';
import { WORDS_TRICERATOPS } from '../data/wordsTriceratops.js';
import { WORDS_LONGNECK } from '../data/wordsLongneck.js';
import { ALL_WORDS, wordById } from '../data/allWords.js';
import { SENTENCES } from '../data/sentences.js';
import { SENTENCES_TRICERATOPS } from '../data/sentencesTriceratops.js';
import { SENTENCES_LONGNECK } from '../data/sentencesLongneck.js';
import { STORIES, storyWordIds } from '../data/stories.js';
import { ALL_SIGHT_WORDS } from '../data/sightWords.js';
import { contentOf, customWordsOf, registerCustomContent, syllableEntriesFor } from './customContent.js';

/** Hint for adults in level 1 of the first journey. */
const LETTER_HINT = 'Es zählt der Laut (mmm), nicht der Buchstabenname (em).';

/** Hint for adults in level 1 of the Triceratops journey. */
const COMBINATION_HINT = 'Es zählt der gemeinsame Laut (z. B. "scht" bei St), nicht die einzelnen Buchstaben.';

/** Long words: 3+ syllables or compound words of all lists. */
const LONG_WORDS = [...WORDS_LONGNECK, ...ALL_WORDS.filter((word) => word.syllables.length >= 3)]
  .filter((word, index, list) => list.findIndex((other) => other.id === word.id) === index);

/** Words that occur in the stories. */
const STORY_WORDS = storyWordIds((token) => Boolean(wordById(token)) && !ALL_SIGHT_WORDS.includes(token)).map(wordById);

/** Story sentences with 2-4 words, usable in the sentence variants of the pterosaur journey. */
const STORY_SHORT_SENTENCES = STORIES.flatMap((story) => story.sentences).filter((sentence) => sentence.tokens.length <= 4);

/**
 * Content profiles per journey: which items each level uses.
 * level1.mode "select": the adult selects known items; "review": random mastered items.
 * level3Mode "words" or "stories".
 */
export const PROFILES = {
  trex: {
    level1: { mode: 'select', items: LETTERS, hint: LETTER_HINT, vowelHint: true },
    syllableSource: OPEN_SYLLABLES,
    words: WORDS,
    sentences: SENTENCES,
    level3Mode: 'words',
    variants: ['sentenceReading', 'wordPicture', 'findTheWord', 'gapSentence', 'wordMemory', 'sentenceBuilder']
  },
  triceratops: {
    level1: { mode: 'select', items: COMBINATIONS, hint: COMBINATION_HINT, vowelHint: false },
    syllableSource: syllablesOfWords(WORDS_TRICERATOPS),
    words: WORDS_TRICERATOPS,
    sentences: SENTENCES_TRICERATOPS,
    level3Mode: 'words',
    variants: ['sentenceReading', 'wordPicture', 'findTheWord', 'gapSentence', 'wordMemory', 'sentenceBuilder']
  },
  longneck: {
    level1: { mode: 'review', hint: LETTER_HINT, vowelHint: false },
    syllableSource: syllablesOfWords(LONG_WORDS),
    words: LONG_WORDS,
    sentences: SENTENCES_LONGNECK,
    level3Mode: 'words',
    variants: ['sentenceReading', 'wordPicture', 'findTheWord', 'gapSentence', 'wordMemory', 'sentenceBuilder']
  },
  pterosaur: {
    level1: { mode: 'review', hint: LETTER_HINT, vowelHint: false },
    syllableSource: syllablesOfWords(STORY_WORDS),
    words: STORY_WORDS,
    sentences: [...STORY_SHORT_SENTENCES, ...SENTENCES_TRICERATOPS],
    level3Mode: 'stories',
    variants: ['story', 'sentenceReading', 'wordPicture', 'findTheWord', 'gapSentence', 'wordMemory', 'sentenceBuilder']
  }
};

/**
 * Returns the syllable entries used by a list of words.
 * @param {Array<object>} words - Words.
 * @returns {Array<object>} Syllables.
 */
function syllablesOfWords(words) {
  const ids = new Set(words.flatMap((word) => word.syllables));
  return SYLLABLES.filter((syllable) => ids.has(syllable.id));
}

/** Merged profiles per journey, rebuilt when the custom content changes. */
const mergedCache = new Map();

/**
 * Merges a built-in profile with the custom content: hidden words are removed, custom words of the
 * journey and their syllables are added.
 * @param {string} journeyId - Journey id.
 * @param {object} state - Game state.
 * @returns {object} Merged profile.
 */
function mergeProfile(journeyId, state) {
  const base = PROFILES[journeyId];
  const hidden = new Set(contentOf(state).hiddenWordIds);
  const baseIds = new Set(base.words.map((word) => word.id));
  const customs = customWordsOf(state, journeyId).filter((word) => !baseIds.has(word.id));
  const sourceIds = new Set(base.syllableSource.map((syllable) => syllable.id));
  const newSyllables = syllableEntriesFor(customs.flatMap((word) => word.syllables)).filter((syllable) => !sourceIds.has(syllable.id));
  return {
    ...base,
    words: [...base.words.filter((word) => !hidden.has(word.id)), ...customs],
    syllableSource: [...base.syllableSource, ...newSyllables]
  };
}

/**
 * Returns the content profile of a journey, including the custom words of the state.
 * @param {string} journeyId - Journey id.
 * @param {object} [state] - Game state; without it the built-in profile is returned.
 * @returns {object} Profile.
 */
export function profileOf(journeyId, state) {
  if (!state) return PROFILES[journeyId];
  const key = JSON.stringify(contentOf(state));
  const cached = mergedCache.get(journeyId);
  if (cached && cached.key === key) return cached.profile;
  registerCustomContent(state);
  const profile = mergeProfile(journeyId, state);
  mergedCache.set(journeyId, { key, profile });
  return profile;
}

/**
 * Returns the content profile of the active journey, including the custom words.
 * @param {object} state - Game state.
 * @returns {object} Profile.
 */
export function activeProfile(state) {
  return profileOf(state.activeJourney, state);
}

/**
 * Returns the sound items that can appear in a review round (all mastered letters and combinations).
 * @param {object} state - Game state.
 * @returns {Array<object>} Sound items.
 */
export function reviewItems(state) {
  return state.pools.letters.map(letterById).filter(Boolean);
}
