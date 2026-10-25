import { sentenceCard } from '../../components/itemCards.js';
import { buildRound } from '../../logic/sentences.js';
import { itemKey } from '../../logic/history.js';
import { runReadingRound } from '../../game/readingRoundRunner.js';

/** Level 5 variant: reading short sentences aloud, judged by the adult. */
export const sentenceReadingVariant = {
  id: 'sentenceReading',
  title: 'Sätze lesen',
  picture: 'schule',
  unavailableHint: 'Lerne erst noch mehr Wörter in Level 3!',

  /**
   * Checks whether enough sentences are available.
   * @param {object} material - Word material.
   * @returns {boolean} True with at least 5 sentences.
   */
  isAvailable(material) {
    return material.sentences.length >= 5;
  },

  /**
   * Runs one round of the variant.
   * @param {HTMLElement} container - Screen container.
   * @param {object} material - Word material.
   * @param {Function} finish - Called with (correctCount, taskCount, session).
   * @returns {Function} Cleanup function.
   */
  run(container, material, finish) {
    return runReadingRound(container, {
      title: 'Sätze lesen',
      recordLevel: 5,
      level: 5,
      goalLevel: 5,
      items: buildRound(material.sentences, 5),
      renderItem: sentenceCard,
      historyKey: (sentence) => itemKey('sentence', sentence.id),
      speakText: (sentence) => sentence.text,
      onFinished: (results, session) => finish(session.correctCount(), session.taskCount(), session)
    });
  }
};
