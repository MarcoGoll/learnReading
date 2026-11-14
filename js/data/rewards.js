/**
 * Dino accessories the child buys in the wardrobe with collected points (price in points).
 * The first three are cheap (within the first rounds); after that the prices rise steeply,
 * so the child has to save points over many rounds for each further accessory.
 * Ten further accessories (6000-15000) and five super accessories (25000-50000, flag super) are
 * long-term goals; super accessories are marked in the wardrobe and sparkle on the dino.
 * Special accessories (price null) are unlocked by collecting all stars of a journey.
 */
export const REWARDS = [
  { id: 'redCap', name: 'Rote Mütze', slot: 'head', price: 100 },
  { id: 'sunglasses', name: 'Sonnenbrille', slot: 'eyes', price: 150 },
  { id: 'stripedScarf', name: 'Ringelschal', slot: 'neck', price: 250 },
  { id: 'flowerCrown', name: 'Blumenkranz', slot: 'head', price: 1000 },
  { id: 'bowTie', name: 'Fliege', slot: 'neck', price: 1000 },
  { id: 'starGlasses', name: 'Sternenbrille', slot: 'eyes', price: 1000 },
  { id: 'partyHat', name: 'Partyhut', slot: 'head', price: 1000 },
  { id: 'bandana', name: 'Halstuch', slot: 'neck', price: 1500 },
  { id: 'pirateHat', name: 'Piratenhut', slot: 'head', price: 1500 },
  { id: 'heartGlasses', name: 'Herzbrille', slot: 'eyes', price: 1500 },
  { id: 'pearlNecklace', name: 'Perlenkette', slot: 'neck', price: 2000 },
  { id: 'cowboyHat', name: 'Cowboyhut', slot: 'head', price: 2000 },
  { id: 'nerdGlasses', name: 'Lesebrille', slot: 'eyes', price: 2000 },
  { id: 'medal', name: 'Medaille', slot: 'neck', price: 2500 },
  { id: 'explorerHat', name: 'Forscherhut', slot: 'head', price: 2500 },
  { id: 'monocle', name: 'Monokel', slot: 'eyes', price: 2500 },
  { id: 'flowerLei', name: 'Blumenkette', slot: 'neck', price: 2500 },
  { id: 'wizardHat', name: 'Zauberhut', slot: 'head', price: 3000 },
  { id: 'skiGoggles', name: 'Skibrille', slot: 'eyes', price: 3000 },
  { id: 'bellCollar', name: 'Glöckchen', slot: 'neck', price: 3000 },
  { id: 'vikingHelmet', name: 'Wikingerhelm', slot: 'head', price: 3500 },
  { id: 'divingMask', name: 'Taucherbrille', slot: 'eyes', price: 3500 },
  { id: 'superheroCape', name: 'Heldenumhang', slot: 'neck', price: 4000 },
  { id: 'goldenCrown', name: 'Goldkrone', slot: 'head', price: 5000 },
  { id: 'chefHat', name: 'Kochmütze', slot: 'head', price: 6000 },
  { id: 'rainbowGlasses', name: 'Regenbogenbrille', slot: 'eyes', price: 7000 },
  { id: 'necktie', name: 'Krawatte', slot: 'neck', price: 7500 },
  { id: 'propellerCap', name: 'Propellermütze', slot: 'head', price: 8000 },
  { id: 'catEyeGlasses', name: 'Katzenbrille', slot: 'eyes', price: 9000 },
  { id: 'shellNecklace', name: 'Muschelkette', slot: 'neck', price: 10000 },
  { id: 'knightHelmet', name: 'Ritterhelm', slot: 'head', price: 11000 },
  { id: 'starVisor', name: 'Sternenvisier', slot: 'eyes', price: 12000 },
  { id: 'butterflyWings', name: 'Schmetterlingsflügel', slot: 'neck', price: 13000 },
  { id: 'unicornHorn', name: 'Einhorn-Horn', slot: 'head', price: 15000 },
  // Super accessories: very expensive long-term goals
  { id: 'diamondCrown', name: 'Diamantkrone', slot: 'head', price: 25000, super: true },
  { id: 'starCape', name: 'Sternenumhang', slot: 'neck', price: 30000, super: true },
  { id: 'diamondGlasses', name: 'Diamantbrille', slot: 'eyes', price: 35000, super: true },
  { id: 'fireWings', name: 'Feuerflügel', slot: 'neck', price: 40000, super: true },
  { id: 'galaxyCrown', name: 'Galaxiekrone', slot: 'head', price: 50000, super: true },
  // Special accessories for all 15 stars of a journey (only for that dino)
  { id: 'goldenCape', name: 'Goldener Umhang', slot: 'neck', price: null, journey: 'trex' },
  { id: 'hornFlowers', name: 'Hörner-Blumen', slot: 'head', price: null, journey: 'triceratops' },
  { id: 'rainbowScarf', name: 'Regenbogenschal', slot: 'neck', price: null, journey: 'longneck' },
  { id: 'aviatorGoggles', name: 'Fliegerbrille', slot: 'eyes', price: null, journey: 'pterosaur' }
];

/** Rewards bought with points (available for all dinos). */
export const POINT_REWARDS = REWARDS.filter((reward) => reward.price !== null);

/**
 * Finds a reward by id.
 * @param {string} id - Reward id.
 * @returns {object|undefined} Reward.
 */
export function rewardById(id) {
  return REWARDS.find((reward) => reward.id === id);
}
