import { createClient } from '@/lib/supabase/server';
import { PreQuestionForm } from '@/components/admin/pre-question-form';
import { deletePreQuestion } from '@/app/actions/admin';
import { formatBangkokTime } from '@/lib/utils/time';
import type { PreQuestion, ScoringRule } from '@/lib/types';
import { Trash2, CheckCircle, Clock } from 'lucide-react';

export const metadata = { title: 'Admin: Pre-Questions · SSP WC2026 Predictor' };

export default async function AdminPreQuestionsPage() {
  const supabase = await createClient();

  const [questionsRes, rulesRes] = await Promise.all([
    supabase
      .from('pre_questions_with_scoring')
      .select('*')
      .order('close_at', { ascending: true }),
    supabase.from('scoring_rules').select('*'),
  ]);

  const questions = (questionsRes.data ?? []) as PreQuestion[];
  const rules = (rulesRes.data ?? []) as ScoringRule[];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black">Pre-Questions</h2>

      {/* Add form */}
      <PreQuestionForm scoringRules={rules} />

      {/* List */}
      <div className="space-y-3">
        <h3 className="font-bold text-silver text-sm uppercase tracking-wider">
          {questions.length} Question{questions.length !== 1 ? 's' : ''}
        </h3>

        {questions.length === 0 ? (
          <div className="card py-8 text-center text-silver">No questions yet.</div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="card space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold">{q.question_text}</p>
                  <p className="text-xs text-silver mt-1">
                    {q.answer_type} · Closes: {formatBangkokTime(q.close_at)} · +{q.score_correct} / {q.score_wrong}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {q.is_result_published ? (
                    <span className="badge-green text-xs flex items-center gap-1">
                      <CheckCircle size={11} /> Published
                    </span>
                  ) : (
                    <span className="badge-silver text-xs flex items-center gap-1">
                      <Clock size={11} /> Pending
                    </span>
                  )}
                  <form
                    action={async () => {
                      'use server';
                      await deletePreQuestion(q.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="btn-ghost btn-sm text-danger hover:text-danger"
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
