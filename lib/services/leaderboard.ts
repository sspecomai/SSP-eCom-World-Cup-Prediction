import type { LeaderboardRow } from '@/lib/types';
import { rankWithTieBreak } from '@/lib/services/scoring';

export function sortLeaderboard(
  rows: LeaderboardRow[]
): (LeaderboardRow & { rank: number })[] {
  return rankWithTieBreak(
    rows.map((r) => ({
      ...r,
      exact_points: r.exact_result_points,
      outcome_points: r.outcome_points,
    }))
  );
}
