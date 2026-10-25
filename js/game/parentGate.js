import { el } from '../components/dom.js';
import { openDialog } from '../components/dialog.js';

/** sessionStorage key marking the parent area as unlocked for this session. */
const SESSION_KEY = 'learnReading.parentUnlocked';

let unlockedInMemory = false;

/**
 * Checks whether the parent gate was passed in this session.
 * @returns {boolean} True if unlocked.
 */
export function isParentUnlocked() {
  try {
    return unlockedInMemory || window.sessionStorage.getItem(SESSION_KEY) === 'yes';
  } catch (error) {
    return unlockedInMemory;
  }
}

/**
 * Marks the parent area as unlocked for this session.
 */
function markUnlocked() {
  unlockedInMemory = true;
  try {
    window.sessionStorage.setItem(SESSION_KEY, 'yes');
  } catch (error) {
    // The in-memory flag is enough when sessionStorage is unavailable.
  }
}

/**
 * Returns a random integer between 5 and 9.
 * @returns {number} Number.
 */
function randomOperand() {
  return 5 + Math.floor(Math.random() * 5);
}

/**
 * Shows the parent gate (simple addition). Resolves true when solved.
 * @returns {Promise<boolean>} True if the correct answer was entered.
 */
export function openParentGate() {
  if (isParentUnlocked()) {
    return Promise.resolve(true);
  }
  const first = randomOperand();
  const second = randomOperand();
  return new Promise((resolve) => {
    const input = el('input', { className: 'dialog__input dialog__input--number', attrs: { type: 'text', inputmode: 'numeric', maxlength: '2', 'aria-label': 'Ergebnis' } });
    let close = null;
    const submit = (event) => {
      event.preventDefault();
      const isCorrect = Number(input.value) === first + second;
      close();
      if (isCorrect) markUnlocked();
      resolve(isCorrect);
    };
    close = openDialog([el('form', { className: 'dialog__form', on: { submit } }, [
      el('p', { className: 'dialog__text', text: 'Elternbereich: Bitte rechne' }),
      el('p', { className: 'dialog__task', text: `${first} + ${second} = ?` }),
      input,
      el('div', { className: 'dialog__actions' }, [el('button', { className: 'big-button', text: 'Weiter', attrs: { type: 'submit' } })])
    ])], () => resolve(false));
  });
}
