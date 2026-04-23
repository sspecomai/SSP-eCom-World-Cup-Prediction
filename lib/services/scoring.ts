import type { MatchPrediction, MatchRecord } from '@/lib/types';

const outcome = (home: number, away: number) => {
  if (home > away) return 'HOME';
  if (home < away) return 'AWAY';
  return 'DRAW';
};

export const scoreMatchPrediction = (match: MatchRecord, prediction: MatchPrediction) => {
  if (!match.is_result_published || match.final_home_score === null || match.final_away_score === null) {
    return { points: null as number | null, reason: 'Result pending' };
  }

  const isExact =
    prediction.predicted_home_score === match.final_home_score &&
    prediction.predicted_away_score === match.final_away_score;

  const predictedOutcome = outcome(prediction.predicted_home_score, prediction.predicted_away_score);
  const actualOutcome = outcome(match.final_home_score, match.final_away_score);

  if (match.scoring_mode === 'OUTCOME') {
    return isExact || predictedOutcome === actualOutcome
      ? { points: match.correct_score, reason: 'Correct outcome' }
      : { points: match.wrong_score, reason: 'Wrong outcome' };
  }

  if (isExact) return { points: match.correct_score, reason: 'Exact score' };
  if (predictedOutcome === actualOutcome) {
    return { points: match.fallback_outcome_score, reason: 'Fallback outcome points' };
  }

  return { points: match.wrong_score, reason: 'Incorrect prediction' };
};

export const rankWithTieBreak = <T extends { total_score: number; exact_points: number; outcome_points: number; first_submission_at: string }>(rows: T[]) => {
  return [...rows]
    .sort((a, b) => {
      if (b.total_score !== a.total_score) return b.total_score - a.total_score;
      if (b.exact_points !== a.exact_points) return b.exact_points - a.exact_points;
      if (b.outcome_points !== a.outcome_points) return b.outcome_points - a.outcome_points;
      return new Date(a.first_submission_at).getTime() - new Date(b.first_submission_at).getTime();
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
};
