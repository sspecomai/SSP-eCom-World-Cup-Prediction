import './globals.css';
import type { Metadata, Viewport } from 'next';
import { SiteShell } from '@/components/layout/site-shell';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Supersports Thailand × World Cup 2026 Predictor',
  description:
    'Pick match scores, answer pre-tournament questions, and climb the leaderboard in the Supersports Thailand World Cup 2026 Prediction Game.',
  openGraph: {
    title: 'SSP WC2026 Predictor',
    description: 'Play, predict, and win with Supersports Thailand.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#060d1a',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('display_name, nickname, avatar_url, roles(role)')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const isAdmin =
    (profile?.roles as unknown as { role: string } | null)?.role === 'admin';

  return (
    <html lang="en" className="dark">
      <body>
        <SiteShell user={user} profile={profile} isAdmin={isAdmin}>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
