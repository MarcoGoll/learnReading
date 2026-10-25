import { el, icon } from '../components/dom.js';
import { renderDino, accessoryPath } from '../components/dino.js';
import { getSvg } from '../components/svgLoader.js';
import { store } from '../state/store.js';
import { REWARDS } from '../data/rewards.js';
import { toggleWorn, nextReward } from '../logic/rewards.js';
import { playSound } from '../audio/soundPlayer.js';

/**
 * Creates one accessory tile of the wardrobe.
 * @param {object} reward - Reward.
 * @param {object} state - Game state.
 * @param {Function} onToggle - Called after putting on / taking off.
 * @returns {HTMLButtonElement} Tile.
 */
function wardrobeItem(reward, state, onToggle) {
  const isUnlocked = state.rewards.unlocked.includes(reward.id);
  const isWorn = state.rewards.worn[reward.slot] === reward.id;
  const modifiers = `${isUnlocked ? '' : ' wardrobe__item--locked'}${isWorn ? ' wardrobe__item--worn' : ''}`;
  const tile = el('button', { className: `wardrobe__item${modifiers}`, attrs: { type: 'button', 'aria-pressed': String(isWorn) } }, [
    el('span', { className: 'wardrobe__picture', html: getSvg(accessoryPath(reward.id)) }),
    el('span', { className: 'wardrobe__name', text: reward.name }),
    isUnlocked ? null : el('span', { className: 'wardrobe__threshold' }, [icon('lock'), el('span', { text: `${reward.threshold} Punkte` })])
  ]);
  tile.disabled = !isUnlocked;
  tile.addEventListener('click', () => {
    playSound('click');
    store.updateState((current) => toggleWorn(current, reward));
    onToggle();
  });
  return tile;
}

/**
 * Renders the wardrobe ("Dino-Schrank") where the child dresses the dino.
 * @param {HTMLElement} container - Screen container.
 */
export function renderWardrobe(container) {
  const state = store.getState();
  const preview = el('div', { className: 'wardrobe__preview' });
  const next = nextReward(state.score.total, REWARDS);
  container.replaceChildren(el('section', { className: 'wardrobe' }, [
    el('h1', { className: 'screen-title', text: 'Dino-Schrank' }),
    el('div', { className: 'wardrobe__layout' }, [
      preview,
      el('div', { className: 'wardrobe__side' }, [
        el('p', { className: 'wardrobe__next', text: next ? `Noch ${next.missing} Punkte bis: ${next.reward.name}` : 'Alles freigeschaltet!' }),
        el('div', { className: 'wardrobe__grid' }, REWARDS.map((reward) => wardrobeItem(reward, state, () => renderWardrobe(container))))
      ])
    ])
  ]));
  renderDino(preview, state.dinoStage, state.rewards.worn);
}
