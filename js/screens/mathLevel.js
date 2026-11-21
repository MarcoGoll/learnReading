import { store } from '../state/store.js';
import { activeJourney } from '../state/journeyState.js';
import { mathProfileOf } from '../content/mathProfiles.js';
import { allTasks } from '../logic/math/taskGenerator.js';
import { selectRoundTasks } from '../logic/math/taskSelection.js';
import { runMathTasks } from '../game/mathRoundRunner.js';
import { endLevelRound } from '../game/levelFlow.js';

/**
 * Returns the range of the answer cards of a card level.
 * @param {object} config - Level config.
 * @returns {{min: number, max: number}} Range.
 */
function cardRangeOf(config) {
  return { min: config.kind === 'numbers' ? Math.max(0, (config.min || 0) - 1) : 0, max: config.max || 10 };
}

/**
 * Selects the tasks of a new round of a math level in the active journey.
 * @param {object} state - Game state.
 * @param {object} entry - Level entry of the math profile.
 * @param {number} level - Level 1-6.
 * @returns {Array<object>} Round tasks.
 */
function roundTasks(state, entry, level) {
  return selectRoundTasks(allTasks(entry.config), {
    masteredIds: activeJourney(state).mastered[level] || [],
    history: state.history,
    config: entry.config
  });
}

/**
 * Renders and runs a math level 1-6 of the active math journey.
 * @param {HTMLElement} container - Screen container.
 * @param {number} level - Level 1-6.
 * @returns {Function} Cleanup function.
 */
export function renderMathLevel(container, level) {
  const state = store.getState();
  const entry = mathProfileOf(state.activeJourney).levels[level];
  return runMathTasks(container, {
    title: `Level ${level}: ${entry.title}`,
    level,
    tasks: roundTasks(state, entry, level),
    display: { input: entry.input, aid: entry.aid, aidMode: entry.aidMode },
    cardRange: cardRangeOf(entry.config),
    onFinished: (session, masteredIds) => endLevelRound(container, {
      level, correctIds: masteredIds, session, onReplay: () => renderMathLevel(container, level)
    })
  });
}
