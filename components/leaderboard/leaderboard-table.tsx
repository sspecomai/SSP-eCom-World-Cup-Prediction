import type { LeaderboardRow } from '@/lib/types';
import { Trophy, Medal, Award } from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
  rows: (LeaderboardRow & { rank: number })[];
  highlightUserId?: string;
};

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="flex items-center gap-1 rank-1 text-base">
      <Trophy size={16} className="text-gold" /> 1
    </div>
  );
  if (rank === 2) return (
    <div className="flex items-center gap-1 rank-2 text-base">
      <Medal size={16} className="text-silver" /> 2
    </div>
  );
  if (rank === 3) return (
    <div className="flex items-center gap-1 rank-3 text-base">
      <Award size={16} className="text-amber-600" /> 3
    </div>
  );
  return <span className="font-bold text-silver">#{rank}</span>;
}

export function LeaderboardTable({ rows, highlightUserId }: Props) {
  if (!rows.length) {
    return (
      <div className="card py-12 text-center text-silver">
        <Trophy size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-semibold">No scores yet. Be the first to predict!</p>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver/70">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver/70">
              Player
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-silver/70">
              Pre-Q
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-silver/70">
              Matches
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-silver/70">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isYou = row.user_id === highlightUserId;
            return (
              <tr
                key={row.user_id}
                className={clsx(
                  'table-row-hover',
                  isYou && 'bg-danger/10 border-l-2 border-danger'
                )}
              >
                <td className="px-4 py-3">
                  <RankCell rank={row.rank} />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-bold leading-none">{row.nickname}</p>
                    {row.favorite_team && (
                      <p className="mt-0.5 text-xs text-silver">
                        {row.favorite_team}
                      </p>
                    )}
                  </div>
                  {isYou && (
                    <span className="mt-1 inline-block badge-danger text-[10px]">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className="text-silver">{row.pre_question_score}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className="text-silver">{row.match_prediction_score}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span
                    className={clsx(
                      'text-lg font-black',
                      row.rank === 1
                        ? 'text-gold'
                        : row.rank === 2
                        ? 'text-silver'
                        : row.rank === 3
                        ? 'text-amber-600'
                        : 'text-white'
                    )}
                  >
                    {row.total_score}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
