import { el, button, icon } from '../components/dom.js';
import { renderDino } from '../components/dino.js';
import { promptDialog, messageDialog } from '../components/dialog.js';
import { createCareBars, moodText, decorateMood } from '../components/careBars.js';
import { store } from '../state/store.js';
import { activeJourney, activeJourneyDef, waitingEgg } from '../state/journeyState.js';
import { navigate } from '../router.js';
import { isLevelUnlocked } from '../logic/levelProgress.js';
import { cheapestLocked, buyableRewards } from '../logic/rewards.js';
import { practiceItemCount } from '../logic/practice.js';
import { POINT_REWARDS } from '../data/rewards.js';
import { levelGoal } from '../logic/levelGoals.js';
import { playSound } from '../audio/soundPlayer.js';
import { practiceKeyFilter } from '../content/customContent.js';

/** Short story shown when the game starts for the first time. */
const INTRO_TEXT = 'Tief im Dschungel liegt ein kleines Dino-Ei. Bald schlüpft daraus ein Dino, '
  + 'und du kannst ihm helfen, groß zu werden. Zuerst braucht dein Dino einen Namen.';

/** Titles of the levels on the map. */
const LEVEL_TITLES = { 1: 'Laute', 2: 'Silben', 3: 'Wörter', 4: 'Wörter bauen', 5: 'Abenteuer' };

/**
 * Creates the small goal progress of an open level on the map.
 * @param {object} state - Game state.
 * @param {number} level - Level number.
 * @returns {HTMLElement} Progress element.
 */
function goalProgress(state, level) {
  const goal = levelGoal(level, state);
  const fill = el('span', { className: 'level-map__goal-fill' });
  fill.style.width = `${Math.round((goal.current / goal.target) * 100)}%`;
  return el('span', { className: 'level-map__goal' }, [
    el('span', { className: 'level-map__goal-bar' }, [fill]),
    el('span', { className: 'level-map__goal-text', text: `Ziel: ${goal.current} von ${goal.target}` })
  ]);
}

/**
 * Creates the three star slots of a level.
 * @param {number} stars - Earned stars (0-3).
 * @returns {HTMLElement} Stars element.
 */
export function starSlots(stars) {
  return el('span', { className: 'level-map__stars', attrs: { 'aria-label': `${stars} von 3 Sternen` } },
    [0, 1, 2].map((index) => icon('star', `level-map__star${index < stars ? '' : ' level-map__star--empty'}`)));
}

/**
 * Creates one level island of the map.
 * @param {object} state - Game state.
 * @param {number} level - Level number.
 * @returns {HTMLButtonElement} Island button.
 */
function levelIsland(state, level) {
  const journey = activeJourney(state);
  const isUnlocked = isLevelUnlocked(state, level);
  const isCompleted = journey.completedLevels.includes(level);
  const modifier = isCompleted ? 'completed' : isUnlocked ? 'open' : 'locked';
  const island = el('button', {
    className: `level-map__island level-map__island--${modifier}`,
    attrs: { type: 'button', 'aria-label': `Level ${level}: ${LEVEL_TITLES[level]}${isUnlocked ? '' : ' (gesperrt)'}` }
  }, [
    el('span', { className: 'level-map__number', text: String(level) }),
    el('span', { className: 'level-map__name', text: LEVEL_TITLES[level] }),
    isUnlocked ? starSlots(journey.stars[level] || 0) : icon('lock', 'level-map__lock'),
    isUnlocked && !isCompleted ? goalProgress(state, level) : null,
    isCompleted ? icon('check', 'level-map__check') : null
  ]);
  island.disabled = !isUnlocked;
  island.addEventListener('click', () => { playSound('click'); navigate(`/level/${level}`); });
  return island;
}

/**
 * Creates the practice island (only when difficult items exist).
 * @param {object} state - Game state.
 * @returns {HTMLButtonElement|null} Island or null.
 */
function practiceIsland(state) {
  const count = practiceItemCount(state.history, practiceKeyFilter(state));
  if (count === 0) {
    return null;
  }
  return el('button', {
    className: 'level-map__island level-map__island--practice',
    attrs: { type: 'button' },
    on: { click: () => { playSound('click'); navigate('/practice'); } }
  }, [
    el('span', { className: 'level-map__number', text: String(count) }),
    el('span', { className: 'level-map__name', text: 'Übungsinsel' })
  ]);
}

