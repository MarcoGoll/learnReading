import { el, button, icon } from '../components/dom.js';
import { store } from '../state/store.js';
import { navigate } from '../router.js';
import { difficultItems, activityLastDays, entriesByType } from '../logic/statistics.js';
import { letterById } from '../data/letters.js';
import { wordById } from '../data/words.js';
import { sentenceById } from '../data/sentences.js';

/** Section titles per item type. */
const TYPE_TITLES = { letter: 'Buchstaben', syllable: 'Silben', word: 'Wörter', sentence: 'Sätze' };

/**
 * Returns the display text of a history item.
 * @param {string} type - Item type.
 * @param {string} id - Item id.
 * @returns {string} Display text.
 */
function displayText(type, id) {
  const lookup = { letter: () => letterById(id)?.display, word: () => wordById(id)?.display, sentence: () => sentenceById(id)?.text };
  return (lookup[type] && lookup[type]()) || id;
}

/**
 * Formats a success rate as percent.
 * @param {number} rate - Rate in [0, 1].
 * @returns {string} Percent text.
 */
function percent(rate) {
  return `${Math.round(rate * 100)} %`;
}

/**
 * Returns the color modifier of a success rate.
 * @param {number} rate - Rate in [0, 1].
 * @returns {string} "good", "medium", or "low".
 */
function rateLevel(rate) {
  if (rate >= 0.8) return 'good';
  return rate >= 0.5 ? 'medium' : 'low';
}

/**
 * Builds the "often wrong" list.
 * @param {object} history - History.
 * @returns {HTMLElement} Section.
 */
function difficultSection(history) {
  const items = difficultItems(history);
  const list = items.length === 0
    ? el('p', { text: 'Gerade ist nichts schwierig.' })
    : el('ul', { className: 'parent-stats__list' }, items.map(({ key, entry, rate }) => {
      const [type, id] = key.split(':');
      return el('li', { className: 'parent-stats__list-item' }, [
        el('span', { className: 'parent-stats__item-text', text: displayText(type, id) }),
        el('span', { text: `${percent(rate)} richtig, ${entry.correct + entry.wrong} Versuche` })
      ]);
    }));
  return el('section', { className: 'parent-stats__section' }, [el('h2', { className: 'parents__heading', text: 'Oft falsch' }), list]);
}

/**
 * Builds the bar chart of the last 14 days as inline SVG.
 * @param {object} dailyActivity - Activity per date.
 * @returns {HTMLElement} Section.
 */
function activitySection(dailyActivity) {
  const days = activityLastDays(dailyActivity, 14);
  const maxCount = Math.max(1, ...days.map((day) => day.count));
  const barWidth = 40;
  const bars = days.map((day, index) => {
    const height = Math.round((day.count / maxCount) * 140);
    const x = index * (barWidth + 8) + 4;
    const label = `${day.date.slice(8, 10)}.${day.date.slice(5, 7)}.`;
    return `<rect x="${x}" y="${160 - height}" width="${barWidth}" height="${Math.max(height, 2)}" rx="6" class="stats-chart__bar"><title>${label}: ${day.count}</title></rect>`
      + `<text x="${x + barWidth / 2}" y="${155 - height}" class="stats-chart__value">${day.count || ''}</text>`
      + `<text x="${x + barWidth / 2}" y="180" class="stats-chart__label">${label.slice(0, 3)}</text>`;
  }).join('');
  const chart = el('div', { className: 'stats-chart', html: `<svg viewBox="0 0 ${days.length * (barWidth + 8)} 190" role="img" aria-label="Geübte Aufgaben pro Tag">${bars}</svg>` });
  return el('section', { className: 'parent-stats__section' }, [el('h2', { className: 'parents__heading', text: 'Geübte Aufgaben pro Tag (14 Tage)' }), chart]);
}

/**
 * Builds the collapsible overview of all tried items.
 * @param {object} history - History.
 * @returns {HTMLElement} Section.
 */
function overviewSection(history) {
  const groups = entriesByType(history);
  const details = Object.entries(TYPE_TITLES).map(([type, title]) => el('details', { className: 'parent-stats__group' }, [
    el('summary', { className: 'parent-stats__summary' }, [el('span', { text: `${title} (${groups[type].length})` }), icon('expand_more')]),
    el('div', { className: 'parent-stats__tiles' }, groups[type].map(({ id, rate }) => el('span', {
      className: `stats-item stats-item--${rateLevel(rate)}`,
      text: `${displayText(type, id)} ${percent(rate)}`
    })))
  ]));
  return el('section', { className: 'parent-stats__section' }, [el('h2', { className: 'parents__heading', text: 'Übersicht' }), ...details]);
}

/**
 * Renders the parent statistics page.
 * @param {HTMLElement} container - Screen container.
 */
export function renderParentStats(container) {
  const state = store.getState();
  container.replaceChildren(el('section', { className: 'parent-stats parents card' }, [
    el('h1', { className: 'screen-title', text: 'Statistik' }),
    difficultSection(state.history),
    activitySection(state.dailyActivity),
    overviewSection(state.history),
    button({ className: 'small-button', iconName: 'arrow_back', label: 'Zurück zum Elternbereich', onClick: () => navigate('/parents') })
  ]));
}
