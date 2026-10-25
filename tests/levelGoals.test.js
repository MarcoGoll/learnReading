import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelGoal } from '../js/logic/levelGoals.js';
import { createDefaultState } from '../js/state/defaultState.js';

test('level 1 goal counts letters including the running round', () => {
  const state = createDefaultState();
  state.journeys.trex.mastered[1] = ['a', 'm'];
  const goal = levelGoal(1, state, ['o', 'l']);
  assert.equal(goal.current, 4);
  assert.equal(goal.target, 8);
  assert.equal(goal.isReached, false);
  assert.equal(goal.detail, '4 von 8 Buchstaben');
});

test('goal is reached when the target is met', () => {
  const state = createDefaultState();
  state.journeys.trex.mastered[3] = ['mama', 'oma', 'opa', 'sofa'];
  assert.equal(levelGoal(3, state).isReached, false);
  assert.equal(levelGoal(3, state, ['rose']).isReached, true);
});

test('level 2 goal counts buildable words, level 5 counts passed variants', () => {
  const state = createDefaultState();
  state.journeys.trex.mastered[2] = ['ma', 'o', 'pa'];
  assert.ok(levelGoal(2, state).current >= 3);
  state.journeys.trex.passedVariants = ['wordPicture'];
  assert.equal(levelGoal(5, state).current, 1);
  assert.equal(levelGoal(5, state).target, 3);
});

test('goals follow the content of the active journey', () => {
  const state = createDefaultState();
  state.activeJourney = 'triceratops';
  state.journeys.triceratops.started = true;
  state.journeys.triceratops.mastered[1] = ['st', 'ck', 'm'];
  const goal = levelGoal(1, state);
  assert.equal(goal.target, 1);
  assert.equal(goal.current, 1);
  assert.equal(goal.isReached, true);
  assert.equal(goal.text, 'Ziel: 1 Buchstabenverbindung richtig lesen');
  state.activeJourney = 'pterosaur';
  state.journeys.pterosaur.mastered[3] = ['st01'];
  assert.equal(levelGoal(3, state).target, 4);
  assert.equal(levelGoal(3, state).current, 1);
});
