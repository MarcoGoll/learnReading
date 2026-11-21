import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState, normalizeState, STATE_VERSION } from '../js/state/defaultState.js';
import { switchSubject, switchJourney, startJourney, activeJourney, waitingEgg, isFamilyComplete, activeSubject } from '../js/state/journeyState.js';
import { finishRound, isLevelUnlocked, stageForLevel } from '../js/logic/levelProgress.js';
import { mathLevelGoal, isMathLevelComplete, mathBasePoints } from '../js/logic/math/mathLevelGoals.js';
import { levelGoal } from '../js/logic/levelGoals.js';
import { progressHint } from '../js/logic/progressHints.js';
import { maxJourneyStars, hasAllStars } from '../js/logic/stars.js';
import { nextJourney, journeysOfSubject, levelCountOf } from '../js/data/journeys.js';
import { mathLevelTitles } from '../js/content/mathProfiles.js';

/**
 * Creates a state whose active journey is the started Stegosaurus.
 * @returns {object} State.
 */
function mathState() {
  const state = createDefaultState();
  switchSubject(state, 'math');
  startJourney(state, 'stegosaurus', 'Stego');
  return state;
}

test('a version 2 save is migrated to version 3 with a waiting math egg', () => {
  const oldSave = { ...createDefaultState(), version: 2, activeJourney: 'trex' };
  delete oldSave.journeys.stegosaurus;
  delete oldSave.journeys.ankylosaurus;
  delete oldSave.journeys.parasaurolophus;
  delete oldSave.lastJourneyBySubject;
  oldSave.journeys.trex.dinoName = 'Rexi';
  oldSave.score.total = 900;
  const state = normalizeState(JSON.parse(JSON.stringify(oldSave)));
  assert.equal(state.version, STATE_VERSION);
  assert.equal(state.journeys.trex.dinoName, 'Rexi');
  assert.equal(state.score.total, 900);
  assert.equal(state.journeys.stegosaurus.unlocked, true);
  assert.equal(state.journeys.stegosaurus.started, false);
  assert.equal(state.journeys.ankylosaurus.unlocked, false);
  assert.deepEqual(state.lastJourneyBySubject, { reading: 'trex', math: 'stegosaurus' });
  assert.equal(state.mathFamilyCelebrated, false);
});

test('switching subjects remembers the last dino of each world', () => {
  const state = createDefaultState();
  assert.equal(activeSubject(state), 'reading');
  const first = switchSubject(state, 'math');
  assert.equal(state.activeJourney, 'stegosaurus');
  assert.equal(first.started, false);
  startJourney(state, 'stegosaurus', 'Stego');
  switchSubject(state, 'reading');
  assert.equal(state.activeJourney, 'trex');
  state.journeys.triceratops.unlocked = true;
  startJourney(state, 'triceratops', 'Trixi');
  switchSubject(state, 'math');
  assert.equal(activeJourney(state).dinoName, 'Stego');
  switchSubject(state, 'reading');
  assert.equal(state.activeJourney, 'triceratops');
  assert.equal(switchJourney(state, 'stegosaurus'), true);
  assert.equal(state.lastJourneyBySubject.math, 'stegosaurus');
});

test('math journeys have 7 levels, unlock in order, and only unlock math journeys', () => {
  assert.equal(levelCountOf('stegosaurus'), 7);
  assert.equal(levelCountOf('trex'), 5);
  assert.equal(nextJourney('stegosaurus').id, 'ankylosaurus');
  assert.equal(nextJourney('pterosaur'), undefined);
  assert.equal(nextJourney('parasaurolophus'), undefined);
  assert.deepEqual(journeysOfSubject('math').map((journey) => journey.id), ['stegosaurus', 'ankylosaurus', 'parasaurolophus']);
  const state = mathState();
  assert.equal(isLevelUnlocked(state, 1), true);
  assert.equal(isLevelUnlocked(state, 2), false);
  activeJourney(state).currentLevel = 7;
  assert.equal(isLevelUnlocked(state, 7), true);
  assert.equal(isLevelUnlocked(state, 8), false);
});

test('math levels complete with different first-attempt tasks and map to dino stages', () => {
  const state = mathState();
  const ids = Array.from({ length: 10 }, (_, index) => `count:${index}`);
  assert.equal(mathLevelGoal(1, state, ids.slice(0, 4)).current, 4);
  const outcome = finishRound(state, { level: 1, correctIds: ids, roundScore: 100, isComplete: (current) => isMathLevelComplete(1, current), stats: { correctCount: 10, taskCount: 10, notYetCount: 0 } });
  assert.equal(outcome.levelCompletedNow, true);
  assert.equal(outcome.stageChanged, true);
  assert.equal(activeJourney(state).dinoStage, 1);
  assert.equal(activeJourney(state).currentLevel, 2);
  assert.deepEqual(state.pools.letters, []);
  assert.equal(levelGoal(1, state).wasCompleted, true);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map((level) => stageForLevel('math', level)), [1, 2, 0, 3, 0, 4, 5]);
  assert.equal(stageForLevel('reading', 3), 3);
});

test('a level without a new stage completes without changing the dino', () => {
  const state = mathState();
  const journey = activeJourney(state);
  Object.assign(journey, { currentLevel: 3, completedLevels: [1, 2], dinoStage: 2 });
  journey.mastered[3] = Array.from({ length: 14 }, (_, index) => `subtract:${index + 1}-0`);
  const outcome = finishRound(state, { level: 3, correctIds: ['subtract:9-4'], roundScore: 50, isComplete: (current) => isMathLevelComplete(3, current) });
  assert.equal(outcome.levelCompletedNow, true);
  assert.equal(outcome.stageChanged, false);
  assert.equal(journey.dinoStage, 2);
});

test('completing level 7 makes the dino fully grown and lays the next math egg', () => {
  const state = mathState();
  const journey = activeJourney(state);
  Object.assign(journey, { currentLevel: 7, completedLevels: [1, 2, 3, 4, 5, 6], dinoStage: 4, passedVariants: ['missingNumber', 'mathMemory', 'numberLine'] });
  const outcome = finishRound(state, { level: 7, correctIds: [], roundScore: 200, isComplete: (current) => isMathLevelComplete(7, current) });
  assert.equal(journey.dinoStage, 5);
  assert.equal(outcome.unlockedJourney.id, 'ankylosaurus');
  assert.equal(waitingEgg(state, 'math').id, 'ankylosaurus');
  assert.equal(state.journeys.triceratops.unlocked, false);
});

test('families are complete per subject', () => {
  const state = createDefaultState();
  journeysOfSubject('reading').forEach((journey) => { state.journeys[journey.id].dinoStage = 5; });
  assert.equal(isFamilyComplete(state, 'reading'), true);
  assert.equal(isFamilyComplete(state, 'math'), false);
  journeysOfSubject('math').forEach((journey) => { state.journeys[journey.id].dinoStage = 5; });
  assert.equal(isFamilyComplete(state, 'math'), true);
});

test('stars, points, titles, and hints of math journeys', () => {
  assert.equal(maxJourneyStars(7), 21);
  assert.equal(hasAllStars({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 }, 21), false);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(mathBasePoints), [10, 20, 20, 30, 40, 40, 50]);
  assert.equal(mathLevelTitles('stegosaurus')[7], 'Abenteuer');
  assert.equal(mathLevelTitles('stegosaurus')[2], 'Plus');
  const state = mathState();
  const hint = progressHint('stegosaurus', state);
  assert.equal(hint.level, 1);
  assert.match(hint.text, /noch 10 Zahlen-Aufgaben/);
  assert.equal(progressHint('trex', state).level, 1);
});
