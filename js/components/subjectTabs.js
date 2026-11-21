import { el, icon } from './dom.js';

/** The two worlds of the home screen. */
const TABS = [
  { subject: 'reading', label: 'Lesen', iconName: 'menu_book' },
  { subject: 'math', label: 'Rechnen', iconName: 'calculate' }
];

/**
 * Creates the two large tabs "Lesen" and "Rechnen" at the top of the home screen.
 * @param {string} activeSubject - Subject of the active journey.
 * @param {Function} onSelect - Called with the chosen subject (only when it differs).
 * @returns {HTMLElement} Tab bar.
 */
export function createSubjectTabs(activeSubject, onSelect) {
  return el('div', { className: 'subject-tabs', attrs: { role: 'tablist', 'aria-label': 'Welt' } }, TABS.map((tab) => {
    const isActive = tab.subject === activeSubject;
    return el('button', {
      className: `subject-tabs__tab subject-tabs__tab--${tab.subject}${isActive ? ' subject-tabs__tab--active' : ''}`,
      attrs: { type: 'button', role: 'tab', 'aria-selected': String(isActive) },
      on: { click: () => { if (!isActive) onSelect(tab.subject); } }
    }, [icon(tab.iconName, 'subject-tabs__icon'), el('span', { className: 'subject-tabs__label', text: tab.label })]);
  }));
}
