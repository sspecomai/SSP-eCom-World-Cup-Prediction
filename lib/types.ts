export type Role = 'admin' | 'user';

export type Stage = 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';

export type PredictionMode = 'OUTCOME' | 'EXACT';

export type MatchRecord = {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  prediction_close_at: string;
  stage: Stage;
  final_home_score: number | null;
  final_away_score: number | null;
  is_result_published: boolean;
  scoring_mode: PredictionMode;
  correct_score: number;
  wrong_score: number;
  fallback_outcome_score: number;
};

export type MatchPrediction = {
  match_id: string;
  user_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  submitted_at: string;
};

export type PreQuestion = {
  id: string;
  question_text: string;
  answer_type: 'single_choice' | 'multi_choice' | 'text';
  open_at: string;
  close_at: string;
  correct_answer: string | null;
  score_correct: number;
  score_wrong: number;
  allow_edits_before_timeout: boolean;
  is_result_published: boolean;
};
