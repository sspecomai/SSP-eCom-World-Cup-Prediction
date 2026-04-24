'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Countdown } from '@/components/ui/countdown';
import { formatBangkokTime, isClosed } from '@/lib/utils/time';
import { submitPreQuestionAnswer } from '@/app/actions/predictions';
import type { PreQuestion, PreQuestionOption, PreQuestionAnswer } from '@/lib/types';
import { CheckCircle, Lock } from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
  question: PreQuestion;
  options?: PreQuestionOption[];
  existing?: PreQuestionAnswer | null;
  isAuthenticated?: boolean;
};

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary btn-sm">
      {pending ? 'Saving…' : label}
    </button>
  );
}

export function PreQuestionCard({
  question,
  options = [],
  existing,
  isAuthenticated,
}: Props) {
  const [state, action] = useFormState(submitPreQuestionAnswer, null);
  const locked = question.is_locked || isClosed(question.close_at);
  const isPublished = question.is_result_published;

  const label = existing ? 'Update Answer' : 'Submit Answer';

  return (
    <article className="card space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-lg font-bold leading-snug flex-1">
          {question.question_text}
        </h2>
        <Countdown closeAt={question.close_at} />
      </div>

      {/* Timing */}
      <p className="text-xs text-silver">
        Opens: {formatBangkokTime(question.open_at)} · Closes:{' '}
        {formatBangkokTime(question.close_at)}
      </p>

      {/* Scoring */}
      <div className="flex gap-2 flex-wrap text-xs">
        <span className="badge bg-emerald-500/15 text-emerald-400">
          Correct: +{question.score_correct}
        </span>
        <span className="badge bg-danger/15 text-danger">
          Wrong: {question.score_wrong}
        </span>
        {question.allow_edit_before_timeout && (
          <span className="badge-silver">Editable until close</span>
        )}
      </div>

      {/* Result */}
      {isPublished && question.correct_answer && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">
          <span className="text-silver">Correct answer: </span>
          <span className="font-bold text-emerald-400">{question.correct_answer}</span>
        </div>
      )}

      {/* Existing answer */}
      {existing && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm flex justify-between items-center">
          <span>
            <span className="text-silver">Your answer: </span>
            <span className="font-bold">{existing.answer_value}</span>
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
              {existing.score > 0 ? '+' : ''}{existing.score} pts
            </span>
          )}
        </div>
      )}

      {/* Form */}
      {!locked && !isPublished && isAuthenticated && (
        <form action={action} className="space-y-3">
          <input type="hidden" name="question_id" value={question.id} />

          {question.answer_type === 'text' ? (
            <input
              name="answer_value"
              type="text"
              defaultValue={existing?.answer_value ?? ''}
              placeholder="Type your answer…"
              className="input"
              required
            />
          ) : (
            <div className="space-y-2">
              {options.map((opt) => (
                <label
                  key={opt.id}
                  className={clsx(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors',
                    existing?.answer_value === opt.option_text
                      ? 'border-danger/50 bg-danger/10 text-white'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25 text-silver'
                  )}
                >
                  <input
                    type={
                      question.answer_type === 'multi_choice' ? 'checkbox' : 'radio'
                    }
                    name="answer_value"
                    value={opt.option_text}
                    defaultChecked={existing?.answer_value === opt.option_text}
                    className="accent-danger"
                    required={question.answer_type === 'single_choice'}
                  />
                  {opt.option_text}
                </label>
              ))}
            </div>
          )}

          {state?.error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <SubmitBtn label={label} />
        </form>
      )}

      {locked && !isPublished && (
        <div className="flex items-center gap-2 text-sm text-silver">
          <Lock size={14} />
          Answers closed
        </div>
      )}

      {isPublished && (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle size={14} />
          Result published
        </div>
      )}

      {!isAuthenticated && !locked && (
        <p className="text-sm text-silver">
          <a href="/login" className="text-danger underline">Log in</a> to submit your answer.
        </p>
      )}
    </article>
  );
}
