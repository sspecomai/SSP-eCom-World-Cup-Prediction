import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Swords, HelpCircle, Zap, Star, Users } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-16">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-hero-gradient px-6 py-16 text-center md:py-24">
        {/* Background accent */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full bg-danger/10 blur-3xl" />
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger">
            <Zap size={14} className="fill-danger" />
            World Cup 2026 · Official Prediction Game
          </div>

          <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
            <span className="text-white">SUPERSPORTS</span>
            <br />
            <span className="text-danger">WC 2026</span>
            <br />
            <span className="text-white text-4xl md:text-5xl">PREDICTION ARENA</span>
          </h1>

          <p className="mx-auto max-w-xl text-silver text-lg">
            Predict match scores, answer pre-tournament questions, and battle
            for the top spot on the live leaderboard.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {user ? (
              <>
                <Link href="/matches" className="btn-primary text-base px-7 py-3">
                  <Swords size={18} /> Predict Matches
                </Link>
                <Link href="/leaderboard" className="btn-secondary text-base px-7 py-3">
                  <Trophy size={18} /> Leaderboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn-primary text-base px-7 py-3">
                  <Zap size={18} /> Join for Free
                </Link>
                <Link href="/login" className="btn-secondary text-base px-7 py-3">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-center text-2xl font-black">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <HelpCircle size={28} className="text-blue-400" />,
              title: 'Answer Pre-Questions',
              desc: 'Test your football knowledge with tournament questions before the games kick off.',
            },
            {
              icon: <Swords size={28} className="text-danger" />,
              title: 'Predict Match Scores',
              desc: 'Pick exact scores or win/draw/lose outcomes for every stage from groups to the final.',
            },
            {
              icon: <Trophy size={28} className="text-gold" />,
              title: 'Climb the Leaderboard',
              desc: 'Earn points for correct predictions. Tie-breaks reward precision and early submissions.',
            },
          ].map((item) => (
            <div key={item.title} className="card-hover space-y-3 text-center">
              <div className="flex justify-center">{item.icon}</div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-silver">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scoring overview ─────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-center text-2xl font-black">Scoring System</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-gold" />
              <h3 className="font-bold">Exact Score Mode</h3>
            </div>
            <ul className="space-y-2 text-sm text-silver">
              <li className="flex justify-between">
                <span>Exact score</span>
                <span className="font-bold text-emerald-400">+8 pts</span>
              </li>
              <li className="flex justify-between">
                <span>Correct outcome (not exact)</span>
                <span className="font-bold text-blue-400">+3 pts</span>
              </li>
              <li className="flex justify-between">
                <span>Wrong outcome</span>
                <span className="font-bold text-danger">−2 pts</span>
              </li>
            </ul>
          </div>
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <Swords size={18} className="text-danger" />
              <h3 className="font-bold">Outcome Mode</h3>
            </div>
            <ul className="space-y-2 text-sm text-silver">
              <li className="flex justify-between">
                <span>Correct win / draw / lose</span>
                <span className="font-bold text-emerald-400">+4 pts</span>
              </li>
              <li className="flex justify-between">
                <span>Wrong outcome</span>
                <span className="font-bold text-danger">−1 pt</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="card text-sm text-silver space-y-1">
          <p className="font-semibold text-white">Tie-break rules (in order):</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Most exact-result points</li>
            <li>Most win/draw/lose points</li>
            <li>Earliest first submission</li>
          </ol>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {!user && (
        <section className="rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center space-y-4">
          <Users size={32} className="mx-auto text-danger" />
          <h2 className="text-2xl font-black">Ready to compete?</h2>
          <p className="text-silver">Register for free and start predicting today.</p>
          <Link href="/register" className="btn-primary inline-flex text-base px-8 py-3">
            Create Account
          </Link>
        </section>
      )}
    </div>
  );
}
