import { el } from './dom.js';
import { playSound } from '../audio/soundPlayer.js';

/** Pointer movement below which a gesture counts as a tap. */
const TAP_DISTANCE_PX = 8;

/** Maximum distance from a slot center for a drop to snap into it. */
const SNAP_DISTANCE_PX = 110;

/**
 * Creates a drag-and-drop board with a tray of tiles and a row of slots.
 * Tiles can be dragged (mouse, touch, pen) or tapped into the next free slot.
 * @param {object} options - Board options.
 * @param {number} options.slotCount - Number of slots.
 * @param {Array<{tileId: string}>} options.tiles - Tiles in tray order.
 * @param {Function} options.renderTile - Returns tile content for (tile, slotIndex or null).
 * @param {Function} options.onComplete - Called with tile ids in slot order when all slots are filled.
 * @param {string} [options.suffix] - Fixed text shown after the last slot (e.g. ".").
 * @returns {object} Board API: element, slotsElement, reset, setLocked.
 */
export function createDragBoard({ slotCount, tiles, renderTile, onComplete, suffix }) {
  const board = { slots: Array(slotCount).fill(null), tileElements: new Map(), locked: false };
  board.tray = el('div', { className: 'drag-task__tray' });
  board.slotElements = Array.from({ length: slotCount }, () => el('div', { className: 'drag-task__slot' }));
  const slotsElement = el('div', { className: 'drag-task__slots' }, [...board.slotElements, suffix ? el('span', { className: 'drag-task__suffix', text: suffix }) : null]);
  board.renderTile = renderTile;
  board.onComplete = onComplete;
  tiles.forEach((tile) => {
    const tileElement = el('div', { className: 'drag-tile', attrs: { role: 'button', tabindex: '0' } });
    tileElement.dataset.tileId = tile.tileId;
    board.tileElements.set(tile.tileId, { tile, element: tileElement });
    attachPointerHandling(board, tileElement);
    tileElement.addEventListener('keydown', (event) => { if (event.key === 'Enter') tapTile(board, tile.tileId); });
  });
  resetBoard(board);
  return {
    element: el('div', { className: 'drag-task__board' }, [slotsElement, board.tray]),
    slotsElement,
    reset: () => resetBoard(board),
    setLocked: (value) => { board.locked = value; }
  };
}

/**
 * Puts all tiles back into the tray.
 * @param {object} board - Board state.
 */
function resetBoard(board) {
  board.slots.fill(null);
  board.tileElements.forEach(({ element }) => board.tray.append(element));
  renderAll(board);
}

/**
 * Renders the content of every tile depending on its position.
 * @param {object} board - Board state.
 */
function renderAll(board) {
  board.tileElements.forEach(({ tile, element }, tileId) => {
    const slotIndex = board.slots.indexOf(tileId);
    element.replaceChildren(...board.renderTile(tile, slotIndex === -1 ? null : slotIndex));
    element.classList.toggle('drag-tile--placed', slotIndex !== -1);
  });
}

/**
 * Places a tile into a slot (or back into the tray with slotIndex null).
 * @param {object} board - Board state.
 * @param {string} tileId - Tile id.
 * @param {number|null} slotIndex - Target slot or null for the tray.
 */
function placeTile(board, tileId, slotIndex) {
  const previous = board.slots.indexOf(tileId);
  if (previous !== -1) board.slots[previous] = null;
  const element = board.tileElements.get(tileId).element;
  if (slotIndex === null) {
    board.tray.append(element);
    playSound('dragDrop');
  } else {
    board.slots[slotIndex] = tileId;
    board.slotElements[slotIndex].append(element);
    playSound('dragSnap');
  }
  renderAll(board);
  if (board.slots.every(Boolean)) {
    board.onComplete([...board.slots]);
  }
}

/**
 * Handles a tap: tray tiles go to the next free slot, placed tiles go back to the tray.
 * @param {object} board - Board state.
 * @param {string} tileId - Tile id.
 */
function tapTile(board, tileId) {
  if (board.locked) return;
  if (board.slots.includes(tileId)) {
    placeTile(board, tileId, null);
    return;
  }
  const freeSlot = board.slots.indexOf(null);
  if (freeSlot !== -1) placeTile(board, tileId, freeSlot);
}

/**
 * Finds the slot nearest to a point, preferring free slots; null if too far away.
 * @param {object} board - Board state.
 * @param {number} x - Client x.
 * @param {number} y - Client y.
 * @param {string} tileId - Dragged tile (its own slot counts as free).
 * @returns {number|null} Slot index or null.
 */
function nearestSlot(board, x, y, tileId) {
  let best = null;
  let bestDistance = SNAP_DISTANCE_PX;
  board.slotElements.forEach((slotElement, index) => {
    const isFree = board.slots[index] === null || board.slots[index] === tileId;
    const rect = slotElement.getBoundingClientRect();
    const distance = Math.hypot(rect.left + rect.width / 2 - x, rect.top + rect.height / 2 - y);
    if (isFree && distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

/**
 * Starts a possible drag when a tile is pressed.
 * @param {object} board - Board state.
 * @param {HTMLElement} tileElement - Tile element.
 * @param {PointerEvent} event - Pointer event.
 */
function onPointerDown(board, tileElement, event) {
  if (board.locked) return;
  tileElement.setPointerCapture(event.pointerId);
  board.drag = { tileElement, startX: event.clientX, startY: event.clientY, moved: false };
}

/**
 * Moves the pressed tile with the pointer once it moved further than a tap.
 * @param {object} board - Board state.
 * @param {PointerEvent} event - Pointer event.
 */
function onPointerMove(board, event) {
  const drag = board.drag;
  if (!drag) return;
  const dx = event.clientX - drag.startX;
  const dy = event.clientY - drag.startY;
  if (!drag.moved && Math.hypot(dx, dy) > TAP_DISTANCE_PX) {
    drag.moved = true;
    drag.tileElement.classList.add('drag-tile--dragging');
    playSound('dragPickup');
  }
  if (drag.moved) drag.tileElement.style.transform = `translate(${dx}px, ${dy}px)`;
}

/**
 * Ends a drag (drop into the nearest slot or back to the tray) or handles a tap.
 * @param {object} board - Board state.
 * @param {PointerEvent} event - Pointer event.
 */
function onPointerUp(board, event) {
  const drag = board.drag;
  if (!drag) return;
  board.drag = null;
  drag.tileElement.classList.remove('drag-tile--dragging');
  drag.tileElement.style.transform = '';
  const tileId = drag.tileElement.dataset.tileId;
  if (!drag.moved) {
    tapTile(board, tileId);
    return;
  }
  placeTile(board, tileId, nearestSlot(board, event.clientX, event.clientY, tileId));
}

/**
 * Attaches pointer handling (drag and tap) to a tile element.
 * @param {object} board - Board state.
 * @param {HTMLElement} tileElement - Tile element.
 */
function attachPointerHandling(board, tileElement) {
  tileElement.addEventListener('pointerdown', (event) => onPointerDown(board, tileElement, event));
  tileElement.addEventListener('pointermove', (event) => onPointerMove(board, event));
  tileElement.addEventListener('pointerup', (event) => onPointerUp(board, event));
  tileElement.addEventListener('pointercancel', (event) => onPointerUp(board, event));
}
