# Spec: SoundsAndEffects (Epic5)

## Overview / Goal

Funny sounds, quiet background music, and animations that keep the child attentive and make progress feel rewarding. A companion dino reacts to correct and wrong answers during the levels.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Sound source | Free CC0 sound files (e.g. Kenney.nl, OpenGameArt CC0), stored under `assets/sounds/` | Sound funnier than synthesized tones; CC0 needs no attribution |
| Background music | Quiet looping music on all screens, can be switched off | Wished by the user; kept quiet so reading aloud stays audible |
| Mute | Two always-visible toggles at the top right: music on/off and all sounds on/off; settings are persisted | Quick to switch off, e.g. when someone is sleeping |
| Companion dino | Small dino in its current stage at the screen edge during levels; cheers on correct, looks puzzled / scratches its head on wrong | Keeps the bond with the dino during tasks |

## Technical Details

### Sound events

| Event | Sound (character) |
|-------|-------------------|
| `correct` | Short cheerful jingle / "boing-ding" (2-3 variations, chosen randomly) |
| `wrong` | Friendly comic sound (e.g. "wah-wah", slide whistle), never harsh |
| `streak` | Rising arpeggio when a streak starts / grows |
| `levelComplete` | Fanfare |
| `newRecord` | Applause / party horn |
| `evolution` | One sound per stage scene (egg crack, tapping steps, snap, roar, big stomp) |
| `dragPickup` / `dragDrop` / `dragSnap` | Soft pop sounds for drag and drop (levels 4 and SentenceBuilderVariant) |
| `click` | Soft click for regular buttons |
| music | One calm, cheerful loop (CC0), volume about 20 % of the effects |

Format: `.mp3` (supported by all relevant browsers), each effect below 100 KB. Licenses are documented in `assets/sounds/LICENSES.md` (file, source URL, license).

### Sound module (`js/audio/soundPlayer.js`)

```js
/** Preloads all effect sounds. */
initSounds()
/** Plays a sound event (random variation if several exist). No-op when sounds are muted. */
playSound(eventName)
/** Starts / stops the background music loop. */
setMusicEnabled(isEnabled)
setSoundsEnabled(isEnabled)
```

- Uses `HTMLAudioElement` (cloned per playback so sounds can overlap).
- Browsers block autoplay: music starts after the first user interaction (e.g. the first tap on the home screen).
- Settings in the game state: `settings: { soundsEnabled: true, musicEnabled: true }`. "All sounds off" also stops the music.

### Visual effects (CSS animations, BEM block `effects`)

- Correct: the item bounces and a burst of small stars appears; points fly to the score display.
- Wrong: the item wiggles horizontally (no red flashing).
- Streak: streak badge pops in and pulses.
- New record / level complete: confetti (lightweight DOM/CSS particles, no library).
- Respect `prefers-reduced-motion` (fades instead of movement).

### Companion dino

- Uses the stage SVG from DinoEvolution, scaled down, bottom left in level screens (not over the judge controls).
- Reactions as CSS animation classes: `dino--cheer`, `dino--puzzled`, idle otherwise; stage 0 (egg) wobbles happily or shakes.
- API: `createCompanionDino(containerElement, stage)` returning `{ react(kind), destroy() }`.

## Acceptance Criteria

- Each listed event plays its sound when sounds are enabled; nothing plays when muted.
- Music loops quietly on all screens after the first interaction and can be switched off separately; both settings survive a reload.
- Correct answers trigger bounce, stars, and flying points; wrong answers trigger a wiggle.
- The companion dino in the current stage reacts to every correct and wrong judgement.
- All sound files are CC0 and listed with their source in `assets/sounds/LICENSES.md`.
- With `prefers-reduced-motion`, movement animations are replaced by fades.

## Open Risks / Assumptions

- The exact choice of sound files happens during implementation; the user can swap any file later by replacing it under the same name.
- Background music may make it harder for the adult to hear the child; the music toggle mitigates this.
