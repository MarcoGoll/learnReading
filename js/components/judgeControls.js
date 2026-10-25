import { el, button } from './dom.js';

/** Time in which further actions are ignored after an action (prevents double taps). */
const LOCK_MS = 400;

/** Keyboard shortcuts mapped to callback names. */
const KEY_ACTIONS = {
  ArrowRight: 'onCorrect',
  Enter: 'onCorrect',
  ArrowLeft: 'onWrong',
  Backspace: 'onWrong',
  ' ': 'onSkip',
  n: 'onNotYet',
  z: 'onUndo'
};

/** Button definitions: callback name, CSS modifier, icon, and label. */
const BUTTONS = [
  ['onWrong', 'wrong', 'close', 'Falsch'],
  ['onCorrect', 'correct', 'check', 'Richtig'],
  ['onUndo', 'undo', 'undo', 'Zurück'],
  ['onSkip', 'skip', 'skip_next', 'Später'],
  ['onNotYet', 'not-yet', 'pending', 'Noch nicht']
];

/**
 * Returns the callback name for a keyboard event, or null.
 * @param {KeyboardEvent} event - Keyboard event.
 * @returns {string|null} Callback name.
 */
function actionForKey(event) {
  if (event.target.closest && event.target.closest('input, textarea')) {
    return null;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    return 'onUndo';
  }
  return event.ctrlKey || event.metaKey || event.altKey ? null : KEY_ACTIONS[event.key] || null;
}

/**
 * Judge controls: correct, wrong, skip, not yet, and undo, by button and keyboard.
 */
class JudgeControls {
  /**
   * Creates the controls and attaches them to a container.
   * @param {HTMLElement} containerElement - Target container.
   * @param {object} callbacks - onCorrect, onWrong, onSkip, onNotYet, onUndo, canUndo.
   */
  constructor(containerElement, callbacks) {
    this.callbacks = callbacks;
    this.isLocked = false;
    this.isEnabled = true;
    this.buttons = {};
    BUTTONS.forEach(([name, modifier, iconName, label]) => {
      this.buttons[name] = button({ className: `judge-controls__button judge-controls__button--${modifier}`, iconName, label, onClick: () => this.trigger(name) });
    });
    this.root = el('div', { className: 'judge-controls' }, [
      this.buttons.onWrong,
      el('div', { className: 'judge-controls__secondary' }, [this.buttons.onUndo, this.buttons.onSkip, this.buttons.onNotYet]),
      this.buttons.onCorrect
    ]);
    this.onKeyDown = (event) => this.handleKey(event);
    containerElement.append(this.root);
    document.addEventListener('keydown', this.onKeyDown);
    this.refresh();
  }

  /**
   * Triggers an action unless the controls are locked or disabled.
   * @param {string} name - Callback name.
   */
  trigger(name) {
    if (this.isLocked || !this.isEnabled || (name === 'onUndo' && !this.callbacks.canUndo())) {
      return;
    }
    this.isLocked = true;
    setTimeout(() => { this.isLocked = false; this.refresh(); }, LOCK_MS);
    this.callbacks[name]();
    this.refresh();
  }

  /**
   * Handles keyboard shortcuts.
   * @param {KeyboardEvent} event - Keyboard event.
   */
  handleKey(event) {
    const name = actionForKey(event);
    if (name) {
      event.preventDefault();
      this.trigger(name);
    }
  }

  /**
   * Updates the disabled state of the buttons.
   */
  refresh() {
    Object.entries(this.buttons).forEach(([name, element]) => {
      element.disabled = !this.isEnabled || (name === 'onUndo' && !this.callbacks.canUndo());
    });
  }

  /**
   * Enables or disables all buttons.
   * @param {boolean} value - New state.
   */
  setEnabled(value) {
    this.isEnabled = value;
    this.refresh();
  }

  /**
   * Removes the controls and the keyboard listener.
   */
  destroy() {
    document.removeEventListener('keydown', this.onKeyDown);
    this.root.remove();
  }
}

/**
 * Creates the judge controls (correct, wrong, skip, not yet, undo) and attaches them to a container.
 * @param {HTMLElement} containerElement - Target container.
 * @param {object} callbacks - onCorrect, onWrong, onSkip, onNotYet, onUndo, canUndo.
 * @returns {JudgeControls} Controls with destroy, setEnabled, and refresh.
 */
export function createJudgeControls(containerElement, callbacks) {
  return new JudgeControls(containerElement, callbacks);
}