/**
 * Returns the wardrobe hint of the home screen: shopping possible, or points missing for the cheapest item.
 * @param {object} state - Game state.
 * @returns {string} Hint text.
 */
function wardrobeHint(state) {
  if (buyableRewards(state, POINT_REWARDS).length > 0) {
    return 'Du kannst dir im Dino-Schrank etwas aussuchen!';
  }
  const cheapest = cheapestLocked(state, POINT_REWARDS);
  return cheapest ? `Noch ${cheapest.missing} Punkte bis zum nächsten Teil` : 'Alle Schätze gesammelt!';
}

/**
 * Creates the wardrobe button; it shows a badge while something can be bought.
 * @param {object} state - Game state.
 * @returns {HTMLButtonElement} Button.
 */
function wardrobeButton(state) {
  const wardrobe = button({ className: 'big-button big-button--secondary home__wardrobe', iconName: 'checkroom', label: 'Dino-Schrank', onClick: () => navigate('/wardrobe') });
  if (buyableRewards(state, POINT_REWARDS).length > 0) {
    wardrobe.append(el('span', { className: 'home__badge', text: 'Aussuchen!' }));
  }
  return wardrobe;
}

/**
 * Creates the info panel next to the dino: journey, name, care, points, next reward, and buttons.
 * @param {object} state - Game state.
 * @returns {HTMLElement} Panel.
 */
function infoPanel(state) {
  const journey = activeJourney(state);
  const valleyButton = button({ className: 'big-button home__valley', iconName: 'park', label: 'Dino-Tal', onClick: () => navigate('/valley') });
  if (waitingEgg(state)) {
    valleyButton.append(el('span', { className: 'home__badge', text: 'Neues Ei!' }));
  }
  return el('div', { className: 'home__info' }, [
    el('p', { className: 'home__journey', text: activeJourneyDef(state).title }),
    el('h1', { className: 'home__name', text: journey.dinoName || 'Dein Dino' }),
    el('p', { className: 'home__mood', text: moodText(journey.dinoName || 'Dein Dino', journey.care) }),
    createCareBars(journey.care),
    el('p', { className: 'home__points' }, [icon('star', 'home__star'), el('span', { text: `${state.score.total} Punkte` })]),
    el('p', { className: 'home__next-reward', text: wardrobeHint(state) }),
    el('div', { className: 'home__buttons' }, [
      wardrobeButton(state),
      valleyButton
    ])
  ]);
}

/**
 * Asks for the name of the first dino on the first start.
 * @param {HTMLElement} container - Screen container (re-rendered afterwards).
 */
async function askForName(container) {
  const name = await promptDialog({ intro: INTRO_TEXT, question: 'Wie soll dein Dino heißen?', confirmLabel: 'Fertig' });
  if (name) {
    store.updateState((state) => { activeJourney(state).dinoName = name; });
    renderHome(container);
    await messageDialog(greetingText(name), "Los geht's", `Die Reise von ${name} beginnt!`);
    return;
  }
  renderHome(container);
}

/**
 * Returns the personal greeting shown after the dino got its name.
 * @param {string} name - Dino name.
 * @returns {string} Greeting text.
 */
export function greetingText(name) {
  return `Noch schläft ${name} in seinem Ei. Hilf ${name} dabei, groß und stark zu werden: `
    + `Lies Buchstaben, Silben und Wörter. Mit jedem Level, das du schaffst, wächst ${name} ein Stück!`;
}

/**
 * Renders the home screen: active dino with care state, points, and the level map of its journey.
 * @param {HTMLElement} container - Screen container.
 */
export function renderHome(container) {
  const state = store.getState();
  const journey = activeJourney(state);
  const dinoArea = el('div', { className: 'home__dino' });
  const levels = [1, 2, 3, 4, 5].map((level) => levelIsland(state, level));
  container.replaceChildren(el('section', { className: 'home' }, [
    el('div', { className: 'home__hero' }, [dinoArea, infoPanel(state)]),
    el('nav', { className: 'level-map', attrs: { 'aria-label': 'Levels' } }, [...levels, practiceIsland(state)])
  ]));
  renderDino(dinoArea, activeJourneyDef(state).species, journey.dinoStage, journey.worn);
  decorateMood(dinoArea, journey.care);
  if (!journey.dinoName) {
    askForName(container);
  }
}
