import { el, button } from './dom.js';

/**
 * Opens a modal dialog and returns a function that closes it.
 * @param {Array<Node>} children - Dialog content.
 * @param {Function} [onClose] - Called when the dialog is closed by the backdrop.
 * @returns {Function} Close function.
 */
export function openDialog(children, onClose) {
  const panel = el('div', { className: 'dialog__panel card', attrs: { role: 'dialog', 'aria-modal': 'true' } }, children);
  const backdrop = el('div', { className: 'dialog' }, [panel]);
  const close = () => backdrop.remove();
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      close();
      if (onClose) onClose();
    }
  });
  document.getElementById('overlay-root').append(backdrop);
  const focusTarget = panel.querySelector('input, button');
  if (focusTarget) focusTarget.focus();
  return close;
}

/**
 * Asks a yes/no question.
 * @param {string} question - Question text.
 * @param {string} confirmLabel - Label of the confirm button.
 * @returns {Promise<boolean>} True if confirmed.
 */
export function confirmDialog(question, confirmLabel) {
  return new Promise((resolve) => {
    let close = null;
    const answer = (value) => { close(); resolve(value); };
    close = openDialog([
      el('p', { className: 'dialog__text', text: question }),
      el('div', { className: 'dialog__actions' }, [
        button({ className: 'big-button big-button--quiet', label: 'Abbrechen', onClick: () => answer(false) }),
        button({ className: 'big-button', label: confirmLabel, onClick: () => answer(true) })
      ])
    ], () => resolve(false));
  });
}

/**
 * Asks for a text input.
 * @param {object} options - Dialog options.
 * @param {string} options.question - Question text.
 * @param {string} [options.intro] - Optional introduction text shown above the question.
 * @param {string} [options.value] - Initial value.
 * @param {number} [options.maxLength] - Maximum length.
 * @param {string} options.confirmLabel - Label of the confirm button.
 * @param {boolean} [options.required] - Whether an empty value is rejected.
 * @returns {Promise<string|null>} Entered text or null when cancelled.
 */
export function promptDialog({ question, intro, value = '', maxLength = 20, confirmLabel, required = true }) {
  return new Promise((resolve) => {
    const input = el('input', { className: 'dialog__input', attrs: { type: 'text', maxlength: String(maxLength), 'aria-label': question } });
    input.value = value;
    let close = null;
    const submit = (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (required && !text) { input.focus(); return; }
      close();
      resolve(text);
    };
    const form = el('form', { className: 'dialog__form', on: { submit } }, [
      intro ? el('p', { className: 'dialog__intro', text: intro }) : null,
      el('label', { className: 'dialog__text', text: question }), input,
      el('div', { className: 'dialog__actions' }, [el('button', { className: 'big-button', text: confirmLabel, attrs: { type: 'submit' } })])
    ]);
    close = openDialog([form], () => resolve(null));
  });
}

/**
 * Shows a short message with one button.
 * @param {string} message - Message text.
 * @param {string} [buttonLabel='OK'] - Button label.
 * @param {string} [title] - Optional title above the message.
 * @returns {Promise<void>} Resolves when closed.
 */
export function messageDialog(message, buttonLabel = 'OK', title = '') {
  return new Promise((resolve) => {
    let close = null;
    close = openDialog([
      title ? el('h2', { className: 'dialog__title', text: title }) : null,
      el('p', { className: message.length > 80 ? 'dialog__intro' : 'dialog__text', text: message }),
      el('div', { className: 'dialog__actions' }, [button({ className: 'big-button', label: buttonLabel, onClick: () => { close(); resolve(); } })])
    ], resolve);
  });
}
