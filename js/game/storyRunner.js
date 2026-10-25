import { el, button, wait } from '../components/dom.js';
import { sentenceCard } from '../components/itemCards.js';
import { bounce, wiggle, burstStars, flyPoints } from '../components/effects.js';
import { STORIES } from '../data/stories.js';
import { wordById } from '../data/allWords.js';
import { preferThenFill } from '../logic/random.js';
import { createRoundSession } from '../logic/roundSession.js';
import { itemKey } from '../logic/history.js';
import { activeJourney } from '../state/journeyState.js';
import { store } from '../state/store.js';
import { playSound } from '../audio/soundPlayer.js';
import { createLevelLayout } from './levelLayout.js';
import { runReadingRound } from './readingRoundRunner.js';
import { endLevelRound } from './levelFlow.js';

/** Stories per round. */
const STORIES_PER_ROUND = 2;

/** Points for a correctly answered question. */
const QUESTION_POINTS = 50;

/**
 * Creates a combined session that adds up several round sessions.
 * @returns {object} Combined session with add, roundScore, stats, correctCount, taskCount.
 */
function createCombinedSession() {
  const sessions = [];
  const sum = (key) => sessions.reduce((total, session) => total + session.stats()[key], 0);
  return {
    add: (session) => sessions.push(session),
    roundScore: () => sessions.reduce((total, session) => total + session.roundScore(), 0),
    correctCount: () => sum('correctCount'),
    taskCount: () => sum('taskCount'),
    stats: () => ({ correctCount: sum('correctCount'), taskCount: sum('taskCount'), notYetCount: sum('notYetCount') })
  };
}

/**
 * Picks the stories of a round: stories not yet completed first.
 * @param {Array<string>} completedIds - Completed story ids.
 * @returns {Array<object>} Stories.
 */
function pickStories(completedIds) {
  const open = STORIES.filter((story) => !completedIds.includes(story.id));
  const done = STORIES.filter((story) => completedIds.includes(story.id));
  return preferThenFill(open, done, STORIES_PER_ROUND);
}

/**
 * Creates the illustration of a story from word pictures.
 * @param {object} story - Story.
 * @returns {HTMLElement} Picture row.
 */
function storyPictures(story) {
  return el('div', { className: 'story__pictures' }, story.pictures.map((id) => {
    const word = wordById(id);
    return el('img', { className: 'story__picture', attrs: { src: `assets/svg/pictures/${word ? word.picture : id}.svg`, alt: '' } });
  }));
}

/**
 * Shows the whole story and its picture question; resolves with whether the answer was correct.
 * @param {HTMLElement} container - Screen container.
 * @param {object} story - Story.
 * @param {object} options - level (3 or 5) and the combined session.
 * @returns {Promise<boolean>} True if answered correctly.
 */
function askQuestion(container, story, { level, combined }) {
  const layout = createLevelLayout(container, { title: story.title, recordLevel: level, goalLevel: level });
  const session = createRoundSession({ level, updateState: store.updateState });
  combined.add(session);
  return new Promise((resolve) => {
    const question = { story, layout, session, combined, options: el('div', { className: 'picture-choice' }), isAnswered: false, resolve };
    story.question.options.forEach((optionId) => question.options.append(optionButton(question, optionId)));
    layout.stage.replaceChildren(el('div', { className: 'choice-task story card' }, [
      storyPictures(story),
      el('div', { className: 'story__text' }, story.sentences.map((sentence) => sentenceCard(sentence))),
      el('p', { className: 'story__question', text: story.question.text }),
      question.options
    ]));
  });
}

/**
 * Creates one picture option of a story question.
 * @param {object} question - Question context (story, layout, session, combined, options, resolve).
 * @param {string} optionId - Word id of the option.
 * @returns {HTMLButtonElement} Option button.
 */
