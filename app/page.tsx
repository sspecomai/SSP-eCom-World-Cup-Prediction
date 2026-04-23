import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-5">
      <div className="card space-y-3">
        <p className="badge bg-danger/20 text-danger">World Cup 2026</p>
        <h1 className="text-4xl font-black">Supersports Thailand eCom Prediction Arena</h1>
        <p className="max-w-2xl text-silver">Join pre-questions, predict every stage, climb rankings, and compete with football fans in real-time.</p>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-xl bg-danger px-4 py-2 font-bold" href="/register">Start Playing</Link>
          <Link className="rounded-xl border border-white/20 px-4 py-2" href="/leaderboard">View Leaderboard</Link>
        </div>
      </div>
    </section>
  );
}
