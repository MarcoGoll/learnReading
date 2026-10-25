import { el, button } from '../components/dom.js';
import { speak, hasGermanVoice } from '../audio/speech.js';

/** Time the adult reveal stays visible. */
const REVEAL_MS = 3000;

/**
 * Creates the target area of a task: optional picture, a speaker button that speaks the target,
 * and (without a German voice) a "show" button for the adult that briefly reveals the target.
 * @param {object} options - Options.
 * @param {string} options.text - Target text to speak / reveal.
 * @param {string} [options.picture] - Picture id under assets/svg/pictures.
 * @param {Array<string>} [options.pictures] - Several picture ids shown side by side (e.g. parts of a compound word).
 * @param {string} options.revealLabel - Label of the adult reveal button.
 * @returns {{element: HTMLElement, speakNow: Function}} Target API.
 */
export function createSpokenTarget({ text, picture, pictures, revealLabel }) {
  const pictureIds = pictures || (picture ? [picture] : []);
  const revealText = el('p', { className: 'adult-reveal', attrs: { 'aria-live': 'polite' } });
  const speakerButton = button({ className: 'big-button big-button--secondary spoken-target__speaker', iconName: 'volume_up', label: 'Anhören', onClick: () => speak(text) });
  const revealButton = button({
    className: 'small-button spoken-target__reveal',
    iconName: 'visibility',
    label: revealLabel,
    onClick: () => {
      revealText.textContent = text;
      setTimeout(() => { revealText.textContent = ''; }, REVEAL_MS);
    }
  });
  revealButton.hidden = true;
  hasGermanVoice().then((isAvailable) => {
    speakerButton.hidden = !isAvailable;
    revealButton.hidden = isAvailable;
  });
  const element = el('div', { className: 'spoken-target' }, [
    pictureIds.length > 0 ? el('div', { className: 'spoken-target__pictures' }, pictureIds.map((id) => el('img', { className: 'spoken-target__picture', attrs: { src: `assets/svg/pictures/${id}.svg`, alt: '' } }))) : null,
    el('div', { className: 'spoken-target__buttons' }, [speakerButton, revealButton]),
    revealText
  ]);
  return { element, speakNow: () => speak(text) };
}
