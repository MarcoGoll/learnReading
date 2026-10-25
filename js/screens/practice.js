import { letterCard, syllableCard, wordCard } from '../components/itemCards.js';
import { showRoundSummary } from '../components/roundSummary.js';
import { confetti } from '../components/effects.js';
import { letterById } from '../data/letters.js';
import { syllableById } from '../data/syllables.js';
import { wordById } from '../data/words.js';
import { REWARDS } from '../data/rewards.js';
import { buildPracticeRound, practiceBasePoints, practiceItemCount } from '../logic/practice.js';
import { isDifficult } from '../logic/statistics.js';
import { unlockReached } from '../logic/rewards.js';
import { store } from '../state/store.js';
import { navigate } from '../router.js';
import { runReadingRound } from '../game/readingRoundRunner.js';

/** Lookup and rendering per practiced item type. */
const ITEM_TYPES = {
  letter: { find: letterById, render: letterCard, speak: () => null, label: (item) => item.display },
  syllable: { find: syllableById, render: syllableCard, speak: (item) => item.id, label: (item) => item.id },
  word: { find: wordById, render: wordCard, speak: (item) => item.display, label: (item) => item.display }
};

/**
 * Turns a history key into a practice item.
 * @param {string} key - History key such as "word:mama".
 * @returns {object|null} Practice item { key, type, data } or null if unknown.
 */
function toPracticeItem(key) {
  const [type, id] = key.split(':');
  const data = ITEM_TYPES[type] ? ITEM_TYPES[type].find(id) : null;
  return data ? { key, type, data } : null;
}

/**
 * Shows the practice summary with the items that are no longer difficult.
 * @param {HTMLElement} container - Screen container.
 * @param {Array<object>} items - Practiced items.
 * @param {object} session - Round session.
 */
function showPracticeSummary(container, items, session) {
  let unlockedRewards = [];
  store.updateState((state) => { unlockedRewards = unlockReached(state, REWARDS); });
  const state = store.getState();
  const resolved = items.filter((item) => state.history[item.key] && !isDifficult(state.history[item.key]));
  const remaining = practiceItemCount(state.history);
  if (remaining === 0) confetti();
  showRoundSummary(container, {
    title: remaining === 0 ? 'Die Übungsinsel ist geschafft!' : 'Gut geübt!',
    roundScore: session.roundScore(), record: null, total: state.score.total, isNewRecord: false,
    message: resolved.length > 0 ? `Geschafft: ${resolved.map((item) => ITEM_TYPES[item.type].label(item.data)).join(', ')}!` : 'Weiter so!',
    unlockedRewards,
    actions: [
      remaining > 0 ? { label: 'Nochmal', iconName: 'replay', onClick: () => startPractice(container) } : null,
      { label: 'Weiter', iconName: 'arrow_forward', primary: true, onClick: () => navigate('/') }
    ].filter(Boolean)
  });
}

/**
 * Starts a practice round.
 * @param {HTMLElement} container - Screen container.
 * @returns {Function|undefined} Cleanup function.
 */
function startPractice(container) {
  const items = buildPracticeRound(store.getState().history).map(toPracticeItem).filter(Boolean);
  if (items.length === 0) {
    navigate('/');
    return undefined;
  }
  return runReadingRound(container, {
    title: 'Übungsinsel',
    recordLevel: 'practice',
    level: 1,
    items,
    renderItem: (item) => ITEM_TYPES[item.type].render(item.data),
    historyKey: (item) => item.key,
    speakText: (item) => ITEM_TYPES[item.type].speak(item.data),
    recordOptions: (item) => ({ base: practiceBasePoints(item.key) }),
    onFinished: (results, session) => showPracticeSummary(container, items, session)
  });
}

/**
 * Renders the practice island.
 * @param {HTMLElement} container - Screen container.
 * @returns {Function|undefined} Cleanup function.
 */
export function renderPractice(container) {
  return startPractice(container);
}
