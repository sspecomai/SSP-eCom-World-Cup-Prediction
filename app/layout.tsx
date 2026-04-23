import './globals.css';
import type { Metadata } from 'next';
import { SiteShell } from '@/components/layout/site-shell';

export const metadata: Metadata = {
  title: 'Supersports Thailand eCom - World Cup 2026 Predictor',
  description: 'Competitive prediction platform with leaderboard and admin controls.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
