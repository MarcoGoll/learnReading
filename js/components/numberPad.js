import { el, button } from './dom.js';
import { playSound } from '../audio/soundPlayer.js';

/** Maximum digits of an answer. */
const MAX_DIGITS = 3;

/**
 * Creates one digit key of the pad.
 * @param {number} digit - Digit 0-9.
 * @param {Function} onPress - Called with the digit.
 * @returns {HTMLButtonElement} Key.
 */
function digitKey(digit, onPress) {
  return el('button', {
    className: 'number-pad__key',
    text: String(digit),
    attrs: { type: 'button' },
    on: { click: () => onPress(digit) }
  });
}

/**
 * Builds the pad markup: display and the 12 keys (1-9, delete, 0, OK).
 * @param {HTMLElement} display - Display element.
 * @param {{press: Function, remove: Function, submit: Function}} actions - Pad actions.
 * @returns {HTMLElement} Pad element.
 */
function padElement(display, { press, remove, submit }) {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => digitKey(digit, press));
  return el('div', { className: 'number-pad' }, [
    display,
    el('div', { className: 'number-pad__keys' }, [
      ...keys,
      button({ className: 'number-pad__key number-pad__key--delete', iconName: 'backspace', title: 'Löschen', onClick: remove }),
      digitKey(0, press),
      button({ className: 'number-pad__key number-pad__key--ok', iconName: 'check', title: 'Fertig', onClick: submit })
    ])
  ]);
}

/**
 * Creates the pad actions working on the typed text.
 * @param {object} pad - Pad state with text and isDisabled.
 * @param {Function} render - Updates the display.
 * @param {Function} onSubmit - Called with the entered number.
 * @returns {{press: Function, remove: Function, submit: Function}} Actions.
 */
function padActions(pad, render, onSubmit) {
  return {
    press: (digit) => {
      if (pad.isDisabled || pad.text.length >= MAX_DIGITS) return;
      pad.text = pad.text === '0' ? String(digit) : pad.text + digit;
      playSound('click');
      render();
    },
    remove: () => { if (!pad.isDisabled) { pad.text = pad.text.slice(0, -1); render(); } },
    submit: () => { if (!pad.isDisabled && pad.text) onSubmit(Number(pad.text)); }
  };
}

/**
 * Creates the large number pad (0-9, delete, OK). Digits, Backspace, and Enter also work on a keyboard.
 * @param {object} options - Options.
 * @param {Function} options.onSubmit - Called with the entered number.
 * @returns {{element: HTMLElement, clear: Function, setDisabled: Function, value: Function, destroy: Function}} Pad API.
 */
export function createNumberPad({ onSubmit }) {
  const pad = { text: '', isDisabled: false };
  const display = el('div', { className: 'number-pad__display', attrs: { 'aria-live': 'polite' } });
  const render = () => {
    display.textContent = pad.text || '?';
    display.classList.toggle('number-pad__display--empty', !pad.text);
  };
  const actions = padActions(pad, render, onSubmit);
  const element = padElement(display, actions);
  const onKey = (event) => handleKey(event, actions);
  document.addEventListener('keydown', onKey);
  render();
  return {
    element,
    clear: () => { pad.text = ''; render(); },
    setDisabled: (isDisabled) => { pad.isDisabled = isDisabled; element.classList.toggle('number-pad--disabled', isDisabled); },
    value: () => pad.text,
    destroy: () => document.removeEventListener('keydown', onKey)
  };
}

/**
 * Maps hardware keys to pad actions.
 * @param {KeyboardEvent} event - Key event.
 * @param {{press: Function, remove: Function, submit: Function}} actions - Pad actions.
 */
function handleKey(event, { press, remove, submit }) {
  if (/^[0-9]$/.test(event.key)) {
    press(Number(event.key));
  } else if (event.key === 'Backspace') {
    remove();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    submit();
  }
}
