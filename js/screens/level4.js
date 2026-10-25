import { el } from '../components/dom.js';
import { wordCard, syllableCard } from '../components/itemCards.js';
import { messageDialog } from '../components/dialog.js';
import { wordById, ALL_WORDS } from '../data/allWords.js';
import { syllableById } from '../data/syllables.js';
import { buildTask, buildRound, checkAnswer, pieceOf, LEVEL_FOUR_BASE } from '../logic/dragDropLevel.js';
import { itemKey } from '../logic/history.js';
import { level4Words } from '../content/levelRules.js';
import { activeJourney } from '../state/journeyState.js';
import { store } from '../state/store.js';
import { runBuildTasks } from '../game/buildTaskRunner.js';
import { endLevelRound } from '../game/levelFlow.js';
import { navigate } from '../router.js';

/** Word ids that can serve as distractor parts of compound words. */
const PART_CANDIDATES = [...new Set(ALL_WORDS.flatMap((word) => word.parts || []))];

/**
 * Returns the content of a tile: a syllable or a part word.
 * @param {object} tile - Tile with a syllable id or a part word id.
 * @returns {Array<HTMLElement>} Tile content.
 */
function renderTile(tile) {
  return tile.part ? [wordCard(wordById(tile.part))] : [syllableCard(syllableById(tile.syllable))];
}

/**
 * Returns the target (spoken text and pictures) of a task; compound words show their parts' pictures.
 * @param {object} task - Build task.
 * @returns {object} Target options.
 */
function targetFor(task) {
  const partPictures = task.word.parts ? task.word.parts.map(wordById).map((part) => part && part.picture).filter(Boolean) : [];
  return { text: task.word.display, picture: task.word.picture, pictures: partPictures.length > 0 ? partPictures : undefined, revealLabel: 'Wort zeigen' };
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
    targetFor,
    renderTile,
    check: (task, placed) => checkAnswer(task, placed.map((tileId) => pieceOf(task.tiles.find((tile) => tile.tileId === tileId)))),
    solutionFor: (task) => el('div', { className: 'drag-task__solution-word' }, [wordCard(task.word)]),
    historyKey: (task) => itemKey('word', task.word.id),
    onFinished: (results, session) => endLevelRound(container, {
      level: 4,
      correctIds: results.filter((result) => result.success).map((result) => result.task.word.id),
      session,
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
  const words = level4Words(state);
  const tasks = buildRound(words, activeJourney(state).mastered[4])
    .map((word) => buildTask(word, state.pools.syllables, Math.random, PART_CANDIDATES));
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