function optionButton(question, optionId) {
  const optionElement = el('button', { className: 'picture-choice__option', attrs: { type: 'button' } }, [
    el('img', { className: 'picture-choice__image', attrs: { src: `assets/svg/pictures/${wordById(optionId).picture}.svg`, alt: '' } })
  ]);
  optionElement.addEventListener('click', async () => {
    if (question.isAnswered) return;
    question.isAnswered = true;
    const isCorrect = optionId === question.story.question.answer;
    const result = question.session.record(itemKey('story', question.story.id), isCorrect ? 'correct' : 'wrong', { base: QUESTION_POINTS });
    question.layout.scoreBoard.update(question.combined.roundScore(), question.session.streak());
    question.layout.companion.react(isCorrect ? 'correct' : 'wrong');
    showAnswerFeedback(optionElement, question.options, question.story, isCorrect, question.layout, result);
    await wait(isCorrect ? 1200 : 1800);
    question.resolve(isCorrect);
  });
  return optionElement;
}

/**
 * Plays the feedback of an answer and highlights the correct picture.
 * @param {HTMLElement} chosen - Chosen option.
 * @param {HTMLElement} options - Option list.
 * @param {object} story - Story.
 * @param {boolean} isCorrect - Whether the answer was correct.
 * @param {object} layout - Level layout.
 * @param {{points: number}} result - Recorded result.
 */
function showAnswerFeedback(chosen, options, story, isCorrect, layout, result) {
  const correctIndex = story.question.options.indexOf(story.question.answer);
  options.children[correctIndex].classList.add('choice-task__option--correct');
  if (isCorrect) {
    playSound('correct');
    bounce(chosen);
    burstStars(chosen);
    flyPoints(chosen, layout.scoreBoard.scoreElement, result.points);
  } else {
    playSound('wrong');
    chosen.classList.add('choice-task__option--wrong');
    wiggle(chosen);
  }
}

/**
 * Reads one story sentence by sentence (judged by the adult) and then asks its question.
 * @param {HTMLElement} container - Screen container.
 * @param {object} story - Story.
 * @param {object} options - level, combined session, and screen (cleanup holder).
 * @returns {Promise<boolean>} True if the question was answered correctly.
 */
function playStory(container, story, options) {
  return new Promise((resolve) => {
    options.screen.cleanup = runReadingRound(container, {
      title: story.title,
      recordLevel: options.level,
      level: options.level,
      goalLevel: options.level,
      items: story.sentences,
      renderItem: (sentence) => el('div', { className: 'story__reading' }, [storyPictures(story), sentenceCard(sentence)]),
      historyKey: (sentence) => itemKey('sentence', sentence.id),
      speakText: (sentence) => sentence.text,
      onFinished: (results, session) => {
        options.combined.add(session);
        askQuestion(container, story, options).then(resolve);
      }
    });
  });
}

/**
 * Plays a round of stories and reports the completed story ids and the combined session.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 * @param {number} level - 3 (story level) or 5 (story adventure).
 * @returns {Promise<{completedIds: Array<string>, combined: object}>} Round result.
 */
export async function playStoryRound(container, screen, level) {
  const combined = createCombinedSession();
  const completedIds = [];
  const stories = pickStories(activeJourney(store.getState()).mastered[3]);
  for (const story of stories) {
    const isCorrect = await playStory(container, story, { level, combined, screen });
    if (isCorrect) completedIds.push(story.id);
  }
  return { completedIds, combined };
}

/**
 * Runs level 3 of the story journey: stories with questions; completed stories count for the goal.
 * The cleanup of the running reading round is kept in screen.cleanup.
 * @param {HTMLElement} container - Screen container.
 * @param {object} screen - Screen context holding the current cleanup.
 */
export function runStoryLevel(container, screen) {
  playStoryRound(container, screen, 3).then(({ completedIds, combined }) => {
    endLevelRound(container, { level: 3, correctIds: completedIds, session: combined, onReplay: () => runStoryLevel(container, screen) });
  });
}
