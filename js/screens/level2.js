import { syllableCard } from '../components/itemCards.js';
import { messageDialog } from '../components/dialog.js';
import { SYLLABLES } from '../data/syllables.js';
import { WORDS } from '../data/words.js';
import { correctItems } from '../logic/readingRound.js';
import { availableSyllables, buildRound, isLevelTwoComplete, missingWords, isReachableWithLetters } from '../logic/syllableLevel.js';
import { itemKey } from '../logic/history.js';
import { store } from '../state/store.js';
import { runReadingRound } from '../game/readingRoundRunner.js';
import { endLevelRound } from '../game/levelFlow.js';
import { navigate } from '../router.js';

/**
 * Builds the message about missing words for level 3.
 * @param {object} state - Game state.
 * @returns {string} Message or empty string.
 */
function missingMessage(state) {
  if (!isReachableWithLetters(state.pools.letters, SYLLABLES, WORDS)) {
    return 'Lerne in Level 1 noch mehr Buchstaben, vor allem Selbstlaute wie A, O oder E!';
  }
  const missing = missingWords(state.pools.syllables, WORDS);
  if (missing === 0) {
    return '';
  }
  return missing === 1 ? 'Noch 1 Wort bis Level 3!' : `Noch ${missing} Wörter bis Level 3!`;
}

/**
 * Applies the end of a level 2 round and shows the summary.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 * @param {Array<object>} results - Round results.
 * @param {object} session - Round session.
 */
function finishLevelRound(container, screen, results, session) {
  endLevelRound(container, {
    level: 2,
    correctIds: correctItems(results).map((syllable) => syllable.id),
    roundScore: session.roundScore(),
    isComplete: (current) => isLevelTwoComplete(current.pools.syllables, WORDS),
    messageFor: missingMessage,
    onReplay: () => startRound(container, screen)
  });
}

/**
 * Starts a round of level 2.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 */
function startRound(container, screen) {
  const state = store.getState();
  const items = buildRound(availableSyllables(state.pools.letters, SYLLABLES), state.pools.syllables);
  if (items.length === 0) {
    messageDialog('Lerne zuerst in Level 1 ein paar Buchstaben!').then(() => navigate('/'));
    return;
  }
  screen.cleanup = runReadingRound(container, {
    title: 'Level 2: Silben',
    recordLevel: 2,
    level: 2,
    goalLevel: 2,
    goalIdOf: (syllable) => syllable.id,
    items,
    renderItem: syllableCard,
    historyKey: (syllable) => itemKey('syllable', syllable.id),
    speakText: (syllable) => syllable.id,
    onFinished: (results, session) => finishLevelRound(container, screen, results, session)
  });
}

/**
 * Renders level 2 (syllables).
 * @param {HTMLElement} container - Screen container.
 * @returns {Function} Cleanup function.
 */
export function renderLevel2(container) {
  const screen = { cleanup: null };
  startRound(container, screen);
  return () => { if (screen.cleanup) screen.cleanup(); };
}
