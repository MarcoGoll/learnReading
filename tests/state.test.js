import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState, normalizeState } from '../js/state/defaultState.js';
import { createStore, STORAGE_KEY } from '../js/state/store.js';
import { memoryStorage } from './helpers.js';

test('default state starts at level 1 with the egg', () => {
  const state = createDefaultState();
  assert.equal(state.currentLevel, 1);
  assert.equal(state.dinoStage, 0);
  assert.deepEqual(state.pools.letters, []);
});

test('invalid data falls back to the default state', () => {
  assert.deepEqual(normalizeState(null), createDefaultState());
  assert.deepEqual(normalizeState({ version: 99 }), createDefaultState());
  assert.deepEqual(normalizeState('text'), createDefaultState());
});

test('normalize keeps valid values and fills missing ones', () => {
  const state = normalizeState({ version: 1, currentLevel: 3, pools: { letters: ['m'] }, rewards: { worn: { head: 'redCap' } } });
  assert.equal(state.currentLevel, 3);
  assert.deepEqual(state.pools.letters, ['m']);
  assert.deepEqual(state.pools.words, []);
  assert.equal(state.rewards.worn.head, 'redCap');
  assert.equal(state.settings.soundsEnabled, true);
});

test('normalize ignores values of the wrong type', () => {
  const state = normalizeState({ version: 1, currentLevel: 'x', pools: { letters: 'm' } });
  assert.equal(state.currentLevel, 1);
  assert.deepEqual(state.pools.letters, []);
});

test('store persists every update and survives a reload', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  store.updateState((state) => { state.score.total = 120; });
  const reloaded = createStore(storage);
  assert.equal(reloaded.getState().score.total, 120);
});

test('store reset restores the default state', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  store.updateState((state) => { state.dinoStage = 3; });
  store.resetState();
  assert.equal(store.getState().dinoStage, 0);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).dinoStage, 0);
});

test('store survives broken storage content', () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, '{broken');
  assert.equal(createStore(storage).getState().currentLevel, 1);
});
