import Link from 'next/link';

const links = [
  ['/admin/pre-questions', 'Manage Pre-Questions'],
  ['/admin/matches', 'Manage Matches'],
  ['/admin/results', 'Publish Results'],
  ['/admin/users', 'Manage Users']
];

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="card"><p className="text-sm text-silver">Total Users</p><p className="text-4xl font-black">1,248</p></article>
        <article className="card"><p className="text-sm text-silver">Total Submissions</p><p className="text-4xl font-black">11,507</p></article>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="card font-semibold hover:border-danger/70">{label}</Link>
        ))}
      </div>
    </section>
  );
}
