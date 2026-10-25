import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState, normalizeState, migrateFromVersion1 } from '../js/state/defaultState.js';
import { createStore, STORAGE_KEY } from '../js/state/store.js';
import { memoryStorage } from './helpers.js';

test('default state starts the T-Rex journey at level 1 with the egg', () => {
  const state = createDefaultState();
  assert.equal(state.activeJourney, 'trex');
  assert.equal(state.journeys.trex.currentLevel, 1);
  assert.equal(state.journeys.trex.dinoStage, 0);
  assert.equal(state.journeys.trex.started, true);
  assert.equal(state.journeys.triceratops.unlocked, false);
  assert.deepEqual(state.pools.letters, []);
});

test('invalid data falls back to the default state', () => {
  assert.deepEqual(normalizeState(null), createDefaultState());
  assert.deepEqual(normalizeState({ version: 99 }), createDefaultState());
  assert.deepEqual(normalizeState('text'), createDefaultState());
});

test('normalize keeps valid values and fills missing ones', () => {
  const state = normalizeState({ version: 2, journeys: { trex: { currentLevel: 3, worn: { head: 'redCap' } } }, pools: { letters: ['m'] } });
  assert.equal(state.journeys.trex.currentLevel, 3);
  assert.equal(state.journeys.trex.worn.head, 'redCap');
  assert.deepEqual(state.journeys.trex.mastered[1], []);
  assert.deepEqual(state.pools.letters, ['m']);
  assert.equal(state.journeys.longneck.unlocked, false);
  assert.equal(state.settings.soundsEnabled, true);
});

test('normalize ignores values of the wrong type', () => {
  const state = normalizeState({ version: 2, journeys: { trex: { currentLevel: 'x' } }, pools: { letters: 'm' } });
  assert.equal(state.journeys.trex.currentLevel, 1);
  assert.deepEqual(state.pools.letters, []);
});

test('a version 1 save is migrated into the T-Rex journey without loss', () => {
  const oldSave = {
    version: 1, currentLevel: 3, completedLevels: [1, 2], dinoStage: 2, dinoName: 'Rexi',
    pools: { letters: ['m', 'a'], syllables: ['ma'], words: ['mama'], builtWords: [] },
    score: { total: 450, levelRecords: { 1: 120, 2: 200 } },
    settings: { soundsEnabled: false, musicEnabled: true, readAloudAfterWrong: true },
    rewards: { unlocked: ['redCap'], worn: { head: 'redCap', eyes: null, neck: null } },
    challenge: { passedVariants: ['wordPicture'] },
    history: { 'word:mama': { correct: 2, wrong: 0, notYet: 0, consecutiveCorrect: 2, lastSeen: '2026-10-25' } },
    dailyActivity: { '2026-10-25': 5 }
  };
  const state = normalizeState(oldSave);
  const trex = state.journeys.trex;
  assert.equal(state.version, 2);
  assert.equal(trex.dinoName, 'Rexi');
  assert.equal(trex.currentLevel, 3);
  assert.deepEqual(trex.completedLevels, [1, 2]);
  assert.equal(trex.dinoStage, 2);
  assert.deepEqual(trex.levelRecords, { 1: 120, 2: 200 });
  assert.deepEqual(trex.passedVariants, ['wordPicture']);
  assert.equal(trex.worn.head, 'redCap');
  assert.deepEqual(trex.mastered[3], ['mama']);
  assert.deepEqual(state.pools.syllables, ['ma']);
  assert.equal(state.score.total, 450);
  assert.deepEqual(state.rewards.unlocked, ['redCap']);
  assert.equal(state.settings.soundsEnabled, false);
  assert.equal(state.history['word:mama'].correct, 2);
  assert.equal(migrateFromVersion1({ version: 1 }).journeys.trex.currentLevel, 1);
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
  store.updateState((state) => { state.journeys.trex.dinoStage = 3; });
  store.resetState();
  assert.equal(store.getState().journeys.trex.dinoStage, 0);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).journeys.trex.dinoStage, 0);
});

test('store survives broken storage content', () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, '{broken');
  assert.equal(createStore(storage).getState().journeys.trex.currentLevel, 1);
});
