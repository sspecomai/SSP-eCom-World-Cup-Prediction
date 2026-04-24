'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Countdown } from '@/components/ui/countdown';
import { StageBadge } from '@/components/ui/stage-badge';
import { formatBangkokTime, isClosed } from '@/lib/utils/time';
import { submitMatchPrediction } from '@/app/actions/predictions';
import type { MatchRecord, MatchPrediction } from '@/lib/types';
import { CheckCircle, Lock, Minus } from 'lucide-react';

type Props = {
  match: MatchRecord;
  existing?: MatchPrediction | null;
  isAuthenticated?: boolean;
};

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary btn-sm w-full">
      {pending ? 'Saving…' : label}
    </button>
  );
}

export function MatchCard({ match, existing, isAuthenticated }: Props) {
  const [state, action] = useFormState(submitMatchPrediction, null);
  const locked = match.is_locked || isClosed(match.prediction_close_at);
  const hasResult = match.is_result_published;

  const label = existing ? 'Update Prediction' : 'Submit Prediction';

  return (
    <article className="card space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StageBadge stage={match.stage} />
        <Countdown closeAt={match.prediction_close_at} />
      </div>

      {/* Teams scoreboard */}
      <div className="flex items-center gap-3">
        <div className="flex-1 text-right">
          <p className="font-black text-lg leading-tight">{match.home_team}</p>
        </div>

        {hasResult ? (
          <div className="flex items-center gap-1 shrink-0">
            <span className="scoreboard-digit">{match.final_home_score}</span>
            <Minus className="text-silver" size={14} />
            <span className="scoreboard-digit">{match.final_away_score}</span>
          </div>
        ) : (
          <div className="shrink-0 text-silver font-bold text-sm px-2">vs</div>
        )}

        <div className="flex-1">
          <p className="font-black text-lg leading-tight">{match.away_team}</p>
        </div>
      </div>

      {/* Kickoff */}
      <p className="text-xs text-silver">
        Kickoff: {formatBangkokTime(match.kickoff_at)} (BKK)
      </p>

      {/* Scoring info */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="badge-silver">Mode: {match.scoring_mode}</span>
        <span className="badge bg-emerald-500/15 text-emerald-400">
          Correct: +{match.correct_score}
        </span>
        {match.scoring_mode === 'EXACT' && match.fallback_outcome_score > 0 && (
          <span className="badge bg-blue-500/15 text-blue-400">
            Outcome: +{match.fallback_outcome_score}
          </span>
        )}
        <span className="badge bg-danger/15 text-danger">
          Wrong: {match.wrong_score}
        </span>
      </div>

      {/* Existing prediction display */}
      {existing && !hasResult && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
          <span className="text-silver">Your pick: </span>
          <span className="font-bold text-white">
            {existing.predicted_home_score} – {existing.predicted_away_score}
          </span>
        </div>
      )}

      {/* Score result */}
      {hasResult && existing && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm flex justify-between items-center">
          <span className="text-silver">
            Your pick: {existing.predicted_home_score} – {existing.predicted_away_score}
          </span>
          {existing.score != null && (
            <span
              className={
                existing.score > 0
                  ? 'font-black text-emerald-400'
                  : existing.score < 0
                  ? 'font-black text-danger'
                  : 'font-black text-silver'
              }
            >
              {existing.score > 0 ? '+' : ''}
              {existing.score} pts
            </span>
          )}
        </div>
      )}

      {/* Prediction form */}
      {!hasResult && !locked && isAuthenticated && (
        <form action={action} className="space-y-3">
          <input type="hidden" name="match_id" value={match.id} />
          <div className="flex items-center gap-2">
            <input
              name="home_score"
              type="number"
              min={0}
              max={20}
              defaultValue={existing?.predicted_home_score ?? ''}
              placeholder="0"
              className="input text-center text-xl font-black"
              required
            />
            <span className="text-silver font-bold shrink-0">–</span>
            <input
              name="away_score"
              type="number"
              min={0}
              max={20}
              defaultValue={existing?.predicted_away_score ?? ''}
              placeholder="0"
              className="input text-center text-xl font-black"
              required
            />
          </div>
          {state?.error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          <SubmitBtn label={label} />
        </form>
      )}

      {!hasResult && locked && (
        <div className="flex items-center gap-2 text-sm text-silver">
          <Lock size={14} />
          Predictions closed
        </div>
      )}

      {hasResult && (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle size={14} />
          Result published
        </div>
      )}

      {!isAuthenticated && !hasResult && (
        <p className="text-sm text-silver">
          <a href="/login" className="text-danger underline">Log in</a> to submit a prediction.
        </p>
      )}
    </article>
  );
}
