import { el, button, icon, wait } from './dom.js';
import { confetti } from './effects.js';
import { playSound } from '../audio/soundPlayer.js';

/**
 * Builds a small statistic tile of the summary.
 * @param {string} label - Label text.
 * @param {number} value - Value.
 * @param {string} [modifier] - Optional BEM modifier.
 * @returns {HTMLElement} Tile.
 */
function statTile(label, value, modifier = '') {
  return el('div', { className: `round-summary__stat ${modifier}`.trim() }, [
    el('span', { className: 'round-summary__stat-value', text: String(value) }),
    el('span', { className: 'round-summary__stat-label', text: label })
  ]);
}

/**
 * Builds the reward unlock notices.
 * @param {Array<object>} rewards - Newly unlocked rewards.
 * @returns {HTMLElement|null} Notice list or null.
 */
function rewardNotices(rewards) {
  if (!rewards || rewards.length === 0) {
    return null;
  }
  return el('div', { className: 'reward-popup' }, rewards.map((reward) => el('p', { className: 'reward-popup__item' }, [
    icon('checkroom', 'reward-popup__icon'), el('span', { text: `Neu für deinen Dino: ${reward.name}!` })
  ])));
}

/**
 * Shows the round summary inside a container.
 * @param {HTMLElement} container - Target container (its content is replaced).
 * @param {object} summary - Summary data.
 * @param {string} summary.title - Title text.
 * @param {number} summary.roundScore - Round score.
 * @param {number|null} summary.record - Level record after the round (null hides it).
 * @param {number} summary.total - Total points.
 * @param {boolean} summary.isNewRecord - Whether a new record was set.
 * @param {string} [summary.message] - Additional message (e.g. what is missing).
 * @param {Array<object>} [summary.unlockedRewards] - Newly unlocked rewards.
 * @param {HTMLElement} [summary.goalElement] - Goal banner showing the level progress.
 * @param {Array<object>} summary.actions - Buttons: { label, iconName, onClick, primary }.
 */
export function showRoundSummary(container, summary) {
  const actions = summary.actions.map((action) => button({
    className: action.primary ? 'big-button' : 'big-button big-button--quiet',
    iconName: action.iconName, label: action.label, onClick: action.onClick
  }));
  const card = el('section', { className: 'round-summary card' }, [
    el('h2', { className: 'round-summary__title', text: summary.title }),
    summary.isNewRecord ? el('p', { className: 'round-summary__record', text: 'Neuer Rekord!' }) : null,
    el('div', { className: 'round-summary__stats' }, [
      statTile('Punkte', summary.roundScore, 'round-summary__stat--main'),
      summary.record === null ? null : statTile('Rekord', summary.record),
      statTile('Gesamt', summary.total)
    ]),
    summary.goalElement || null,
    summary.message ? el('p', { className: 'round-summary__message', text: summary.message }) : null,
    rewardNotices(summary.unlockedRewards),
    el('div', { className: 'round-summary__actions' }, actions)
  ]);
  container.replaceChildren(card);
  celebrate(summary);
}

/**
 * Plays the sounds and effects of the summary.
 * @param {object} summary - Summary data.
 */
async function celebrate(summary) {
  playSound(summary.levelCompletedNow ? 'levelComplete' : 'click');
  if (summary.isNewRecord) {
    await wait(700);
    playSound('newRecord');
    confetti();
  }
  if (summary.unlockedRewards && summary.unlockedRewards.length > 0) {
    await wait(900);
    playSound('reward');
  }
}
