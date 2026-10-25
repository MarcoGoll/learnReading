import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordResult, dateString, itemKey } from '../js/logic/history.js';
import { successRate, isDifficult, difficultItems, activityLastDays, entriesByType } from '../js/logic/statistics.js';
import { buildPracticeRound, pointsForPracticeItem, practiceItemCount } from '../js/logic/practice.js';
import { canBuy, buyReward, spendablePoints, cheapestLocked, buyableRewards, toggleWorn } from '../js/logic/rewards.js';
import { REWARDS, rewardById } from '../js/data/rewards.js';
import { createDefaultState, normalizeState } from '../js/state/defaultState.js';

/**
 * Records several results for one item.
 * @param {object} state - Game state.
 * @param {string} key - Item key.
 * @param {Array<string>} results - Results in order.
 */
function recordAll(state, key, results) {
  results.forEach((result) => recordResult(state, key, result, '2026-10-25'));
}

test('history counts results and consecutive correct answers', () => {
  const state = createDefaultState();
  recordAll(state, itemKey('word', 'mama'), ['correct', 'wrong', 'correct', 'notYet', 'correct']);
  const entry = state.history['word:mama'];
  assert.deepEqual([entry.correct, entry.wrong, entry.notYet, entry.consecutiveCorrect], [3, 1, 1, 2]);
  assert.equal(state.dailyActivity['2026-10-25'], 4);
});

test('daily activity keeps 60 days only', () => {
  const state = createDefaultState();
  state.dailyActivity['2026-01-01'] = 5;
  recordResult(state, 'letter:m', 'correct', '2026-10-25');
  assert.equal(state.dailyActivity['2026-01-01'], undefined);
});

test('difficulty rule: 2 wrong, rate below 70 %, resolved after 3 correct in a row', () => {
  const state = createDefaultState();
  recordAll(state, 'syllable:ma', ['wrong', 'correct', 'wrong']);
  assert.equal(isDifficult(state.history['syllable:ma']), true);
  recordAll(state, 'syllable:ma', ['correct', 'correct']);
  assert.equal(isDifficult(state.history['syllable:ma']), true);
  recordAll(state, 'syllable:ma', ['correct']);
  assert.equal(isDifficult(state.history['syllable:ma']), false);
  recordAll(state, 'letter:a', ['wrong']);
  assert.equal(isDifficult(state.history['letter:a']), false);
});

test('difficult items are sorted by success rate and filtered by type', () => {
  const state = createDefaultState();
  recordAll(state, 'word:oma', ['wrong', 'wrong', 'correct']);
  recordAll(state, 'letter:m', ['wrong', 'wrong', 'wrong']);
  recordAll(state, 'sentence:s01', ['wrong', 'wrong']);
  assert.deepEqual(difficultItems(state.history).map((item) => item.key), ['letter:m', 'sentence:s01', 'word:oma']);
  assert.deepEqual(buildPracticeRound(state.history), ['letter:m', 'word:oma']);
  assert.equal(practiceItemCount(state.history), 2);
});

test('success rate and grouping', () => {
  assert.equal(successRate({ correct: 0, wrong: 0 }), null);
  assert.equal(successRate({ correct: 3, wrong: 1 }), 0.75);
  const state = createDefaultState();
  recordAll(state, 'word:oma', ['correct']);
  recordAll(state, 'letter:m', ['notYet']);
  const groups = entriesByType(state.history);
  assert.equal(groups.word.length, 1);
  assert.equal(groups.letter.length, 0);
});

test('activity of the last 14 days includes empty days', () => {
  const days = activityLastDays({ '2026-10-25': 3, '2026-10-20': 1 }, 14, new Date(2026, 9, 25));
  assert.equal(days.length, 14);
  assert.deepEqual(days.at(-1), { date: '2026-10-25', count: 3 });
  assert.equal(days[0].date, '2026-10-12');
  assert.equal(days.reduce((sum, day) => sum + day.count, 0), 4);
  assert.equal(dateString(new Date(2026, 0, 5)), '2026-01-05');
});

test('practice points use the base of the item type with streak bonus', () => {
  assert.equal(pointsForPracticeItem('letter:m', 1), 10);
  assert.equal(pointsForPracticeItem('word:oma', 3), 60);
});

test('accessories are bought with spendable points; the total score stays', () => {
  const state = createDefaultState();
  state.score.total = 300;
  assert.deepEqual(buyableRewards(state, REWARDS).map((reward) => reward.id), ['redCap', 'sunglasses', 'stripedScarf']);
  assert.equal(canBuy(state, rewardById('flowerCrown')), false);
  assert.equal(buyReward(state, rewardById('stripedScarf')), true);
  assert.equal(spendablePoints(state), 50);
  assert.equal(state.score.total, 300);
  assert.equal(buyReward(state, rewardById('stripedScarf')), false);
  assert.equal(buyReward(state, rewardById('redCap')), false);
  assert.deepEqual(cheapestLocked(state, REWARDS), { reward: rewardById('redCap'), missing: 50 });
  assert.equal(canBuy(state, rewardById('goldenCape')), false);
});

test('older states count free accessories as spent', () => {
  const state = normalizeState({ version: 2, score: { total: 1000 }, rewards: { unlocked: ['redCap', 'sunglasses'] } });
  assert.equal(state.rewards.spent, 250);
  assert.equal(spendablePoints(state), 750);
});

test('one accessory per slot can be worn and removed', () => {
  const state = createDefaultState();
  state.rewards.unlocked = ['redCap', 'flowerCrown'];
  toggleWorn(state, rewardById('redCap'));
  toggleWorn(state, rewardById('flowerCrown'));
  assert.equal(state.journeys.trex.worn.head, 'flowerCrown');
  toggleWorn(state, rewardById('flowerCrown'));
  assert.equal(state.journeys.trex.worn.head, null);
  toggleWorn(state, rewardById('sunglasses'));
  assert.equal(state.journeys.trex.worn.eyes, null);
});
