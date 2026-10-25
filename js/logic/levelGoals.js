import { goalCount, goalTarget } from '../content/levelRules.js';
import { activeProfile } from '../content/profiles.js';
import { activeJourney } from '../state/journeyState.js';

/**
 * Returns goal text and unit of a level for the active journey's content.
 * @param {number} level - Level 1-5.
 * @param {object} profile - Content profile.
 * @param {number} target - Goal size.
 * @returns {{text: string, unit: string}} Texts.
 */
function goalTexts(level, profile, target) {
  if (level === 1) {
    if (profile.level1.mode === 'review') return { text: `Ziel: ${target} Laute wiederholen`, unit: 'Laute' };
    const isCombination = profile.level1.items[0].type === 'combination';
    const combinationUnit = target === 1 ? 'Buchstabenverbindung' : 'Buchstabenverbindungen';
    const unit = isCombination ? combinationUnit : 'Buchstaben';
    return { text: `Ziel: ${target} ${unit} richtig lesen`, unit };
  }
  if (level === 3 && profile.level3Mode === 'stories') {
    return { text: `Ziel: ${target} Geschichten lesen und die Frage richtig beantworten`, unit: 'Geschichten' };
  }
  const texts = {
    2: { text: `Ziel: so viele Silben lernen, dass ${target} Wörter möglich sind`, unit: 'mögliche Wörter' },
    3: { text: `Ziel: ${target} Wörter richtig lesen`, unit: 'gelesene Wörter' },
    4: { text: `Ziel: ${target} Wörter richtig bauen`, unit: 'gebaute Wörter' },
    5: { text: `Ziel: ${target} verschiedene Abenteuer schaffen (je mindestens die Hälfte richtig)`, unit: 'Abenteuer' }
  };
  return texts[level];
}

/**
 * Returns the goal and progress of a level in the active journey, including the running round.
 * @param {number} level - Level 1-5.
 * @param {object} state - Game state.
 * @param {Array<string>} [roundIds=[]] - Ids mastered in the running round (or passed variants).
 * @returns {{text: string, current: number, target: number, detail: string, isReached: boolean, wasCompleted: boolean}} Goal.
 */
export function levelGoal(level, state, roundIds = []) {
  const target = goalTarget(level, state);
  const current = Math.min(goalCount(level, state, roundIds), target);
  const texts = goalTexts(level, activeProfile(state), target);
  return {
    text: texts.text,
    current,
    target,
    detail: `${current} von ${target} ${texts.unit}`,
    isReached: current >= target,
    wasCompleted: activeJourney(state).completedLevels.includes(level)
  };
}
