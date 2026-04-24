import { createClient } from '@/lib/supabase/server';
import { MatchResultForm } from '@/components/admin/result-form';
import { PreQuestionResultForm } from '@/components/admin/result-form';
import { StageBadge } from '@/components/ui/stage-badge';
import { formatBangkokTime } from '@/lib/utils/time';
import type { MatchRecord, PreQuestion } from '@/lib/types';
import { CheckSquare, HelpCircle, Swords } from 'lucide-react';

export const metadata = { title: 'Admin: Publish Results · SSP WC2026 Predictor' };

export default async function AdminResultsPage() {
  const supabase = await createClient();

  const [matchesRes, questionsRes] = await Promise.all([
    supabase
      .from('matches_with_scoring')
      .select('*')
      .order('kickoff_at', { ascending: true }),
    supabase
      .from('pre_questions_with_scoring')
      .select('*')
      .order('close_at', { ascending: true }),
  ]);

  const matches = (matchesRes.data ?? []) as MatchRecord[];
  const questions = (questionsRes.data ?? []) as PreQuestion[];

  const unpublishedMatches = matches.filter((m) => !m.is_result_published);
  const publishedMatches = matches.filter((m) => m.is_result_published);
  const unpublishedQs = questions.filter((q) => !q.is_result_published);
  const publishedQs = questions.filter((q) => q.is_result_published);

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <CheckSquare size={22} className="text-emerald-400" />
        Publish Results & Score
      </h2>

      {/* ── Matches ── */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-lg">
          <Swords size={18} className="text-danger" />
          Match Results
          {unpublishedMatches.length > 0 && (
            <span className="badge-danger text-xs">{unpublishedMatches.length} pending</span>
          )}
        </h3>

        {unpublishedMatches.length === 0 ? (
          <div className="card py-6 text-center text-silver text-sm">
            All match results published.
          </div>
        ) : (
          <div className="space-y-3">
            {unpublishedMatches.map((m) => (
              <div key={m.id} className="card space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StageBadge stage={m.stage} />
                  <span className="font-bold">
                    {m.home_team} vs {m.away_team}
                  </span>
                  <span className="text-xs text-silver">
                    {formatBangkokTime(m.kickoff_at)}
                  </span>
                </div>
                <MatchResultForm match={m} />
              </div>
            ))}
          </div>
        )}

        {publishedMatches.length > 0 && (
          <details className="cursor-pointer">
            <summary className="text-sm text-silver hover:text-white">
              {publishedMatches.length} published result{publishedMatches.length !== 1 ? 's' : ''}
            </summary>
            <div className="mt-3 space-y-2">
              {publishedMatches.map((m) => (
                <div key={m.id} className="card py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <StageBadge stage={m.stage} />
                    <span className="ml-2 font-semibold text-sm">
                      {m.home_team} vs {m.away_team}
                    </span>
                  </div>
                  <span className="font-black text-emerald-400">
                    {m.final_home_score} – {m.final_away_score}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      {/* ── Pre-Questions ── */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-lg">
          <HelpCircle size={18} className="text-blue-400" />
          Pre-Question Results
          {unpublishedQs.length > 0 && (
            <span className="badge bg-blue-500/20 text-blue-400 text-xs">{unpublishedQs.length} pending</span>
          )}
        </h3>

        {unpublishedQs.length === 0 ? (
          <div className="card py-6 text-center text-silver text-sm">
            All pre-question results published.
          </div>
        ) : (
          <div className="space-y-3">
            {unpublishedQs.map((q) => (
              <div key={q.id} className="card space-y-3">
                <p className="font-semibold">{q.question_text}</p>
                <PreQuestionResultForm question={q} />
              </div>
            ))}
          </div>
        )}

        {publishedQs.length > 0 && (
          <details className="cursor-pointer">
            <summary className="text-sm text-silver hover:text-white">
              {publishedQs.length} published answer{publishedQs.length !== 1 ? 's' : ''}
            </summary>
            <div className="mt-3 space-y-2">
              {publishedQs.map((q) => (
                <div key={q.id} className="card py-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{q.question_text}</p>
                  <span className="font-bold text-emerald-400">{q.correct_answer}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>
    </div>
  );
}
