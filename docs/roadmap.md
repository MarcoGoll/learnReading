# Roadmap - learnReading

## Vision / Goal

An interactive browser game that helps a child learn to read German. The game builds reading skills step by step - from single letters to syllables to simple words - and keeps the child motivated through two mechanisms:

1. **Highscore** - every correctly read item earns points; the child can try to beat the previous best score. Higher levels give more points per item.
2. **Dino evolution** - a dinosaur grows with the child's progress. Each completed level unlocks the next stage of its life, shown as a simple animated SVG:
   - Start: the dino is still in its egg
   - Level 1 done: the dino hatches and is a baby
   - Level 2 done: the baby dino takes its first steps
   - Level 3 done: the dino catches its first insect
   - ... further stages ...
   - Final level done: the dino is fully grown

Funny sounds (correct answer, wrong answer, dino evolution) and animations keep the child's attention.

## Target Audience

- **Player:** a child learning to read (the developer's son), looking at the screen and reading aloud.
- **Co-player / judge:** an adult sitting next to the child. The adult decides whether an item was read correctly or not. Every reading task must therefore offer the adult a clear way to mark the answer as **correct** or **wrong**.

## Game Concept (Level Structure)

The levels build on each other: only items the child mastered in one level are used in the next.

| Level | Task | Input | Points |
|-------|------|-------|--------|
| 1 | Select which letters the child knows; the child reads each letter aloud | Adult marks correct / wrong | Lowest |
| 2 | Syllables built from the correctly read letters of level 1 are read aloud | Adult marks correct / wrong | Higher |
| 3 | Syllables from level 2 are combined into simple words, which are read aloud | Adult marks correct / wrong | Higher |
| 4 | Syllables are combined into words via drag and drop | Drag and drop, validated | Higher |
| 5 | Several variants using the correct words from level 4 (e.g. reading sentences, word-picture matching) | Depends on variant | Highest |

## Tech Stack

| Area | Decision |
|------|----------|
| Language | JavaScript (ES modules), HTML, CSS (BEM naming) |
| Framework | None - vanilla HTML/CSS/JS, no build step |
| Platform | Web app in the browser (laptop and tablet, touch support for drag and drop) |
| Graphics / animation | Inline SVG with CSS/JS animations |
| Sound | Browser audio (audio files or Web Audio API - decided in `/spec`) |
| Persistence | `localStorage` in the browser (highscore, dino stage, learned letters/syllables/words); no server, no login |
| Deployment | Static hosting (e.g. GitHub Pages or Vercel), reachable via link |

## Rough Milestones / Phases

1. **Foundation** - project skeleton, start screen, game state and `localStorage` persistence, adult judge controls (correct / wrong).
2. **Level 1 - Letters** - letter selection, reading letters, scoring, passing known letters on.
3. **Dino and motivation** - dino stages as animated SVGs, evolution after each level, highscore display, sounds for correct / wrong / evolution.
4. **Levels 2 and 3 - Syllables and words** - generating syllables and simple words from mastered items, reading tasks with higher point values.
5. **Level 4 - Drag and drop** - building words from syllables via drag and drop (mouse and touch).
6. **Later levels and final dino stage** - level 5+ and the fully grown dino.
7. **Polish and deployment** - more animations and sounds, tablet usability, publishing via static hosting.

The individual epics are worked out in `/brainstorming`.

## Open Questions / Assumptions

- **Assumption:** the reading content is German (German letters including umlauts, German syllables and words).
- **Decided in /brainstorming:** level 5 is the final level and offers several variants; the dino gains exactly one stage per completed level and is fully grown after level 5.
- **Decided in /spec:** level 3 words come from a built-in list of about 200 words filtered by known syllables (WordReadingLevel).
- **Decided in /spec:** one record per level plus total points; reset in the protected parent area (ScoreAndHighscore, GameFoundation).
- **Decided in /spec:** free CC0 sound files plus switchable background music (SoundsAndEffects).
- **Decided in /spec:** hosting on Vercel with tests as a quality gate (Deployment).
- **Assumption:** one child per device; no user accounts or multiple profiles.
