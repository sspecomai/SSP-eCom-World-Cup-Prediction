type Row = {
  rank: number;
  username: string;
  pre_score: number;
  match_score: number;
  total_score: number;
};

export function LeaderboardTable({ rows }: { rows: Row[] }) {
  if (!rows.length) return <div className="card">No leaderboard data yet.</div>;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead className="text-xs uppercase text-silver">
          <tr>
            <th className="p-2">Rank</th>
            <th className="p-2">User</th>
            <th className="p-2">Pre-Q</th>
            <th className="p-2">Matches</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rank} className="border-t border-white/10">
              <td className="p-2 font-black text-danger">#{row.rank}</td>
              <td className="p-2">{row.username}</td>
              <td className="p-2">{row.pre_score}</td>
              <td className="p-2">{row.match_score}</td>
              <td className="p-2 font-bold">{row.total_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
