/**
 * Creates a DOM element.
 * @param {string} tag - Tag name.
 * @param {object} [options] - Element options.
 * @param {string} [options.className] - CSS classes.
 * @param {string} [options.text] - Text content.
 * @param {string} [options.html] - Inner HTML (only for trusted, static markup such as SVG).
 * @param {object} [options.attrs] - Attributes.
 * @param {object} [options.on] - Event listeners by event name.
 * @param {Array<Node>} [children] - Child nodes.
 * @returns {HTMLElement} The element.
 */
export function el(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.html !== undefined) element.innerHTML = options.html;
  Object.entries(options.attrs || {}).forEach(([name, value]) => element.setAttribute(name, value));
  Object.entries(options.on || {}).forEach(([name, handler]) => element.addEventListener(name, handler));
  children.filter(Boolean).forEach((child) => element.append(child));
  return element;
}

/**
 * Creates an icon element that shows a Material icon from assets/icons via CSS mask.
 * The URL is relative to css/base.css, where the custom property is used.
 * @param {string} name - Icon file name without extension.
 * @param {string} [extraClass] - Additional CSS classes.
 * @returns {HTMLElement} Icon element.
 */
export function icon(name, extraClass = '') {
  const element = el('span', { className: `icon ${extraClass}`.trim(), attrs: { 'aria-hidden': 'true' } });
  element.style.setProperty('--icon-url', `url("../assets/icons/${name}.svg")`);
  return element;
}

/**
 * Creates a button with an icon and an optional label.
 * @param {object} options - Button options.
 * @param {string} options.className - CSS classes.
 * @param {string} [options.iconName] - Icon name.
 * @param {string} [options.label] - Visible label.
 * @param {string} [options.title] - Accessible name if no label is shown.
 * @param {Function} options.onClick - Click handler.
 * @returns {HTMLButtonElement} Button.
 */
export function button({ className, iconName, label, title, onClick }) {
  const attrs = { type: 'button' };
  if (title) attrs['aria-label'] = title;
  if (title) attrs.title = title;
  const children = [iconName ? icon(iconName) : null, label ? el('span', { text: label }) : null];
  return el('button', { className, attrs, on: { click: onClick } }, children);
}

/**
 * Waits for the given time.
 * @param {number} milliseconds - Time to wait.
 * @returns {Promise<void>} Resolves after the time.
 */
export function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Restarts a CSS animation class on an element.
 * @param {HTMLElement} element - Element to animate.
 * @param {string} className - Animation class.
 */
export function restartAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

/**
 * Checks whether the user prefers reduced motion.
 * @returns {boolean} True if reduced motion is requested.
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
