import { el } from '../../components/dom.js';
import { wordCard, sentenceToken, sentenceDisplayWords, syllableSpans } from '../../components/itemCards.js';
import { endMark } from '../../data/sentences.js';
import { buildRound } from '../../logic/gapSentence.js';
import { itemKey } from '../../logic/history.js';
import { speak } from '../../audio/speech.js';
import { runChoiceTasks } from '../../game/choiceTaskRunner.js';

/**
 * Creates the sentence prompt with a gap box at the gap position.
 * @param {object} task - Gap task.
 * @returns {{element: HTMLElement, gap: HTMLElement}} Prompt and gap element.
 */
function gapPrompt(task) {
  const displayWords = sentenceDisplayWords(task.sentence);
  const gap = el('span', { className: 'gap-sentence__gap' });
  const tokens = task.sentence.tokens.map((token, index) => (index === task.gapIndex ? gap : sentenceToken(token, displayWords[index])));
  const element = el('div', { className: 'item-card item-card--sentence sentence-card gap-sentence' }, [
    ...tokens, el('span', { className: 'sentence-card__mark', text: endMark(task.sentence) })
  ]);
  return { element, gap };
}

/** Level 5 variant: pick the missing word of a sentence. */
export const gapSentenceVariant = {
  id: 'gapSentence',
  title: 'Lückensatz',
  picture: 'schere',
  unavailableHint: 'Lerne erst noch mehr Wörter in Level 3!',

  /**
   * Checks whether enough sentences are available.
   * @param {object} material - Word material.
   * @returns {boolean} True with at least 3 sentences.
   */
  isAvailable(material) {
    return material.sentences.length >= 3;
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
      title: 'Lückensatz',
      tasks: buildRound(material.sentences, material.words, material.fallbackWords, 6),
      renderPrompt: (task) => gapPrompt(task),
      optionsOf: (task) => task.options,
      renderOption: (word) => wordCard(word),
      isCorrect: (task, word) => word.id === task.answer.id,
      historyKey: (task) => itemKey('word', task.answer.id),
      afterAnswer: async (task, prompt) => {
        const displayWords = sentenceDisplayWords(task.sentence);
        prompt.gap.replaceChildren(...syllableSpans(task.answer, displayWords[task.gapIndex]));
        prompt.gap.classList.add('gap-sentence__gap--filled');
        await speak(task.sentence.text);
      },
      optionsClass: 'word-choice',
      onFinished: finish
    });
  }
};
