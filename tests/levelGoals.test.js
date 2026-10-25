import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelGoal } from '../js/logic/levelGoals.js';
import { summaryTexts } from '../js/game/levelFlow.js';
import { WORDS } from '../js/data/words.js';
import { createDefaultState } from '../js/state/defaultState.js';

test('level 1 goal counts letters including the running round', () => {
  const state = createDefaultState();
  state.pools.letters = ['a', 'm'];
  const goal = levelGoal(1, state, WORDS, ['o', 'l']);
  assert.equal(goal.current, 4);
  assert.equal(goal.target, 8);
  assert.equal(goal.isReached, false);
  assert.equal(goal.detail, '4 von 8 Buchstaben');
});

test('goal is reached when the target is met', () => {
  const state = createDefaultState();
  state.pools.words = ['mama', 'oma', 'opa', 'sofa'];
  assert.equal(levelGoal(3, state, WORDS).isReached, false);
  assert.equal(levelGoal(3, state, WORDS, ['rose']).isReached, true);
});

test('level 2 goal counts buildable words, level 5 counts passed variants', () => {
  const state = createDefaultState();
  state.pools.syllables = ['ma', 'o', 'pa'];
  assert.ok(levelGoal(2, state, WORDS).current >= 3);
  state.challenge.passedVariants = ['wordPicture'];
  assert.equal(levelGoal(5, state, WORDS).current, 1);
  assert.equal(levelGoal(5, state, WORDS).target, 3);
});
