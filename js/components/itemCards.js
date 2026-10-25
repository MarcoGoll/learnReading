import { el } from './dom.js';
import { splitIntoLetters, letterById } from '../data/letters.js';
import { wordById, displaySyllables } from '../data/words.js';
import { SIGHT_WORDS, endMark } from '../data/sentences.js';

/**
 * Creates the card content for a letter pair such as "M m".
 * @param {object} letter - Letter item.
 * @returns {HTMLElement} Card content.
 */
export function letterCard(letter) {
  return el('div', { className: 'item-card item-card--letter', text: letter.display });
}

/**
 * Creates the card content for a syllable with differently colored vowel and consonant parts.
 * @param {object} syllable - Syllable item.
 * @returns {HTMLElement} Card content.
 */
export function syllableCard(syllable) {
  const parts = splitIntoLetters(syllable.id).map((letterId) => {
    const isVowel = letterById(letterId).type === 'vowel';
    return el('span', { className: `item-card__part item-card__part--${isVowel ? 'vowel' : 'consonant'}`, text: letterId });
  });
  return el('div', { className: 'item-card item-card--syllable' }, parts);
}

/**
 * Creates spans for the syllables of a word with alternating colors.
 * @param {object} word - Word entry.
 * @param {string} [displayText] - Text to show instead of word.display (same letters, other case).
 * @returns {Array<HTMLElement>} Syllable spans.
 */
export function syllableSpans(word, displayText) {
  const source = displayText ? { ...word, display: displayText } : word;
  return displaySyllables(source).map((part, index) => el('span', {
    className: `item-card__syllable item-card__syllable--${index % 2 === 0 ? 'odd' : 'even'}`,
    text: part
  }));
}

/**
 * Creates the card content for a word with colored syllables.
 * @param {object} word - Word entry.
 * @returns {HTMLElement} Card content.
 */
export function wordCard(word) {
  return el('div', { className: 'item-card item-card--word' }, syllableSpans(word));
}

/**
 * Creates one token of a sentence: a learned word with colored syllables or a marked sight word.
 * @param {string} token - Lowercase token.
 * @param {string} displayText - Token as written in the sentence.
 * @returns {HTMLElement} Token element.
 */
export function sentenceToken(token, displayText) {
  const word = wordById(token);
  if (word && !SIGHT_WORDS.includes(token)) {
    return el('span', { className: 'sentence-card__token' }, syllableSpans(word, displayText));
  }
  return el('span', { className: 'sentence-card__token sentence-card__token--sight', text: displayText });
}

/**
 * Returns the words of a sentence text without punctuation, keeping their case.
 * @param {object} sentence - Sentence entry.
 * @returns {Array<string>} Display words.
 */
export function sentenceDisplayWords(sentence) {
  return sentence.text.replace(/[.?!,]/g, '').split(' ');
}

/**
 * Creates the card content for a sentence.
 * @param {object} sentence - Sentence entry.
 * @returns {HTMLElement} Card content.
 */
export function sentenceCard(sentence) {
  const displayWords = sentenceDisplayWords(sentence);
  const tokens = sentence.tokens.map((token, index) => sentenceToken(token, displayWords[index]));
  return el('div', { className: 'item-card item-card--sentence sentence-card' }, [
    ...tokens, el('span', { className: 'sentence-card__mark', text: endMark(sentence) })
  ]);
}
