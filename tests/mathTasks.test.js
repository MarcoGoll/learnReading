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

test('addition and subtraction up to 10 have 66 tasks each within 0-10', () => {
  const additions = allTasks(level('stegosaurus', 2));
  const subtractions = allTasks(level('stegosaurus', 3));
  assert.equal(additions.length, 66);
  assert.equal(subtractions.length, 66);
  assert.ok(additions.every((task) => task.answer <= 10));
  assert.ok(subtractions.every((task) => task.answer >= 0 && task.operands[0] >= task.operands[1]));
});

test('level 4 stays within 0-20 and excludes pure level 2/3 tasks', () => {
  const tasks = allTasks(level('stegosaurus', 4));
  assert.ok(tasks.every((task) => task.answer >= 0 && task.answer <= 20));
  assert.ok(tasks.every((task) => [...task.operands, task.answer].some((number) => number > 10)));
  assert.ok(tasks.some(crossesTen));
  assert.ok(tasks.some((task) => !crossesTen(task)));
});

test('crossing ten is detected for addition and subtraction', () => {
  assert.equal(crossesTen(createArithmeticTask('add', 8, 5)), true);
  assert.equal(crossesTen(createArithmeticTask('add', 12, 3)), false);
  assert.equal(crossesTen(createArithmeticTask('subtract', 13, 6)), true);
  assert.equal(crossesTen(createArithmeticTask('subtract', 17, 4)), false);
  assert.equal(crossesTen(createArithmeticTask('add', 38, 5)), true);
});

test('multiplication uses the core tables in both orders without duplicates', () => {
  const tasks = allTasks(level('stegosaurus', 5));
  assert.equal(tasks.length, 64);
  assert.equal(new Set(tasks.map((task) => task.id)).size, 64);
  assert.ok(tasks.every((task) => task.operands.some((operand) => [1, 2, 5, 10].includes(operand))));
  assert.ok(tasks.some((task) => task.id === 'multiply:3*5') && tasks.some((task) => task.id === 'multiply:5*3'));
  assert.equal(tablePairs([1, 2, 5, 10]).length, 64);
});

test('division inverts the multiplications and has no remainder', () => {
  const tasks = allTasks(level('stegosaurus', 6));
  assert.ok(tasks.every((task) => Number.isInteger(task.answer) && task.operands[1] >= 1 && task.operands[1] <= 10));
  const products = new Set(allTasks(level('stegosaurus', 5)).map((task) => `${task.answer}:${task.operands[1]}`));
  assert.ok(tasks.every((task) => products.has(`${task.operands[0]}:${task.operands[1]}`)));
  assert.equal(createArithmeticTask('divide', 15, 5).text, '15 : 5 = ?');
  assert.equal(createArithmeticTask('divide', 15, 5).speech, '15 geteilt durch 5');
});

test('journey 2 and 3 tasks stay within 0-100 and follow the crossing rules', () => {
  const noCrossing = [...allTasks(level('ankylosaurus', 2)), ...allTasks(level('ankylosaurus', 3))];
  assert.ok(noCrossing.every((task) => !crossesTen(task) && task.answer >= 0 && task.answer <= 100));
  assert.ok(allTasks(level('ankylosaurus', 4)).every(crossesTen));
  assert.ok(allTasks(level('parasaurolophus', 2)).every((task) => task.operands.every((operand) => operand >= 10)));
  const mixed = allTasks(level('parasaurolophus', 6));
  assert.ok(mixed.some((task) => task.operation === 'multiply') && mixed.some((task) => task.operation === 'divide'));
  assert.ok(allTasks(level('parasaurolophus', 4)).some((task) => task.missingIndex !== null));
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
    const mixed = selectRoundTasks(allTasks(level('stegosaurus', 4)), { config: level('stegosaurus', 4), randomFn: seededRandom(seed) });
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

test('the level 7 mix contains all four operations without zero operands', () => {
  const tasks = mixedTasks(MATH_PROFILES.stegosaurus.challenge, 12, seededRandom(5));
  assert.equal(tasks.length, 12);
  ['add', 'subtract', 'multiply', 'divide'].forEach((operation) => {
    assert.equal(tasks.filter((task) => task.operation === operation).length, 3);
  });
  assert.ok(tasks.every((task) => task.operands.every((operand) => operand > 0)));
});
