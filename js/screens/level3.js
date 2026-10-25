import { wordCard } from '../components/itemCards.js';
import { messageDialog } from '../components/dialog.js';
import { correctItems } from '../logic/readingRound.js';
import { buildRound } from '../logic/wordLevel.js';
import { itemKey } from '../logic/history.js';
import { readableWords } from '../content/levelRules.js';
import { activeProfile } from '../content/profiles.js';
import { activeJourney } from '../state/journeyState.js';
import { store } from '../state/store.js';
import { runReadingRound } from '../game/readingRoundRunner.js';
import { endLevelRound } from '../game/levelFlow.js';
import { runStoryLevel } from '../game/storyRunner.js';
import { navigate } from '../router.js';

/**
 * Starts a round of level 3 (reading words).
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 */
function startRound(container, screen) {
  const state = store.getState();
  const items = buildRound(readableWords(state), activeJourney(state).mastered[3]);
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
    onFinished: (results, session) => endLevelRound(container, {
      level: 3,
      correctIds: correctItems(results).map((word) => word.id),
      session,
      onReplay: () => startRound(container, screen)
    })
  });
}

/**
 * Renders level 3: reading words, or reading stories in the story journey.
 * @param {HTMLElement} container - Screen container.
 * @returns {Function} Cleanup function.
 */
export function renderLevel3(container) {
  const screen = { cleanup: null };
  if (activeProfile(store.getState()).level3Mode === 'stories') {
    runStoryLevel(container, screen);
  } else {
    startRound(container, screen);
  }
  return () => { if (screen.cleanup) screen.cleanup(); };
}
