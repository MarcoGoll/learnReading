import { el, button, icon } from './dom.js';
import { store } from '../state/store.js';
import { navigate, currentPath } from '../router.js';
import { openParentGate } from '../game/parentGate.js';
import { setMusicEnabled, setSoundsEnabled, playSound } from '../audio/soundPlayer.js';

/**
 * Applies the stored sound settings to the sound player.
 * @param {object} settings - Settings from the state.
 */
function applySoundSettings(settings) {
  setSoundsEnabled(settings.soundsEnabled);
  setMusicEnabled(settings.musicEnabled);
}

/**
 * Updates icons and labels of the toggle buttons.
 * @param {object} buttons - Toggle buttons.
 * @param {object} settings - Current settings.
 */
function updateToggles(buttons, settings) {
  buttons.music.replaceChildren(icon(settings.musicEnabled && settings.soundsEnabled ? 'music_note' : 'music_off'));
  buttons.music.setAttribute('aria-label', settings.musicEnabled ? 'Musik aus' : 'Musik an');
  buttons.music.setAttribute('aria-pressed', String(settings.musicEnabled));
  buttons.sound.replaceChildren(icon(settings.soundsEnabled ? 'volume_up' : 'volume_off'));
  buttons.sound.setAttribute('aria-label', settings.soundsEnabled ? 'Ton aus' : 'Ton an');
  buttons.sound.setAttribute('aria-pressed', String(settings.soundsEnabled));
}

/**
 * Toggles a boolean setting.
 * @param {string} key - Setting name.
 */
function toggleSetting(key) {
  store.updateState((state) => { state.settings[key] = !state.settings[key]; });
}

/**
 * Opens the parent area after the parent gate was passed.
 */
async function openParentArea() {
  if (await openParentGate()) {
    navigate('/parents');
  }
}

/**
 * Renders the top bar with home button, title, sound toggles, and the parent gear.
 * @param {HTMLElement} container - Top bar element.
 */
export function renderTopBar(container) {
  const homeButton = button({ className: 'top-bar__button top-bar__button--home', iconName: 'home', title: 'Startseite', onClick: () => { playSound('click'); navigate('/'); } });
  const buttons = {
    music: button({ className: 'top-bar__button', iconName: 'music_note', title: 'Musik', onClick: () => toggleSetting('musicEnabled') }),
    sound: button({ className: 'top-bar__button', iconName: 'volume_up', title: 'Ton', onClick: () => toggleSetting('soundsEnabled') })
  };
  const gear = button({ className: 'top-bar__button', iconName: 'settings', title: 'Elternbereich', onClick: openParentArea });
  container.className = 'top-bar';
  container.append(
    homeButton,
    el('div', { className: 'top-bar__title', text: 'Lesedino' }),
    el('div', { className: 'top-bar__actions' }, [buttons.music, buttons.sound, gear])
  );
  const refresh = (state) => { updateToggles(buttons, state.settings); applySoundSettings(state.settings); };
  refresh(store.getState());
  store.subscribe(refresh);
  document.addEventListener('screenchange', () => { homeButton.hidden = currentPath() === '/'; });
}
