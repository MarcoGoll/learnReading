import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTask as buildDragTask, checkAnswer as checkDrag, isLevelFourComplete, buildRound as buildDragRound } from '../js/logic/dragDropLevel.js';
import { isRoundPassed, isLevelFiveComplete, wordMaterial } from '../js/logic/challengeLevel.js';
import { availableSentences, buildRound as buildSentenceRound } from '../js/logic/sentences.js';
import { pictureTargets, buildTask as buildPictureTask, buildRound as buildPictureRound } from '../js/logic/wordPicture.js';
import { similarityScore, buildTask as buildFindTask } from '../js/logic/findTheWord.js';
import { gapCandidates, buildTask as buildGapTask } from '../js/logic/gapSentence.js';
import { buildDeck, createMemoryGame, flip, isPairCorrect, isFinished } from '../js/logic/wordMemory.js';
import { builderSentences, buildTask as buildSentenceTask, checkAnswer as checkSentence } from '../js/logic/sentenceBuilder.js';
import { WORDS, wordById } from '../js/data/words.js';
import { SENTENCES, SIGHT_WORDS, sentenceById } from '../js/data/sentences.js';
import { seededRandom } from './helpers.js';

const mama = wordById('mama');

test('drag task contains the word syllables plus 1-2 distractors', () => {
  for (let seed = 1; seed < 10; seed++) {
    const task = buildDragTask(mama, ['ma', 'o', 'pa', 'la'], seededRandom(seed));
    const extra = task.tiles.length - mama.syllables.length;
    assert.ok(extra >= 1 && extra <= 2);
    task.tiles.slice(0).forEach((tile) => assert.ok(['ma', 'o', 'pa', 'la'].includes(tile.syllable)));
  }
});

test('drag check compares the order, including duplicate syllables', () => {
  const task = buildDragTask(mama, ['ma', 'o'], seededRandom(2));
  assert.equal(checkDrag(task, ['ma', 'ma']), true);
  assert.equal(checkDrag(task, ['ma', 'o']), false);
  assert.equal(checkDrag(task, ['ma']), false);
});

test('level 4 round prefers unbuilt words and completes with 5 built words', () => {
  const words = WORDS.slice(0, 8);
  const round = buildDragRound(words, [words[0].id], 5, seededRandom(4));
  assert.equal(round.length, 5);
  assert.ok(!round.some((word) => word.id === words[0].id));
  assert.equal(isLevelFourComplete(['a', 'b', 'c', 'd']), false);
  assert.equal(isLevelFourComplete(['a', 'b', 'c', 'd', 'e']), true);
});

test('challenge rules', () => {
  assert.equal(isRoundPassed(3, 6), true);
  assert.equal(isRoundPassed(2, 6), false);
  assert.equal(isRoundPassed(0, 0), false);
  assert.equal(isLevelFiveComplete(['a', 'b']), false);
  assert.equal(isLevelFiveComplete(['a', 'b', 'c']), true);
  assert.deepEqual(wordMaterial({ builtWords: ['oma'], words: ['mama', 'oma'] }), ['oma', 'mama']);
});

test('available sentences need all learned words', () => {
  const available = availableSentences(['mama', 'male'], SENTENCES, SIGHT_WORDS);
  const texts = available.map((sentence) => sentence.text);
  assert.ok(texts.includes('Mama ist da.'));
  assert.ok(texts.includes('Ich male.'));
  assert.ok(!texts.includes('Oma ist da.'));
  assert.equal(buildSentenceRound(available, 5, seededRandom(1)).length, Math.min(5, available.length));
});

test('picture tasks have three options with exactly one target', () => {
  const pictured = WORDS.filter((word) => word.picture);
  const targets = pictureTargets(['mama', 'oma', 'male'], WORDS);
  assert.deepEqual(targets.map((word) => word.id).sort(), ['mama', 'oma']);
  const task = buildPictureTask(targets[0], pictured, seededRandom(7));
  assert.equal(task.options.length, 3);
  assert.equal(task.options.filter((word) => word.id === targets[0].id).length, 1);
  assert.equal(buildPictureRound(targets, 6, seededRandom(1)).length, 6);
});

test('find-the-word prefers similar distractors and falls back to other words', () => {
  assert.ok(similarityScore(wordById('rose'), wordById('hose')) > similarityScore(wordById('rose'), wordById('kakao')));
  const material = ['rose', 'hose', 'dose', 'nase', 'kakao', 'ufo', 'mama'].map(wordById);
  const task = buildFindTask(wordById('rose'), material, WORDS, seededRandom(3));
  assert.equal(task.options.length, 4);
  const small = buildFindTask(mama, [mama], WORDS, seededRandom(3));
  assert.equal(small.options.length, 4);
  assert.equal(new Set(small.options.map((word) => word.id)).size, 4);
});

test('gap tasks never use sight words and distractors have another type', () => {
  const material = ['oma', 'tomate', 'male', 'lila', 'rose', 'mama'].map(wordById);
  const sentence = sentenceById('s34');
  const task = buildGapTask(sentence, material, WORDS, seededRandom(2));
  assert.ok(!SIGHT_WORDS.includes(sentence.tokens[task.gapIndex]));
  assert.equal(task.options.length, 3);
  task.options.filter((word) => word.id !== task.answer.id).forEach((word) => assert.notEqual(word.type, task.answer.type));
});

test('gap candidates skip nouns directly after "ist"', () => {
  const material = ['oma'].map(wordById);
  const sentence = SENTENCES.find((candidate) => candidate.text === 'Das ist Oma.');
  assert.deepEqual(gapCandidates(sentence, material), []);
});

test('memory deck has word and picture cards per pair', () => {
  const targets = WORDS.filter((word) => word.picture).slice(0, 8);
  const deck = buildDeck(targets, 6, seededRandom(1));
  assert.equal(deck.length, 12);
  assert.equal(deck.filter((card) => card.kind === 'word').length, 6);
});

test('memory counts mistakes only after both cards were seen', () => {
  const targets = ['mama', 'oma', 'rose'].map(wordById);
  const game = createMemoryGame(buildDeck(targets, 3, seededRandom(1)));
  flip(game, 'mama-word');
  assert.equal(flip(game, 'oma-word').event, 'mismatch');
  assert.equal(isPairCorrect(game, 'mama'), true);
  flip(game, 'mama-picture');
  flip(game, 'oma-picture');
  flip(game, 'mama-word');
  assert.equal(flip(game, 'rose-word').event, 'mismatch');
  assert.equal(isPairCorrect(game, 'mama'), false);
  flip(game, 'mama-word');
  assert.equal(flip(game, 'mama-picture').event, 'match');
  ['oma-word', 'oma-picture', 'rose-word', 'rose-picture'].forEach((cardId) => flip(game, cardId));
  assert.equal(isFinished(game), true);
});

test('sentence builder shuffles away from every solution and accepts alternatives', () => {
  const sentence = SENTENCES.find((candidate) => candidate.text === 'Mama ist da.');
  for (let seed = 1; seed < 20; seed++) {
    const task = buildSentenceTask(sentence, seededRandom(seed));
    const order = task.tiles.map((tile) => tile.token);
    assert.equal(checkSentence(task, order), false);
  }
  const task = buildSentenceTask(sentence, seededRandom(1));
  assert.equal(checkSentence(task, ['mama', 'ist', 'da']), true);
  assert.equal(checkSentence(task, ['da', 'ist', 'mama']), true);
  assert.ok(builderSentences(SENTENCES).every((candidate) => candidate.tokens.length >= 3));
});
