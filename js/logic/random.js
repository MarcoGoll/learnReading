/**
 * Returns a shuffled copy of the given array (Fisher-Yates).
 * @param {Array} items - Items to shuffle.
 * @param {Function} [randomFn=Math.random] - Random number source in [0, 1).
 * @returns {Array} New shuffled array.
 */
export function shuffle(items, randomFn = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(randomFn() * (i + 1));
    [result[i], result[swapIndex]] = [result[swapIndex], result[i]];
  }
  return result;
}

/**
 * Picks one random element of an array.
 * @param {Array} items - Items to pick from.
 * @param {Function} [randomFn=Math.random] - Random number source in [0, 1).
 * @returns {*} The picked element or undefined for an empty array.
 */
export function pickRandom(items, randomFn = Math.random) {
  if (items.length === 0) {
    return undefined;
  }
  return items[Math.floor(randomFn() * items.length)];
}

/**
 * Builds a round: preferred items first (shuffled), filled up with the rest (shuffled).
 * @param {Array} preferredItems - Items that should come first.
 * @param {Array} otherItems - Items used to fill up the round.
 * @param {number} maxSize - Maximum round size.
 * @param {Function} [randomFn=Math.random] - Random number source.
 * @returns {Array} The round items.
 */
export function preferThenFill(preferredItems, otherItems, maxSize, randomFn = Math.random) {
  const preferred = shuffle(preferredItems, randomFn).slice(0, maxSize);
  const fill = shuffle(otherItems, randomFn).slice(0, maxSize - preferred.length);
  return [...preferred, ...fill];
}

/**
 * Adds items to a list without duplicates, keeping the original order.
 * @param {Array<string>} list - Existing list.
 * @param {Array<string>} newItems - Items to add.
 * @returns {Array<string>} Merged list.
 */
export function mergeUnique(list, newItems) {
  const merged = [...list];
  newItems.forEach((item) => {
    if (!merged.includes(item)) {
      merged.push(item);
    }
  });
  return merged;
}
