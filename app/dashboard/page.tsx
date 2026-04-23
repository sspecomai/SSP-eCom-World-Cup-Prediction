export default function DashboardPage() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="card"><p className="text-sm text-silver">Your Rank</p><p className="text-4xl font-black">#12</p></article>
      <article className="card"><p className="text-sm text-silver">Total Points</p><p className="text-4xl font-black">64</p></article>
      <article className="card"><p className="text-sm text-silver">Predictions Submitted</p><p className="text-4xl font-black">17</p></article>
    </section>
  );
}
