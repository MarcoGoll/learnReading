/** Dino accessories unlocked at total-point thresholds. */
export const REWARDS = [
  { id: 'redCap', name: 'Rote Mütze', slot: 'head', threshold: 100 },
  { id: 'sunglasses', name: 'Sonnenbrille', slot: 'eyes', threshold: 250 },
  { id: 'stripedScarf', name: 'Ringelschal', slot: 'neck', threshold: 500 },
  { id: 'flowerCrown', name: 'Blumenkranz', slot: 'head', threshold: 800 },
  { id: 'bowTie', name: 'Fliege', slot: 'neck', threshold: 1200 },
  { id: 'pirateHat', name: 'Piratenhut', slot: 'head', threshold: 1700 },
  { id: 'heartGlasses', name: 'Herzbrille', slot: 'eyes', threshold: 2300 },
  { id: 'medal', name: 'Medaille', slot: 'neck', threshold: 3000 },
  { id: 'explorerHat', name: 'Forscherhut', slot: 'head', threshold: 4000 },
  { id: 'skiGoggles', name: 'Skibrille', slot: 'eyes', threshold: 5000 },
  { id: 'superheroCape', name: 'Heldenumhang', slot: 'neck', threshold: 6500 },
  { id: 'goldenCrown', name: 'Goldkrone', slot: 'head', threshold: 8000 }
];

/**
 * Finds a reward by id.
 * @param {string} id - Reward id.
 * @returns {object|undefined} Reward.
 */
export function rewardById(id) {
  return REWARDS.find((reward) => reward.id === id);
}
