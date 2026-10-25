import { el, icon } from '../components/dom.js';
import { renderDino, accessoryPath } from '../components/dino.js';
import { getSvg } from '../components/svgLoader.js';
import { confirmDialog } from '../components/dialog.js';
import { burstStars } from '../components/effects.js';
import { store } from '../state/store.js';
import { REWARDS, POINT_REWARDS } from '../data/rewards.js';
import { toggleWorn, isWearableBy, canBuy, buyReward, spendablePoints, cheapestLocked } from '../logic/rewards.js';
import { activeJourney, activeJourneyDef } from '../state/journeyState.js';
import { playSound } from '../audio/soundPlayer.js';

/**
 * Returns the label below a locked accessory: its price or the star condition.
 * @param {object} reward - Reward.
 * @param {boolean} isBuyable - Whether it can be bought now.
 * @returns {HTMLElement} Label.
 */
function lockLabel(reward, isBuyable) {
  if (reward.price === null) {
    return el('span', { className: 'wardrobe__price' }, [icon('lock'), el('span', { text: 'Alle 15 Sterne' })]);
  }
  return el('span', { className: `wardrobe__price${isBuyable ? ' wardrobe__price--buyable' : ''}` }, [
    icon(isBuyable ? 'star' : 'lock'), el('span', { text: `${reward.price} Punkte` })
  ]);
}

/**
 * Asks whether to buy an accessory; on yes it is bought and put on directly.
 * @param {object} reward - Reward.
 * @param {HTMLElement} tile - Tile of the reward (for the effect).
 * @returns {Promise<boolean>} True if bought.
 */
async function askToBuy(reward, tile) {
  const isConfirmed = await confirmDialog(`Möchtest du ${reward.name} für ${reward.price} Punkte holen?`, 'Holen');
  if (!isConfirmed) {
    return false;
  }
  store.updateState((state) => {
    if (buyReward(state, reward)) toggleWorn(state, reward);
  });
  playSound('reward');
  burstStars(tile, 10);
  return true;
}

/**
 * Creates one accessory tile: unlocked ones are put on / taken off, affordable ones can be bought.
 * @param {object} reward - Reward.
 * @param {object} state - Game state.
 * @param {Function} onChange - Called after a change (re-renders the wardrobe).
 * @returns {HTMLButtonElement} Tile.
 */
function wardrobeItem(reward, state, onChange) {
  const isUnlocked = state.rewards.unlocked.includes(reward.id);
  const isBuyable = canBuy(state, reward);
  const isWorn = activeJourney(state).worn[reward.slot] === reward.id;
  const modifiers = `${isUnlocked ? '' : ' wardrobe__item--locked'}${isBuyable ? ' wardrobe__item--buyable' : ''}${isWorn ? ' wardrobe__item--worn' : ''}`;
  const tile = el('button', { className: `wardrobe__item${modifiers}`, attrs: { type: 'button', 'aria-pressed': String(isWorn) } }, [
    el('span', { className: 'wardrobe__picture', html: getSvg(accessoryPath(reward.id)) }),
    el('span', { className: 'wardrobe__name', text: reward.name }),
    isUnlocked ? null : lockLabel(reward, isBuyable)
  ]);
  tile.disabled = !isUnlocked && !isBuyable;
  tile.addEventListener('click', () => onTileClick(reward, tile, isUnlocked, onChange));
  return tile;
}

/**
 * Handles a tap on a tile: puts an unlocked accessory on / off, or offers to buy a locked one.
 * @param {object} reward - Reward.
 * @param {HTMLElement} tile - Tapped tile.
 * @param {boolean} isUnlocked - Whether the reward is unlocked.
 * @param {Function} onChange - Re-renders the wardrobe.
 */
async function onTileClick(reward, tile, isUnlocked, onChange) {
  playSound('click');
  if (isUnlocked) {
    store.updateState((current) => toggleWorn(current, reward));
    onChange();
  } else if (await askToBuy(reward, tile)) {
    setTimeout(onChange, 700);
  }
}

/**
 * Returns the text above the accessory grid: spendable points and what to do with them.
 * @param {object} state - Game state.
 * @returns {string} Text.
 */
function balanceText(state) {
  const points = spendablePoints(state);
  const cheapest = cheapestLocked(state, POINT_REWARDS);
  if (!cheapest) return `Du hast alles! Guthaben: ${points} Punkte`;
  return cheapest.missing === 0
    ? `Du hast ${points} Punkte. Tippe auf ein leuchtendes Teil, um es zu holen!`
    : `Du hast ${points} Punkte. Noch ${cheapest.missing} Punkte bis zum nächsten Teil.`;
}

/**
 * Renders the wardrobe ("Dino-Schrank") where the child buys accessories and dresses the dino.
 * @param {HTMLElement} container - Screen container.
 */
export function renderWardrobe(container) {
  const state = store.getState();
  const preview = el('div', { className: 'wardrobe__preview' });
  const rewards = REWARDS.filter((reward) => isWearableBy(reward, state.activeJourney));
  container.replaceChildren(el('section', { className: 'wardrobe' }, [
    el('h1', { className: 'screen-title', text: 'Dino-Schrank' }),
    el('div', { className: 'wardrobe__layout' }, [
      preview,
      el('div', { className: 'wardrobe__side' }, [
        el('p', { className: 'wardrobe__next', text: balanceText(state) }),
        el('div', { className: 'wardrobe__grid' }, rewards.map((reward) => wardrobeItem(reward, state, () => renderWardrobe(container))))
      ])
    ])
  ]));
  const journey = activeJourney(state);
  renderDino(preview, activeJourneyDef(state).species, journey.dinoStage, journey.worn);
}
