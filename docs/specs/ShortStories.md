# Spec: ShortStories (Epic28)

## Overview / Goal

Content of the pterosaur journey: short stories of 3-4 sentences that the child reads sentence by sentence, followed by a comprehension question answered by choosing a picture.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Reading | Sentence by sentence; each sentence is read aloud and judged by the adult (JudgeControls); afterwards the whole story is shown with its picture | Manageable steps; same operation as before |
| Question | One question per story ("Was hat Oma gekocht?") with 3 pictures; checked automatically | The child must read the question; answering by picture needs no writing |
| Amount | 20 stories of 3-4 sentences about the dino, family, and everyday life; 2 stories per round | Enough variety without huge writing effort |
| Place | Pterosaur level 3 = reading stories (instead of single words); new adventure variant "Geschichte" in level 5 of this journey; levels 1, 2, 4 use words from the stories | Stories become the center of the last journey |
| Points | Each correct sentence 30 points (level 3) or 50 (level 5); correct question 50 / 50 points; streak bonus as usual | Consistent with ScoreAndHighscore |
| Goals | Level 3: 4 stories completed with the question answered correctly; level 5: 3 adventures as before (the story variant counts as an adventure) | Reading and understanding both count |

## Technical Details

### Data (`js/data/stories.js`)

```js
{
  id: 'st01',
  title: 'Rexi hat Hunger',
  sentences: ['Rexi hat Hunger.', 'Mama kocht Nudeln.', 'Rexi isst alles auf.'],
  picture: 'story-st01',
  question: { text: 'Was kocht Mama?', answer: 'nudel', options: ['nudel', 'tomate', 'kakao'] }
}
```

- Sentences may use words from all word lists plus sight words; new sight words needed for stories (e.g. "auf", "in", "zu", "sie", "er") are added to the sight word list and marked as before.
- `question.options` reference pictures (word pictures or new ones). About 20 story pictures plus missing option pictures are drawn in the existing style.
- The words of all stories form the word material of levels 1, 2, and 4 of this journey (letters/combinations of these words for level 1, their syllables for level 2, their nouns/verbs for level 4).

### Story round (`js/game/storyRunner.js`)

1. Title and story picture are shown.
2. Sentences one after another (reading round with JudgeControls, ReadAloudHelp after "wrong").
3. Whole story visible, then the question with 3 picture options (choice runner logic: correct highlighted, wrong wiggles).
4. History keys: `story:<id>` for the question result, `sentence:<storyId>-<n>` for sentences.

### Variant registration

`id: 'story'`, title "Geschichte", only available in the pterosaur journey.

## Acceptance Criteria

- The pterosaur level 3 shows stories sentence by sentence with judge controls, then the whole story and a picture question.
- A story counts as completed when its question is answered correctly; level 3 is completed after 4 completed stories.
- The "Geschichte" variant appears in level 5 only in the pterosaur journey.
- All story tokens are known words or sight words; every question option has a picture (unit tests).
- 20 stories with 3-4 sentences each exist.

## Open Risks / Assumptions

- Stories need some words with clusters that are not covered by the earlier lists (e.g. "Hunger"); these words are added to a story word list and marked as readable through their syllables.
- Writing 20 stories and drawing their pictures is a large part of the effort.

## Implementation Notes

- Story illustrations are composed of 1-2 existing word pictures shown side by side (e.g. Oma + Kuchen) instead of 20 separately drawn story pictures; the question options use word pictures as specified.
- Stories are written in the first person or with sight words, so the verbs of the word lists (first person, e.g. "koche") can be used; 21 additional sight words were added for the stories.
