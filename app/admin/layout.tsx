import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Shield, HelpCircle, Swords, CheckSquare, Users } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { clsx } from 'clsx';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview', icon: <Shield size={16} />, exact: true },
  { href: '/admin/pre-questions', label: 'Pre-Questions', icon: <HelpCircle size={16} /> },
  { href: '/admin/matches', label: 'Matches', icon: <Swords size={16} /> },
  { href: '/admin/results', label: 'Results', icon: <CheckSquare size={16} /> },
  { href: '/admin/users', label: 'Users', icon: <Users size={16} /> },
];

export default async function AdminLayout({ children }: PropsWithChildren) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('roles(role)')
    .eq('id', user.id)
    .single();

  const role = (profile?.roles as unknown as { role: string } | null)?.role;
  if (role !== 'admin') redirect('/dashboard');

  return (
    <div className="space-y-6">
      {/* Admin header */}
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/20">
          <Shield size={20} className="text-danger" />
        </div>
        <h1 className="text-2xl font-black">Admin Panel</h1>
        <span className="badge-danger ml-2">Admin</span>
      </div>

      {/* Admin nav */}
      <nav className="flex flex-wrap gap-2">
        {ADMIN_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-silver transition-colors hover:border-danger/40 hover:text-white"
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
