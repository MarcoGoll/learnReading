import { wordCard } from '../../components/itemCards.js';
import { buildTask, buildRound } from '../../logic/findTheWord.js';
import { itemKey } from '../../logic/history.js';
import { runChoiceTasks } from '../../game/choiceTaskRunner.js';
import { createSpokenTarget } from '../../game/spokenTarget.js';

/** Level 5 variant: a word is spoken; the child taps it among four words. */
export const findTheWordVariant = {
  id: 'findTheWord',
  title: 'Wort finden',
  picture: 'lupe',
  unavailableHint: 'Lerne erst noch mehr Wörter in Level 3!',

  /**
   * Checks whether enough words are available.
   * @param {object} material - Word material.
   * @returns {boolean} True with at least 4 words.
   */
  isAvailable(material) {
    return material.words.length >= 4;
  },

  /**
   * Runs one round of the variant.
   * @param {HTMLElement} container - Screen container.
   * @param {object} material - Word material.
   * @param {Function} finish - Called with (correctCount, taskCount, session).
   * @returns {Function} Cleanup function.
   */
  run(container, material, finish) {
    return runChoiceTasks(container, {
      title: 'Wort finden',
      tasks: buildRound(material.words, 6).map((target) => buildTask(target, material.words, material.fallbackWords)),
      renderPrompt: (task) => {
        const target = createSpokenTarget({ text: task.target.display, revealLabel: 'Wort zeigen' });
        return { element: target.element, onShow: target.speakNow };
      },
      optionsOf: (task) => task.options,
      renderOption: (word) => wordCard(word),
      isCorrect: (task, word) => word.id === task.target.id,
      historyKey: (task) => itemKey('word', task.target.id),
      optionsClass: 'word-choice',
      onFinished: finish
    });
  }
};
