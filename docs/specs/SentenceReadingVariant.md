# Spec: SentenceReadingVariant (Epic11)

## Overview / Goal

Level 5 variant: the child reads short sentences aloud that consist of learned words plus a small set of marked sight words. The adult judges each sentence as correct or wrong.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Function words | A fixed list of about 15 sight words ("Merkwörter") may appear in sentences, visually marked (grey background) | Function words like "ich", "ist", "und" cannot be built from open syllables; sight words are common practice in German primary schools |
| Sentence source | Built-in list of about 80 short, grammatically correct sentences, filtered to sentences whose non-sight words are all in the child's word material | Always correct German |
| Judgement | Whole sentence correct / wrong via JudgeControls | Same operation as in levels 1-3 |
| Size | Sentences of 2-4 words; 5 sentences per round | Short tasks for beginning readers |

## Technical Details

### Shared data (also used by GapSentenceVariant and SentenceBuilderVariant)

`js/data/sightWords.js`:

```js
['ich', 'du', 'die', 'der', 'das', 'ist', 'und', 'ein', 'eine', 'hat', 'im', 'mit', 'da', 'wo', 'so']
```

`js/data/sentences.js`:

```js
{ id: 's01', text: 'Ich male.',            tokens: ['ich', 'male'] }
{ id: 's02', text: 'Mama ist da.',         tokens: ['mama', 'ist', 'da'] }
{ id: 's03', text: 'Ich lese leise.',      tokens: ['ich', 'lese', 'leise'] }
{ id: 's04', text: 'Oma hat eine Tomate.', tokens: ['oma', 'hat', 'eine', 'tomate'] }
```

- `tokens` are lowercase ids: either word ids from `words.js` or sight words.
- Every sentence contains at least one word from `words.js` and 2-4 tokens.
- A unit test validates that every token exists in `words.js` or `sightWords.js` and that the list has about 80 entries.

### Pure logic (`js/logic/sentences.js`, unit tested)

- `availableSentences(wordMaterial, sentences, sightWords)` -> sentences whose word tokens are all in the material (`pools.builtWords` plus, if needed, `pools.words`, as defined in ChallengeLevel)
- `buildRound(available, size = 5)` -> random selection without repeats

### Variant registration

`id: 'sentenceReading'`, title "Sätze lesen", `minWords` / availability: at least 5 available sentences.

### Display

The sentence is shown large in Andika; learned words with alternating colored syllables (as in level 3); sight words with a grey background (`sentence-card__token--sight`). BEM block: `sentence-card`.

### Flow

Round of 5 sentences -> JudgeControls (correct / wrong / skip / not yet / undo) -> 50 base points per correct sentence (plus streak bonus) -> round result to ChallengeLevel.

## Acceptance Criteria

- Only sentences whose learned-word tokens are in the child's word material appear.
- Sight words are visually marked; learned words show colored syllables.
- A round has 5 sentences of 2-4 words; each is judged as a whole.
- Each correct sentence earns 50 points (plus streak bonus).
- The variant card is greyed out if fewer than 5 sentences are available.
- Unit tests validate the sentence list and the filter logic.

## Open Risks / Assumptions

- With a small word pool, few sentences may be available; the list should favor very common words (Mama, Papa, Oma, Opa, male, lese).
- Some adjectives only exist in open-syllable forms with -e (rote, leise), which limits predicative sentences ("Die Rose ist rot." needs "rot", a closed syllable); sentences are written around this limitation.
