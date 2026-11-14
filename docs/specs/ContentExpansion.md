# Spec: ContentExpansion (Epic32)

## Overview / Goal

The child sees the same words and sentences too often. The content is expanded strongly (target: ten times the current amount) so rounds feel varied for a long time.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Scope | About 10x where the learning structure allows it: Triceratops words, long-neck words, sentences of all journeys, and stories | More variety everywhere |
| T-Rex words | Only open syllables stay allowed; the list grows to as many real, child-friendly open-syllable words as German offers (target 400+) | The first journey must stay easy; 1800 such words do not exist |
| Pictures | About 60 new simple SVG pictures for common new nouns; all other new words come without a picture | Picture variants get more variety without endless drawing work |
| File size | Word, sentence, and story lists are split into several data files (max. 400 lines each) and merged in the existing modules | Keeps the file length rule |
| Stories | Same format as before (3-4 sentences, picture question with three picture word options) | No change to the story logic |
| Sight words | The story sight words get common function words (dann, zu, mein, heute, noch, wohin, ...) | Natural story sentences need them |
| Sentences | Generated once from curated, grammatical combinations and stored as static lists | Many correct sentences with little risk of mistakes |

## Technical Details

- Additional data files under `js/data/` (e.g. `wordsTriceratopsMore.js`), merged into the existing exports (`WORDS`, `WORDS_TRICERATOPS`, `WORDS_LONGNECK`, sentence and story lists).
- Ids of existing words and sentences stay unchanged (saved games reference them); new sentence ids continue the numbering.
- New syllables are derived from the words automatically (`js/data/syllables.js`).
- Tests are raised to the new minimum sizes.

## Acceptance Criteria

- T-Rex: at least 400 words, all of open syllables.
- Triceratops: at least 1000 words, each with a closed syllable or letter combination.
- Long-neck profile: at least 600 words with 3+ syllables or compound words.
- Sentences: at least 10x per journey list of the previous amount where words allow it (T-Rex at least 500, Triceratops at least 400, long-neck at least 300).
- Stories: 200, each valid as before.
- At least 60 new picture SVGs, every referenced picture exists.
- All existing tests pass with the raised minimums.
