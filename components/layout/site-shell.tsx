import Link from 'next/link';
import type { PropsWithChildren } from 'react';

const links = [
  ['/', 'Home'],
  ['/pre-questions', 'Pre-Questions'],
  ['/predictions', 'Predictions'],
  ['/leaderboard', 'Leaderboard'],
  ['/dashboard', 'Dashboard'],
  ['/admin', 'Admin']
];

export function SiteShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-stadium-glow">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
          <p className="text-lg font-black tracking-wide text-danger">SUPERSports WC26 Predictor</p>
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
