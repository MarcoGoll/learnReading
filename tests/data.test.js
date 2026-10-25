import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { LETTERS, splitIntoLetters } from '../js/data/letters.js';
import { OPEN_SYLLABLES } from '../js/data/syllables.js';
import { WORDS, displaySyllables } from '../js/data/words.js';
import { SENTENCES, SIGHT_WORDS } from '../js/data/sentences.js';
import { REWARDS } from '../js/data/rewards.js';

test('letter set has A-Z, umlauts, and the six sounds', () => {
  assert.equal(LETTERS.length, 35);
  assert.equal(LETTERS.find((item) => item.id === 'sch').display, 'Sch sch');
  assert.equal(LETTERS.find((item) => item.id === 'ie').type, 'vowel');
});

test('syllables split into known letters', () => {
  assert.deepEqual(splitIntoLetters('schu'), ['sch', 'u']);
  assert.deepEqual(splitIntoLetters('che'), ['ch', 'e']);
  assert.deepEqual(splitIntoLetters('bie'), ['b', 'ie']);
});

test('every syllable of the first journey is open (ends with a vowel letter)', () => {
  const vowelIds = [...LETTERS.filter((item) => item.type === 'vowel').map((item) => item.id), 'y'];
  OPEN_SYLLABLES.forEach((syllable) => {
    assert.ok(vowelIds.includes(syllable.letters.at(-1)), `closed syllable ${syllable.id}`);
  });
});

test('word list has about 200 words made of known syllables', () => {
  const syllableIds = new Set(OPEN_SYLLABLES.map((syllable) => syllable.id));
  assert.ok(WORDS.length >= 170, `only ${WORDS.length} words`);
  WORDS.forEach((word) => {
    word.syllables.forEach((syllable) => assert.ok(syllableIds.has(syllable), `${word.id}: ${syllable}`));
    assert.equal(word.syllables.join(''), word.id);
  });
});

test('word ids are unique and display syllables keep the case', () => {
  assert.equal(new Set(WORDS.map((word) => word.id)).size, WORDS.length);
  assert.deepEqual(displaySyllables(WORDS.find((word) => word.id === 'mama')), ['Ma', 'ma']);
});

test('every picture reference has an SVG file', () => {
  const pictured = WORDS.filter((word) => word.picture);
  assert.ok(pictured.length >= 60, `only ${pictured.length} pictures`);
  pictured.forEach((word) => {
    assert.ok(existsSync(new URL(`../assets/svg/pictures/${word.picture}.svg`, import.meta.url)), word.picture);
  });
});

test('every sentence token is a known word or a sight word', () => {
  const wordIds = new Set(WORDS.map((word) => word.id));
  assert.ok(SENTENCES.length >= 75, `only ${SENTENCES.length} sentences`);
  SENTENCES.forEach((sentence) => {
    assert.ok(sentence.tokens.length >= 2 && sentence.tokens.length <= 4, sentence.text);
    assert.ok(sentence.tokens.some((token) => wordIds.has(token)), sentence.text);
    sentence.tokens.forEach((token) => assert.ok(wordIds.has(token) || SIGHT_WORDS.includes(token), `${sentence.text}: ${token}`));
  });
});

test('sentence alternatives use the same tokens', () => {
  SENTENCES.forEach((sentence) => {
    sentence.alternatives.forEach((order) => assert.deepEqual([...order].sort(), [...sentence.tokens].sort(), sentence.text));
  });
});

test('point rewards are sorted by price and all rewards have SVG files', () => {
  REWARDS.forEach((reward, index) => {
    if (index > 0 && reward.price !== null && REWARDS[index - 1].price !== null) {
      assert.ok(reward.price >= REWARDS[index - 1].price);
    }
    assert.ok(existsSync(new URL(`../assets/svg/accessories/${reward.id}.svg`, import.meta.url)), reward.id);
  });
});
