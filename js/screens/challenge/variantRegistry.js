import { sentenceReadingVariant } from './sentenceReading.js';
import { wordPictureVariant } from './wordPicture.js';
import { findTheWordVariant } from './findTheWord.js';
import { gapSentenceVariant } from './gapSentence.js';
import { wordMemoryVariant } from './wordMemory.js';
import { sentenceBuilderVariant } from './sentenceBuilder.js';
import { storyVariant } from './story.js';

/** All level 5 variants in menu order. */
export const VARIANTS = [
  storyVariant,
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

/**
 * Returns the variants of a content profile in menu order.
 * @param {object} profile - Content profile.
 * @returns {Array<object>} Variants.
 */
export function variantsOf(profile) {
  return VARIANTS.filter((variant) => profile.variants.includes(variant.id));
}
