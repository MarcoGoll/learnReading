import { hasAllStars } from './stars.js';

/**
 * Returns the points the child can still spend in the wardrobe (total points minus spent points).
 * The total score itself is never reduced.
 * @param {object} state - Game state.
 * @returns {number} Spendable points.
 */
export function spendablePoints(state) {
  return Math.max(0, state.score.total - (state.rewards.spent || 0));
}

/**
 * Checks whether a reward can be bought now: it has a price, is still locked, and is affordable.
 * @param {object} state - Game state.
 * @param {object} reward - Reward.
 * @returns {boolean} True if buyable.
 */
export function canBuy(state, reward) {
  return reward.price !== null && !state.rewards.unlocked.includes(reward.id) && spendablePoints(state) >= reward.price;
}

/**
 * Buys a reward: unlocks it and adds its price to the spent points.
 * @param {object} state - Game state (mutated).
 * @param {object} reward - Reward to buy.
 * @returns {boolean} True if the purchase happened.
 */
export function buyReward(state, reward) {
  if (!canBuy(state, reward)) {
    return false;
  }
  state.rewards.unlocked.push(reward.id);
  state.rewards.spent = (state.rewards.spent || 0) + reward.price;
  return true;
}

/**
 * Returns the rewards that can be bought right now.
 * @param {object} state - Game state.
 * @param {Array<object>} rewards - All rewards.
 * @returns {Array<object>} Buyable rewards.
 */
export function buyableRewards(state, rewards) {
  return rewards.filter((reward) => canBuy(state, reward));
}

/**
 * Returns the cheapest locked reward and the points still missing for it.
 * @param {object} state - Game state.
 * @param {Array<object>} rewards - All rewards.
 * @returns {{reward: object, missing: number}|null} Cheapest locked reward or null when all are bought.
 */
export function cheapestLocked(state, rewards) {
  const locked = rewards.filter((reward) => reward.price !== null && !state.rewards.unlocked.includes(reward.id))
    .sort((first, second) => first.price - second.price);
  return locked.length > 0 ? { reward: locked[0], missing: Math.max(0, locked[0].price - spendablePoints(state)) } : null;
}

/**
 * Returns the points already spent on unlocked point rewards (used to migrate older states
 * where accessories were unlocked for free at thresholds), capped at the total score.
 * @param {Array<string>} unlockedIds - Unlocked reward ids.
 * @param {number} total - Total score.
 * @param {Array<object>} rewards - All rewards.
 * @returns {number} Spent points.
 */
export function spentForUnlocked(unlockedIds, total, rewards) {
  const sum = rewards.filter((reward) => reward.price !== null && unlockedIds.includes(reward.id))
    .reduce((accumulated, reward) => accumulated + reward.price, 0);
  return Math.min(total, sum);
}

/**
 * Unlocks the special accessory of the active journey when all its stars are collected.
 * @param {object} state - Game state (mutated).
 * @param {Array<object>} rewards - All rewards.
 * @returns {Array<object>} Rewards unlocked by this call.
 */
export function unlockStarRewards(state, rewards) {
  const journey = state.journeys[state.activeJourney];
  const special = rewards.find((reward) => reward.journey === state.activeJourney);
  if (!special || state.rewards.unlocked.includes(special.id) || !hasAllStars(journey.stars)) {
    return [];
  }
  state.rewards.unlocked.push(special.id);
  return [special];
}

/**
 * Checks whether a reward can be worn by the dino of a journey.
 * @param {object} reward - Reward.
 * @param {string} journeyId - Journey id.
 * @returns {boolean} True if allowed.
 */
export function isWearableBy(reward, journeyId) {
  return !reward.journey || reward.journey === journeyId;
}

/**
 * Puts an unlocked accessory on the active dino or takes it off (one accessory per slot).
 * @param {object} state - Game state (mutated).
 * @param {object} reward - Reward to toggle.
 */
export function toggleWorn(state, reward) {
  if (!state.rewards.unlocked.includes(reward.id) || !isWearableBy(reward, state.activeJourney)) {
    return;
  }
  const worn = state.journeys[state.activeJourney].worn;
  worn[reward.slot] = worn[reward.slot] === reward.id ? null : reward.id;
}
