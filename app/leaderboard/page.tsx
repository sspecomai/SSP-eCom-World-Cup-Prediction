import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';

const rows = [
  { rank: 1, username: 'ThunderMessi', pre_score: 30, match_score: 58, total_score: 88 },
  { rank: 2, username: 'RedCaptain', pre_score: 25, match_score: 55, total_score: 80 },
  { rank: 3, username: 'GoalFalcon', pre_score: 28, match_score: 50, total_score: 78 }
];

export default function LeaderboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">Live Leaderboard</h1>
      <LeaderboardTable rows={rows} />
    </section>
  );
}
