/**
 * Returns the rewards whose threshold was crossed between two totals.
 * @param {number} previousTotal - Total points before.
 * @param {number} newTotal - Total points after.
 * @param {Array<object>} rewards - All rewards.
 * @returns {Array<object>} Newly unlocked rewards.
 */
export function newlyUnlocked(previousTotal, newTotal, rewards) {
  return rewards.filter((reward) => reward.threshold > previousTotal && reward.threshold <= newTotal);
}

/**
 * Returns all rewards reached with a total.
 * @param {number} total - Total points.
 * @param {Array<object>} rewards - All rewards.
 * @returns {Array<object>} Reached rewards.
 */
export function reachedRewards(total, rewards) {
  return rewards.filter((reward) => reward.threshold <= total);
}

/**
 * Returns the next reward and the missing points.
 * @param {number} total - Total points.
 * @param {Array<object>} rewards - All rewards sorted by threshold.
 * @returns {{reward: object, missing: number}|null} Next reward or null when all are unlocked.
 */
export function nextReward(total, rewards) {
  const reward = rewards.find((candidate) => candidate.threshold > total);
  return reward ? { reward, missing: reward.threshold - total } : null;
}

/**
 * Unlocks all reached rewards in the state.
 * @param {object} state - Game state (mutated).
 * @param {Array<object>} rewards - All rewards.
 * @returns {Array<object>} Rewards that were unlocked by this call.
 */
export function unlockReached(state, rewards) {
  const newOnes = reachedRewards(state.score.total, rewards)
    .filter((reward) => !state.rewards.unlocked.includes(reward.id));
  newOnes.forEach((reward) => state.rewards.unlocked.push(reward.id));
  return newOnes;
}

/**
 * Puts an unlocked accessory on or takes it off (one accessory per slot).
 * @param {object} state - Game state (mutated).
 * @param {object} reward - Reward to toggle.
 */
export function toggleWorn(state, reward) {
  if (!state.rewards.unlocked.includes(reward.id)) {
    return;
  }
  const worn = state.rewards.worn;
  worn[reward.slot] = worn[reward.slot] === reward.id ? null : reward.id;
}
