import { el } from '../components/dom.js';
import { createScoreBoard } from '../components/scoreBoard.js';
import { createCompanionDino } from '../components/dino.js';
import { store } from '../state/store.js';
import { createGoalBanner } from '../components/goalBanner.js';
import { levelGoal } from '../logic/levelGoals.js';
import { activeJourney, activeJourneyDef } from '../state/journeyState.js';

/**
 * Builds the common layout of a level screen: header with title and score board,
 * a stage area for the task, the companion dino, and a footer for controls.
 * @param {HTMLElement} container - Screen container (content is replaced).
 * @param {object} options - Layout options.
 * @param {string} options.title - Level title.
 * @param {number|string} options.recordLevel - Level whose record is shown.
 * @param {string} [options.hint] - Hint text for the adult.
 * @param {number} [options.goalLevel] - Level whose goal is shown in a banner.
 * @returns {object} Layout parts: stage, footer, hint, scoreBoard, companion, root, showGoal.
 */
export function createLevelLayout(container, { title, recordLevel, hint, goalLevel }) {
  const state = store.getState();
  const journey = activeJourney(state);
  const scoreBoard = createScoreBoard(journey.levelRecords[recordLevel] || 0);
  const stage = el('div', { className: 'level-screen__stage' });
  const companionArea = el('div', { className: 'level-screen__companion' });
  const hintElement = el('p', { className: 'level-screen__hint', text: hint || '' });
  hintElement.hidden = !hint;
  const footer = el('div', { className: 'level-screen__footer' });
  const goalBanner = goalLevel ? createGoalBanner(goalLevel) : null;
  const root = el('section', { className: 'level-screen' }, [
    el('header', { className: 'level-screen__header' }, [el('h1', { className: 'level-screen__title', text: title }), scoreBoard.element]),
    goalBanner ? goalBanner.element : null,
    el('div', { className: 'level-screen__main' }, [companionArea, stage]),
    hintElement,
    footer
  ]);
  container.replaceChildren(root);
  const companion = createCompanionDino(companionArea, activeJourneyDef(state).species, journey.dinoStage, journey.worn);
  const showGoal = (roundIds = []) => {
    if (goalBanner) goalBanner.update(levelGoal(goalLevel, store.getState(), roundIds));
  };
  showGoal();
  return { root, stage, footer, hint: hintElement, scoreBoard, companion, showGoal };
}
