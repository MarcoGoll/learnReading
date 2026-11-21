/**
 * Small SVG building blocks of the math pictures (insects, eggs, food, plates, ten bars, unit cubes).
 * All functions return SVG markup strings positioned at (x, y).
 */

/** Colours of the pictures: first group, second group, faded. */
export const AID_COLORS = { first: '#43a047', second: '#fb8c00', faded: '#cfd8dc', egg: '#fff3e0', eggStroke: '#d7a86e', food: '#e53935' };

/**
 * Returns a small insect (beetle) centred at a point.
 * @param {number} x - Centre x.
 * @param {number} y - Centre y.
 * @param {string} color - Body colour.
 * @param {string} [extraClass=''] - Additional CSS class.
 * @returns {string} SVG markup.
 */
export function insect(x, y, color, extraClass = '') {
  return `<g class="math-aid__insect ${extraClass}" transform="translate(${x} ${y})">`
    + '<path d="M-9 -4 L-13 -8 M9 -4 L13 -8 M-10 2 L-14 2 M10 2 L14 2 M-8 7 L-12 11 M8 7 L12 11" stroke="#37474f" stroke-width="1.6" stroke-linecap="round"/>'
    + `<ellipse cx="0" cy="2" rx="9" ry="10" fill="${color}"/><circle cx="0" cy="-9" r="5" fill="#37474f"/>`
    + '<path d="M0 -6 V12" stroke="#263238" stroke-width="1.2"/><circle cx="-4" cy="0" r="1.8" fill="#263238"/><circle cx="4" cy="5" r="1.8" fill="#263238"/></g>';
}

/**
 * Returns a cross drawn over an object (used for subtraction).
 * @param {number} x - Centre x.
 * @param {number} y - Centre y.
 * @returns {string} SVG markup.
 */
export function crossMark(x, y) {
  return `<path class="math-aid__cross" d="M${x - 11} ${y - 11} L${x + 11} ${y + 11} M${x + 11} ${y - 11} L${x - 11} ${y + 11}" stroke="#e53935" stroke-width="3.5" stroke-linecap="round"/>`;
}

/**
 * Returns an egg centred at a point.
 * @param {number} x - Centre x.
 * @param {number} y - Centre y.
 * @param {number} [size=1] - Scale.
 * @returns {string} SVG markup.
 */
export function egg(x, y, size = 1) {
  return `<ellipse class="math-aid__egg" cx="${x}" cy="${y}" rx="${7 * size}" ry="${9 * size}" fill="${AID_COLORS.egg}" stroke="${AID_COLORS.eggStroke}" stroke-width="1.6"/>`;
}

/**
 * Returns a food piece (berry) centred at a point.
 * @param {number} x - Centre x.
 * @param {number} y - Centre y.
 * @returns {string} SVG markup.
 */
export function food(x, y) {
  return `<g class="math-aid__food"><circle cx="${x}" cy="${y}" r="6" fill="${AID_COLORS.food}"/><path d="M${x} ${y - 6} q2 -4 5 -4" stroke="#2e7d32" stroke-width="1.6" fill="none"/></g>`;
}

/**
 * Returns a small dino head with a plate (used for sharing).
 * @param {number} x - Left x.
 * @param {number} y - Centre y.
 * @returns {string} SVG markup.
 */
export function plateDino(x, y) {
  return `<g class="math-aid__plate-dino"><circle cx="${x + 12}" cy="${y}" r="11" fill="#81c784"/><circle cx="${x + 16}" cy="${y - 3}" r="2.4" fill="#263238"/>`
    + `<path d="M${x + 8} ${y + 5} q5 3 10 0" stroke="#2e7d32" stroke-width="1.6" fill="none"/></g>`;
}

/**
 * Returns a ten bar (10 stacked cells) at a point.
 * @param {number} x - Left x.
 * @param {number} y - Top y.
 * @param {string} color - Fill colour.
 * @returns {string} SVG markup.
 */
export function tenBar(x, y, color) {
  const cells = Array.from({ length: 10 }, (_, index) => `<rect x="${x}" y="${y + index * 8}" width="10" height="8" fill="${color}" stroke="#fff" stroke-width="1"/>`);
  return `<g class="math-aid__ten-bar">${cells.join('')}</g>`;
}

/**
 * Returns a unit cube at a point.
 * @param {number} x - Left x.
 * @param {number} y - Top y.
 * @param {string} color - Fill colour.
 * @returns {string} SVG markup.
 */
export function unitCube(x, y, color) {
  return `<rect class="math-aid__cube" x="${x}" y="${y}" width="10" height="8" fill="${color}" stroke="#fff" stroke-width="1"/>`;
}

/**
 * Returns a frame cell (ten frame / twenty frame).
 * @param {number} x - Left x.
 * @param {number} y - Top y.
 * @param {string|null} color - Dot colour or null for an empty cell.
 * @returns {string} SVG markup.
 */
export function frameCell(x, y, color) {
  const dot = color ? `<circle cx="${x + 12}" cy="${y + 12}" r="8" fill="${color}"/>` : '';
  return `<rect x="${x}" y="${y}" width="24" height="24" fill="#fff" stroke="#90a4ae" stroke-width="1.5"/>${dot}`;
}

/**
 * Wraps markup into an SVG element string with a view box.
 * @param {number} width - View box width.
 * @param {number} height - View box height.
 * @param {string} content - Inner markup.
 * @returns {string} SVG markup.
 */
export function svgWrap(width, height, content) {
  return `<svg viewBox="0 0 ${width} ${height}" class="math-aid__svg" role="img" aria-hidden="true">${content}</svg>`;
}
