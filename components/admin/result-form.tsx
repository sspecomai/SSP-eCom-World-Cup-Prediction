'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { publishMatchResult, publishPreQuestionResult } from '@/app/actions/admin';
import type { MatchRecord, PreQuestion } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary btn-sm">
      {pending ? 'Publishing…' : label}
    </button>
  );
}

export function MatchResultForm({ match }: { match: MatchRecord }) {
  const [state, action] = useFormState(publishMatchResult, null);

  if (match.is_result_published) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <CheckCircle size={14} />
        Result published: {match.final_home_score} – {match.final_away_score}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="match_id" value={match.id} />
      <div className="flex items-center gap-2">
        <input
          name="final_home_score"
          type="number"
          min={0}
          max={20}
          defaultValue={match.final_home_score ?? ''}
          placeholder="H"
          className="input-sm w-16 text-center font-black"
          required
        />
        <span className="text-silver">–</span>
        <input
          name="final_away_score"
          type="number"
          min={0}
          max={20}
          defaultValue={match.final_away_score ?? ''}
          placeholder="A"
          className="input-sm w-16 text-center font-black"
          required
        />
      </div>
      <SubmitBtn label="Publish & Score" />
      {state?.error && (
        <p className="w-full text-xs text-danger">{state.error}</p>
      )}
    </form>
  );
}

export function PreQuestionResultForm({ question }: { question: PreQuestion }) {
  const [state, action] = useFormState(publishPreQuestionResult, null);

  if (question.is_result_published) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <CheckCircle size={14} />
        Answer: {question.correct_answer}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="question_id" value={question.id} />
      <input
        name="correct_answer"
        type="text"
        defaultValue={question.correct_answer ?? ''}
        placeholder="Correct answer"
        className="input-sm flex-1 min-w-[180px]"
        required
      />
      <SubmitBtn label="Publish & Score" />
      {state?.error && (
        <p className="w-full text-xs text-danger">{state.error}</p>
      )}
    </form>
  );
}
