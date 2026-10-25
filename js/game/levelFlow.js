import { store } from '../state/store.js';
import { finishRound } from '../logic/levelProgress.js';
import { unlockReached } from '../logic/rewards.js';
import { REWARDS } from '../data/rewards.js';
import { showRoundSummary } from '../components/roundSummary.js';
import { playEvolutionScene } from '../components/evolutionScene.js';
import { navigate } from '../router.js';
import { levelGoal } from '../logic/levelGoals.js';
import { createGoalBanner } from '../components/goalBanner.js';
import { WORDS } from '../data/words.js';

/**
 * Returns title and message of the summary so the child sees whether the level is done.
 * @param {number} level - Level number.
 * @param {object} outcome - Round outcome (levelCompletedNow).
 * @param {object} goal - Goal after the round.
 * @param {string} missingText - Message about what is still missing.
 * @returns {{title: string, message: string}} Texts.
 */
export function summaryTexts(level, outcome, goal, missingText) {
  if (outcome.levelCompletedNow) {
    const next = level < 5 ? `Level ${level + 1} ist jetzt frei!` : 'Dein Dino ist jetzt ausgewachsen!';
    return { title: `Level ${level} geschafft!`, message: `${next} Gleich wächst dein Dino.` };
  }
  if (goal.wasCompleted) {
    return { title: 'Runde geschafft!', message: `Level ${level} hast du schon geschafft. Super geübt!` };
  }
  return { title: 'Noch nicht geschafft', message: `${missingText || goal.detail} Spiel nochmal, dann schaffst du es!` };
}

/**
 * Applies a finished round to the state (pools, records, completion, rewards).
 * @param {object} roundResult - level, correctIds, roundScore, isComplete (see finishRound).
 * @returns {{isNewRecord: boolean, levelCompletedNow: boolean, unlockedRewards: Array<object>}} Outcome.
 */
export function applyRoundEnd(roundResult) {
  let outcome = null;
  store.updateState((state) => {
    outcome = finishRound(state, roundResult);
    outcome.unlockedRewards = unlockReached(state, REWARDS);
  });
  return outcome;
}

/**
 * Plays the evolution scene if the level was completed for the first time, then shows the home screen.
 * @param {boolean} levelCompletedNow - Whether the level was completed now.
 */
export async function continueAfterRound(levelCompletedNow) {
  if (levelCompletedNow) {
    const state = store.getState();
    await playEvolutionScene(state.dinoStage, state.dinoName, state.rewards.worn);
  }
  navigate('/');
}

/**
 * Applies the round end and shows the summary with "play again" and "continue" buttons.
 * @param {HTMLElement} container - Screen container.
 * @param {object} options - Round data.
 * @param {number} options.level - Level number.
 * @param {Array<string>} options.correctIds - Ids of correct items.
 * @param {number} options.roundScore - Round score.
 * @param {Function} options.isComplete - Completion rule.
 * @param {Function} [options.messageFor] - Returns an extra message for the updated state.
 * @param {Function} options.onReplay - Starts a new round.
 */
export function endLevelRound(container, { level, correctIds, roundScore, isComplete, messageFor, onReplay }) {
  const outcome = applyRoundEnd({ level, correctIds, roundScore, isComplete });
  const state = store.getState();
  const goal = levelGoal(level, state, WORDS);
  const texts = summaryTexts(level, outcome, goal, messageFor ? messageFor(state) : '');
  showRoundSummary(container, {
    title: texts.title,
    goalElement: goalSummaryElement(level, goal, outcome.levelCompletedNow),
    roundScore,
    record: state.score.levelRecords[level] || 0,
    total: state.score.total,
    isNewRecord: outcome.isNewRecord,
    levelCompletedNow: outcome.levelCompletedNow,
    message: texts.message,
    unlockedRewards: outcome.unlockedRewards,
    actions: [
      { label: 'Nochmal', iconName: 'replay', primary: !goal.wasCompleted, onClick: onReplay },
      { label: 'Weiter', iconName: 'arrow_forward', primary: goal.wasCompleted, onClick: () => continueAfterRound(outcome.levelCompletedNow) }
    ]
  });
}

/**
 * Creates a goal banner for the summary that shows the progress after the round.
 * @param {number} level - Level number.
 * @param {object} goal - Goal after the round.
 * @param {boolean} levelCompletedNow - Whether the level was completed now.
 * @returns {HTMLElement} Banner element.
 */
export function goalSummaryElement(level, goal, levelCompletedNow) {
  const banner = createGoalBanner(level);
  banner.update(levelCompletedNow ? { ...goal, statusOverride: `Level ${level} geschafft!` } : goal);
  return banner.element;
}
