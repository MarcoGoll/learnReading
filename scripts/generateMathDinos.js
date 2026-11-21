import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Generates the six stage SVGs (egg + 5 growth stages) of the four math dino species
 * in the style of the existing dinos. Run once: node scripts/generateMathDinos.js
 */

/** Figure transforms per stage (same growth as the reading dinos). */
const STAGE_TRANSFORMS = { 1: 'translate(34 52) scale(0.68)', 2: 'translate(30 54) scale(0.72)', 3: 'translate(18 36) scale(0.82)', 4: 'translate(14 30) scale(0.86)', 5: 'translate(0 2) scale(1)' };

/** Egg shell shown below the freshly hatched baby. */
const SHELL = '<path class="dino__shell" d="M40 150 L52 140 L64 152 L78 138 L92 152 L106 138 L120 152 L134 140 L148 152 L160 142 Q164 196 100 196 Q36 196 40 150 Z" fill="#fff8e1" stroke="#e0c98f" stroke-width="3"/>';

/**
 * Returns the eye group of a head at a point.
 * @param {number} x - Eye centre x.
 * @param {number} y - Eye centre y.
 * @param {number} radius - Eye radius.
 * @returns {string} SVG markup.
 */
function eye(x, y, radius) {
  return `<g class="dino__eye"><circle cx="${x}" cy="${y}" r="${radius}" fill="#fff"/><circle cx="${x + 2}" cy="${y + 1}" r="${radius * 0.55}" fill="#263238"/><circle cx="${x + 3.5}" cy="${y - 1.5}" r="${radius * 0.2}" fill="#fff"/></g>`;
}

/**
 * Returns the four legs (back and front pairs) of a quadruped body.
 * @param {object} colors - main and dark colours.
 * @param {Array<number>} xs - X positions of back left, back right, front left, front right.
 * @returns {{back: string, front: string}} Leg groups.
 */
function legs(colors, xs) {
  const leg = (x, height, color) => `<rect x="${x}" y="${186 - height}" width="20" height="${height}" rx="10" fill="${color}"/><ellipse cx="${x + 10}" cy="${186 - 2}" rx="14" ry="5" fill="${color}"/>`;
  return {
    back: `<g class="dino__leg dino__leg--back">${leg(xs[0], 38, colors.dark)}${leg(xs[1], 38, colors.dark)}</g>`,
    front: `<g class="dino__leg dino__leg--front">${leg(xs[2], 34, colors.main)}${leg(xs[3], 34, colors.main)}</g>`
  };
}

/** Stegosaurus: green body, orange back plates, spiked tail. */
const STEGOSAURUS = {
  colors: { main: '#66bb6a', dark: '#388e3c', belly: '#dcedc8', accent: '#ff9800', accentDark: '#e65100' },
  eggSpots: '#ff9800',
  figure(colors) {
    const plates = [[52, 104], [72, 92], [94, 88], [116, 94], [134, 106]].map(([x, y]) => `<path d="M${x - 11} ${y + 16} L${x} ${y - 14} L${x + 11} ${y + 16} Z" fill="${colors.accent}" stroke="${colors.accentDark}" stroke-width="2" stroke-linejoin="round"/>`).join('');
    const leg = legs(colors, [46, 104, 64, 120]);
    return `<g class="dino__tail"><path d="M42 126 Q14 128 4 150 Q30 146 48 142 Z" fill="${colors.main}"/><path d="M10 140 L2 128 L16 138 Z M18 138 L14 124 L24 136 Z" fill="${colors.accent}" stroke="${colors.accentDark}" stroke-width="1.5"/></g>`
      + `${leg.back}<g class="dino__plates">${plates}</g>`
      + `<g class="dino__torso"><ellipse cx="90" cy="128" rx="56" ry="32" fill="${colors.main}"/><ellipse cx="94" cy="140" rx="34" ry="16" fill="${colors.belly}"/></g>${leg.front}`
      + '<g class="dino__anchor dino__anchor--neck" transform="translate(140 124) scale(0.8)"></g>'
      + `<g class="dino__head"><path d="M136 120 Q150 104 168 108 Q190 112 188 126 Q186 138 166 138 Q146 138 136 132 Z" fill="${colors.main}"/>`
      + `<path d="M170 130 Q178 132 184 128" stroke="${colors.dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>${eye(166, 118, 6)}`
      + '<g class="dino__anchor dino__anchor--eyes" transform="translate(166 118) scale(0.6)"></g><g class="dino__anchor dino__anchor--head" transform="translate(162 106) scale(0.6)"></g></g>';
  }
};

