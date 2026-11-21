# Spec: ReadTaskAloud (Epic52)

## Overview / Goal

On request, a math task is spoken aloud by the browser so the child can play the math world even while reading is still hard. A large speaker button next to each task is meant for the child.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Trigger | Large speaker button next to the task, for the child | The child can use it independently |
| Content | The task's speech text ("3 plus 4", "Wie viele Käfer sind das?", "3 plus wie viel ist 7?") | Natural spoken German instead of symbols |
| Availability | Hidden when the browser has no German voice (`hasGermanVoice`) | Same as the existing read-aloud help |
| After a mistake | After the second wrong attempt the solution is read aloud ("3 plus 4 ist 7") when the setting "Vorlesen nach Fehler" is on | Reuses the existing setting `readAloudAfterWrong` |
| Variants | Missing number and number line: the task text; memory: the last flipped card; number wall: the active brick ("8 plus wie viel ist 13?") | Every variant has a sensible spoken text |
| Automatic reading | No (only on request) | Keeps the child reading the task itself |

## Technical Details

- `js/game/readAloud.js` gets `createTaskSpeakerButton(getText)`: like `createReadAloudButton`, but with the BEM modifier `read-aloud-button--child` (large, min. 64 px, icon `volume_up` from Google Fonts icons in `assets/icons/`).
- `readAloudAfterWrong(text)` is reused for the solution text after the second wrong attempt.
- Speech texts come from `task.speech` (MathTaskEngine); solution text: `${task.speech} ist ${task.answer}` (for gap tasks: the full equation).
- Operators: `+` -> "plus", `-` -> "minus", `·` -> "mal", `:` -> "geteilt durch"; numbers are passed as digits (the German voice reads them correctly).
- Each math screen (`mathLevel.js`, variant screens) places the button in the task header.

## Acceptance Criteria

- Every math task shows a large speaker button when a German voice is available; tapping it reads the task.
- Without a German voice the button is hidden.
- After the second wrong attempt the solution is read aloud if "Vorlesen nach Fehler" is enabled and sounds are on.
- In every level 7 variant the button reads a meaningful text (task, active brick, or last flipped card).
- Unit tests cover the speech texts for all operations, gap tasks, and solution texts.
