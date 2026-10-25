import { el, button, icon } from '../components/dom.js';
import { letterCard } from '../components/itemCards.js';
import { LETTERS, letterById } from '../data/letters.js';
import { shuffle } from '../logic/random.js';
import { correctItems } from '../logic/readingRound.js';
import { isLevelOneComplete, missingLetters, countVowels, RECOMMENDED_VOWELS } from '../logic/letterLevel.js';
import { itemKey } from '../logic/history.js';
import { store } from '../state/store.js';
import { runReadingRound } from '../game/readingRoundRunner.js';
import { endLevelRound } from '../game/levelFlow.js';
import { playSound } from '../audio/soundPlayer.js';
import { createGoalBanner } from '../components/goalBanner.js';
import { levelGoal } from '../logic/levelGoals.js';
import { WORDS } from '../data/words.js';

/** Hint for the adult during the round. */
const ADULT_HINT = 'Es zählt der Laut (mmm), nicht der Buchstabenname (em).';

/**
 * Builds the friendly message about missing letters.
 * @param {object} state - Game state.
 * @returns {string} Message or empty string.
 */
function missingMessage(state) {
  const missing = missingLetters(state.pools.letters);
  if (missing === 0) {
    return '';
  }
  return missing === 1 ? 'Noch 1 Buchstabe bis Level 2!' : `Noch ${missing} Buchstaben bis Level 2!`;
}

/**
 * Returns the hint for adults about the vowels in the current selection.
 * @param {Set<string>} selected - Selected letter ids.
 * @returns {{text: string, isWarning: boolean}} Hint.
 */
function vowelHint(selected) {
  const vowels = countVowels([...selected]);
  if (selected.size > 0 && vowels < RECOMMENDED_VOWELS) {
    return { text: `Tipp: Bisher ${vowels === 1 ? 'nur 1 Selbstlaut' : 'kein Selbstlaut'} ausgewählt. Mit mindestens 2 Selbstlauten (A, E, I, O, U) lassen sich gute Silben und Wörter bilden.`, isWarning: true };
  }
  return { text: 'Tipp für Eltern: Wählt mindestens 2 Selbstlaute (A, E, I, O, U), damit sich später gute Silben und Wörter bilden lassen.', isWarning: false };
}

/**
 * Creates one selectable letter tile.
 * @param {object} letter - Letter item.
 * @param {Set<string>} selected - Selected letter ids (mutated on click).
 * @param {Array<string>} pool - Mastered letters.
 * @param {Function} onChange - Called after a change.
 * @returns {HTMLButtonElement} Tile.
 */
function letterTile(letter, selected, pool, onChange) {
  const tile = el('button', { className: 'letter-select__tile', attrs: { type: 'button', 'aria-pressed': 'false' } }, [
    el('span', { text: letter.display }),
    pool.includes(letter.id) ? icon('star', 'letter-select__star') : null
  ]);
  tile.addEventListener('click', () => {
    if (selected.has(letter.id)) selected.delete(letter.id); else selected.add(letter.id);
    playSound('click');
    onChange();
  });
  return tile;
}

/**
 * Renders the selection screen where the adult marks the letters the child knows.
 * @param {HTMLElement} container - Screen container.
 * @param {Function} onStart - Called with the selected letter ids.
 */
function renderSelection(container, onStart) {
  const pool = store.getState().pools.letters;
  const selected = new Set();
  const tiles = [];
  const vowelHintElement = el('p', { className: 'letter-select__vowel-hint', attrs: { 'aria-live': 'polite' } });
  const startButton = button({ className: 'big-button', iconName: 'play_arrow', label: "Los geht's", onClick: () => onStart([...selected]) });
  const refresh = () => {
    tiles.forEach(({ tile, letter }) => {
      tile.classList.toggle('letter-select__tile--selected', selected.has(letter.id));
      tile.setAttribute('aria-pressed', String(selected.has(letter.id)));
    });
    startButton.disabled = selected.size === 0;
    const hint = vowelHint(selected);
    vowelHintElement.textContent = hint.text;
    vowelHintElement.classList.toggle('letter-select__vowel-hint--warning', hint.isWarning);
  };
  LETTERS.forEach((letter) => tiles.push({ letter, tile: letterTile(letter, selected, pool, refresh) }));
  const setAll = (isSelected) => { LETTERS.forEach((letter) => (isSelected ? selected.add(letter.id) : selected.delete(letter.id))); refresh(); };
  const goalBanner = createGoalBanner(1);
  goalBanner.update(levelGoal(1, store.getState(), WORDS));
  container.replaceChildren(el('section', { className: 'letter-select' }, [
    el('h1', { className: 'screen-title', text: 'Level 1: Welche Buchstaben kennst du?' }),
    goalBanner.element,
    el('p', { className: 'letter-select__hint', text: 'Erwachsene tippen die Buchstaben an, die das Kind schon kennt. Ein Stern zeigt bereits gelernte.' }),
    vowelHintElement,
    el('div', { className: 'letter-select__grid' }, tiles.map(({ tile }) => tile)),
    el('div', { className: 'letter-select__actions' }, [
      button({ className: 'small-button', label: 'Alle auswählen', onClick: () => setAll(true) }),
      button({ className: 'small-button', label: 'Auswahl leeren', onClick: () => setAll(false) }),
      startButton
    ])
  ]));
  refresh();
}

/**
 * Starts the reading round with the selected letters.
 * @param {HTMLElement} container - Screen container.
 * @param {Array<string>} letterIds - Selected letter ids.
 * @param {object} screen - Screen context holding the current cleanup.
 */
function startRound(container, letterIds, screen) {
  screen.cleanup = runReadingRound(container, {
    title: 'Level 1: Buchstaben',
    recordLevel: 1,
    level: 1,
    goalLevel: 1,
    goalIdOf: (letter) => letter.id,
    hint: ADULT_HINT,
    items: shuffle(letterIds.map(letterById)),
    renderItem: letterCard,
    historyKey: (letter) => itemKey('letter', letter.id),
    speakText: () => null,
    onFinished: (results, session) => endLevelRound(container, {
      level: 1,
      correctIds: correctItems(results).map((letter) => letter.id),
      roundScore: session.roundScore(),
      isComplete: (state) => isLevelOneComplete(state.pools.letters),
      messageFor: missingMessage,
      onReplay: () => renderSelection(container, (ids) => startRound(container, ids, screen))
    })
  });
}

/**
 * Renders level 1 (letters).
 * @param {HTMLElement} container - Screen container.
 * @returns {Function} Cleanup function.
 */
export function renderLevel1(container) {
  const screen = { cleanup: null };
  renderSelection(container, (ids) => startRound(container, ids, screen));
  return () => { if (screen.cleanup) screen.cleanup(); };
}
