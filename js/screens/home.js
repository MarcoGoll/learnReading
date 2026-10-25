import { el, button, icon } from '../components/dom.js';
import { renderDino } from '../components/dino.js';
import { promptDialog, messageDialog } from '../components/dialog.js';
import { store } from '../state/store.js';
import { navigate } from '../router.js';
import { isLevelUnlocked } from '../logic/levelProgress.js';
import { nextReward } from '../logic/rewards.js';
import { practiceItemCount } from '../logic/practice.js';
import { REWARDS } from '../data/rewards.js';
import { WORDS } from '../data/words.js';
import { levelGoal } from '../logic/levelGoals.js';
import { playSound } from '../audio/soundPlayer.js';

/** Short story shown when the game starts for the first time. */
const INTRO_TEXT = 'Tief im Dschungel liegt ein kleines Dino-Ei. Bald schlüpft daraus ein Dino, '
  + 'und du kannst ihm helfen, groß zu werden. Zuerst braucht dein Dino einen Namen.';

/** Titles of the levels on the map. */
const LEVEL_TITLES = { 1: 'Buchstaben', 2: 'Silben', 3: 'Wörter', 4: 'Wörter bauen', 5: 'Abenteuer' };

/**
 * Creates the small goal progress of an open level on the map.
 * @param {object} state - Game state.
 * @param {number} level - Level number.
 * @returns {HTMLElement} Progress element.
 */
function goalProgress(state, level) {
  const goal = levelGoal(level, state, WORDS);
  const fill = el('span', { className: 'level-map__goal-fill' });
  fill.style.width = `${Math.round((goal.current / goal.target) * 100)}%`;
  return el('span', { className: 'level-map__goal' }, [
    el('span', { className: 'level-map__goal-bar' }, [fill]),
    el('span', { className: 'level-map__goal-text', text: `Ziel: ${goal.current} von ${goal.target}` })
  ]);
}

/**
 * Creates one level island of the map.
 * @param {object} state - Game state.
 * @param {number} level - Level number.
 * @returns {HTMLButtonElement} Island button.
 */
function levelIsland(state, level) {
  const isUnlocked = isLevelUnlocked(state, level);
  const isCompleted = state.completedLevels.includes(level);
  const modifier = isCompleted ? 'completed' : isUnlocked ? 'open' : 'locked';
  const record = state.score.levelRecords[level] || 0;
  const island = el('button', {
    className: `level-map__island level-map__island--${modifier}`,
    attrs: { type: 'button', 'aria-label': `Level ${level}: ${LEVEL_TITLES[level]}${isUnlocked ? '' : ' (gesperrt)'}` }
  }, [
    el('span', { className: 'level-map__number', text: String(level) }),
    el('span', { className: 'level-map__name', text: LEVEL_TITLES[level] }),
    isUnlocked ? el('span', { className: 'level-map__record', text: `Rekord ${record}` }) : icon('lock', 'level-map__lock'),
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
  const count = practiceItemCount(state.history);
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
 * Creates the info panel next to the dino: name, total points, and next reward.
 * @param {object} state - Game state.
 * @returns {HTMLElement} Panel.
 */
function infoPanel(state) {
  const next = nextReward(state.score.total, REWARDS);
  return el('div', { className: 'home__info' }, [
    el('h1', { className: 'home__name', text: state.dinoName || 'Dein Dino' }),
    el('p', { className: 'home__points' }, [icon('star', 'home__star'), el('span', { text: `${state.score.total} Punkte` })]),
    el('p', { className: 'home__next-reward', text: next ? `Noch ${next.missing} Punkte bis: ${next.reward.name}` : 'Alle Schätze gesammelt!' }),
    button({ className: 'big-button big-button--secondary home__wardrobe', iconName: 'checkroom', label: 'Dino-Schrank', onClick: () => navigate('/wardrobe') })
  ]);
}

/**
 * Asks for the dino name on the first start.
 * @param {HTMLElement} container - Screen container (re-rendered afterwards).
 */
async function askForName(container) {
  const name = await promptDialog({ intro: INTRO_TEXT, question: 'Wie soll dein Dino heißen?', confirmLabel: 'Fertig' });
  if (name) {
    store.updateState((state) => { state.dinoName = name; });
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
function greetingText(name) {
  return `Noch schläft ${name} in seinem Ei. Hilf ${name} dabei, groß und stark zu werden: `
    + `Lies Buchstaben, Silben und Wörter. Mit jedem Level, das du schaffst, wächst ${name} ein Stück!`;
}

/**
 * Renders the home screen: dino, points, and level map.
 * @param {HTMLElement} container - Screen container.
 */
export function renderHome(container) {
  const state = store.getState();
  const dinoArea = el('div', { className: 'home__dino' });
  const levels = [1, 2, 3, 4, 5].map((level) => levelIsland(state, level));
  container.replaceChildren(el('section', { className: 'home' }, [
    el('div', { className: 'home__hero' }, [dinoArea, infoPanel(state)]),
    el('nav', { className: 'level-map', attrs: { 'aria-label': 'Levels' } }, [...levels, practiceIsland(state)])
  ]));
  renderDino(dinoArea, state.dinoStage, state.rewards.worn);
  if (!state.dinoName) {
    askForName(container);
  }
}
