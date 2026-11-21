import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allTasks, mixedTasks, tablePairs, sampleEvenly, MAX_TASKS } from '../js/logic/math/taskGenerator.js';
import { selectRoundTasks, answerOptions, roundLimits } from '../js/logic/math/taskSelection.js';
import { createArithmeticTask, toMissingNumberTask, solutionSpeech, crossesTen, createNumberTask } from '../js/logic/math/task.js';
import { MATH_PROFILES } from '../js/content/mathProfiles.js';
import { seededRandom } from './helpers.js';

const level = (journeyId, number) => MATH_PROFILES[journeyId].levels[number].config;

test('level 1 of journey 1 has count and pickQuantity tasks for 0-10', () => {
  const tasks = allTasks(level('stegosaurus', 1));
  assert.equal(tasks.length, 22);
  assert.ok(tasks.every((task) => task.answer >= 0 && task.answer <= 10));
  assert.deepEqual([...new Set(tasks.map((task) => task.operation))], ['count', 'pickQuantity']);
});

test('plus up to 10 and minus up to 10 stay within 0-10', () => {
  const additions = allTasks(level('stegosaurus', 2));
  assert.equal(additions.length, 66);
  assert.ok(additions.every((task) => task.operation === 'add' && task.answer <= 10));
  const minusFive = allTasks(level('ankylosaurus', 1));
  assert.equal(minusFive.length, 21);
  const minusTen = allTasks(level('ankylosaurus', 2));
  assert.ok(minusTen.every((task) => task.operation === 'subtract' && task.answer >= 0 && task.operands[0] > 5));
});

test('each dino only uses its own operation (plus dino also has the numbers level)', () => {
  const expected = { stegosaurus: 'add', ankylosaurus: 'subtract', parasaurolophus: 'multiply', pachycephalosaurus: 'divide' };
  Object.entries(expected).forEach(([journeyId, operation]) => {
    [1, 2, 3, 4, 5, 6].forEach((number) => {
      const tasks = allTasks(level(journeyId, number));
      const allowed = journeyId === 'stegosaurus' && number === 1 ? ['count', 'pickQuantity'] : [operation];
      assert.ok(tasks.every((task) => allowed.includes(task.operation)), `${journeyId} level ${number}`);
    });
    assert.deepEqual(MATH_PROFILES[journeyId].challenge.operations, [operation]);
  });
});

test('plus and minus ladders: up to 20 without, then with crossing ten, then up to 100', () => {
  ['stegosaurus', 'ankylosaurus'].forEach((journeyId) => {
    const noCrossing20 = allTasks(level(journeyId, 3));
    const crossing20 = allTasks(level(journeyId, 4));
    assert.ok(noCrossing20.every((task) => !crossesTen(task) && task.answer <= 20 && Math.max(...task.operands) <= 20));
    assert.ok(crossing20.every((task) => crossesTen(task) && Math.max(...task.operands, task.answer) <= 20));
    assert.ok(noCrossing20.every((task) => [...task.operands, task.answer].some((number) => number > 10)));
    assert.ok(allTasks(level(journeyId, 5)).every((task) => !crossesTen(task) && task.answer <= 100));
    assert.ok(allTasks(level(journeyId, 6)).every((task) => crossesTen(task) && Math.max(...task.operands, task.answer) <= 100));
  });
});

test('crossing ten is detected for addition and subtraction', () => {
  assert.equal(crossesTen(createArithmeticTask('add', 8, 5)), true);
  assert.equal(crossesTen(createArithmeticTask('add', 12, 3)), false);
  assert.equal(crossesTen(createArithmeticTask('subtract', 13, 6)), true);
  assert.equal(crossesTen(createArithmeticTask('subtract', 17, 4)), false);
  assert.equal(crossesTen(createArithmeticTask('add', 38, 5)), true);
});

test('times levels add tables step by step, both orders, no duplicates', () => {
  const tables = { 1: [1, 2, 10], 2: [5], 3: [3, 4], 4: [6], 5: [7, 8, 9] };
  Object.entries(tables).forEach(([number, list]) => {
    const tasks = allTasks(level('parasaurolophus', Number(number)));
    assert.equal(new Set(tasks.map((task) => task.id)).size, tasks.length);
    assert.ok(tasks.every((task) => task.operands.some((operand) => list.includes(operand))));
    assert.ok(tasks.length >= MATH_PROFILES.parasaurolophus.levels[number].goal);
  });
  assert.equal(allTasks(level('parasaurolophus', 6)).length, 100);
  assert.ok(allTasks(level('parasaurolophus', 2)).some((task) => task.id === 'multiply:5*3') && allTasks(level('parasaurolophus', 2)).some((task) => task.id === 'multiply:3*5'));
  assert.equal(tablePairs([1, 2, 5, 10]).length, 64);
});

