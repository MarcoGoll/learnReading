import { createDefaultState, normalizeState } from './defaultState.js';

/** localStorage key of the game state. */
export const STORAGE_KEY = 'learnReading.state';

/**
 * Loads the state from storage; missing or invalid data yields the default state.
 * @param {Storage|null} storage - Storage implementation.
 * @returns {object} Game state.
 */
export function loadState(storage) {
  try {
    const rawText = storage ? storage.getItem(STORAGE_KEY) : null;
    return rawText ? normalizeState(JSON.parse(rawText)) : createDefaultState();
  } catch (error) {
    return createDefaultState();
  }
}

/**
 * Saves the state to storage; storage errors (e.g. private mode) are ignored.
 * @param {Storage|null} storage - Storage implementation.
 * @param {object} state - Game state.
 */
export function saveState(storage, state) {
  try {
    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    // Progress cannot be saved, but the game keeps working in memory.
  }
}

/**
 * Creates a store that keeps the game state in memory and persists every change.
 * The methods are bound so they can be passed around as plain functions.
 * @param {Storage|null} storage - Storage implementation (localStorage or a test double).
 * @returns {object} Store API: getState, updateState, resetState, subscribe.
 */
export function createStore(storage) {
  const store = { storage, state: loadState(storage), listeners: new Set() };
  const notify = () => store.listeners.forEach((listener) => listener(store.state));
  return {
    getState: () => store.state,
    updateState: (mutatorFn) => { mutatorFn(store.state); saveState(storage, store.state); notify(); },
    resetState: () => { store.state = createDefaultState(); saveState(storage, store.state); notify(); },
    subscribe: (listener) => { store.listeners.add(listener); return () => store.listeners.delete(listener); }
  };
}

/**
 * Returns the browser's localStorage if accessible.
 * @returns {Storage|null} localStorage or null.
 */
function browserStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch (error) {
    return null;
  }
}

/** Shared store instance of the running app. */
export const store = createStore(browserStorage());
