import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suggestSyllables, parseCustomWord, validateCustomWord, unknownSounds, journeysForWord } from '../js/logic/customWords.js';
import { addCustomWord, deleteCustomWord, setWordHidden, practiceKeyFilter, registerCustomContent } from '../js/content/customContent.js';
import { activeProfile, profileOf } from '../js/content/profiles.js';
import { levelGoal } from '../js/logic/levelGoals.js';
import { level2Syllables, readableWords } from '../js/content/levelRules.js';
import { wordById } from '../js/data/allWords.js';
import { syllableById } from '../js/data/syllables.js';
import { createDefaultState, normalizeState } from '../js/state/defaultState.js';
import { buildPracticeRound, practiceItemCount } from '../js/logic/practice.js';

/**
 * Creates a state whose T-Rex journey has started.
 * @returns {object} Game state.
 */
function startedState() {
  const state = createDefaultState();
  state.journeys.trex.started = true;
  return state;
}

test('syllable suggestion follows the basic German rules', () => {
  const cases = { Banane: 'Ba-na-ne', Teller: 'Tel-ler', Zucker: 'Zu-cker', Fenster: 'Fens-ter', Tasche: 'Ta-sche', Beere: 'Bee-re', Radio: 'Ra-di-o', Apfel: 'Ap-fel' };
  Object.entries(cases).forEach(([word, expected]) => assert.equal(suggestSyllables(word).join('-'), expected));
});

test('custom words take a typed split, the suggestion otherwise, and the type from the case', () => {
  assert.deepEqual(parseCustomWord('Erd-bee-re').syllables, ['erd', 'bee', 're']);
  assert.deepEqual(parseCustomWord('Kalle').syllables, ['kal', 'le']);
  assert.equal(parseCustomWord('Kalle').type, 'noun');
  assert.equal(parseCustomWord('laufe').type, 'other');
  assert.equal(parseCustomWord('Kalle').custom, true);
});

test('custom words are validated', () => {
  const none = new Set();
  assert.equal(validateCustomWord(parseCustomWord(''), none, none), 'empty');
  assert.equal(validateCustomWord(parseCustomWord('Straße'), none, none), 'invalidCharacters');
  assert.equal(validateCustomWord(parseCustomWord('Opa Kalle'), none, none), 'invalidCharacters');
  assert.equal(validateCustomWord(parseCustomWord('Ka--lle'), none, none), 'emptySyllable');
  assert.equal(validateCustomWord(parseCustomWord('Mama'), new Set(['mama']), none), 'duplicate');
  assert.equal(validateCustomWord(parseCustomWord('Mama'), new Set(['mama']), new Set(['mama'])), 'hiddenDuplicate');
  assert.equal(validateCustomWord(parseCustomWord('Kalle'), new Set(['mama']), none), null);
});

test('custom words go to the journey that fits their syllables', () => {
  assert.deepEqual(journeysForWord(parseCustomWord('Lu-na')), ['trex']);
  assert.deepEqual(journeysForWord(parseCustomWord('Kal-le')), ['triceratops']);
  assert.deepEqual(journeysForWord(parseCustomWord('Sto-ri')), ['triceratops']);
  assert.deepEqual(journeysForWord(parseCustomWord('Ka-ro-li-ne')), ['trex', 'longneck']);
});

test('unknown sounds are reported for the hint', () => {
  assert.deepEqual(unknownSounds(parseCustomWord('Co-la'), ['o', 'l', 'a']), ['c']);
  assert.deepEqual(unknownSounds(parseCustomWord('Lu-na'), ['l', 'u', 'n', 'a']), []);
});

test('custom words join the profile, their syllables appear in level 2, and they count for goals', () => {
  const state = startedState();
  addCustomWord(state, parseCustomWord('Lu-na'));
  assert.ok(activeProfile(state).words.some((word) => word.id === 'luna'));
  assert.ok(!profileOf('triceratops', state).words.some((word) => word.id === 'luna'));
  state.pools.letters = ['l', 'u', 'n', 'a'];
  assert.ok(level2Syllables(state).some((syllable) => syllable.id === 'lu'));
  state.pools.syllables = ['lu', 'na'];
  assert.ok(readableWords(state).some((word) => word.id === 'luna'));
  state.journeys.trex.mastered[3] = ['luna'];
  assert.equal(levelGoal(3, state).current, 1);
  assert.equal(wordById('luna').display, 'Luna');
});

test('new syllables of custom words are found by syllableById', () => {
  const state = startedState();
  addCustomWord(state, parseCustomWord('Kno-ppi'));
  registerCustomContent(state);
  assert.equal(syllableById('ppi').id, 'ppi');
});

test('hidden and deleted words leave rounds and open goals, completed levels stay', () => {
  const state = startedState();
  state.journeys.trex.mastered[3] = ['mama', 'oma'];
  state.journeys.trex.completedLevels = [1, 2, 3];
  setWordHidden(state, 'mama', true);
  assert.ok(!activeProfile(state).words.some((word) => word.id === 'mama'));
  assert.equal(levelGoal(3, state).current, 1);
  assert.equal(levelGoal(3, state).wasCompleted, true);
  setWordHidden(state, 'mama', false);
  assert.equal(levelGoal(3, state).current, 2);
  addCustomWord(state, parseCustomWord('Lu-na'));
  deleteCustomWord(state, 'luna');
  assert.ok(!activeProfile(state).words.some((word) => word.id === 'luna'));
});

test('hidden and deleted words are not practiced', () => {
  const state = startedState();
  const difficult = { correct: 0, wrong: 3, consecutiveCorrect: 0 };
  state.history = { 'word:mama': { ...difficult }, 'word:geloescht': { ...difficult }, 'syllable:ma': { ...difficult } };
  setWordHidden(state, 'mama', true);
  const filter = practiceKeyFilter(state);
  assert.deepEqual(buildPracticeRound(state.history, 8, filter), ['syllable:ma']);
  assert.equal(practiceItemCount(state.history, filter), 1);
});

test('older saves get empty custom content', () => {
  const state = normalizeState({ version: 2, score: { total: 0 } });
  assert.deepEqual(state.content, { customWords: [], hiddenWordIds: [] });
});
