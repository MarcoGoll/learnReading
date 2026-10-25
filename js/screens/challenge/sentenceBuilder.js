import { sentenceCard, sentenceToken } from '../../components/itemCards.js';
import { wordById } from '../../data/allWords.js';
import { endMark } from '../../data/sentences.js';
import { ALL_SIGHT_WORDS } from '../../data/sightWords.js';
import { builderSentences, buildTask, checkAnswer } from '../../logic/sentenceBuilder.js';
import { buildRound } from '../../logic/sentences.js';
import { itemKey } from '../../logic/history.js';
import { LEVEL_FIVE_BASE } from '../../logic/challengeLevel.js';
import { runBuildTasks } from '../../game/buildTaskRunner.js';

/**
 * Returns how a token is written: nouns keep their capital letter; the first slot is capitalized.
 * @param {string} token - Lowercase token.
 * @param {boolean} isFirst - Whether the token sits in the first slot.
 * @returns {string} Display text.
 */
function tokenDisplay(token, isFirst) {
  const word = ALL_SIGHT_WORDS.includes(token) ? null : wordById(token);
  const text = word ? word.display : token;
  return isFirst ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** Level 5 variant: build a spoken sentence from shuffled word tiles. */
export const sentenceBuilderVariant = {
  id: 'sentenceBuilder',
  title: 'Satz bauen',
  picture: 'rakete',
  unavailableHint: 'Lerne erst noch mehr Wörter in Level 3!',

  /**
   * Checks whether enough sentences with 3-4 words are available.
   * @param {object} material - Word material.
   * @returns {boolean} True with at least 3 sentences.
   */
  isAvailable(material) {
    return builderSentences(material.sentences).length >= 3;
  },

  /**
   * Runs one round of the variant.
   * @param {HTMLElement} container - Screen container.
   * @param {object} material - Word material.
   * @param {Function} finish - Called with (correctCount, taskCount, session).
   * @returns {Function} Cleanup function.
   */
  run(container, material, finish) {
    return runBuildTasks(container, {
      title: 'Satz bauen',
      level: 5,
      goalLevel: 5,
      base: LEVEL_FIVE_BASE,
      tasks: buildRound(builderSentences(material.sentences), 5).map((sentence) => buildTask(sentence)),
      targetFor: (task) => ({ text: task.sentence.text, revealLabel: 'Satz zeigen' }),
      renderTile: (tile, slotIndex) => [sentenceToken(tile.token, tokenDisplay(tile.token, slotIndex === 0))],
      suffixFor: (task) => endMark(task.sentence),
      check: (task, placed) => checkAnswer(task, placed.map((tileId) => task.tiles.find((tile) => tile.tileId === tileId).token)),
      solutionFor: (task) => sentenceCard(task.sentence),
      historyKey: (task) => itemKey('sentence', task.sentence.id),
      onFinished: (results, session) => finish(session.correctCount(), session.taskCount(), session)
    });
  }
};
