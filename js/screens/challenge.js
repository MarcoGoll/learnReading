import { el, icon } from '../components/dom.js';
import { showRoundSummary } from '../components/roundSummary.js';
import { store } from '../state/store.js';
import { navigate } from '../router.js';
import { finishRound } from '../logic/levelProgress.js';
import { isRoundPassed, VARIANTS_TO_COMPLETE } from '../logic/challengeLevel.js';
import { unlockStarRewards, buyableRewards } from '../logic/rewards.js';
import { mergeUnique } from '../logic/random.js';
import { REWARDS } from '../data/rewards.js';
import { isLevelComplete } from '../content/levelRules.js';
import { activeProfile } from '../content/profiles.js';
import { activeJourney } from '../state/journeyState.js';
import { MIN_TASKS_FOR_STARS } from '../logic/stars.js';
import { playSound } from '../audio/soundPlayer.js';
import { continueAfterRound, goalSummaryElement } from '../game/levelFlow.js';
import { levelGoal } from '../logic/levelGoals.js';
import { variantById, variantsOf } from './challenge/variantRegistry.js';
import { collectMaterial } from './challenge/variantContext.js';

/**
 * Creates one variant card of the menu.
 * @param {object} variant - Variant.
 * @param {object} material - Word material.
 * @param {Array<string>} passed - Passed variant ids.
 * @returns {HTMLButtonElement} Card.
 */
function variantCard(variant, material, passed) {
  const isAvailable = variant.isAvailable(material);
  const card = el('button', {
    className: `challenge-menu__card${isAvailable ? '' : ' challenge-menu__card--unavailable'}`,
    attrs: { type: 'button' }
  }, [
    el('img', { className: 'challenge-menu__picture', attrs: { src: `assets/svg/pictures/${variant.picture}.svg`, alt: '' } }),
    el('span', { className: 'challenge-menu__title', text: variant.title }),
    isAvailable ? null : el('span', { className: 'challenge-menu__hint', text: variant.unavailableHint }),
    passed.includes(variant.id) ? icon('check', 'challenge-menu__badge') : null
  ]);
  card.disabled = !isAvailable;
  card.addEventListener('click', () => { playSound('click'); navigate(`/level/5/${variant.id}`); });
  return card;
}

/**
 * Renders the level 5 variant menu.
 * @param {HTMLElement} container - Screen container.
 */
export function renderChallengeMenu(container) {
  const state = store.getState();
  const material = collectMaterial(state);
  const passed = activeJourney(state).passedVariants;
  const progress = Math.min(passed.length, VARIANTS_TO_COMPLETE);
  container.replaceChildren(el('section', { className: 'challenge-menu' }, [
    el('h1', { className: 'screen-title', text: 'Level 5: Abenteuer' }),
    el('p', { className: 'challenge-menu__progress', text: `${progress} von ${VARIANTS_TO_COMPLETE} Abenteuern geschafft` }),
    el('div', { className: 'challenge-menu__grid' }, variantsOf(activeProfile(state)).map((variant) => variantCard(variant, material, passed)))
  ]));
}

/**
 * Applies the end of a variant round to the active journey.
 * @param {string} variantId - Variant id.
 * @param {boolean} isPassed - Whether the round was passed.
 * @param {object} session - Session with roundScore and stats.
 * @returns {object} Outcome with isNewRecord, levelCompletedNow, stars, unlockedRewards, unlockedJourney.
 */
function applyVariantEnd(variantId, isPassed, session) {
  let outcome = null;
  store.updateState((state) => {
    const journey = activeJourney(state);
    if (isPassed) {
      journey.passedVariants = mergeUnique(journey.passedVariants, [variantId]);
    }
    outcome = finishRound(state, {
      level: 5, correctIds: [], roundScore: session.roundScore(), stats: session.stats(),
      isComplete: (current) => isLevelComplete(5, current)
    });
    outcome.unlockedRewards = unlockStarRewards(state, REWARDS);
  });
  outcome.careAllowed = session.stats().taskCount >= MIN_TASKS_FOR_STARS;
  return outcome;
}

/**
 * Returns the summary message of a variant round.
 * @param {number} correctCount - Correct tasks.
 * @param {number} taskCount - All tasks.
 * @param {number} needed - Correct tasks needed to pass.
 * @param {boolean} levelCompletedNow - Whether level 5 was completed now.
 * @returns {string} Message.
 */
function variantMessage(correctCount, taskCount, needed, levelCompletedNow) {
  const result = `${correctCount} von ${taskCount} richtig`;
  if (levelCompletedNow) {
    return `${result}. Dein Dino ist jetzt ausgewachsen!`;
  }
  return correctCount >= needed ? `${result}. Dieses Abenteuer zählt!` : `${result}. Nötig sind ${needed}. Versuch es nochmal!`;
}

/**
 * Shows the summary of a variant round.
 * @param {HTMLElement} container - Screen container.
 * @param {object} variant - Variant.
 * @param {object} round - correctCount, taskCount, session.
 */
function showVariantSummary(container, variant, { correctCount, taskCount, session }) {
  const isPassed = isRoundPassed(correctCount, taskCount);
  const outcome = applyVariantEnd(variant.id, isPassed, session);
  const roundScore = session.roundScore();
  const state = store.getState();
  const needed = Math.ceil(taskCount / 2);
  showRoundSummary(container, {
    title: outcome.levelCompletedNow ? 'Level 5 geschafft!' : isPassed ? 'Abenteuer geschafft!' : 'Noch nicht geschafft',
    goalElement: goalSummaryElement(5, levelGoal(5, state), outcome.levelCompletedNow),
    roundScore, record: activeJourney(state).levelRecords[5] || 0, total: state.score.total,
    stars: outcome.stars, previousStars: outcome.previousStars,
    isNewRecord: outcome.isNewRecord, levelCompletedNow: outcome.levelCompletedNow,
    message: variantMessage(correctCount, taskCount, needed, outcome.levelCompletedNow),
    unlockedRewards: outcome.unlockedRewards,
    canShop: buyableRewards(state, REWARDS).length > 0,
    actions: [
      { label: 'Nochmal', iconName: 'replay', onClick: () => renderChallengeVariant(container, variant.id) },
      { label: 'Weiter', iconName: 'arrow_forward', primary: true, onClick: () => (outcome.levelCompletedNow || outcome.careAllowed ? continueAfterRound(container, outcome) : navigate('/level/5')) }
    ]
  });
}

/**
 * Renders and runs one level 5 variant.
 * @param {HTMLElement} container - Screen container.
 * @param {string} variantId - Variant id.
 * @returns {Function|undefined} Cleanup function.
 */
export function renderChallengeVariant(container, variantId) {
  const variant = variantById(variantId);
  const material = collectMaterial(store.getState());
  if (!variant || !variant.isAvailable(material)) {
    navigate('/level/5');
    return undefined;
  }
  return variant.run(container, material, (correctCount, taskCount, session) => {
    showVariantSummary(container, variant, { correctCount, taskCount, session });
  });
}
