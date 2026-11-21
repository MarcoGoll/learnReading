import { el, icon } from '../components/dom.js';
import { showRoundSummary } from '../components/roundSummary.js';
import { store } from '../state/store.js';
import { navigate } from '../router.js';
import { finishRound } from '../logic/levelProgress.js';
import { unlockStarRewards, buyableRewards } from '../logic/rewards.js';
import { mergeUnique } from '../logic/random.js';
import { REWARDS } from '../data/rewards.js';
import { activeJourney } from '../state/journeyState.js';
import { MIN_TASKS_FOR_STARS } from '../logic/stars.js';
import { playSound } from '../audio/soundPlayer.js';
import { continueAfterRound, goalSummaryElement } from '../game/levelFlow.js';
import { mathLevelGoal, isMathLevelComplete } from '../logic/math/mathLevelGoals.js';
import { mathProfileOf, MATH_VARIANTS_TO_COMPLETE } from '../content/mathProfiles.js';
import { MATH_VARIANTS, mathVariantById } from './mathChallenge/variantRegistry.js';

/** Level number of the math adventures. */
export const MATH_CHALLENGE_LEVEL = 7;

/**
 * Creates one variant card of the menu.
 * @param {object} variant - Variant.
 * @param {Array<string>} passed - Passed variant ids.
 * @returns {HTMLButtonElement} Card.
 */
function variantCard(variant, passed) {
  const card = el('button', { className: 'challenge-menu__card', attrs: { type: 'button' } }, [
    el('img', { className: 'challenge-menu__picture', attrs: { src: `assets/svg/pictures/${variant.picture}.svg`, alt: '' } }),
    el('span', { className: 'challenge-menu__title', text: variant.title }),
    passed.includes(variant.id) ? icon('check', 'challenge-menu__badge') : null
  ]);
  card.addEventListener('click', () => { playSound('click'); navigate(`/math/level/7/${variant.id}`); });
  return card;
}

/**
 * Renders the menu of the math adventures (level 7).
 * @param {HTMLElement} container - Screen container.
 */
export function renderMathChallengeMenu(container) {
  const passed = activeJourney(store.getState()).passedVariants;
  const progress = Math.min(passed.length, MATH_VARIANTS_TO_COMPLETE);
  container.replaceChildren(el('section', { className: 'challenge-menu' }, [
    el('h1', { className: 'screen-title', text: 'Level 7: Abenteuer' }),
    el('p', { className: 'challenge-menu__progress', text: `${progress} von ${MATH_VARIANTS_TO_COMPLETE} Abenteuern geschafft` }),
    el('div', { className: 'challenge-menu__grid' }, MATH_VARIANTS.map((variant) => variantCard(variant, passed)))
  ]));
}

/**
 * Applies the end of a variant round to the active math journey.
 * @param {string} variantId - Variant id.
 * @param {boolean} isPassed - Whether the round was passed.
 * @param {object} session - Session with roundScore and stats.
 * @returns {object} Outcome of finishRound plus unlockedRewards and careAllowed.
 */
function applyVariantEnd(variantId, isPassed, session) {
  let outcome = null;
  store.updateState((state) => {
    const journey = activeJourney(state);
    if (isPassed) journey.passedVariants = mergeUnique(journey.passedVariants, [variantId]);
    outcome = finishRound(state, {
      level: MATH_CHALLENGE_LEVEL, correctIds: [], roundScore: session.roundScore(), stats: session.stats(),
      isComplete: (current) => isMathLevelComplete(MATH_CHALLENGE_LEVEL, current)
    });
    outcome.unlockedRewards = unlockStarRewards(state, REWARDS);
  });
  outcome.careAllowed = session.stats().taskCount >= MIN_TASKS_FOR_STARS;
  return outcome;
}

/**
 * Returns title and message of a variant summary.
 * @param {object} result - isPassed, resultText, neededText.
 * @param {boolean} levelCompletedNow - Whether level 7 was completed now.
 * @returns {{title: string, message: string}} Texts.
 */
function variantTexts({ isPassed, resultText, neededText }, levelCompletedNow) {
  if (levelCompletedNow) return { title: 'Level 7 geschafft!', message: `${resultText}. Dein Dino ist jetzt ausgewachsen!` };
  if (isPassed) return { title: 'Abenteuer geschafft!', message: `${resultText}. Dieses Abenteuer zählt!` };
  return { title: 'Noch nicht geschafft', message: `${resultText}. ${neededText} Versuch es nochmal!` };
}

/**
 * Shows the summary of a variant round.
 * @param {HTMLElement} container - Screen container.
 * @param {object} variant - Variant.
 * @param {object} result - isPassed, resultText, neededText, session.
 */
function showVariantSummary(container, variant, result) {
  const outcome = applyVariantEnd(variant.id, result.isPassed, result.session);
  const state = store.getState();
  const texts = variantTexts(result, outcome.levelCompletedNow);
  const goal = mathLevelGoal(MATH_CHALLENGE_LEVEL, state);
  showRoundSummary(container, {
    title: texts.title, message: texts.message,
    goalElement: goalSummaryElement(MATH_CHALLENGE_LEVEL, goal, outcome.levelCompletedNow),
    roundScore: result.session.roundScore(), record: activeJourney(state).levelRecords[MATH_CHALLENGE_LEVEL] || 0,
    total: state.score.total, stars: outcome.stars, previousStars: outcome.previousStars,
    isNewRecord: outcome.isNewRecord, levelCompletedNow: outcome.levelCompletedNow,
    unlockedRewards: outcome.unlockedRewards, canShop: buyableRewards(state, REWARDS).length > 0,
    actions: [
      { label: 'Nochmal', iconName: 'replay', onClick: () => renderMathChallengeVariant(container, variant.id) },
      { label: 'Weiter', iconName: 'arrow_forward', primary: true, onClick: () => (outcome.levelCompletedNow || outcome.careAllowed ? continueAfterRound(container, outcome) : navigate('/math/level/7')) }
    ]
  });
}

/**
 * Renders and runs one math variant of the active math journey.
 * @param {HTMLElement} container - Screen container.
 * @param {string} variantId - Variant id.
 * @returns {Function|undefined} Cleanup function.
 */
export function renderMathChallengeVariant(container, variantId) {
  const variant = mathVariantById(variantId);
  if (!variant) {
    navigate('/math/level/7');
    return undefined;
  }
  const context = { challenge: mathProfileOf(store.getState().activeJourney).challenge };
  return variant.run(container, context, (result) => showVariantSummary(container, variant, result));
}
