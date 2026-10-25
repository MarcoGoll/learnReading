import { el } from '../components/dom.js';
import { wordCard, syllableCard } from '../components/itemCards.js';
import { messageDialog } from '../components/dialog.js';
import { wordById } from '../data/words.js';
import { syllableById } from '../data/syllables.js';
import { buildTask, buildRound, checkAnswer, isLevelFourComplete, LEVEL_FOUR_BASE, MIN_BUILT_WORDS } from '../logic/dragDropLevel.js';
import { itemKey } from '../logic/history.js';
import { store } from '../state/store.js';
import { runBuildTasks } from '../game/buildTaskRunner.js';
import { endLevelRound } from '../game/levelFlow.js';
import { navigate } from '../router.js';

/**
 * Builds the message about missing built words for level 5.
 * @param {object} state - Game state.
 * @returns {string} Message or empty string.
 */
function missingMessage(state) {
  const missing = Math.max(0, MIN_BUILT_WORDS - state.pools.builtWords.length);
  if (missing === 0) {
    return '';
  }
  return missing === 1 ? 'Noch 1 Wort bauen bis Level 5!' : `Noch ${missing} Wörter bauen bis Level 5!`;
}

/**
 * Returns the content of a syllable tile.
 * @param {object} tile - Tile with a syllable id.
 * @returns {Array<HTMLElement>} Tile content.
 */
function renderSyllableTile(tile) {
  return [syllableCard(syllableById(tile.syllable))];
}

/**
 * Builds the build-task configuration of a level 4 round.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 * @param {Array<object>} tasks - Drag-and-drop tasks.
 * @returns {object} Configuration for runBuildTasks.
 */
function buildConfig(container, screen, tasks) {
  return {
    title: 'Level 4: Wörter bauen',
    level: 4,
    goalLevel: 4,
    goalIdOf: (task) => task.word.id,
    base: LEVEL_FOUR_BASE,
    tasks,
    targetFor: (task) => ({ text: task.word.display, picture: task.word.picture, revealLabel: 'Wort zeigen' }),
    renderTile: renderSyllableTile,
    check: (task, placed) => checkAnswer(task, placed.map((tileId) => task.tiles.find((tile) => tile.tileId === tileId).syllable)),
    solutionFor: (task) => el('div', { className: 'drag-task__solution-word' }, [wordCard(task.word)]),
    historyKey: (task) => itemKey('word', task.word.id),
    onFinished: (results, session) => endLevelRound(container, {
      level: 4,
      correctIds: results.filter((result) => result.success).map((result) => result.task.word.id),
      roundScore: session.roundScore(),
      isComplete: (current) => isLevelFourComplete(current.pools.builtWords),
      messageFor: missingMessage,
      onReplay: () => startRound(container, screen)
    })
  };
}

/**
 * Starts a round of level 4.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 */
function startRound(container, screen) {
  const state = store.getState();
  const words = state.pools.words.map(wordById).filter(Boolean);
  const tasks = buildRound(words, state.pools.builtWords).map((word) => buildTask(word, state.pools.syllables));
  if (tasks.length === 0) {
    messageDialog('Lies zuerst in Level 3 ein paar Wörter!').then(() => navigate('/'));
    return;
  }
  screen.cleanup = runBuildTasks(container, buildConfig(container, screen, tasks));
}

/**
 * Renders level 4 (building words via drag and drop).
 * @param {HTMLElement} container - Screen container.
 * @returns {Function} Cleanup function.
 */
export function renderLevel4(container) {
  const screen = { cleanup: null };
  startRound(container, screen);
  return () => { if (screen.cleanup) screen.cleanup(); };
}
