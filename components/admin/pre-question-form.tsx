'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createPreQuestion, updatePreQuestion } from '@/app/actions/admin';
import type { PreQuestion, ScoringRule } from '@/lib/types';
import { X } from 'lucide-react';

type Props = {
  scoringRules: ScoringRule[];
  question?: PreQuestion;
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

export function PreQuestionForm({ scoringRules, question, onCancel }: Props) {
  const action = question ? updatePreQuestion : createPreQuestion;
  const [state, formAction] = useFormState(action, null);
  const preRules = scoringRules.filter((r) => r.context === 'pre_question');

  return (
    <form action={formAction} className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{question ? 'Edit Question' : 'Add Pre-Question'}</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost btn-sm">
            <X size={16} />
          </button>
        )}
      </div>

      {question && <input type="hidden" name="id" value={question.id} />}

      {state?.error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-silver">Question</label>
          <textarea
            name="question_text"
            rows={2}
            defaultValue={question?.question_text}
            className="input resize-none"
            placeholder="e.g. Which team will score the first goal?"
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-silver">Answer Type</label>
            <select
              name="answer_type"
              defaultValue={question?.answer_type ?? 'single_choice'}
              className="select"
            >
              <option value="single_choice">Single Choice</option>
              <option value="multi_choice">Multiple Choice</option>
              <option value="text">Free Text</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-silver">Scoring Rule</label>
            <select
              name="scoring_rule_id"
              defaultValue={question?.scoring_rule_id}
              className="select"
              required
            >
              {preRules.map((r) => (
                <option key={r.id} value={r.id}>
                  +{r.score_correct} / {r.score_wrong}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-silver">Opens</label>
            <input
              name="open_at"
              type="datetime-local"
              defaultValue={toDatetimeLocal(question?.open_at)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-silver">Closes</label>
            <input
              name="close_at"
              type="datetime-local"
              defaultValue={toDatetimeLocal(question?.close_at)}
              className="input"
              required
            />
          </div>
        </div>

        {question && (
          <div>
            <label className="mb-1 block text-sm font-medium text-silver">
              Correct Answer <span className="text-silver/60">(set when publishing)</span>
            </label>
            <input
              name="correct_answer"
              type="text"
              defaultValue={question?.correct_answer ?? ''}
              className="input"
              placeholder="The correct answer"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-silver">
            Options <span className="text-silver/60">(one per line, for choice types)</span>
          </label>
          <textarea
            name="options"
            rows={4}
            className="input resize-none font-mono text-sm"
            placeholder="Brazil&#10;Germany&#10;France&#10;Spain"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <SubmitBtn label={question ? 'Update Question' : 'Create Question'} />
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
