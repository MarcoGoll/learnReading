import { wordCard } from '../components/itemCards.js';
import { messageDialog } from '../components/dialog.js';
import { WORDS } from '../data/words.js';
import { correctItems } from '../logic/readingRound.js';
import { buildableWords, buildRound, isLevelThreeComplete, MIN_WORDS_LEVEL_THREE } from '../logic/wordLevel.js';
import { itemKey } from '../logic/history.js';
import { store } from '../state/store.js';
import { runReadingRound } from '../game/readingRoundRunner.js';
import { endLevelRound } from '../game/levelFlow.js';
import { navigate } from '../router.js';

/**
 * Builds the message about missing words for level 4.
 * @param {object} state - Game state.
 * @returns {string} Message or empty string.
 */
function missingMessage(state) {
  const missing = Math.max(0, MIN_WORDS_LEVEL_THREE - state.pools.words.length);
  if (missing === 0) {
    return '';
  }
  return missing === 1 ? 'Noch 1 Wort bis Level 4!' : `Noch ${missing} Wörter bis Level 4!`;
}

/**
 * Applies the end of a level 3 round and shows the summary.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 * @param {Array<object>} results - Round results.
 * @param {object} session - Round session.
 */
function finishLevelRound(container, screen, results, session) {
  endLevelRound(container, {
    level: 3,
    correctIds: correctItems(results).map((word) => word.id),
    roundScore: session.roundScore(),
    isComplete: (current) => isLevelThreeComplete(current.pools.words),
    messageFor: missingMessage,
    onReplay: () => startRound(container, screen)
  });
}

/**
 * Starts a round of level 3.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 */
function startRound(container, screen) {
  const state = store.getState();
  const items = buildRound(buildableWords(state.pools.syllables, WORDS), state.pools.words);
  if (items.length === 0) {
    messageDialog('Lerne zuerst in Level 2 mehr Silben!').then(() => navigate('/'));
    return;
  }
  screen.cleanup = runReadingRound(container, {
    title: 'Level 3: Wörter',
    recordLevel: 3,
    level: 3,
    goalLevel: 3,
    goalIdOf: (word) => word.id,
    items,
    renderItem: wordCard,
    historyKey: (word) => itemKey('word', word.id),
    speakText: (word) => word.display,
    onFinished: (results, session) => finishLevelRound(container, screen, results, session)
  });
}

/**
 * Renders level 3 (reading words).
 * @param {HTMLElement} container - Screen container.
 * @returns {Function} Cleanup function.
 */
export function renderLevel3(container) {
  const screen = { cleanup: null };
  startRound(container, screen);
  return () => { if (screen.cleanup) screen.cleanup(); };
}
