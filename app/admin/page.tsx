import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Users, Swords, HelpCircle, CheckSquare } from 'lucide-react';

export const metadata = { title: 'Admin · SSP WC2026 Predictor' };

export default async function AdminPage() {
  const supabase = await createClient();

  const [usersRes, predsRes, answersRes, matchesRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('match_predictions').select('id', { count: 'exact', head: true }),
    supabase.from('pre_question_answers').select('id', { count: 'exact', head: true }),
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('is_result_published', true),
  ]);

  const stats = [
    {
      label: 'Total Users',
      value: usersRes.count ?? 0,
      icon: <Users size={22} className="text-blue-400" />,
      href: '/admin/users',
    },
    {
      label: 'Match Predictions',
      value: predsRes.count ?? 0,
      icon: <Swords size={22} className="text-danger" />,
      href: '/admin/matches',
    },
    {
      label: 'Pre-Q Answers',
      value: answersRes.count ?? 0,
      icon: <HelpCircle size={22} className="text-purple-400" />,
      href: '/admin/pre-questions',
    },
    {
      label: 'Published Results',
      value: matchesRes.count ?? 0,
      icon: <CheckSquare size={22} className="text-emerald-400" />,
      href: '/admin/results',
    },
  ];

  const quick = [
    { href: '/admin/pre-questions', label: 'Manage Pre-Questions', desc: 'Add, edit, and publish campaign questions.' },
    { href: '/admin/matches', label: 'Manage Matches', desc: 'Configure matches across all tournament stages.' },
    { href: '/admin/results', label: 'Publish Results', desc: 'Enter final scores and trigger automatic scoring.' },
    { href: '/admin/users', label: 'Manage Users', desc: 'Review players and manage admin roles.' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="card-hover space-y-2">
            {s.icon}
            <p className="text-3xl font-black">{s.value.toLocaleString()}</p>
            <p className="text-xs text-silver">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2">
        {quick.map((q) => (
          <Link key={q.href} href={q.href} className="card-hover space-y-1">
            <p className="font-bold">{q.label}</p>
            <p className="text-sm text-silver">{q.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
