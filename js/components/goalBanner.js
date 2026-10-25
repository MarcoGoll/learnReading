import { el, icon, restartAnimation } from './dom.js';
import { playSound } from '../audio/soundPlayer.js';

/**
 * Returns the status line of a goal.
 * @param {object} goal - Goal from levelGoal.
 * @param {number} level - Level number.
 * @returns {string} Status text.
 */
function statusText(goal, level) {
  if (goal.statusOverride) {
    return goal.statusOverride;
  }
  if (goal.wasCompleted) {
    return `Level ${level} ist schon geschafft. Du sammelst jetzt Extra-Punkte!`;
  }
  if (goal.isReached) {
    return level === 5
      ? 'Geschafft! Der Dino wächst gleich.'
      : `Ziel erreicht! Spiel die Runde zu Ende, dann ist Level ${level} geschafft.`;
  }
  return goal.detail;
}

/**
 * Creates the goal banner shown at the top of a level: goal text, progress bar, and status.
 * @param {number} level - Level number.
 * @returns {{element: HTMLElement, update: Function}} Banner API; update takes a goal.
 */
export function createGoalBanner(level) {
  const fill = el('span', { className: 'goal-banner__fill' });
  const status = el('span', { className: 'goal-banner__status', attrs: { 'aria-live': 'polite' } });
  const text = el('span', { className: 'goal-banner__text' });
  const element = el('div', { className: 'goal-banner' }, [
    icon('star', 'goal-banner__icon'),
    el('div', { className: 'goal-banner__body' }, [text, el('span', { className: 'goal-banner__bar' }, [fill]), status])
  ]);
  let wasReached = null;
  return {
    element,
    update(goal) {
      text.textContent = goal.text;
      fill.style.width = `${Math.round((goal.current / goal.target) * 100)}%`;
      status.textContent = statusText(goal, level);
      const isReached = goal.isReached || goal.wasCompleted;
      element.classList.toggle('goal-banner--reached', isReached);
      if (wasReached === false && isReached) {
        restartAnimation(element, 'goal-banner--celebrate');
        playSound('levelComplete');
      }
      wasReached = isReached;
    }
  };
}
