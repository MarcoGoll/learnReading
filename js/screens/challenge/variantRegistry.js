import { sentenceReadingVariant } from './sentenceReading.js';
import { wordPictureVariant } from './wordPicture.js';
import { findTheWordVariant } from './findTheWord.js';
import { gapSentenceVariant } from './gapSentence.js';
import { wordMemoryVariant } from './wordMemory.js';
import { sentenceBuilderVariant } from './sentenceBuilder.js';

/** All level 5 variants in menu order. */
export const VARIANTS = [
  sentenceReadingVariant,
  wordPictureVariant,
  findTheWordVariant,
  gapSentenceVariant,
  wordMemoryVariant,
  sentenceBuilderVariant
];

/**
 * Finds a variant by id.
 * @param {string} id - Variant id.
 * @returns {object|undefined} Variant.
 */
export function variantById(id) {
  return VARIANTS.find((variant) => variant.id === id);
}