/** Ankylosaurus: sand-brown armour with studs, club tail. */
const ANKYLOSAURUS = {
  colors: { main: '#bc9a6c', dark: '#8d6e4a', belly: '#efe3cf', accent: '#a1887f', accentDark: '#6d4c41' },
  eggSpots: '#a1887f',
  figure(colors) {
    const studs = [[58, 112], [78, 104], [100, 102], [122, 108], [68, 126], [90, 122], [112, 124]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${colors.accent}" stroke="${colors.accentDark}" stroke-width="2"/>`).join('');
    const leg = legs(colors, [50, 104, 66, 118]);
    return `<g class="dino__tail"><path d="M44 130 Q22 132 12 140 Q26 144 46 144 Z" fill="${colors.main}"/><ellipse class="dino__club" cx="12" cy="140" rx="12" ry="9" fill="${colors.accent}" stroke="${colors.accentDark}" stroke-width="2"/></g>`
      + `${leg.back}<g class="dino__torso"><path d="M36 140 Q38 98 90 96 Q142 98 146 140 Z" fill="${colors.main}"/><ellipse cx="92" cy="146" rx="50" ry="14" fill="${colors.belly}"/>${studs}</g>${leg.front}`
      + '<g class="dino__anchor dino__anchor--neck" transform="translate(142 128) scale(0.8)"></g>'
      + `<g class="dino__head"><ellipse cx="164" cy="128" rx="24" ry="17" fill="${colors.main}"/><path d="M144 116 L150 106 L156 116 M170 112 L178 104 L180 116" stroke="${colors.accentDark}" stroke-width="3" fill="none" stroke-linecap="round"/>`
      + `<path d="M168 138 Q178 140 184 134" stroke="${colors.dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>${eye(168, 124, 6)}`
      + '<g class="dino__anchor dino__anchor--eyes" transform="translate(168 124) scale(0.6)"></g><g class="dino__anchor dino__anchor--head" transform="translate(162 110) scale(0.6)"></g></g>';
  }
};

/** Parasaurolophus: blue-violet body with a long curved head crest. */
const PARASAUROLOPHUS = {
  colors: { main: '#7e57c2', dark: '#512da8', belly: '#e1d5f5', accent: '#4fc3f7', accentDark: '#0277bd' },
  eggSpots: '#7e57c2',
  figure(colors) {
    const leg = legs(colors, [52, 98, 66, 112]);
    return `<g class="dino__tail"><path d="M44 130 Q14 136 4 160 Q30 150 50 146 Z" fill="${colors.main}"/></g>`
      + `${leg.back}<g class="dino__torso"><ellipse cx="86" cy="132" rx="50" ry="30" fill="${colors.main}"/><ellipse cx="90" cy="144" rx="30" ry="14" fill="${colors.belly}"/><circle cx="70" cy="118" r="5" fill="${colors.accent}"/><circle cx="94" cy="112" r="5" fill="${colors.accent}"/></g>${leg.front}`
      + `<path d="M114 126 Q132 112 134 88 L152 92 Q148 120 128 142 Z" fill="${colors.main}"/>`
      + '<g class="dino__anchor dino__anchor--neck" transform="translate(132 104) scale(0.8)"></g>'
      + `<g class="dino__head"><path class="dino__crest" d="M140 78 Q120 58 104 52 Q100 60 108 64 Q124 70 136 86 Z" fill="${colors.accent}" stroke="${colors.accentDark}" stroke-width="2"/>`
      + `<ellipse cx="154" cy="84" rx="24" ry="15" fill="${colors.main}"/><path d="M164 92 Q174 94 180 88" stroke="${colors.dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>${eye(156, 79, 6)}`
      + '<g class="dino__anchor dino__anchor--eyes" transform="translate(156 79) scale(0.6)"></g><g class="dino__anchor dino__anchor--head" transform="translate(150 68) scale(0.6)"></g></g>';
  }
};

/** Pachycephalosaurus: orange body on two legs, round brown dome head with studs. */
const PACHYCEPHALOSAURUS = {
  colors: { main: '#ffb74d', dark: '#ef6c00', belly: '#fff3e0', accent: '#8d6e63', accentDark: '#5d4037' },
  eggSpots: '#8d6e63',
  figure(colors) {
    const leg = (x, color) => `<rect x="${x}" y="140" width="22" height="44" rx="11" fill="${color}"/><ellipse cx="${x + 11}" cy="184" rx="15" ry="5" fill="${color}"/>`;
    const studs = [[132, 70], [148, 62], [166, 64], [178, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${colors.accentDark}"/>`).join('');
    return `<g class="dino__tail"><path d="M50 128 Q16 120 4 136 Q30 144 54 146 Z" fill="${colors.main}"/></g>`
      + `<g class="dino__leg dino__leg--back">${leg(66, colors.dark)}</g>`
      + `<g class="dino__torso"><ellipse cx="94" cy="128" rx="46" ry="34" fill="${colors.main}"/><ellipse cx="100" cy="138" rx="26" ry="20" fill="${colors.belly}"/></g>`
      + `<g class="dino__leg dino__leg--front">${leg(98, colors.main)}<path d="M124 120 Q138 126 136 136" stroke="${colors.dark}" stroke-width="8" fill="none" stroke-linecap="round"/></g>`
      + `<path d="M118 112 Q130 96 136 86 L156 96 Q146 112 132 126 Z" fill="${colors.main}"/>`
      + '<g class="dino__anchor dino__anchor--neck" transform="translate(134 104) scale(0.8)"></g>'
      + `<g class="dino__head"><ellipse cx="160" cy="96" rx="26" ry="18" fill="${colors.main}"/>`
      + `<path class="dino__dome" d="M128 84 Q130 50 158 50 Q188 52 188 84 Z" fill="${colors.accent}" stroke="${colors.accentDark}" stroke-width="2"/>${studs}`
      + `<path d="M168 104 Q178 106 184 100" stroke="${colors.dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>${eye(166, 92, 6)}`
      + '<g class="dino__anchor dino__anchor--eyes" transform="translate(166 92) scale(0.6)"></g><g class="dino__anchor dino__anchor--head" transform="translate(158 52) scale(0.6)"></g></g>';
  }
};

/**
 * Returns the egg SVG of a species.
 * @param {object} species - Species definition.
 * @returns {string} SVG markup.
 */
function eggSvg(species) {
  const spot = species.eggSpots;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="dino-svg">
  <g class="dino__figure">
    <g class="dino__egg">
      <path d="M100 30 Q150 30 158 118 Q162 186 100 188 Q38 186 42 118 Q50 30 100 30 Z" fill="#fff8e1" stroke="#e0c98f" stroke-width="3"/>
      <circle cx="78" cy="90" r="10" fill="${spot}"/><circle cx="122" cy="72" r="7" fill="${spot}"/>
      <circle cx="128" cy="130" r="12" fill="${spot}"/><circle cx="80" cy="150" r="8" fill="${spot}"/>
      <circle cx="104" cy="110" r="5" fill="${spot}"/>
      <g class="dino__anchor dino__anchor--head" transform="translate(100 38)"></g>
      <g class="dino__anchor dino__anchor--eyes" transform="translate(100 96) scale(1.1)"></g>
      <g class="dino__anchor dino__anchor--neck" transform="translate(100 156) scale(1.3)"></g>
    </g>
  </g>
</svg>
`;
}

/**
 * Returns the SVG of a growth stage of a species.
 * @param {object} species - Species definition.
 * @param {number} stage - Stage 1-5.
 * @returns {string} SVG markup.
 */
function stageSvg(species, stage) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="dino-svg">
  <g class="dino__figure" transform="${STAGE_TRANSFORMS[stage]}">
    ${species.figure(species.colors)}
  </g>
  ${stage === 1 ? SHELL : ''}
</svg>
`;
}

/**
 * Writes all stage files of the four math species.
 */
function generate() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'svg', 'dino');
  Object.entries({ stegosaurus: STEGOSAURUS, ankylosaurus: ANKYLOSAURUS, parasaurolophus: PARASAUROLOPHUS, pachycephalosaurus: PACHYCEPHALOSAURUS }).forEach(([id, species]) => {
    const folder = join(root, id);
    mkdirSync(folder, { recursive: true });
    writeFileSync(join(folder, 'stage-0.svg'), eggSvg(species));
    [1, 2, 3, 4, 5].forEach((stage) => writeFileSync(join(folder, `stage-${stage}.svg`), stageSvg(species, stage)));
  });
  console.log('Generated math dino SVGs');
}

generate();
