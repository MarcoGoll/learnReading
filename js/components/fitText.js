/** Selector of the text cards whose letters, syllables, words, or sentences must fit their box. */
const FIT_SELECTOR = '.item-card';

/** Smallest scale factor, so that text never becomes unreadably small. */
const MIN_SCALE = 0.3;

/**
 * Returns the inner width (without padding) of an element.
 * @param {HTMLElement} element - Element.
 * @returns {number} Width in pixels.
 */
function innerWidth(element) {
  const style = getComputedStyle(element);
  return element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
}

/**
 * Shrinks the font size of a text card until it fits into its parent box.
 * The card first returns to its CSS size, so it grows again when there is more room.
 * @param {HTMLElement} card - Item card element.
 */
export function fitCard(card) {
  const parent = card.parentElement;
  card.style.fontSize = '';
  if (!parent) return;
  const available = innerWidth(parent);
  const needed = card.scrollWidth;
  if (available <= 0 || needed <= available) return;
  const scale = Math.max(MIN_SCALE, (available / needed) * 0.97);
  card.style.fontSize = `${parseFloat(getComputedStyle(card).fontSize) * scale}px`;
}

/**
 * Fits all text cards inside a root element (including the root itself).
 * @param {ParentNode} root - Root element or document.
 */
function fitAll(root) {
  if (root instanceof HTMLElement && root.matches(FIT_SELECTOR)) fitCard(root);
  root.querySelectorAll(FIT_SELECTOR).forEach(fitCard);
}

/**
 * Keeps every text card of the app inside its box: fits new cards when they appear,
 * and all cards again when the window size changes or the web fonts finish loading.
 */
export function installTextFitting() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) fitAll(node);
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => fitAll(document));
  if (document.fonts) document.fonts.ready.then(() => fitAll(document));
}
