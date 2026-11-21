import { missingNumberVariant } from './missingNumber.js';
import { mathMemoryVariant } from './mathMemory.js';
import { numberWallVariant } from './numberWall.js';
import { numberLineVariant } from './numberLine.js';

/** All math level 7 variants in menu order. Every variant is always available (tasks are generated). */
export const MATH_VARIANTS = [missingNumberVariant, mathMemoryVariant, numberWallVariant, numberLineVariant];

/**
 * Finds a math variant by id.
 * @param {string} id - Variant id.
 * @returns {object|undefined} Variant.
 */
export function mathVariantById(id) {
  return MATH_VARIANTS.find((variant) => variant.id === id);
}
