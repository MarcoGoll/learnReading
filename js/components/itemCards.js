import { el } from './dom.js';
import { splitIntoLetters, letterById } from '../data/letters.js';
import { wordById } from '../data/allWords.js';
import { displaySyllables } from '../data/wordParser.js';
import { endMark } from '../data/sentences.js';
import { ALL_SIGHT_WORDS } from '../data/sightWords.js';

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
    const type = letterById(letterId).type;
    const combination = type === 'combination' ? ' item-card__combination' : '';
    return el('span', { className: `item-card__part item-card__part--${type === 'vowel' ? 'vowel' : 'consonant'}${combination}`, text: letterId });
  });
  return el('div', { className: 'item-card item-card--syllable' }, parts);
}

/**
 * Splits the display text of a syllable into nodes, underlining letter combinations.
 * @param {string} part - Display text of one syllable (original case).
 * @returns {Array<Node>} Text nodes and combination spans.
 */
function syllableContent(part) {
  let offset = 0;
  return splitIntoLetters(part.toLowerCase()).map((letterId) => {
    const text = part.slice(offset, offset + letterId.length);
    offset += letterId.length;
    return letterById(letterId).type === 'combination'
      ? el('span', { className: 'item-card__combination', text })
      : document.createTextNode(text);
  });
}

/**
 * Returns the index of the first syllable of the second part of a compound word (or -1).
 * @param {object} word - Word entry.
 * @returns {number} Syllable index.
 */
function compoundBoundary(word) {
  const firstPart = word.parts ? wordById(word.parts[0]) : null;
  return firstPart ? firstPart.syllables.length : -1;
}

/**
 * Creates spans for the syllables of a word with alternating colors.
 * @param {object} word - Word entry.
 * @param {string} [displayText] - Text to show instead of word.display (same letters, other case).
 * @returns {Array<HTMLElement>} Syllable spans.
 */
export function syllableSpans(word, displayText) {
  const source = displayText ? { ...word, display: displayText } : word;
  const boundary = compoundBoundary(word);
  return displaySyllables(source).map((part, index) => el('span', {
    className: `item-card__syllable item-card__syllable--${index % 2 === 0 ? 'odd' : 'even'}${index === boundary ? ' item-card__part-gap' : ''}`
  }, syllableContent(part)));
}

/**
 * Creates the card content for a word with colored syllables.
 * @param {object} word - Word entry.
 * @returns {HTMLElement} Card content.
 */
export function wordCard(word) {
  const isLong = word.syllables.length >= 4 || word.display.length > 9;
  return el('div', { className: `item-card item-card--word${isLong ? ' item-card--long' : ''}` }, syllableSpans(word));
}

/**
 * Creates one token of a sentence: a learned word with colored syllables or a marked sight word.
 * @param {string} token - Lowercase token.
 * @param {string} displayText - Token as written in the sentence.
 * @returns {HTMLElement} Token element.
 */
export function sentenceToken(token, displayText) {
  const word = wordById(token);
  if (word && !ALL_SIGHT_WORDS.includes(token)) {
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
