import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLevelOneComplete, missingLetters, countVowels } from '../js/logic/letterLevel.js';
import { availableSyllables, buildRound as buildSyllableRound, isLevelTwoComplete, missingWords, isReachableWithLetters } from '../js/logic/syllableLevel.js';
import { buildableWords, buildRound as buildWordRound, isLevelThreeComplete } from '../js/logic/wordLevel.js';
import { finishRound, completeLevel, isLevelUnlocked } from '../js/logic/levelProgress.js';
import { SYLLABLES } from '../js/data/syllables.js';
import { WORDS } from '../js/data/words.js';
import { createDefaultState } from '../js/state/defaultState.js';
import { seededRandom } from './helpers.js';

test('level 1 needs 8 letters, no matter if vowels or consonants', () => {
  assert.equal(isLevelOneComplete(['a', 'o', 'm', 'l', 's', 'n', 't']), false);
  assert.equal(missingLetters(['a', 'm']), 6);
  assert.equal(isLevelOneComplete(['m', 'l', 's', 'n', 't', 'r', 'b', 'd']), true);
});

test('vowels are counted for the adult hint, sounds included', () => {
  assert.equal(countVowels(['a', 'm', 'au', 'sch', 'ie']), 3);
});

test('available syllables only use known letters', () => {
  const available = availableSyllables(['m', 'a', 'o'], SYLLABLES).map((syllable) => syllable.id);
  assert.ok(available.includes('ma'));
  assert.ok(available.includes('o'));
  assert.ok(!available.includes('la'));
});

test('syllable rounds put unmastered syllables first and have at most 10', () => {
  const available = availableSyllables(['m', 'a', 'o', 'l', 's', 'e', 'n', 't'], SYLLABLES);
  const round = buildSyllableRound(available, ['ma', 'mo'], 10, seededRandom(3));
  assert.equal(round.length, 10);
  assert.ok(!round.slice(0, 8).some((syllable) => ['ma', 'mo'].includes(syllable.id)));
});

test('a syllable round read without mistakes makes 5 words possible', () => {
  const available = availableSyllables(['m', 'a', 'o', 'l', 's', 'i', 'e', 'r'], SYLLABLES);
  const round = buildSyllableRound(available, [], 10, seededRandom(5), WORDS);
  assert.equal(round.length, 10);
  assert.ok(buildableWords(round.map((syllable) => syllable.id), WORDS).length >= 5);
});

test('level 2 is complete when 5 words can be built', () => {
  const pool = ['ma', 'o', 'pa', 'la', 'so', 'fa', 'mo'];
  assert.ok(buildableWords(pool, WORDS).length >= 5);
  assert.equal(isLevelTwoComplete(pool, WORDS), true);
  assert.equal(missingWords(['ma'], WORDS), 4);
});

test('reachability check detects letter sets that cannot form 5 words', () => {
  assert.equal(isReachableWithLetters(['x', 'y', 'a', 'q'], SYLLABLES, WORDS), false);
  assert.equal(isReachableWithLetters(['m', 'a', 'o', 'p', 'l', 's', 'f'], SYLLABLES, WORDS), true);
});

test('word rounds have at most 8 words, unmastered first', () => {
  const buildable = buildableWords(SYLLABLES.map((syllable) => syllable.id), WORDS);
  const round = buildWordRound(buildable, ['mama'], 8, seededRandom(5));
  assert.equal(round.length, 8);
  assert.ok(!round.some((word) => word.id === 'mama'));
});

test('level 3 needs 5 words', () => {
  assert.equal(isLevelThreeComplete(['a', 'b', 'c', 'd']), false);
  assert.equal(isLevelThreeComplete(['a', 'b', 'c', 'd', 'e']), true);
});

test('finishing a round merges pools and journey progress and completes the level once', () => {
  const state = createDefaultState();
  const rule = (current) => isLevelOneComplete(current.journeys.trex.mastered[1]);
  const outcome = finishRound(state, { level: 1, correctIds: ['a', 'o', 'm', 'l', 's', 'n', 't', 'e'], roundScore: 80, isComplete: rule, stats: { correctCount: 8, taskCount: 8, notYetCount: 0 } });
  const trex = state.journeys.trex;
  assert.equal(outcome.levelCompletedNow, true);
  assert.equal(outcome.isNewRecord, true);
  assert.equal(outcome.stars, 3);
  assert.equal(trex.currentLevel, 2);
  assert.equal(trex.dinoStage, 1);
  assert.equal(state.pools.letters.length, 8);
  const again = finishRound(state, { level: 1, correctIds: ['a', 'e'], roundScore: 20, isComplete: () => true, stats: { correctCount: 1, taskCount: 4, notYetCount: 0 } });
  assert.equal(again.levelCompletedNow, false);
  assert.equal(trex.mastered[1].length, 8);
  assert.equal(trex.stars[1], 3);
  assert.equal(trex.dinoStage, 1);
});

test('a too small pool can be filled up by replaying', () => {
  const state = createDefaultState();
  const rule = (current) => isLevelOneComplete(current.journeys.trex.mastered[1]);
  finishRound(state, { level: 1, correctIds: ['a', 'm', 'l', 's', 'n', 't', 'e'], roundScore: 70, isComplete: rule });
  assert.equal(state.journeys.trex.completedLevels.length, 0);
  const outcome = finishRound(state, { level: 1, correctIds: ['o'], roundScore: 10, isComplete: rule });
  assert.equal(outcome.levelCompletedNow, true);
});

test('locked levels are detected in the active journey', () => {
  const state = createDefaultState();
  assert.equal(isLevelUnlocked(state, 1), true);
  assert.equal(isLevelUnlocked(state, 2), false);
  completeLevel(state.journeys.trex, 1);
  assert.equal(isLevelUnlocked(state, 2), true);
  assert.equal(isLevelUnlocked(state, 6), false);
  state.activeJourney = 'triceratops';
  assert.equal(isLevelUnlocked(state, 1), false);
});

test('completing level 5 unlocks the next journey once', () => {
  const state = createDefaultState();
  state.journeys.trex.currentLevel = 5;
  const outcome = finishRound(state, { level: 5, correctIds: [], roundScore: 100, isComplete: () => true });
  assert.equal(outcome.unlockedJourney.id, 'triceratops');
  assert.equal(state.journeys.triceratops.unlocked, true);
  assert.equal(state.journeys.triceratops.started, false);
  assert.equal(state.journeys.trex.dinoStage, 5);
});
