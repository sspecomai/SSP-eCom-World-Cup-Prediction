import type { MatchRecord, MatchPrediction } from '@/lib/types';

type Outcome = 'H' | 'D' | 'A';

function getOutcome(home: number, away: number): Outcome {
  if (home > away) return 'H';
  if (home < away) return 'A';
  return 'D';
}

export type ScoreResult = {
  points: number;
  reason: 'exact' | 'outcome' | 'wrong';
};

export function scoreMatchPrediction(
  match: Pick<
    MatchRecord,
    | 'final_home_score'
    | 'final_away_score'
    | 'scoring_mode'
    | 'correct_score'
    | 'wrong_score'
    | 'fallback_outcome_score'
  >,
  prediction: Pick<MatchPrediction, 'predicted_home_score' | 'predicted_away_score'>
): ScoreResult {
  const { final_home_score: fh, final_away_score: fa } = match;

  if (fh === null || fa === null) {
    return { points: 0, reason: 'wrong' };
  }

  const ph = prediction.predicted_home_score;
  const pa = prediction.predicted_away_score;

  if (match.scoring_mode === 'EXACT') {
    if (ph === fh && pa === fa) {
      return { points: match.correct_score, reason: 'exact' };
    }
    if (getOutcome(ph, pa) === getOutcome(fh, fa)) {
      return { points: match.fallback_outcome_score, reason: 'outcome' };
    }
    return { points: match.wrong_score, reason: 'wrong' };
  }

  // OUTCOME mode
  if (getOutcome(ph, pa) === getOutcome(fh, fa)) {
    return { points: match.correct_score, reason: 'outcome' };
  }
  return { points: match.wrong_score, reason: 'wrong' };
}

export type RankInput = {
  total_score: number;
  exact_points: number;
  outcome_points: number;
  first_submission_at: string;
  [key: string]: unknown;
};

export type RankedRow<T extends RankInput> = T & { rank: number };

export function rankWithTieBreak<T extends RankInput>(rows: T[]): RankedRow<T>[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    if (b.exact_points !== a.exact_points) return b.exact_points - a.exact_points;
    if (b.outcome_points !== a.outcome_points) return b.outcome_points - a.outcome_points;
    return (
      new Date(a.first_submission_at).getTime() -
      new Date(b.first_submission_at).getTime()
    );
  });

  let rank = 1;
  return sorted.map((row, idx) => {
    if (idx > 0) {
      const prev = sorted[idx - 1];
      const sameRank =
        row.total_score === prev.total_score &&
        row.exact_points === prev.exact_points &&
        row.outcome_points === prev.outcome_points;
      if (!sameRank) rank = idx + 1;
    }
    return { ...row, rank };
  });
}
