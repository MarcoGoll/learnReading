import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { splitIntoLetters, COMBINATIONS } from '../js/data/letters.js';
import { SYLLABLES } from '../js/data/syllables.js';
import { ALL_WORDS, wordById } from '../js/data/allWords.js';
import { WORDS_TRICERATOPS } from '../js/data/wordsTriceratops.js';
import { WORDS_LONGNECK } from '../js/data/wordsLongneck.js';
import { ALL_SENTENCES } from '../js/data/allSentences.js';
import { SENTENCES_TRICERATOPS } from '../js/data/sentencesTriceratops.js';
import { SENTENCES_LONGNECK } from '../js/data/sentencesLongneck.js';
import { STORIES } from '../js/data/stories.js';
import { ALL_SIGHT_WORDS } from '../js/data/sightWords.js';
import { PROFILES } from '../js/content/profiles.js';
import { buildTask, checkAnswer } from '../js/logic/dragDropLevel.js';
import { seededRandom } from './helpers.js';

test('letter combinations split as one sound', () => {
  assert.equal(COMBINATIONS.length, 14);
  assert.deepEqual(splitIntoLetters('stock'), ['st', 'o', 'ck']);
  assert.deepEqual(splitIntoLetters('bank'), ['b', 'a', 'nk']);
  assert.deepEqual(splitIntoLetters('ball'), ['b', 'a', 'll']);
  assert.deepEqual(splitIntoLetters('pfan'), ['pf', 'a', 'n']);
});

test('every word of every list consists of known syllables', () => {
  const syllableIds = new Set(SYLLABLES.map((syllable) => syllable.id));
  ALL_WORDS.forEach((word) => word.syllables.forEach((syllable) => assert.ok(syllableIds.has(syllable), `${word.id}: ${syllable}`)));
});

test('Triceratops words contain a closed syllable or a combination', () => {
  assert.ok(WORDS_TRICERATOPS.length >= 120, `only ${WORDS_TRICERATOPS.length} words`);
  WORDS_TRICERATOPS.forEach((word) => {
    const syllables = word.syllables.map((id) => SYLLABLES.find((syllable) => syllable.id === id));
    assert.ok(syllables.some((syllable) => syllable.closed || syllable.hasCombination), word.id);
  });
});

test('long-neck words are long or compound, and compound parts exist', () => {
  assert.ok(PROFILES.longneck.words.length >= 90, `only ${PROFILES.longneck.words.length} words`);
  PROFILES.longneck.words.forEach((word) => assert.ok(word.syllables.length >= 3 || word.parts, word.id));
  WORDS_LONGNECK.filter((word) => word.parts).forEach((word) => {
    word.parts.forEach((part) => assert.ok(wordById(part), `${word.id}: ${part}`));
    assert.equal(word.parts.map((part) => wordById(part).display.toLowerCase()).join(''), word.display.toLowerCase());
  });
});

test('every picture of every word list exists', () => {
  ALL_WORDS.filter((word) => word.picture).forEach((word) => {
    assert.ok(existsSync(new URL(`../assets/svg/pictures/${word.picture}.svg`, import.meta.url)), word.picture);
  });
});

test('all sentences use known words or sight words', () => {
  assert.ok(SENTENCES_TRICERATOPS.length >= 40 && SENTENCES_LONGNECK.length >= 30);
  ALL_SENTENCES.forEach((sentence) => sentence.tokens.forEach((token) => {
    assert.ok(wordById(token) || ALL_SIGHT_WORDS.includes(token), `${sentence.id}: ${token}`);
  }));
  assert.equal(new Set(ALL_SENTENCES.map((sentence) => sentence.id)).size, ALL_SENTENCES.length);
});

test('20 stories with 3-4 sentences and a picture question', () => {
  assert.equal(STORIES.length, 20);
  STORIES.forEach((story) => {
    assert.ok(story.sentences.length >= 3 && story.sentences.length <= 4, story.id);
    assert.ok(story.question.options.includes(story.question.answer), story.id);
    story.question.options.forEach((id) => assert.ok(wordById(id) && wordById(id).picture, `${story.id}: ${id}`));
    story.pictures.forEach((id) => assert.ok(wordById(id) && wordById(id).picture, `${story.id}: ${id}`));
    story.question.tokens.forEach((token) => assert.ok(wordById(token) || ALL_SIGHT_WORDS.includes(token), `${story.id}: ${token}`));
  });
});

test('compound words are built from their part words plus one distractor', () => {
  const word = wordById('baumhaus');
  const task = buildTask(word, [], seededRandom(3), ['tisch', 'baum', 'haus']);
  assert.equal(task.kind, 'parts');
  assert.equal(task.slots, 2);
  assert.equal(task.tiles.length, 3);
  assert.equal(checkAnswer(task, ['baum', 'haus']), true);
  assert.equal(checkAnswer(task, ['haus', 'baum']), false);
});

test('every journey profile has enough words for the goals', () => {
  Object.entries(PROFILES).forEach(([id, profile]) => {
    assert.ok(profile.words.length >= 20, `${id}: ${profile.words.length}`);
    assert.ok(profile.sentences.length >= 10, `${id}: ${profile.sentences.length}`);
  });
});
