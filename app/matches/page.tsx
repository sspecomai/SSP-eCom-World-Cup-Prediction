import { createClient } from '@/lib/supabase/server';
import { MatchCard } from '@/components/predictions/match-card';
import { StageBadge } from '@/components/ui/stage-badge';
import { MatchCardSkeleton } from '@/components/ui/skeleton';
import { Swords } from 'lucide-react';
import type { MatchRecord, MatchPrediction, Stage } from '@/lib/types';
import { STAGE_LABELS } from '@/lib/types';
import { Suspense } from 'react';

export const metadata = { title: 'Match Predictions · SSP WC2026 Predictor' };
export const revalidate = 60;

const STAGE_ORDER: Stage[] = [
  'group', 'round_of_16', 'quarter_final', 'semi_final', 'final',
];

async function MatchesContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [matchesRes, predsRes] = await Promise.all([
    supabase
      .from('matches_with_scoring')
      .select('*')
      .order('kickoff_at', { ascending: true }),
    user
      ? supabase
          .from('match_predictions')
          .select('*')
          .eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const matches = (matchesRes.data ?? []) as MatchRecord[];
  const predictions = (predsRes.data ?? []) as MatchPrediction[];
  const predMap = Object.fromEntries(predictions.map((p) => [p.match_id, p]));

  const byStage: Record<Stage, MatchRecord[]> = {
    group: [],
    round_of_16: [],
    quarter_final: [],
    semi_final: [],
    final: [],
  };

  for (const m of matches) {
    byStage[m.stage]?.push(m);
  }

  const activeStages = STAGE_ORDER.filter((s) => byStage[s].length > 0);

  return (
    <div className="space-y-10">
      {activeStages.length === 0 ? (
        <div className="card py-16 text-center text-silver">
          <Swords size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Matches coming soon!</p>
        </div>
      ) : (
        activeStages.map((stage) => (
          <section key={stage} className="space-y-4">
            <div className="flex items-center gap-3">
              <StageBadge stage={stage} />
              <span className="text-silver text-sm">
                {byStage[stage].length} match{byStage[stage].length !== 1 ? 'es' : ''}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {byStage[stage].map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  existing={predMap[match.id] ?? null}
                  isAuthenticated={!!user}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/15">
          <Swords size={24} className="text-danger" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Match Predictions</h1>
          <p className="text-sm text-silver">Pick your scores before each kickoff.</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <MatchCardSkeleton key={i} />)}
          </div>
        }
      >
        <MatchesContent />
      </Suspense>
    </div>
  );
}
