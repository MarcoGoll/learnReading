/**
 * Creates a deterministic random number source for tests (linear congruential generator).
 * @param {number} [seed=1] - Start value.
 * @returns {Function} Function returning numbers in [0, 1).
 */
export function seededRandom(seed = 1) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

/**
 * Creates an in-memory storage double with the localStorage API.
 * @returns {object} Storage double.
 */
export function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
}
