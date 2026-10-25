import { playStoryRound } from '../../game/storyRunner.js';

/** Level 5 variant of the story journey: read a story and answer its question. */
export const storyVariant = {
  id: 'story',
  title: 'Geschichte',
  picture: 'buch',
  unavailableHint: 'Nur beim Flugsaurier.',

  /**
   * The story variant is always available where the profile lists it.
   * @returns {boolean} True.
   */
  isAvailable() {
    return true;
  },

  /**
   * Runs one story round (2 stories).
   * @param {HTMLElement} container - Screen container.
   * @param {object} material - Word material (unused).
   * @param {Function} finish - Called with (correctCount, taskCount, session).
   * @returns {Function} Cleanup function.
   */
  run(container, material, finish) {
    const screen = { cleanup: null };
    playStoryRound(container, screen, 5).then(({ combined }) => finish(combined.correctCount(), combined.taskCount(), combined));
    return () => { if (screen.cleanup) screen.cleanup(); };
  }
};
