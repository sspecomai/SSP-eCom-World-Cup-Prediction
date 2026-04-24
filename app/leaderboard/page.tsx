import { createClient } from '@/lib/supabase/server';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { sortLeaderboard } from '@/lib/services/leaderboard';
import { Trophy } from 'lucide-react';

export const metadata = { title: 'Leaderboard · SSP WC2026 Predictor' };
export const revalidate = 30;

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const [{ data: { user } }, { data: rows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('leaderboard_summary').select('*'),
  ]);

  const ranked = sortLeaderboard(rows ?? []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15">
          <Trophy size={24} className="text-gold" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Live Leaderboard</h1>
          <p className="text-sm text-silver">
            {ranked.length} player{ranked.length !== 1 ? 's' : ''} competing
          </p>
        </div>
      </div>

      {/* Top 3 podium (if enough players) */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[ranked[1], ranked[0], ranked[2]].map((row, podiumIdx) => {
            const positions = [2, 1, 3];
            const pos = positions[podiumIdx];
            const heights = ['h-24', 'h-32', 'h-20'];
            const colors = ['bg-silver/15', 'bg-gold/15', 'bg-amber-700/15'];
            const textColors = ['text-silver', 'text-gold', 'text-amber-600'];
            return (
              <div
                key={row.user_id}
                className={`card flex flex-col items-center justify-end gap-1 ${heights[podiumIdx]} ${colors[podiumIdx]} border-0`}
              >
                <span className={`text-2xl font-black ${textColors[podiumIdx]}`}>
                  #{pos}
                </span>
                <p className="text-xs font-bold text-center line-clamp-1">{row.nickname}</p>
                <p className={`text-sm font-black ${textColors[podiumIdx]}`}>
                  {row.total_score}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <LeaderboardTable rows={ranked} highlightUserId={user?.id} />

      {ranked.length > 0 && (
        <p className="text-center text-xs text-silver">
          Tie-break: exact score pts → outcome pts → earliest submission
        </p>
      )}
    </div>
  );
}
