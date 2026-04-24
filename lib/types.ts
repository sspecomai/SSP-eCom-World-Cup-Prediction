export type Role = 'admin' | 'user';
export type Stage = 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';
export type PredictionMode = 'OUTCOME' | 'EXACT';
export type AnswerType = 'single_choice' | 'multi_choice' | 'text';

export const STAGE_LABELS: Record<Stage, string> = {
  group: 'Group Stage',
  round_of_16: 'Round of 16',
  quarter_final: 'Quarter-Final',
  semi_final: 'Semi-Final',
  final: 'Final',
};

export type Profile = {
  id: string;
  role_id: string;
  display_name: string;
  nickname: string;
  favorite_team: string | null;
  football_alias: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileWithRole = Profile & { role: Role };

export type ScoringRule = {
  id: string;
  context: 'pre_question' | 'match_prediction';
  prediction_mode: PredictionMode | null;
  score_correct: number;
  score_wrong: number;
  score_fallback: number;
  allow_edit_before_timeout: boolean;
  created_at: string;
  updated_at: string;
};

/** Match row — extra DB fields are optional so scoring utils stay test-friendly. */
export type MatchRecord = {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  prediction_close_at: string;
  stage: Stage;
  scoring_mode: PredictionMode;
  final_home_score: number | null;
  final_away_score: number | null;
  is_result_published: boolean;
  // DB-only
  is_locked?: boolean;
  scoring_rule_id?: string;
  created_at?: string;
  updated_at?: string;
  // Denormalised from scoring_rules
  correct_score: number;
  wrong_score: number;
  fallback_outcome_score: number;
  allow_edit_before_timeout?: boolean;
};

export type MatchPrediction = {
  id?: string;
  match_id: string;
  user_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  score?: number | null;
  submitted_at: string;
  updated_at?: string;
};

/** Pre-question row — extra DB fields optional to keep mock/test data lean. */
export type PreQuestion = {
  id: string;
  question_text: string;
  answer_type: AnswerType;
  open_at: string;
  close_at: string;
  correct_answer: string | null;
  is_result_published: boolean;
  // DB-only
  is_locked?: boolean;
  scoring_rule_id?: string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  // Denormalised from scoring_rules
  score_correct: number;
  score_wrong: number;
  allow_edit_before_timeout: boolean;
};

export type PreQuestionOption = {
  id: string;
  pre_question_id: string;
  option_text: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type PreQuestionAnswer = {
  id?: string;
  pre_question_id: string;
  user_id: string;
  answer_value: string;
  score?: number | null;
  submitted_at: string;
  updated_at?: string;
};

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  nickname: string;
  favorite_team: string | null;
  avatar_url: string | null;
  pre_question_score: number;
  match_prediction_score: number;
  total_score: number;
  exact_result_points: number;
  outcome_points: number;
  first_submission_at: string;
  rank?: number;
};

export type AdminStats = {
  total_users: number;
  total_predictions: number;
  total_answers: number;
  published_matches: number;
};
