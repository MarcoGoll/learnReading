# Spec: LongWords (Epic27)

## Overview / Goal

Content of the long-neck journey: words with 3-4 syllables and compound words (Haus-tür, Schnee-mann). The child learns to read longer words syllable by syllable and sees how words are combined.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Words | About 100 words: 3-4-syllable words (Ba-na-ne, Scho-ko-la-de, Lo-ko-mo-ti-ve) and compound words (Haus-tür, Schnee-mann, Dino-Ei) | Natural next step after short words |
| Level 1 | Warm-up: random mix of already mastered letters and combinations; goal 8 | Short review before the long words |
| Level 2 | Mix of open and closed syllables from the long words; goal: syllables for 5 long words | Prepares exactly the syllables that are needed |
| Level 3 | Read long words; goal 5 | Same structure as before |
| Level 4 | Long words are built from syllables; compound words are built from their two part words (Haus + Tür), with the pictures of both parts | Shows the principle of word formation |
| Level 5 | Adventures with long words; about 30 sentences with long words | Same variants, harder words |
| Reading aid | Colored syllables; in compound words a small gap or dot between the part words | Makes the parts visible |

## Technical Details

### Data (`js/data/wordsLongneck.js`)

- Same spec format plus an optional `parts` field for compound words:
  ```js
  { id: 'haustuer', display: 'Haustür', syllables: ['haus', 'tür'], parts: ['haus', 'tuer'], type: 'noun', picture: 'haustuer' }
  ```
- `parts` reference words (from any word list) with pictures where available; the build task uses them as tiles.
- About 100 words; about 25 new pictures for the most important nouns and parts.
- About 30 sentences in `js/data/sentencesLongneck.js`.

### Level 4 build task for compound words

- `buildTask` checks `word.parts`: if present, the tiles are the part words (plus 1 distractor part word) and the slots equal the number of parts; the pictures of both parts are shown above the slots.
- Otherwise the existing syllable build (3-4 slots, 1-2 distractors).

### Display

- Long words use a smaller base font size (`item-card--long`) so they fit on a phone.
- Compound words: `item-card__part-gap` between the parts.

## Acceptance Criteria

- The long-neck journey uses only the long-word content in levels 2-5 and a mixed review in level 1.
- Compound words are built from part words with pictures; other long words from syllables.
- Long words fit on a phone screen without horizontal scrolling.
- Every word of the list consists of known syllables; every `parts` reference exists (unit tests).

## Open Risks / Assumptions

- Some long words contain consonant clusters (e.g. "Schnee"); the list only uses clusters that are covered by the letter combinations or single letters.

## Implementation Notes

- The long-neck profile uses 62 new long and compound words plus all 3+ syllable words of the earlier lists (98 words in total).
- Compound words are only those that are written exactly as their two part words (no linking -n- or -s-), so that they can be built from the part words.
