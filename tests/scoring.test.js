import { test } from 'node:test';
import assert from 'node:assert/strict';
import { basePoints, pointsForCorrect, pointsForAttempt, applyRoundResult } from '../js/logic/scoring.js';
import { createRoundSession } from '../js/logic/roundSession.js';
import { createDefaultState } from '../js/state/defaultState.js';

test('base points rise by level', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(basePoints), [10, 20, 30, 40, 50]);
});

test('streak bonus doubles from the third correct item', () => {
  assert.equal(pointsForCorrect(1, 1), 10);
  assert.equal(pointsForCorrect(1, 2), 10);
  assert.equal(pointsForCorrect(1, 3), 20);
  assert.equal(pointsForCorrect(2, 4), 40);
});

test('attempt points: full, half, none', () => {
  assert.equal(pointsForAttempt(40, 1, 1), 40);
  assert.equal(pointsForAttempt(40, 1, 3), 80);
  assert.equal(pointsForAttempt(40, 2, 5), 20);
  assert.equal(pointsForAttempt(40, 3, 1), 0);
});

test('records are only replaced by higher round scores', () => {
  const first = applyRoundResult({}, 1, 50);
  assert.equal(first.isNewRecord, true);
  const second = applyRoundResult(first.levelRecords, 1, 40);
  assert.equal(second.isNewRecord, false);
  assert.equal(second.levelRecords[1], 50);
});

/**
 * Creates a session on a fresh state for tests.
 * @param {number} level - Level.
 * @returns {{state: object, session: object}} State and session.
 */
function sessionFor(level) {
  const state = createDefaultState();
  const session = createRoundSession({ level, updateState: (fn) => fn(state), today: '2026-10-25' });
  return { state, session };
}

test('session adds points, tracks the streak, and resets it on wrong', () => {
  const { state, session } = sessionFor(1);
  ['correct', 'correct', 'correct'].forEach((result) => session.record('letter:m', result));
  assert.equal(session.roundScore(), 40);
  assert.equal(state.score.total, 40);
  session.record('letter:a', 'wrong');
  assert.equal(session.streak(), 0);
  assert.equal(session.taskCount(), 4);
});

test('skip-like notYet does not change the streak or task count', () => {
  const { session } = sessionFor(1);
  session.record('letter:m', 'correct');
  session.record('letter:a', 'notYet');
  assert.equal(session.streak(), 1);
  assert.equal(session.taskCount(), 1);
});

test('undo restores score, streak, history, and activity exactly', () => {
  const { state, session } = sessionFor(2);
  session.record('syllable:ma', 'correct');
  session.record('syllable:ma', 'correct');
  session.record('syllable:mo', 'correct');
  assert.equal(state.score.total, 80);
  session.undo();
  assert.equal(state.score.total, 40);
  assert.equal(session.streak(), 2);
  assert.equal(state.history['syllable:mo'], undefined);
  assert.equal(state.dailyActivity['2026-10-25'], 2);
});

test('second attempt earns half points and ends the streak', () => {
  const { session } = sessionFor(4);
  session.record('word:mama', 'correct');
  const result = session.record('word:oma', 'correct', { attempt: 2 });
  assert.equal(result.points, 20);
  assert.equal(session.streak(), 0);
});

test('consolation points are added for a wrong result without a streak', () => {
  const { state, session } = sessionFor(5);
  session.record('word:oma', 'correct');
  const result = session.record('word:mama', 'wrong', { consolationPoints: 50 });
  assert.equal(result.points, 50);
  assert.equal(session.streak(), 0);
  assert.equal(session.correctCount(), 1);
  assert.equal(state.score.total, 100);
});
