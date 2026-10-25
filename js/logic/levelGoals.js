import { mergeUnique } from './random.js';
import { MIN_LETTERS } from './letterLevel.js';
import { buildableWords, MIN_WORDS_LEVEL_THREE } from './wordLevel.js';
import { MIN_BUILDABLE_WORDS } from './syllableLevel.js';
import { MIN_BUILT_WORDS } from './dragDropLevel.js';
import { VARIANTS_TO_COMPLETE } from './challengeLevel.js';
import { POOL_BY_LEVEL } from './levelProgress.js';

/** Goal descriptions shown to the child and the adult. */
const GOAL_TEXTS = {
  1: `Ziel: ${MIN_LETTERS} Buchstaben richtig lesen`,
  2: `Ziel: so viele Silben lernen, dass ${MIN_BUILDABLE_WORDS} Wörter möglich sind`,
  3: `Ziel: ${MIN_WORDS_LEVEL_THREE} Wörter richtig lesen`,
  4: `Ziel: ${MIN_BUILT_WORDS} Wörter richtig bauen`,
  5: `Ziel: ${VARIANTS_TO_COMPLETE} verschiedene Abenteuer schaffen (je mindestens die Hälfte richtig)`
};

/**
 * Returns the raw progress of a level for a pool that already contains the new items.
 * @param {number} level - Level 1-5.
 * @param {Array<string>} pool - Pool of the level (passed variants for level 5).
 * @param {Array<object>} wordList - All words (needed for level 2).
 * @returns {{current: number, target: number, detail: string}} Progress.
 */
function rawProgress(level, pool, wordList) {
  const targets = { 1: MIN_LETTERS, 2: MIN_BUILDABLE_WORDS, 3: MIN_WORDS_LEVEL_THREE, 4: MIN_BUILT_WORDS, 5: VARIANTS_TO_COMPLETE };
  const units = { 1: 'Buchstaben', 2: 'mögliche Wörter', 3: 'gelesene Wörter', 4: 'gebaute Wörter', 5: 'Abenteuer' };
  const count = level === 2 ? buildableWords(pool, wordList).length : pool.length;
  const current = Math.min(count, targets[level]);
  return { current, target: targets[level], detail: `${current} von ${targets[level]} ${units[level]}` };
}

/**
 * Returns the goal and progress of a level, including items mastered in the running round.
 * @param {number} level - Level 1-5.
 * @param {object} state - Game state.
 * @param {Array<object>} wordList - All words.
 * @param {Array<string>} [roundIds=[]] - Ids mastered in the running round (or passed variants).
 * @returns {{text: string, current: number, target: number, detail: string, isReached: boolean, wasCompleted: boolean}} Goal.
 */
export function levelGoal(level, state, wordList, roundIds = []) {
  const basePool = level === 5 ? state.challenge.passedVariants : state.pools[POOL_BY_LEVEL[level]];
  const progress = rawProgress(level, mergeUnique(basePool, roundIds), wordList);
  return {
    text: GOAL_TEXTS[level],
    ...progress,
    isReached: progress.current >= progress.target,
    wasCompleted: state.completedLevels.includes(level)
  };
}
