/** Cache of loaded SVG markup by path. */
const svgCache = new Map();

/**
 * Loads SVG files once so they can later be inlined synchronously.
 * @param {Array<string>} paths - SVG paths relative to the page.
 * @returns {Promise<void>} Resolves when all files are loaded.
 */
export async function preloadSvgs(paths) {
  await Promise.all(paths.map(async (path) => {
    if (svgCache.has(path)) {
      return;
    }
    const response = await fetch(path);
    svgCache.set(path, response.ok ? await response.text() : '');
  }));
}

/**
 * Returns the markup of a preloaded SVG file.
 * @param {string} path - SVG path.
 * @returns {string} SVG markup or an empty string.
 */
export function getSvg(path) {
  return svgCache.get(path) || '';
}

/**
 * Returns the inner markup (without the outer svg element) of a preloaded SVG file.
 * @param {string} path - SVG path.
 * @returns {string} Inner markup.
 */
export function getSvgInner(path) {
  const markup = getSvg(path);
  const start = markup.indexOf('>', markup.indexOf('<svg')) + 1;
  const end = markup.lastIndexOf('</svg>');
  return start > 0 && end > start ? markup.slice(start, end) : '';
}
