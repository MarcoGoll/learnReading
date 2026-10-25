import { el, icon } from '../components/dom.js';
import { createDino } from '../components/dino.js';
import { promptDialog, messageDialog } from '../components/dialog.js';
import { createCareBars } from '../components/careBars.js';
import { confetti } from '../components/effects.js';
import { JOURNEYS } from '../data/journeys.js';
import { journeyStarTotal, MAX_JOURNEY_STARS } from '../logic/stars.js';
import { startJourney, switchJourney, isFamilyComplete } from '../state/journeyState.js';
import { store } from '../state/store.js';
import { navigate } from '../router.js';
import { playSound } from '../audio/soundPlayer.js';
import { pickRandom } from '../logic/random.js';

/** Intro texts when a new egg hatches into a journey. */
const EGG_INTROS = {
  triceratops: 'Im Ei wartet ein kleiner Triceratops mit drei Hörnern. Mit ihm lernst du Buchstabenverbindungen wie St und Sp und Silben wie Ball und Tisch.',
  longneck: 'Im Ei wartet ein kleiner Langhals. Mit ihm liest du lange Wörter wie Schokolade und Baumhaus.',
  pterosaur: 'Im Ei wartet ein kleiner Flugsaurier. Mit ihm liest du kurze Geschichten.'
};

/** Movement patterns of walking dinos (CSS modifiers of valley__walker). */
const WALK_PATTERNS = ['walk', 'stroll', 'hop', 'graze'];

/** Movement patterns of flying dinos. */
const FLY_PATTERNS = ['fly', 'glide'];

/**
 * Returns a random number in a range.
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {number} Random number.
 */
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Gives a walker a random movement: pattern, speed, and start point in the cycle (which also sets
 * the start direction). Only flying patterns may run in reverse, since walkers would walk backwards.
 * @param {HTMLElement} element - Walker element.
 * @param {boolean} canFly - Whether the dino flies.
 */
function randomizeMovement(element, canFly) {
  const pattern = pickRandom(canFly ? FLY_PATTERNS : WALK_PATTERNS);
  const duration = randomBetween(6, 13);
  element.classList.add(`valley__walker--${pattern}`);
  element.style.animationDuration = `${duration.toFixed(1)}s`;
  element.style.animationDelay = `-${randomBetween(0, duration).toFixed(1)}s`;
  if (canFly && Math.random() < 0.5) element.style.animationDirection = 'reverse';
}

/**
 * Returns the progress text of a started journey.
 * @param {object} journey - Journey state.
 * @returns {string} Text.
 */
function progressText(journey) {
  return journey.dinoStage >= 5 ? 'ausgewachsen' : `Level ${Math.min(journey.currentLevel, 5)} von 5`;
}

/**
 * Creates the moving dino of a started journey with a random movement pattern.
 * @param {object} definition - Journey definition.
 * @param {object} journey - Journey state.
 * @returns {HTMLElement} Walker element.
 */
function walker(definition, journey) {
  const canFly = definition.species === 'pterosaur' && journey.dinoStage >= 3;
  const element = el('div', { className: 'valley__walker' }, [createDino(definition.species, journey.dinoStage, journey.worn)]);
  randomizeMovement(element, canFly);
  return element;
}

/**
 * Creates the spot of one species in the valley.
 * @param {object} definition - Journey definition.
 * @param {object} state - Game state.
 * @returns {HTMLElement} Spot.
 */
function valleySpot(definition, state) {
  const journey = state.journeys[definition.id];
  const isActive = state.activeJourney === definition.id;
  if (!journey.unlocked) {
    return el('div', { className: 'valley__spot valley__spot--locked' }, [
      createDino(definition.species, 5, null, 'valley__silhouette'), el('span', { className: 'valley__question', text: '?' })
    ]);
  }
  if (!journey.started) {
    return el('button', { className: 'valley__spot valley__spot--egg', attrs: { type: 'button' }, on: { click: () => hatchEgg(definition) } }, [
      createDino(definition.species, 0, null), el('span', { className: 'valley__hint', text: 'Tippe auf das Ei!' })
    ]);
  }
  return el('button', { className: `valley__spot${isActive ? ' valley__spot--active' : ''}`, attrs: { type: 'button' }, on: { click: () => chooseDino(definition) } }, [
    walker(definition, journey),
    el('span', { className: 'valley__name', text: journey.dinoName || definition.speciesName }),
    el('span', { className: 'valley__info', text: progressText(journey) }),
    el('span', { className: 'valley__stars' }, [icon('star', 'valley__star'), el('span', { text: `${journeyStarTotal(journey.stars)} von ${MAX_JOURNEY_STARS}` })]),
    createCareBars(journey.care),
    isActive ? el('span', { className: 'valley__active', text: 'Du spielst gerade' }) : null
  ]);
}

/**
 * Makes a started dino active and shows its journey.
 * @param {object} definition - Journey definition.
 */
function chooseDino(definition) {
  playSound('click');
  store.updateState((state) => switchJourney(state, definition.id));
  navigate('/');
}

/**
 * Starts the journey of a waiting egg: asks for a name, then shows the new journey.
 * @param {object} definition - Journey definition.
 */
async function hatchEgg(definition) {
  playSound('click');
  const name = await promptDialog({ intro: EGG_INTROS[definition.id], question: `Wie soll dein ${definition.speciesName} heißen?`, confirmLabel: 'Fertig' });
  if (!name) {
    return;
  }
  store.updateState((state) => startJourney(state, definition.id, name));
  await messageDialog(`Hilf ${name}, groß zu werden: Mit jedem Level, das du schaffst, wächst ${name} ein Stück!`, "Los geht's", `Die Reise von ${name} beginnt!`);
  navigate('/');
}

/**
 * Plays the family celebration once when all dinos are fully grown.
 * @param {HTMLElement} valley - Valley element.
 */
function celebrateFamily(valley) {
  const state = store.getState();
  if (!isFamilyComplete(state) || state.familyCelebrated) {
    return;
  }
  store.updateState((current) => { current.familyCelebrated = true; });
  valley.classList.add('valley--celebrating');
  confetti(150);
  playSound('levelComplete');
  messageDialog('Alle vier Dinos sind groß und stark. Du bist ein echter Lese-Profi!', 'Juhu!', 'Deine Dino-Familie ist komplett!');
}

/**
 * Renders the dino valley with all dinos of the family.
 * @param {HTMLElement} container - Screen container.
 */
export function renderValley(container) {
  const state = store.getState();
  const valley = el('div', { className: 'valley' }, JOURNEYS.map((definition) => valleySpot(definition, state)));
  container.replaceChildren(el('section', { className: 'valley-screen' }, [
    el('h1', { className: 'screen-title', text: 'Dino-Tal' }),
    el('p', { className: 'valley-screen__hint', text: 'Tippe auf einen Dino, um mit ihm zu spielen.' }),
    valley
  ]));
  celebrateFamily(valley);
}
