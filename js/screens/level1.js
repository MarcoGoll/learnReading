import { el, button, icon } from '../components/dom.js';
import { letterCard } from '../components/itemCards.js';
import { letterById } from '../data/letters.js';
import { shuffle } from '../logic/random.js';
import { correctItems } from '../logic/readingRound.js';
import { countVowels, RECOMMENDED_VOWELS } from '../logic/letterLevel.js';
import { activeProfile } from '../content/profiles.js';
import { level1Items } from '../content/levelRules.js';
import { itemKey } from '../logic/history.js';
import { store } from '../state/store.js';
import { runReadingRound } from '../game/readingRoundRunner.js';
import { endLevelRound } from '../game/levelFlow.js';
import { playSound } from '../audio/soundPlayer.js';
import { createGoalBanner } from '../components/goalBanner.js';
import { levelGoal } from '../logic/levelGoals.js';

/** Screen titles per level 1 mode. */
const TITLES = { letters: 'Level 1: Buchstaben', combinations: 'Level 1: Buchstabenverbindungen', review: 'Level 1: Laute wiederholen' };

/**
 * Returns the title key of level 1 in the active journey.
 * @param {object} profile - Content profile.
 * @returns {string} Key of TITLES.
 */
function titleKey(profile) {
  if (profile.level1.mode === 'review') return 'review';
  return profile.level1.items[0].type === 'combination' ? 'combinations' : 'letters';
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
  const profile = activeProfile(store.getState());
  const view = { profile, selected: new Set(), tiles: [] };
  view.vowelHint = el('p', { className: 'letter-select__vowel-hint', attrs: { 'aria-live': 'polite' } });
  view.startButton = button({ className: 'big-button', iconName: 'play_arrow', label: "Los geht's", onClick: () => onStart([...view.selected]) });
  const refresh = () => refreshSelection(view);
  profile.level1.items.forEach((letter) => view.tiles.push({ letter, tile: letterTile(letter, view.selected, store.getState().pools.letters, refresh) }));
  const setAll = (isSelected) => {
    profile.level1.items.forEach((letter) => (isSelected ? view.selected.add(letter.id) : view.selected.delete(letter.id)));
    refresh();
  };
  container.replaceChildren(selectionSection(view, setAll));
  refresh();
}

/**
 * Updates tiles, start button, and vowel hint of the selection screen.
 * @param {object} view - Selection view (profile, selected, tiles, vowelHint, startButton).
 */
function refreshSelection(view) {
  view.tiles.forEach(({ tile, letter }) => {
    tile.classList.toggle('letter-select__tile--selected', view.selected.has(letter.id));
    tile.setAttribute('aria-pressed', String(view.selected.has(letter.id)));
  });
  view.startButton.disabled = view.selected.size === 0;
  const hint = vowelHint(view.selected);
  view.vowelHint.hidden = !view.profile.level1.vowelHint;
  view.vowelHint.textContent = hint.text;
  view.vowelHint.classList.toggle('letter-select__vowel-hint--warning', hint.isWarning);
}

/**
 * Builds the selection screen section.
 * @param {object} view - Selection view.
 * @param {Function} setAll - Selects or clears all tiles.
 * @returns {HTMLElement} Section.
 */
function selectionSection(view, setAll) {
  const goalBanner = createGoalBanner(1);
  goalBanner.update(levelGoal(1, store.getState()));
  const title = titleKey(view.profile) === 'combinations' ? 'Level 1: Welche Verbindungen kennst du?' : 'Level 1: Welche Buchstaben kennst du?';
  return el('section', { className: 'letter-select' }, [
    el('h1', { className: 'screen-title', text: title }),
    goalBanner.element,
    el('p', { className: 'letter-select__hint', text: 'Erwachsene tippen an, was das Kind schon kennt. Ein Stern zeigt bereits gelernte.' }),
    view.vowelHint,
    el('div', { className: 'letter-select__grid' }, view.tiles.map(({ tile }) => tile)),
    el('div', { className: 'letter-select__actions' }, [
      button({ className: 'small-button', label: 'Alle auswählen', onClick: () => setAll(true) }),
      button({ className: 'small-button', label: 'Auswahl leeren', onClick: () => setAll(false) }),
      view.startButton
    ])
  ]);
}

/**
 * Starts the reading round with the given letter items.
 * @param {HTMLElement} container - Screen container.
 * @param {Array<object>} letters - Letter items of the round.
 * @param {object} screen - Screen context holding the current cleanup.
 */
function startRound(container, letters, screen) {
  const profile = activeProfile(store.getState());
  screen.cleanup = runReadingRound(container, {
    title: TITLES[titleKey(profile)],
    recordLevel: 1,
    level: 1,
    goalLevel: 1,
    goalIdOf: (letter) => letter.id,
    hint: profile.level1.hint,
    items: shuffle(letters),
    renderItem: letterCard,
    historyKey: (letter) => itemKey('letter', letter.id),
    speakText: () => null,
    onFinished: (results, session) => endLevelRound(container, {
      level: 1,
      correctIds: correctItems(results).map((letter) => letter.id),
      session,
      onReplay: () => showStart(container, screen)
    })
  });
}

/**
 * Shows the start of level 1: the selection screen, or directly a review round.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 */
function showStart(container, screen) {
  const { mode, items } = level1Items(store.getState());
  if (mode === 'review') {
    startRound(container, items, screen);
    return;
  }
  renderSelection(container, (ids) => startRound(container, ids.map(letterById), screen));
}

/**
 * Renders level 1 (letters, combinations, or review).
 * @param {HTMLElement} container - Screen container.
 * @returns {Function} Cleanup function.
 */
export function renderLevel1(container) {
  const screen = { cleanup: null };
  showStart(container, screen);
  return () => { if (screen.cleanup) screen.cleanup(); };
}
