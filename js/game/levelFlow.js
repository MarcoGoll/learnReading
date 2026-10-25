import { store } from '../state/store.js';
import { activeJourney, activeJourneyDef } from '../state/journeyState.js';
import { finishRound } from '../logic/levelProgress.js';
import { unlockStarRewards, buyableRewards } from '../logic/rewards.js';
import { MIN_TASKS_FOR_STARS } from '../logic/stars.js';
import { REWARDS } from '../data/rewards.js';
import { showRoundSummary } from '../components/roundSummary.js';
import { playEvolutionScene } from '../components/evolutionScene.js';
import { messageDialog } from '../components/dialog.js';
import { navigate } from '../router.js';
import { levelGoal } from '../logic/levelGoals.js';
import { isLevelComplete } from '../content/levelRules.js';
import { createGoalBanner } from '../components/goalBanner.js';
import { showCareScreen } from './careFlow.js';

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
 * Applies a finished round to the state (pools, records, stars, completion, star rewards).
 * @param {object} roundResult - level, correctIds, roundScore, isComplete, stats (see finishRound).
 * @returns {object} Outcome including unlockedRewards.
 */
export function applyRoundEnd(roundResult) {
  let outcome = null;
  store.updateState((state) => {
    outcome = finishRound(state, roundResult);
    outcome.unlockedRewards = unlockStarRewards(state, REWARDS);
  });
  return outcome;
}

/**
 * Continues after a round: evolution scene, optional care screen, egg notice, then the home screen.
 * @param {HTMLElement} container - Screen container.
 * @param {object} outcome - Round outcome (levelCompletedNow, unlockedJourney, careAllowed).
 */
export async function continueAfterRound(container, outcome) {
  if (outcome.levelCompletedNow) {
    const state = store.getState();
    const journey = activeJourney(state);
    await playEvolutionScene(activeJourneyDef(state).species, journey.dinoStage, journey.dinoName, journey.worn);
  }
  if (outcome.careAllowed) {
    await showCareScreen(container);
  }
  navigate('/');
  if (outcome.unlockedJourney) {
    const name = activeJourney(store.getState()).dinoName;
    await messageDialog(`${name} hat ein Ei gelegt! Darin wartet ein ${outcome.unlockedJourney.speciesName}. Schau ins Dino-Tal.`, 'Super!', 'Ein neues Ei!');
  }
}

/**
 * Applies the round end and shows the summary with "play again" and "continue" buttons.
 * @param {HTMLElement} container - Screen container.
 * @param {object} options - Round data.
 * @param {number} options.level - Level number.
 * @param {Array<string>} options.correctIds - Ids of correct items.
 * @param {object} options.session - Round session (score and counts).
 * @param {Function} [options.messageFor] - Returns an extra message for the updated state.
 * @param {Function} options.onReplay - Starts a new round.
 */
export function endLevelRound(container, { level, correctIds, session, messageFor, onReplay }) {
  const stats = session.stats();
  const outcome = applyRoundEnd({ level, correctIds, roundScore: session.roundScore(), isComplete: (state) => isLevelComplete(level, state), stats });
  outcome.careAllowed = stats.taskCount >= MIN_TASKS_FOR_STARS;
  const state = store.getState();
  const goal = levelGoal(level, state);
  const texts = summaryTexts(level, outcome, goal, messageFor ? messageFor(state) : '');
  showRoundSummary(container, {
    title: texts.title,
    goalElement: goalSummaryElement(level, goal, outcome.levelCompletedNow),
    roundScore: session.roundScore(),
    record: activeJourney(state).levelRecords[level] || 0,
    total: state.score.total,
    stars: outcome.stars,
    previousStars: outcome.previousStars,
    isNewRecord: outcome.isNewRecord,
    levelCompletedNow: outcome.levelCompletedNow,
    message: texts.message,
    unlockedRewards: outcome.unlockedRewards,
    canShop: buyableRewards(state, REWARDS).length > 0,
    actions: [
      { label: 'Nochmal', iconName: 'replay', primary: !goal.wasCompleted, onClick: onReplay },
      { label: 'Weiter', iconName: 'arrow_forward', primary: goal.wasCompleted, onClick: () => continueAfterRound(container, outcome) }
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
