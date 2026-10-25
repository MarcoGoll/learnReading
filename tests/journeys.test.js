import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState } from '../js/state/defaultState.js';
import { activeJourney, unlockNextJourney, startJourney, switchJourney, waitingEgg, isFamilyComplete } from '../js/state/journeyState.js';
import { starsForRound, applyStars, journeyStarTotal, hasAllStars } from '../js/logic/stars.js';
import { currentNeeds, applyCareAction, suggestedAction, moodOf } from '../js/logic/care.js';
import { unlockStarRewards, toggleWorn, isWearableBy } from '../js/logic/rewards.js';
import { REWARDS, rewardById } from '../js/data/rewards.js';
import { createRoundSession } from '../js/logic/roundSession.js';

const DAY = 24 * 60 * 60 * 1000;

test('the next journey is unlocked, started with a name, and becomes active', () => {
  const state = createDefaultState();
  assert.equal(waitingEgg(state), undefined);
  assert.equal(startJourney(state, 'triceratops', 'Trixi'), false);
  assert.equal(unlockNextJourney(state, 'trex').id, 'triceratops');
  assert.equal(unlockNextJourney(state, 'trex'), null);
  assert.equal(waitingEgg(state).id, 'triceratops');
  assert.equal(startJourney(state, 'triceratops', 'Trixi'), true);
  assert.equal(state.activeJourney, 'triceratops');
  assert.equal(activeJourney(state).dinoName, 'Trixi');
  assert.equal(waitingEgg(state), undefined);
  assert.equal(unlockNextJourney(state, 'pterosaur'), null);
});

test('switching keeps the progress of every dino', () => {
  const state = createDefaultState();
  state.journeys.trex.dinoStage = 5;
  unlockNextJourney(state, 'trex');
  startJourney(state, 'triceratops', 'Trixi');
  activeJourney(state).currentLevel = 2;
  assert.equal(switchJourney(state, 'trex'), true);
  assert.equal(activeJourney(state).dinoStage, 5);
  assert.equal(switchJourney(state, 'longneck'), false);
  assert.equal(state.journeys.triceratops.currentLevel, 2);
});

test('the family is complete when all dinos are fully grown', () => {
  const state = createDefaultState();
  assert.equal(isFamilyComplete(state), false);
  Object.values(state.journeys).forEach((journey) => { journey.dinoStage = 5; });
  assert.equal(isFamilyComplete(state), true);
});

test('stars: 3 for 100 % without not yet, 2 from 75 %, 1 from 50 %, none below or with few tasks', () => {
  assert.equal(starsForRound(8, 8, 0), 3);
  assert.equal(starsForRound(8, 8, 1), 2);
  assert.equal(starsForRound(6, 8, 0), 2);
  assert.equal(starsForRound(4, 8, 0), 1);
  assert.equal(starsForRound(3, 8, 0), 0);
  assert.equal(starsForRound(2, 2, 0), 0);
});

test('only better stars are stored and totals are counted', () => {
  const first = applyStars({}, 1, 2);
  assert.deepEqual(first, { starsByLevel: { 1: 2 }, previous: 0, best: 2 });
  const second = applyStars(first.starsByLevel, 1, 1);
  assert.equal(second.starsByLevel[1], 2);
  assert.equal(journeyStarTotal({ 1: 3, 2: 2 }), 5);
  assert.equal(hasAllStars({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 }), true);
});

test('all stars of a journey unlock its special accessory, wearable only by that dino', () => {
  const state = createDefaultState();
  assert.deepEqual(unlockStarRewards(state, REWARDS), []);
  state.journeys.trex.stars = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 };
  assert.deepEqual(unlockStarRewards(state, REWARDS).map((reward) => reward.id), ['goldenCape']);
  assert.deepEqual(unlockStarRewards(state, REWARDS), []);
  toggleWorn(state, rewardById('goldenCape'));
  assert.equal(state.journeys.trex.worn.neck, 'goldenCape');
  assert.equal(isWearableBy(rewardById('goldenCape'), 'triceratops'), false);
  assert.equal(isWearableBy(rewardById('redCap'), 'triceratops'), true);
});

test('care needs decrease by a third per day and never below 0', () => {
  const care = { hunger: 90, fun: 60, clean: 30, updatedAt: 1000 };
  assert.deepEqual(currentNeeds(care, 1000), { hunger: 90, fun: 60, clean: 30 });
  assert.deepEqual(currentNeeds(care, 1000 + DAY), { hunger: 57, fun: 27, clean: 0 });
  assert.deepEqual(currentNeeds({ hunger: 100, fun: 100, clean: 100, updatedAt: 0 }, 5 * DAY), { hunger: 100, fun: 100, clean: 100 });
});

test('a care action raises its need by 50 and the lowest need is suggested', () => {
  const care = { hunger: 80, fun: 70, clean: 20, updatedAt: 1000 };
  assert.equal(suggestedAction(currentNeeds(care, 1000)), 'clean');
  const cleaned = applyCareAction(care, 'clean', 1000);
  assert.equal(cleaned.clean, 70);
  assert.equal(cleaned.updatedAt, 1000);
  assert.equal(applyCareAction(care, 'feed', 1000).hunger, 100);
  assert.equal(moodOf({ hunger: 80, fun: 60, clean: 70 }), 'happy');
  assert.equal(moodOf({ hunger: 30, fun: 60, clean: 70 }), 'hungry');
  assert.equal(moodOf({ hunger: 80, fun: 20, clean: 70 }), 'bored');
});

test('the round session counts not-yet results for the stars', () => {
  const state = createDefaultState();
  const session = createRoundSession({ level: 1, updateState: (fn) => fn(state), today: '2026-10-25' });
  session.record('letter:m', 'correct');
  session.record('letter:a', 'notYet');
  assert.deepEqual(session.stats(), { correctCount: 1, taskCount: 1, notYetCount: 1 });
});
