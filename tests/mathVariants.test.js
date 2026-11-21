import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWall, createWallRound, isWallSolvable, wallFromBottom, brickSpeech, WALL_SUMS } from '../js/logic/math/numberWall.js';
import { hopPath, numberLineTasks, numberAt } from '../js/logic/math/numberLine.js';
import { buildMathDeck, isMemoryPassed } from '../js/logic/math/mathMemory.js';
import { createArithmeticTask } from '../js/logic/math/task.js';
import { mixedTasks } from '../js/logic/math/taskGenerator.js';
import { MATH_PROFILES } from '../js/content/mathProfiles.js';
import { seededRandom } from './helpers.js';

test('number walls follow the sum rule, stay below the limit, and are solvable', () => {
  const randomFn = seededRandom(7);
  [20, 100].forEach((maxTop) => {
    for (let i = 0; i < 200; i += 1) {
      const wall = createWall(maxTop, randomFn);
      Object.entries(WALL_SUMS).forEach(([upper, [left, right]]) => {
        assert.equal(wall.bricks[upper], wall.bricks[left] + wall.bricks[right]);
      });
      assert.ok(wall.bricks[5] <= maxTop, `top ${wall.bricks[5]}`);
      assert.ok(wall.bricks.every((brick) => brick >= 1));
      assert.ok(wall.gaps.length >= 2 && wall.gaps.length <= 3);
      assert.equal(isWallSolvable(wall), true);
    }
  });
  assert.equal(createWallRound(20, randomFn).length, 4);
  assert.equal(isWallSolvable({ bricks: wallFromBottom([1, 2, 3]), gaps: [0, 1, 2] }), false);
});

test('brick speech reads a sum or a missing addend', () => {
  const wall = { bricks: wallFromBottom([3, 5, 2]), gaps: [0, 4, 5] };
  assert.equal(brickSpeech(wall, 5), '8 plus 7');
  assert.equal(brickSpeech(wall, 0), '5 plus wie viel ist 8?');
});

test('the dino hops to the ten first when crossing and jumps in steps for times', () => {
  assert.deepEqual(hopPath(createArithmeticTask('add', 8, 5)), [8, 10, 13]);
  assert.deepEqual(hopPath(createArithmeticTask('add', 3, 4)), [3, 7]);
  assert.deepEqual(hopPath(createArithmeticTask('subtract', 13, 6)), [13, 10, 7]);
  assert.deepEqual(hopPath(createArithmeticTask('add', 34, 25)), [34, 40, 59]);
  assert.deepEqual(hopPath(createArithmeticTask('multiply', 3, 4)), [0, 4, 8, 12]);
  assert.equal(numberAt(0.5, 20), 10);
  assert.equal(numberAt(1.2, 20), 20);
});

test('number line tasks have no division and fit the line', () => {
  const tasks = numberLineTasks(MATH_PROFILES.stegosaurus.challenge, 10, seededRandom(2));
  assert.equal(tasks.length, 10);
  assert.ok(tasks.every((task) => task.operation !== 'divide' && task.answer <= 20 && task.answer >= 0));
});

test('the math memory has 6 pairs with different results', () => {
  const tasks = mixedTasks(MATH_PROFILES.stegosaurus.challenge, 30, seededRandom(4));
  const deck = buildMathDeck(tasks, 6, seededRandom(4));
  assert.equal(deck.length, 12);
  const results = deck.filter((card) => card.kind === 'result').map((card) => card.text);
  assert.equal(new Set(results).size, 6);
  deck.filter((card) => card.kind === 'task').forEach((card) => {
    assert.ok(deck.some((other) => other.kind === 'result' && other.pairId === card.pairId && other.text === String(card.task.answer)));
  });
  assert.equal(isMemoryPassed(6, 6, 12), true);
  assert.equal(isMemoryPassed(6, 6, 13), false);
  assert.equal(isMemoryPassed(5, 6, 8), false);
});

test('every journey species has stage pictures 0-5', async () => {
  const { existsSync } = await import('node:fs');
  const { JOURNEYS } = await import('../js/data/journeys.js');
  JOURNEYS.forEach((journey) => {
    [0, 1, 2, 3, 4, 5].forEach((stage) => {
      assert.ok(existsSync(`assets/svg/dino/${journey.species}/stage-${stage}.svg`), `${journey.species} ${stage}`);
    });
  });
});

test('displayed expressions are spoken in German', async () => {
  const { spokenExpression } = await import('../js/logic/math/task.js');
  assert.equal(spokenExpression('3 · 5'), '3 mal 5');
  assert.equal(spokenExpression('15 : 5'), '15 geteilt durch 5');
  assert.equal(spokenExpression('7 - 3'), '7 minus 3');
  assert.equal(spokenExpression('3 + _ = 7'), '3 plus wie viel ist 7');
});
