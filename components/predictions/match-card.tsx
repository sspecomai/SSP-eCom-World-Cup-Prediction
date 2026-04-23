import { Countdown } from '@/components/ui/countdown';
import { formatBangkokTime } from '@/lib/utils/time';
import type { MatchRecord } from '@/lib/types';

export function MatchCard({ match }: { match: MatchRecord }) {
  return (
    <article className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="badge bg-white/10 text-silver">{match.stage.replaceAll('_', ' ')}</p>
        <Countdown closeAt={match.prediction_close_at} />
      </div>
      <h3 className="text-xl font-extrabold">
        {match.home_team} <span className="text-silver">vs</span> {match.away_team}
      </h3>
      <p className="text-sm text-silver">Kickoff (Asia/Bangkok): {formatBangkokTime(match.kickoff_at)}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p className="rounded-xl border border-white/10 p-2">Mode: {match.scoring_mode}</p>
        <p className="rounded-xl border border-white/10 p-2">Correct: {match.correct_score}</p>
      </div>
    </article>
  );
}
