import { createClient } from '@/lib/supabase/server';
import { MatchForm } from '@/components/admin/match-form';
import { deleteMatch } from '@/app/actions/admin';
import { StageBadge } from '@/components/ui/stage-badge';
import { formatBangkokTime } from '@/lib/utils/time';
import type { MatchRecord, ScoringRule } from '@/lib/types';
import { Trash2, CheckCircle, Clock } from 'lucide-react';

export const metadata = { title: 'Admin: Matches · SSP WC2026 Predictor' };

export default async function AdminMatchesPage() {
  const supabase = await createClient();

  const [matchesRes, rulesRes] = await Promise.all([
    supabase
      .from('matches_with_scoring')
      .select('*')
      .order('kickoff_at', { ascending: true }),
    supabase.from('scoring_rules').select('*'),
  ]);

  const matches = (matchesRes.data ?? []) as MatchRecord[];
  const rules = (rulesRes.data ?? []) as ScoringRule[];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black">Matches</h2>

      {/* Add form */}
      <MatchForm scoringRules={rules} />

      {/* List */}
      <div className="space-y-3">
        <h3 className="font-bold text-silver text-sm uppercase tracking-wider">
          {matches.length} Match{matches.length !== 1 ? 'es' : ''}
        </h3>

        {matches.length === 0 ? (
          <div className="card py-8 text-center text-silver">No matches yet.</div>
        ) : (
          matches.map((m) => (
            <div key={m.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StageBadge stage={m.stage} />
                    <span className="font-bold">
                      {m.home_team} vs {m.away_team}
                    </span>
                  </div>
                  <p className="text-xs text-silver">
                    Kickoff: {formatBangkokTime(m.kickoff_at)} ·{' '}
                    Close: {formatBangkokTime(m.prediction_close_at)} ·{' '}
                    {m.scoring_mode}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {m.is_result_published ? (
                    <span className="badge-green text-xs flex items-center gap-1">
                      <CheckCircle size={11} />
                      {m.final_home_score}–{m.final_away_score}
                    </span>
                  ) : (
                    <span className="badge-silver text-xs flex items-center gap-1">
                      <Clock size={11} /> Pending
                    </span>
                  )}
                  <form
                    action={async () => {
                      'use server';
                      await deleteMatch(m.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="btn-ghost btn-sm text-danger"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
