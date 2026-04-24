import type { MatchRecord, PreQuestion } from '@/lib/types';

export const sampleMatches: MatchRecord[] = [
  {
    id: 'm1',
    home_team: 'Thailand',
    away_team: 'Japan',
    kickoff_at: '2026-06-12T19:00:00+07:00',
    prediction_close_at: '2026-06-12T18:45:00+07:00',
    stage: 'group',
    final_home_score: 1,
    final_away_score: 1,
    is_result_published: true,
    scoring_mode: 'EXACT',
    correct_score: 8,
    wrong_score: -2,
    fallback_outcome_score: 3,
    allow_edit_before_timeout: true,
  },
  {
    id: 'm2',
    home_team: 'Brazil',
    away_team: 'Germany',
    kickoff_at: '2026-06-14T20:00:00+07:00',
    prediction_close_at: '2026-06-14T19:45:00+07:00',
    stage: 'group',
    final_home_score: null,
    final_away_score: null,
    is_result_published: false,
    scoring_mode: 'OUTCOME',
    correct_score: 4,
    wrong_score: -1,
    fallback_outcome_score: 0,
    allow_edit_before_timeout: true,
  },
];

export const samplePreQuestions: PreQuestion[] = [
  {
    id: 'pq1',
    question_text: 'Which team will score the first goal of the tournament?',
    answer_type: 'single_choice',
    open_at: '2026-05-20T08:00:00+07:00',
    close_at: '2026-06-10T23:59:00+07:00',
    correct_answer: null,
    score_correct: 10,
    score_wrong: -3,
    allow_edit_before_timeout: true,
    is_result_published: false,
  },
];
