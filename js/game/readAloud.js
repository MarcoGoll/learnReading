import { store } from '../state/store.js';
import { speak, hasGermanVoice } from '../audio/speech.js';
import { button, wait } from '../components/dom.js';

/** Delay before speaking, so the "wrong" sound can finish. */
const WRONG_SOUND_DELAY_MS = 600;

/**
 * Speaks the correct reading after a wrong judgement, if enabled in the settings.
 * @param {string|null} text - Text to speak; null for items without read-aloud help (letters).
 * @returns {Promise<void>} Resolves when speaking ended.
 */
export async function readAloudAfterWrong(text) {
  const settings = store.getState().settings;
  if (!text || !settings.readAloudAfterWrong || !settings.soundsEnabled) {
    return;
  }
  await wait(WRONG_SOUND_DELAY_MS);
  await speak(text);
}

/**
 * Creates the small speaker button for the adult; it stays hidden without a German voice.
 * @param {Function} getText - Returns the text of the current item (or null).
 * @returns {HTMLButtonElement} Button.
 */
export function createReadAloudButton(getText) {
  const speakerButton = button({
    className: 'read-aloud-button',
    iconName: 'record_voice_over',
    title: 'Vorlesen (für Erwachsene)',
    onClick: () => {
      const text = getText();
      if (text) speak(text);
    }
  });
  speakerButton.hidden = true;
  hasGermanVoice().then((isAvailable) => { speakerButton.hidden = !isAvailable; });
  return speakerButton;
}
