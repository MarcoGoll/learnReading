import { el, button, icon } from '../components/dom.js';
import { confirmDialog } from '../components/dialog.js';
import { store } from '../state/store.js';
import { navigate } from '../router.js';
import { ALL_WORDS } from '../data/allWords.js';
import { displaySyllables } from '../data/wordParser.js';
import { journeyById } from '../data/journeys.js';
import { PROFILES } from '../content/profiles.js';
import { contentOf, customWordsOf, addCustomWord, deleteCustomWord, setWordHidden } from '../content/customContent.js';
import { parseCustomWord, validateCustomWord, unknownSounds, journeysForWord, CUSTOM_WORD_JOURNEYS } from '../logic/customWords.js';

/** Messages for the validation errors. */
const ERROR_TEXTS = {
  empty: 'Bitte ein Wort eingeben.',
  invalidCharacters: 'Bitte nur Buchstaben verwenden (keine Leerzeichen, Zahlen, ß oder Sonderzeichen).',
  emptySyllable: 'Zwischen zwei Bindestrichen fehlt eine Silbe.',
  duplicate: 'Dieses Wort gibt es schon.'
};

/**
 * Returns the word split into syllables for display, e.g. "Ba-na-ne".
 * @param {object} word - Word entry.
 * @returns {string} Split text.
 */
function splitText(word) {
  return displaySyllables(word).join('-');
}

/**
 * Returns the ids of all visible words and the hidden built-in ids.
 * @param {object} state - Game state.
 * @returns {{existingIds: Set<string>, hiddenIds: Set<string>}} Id sets.
 */
function idSets(state) {
  const { customWords, hiddenWordIds } = contentOf(state);
  const hiddenIds = new Set(hiddenWordIds);
  const existingIds = new Set([...ALL_WORDS.map((word) => word.id), ...customWords.map((word) => word.id)]);
  return { existingIds, hiddenIds };
}

/**
 * Shows a message below the input.
 * @param {object} view - View parts.
 * @param {string} text - Message.
 * @param {string} kind - "error", "hint", or "success".
 */
function showMessage(view, text, kind) {
  view.message.textContent = text;
  view.message.className = `parent-words__message parent-words__message--${kind}`;
}

/**
 * Updates the split preview while the adult types.
 * @param {object} view - View parts.
 */
function updatePreview(view) {
  const word = parseCustomWord(view.input.value);
  const isValid = view.input.value.trim() !== '' && !validateCustomWord(word, new Set(), new Set());
  view.preview.textContent = isValid ? `Silben: ${splitText(word)}` : '';
}

/**
 * Returns the success text of an added word: journeys and, if needed, the sounds still to learn.
 * @param {object} word - Added word.
 * @param {object} state - Game state.
 * @returns {string} Text.
 */
function successText(word, state) {
  const journeys = journeysForWord(word).map((id) => journeyById(id).speciesName).join(' und ');
  const missing = unknownSounds(word, state.pools.letters);
  const missingText = missing.length > 0
    ? ` Enthält ${missing.join(', ')}, ${missing.length === 1 ? 'das noch nicht gelernt ist' : 'die noch nicht gelernt sind'} - das Wort erscheint, sobald alle Laute gelernt sind.`
    : '';
  return `${splitText(word)} wurde hinzugefügt (${journeys}).${missingText}`;
}

/**
 * Adds the typed word after validation; a hidden built-in duplicate can be shown again.
 * @param {object} view - View parts.
 */
async function addWord(view) {
  const state = store.getState();
  const word = parseCustomWord(view.input.value);
  const { existingIds, hiddenIds } = idSets(state);
  const error = validateCustomWord(word, existingIds, hiddenIds);
  if (error === 'hiddenDuplicate') {
    const isConfirmed = await confirmDialog(`${word.display} gibt es schon, es ist aber ausgeblendet. Wieder einblenden?`, 'Einblenden');
    if (isConfirmed) store.updateState((current) => setWordHidden(current, word.id, false));
    finishAdd(view, isConfirmed ? `${word.display} ist wieder eingeblendet.` : '', 'success');
    return;
  }
  if (error) {
    showMessage(view, ERROR_TEXTS[error], 'error');
    return;
  }
  store.updateState((current) => addCustomWord(current, word));
  finishAdd(view, successText(word, store.getState()), 'success');
}

/**
 * Clears the input after an add and refreshes the list.
 * @param {object} view - View parts.
 * @param {string} text - Message.
 * @param {string} kind - Message kind.
 */
function finishAdd(view, text, kind) {
  view.input.value = '';
  updatePreview(view);
  showMessage(view, text, kind);
  renderGroups(view);
}

/**
 * Creates the action button of a word row: delete (own word) or hide/show (built-in word).
 * @param {object} word - Word entry.
 * @param {boolean} isHidden - Whether the word is hidden.
 * @param {object} view - View parts.
 * @returns {HTMLButtonElement} Button.
 */
function rowAction(word, isHidden, view) {
  if (word.custom) {
    return button({ className: 'small-button parent-words__delete', iconName: 'delete', label: 'Löschen', onClick: async () => {
      if (!await confirmDialog(`${word.display} wirklich löschen?`, 'Löschen')) return;
      store.updateState((state) => deleteCustomWord(state, word.id));
      renderGroups(view);
    } });
  }
  return button({ className: 'small-button', iconName: isHidden ? 'visibility' : 'visibility_off', label: isHidden ? 'Einblenden' : 'Ausblenden', onClick: () => {
    store.updateState((state) => setWordHidden(state, word.id, !isHidden));
    renderGroups(view);
  } });
}

