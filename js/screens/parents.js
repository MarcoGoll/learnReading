import { el, button } from '../components/dom.js';
import { confirmDialog, promptDialog } from '../components/dialog.js';
import { store } from '../state/store.js';
import { navigate } from '../router.js';
import { activeJourney } from '../state/journeyState.js';

/**
 * Creates a labeled on/off switch for a boolean setting.
 * @param {string} label - Label text.
 * @param {string} key - Setting name.
 * @returns {HTMLElement} Switch row.
 */
function settingSwitch(label, key) {
  const input = el('input', { className: 'parents__checkbox', attrs: { type: 'checkbox' } });
  input.checked = store.getState().settings[key];
  input.addEventListener('change', () => store.updateState((state) => { state.settings[key] = input.checked; }));
  return el('label', { className: 'parents__row' }, [input, el('span', { text: label })]);
}

/**
 * Lets the adult rename the dino.
 * @param {HTMLElement} container - Screen container (re-rendered afterwards).
 */
async function renameDino(container) {
  const name = await promptDialog({ question: 'Neuer Name für den Dino:', value: activeJourney(store.getState()).dinoName, confirmLabel: 'Speichern' });
  if (name) {
    store.updateState((state) => { activeJourney(state).dinoName = name; });
  }
  renderParents(container);
}

/**
 * Resets the whole game after a confirmation.
 */
async function resetGame() {
  const isConfirmed = await confirmDialog('Wirklich den ganzen Fortschritt löschen? Alle Dinos, Punkte, Rekorde, Sterne und Belohnungen gehen verloren.', 'Alles löschen');
  if (isConfirmed) {
    store.resetState();
    navigate('/');
  }
}

/**
 * Renders the parent area: statistics and word management links, dino name, settings, and reset.
 * @param {HTMLElement} container - Screen container.
 */
export function renderParents(container) {
  const state = store.getState();
  container.replaceChildren(el('section', { className: 'parents card' }, [
    el('h1', { className: 'screen-title', text: 'Elternbereich' }),
    el('div', { className: 'parents__section' }, [
      button({ className: 'big-button big-button--secondary', iconName: 'bar_chart', label: 'Statistik ansehen', onClick: () => navigate('/parents/stats') }),
      button({ className: 'big-button big-button--secondary', iconName: 'edit', label: 'Wörter verwalten', onClick: () => navigate('/parents/words') })
    ]),
    el('div', { className: 'parents__section' }, [
      el('h2', { className: 'parents__heading', text: 'Dino' }),
      el('p', { className: 'parents__row', text: `Name: ${activeJourney(state).dinoName || '(noch keiner)'}` }),
      button({ className: 'small-button', iconName: 'edit', label: 'Namen ändern', onClick: () => renameDino(container) })
    ]),
    el('div', { className: 'parents__section' }, [
      el('h2', { className: 'parents__heading', text: 'Einstellungen' }),
      settingSwitch('Nach einem Fehler richtig vorlesen', 'readAloudAfterWrong'),
      settingSwitch('Hintergrundmusik', 'musicEnabled'),
      settingSwitch('Töne', 'soundsEnabled')
    ]),
    el('div', { className: 'parents__section parents__section--danger' }, [
      el('h2', { className: 'parents__heading', text: 'Spiel zurücksetzen' }),
      button({ className: 'small-button parents__reset', iconName: 'delete', label: 'Fortschritt löschen', onClick: resetGame })
    ])
  ]));
}
