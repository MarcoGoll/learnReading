import { syllableCard } from '../components/itemCards.js';
import { messageDialog } from '../components/dialog.js';
import { correctItems } from '../logic/readingRound.js';
import { buildRound } from '../logic/syllableLevel.js';
import { buildableWords } from '../logic/wordLevel.js';
import { itemKey } from '../logic/history.js';
import { level2Syllables, goalTarget } from '../content/levelRules.js';
import { activeProfile } from '../content/profiles.js';
import { activeJourney } from '../state/journeyState.js';
import { store } from '../state/store.js';
import { runReadingRound } from '../game/readingRoundRunner.js';
import { endLevelRound } from '../game/levelFlow.js';
import { navigate } from '../router.js';

/** Hint that explains where and how the syllables of the goal are learned. */
const SYLLABLE_HINT = 'So geht es: Lies hier jede Silbe laut vor. Jede richtig gelesene Silbe ist gelernt. '
  + 'Aus gelernten Silben entstehen die Wörter für Level 3.';

/**
 * Builds the extra message when the known sounds cannot produce enough words.
 * @param {object} state - Game state.
 * @returns {string} Message or empty string.
 */
function missingMessage(state) {
  const allAvailable = level2Syllables(state).map((syllable) => syllable.id);
  const reachable = buildableWords(allAvailable, activeProfile(state).words).length >= goalTarget(2, state);
  return reachable ? '' : 'Lerne in Level 1 noch mehr Laute, vor allem Selbstlaute wie A, O oder E!';
}

/**
 * Starts a round of level 2.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 */
function startRound(container, screen) {
  const state = store.getState();
  const items = buildRound(level2Syllables(state), activeJourney(state).mastered[2], 10, Math.random, activeProfile(state).words);
  if (items.length === 0) {
    messageDialog('Lerne zuerst in Level 1 ein paar Laute!').then(() => navigate('/'));
    return;
  }
  screen.cleanup = runReadingRound(container, {
    title: 'Level 2: Silben',
    hint: SYLLABLE_HINT,
    recordLevel: 2,
    level: 2,
    goalLevel: 2,
    goalIdOf: (syllable) => syllable.id,
    items,
    renderItem: syllableCard,
    historyKey: (syllable) => itemKey('syllable', syllable.id),
    speakText: (syllable) => syllable.id,
    onFinished: (results, session) => endLevelRound(container, {
      level: 2,
      correctIds: correctItems(results).map((syllable) => syllable.id),
      session,
      messageFor: missingMessage,
      onReplay: () => startRound(container, screen)
    })
  });
}

/**
 * Renders level 2 (syllables of the active journey).
 * @param {HTMLElement} container - Screen container.
 * @returns {Function} Cleanup function.
 */
export function renderLevel2(container) {
  const screen = { cleanup: null };
  startRound(container, screen);
  return () => { if (screen.cleanup) screen.cleanup(); };
}
