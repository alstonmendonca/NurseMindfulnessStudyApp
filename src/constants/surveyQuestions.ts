export interface SurveyQuestion {
  id: string;
  text: string;
  options: string[];
  reverse?: boolean;
}

// PSS-4 (Perceived Stress Scale - 4 items)
export const PSS4_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'pss1',
    text: 'In the last week, how often have you felt that you were unable to control the important things in your life?',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
  },
  {
    id: 'pss2',
    text: 'In the last week, how often have you felt confident about your ability to handle your personal problems?',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
    reverse: true,
  },
  {
    id: 'pss3',
    text: 'In the last week, how often have you felt that things were going your way?',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
    reverse: true,
  },
  {
    id: 'pss4',
    text: 'In the last week, how often have you felt difficulties were piling up so high that you could not overcome them?',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
  },
];

// Brief COPE (selected items)
export const COPE_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'cope1',
    text: "I've been turning to work or other activities to take my mind off things.",
    options: ['Not at all', 'A little bit', 'Moderately', 'A lot'],
  },
  {
    id: 'cope2',
    text: "I've been getting emotional support from others.",
    options: ['Not at all', 'A little bit', 'Moderately', 'A lot'],
  },
  {
    id: 'cope3',
    text: "I've been taking action to try to make the situation better.",
    options: ['Not at all', 'A little bit', 'Moderately', 'A lot'],
  },
  {
    id: 'cope4',
    text: "I've been getting help and advice from other people.",
    options: ['Not at all', 'A little bit', 'Moderately', 'A lot'],
  },
  {
    id: 'cope5',
    text: "I've been trying to see it in a different light, to make it seem more positive.",
    options: ['Not at all', 'A little bit', 'Moderately', 'A lot'],
  },
  {
    id: 'cope6',
    text: "I've been accepting the reality of the fact that it has happened.",
    options: ['Not at all', 'A little bit', 'Moderately', 'A lot'],
  },
];

// WHO-5 Well-Being Index
export const WHO5_QUESTIONS = [
  {
    id: 'who1',
    text: 'I have felt cheerful and in good spirits',
    options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time'],
  },
  {
    id: 'who2',
    text: 'I have felt calm and relaxed',
    options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time'],
  },
  {
    id: 'who3',
    text: 'I have felt active and vigorous',
    options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time'],
  },
  {
    id: 'who4',
    text: 'I woke up feeling fresh and rested',
    options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time'],
  },
  {
    id: 'who5',
    text: 'My daily life has been filled with things that interest me',
    options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time'],
  },
];
