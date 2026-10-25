import { el, icon, restartAnimation } from './dom.js';

/** Colors of confetti pieces and stars. */
const PARTY_COLORS = ['#ff8f3a', '#43a047', '#1e88e5', '#e53935', '#ffc107', '#ab47bc'];

/**
 * Lets an element bounce (correct answer).
 * @param {HTMLElement} element - Element to animate.
 */
export function bounce(element) {
  restartAnimation(element, 'effects--bounce');
}

/**
 * Lets an element wiggle horizontally (wrong answer).
 * @param {HTMLElement} element - Element to animate.
 */
export function wiggle(element) {
  restartAnimation(element, 'effects--wiggle');
}

/**
 * Shows a burst of small stars around an element.
 * @param {HTMLElement} element - Center element.
 * @param {number} [count=10] - Number of stars.
 */
export function burstStars(element, count = 10) {
  const rect = element.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const distance = 70 + Math.random() * 60;
    const star = icon('star', 'effects__star');
    star.style.left = `${rect.left + rect.width / 2}px`;
    star.style.top = `${rect.top + rect.height / 2}px`;
    star.style.color = PARTY_COLORS[i % PARTY_COLORS.length];
    star.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    star.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    document.body.append(star);
    star.addEventListener('animationend', () => star.remove());
  }
}

/**
 * Lets a "+points" label fly from one element to another.
 * @param {HTMLElement} fromElement - Start element.
 * @param {HTMLElement} toElement - Target element (score display).
 * @param {number} points - Points shown.
 */
export function flyPoints(fromElement, toElement, points) {
  if (!fromElement || !toElement || points <= 0) {
    return;
  }
  const from = fromElement.getBoundingClientRect();
  const to = toElement.getBoundingClientRect();
  const label = el('span', { className: 'effects__points', text: `+${points}` });
  label.style.left = `${from.left + from.width / 2}px`;
  label.style.top = `${from.top + from.height / 2}px`;
  label.style.setProperty('--dx', `${to.left + to.width / 2 - (from.left + from.width / 2)}px`);
  label.style.setProperty('--dy', `${to.top + to.height / 2 - (from.top + from.height / 2)}px`);
  document.body.append(label);
  label.addEventListener('animationend', () => {
    label.remove();
    restartAnimation(toElement, 'effects--pop');
  });
}

/**
 * Shows falling confetti over the whole screen.
 * @param {number} [count=80] - Number of pieces.
 */
export function confetti(count = 80) {
  const layer = el('div', { className: 'effects__confetti-layer', attrs: { 'aria-hidden': 'true' } });
  for (let i = 0; i < count; i++) {
    const piece = el('span', { className: 'effects__confetti' });
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = PARTY_COLORS[i % PARTY_COLORS.length];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 160}px`);
    layer.append(piece);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 4500);
}
