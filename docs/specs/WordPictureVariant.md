# Spec: WordPictureVariant (Epic12)

## Overview / Goal

Level 5 variant: a learned word is shown; the child taps the matching picture out of three. This checks reading comprehension, not only pronunciation. The game validates automatically.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Task direction | Word shown, child picks a picture | The child must read the word to choose |
| Options | 3 pictures | Clear on tablet and laptop; guessing hardly pays off |
| Pictures | Own simple flat SVGs in the prehistoric-world style for about 60 nouns; list can grow | Consistent style, no license issues |
| Wrong choice | Wrong picture wiggles, correct picture lights up, task counts as wrong, next task | Prevents trial and error |
| Round size | 6 tasks | Similar length to other rounds |

## Technical Details

### Pictures

- SVG files under `assets/svg/pictures/<pictureId>.svg`, square viewBox (e.g. `0 0 200 200`), flat style, no text inside the picture.
- Referenced by the `picture` field in `js/data/words.js` (see WordReadingLevel).
- About 60 nouns get a picture, prioritized by how early they become buildable (very common syllables first: Mama, Papa, Oma, Opa, Auto, Sofa, Nase, Rose, Hose, Dose, Tomate, Lama, Limo, Salami, ...).
- A unit test checks that every `picture` reference has an existing file.

### Pure logic (`js/logic/wordPicture.js`, unit tested)

- `pictureTargets(wordMaterial, words)` -> learned nouns with a picture
- `buildTask(target, allPictureWords)` -> `{ word, options: shuffled([target, 2 distractors]) }`; distractors are random other pictured nouns (they do not need to be learned, since pictures need no reading)
- `buildRound(targets, size = 6)` -> random targets without repeats (repeats allowed only if fewer than 6 targets exist)

### Variant registration

`id: 'wordPicture'`, title "Wort und Bild"; available when at least 3 learned nouns have a picture.

### Display and flow

- Word large at the top (colored syllables), three picture cards below (BEM block `picture-choice`, element `__option`, modifiers `--correct`, `--wrong`).
- Tap -> correct: `correct` sound, stars, 50 base points (plus streak bonus); wrong: `wrong` sound, wiggle, correct card highlighted for about 1.5 s, streak reset.
- No JudgeControls; a small "Weiter" button for the adult skips a task.
- After 6 tasks, the round result goes to ChallengeLevel.

## Acceptance Criteria

- Each task shows a learned noun and three pictures, exactly one of them matching.
- A correct tap earns 50 points (plus streak bonus); a wrong tap shows the correct picture and earns nothing.
- A round has 6 tasks; the variant is greyed out if fewer than 3 learned nouns have pictures.
- All referenced picture files exist (unit test).
- Pictures share one consistent flat style.

## Open Risks / Assumptions

- Drawing about 60 SVG pictures is effortful; simple shapes are acceptable and can be improved later.
