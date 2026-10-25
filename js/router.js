/** Registered routes: { pattern: RegExp, render: Function, guard?: Function }. */
const routes = [];

/** Cleanup function of the currently shown screen. */
let currentCleanup = null;

/** Container element of the screens. */
let screenContainer = null;

/**
 * Registers a route.
 * @param {RegExp} pattern - Pattern matched against the path after "#".
 * @param {Function} render - Screen render function (container, params) returning a cleanup function.
 * @param {Function} [guard] - Returns a redirect path, or null to allow the route.
 */
export function addRoute(pattern, render, guard) {
  routes.push({ pattern, render, guard });
}

/**
 * Navigates to a path.
 * @param {string} path - Path such as "/level/1".
 */
export function navigate(path) {
  if (currentPath() === path) {
    showCurrentRoute();
  } else {
    window.location.hash = `#${path}`;
  }
}

/**
 * Returns the current path from the location hash.
 * @returns {string} Path, "/" by default.
 */
export function currentPath() {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

/**
 * Renders the screen of the current path, applying route guards.
 */
function showCurrentRoute() {
  const path = currentPath();
  const route = routes.find((candidate) => candidate.pattern.test(path));
  if (!route) {
    navigate('/');
    return;
  }
  const params = path.match(route.pattern).slice(1);
  const redirect = route.guard ? route.guard(params) : null;
  if (redirect) {
    window.location.replace(`#${redirect}`);
    return;
  }
  renderScreen(route, params);
}

/**
 * Replaces the current screen by a new one.
 * @param {object} route - Route to render.
 * @param {Array<string>} params - Route parameters.
 */
function renderScreen(route, params) {
  if (currentCleanup) {
    currentCleanup();
  }
  screenContainer.replaceChildren();
  screenContainer.scrollTop = 0;
  currentCleanup = route.render(screenContainer, params) || null;
  document.dispatchEvent(new CustomEvent('screenchange', { detail: { path: currentPath() } }));
}

/**
 * Starts the router.
 * @param {HTMLElement} container - Element that holds the screens.
 */
export function startRouter(container) {
  screenContainer = container;
  window.addEventListener('hashchange', showCurrentRoute);
  showCurrentRoute();
}
