import { addRoute, startRouter } from './router.js';
import { store } from './state/store.js';
import { isLevelUnlocked } from './logic/levelProgress.js';
import { isParentUnlocked } from './game/parentGate.js';
import { preloadSvgs } from './components/svgLoader.js';
import { dinoAssetPaths } from './components/dino.js';
import { renderTopBar } from './components/topBar.js';
import { initSounds } from './audio/soundPlayer.js';
import { renderHome } from './screens/home.js';
import { renderLevel1 } from './screens/level1.js';
import { renderLevel2 } from './screens/level2.js';
import { renderLevel3 } from './screens/level3.js';
import { renderLevel4 } from './screens/level4.js';
import { renderChallengeMenu, renderChallengeVariant } from './screens/challenge.js';
import { renderPractice } from './screens/practice.js';
import { renderParents } from './screens/parents.js';
import { renderParentStats } from './screens/parentStats.js';
import { renderWardrobe } from './screens/wardrobe.js';
import { practiceItemCount } from './logic/practice.js';

/** Level screens by level number. */
const LEVEL_SCREENS = { 1: renderLevel1, 2: renderLevel2, 3: renderLevel3, 4: renderLevel4, 5: renderChallengeMenu };

/**
 * Redirects to the home screen when a level is locked.
 * @param {Array<string>} params - Route parameters (level number first).
 * @returns {string|null} Redirect path or null.
 */
function levelGuard(params) {
  return isLevelUnlocked(store.getState(), Number(params[0])) ? null : '/';
}

/**
 * Redirects to the home screen when the parent gate was not passed in this session.
 * @returns {string|null} Redirect path or null.
 */
function parentGuard() {
  return isParentUnlocked() ? null : '/';
}

/**
 * Registers all routes of the app.
 */
function registerRoutes() {
  addRoute(/^\/$/, renderHome);
  addRoute(/^\/level\/([1-5])$/, (container, params) => LEVEL_SCREENS[params[0]](container), levelGuard);
  addRoute(/^\/level\/(5)\/([a-zA-Z]+)$/, (container, params) => renderChallengeVariant(container, params[1]), levelGuard);
  addRoute(/^\/practice$/, renderPractice, () => (practiceItemCount(store.getState().history) > 0 ? null : '/'));
  addRoute(/^\/wardrobe$/, renderWardrobe);
  addRoute(/^\/parents$/, renderParents, parentGuard);
  addRoute(/^\/parents\/stats$/, renderParentStats, parentGuard);
}

/**
 * Starts the app: loads graphics, prepares sounds, and shows the first screen.
 */
async function startApp() {
  await preloadSvgs(dinoAssetPaths());
  initSounds();
  renderTopBar(document.getElementById('top-bar'));
  registerRoutes();
  startRouter(document.getElementById('screen'));
}

startApp();
