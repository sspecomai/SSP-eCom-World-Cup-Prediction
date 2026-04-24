'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import type { User } from '@supabase/supabase-js';
import { signOut } from '@/app/actions/auth';
import { Trophy, Zap, Shield, LayoutDashboard, HelpCircle, Swords, LogIn, UserPlus, LogOut } from 'lucide-react';
import { clsx } from 'clsx';

type NavLink = [href: string, label: string, icon: React.ReactNode, adminOnly?: boolean];

const NAV_LINKS: NavLink[] = [
  ['/', 'Home', <Zap key="home" size={15} />],
  ['/pre-questions', 'Pre-Questions', <HelpCircle key="pq" size={15} />],
  ['/matches', 'Matches', <Swords key="matches" size={15} />],
  ['/leaderboard', 'Leaderboard', <Trophy key="lb" size={15} />],
  ['/dashboard', 'My Game', <LayoutDashboard key="dash" size={15} />],
  ['/admin', 'Admin', <Shield key="admin" size={15} />, true],
];

type Props = PropsWithChildren<{
  user: User | null;
  profile: { display_name: string; nickname: string; avatar_url: string | null } | null;
  isAdmin: boolean;
}>;

export function SiteShell({ children, user, profile, isAdmin }: Props) {
  const pathname = usePathname();

  const visibleLinks = NAV_LINKS.filter(([, , , adminOnly]) => !adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-pitch">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-pitch/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="text-danger font-black text-lg leading-none tracking-tight">
              SSP<span className="text-white">×</span>WC26
            </span>
          </Link>

          {/* Nav links — hidden on mobile, visible md+ */}
          <nav className="hidden md:flex flex-1 items-center gap-1">
            {visibleLinks.map(([href, label, icon]) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-danger/15 text-danger'
                      : 'text-silver hover:text-white hover:bg-white/10'
                  )}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Auth area */}
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-silver">
                  {profile?.nickname ?? profile?.display_name ?? user.email?.split('@')[0]}
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="btn-ghost btn-sm flex items-center gap-1.5 text-sm"
                  >
                    <LogOut size={15} />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost btn-sm flex items-center gap-1.5 text-sm">
                  <LogIn size={15} /> Login
                </Link>
                <Link href="/register" className="btn-primary btn-sm text-sm">
                  <UserPlus size={14} /> Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden overflow-x-auto gap-1 px-4 pb-2 scrollbar-hide">
          {visibleLinks.map(([href, label, icon]) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-danger/15 text-danger'
                    : 'text-silver hover:text-white hover:bg-white/10'
                )}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 mt-12 py-6 text-center text-xs text-silver/60">
        © 2026 Supersports Thailand · World Cup 2026 Prediction Game
      </footer>
    </div>
  );
}