/**
 * Creates one row of the word list.
 * @param {object} word - Word entry.
 * @param {Set<string>} hiddenIds - Hidden word ids.
 * @param {object} view - View parts.
 * @returns {HTMLElement} Row.
 */
function wordRow(word, hiddenIds, view) {
  const isHidden = hiddenIds.has(word.id);
  const modifiers = `${word.custom ? ' parent-words__row--custom' : ''}${isHidden ? ' parent-words__row--hidden' : ''}`;
  return el('li', { className: `parent-words__row${modifiers}` }, [
    el('span', { className: 'parent-words__word', text: splitText(word) }),
    word.custom ? el('span', { className: 'parent-words__tag', text: 'eigenes Wort' }) : null,
    isHidden ? el('span', { className: 'parent-words__tag parent-words__tag--hidden', text: 'ausgeblendet' }) : null,
    rowAction(word, isHidden, view)
  ]);
}

/**
 * Creates the collapsible word group of one journey, filtered by the search text (own words first).
 * The group keeps its open state across re-renders; while searching, groups with matches open.
 * @param {string} journeyId - Journey id.
 * @param {object} state - Game state.
 * @param {object} view - View parts (openGroups holds the open journey ids).
 * @returns {HTMLElement} Group.
 */
function journeyGroup(journeyId, state, view) {
  const search = view.search.value.trim().toLowerCase();
  const hiddenIds = new Set(contentOf(state).hiddenWordIds);
  const words = [...customWordsOf(state, journeyId), ...PROFILES[journeyId].words]
    .filter((word) => word.id.includes(search));
  const ownCount = words.filter((word) => word.custom).length;
  const group = el('details', { className: 'parent-words__group' }, [
    el('summary', { className: 'parent-words__summary' }, [
      el('span', { text: `${journeyById(journeyId).speciesName} (${words.length}${ownCount > 0 ? `, davon ${ownCount} eigene` : ''})` }),
      icon('expand_more', 'parent-words__chevron')
    ]),
    el('ul', { className: 'parent-words__list' }, words.map((word) => wordRow(word, hiddenIds, view)))
  ]);
  group.open = search !== '' ? words.length > 0 : view.openGroups.has(journeyId);
  group.addEventListener('toggle', () => { if (search === '') toggleRemembered(view, journeyId, group.open); });
  return group;
}

/**
 * Remembers whether a group is open, so it stays that way after a re-render.
 * @param {object} view - View parts.
 * @param {string} journeyId - Journey id.
 * @param {boolean} isOpen - Open state.
 */
function toggleRemembered(view, journeyId, isOpen) {
  if (isOpen) view.openGroups.add(journeyId);
  else view.openGroups.delete(journeyId);
}

/**
 * Renders the word groups of all journeys that can have custom words.
 * @param {object} view - View parts.
 */
function renderGroups(view) {
  const state = store.getState();
  view.groups.replaceChildren(...CUSTOM_WORD_JOURNEYS.map((journeyId) => journeyGroup(journeyId, state, view)));
}

/**
 * Creates the input area for new words.
 * @param {object} view - View parts (input, preview, message are filled in).
 * @returns {HTMLElement} Form.
 */
function addForm(view) {
  view.input = el('input', { className: 'parent-words__input', attrs: { type: 'text', placeholder: 'z. B. Banane oder Ba-na-ne', maxlength: '30', 'aria-label': 'Neues Wort' } });
  view.preview = el('p', { className: 'parent-words__preview', attrs: { 'aria-live': 'polite' } });
  view.message = el('p', { className: 'parent-words__message', attrs: { 'aria-live': 'polite' } });
  view.input.addEventListener('input', () => updatePreview(view));
  const form = el('form', { className: 'parent-words__form' }, [
    view.input,
    button({ className: 'big-button parent-words__add', iconName: 'add', label: 'Hinzufügen', onClick: () => addWord(view) })
  ]);
  form.addEventListener('submit', (event) => { event.preventDefault(); addWord(view); });
  return el('div', { className: 'parents__section' }, [
    el('h2', { className: 'parents__heading', text: 'Neues Wort' }),
    el('p', { className: 'parent-words__help', text: 'Die Silben werden vorgeschlagen. Mit Bindestrichen trennst du selbst (Ba-na-ne). Großgeschrieben zählt als Nomen.' }),
    form, view.preview, view.message
  ]);
}

/**
 * Renders the word management page of the parent area.
 * @param {HTMLElement} container - Screen container.
 */
export function renderParentWords(container) {
  const view = { groups: el('div', { className: 'parent-words__groups' }), openGroups: new Set() };
  view.search = el('input', { className: 'parent-words__search', attrs: { type: 'search', placeholder: 'Wort suchen', 'aria-label': 'Wort suchen' } });
  view.search.addEventListener('input', () => renderGroups(view));
  container.replaceChildren(el('section', { className: 'parent-words parents card' }, [
    el('h1', { className: 'screen-title', text: 'Wörter verwalten' }),
    addForm(view),
    el('div', { className: 'parents__section' }, [el('label', { className: 'parent-words__search-row' }, [icon('search'), view.search]), view.groups]),
    button({ className: 'small-button', iconName: 'arrow_back', label: 'Zurück zum Elternbereich', onClick: () => navigate('/parents') })
  ]));
  renderGroups(view);
}
