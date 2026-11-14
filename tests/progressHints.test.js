import { test } from 'node:test';
import assert from 'node:assert/strict';
import { progressHint } from '../js/logic/progressHints.js';
import { createDefaultState } from '../js/state/defaultState.js';

/**
 * Creates a state whose T-Rex journey stands at the given level.
 * @param {number} level - Current level.
 * @returns {object} State.
 */
function trexAtLevel(level) {
  const state = createDefaultState();
  state.journeys.trex.currentLevel = level;
  state.journeys.trex.completedLevels = [1, 2, 3, 4].filter((done) => done < level);
  return state;
}

test('level 1 hint names the missing letters', () => {
  const hint = progressHint('trex', trexAtLevel(1));
  assert.equal(hint.level, 1);
  assert.equal(hint.isBlocked, false);
  assert.match(hint.short, /noch 8 Buchstaben/);
});

test('level 2 is blocked when the known letters allow too few words', () => {
  const state = trexAtLevel(2);
  state.pools.letters = ['m', 'a'];
  const hint = progressHint('trex', state);
  assert.equal(hint.isBlocked, true);
  assert.match(hint.text, /Level 1/);
});

test('level 3 is blocked when too few new words are readable', () => {
  const state = trexAtLevel(3);
  state.pools.syllables = ['ma'];
  const hint = progressHint('trex', state);
  assert.equal(hint.isBlocked, true);
  assert.match(hint.text, /Level 2/);
});

test('level 4 is blocked when too few read words are left to build', () => {
  const state = trexAtLevel(4);
  state.journeys.trex.mastered[3] = ['mama'];
  const hint = progressHint('trex', state);
  assert.equal(hint.isBlocked, true);
  assert.match(hint.text, /Level 3/);
});

test('level 5 explains that every adventure counts once, done dinos are grown', () => {
  const state = trexAtLevel(5);
  state.journeys.trex.passedVariants = ['wordPicture'];
  const hint = progressHint('trex', state);
  assert.match(hint.short, /noch 2 verschiedene Abenteuer/);
  assert.match(hint.text, /nur einmal/);
  state.journeys.trex.completedLevels.push(5);
  assert.equal(progressHint('trex', state).short, 'ausgewachsen');
});

test('hints work for a journey that is not the active one', () => {
  const state = createDefaultState();
  state.journeys.triceratops.started = true;
  const hint = progressHint('triceratops', state);
  assert.match(hint.short, /Buchstabenverbindung/);
  assert.equal(state.activeJourney, 'trex');
});