test('division inverts the times tables of the same level and has no remainder', () => {
  [1, 2, 3, 4, 5, 6].forEach((number) => {
    const tasks = allTasks(level('pachycephalosaurus', number));
    const products = new Set(allTasks(level('parasaurolophus', number)).map((task) => `${task.answer}:${task.operands[1]}`));
    assert.ok(tasks.every((task) => Number.isInteger(task.answer) && task.operands[1] >= 1 && task.operands[1] <= 10));
    assert.ok(tasks.every((task) => products.has(`${task.operands[0]}:${task.operands[1]}`)));
  });
  assert.equal(createArithmeticTask('divide', 15, 5).text, '15 : 5 = ?');
  assert.equal(createArithmeticTask('divide', 15, 5).speech, '15 geteilt durch 5');
});

test('every level has enough tasks for its goal and stays within 0-100', () => {
  Object.keys(MATH_PROFILES).forEach((journeyId) => {
    [1, 2, 3, 4, 5, 6].forEach((number) => {
      const tasks = allTasks(level(journeyId, number));
      assert.ok(tasks.length >= MATH_PROFILES[journeyId].levels[number].goal, `${journeyId} level ${number}`);
      assert.ok(tasks.length <= MAX_TASKS);
      assert.ok(tasks.every((task) => task.answer >= 0 && task.answer <= 100 && Number.isInteger(task.answer)));
    });
  });
});

test('large task lists are sampled evenly and stably', () => {
  const items = Array.from({ length: 1000 }, (_, index) => index);
  const sample = sampleEvenly(items, 400);
  assert.equal(sample.length, 400);
  assert.deepEqual(sample, sampleEvenly(items, 400));
  assert.equal(sample[0], 0);
});

test('a round has 10 different tasks, open and often wrong ones first', () => {
  const tasks = allTasks(level('stegosaurus', 2));
  const mastered = tasks.slice(0, 60).map((task) => task.id);
  const history = { 'math:add:9+1': { correct: 0, wrong: 3 } };
  const round = selectRoundTasks(tasks, { masteredIds: mastered.filter((id) => id !== 'add:9+1'), history, randomFn: seededRandom(3) });
  assert.equal(round.length, 10);
  assert.equal(new Set(round.map((task) => task.id)).size, 10);
  assert.ok(round.some((task) => task.id === 'add:9+1'));
  tasks.slice(60).forEach((task) => assert.ok(round.includes(task)));
});

test('round limits: at most 2 zero tasks, about half crossing ten', () => {
  const additions = allTasks(level('stegosaurus', 2));
  for (let seed = 1; seed < 6; seed += 1) {
    const round = selectRoundTasks(additions, { config: level('stegosaurus', 2), randomFn: seededRandom(seed) });
    assert.ok(round.filter((task) => task.operands.includes(0)).length <= 2);
    const mixedConfig = { kind: 'mixedAddSubtract', max: 20, excludeUpTo: 10, crossingShare: 0.5 };
    const mixed = selectRoundTasks(allTasks(mixedConfig), { config: mixedConfig, randomFn: seededRandom(seed) });
    const crossing = mixed.filter(crossesTen).length;
    assert.ok(crossing >= 4 && crossing <= 6, `crossing ${crossing}`);
  }
  assert.equal(roundLimits({ kind: 'add' }, 10).length, 0);
});

test('answer options contain the answer once and close distractors in range', () => {
  for (let answer = 0; answer <= 10; answer += 1) {
    const options = answerOptions(answer, { randomFn: seededRandom(answer + 1) });
    assert.equal(options.length, 4);
    assert.equal(options.filter((option) => option === answer).length, 1);
    assert.ok(options.every((option) => option >= 0 && option <= 10 && Math.abs(option - answer) <= 3));
  }
});

test('missing-number tasks and speech texts', () => {
  const task = toMissingNumberTask(createArithmeticTask('add', 3, 4), 1);
  assert.equal(task.text, '3 + _ = 7');
  assert.equal(task.answer, 4);
  assert.equal(task.speech, '3 plus wie viel ist 7?');
  assert.equal(solutionSpeech(task), '3 plus 4 ist 7');
  assert.equal(createArithmeticTask('multiply', 3, 5).speech, '3 mal 5');
  assert.equal(createArithmeticTask('subtract', 7, 3).speech, '7 minus 3');
  assert.equal(createNumberTask('nextTen', 47).answer, 50);
  assert.equal(solutionSpeech(createNumberTask('count', 4)), 'Die Lösung ist 4.');
});

test('the level 7 mix keeps an even share of several operations without zero operands', () => {
  const mix = { operations: ['add', 'subtract', 'multiply', 'divide'], max: 20, tables: [1, 2, 5, 10] };
  const tasks = mixedTasks(mix, 12, seededRandom(5));
  assert.equal(tasks.length, 12);
  ['add', 'subtract', 'multiply', 'divide'].forEach((operation) => {
    assert.equal(tasks.filter((task) => task.operation === operation).length, 3);
  });
  assert.ok(tasks.every((task) => task.operands.every((operand) => operand > 0)));
  const plusOnly = mixedTasks(MATH_PROFILES.stegosaurus.challenge, 10, seededRandom(5));
  assert.ok(plusOnly.length === 10 && plusOnly.every((task) => task.operation === 'add'));
});
