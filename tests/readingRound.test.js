import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReadingRound, correctItems } from '../js/logic/readingRound.js';

test('judge moves through the items and records results', () => {
  const round = createReadingRound(['a', 'b']);
  round.judge(true);
  round.judge(false);
  assert.equal(round.isFinished(), true);
  assert.deepEqual(correctItems(round.results()), ['a']);
});

test('skip moves the current item to the end', () => {
  const round = createReadingRound(['a', 'b', 'c']);
  round.skip();
  assert.equal(round.current(), 'b');
  round.judge(true);
  round.judge(true);
  assert.equal(round.current(), 'a');
});

test('skip with a single item keeps it current and does not loop forever', () => {
  const round = createReadingRound(['a']);
  round.skip();
  assert.equal(round.current(), 'a');
  round.judge(true);
  assert.equal(round.isFinished(), true);
});

test('notYet removes the item without counting it as correct', () => {
  const round = createReadingRound(['a', 'b']);
  round.notYet();
  assert.equal(round.current(), 'b');
  assert.deepEqual(round.results(), [{ item: 'a', result: 'notYet' }]);
  assert.deepEqual(correctItems(round.results()), []);
});

test('undo restores the last judged item once', () => {
  const round = createReadingRound(['a', 'b']);
  assert.equal(round.canUndo(), false);
  round.judge(true);
  assert.equal(round.canUndo(), true);
  const undone = round.undo();
  assert.deepEqual(undone, { item: 'a', result: 'correct' });
  assert.equal(round.current(), 'a');
  assert.equal(round.results().length, 0);
  assert.equal(round.canUndo(), false);
});
