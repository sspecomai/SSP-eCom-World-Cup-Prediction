import { describe, expect, it } from 'vitest';
import { rankWithTieBreak, scoreMatchPrediction } from '@/lib/services/scoring';
import type { MatchPrediction, MatchRecord } from '@/lib/types';

const baseMatch: MatchRecord = {
  id: '1',
  home_team: 'A',
  away_team: 'B',
  kickoff_at: '2026-01-01T00:00:00Z',
  prediction_close_at: '2025-12-31T23:00:00Z',
  stage: 'group',
  final_home_score: 2,
  final_away_score: 1,
  is_result_published: true,
  scoring_mode: 'EXACT',
  correct_score: 8,
  wrong_score: -2,
  fallback_outcome_score: 3
};

const prediction: MatchPrediction = {
  match_id: '1',
  user_id: 'u1',
  predicted_home_score: 2,
  predicted_away_score: 1,
  submitted_at: '2026-01-01T00:00:00Z'
};

describe('scoreMatchPrediction', () => {
  it('returns exact points', () => {
    const result = scoreMatchPrediction(baseMatch, prediction);
    expect(result.points).toBe(8);
  });

  it('returns fallback points for correct outcome in exact mode', () => {
    const result = scoreMatchPrediction(baseMatch, { ...prediction, predicted_home_score: 3, predicted_away_score: 0 });
    expect(result.points).toBe(3);
  });
});

describe('rankWithTieBreak', () => {
  it('ranks by total then exact then outcome then earlier submission', () => {
    const rows = rankWithTieBreak([
      { total_score: 10, exact_points: 5, outcome_points: 3, first_submission_at: '2026-06-01T10:00:00Z', name: 'B' },
      { total_score: 10, exact_points: 6, outcome_points: 2, first_submission_at: '2026-06-01T12:00:00Z', name: 'A' }
    ]);

    expect(rows[0].name).toBe('A');
    expect(rows[0].rank).toBe(1);
  });
});
