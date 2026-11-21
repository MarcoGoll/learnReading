import { el } from './dom.js';
import { quantitySvg } from './mathAids.js';

/**
 * Creates the answer cards of a card task: numbers, or quantity pictures for "pickQuantity".
 * @param {object} options - Options.
 * @param {Array<number>} options.values - Option values.
 * @param {boolean} options.showQuantities - Whether cards show quantity pictures instead of numbers.
 * @param {Function} options.onChoose - Called with (value, cardElement).
 * @returns {{element: HTMLElement, cardOf: Function, setDisabled: Function}} Cards API.
 */
export function createAnswerCards({ values, showQuantities, onChoose }) {
  const cards = values.map((value) => {
    const content = showQuantities ? { html: quantitySvg(value) } : { text: String(value) };
    const card = el('button', {
      className: `answer-cards__card${showQuantities ? ' answer-cards__card--picture' : ''}`,
      attrs: { type: 'button', 'aria-label': String(value) },
      ...content
    });
    card.addEventListener('click', () => onChoose(value, card));
    return { value, card };
  });
  const element = el('div', { className: `answer-cards${showQuantities ? ' answer-cards--pictures' : ''}` }, cards.map(({ card }) => card));
  return {
    element,
    cardOf: (value) => (cards.find((entry) => entry.value === value) || {}).card,
    setDisabled: (isDisabled) => cards.forEach(({ card }) => { card.disabled = isDisabled; })
  };
}
