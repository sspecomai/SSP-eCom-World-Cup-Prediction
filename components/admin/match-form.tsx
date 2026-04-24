'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createMatch, updateMatch } from '@/app/actions/admin';
import type { MatchRecord, ScoringRule } from '@/lib/types';
import { X } from 'lucide-react';

const STAGES = [
  { value: 'group', label: 'Group Stage' },
  { value: 'round_of_16', label: 'Round of 16' },
  { value: 'quarter_final', label: 'Quarter-Final' },
  { value: 'semi_final', label: 'Semi-Final' },
  { value: 'final', label: 'Final' },
];

type Props = {
  scoringRules: ScoringRule[];
  match?: MatchRecord;
  onCancel?: () => void;
};

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Saving…' : label}
    </button>
  );
}

function toDatetimeLocal(iso?: string) {
  if (!iso) return '';
  return iso.slice(0, 16);
}

export function MatchForm({ scoringRules, match, onCancel }: Props) {
  const action = match ? updateMatch : createMatch;
  const [state, formAction] = useFormState(action, null);

  const exactRules = scoringRules.filter(
    (r) => r.context === 'match_prediction' && r.prediction_mode === 'EXACT'
  );
  const outcomeRules = scoringRules.filter(
    (r) => r.context === 'match_prediction' && r.prediction_mode === 'OUTCOME'
  );

  return (
    <form action={formAction} className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{match ? 'Edit Match' : 'Add Match'}</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost btn-sm">
            <X size={16} />
          </button>
        )}
      </div>

      {match && <input type="hidden" name="id" value={match.id} />}

      {state?.error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-silver">Home Team</label>
          <input
            name="home_team"
            type="text"
            defaultValue={match?.home_team}
            className="input"
            placeholder="e.g. Brazil"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-silver">Away Team</label>
          <input
            name="away_team"
            type="text"
            defaultValue={match?.away_team}
            className="input"
            placeholder="e.g. Germany"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-silver">Stage</label>
          <select name="stage" defaultValue={match?.stage ?? 'group'} className="select" required>
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-silver">Scoring Mode</label>
          <select
            name="scoring_mode"
            defaultValue={match?.scoring_mode ?? 'EXACT'}
            className="select"
          >
            <option value="EXACT">Exact Score</option>
            <option value="OUTCOME">Win/Draw/Lose</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-silver">Kickoff</label>
          <input
            name="kickoff_at"
            type="datetime-local"
            defaultValue={toDatetimeLocal(match?.kickoff_at)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-silver">Prediction Close</label>
          <input
            name="prediction_close_at"
            type="datetime-local"
            defaultValue={toDatetimeLocal(match?.prediction_close_at)}
            className="input"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-silver">Scoring Rule</label>
          <select
            name="scoring_rule_id"
            defaultValue={match?.scoring_rule_id}
            className="select"
            required
          >
            <optgroup label="Exact Score Rules">
              {exactRules.map((r) => (
                <option key={r.id} value={r.id}>
                  Exact: +{r.score_correct} / Fallback: +{r.score_fallback} / Wrong: {r.score_wrong}
                </option>
              ))}
            </optgroup>
            <optgroup label="Outcome Rules">
              {outcomeRules.map((r) => (
                <option key={r.id} value={r.id}>
                  Outcome: +{r.score_correct} / Wrong: {r.score_wrong}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <SubmitBtn label={match ? 'Update Match' : 'Create Match'} />
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
