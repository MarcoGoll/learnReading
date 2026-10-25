/** Sound files per event; several files mean random variations. */
const SOUND_FILES = {
  correct: ['correct'],
  wrong: ['wrong'],
  levelComplete: ['level-complete'],
  newRecord: ['new-record'],
  reward: ['reward'],
  evolution1: ['evolution-1'],
  evolution2: ['evolution-2'],
  evolution3: ['evolution-3'],
  evolution4: ['evolution-4'],
  evolution5: ['evolution-5'],
  whoosh: ['whoosh'],
  dragPickup: ['drag-pickup'],
  dragDrop: ['drag-drop'],
  dragSnap: ['drag-snap'],
  click: ['click']
};

/** Playback volume of the effects (files are normalized to a -6 dB peak). */
const EFFECT_VOLUME = 0.8;

/** Playback volume of the background music. */
const MUSIC_VOLUME = 0.35;

const preloaded = {};
let music = null;
let soundsEnabled = true;
let musicEnabled = true;
let interactionHappened = false;

/**
 * Builds the URL of a sound file.
 * @param {string} name - File name without extension.
 * @returns {string} URL.
 */
function soundUrl(name) {
  return `assets/sounds/${name}.mp3`;
}

/**
 * Preloads all effect sounds and prepares the music loop.
 */
export function initSounds() {
  Object.values(SOUND_FILES).flat().forEach((name) => {
    const audio = new Audio(soundUrl(name));
    audio.preload = 'auto';
    preloaded[name] = audio;
  });
  music = new Audio(soundUrl('music'));
  music.loop = true;
  music.volume = MUSIC_VOLUME;
  document.addEventListener('pointerdown', onFirstInteraction, { once: true });
  document.addEventListener('keydown', onFirstInteraction, { once: true });
}

/**
 * Starts the music after the first user interaction (browsers block autoplay before).
 */
function onFirstInteraction() {
  interactionHappened = true;
  updateMusic();
}

/**
 * Plays a sound event (random variation). Does nothing when sounds are muted.
 * @param {string} eventName - Event name, e.g. "correct".
 */
export function playSound(eventName) {
  const names = SOUND_FILES[eventName];
  if (!soundsEnabled || !names) {
    return;
  }
  const name = names[Math.floor(Math.random() * names.length)];
  const audio = preloaded[name] ? preloaded[name].cloneNode() : new Audio(soundUrl(name));
  audio.volume = EFFECT_VOLUME;
  audio.play().catch(() => {});
}

/**
 * Starts or pauses the music depending on the settings.
 */
function updateMusic() {
  if (!music) {
    return;
  }
  if (soundsEnabled && musicEnabled && interactionHappened) {
    music.play().catch(() => {});
  } else {
    music.pause();
  }
}

/**
 * Enables or disables the background music.
 * @param {boolean} isEnabled - New setting.
 */
export function setMusicEnabled(isEnabled) {
  musicEnabled = isEnabled;
  updateMusic();
}

/**
 * Enables or disables all sounds (also stops the music when disabled).
 * @param {boolean} isEnabled - New setting.
 */
export function setSoundsEnabled(isEnabled) {
  soundsEnabled = isEnabled;
  updateMusic();
}

/**
 * Returns whether sounds are enabled.
 * @returns {boolean} Current setting.
 */
export function areSoundsEnabled() {
  return soundsEnabled;
}
