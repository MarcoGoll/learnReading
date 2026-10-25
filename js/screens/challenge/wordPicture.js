import { el } from '../../components/dom.js';
import { wordCard } from '../../components/itemCards.js';
import { WORDS } from '../../data/words.js';
import { buildTask, buildRound, MIN_PICTURE_TARGETS } from '../../logic/wordPicture.js';
import { itemKey } from '../../logic/history.js';
import { runChoiceTasks } from '../../game/choiceTaskRunner.js';

/** Level 5 variant: read a word and pick the matching picture. */
export const wordPictureVariant = {
  id: 'wordPicture',
  title: 'Wort und Bild',
  picture: 'kamera',
  unavailableHint: 'Lerne erst noch mehr Wörter mit Bildern!',

  /**
   * Checks whether enough learned nouns with pictures exist.
   * @param {object} material - Word material.
   * @returns {boolean} True with at least 3 picture targets.
   */
  isAvailable(material) {
    return material.pictureTargets.length >= MIN_PICTURE_TARGETS;
  },

  /**
   * Runs one round of the variant.
   * @param {HTMLElement} container - Screen container.
   * @param {object} material - Word material.
   * @param {Function} finish - Called with (correctCount, taskCount, session).
   * @returns {Function} Cleanup function.
   */
  run(container, material, finish) {
    const allPictured = WORDS.filter((word) => word.picture);
    return runChoiceTasks(container, {
      title: 'Wort und Bild',
      tasks: buildRound(material.pictureTargets, 6).map((target) => buildTask(target, allPictured)),
      renderPrompt: (task) => ({ element: el('div', { className: 'choice-task__prompt' }, [wordCard(task.word)]) }),
      optionsOf: (task) => task.options,
      renderOption: (word) => el('img', { className: 'picture-choice__image', attrs: { src: `assets/svg/pictures/${word.picture}.svg`, alt: '' } }),
      isCorrect: (task, word) => word.id === task.word.id,
      historyKey: (task) => itemKey('word', task.word.id),
      optionsClass: 'picture-choice',
      onFinished: finish
    });
  }
};
