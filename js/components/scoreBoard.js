import { el, icon, restartAnimation } from './dom.js';
import { STREAK_THRESHOLD } from '../logic/scoring.js';

/**
 * Creates the score board shown during a round: round score, level record, and streak badge.
 * @param {number} record - Current record of the level.
 * @returns {{element: HTMLElement, scoreElement: HTMLElement, update: Function}} Score board API.
 */
export function createScoreBoard(record) {
  const scoreValue = el('span', { className: 'score-board__value', text: '0' });
  const streakBadge = el('span', { className: 'score-board__streak', attrs: { 'aria-live': 'polite' } });
  const element = el('div', { className: 'score-board' }, [
    el('div', { className: 'score-board__score' }, [icon('star', 'score-board__icon'), scoreValue]),
    el('div', { className: 'score-board__record', text: `Rekord: ${record}` }),
    streakBadge
  ]);
  let lastStreak = 0;
  return {
    element,
    scoreElement: scoreValue,
    update(roundScore, streak) {
      scoreValue.textContent = String(roundScore);
      const showStreak = streak >= STREAK_THRESHOLD;
      streakBadge.textContent = showStreak ? `${streak}er-Serie!` : '';
      streakBadge.classList.toggle('score-board__streak--visible', showStreak);
      if (showStreak && streak > lastStreak) {
        restartAnimation(streakBadge, 'score-board__streak--pop');
      }
      lastStreak = streak;
    }
  };
}
