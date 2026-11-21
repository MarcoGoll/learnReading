import { missingNumberVariant } from './missingNumber.js';
import { mathMemoryVariant } from './mathMemory.js';
import { numberWallVariant } from './numberWall.js';
import { numberLineVariant } from './numberLine.js';
import { shareFoodVariant } from './shareFood.js';

/** All math level 7 variants in menu order; each dino offers the ones listed in its profile. */
export const MATH_VARIANTS = [missingNumberVariant, mathMemoryVariant, numberWallVariant, numberLineVariant, shareFoodVariant];

/**
 * Returns the variants a math profile offers, in menu order.
 * @param {object} profile - Math profile.
 * @returns {Array<object>} Variants.
 */
export function mathVariantsOf(profile) {
  return MATH_VARIANTS.filter((variant) => profile.challenge.variants.includes(variant.id));
}

/**
 * Finds a math variant by id.
 * @param {string} id - Variant id.
 * @returns {object|undefined} Variant.
 */
export function mathVariantById(id) {
  return MATH_VARIANTS.find((variant) => variant.id === id);
}
