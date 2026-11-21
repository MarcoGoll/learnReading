import { levelGoal } from './levelGoals.js';
import { buildableWords } from './wordLevel.js';
import { level2Syllables, readableWords, level4Words } from '../content/levelRules.js';
import { activeProfile } from '../content/profiles.js';
import { levelCountOf, subjectOf } from '../data/journeys.js';
import { mathHintParts } from './math/mathLevelGoals.js';

/**
 * Returns a view of the state in which the given journey is the active one, so the goal rules
 * (which always look at the active journey) can be used for any dino.
 * @param {object} state - Game state.
 * @param {string} journeyId - Journey id.
 * @returns {object} State view (not to be mutated).
 */
function stateFor(state, journeyId) {
  return { ...state, activeJourney: journeyId };
}

/**
 * Returns the level 1 hint: which sounds to read and how many are missing.
 * @param {object} view - State view.
 * @param {number} missing - Missing goal count.
 * @returns {object} Hint parts.
 */
function letterHint(view, missing) {
  const level1 = activeProfile(view).level1;
  if (level1.mode === 'review') {
    return { short: `noch ${missing} Laute wiederholen`, blocker: '' };
  }
  const isCombination = level1.items[0].type === 'combination';
  const unit = isCombination ? (missing === 1 ? 'Buchstabenverbindung' : 'Buchstabenverbindungen') : 'Buchstaben';
  return { short: `noch ${missing} ${unit} richtig lesen`, blocker: '' };
}

/**
 * Returns where new letters can be chosen for a journey.
 * @param {object} view - State view.
 * @returns {string} Text.
 */
function letterSource(view) {
  return activeProfile(view).level1.mode === 'select'
    ? 'Spiele Level 1 und wähle dort mehr Buchstaben aus, die das Kind kennt.'
    : 'Spiele beim T-Rex Level 1 und wähle dort mehr Buchstaben aus, die das Kind kennt.';
}

/**
 * Returns the level 2 hint; blocked when even all learnable syllables give too few words.
 * @param {object} view - State view.
 * @param {object} goal - Level goal.
 * @returns {object} Hint parts.
 */
function syllableHint(view, goal) {
  const learnable = level2Syllables(view).map((syllable) => syllable.id);
  const possible = buildableWords(learnable, activeProfile(view).words).length;
  const short = `Silben lesen, bis ${goal.target} Wörter möglich sind (jetzt ${goal.current})`;
  const blocker = possible < goal.target ? `Es fehlen Buchstaben: Mit den bekannten Buchstaben gehen nur ${possible} Wörter. ${letterSource(view)}` : '';
  return { short, blocker };
}

/**
 * Returns the level 3 hint; blocked when too few readable words are left to read.
 * @param {object} view - State view.
 * @param {number} missing - Missing goal count.
 * @returns {object} Hint parts.
 */
function wordHint(view, missing) {
  if (activeProfile(view).level3Mode === 'stories') {
    return { short: `noch ${missing} Geschichten lesen und die Frage richtig beantworten`, blocker: '' };
  }
  const mastered = new Set(view.journeys[view.activeJourney].mastered[3]);
  const open = readableWords(view).filter((word) => !mastered.has(word.id)).length;
  const blocker = open < missing ? 'Es fehlen Silben für neue Wörter: Spiele Level 2 und lies mehr Silben richtig.' : '';
  return { short: `noch ${missing} Wörter richtig lesen`, blocker };
}

/**
 * Returns the level 4 hint; blocked when too few read words are left to build.
 * @param {object} view - State view.
 * @param {number} missing - Missing goal count.
 * @returns {object} Hint parts.
 */
function buildHint(view, missing) {
  const built = new Set(view.journeys[view.activeJourney].mastered[4]);
  const open = level4Words(view).filter((word) => !built.has(word.id)).length;
  const isStories = activeProfile(view).level3Mode === 'stories';
  const source = isStories ? 'Spiele Level 2 und lies mehr Silben richtig.' : 'Spiele Level 3 und lies mehr Wörter richtig.';
  return { short: `noch ${missing} Wörter richtig bauen`, blocker: open < missing ? `Es fehlen Wörter zum Bauen: ${source}` : '' };
}

/**
 * Returns the hint parts of a level.
 * @param {object} view - State view.
 * @param {number} level - Level 1-5.
 * @param {object} goal - Level goal.
 * @returns {{short: string, blocker: string}} Hint parts.
 */
function hintParts(view, level, goal) {
  const missing = goal.target - goal.current;
  if (missing <= 0) return { short: 'Ziel erreicht, spiele eine Runde, um das Level abzuschließen', blocker: '' };
  if (level === 1) return letterHint(view, missing);
  if (level === 2) return syllableHint(view, goal);
  if (level === 3) return wordHint(view, missing);
  if (level === 4) return buildHint(view, missing);
  return {
    short: `noch ${missing} verschiedene Abenteuer schaffen`,
    blocker: '',
    tip: 'Jedes Abenteuer zählt nur einmal. Abenteuer mit Haken sind schon geschafft, probiere ein anderes.'
  };
}

/**
 * Returns the next step of a journey: the level to play and what is missing there.
 * @param {string} journeyId - Journey id.
 * @param {object} state - Game state.
 * @returns {{level: number, short: string, text: string, isBlocked: boolean, isDone: boolean}} Hint.
 */
export function progressHint(journeyId, state) {
  const journey = state.journeys[journeyId];
  const levelCount = levelCountOf(journeyId);
  if (journey.completedLevels.includes(levelCount)) {
    return { level: levelCount, short: 'ausgewachsen', text: 'Alle Level geschafft!', isBlocked: false, isDone: true };
  }
  const view = stateFor(state, journeyId);
  const level = Math.min(journey.currentLevel, levelCount);
  const goal = levelGoal(level, view);
  const parts = subjectOf(journeyId) === 'math' ? { ...mathHintParts(level, goal), blocker: '' } : hintParts(view, level, goal);
  const text = parts.blocker || `Level ${level}: ${parts.short}.${parts.tip ? ` ${parts.tip}` : ''}`;
  return { level, short: `Level ${level}: ${parts.short}`, text, isBlocked: Boolean(parts.blocker), isDone: false };
}
