import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { sortLeaderboard } from '@/lib/services/leaderboard';
import { Trophy, Swords, HelpCircle, User } from 'lucide-react';
import type { MatchPrediction, PreQuestionAnswer, MatchRecord, PreQuestion } from '@/lib/types';

export const metadata = { title: 'Dashboard · SSP WC2026 Predictor' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [profileRes, predictionsRes, answersRes, leaderboardRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('match_predictions')
      .select(`*, matches_with_scoring(*)`)
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(5),
    supabase
      .from('pre_question_answers')
      .select(`*, pre_questions(question_text, is_result_published, correct_answer)`)
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(5),
    supabase.from('leaderboard_summary').select('*'),
  ]);

  const profile = profileRes.data;
  const predictions = (predictionsRes.data ?? []) as (MatchPrediction & {
    matches_with_scoring: MatchRecord;
  })[];
  const answers = (answersRes.data ?? []) as (PreQuestionAnswer & {
    pre_questions: { question_text: string; is_result_published: boolean; correct_answer: string | null };
  })[];
  const leaderboard = sortLeaderboard(leaderboardRes.data ?? []);
  const myRank = leaderboard.find((r) => r.user_id === user.id);

  return (
    <div className="space-y-8">
      {/* ── Welcome ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">
            Welcome, {profile?.nickname ?? profile?.display_name ?? 'Champion'}!
          </h1>
          {profile?.football_alias && (
            <p className="text-silver italic">&ldquo;{profile.football_alias}&rdquo;</p>
          )}
        </div>
        <Link href="/profile" className="btn-secondary btn-sm flex items-center gap-1.5">
          <User size={15} /> Edit Profile
        </Link>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card text-center space-y-1">
          <p className="text-xs text-silver uppercase tracking-wider">Your Rank</p>
          {myRank ? (
            <p className="text-5xl font-black text-gold">#{myRank.rank}</p>
          ) : (
            <p className="text-5xl font-black text-silver">—</p>
          )}
        </div>
        <div className="card text-center space-y-1">
          <p className="text-xs text-silver uppercase tracking-wider">Total Points</p>
          <p className="text-5xl font-black">{myRank?.total_score ?? 0}</p>
        </div>
        <div className="card text-center space-y-1">
          <p className="text-xs text-silver uppercase tracking-wider">Predictions</p>
          <p className="text-5xl font-black">{predictions.length}</p>
        </div>
      </div>

      {/* ── Score breakdown ──────────────────────────────────────────────── */}
      {myRank && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card flex items-center gap-3">
            <HelpCircle className="text-blue-400 shrink-0" size={24} />
            <div>
              <p className="text-xs text-silver">Pre-Question Score</p>
              <p className="text-2xl font-black">{myRank.pre_question_score}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <Swords className="text-danger shrink-0" size={24} />
            <div>
              <p className="text-xs text-silver">Match Prediction Score</p>
              <p className="text-2xl font-black">{myRank.match_prediction_score}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent predictions ───────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Swords size={18} className="text-danger" /> Recent Predictions
          </h2>
          <Link href="/matches" className="text-sm text-danger hover:underline">
            View all →
          </Link>
        </div>

        {predictions.length === 0 ? (
          <div className="card py-8 text-center text-silver">
            <Swords size={32} className="mx-auto mb-2 opacity-30" />
            <p>No predictions yet.</p>
            <Link href="/matches" className="mt-3 inline-block btn-primary btn-sm">
              Predict Matches
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {predictions.map((pred) => {
              const match = pred.matches_with_scoring;
              return (
                <div
                  key={pred.match_id}
                  className="card flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {match?.home_team} vs {match?.away_team}
                    </p>
                    <p className="text-xs text-silver">
                      Pick: {pred.predicted_home_score} – {pred.predicted_away_score}
                    </p>
                  </div>
                  {pred.score != null ? (
                    <span
                      className={
                        pred.score > 0
                          ? 'font-black text-emerald-400'
                          : pred.score < 0
                          ? 'font-black text-danger'
                          : 'font-black text-silver'
                      }
                    >
                      {pred.score > 0 ? '+' : ''}{pred.score} pts
                    </span>
                  ) : (
                    <span className="badge-silver text-xs">Pending</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Recent answers ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2">
            <HelpCircle size={18} className="text-blue-400" /> Recent Answers
          </h2>
          <Link href="/pre-questions" className="text-sm text-danger hover:underline">
            View all →
          </Link>
        </div>

        {answers.length === 0 ? (
          <div className="card py-8 text-center text-silver">
            <HelpCircle size={32} className="mx-auto mb-2 opacity-30" />
            <p>No answers yet.</p>
            <Link href="/pre-questions" className="mt-3 inline-block btn-primary btn-sm">
              Answer Questions
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {answers.map((ans) => (
              <div
                key={ans.pre_question_id}
                className="card flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-semibold text-sm line-clamp-1">
                    {ans.pre_questions?.question_text}
                  </p>
                  <p className="text-xs text-silver">Answer: {ans.answer_value}</p>
                </div>
                {ans.score != null ? (
                  <span
                    className={
                      ans.score > 0
                        ? 'font-black text-emerald-400'
                        : ans.score < 0
                        ? 'font-black text-danger'
                        : 'font-black text-silver'
                    }
                  >
                    {ans.score > 0 ? '+' : ''}{ans.score} pts
                  </span>
                ) : (
                  <span className="badge-silver text-xs">Pending</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Leaderboard preview ──────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Trophy size={18} className="text-gold" /> Top Players
          </h2>
          <Link href="/leaderboard" className="text-sm text-danger hover:underline">
            Full leaderboard →
          </Link>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs text-silver/70">Rank</th>
                <th className="px-4 py-3 text-left text-xs text-silver/70">Player</th>
                <th className="px-4 py-3 text-right text-xs text-silver/70">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.slice(0, 5).map((row) => (
                <tr
                  key={row.user_id}
                  className={`border-t border-white/8 ${row.user_id === user.id ? 'bg-danger/8' : ''}`}
                >
                  <td className="px-4 py-2 font-bold text-silver">#{row.rank}</td>
                  <td className="px-4 py-2">
                    <span className="font-semibold">{row.nickname}</span>
                    {row.user_id === user.id && (
                      <span className="ml-2 text-xs text-danger">you</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-black">{row.total_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
