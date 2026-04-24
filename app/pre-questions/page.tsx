import { createClient } from '@/lib/supabase/server';
import { PreQuestionCard } from '@/components/predictions/pre-question-card';
import { QuestionCardSkeleton } from '@/components/ui/skeleton';
import { HelpCircle } from 'lucide-react';
import type { PreQuestion, PreQuestionOption, PreQuestionAnswer } from '@/lib/types';
import { Suspense } from 'react';

export const metadata = { title: 'Pre-Questions · SSP WC2026 Predictor' };
export const revalidate = 60;

async function QuestionsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [questionsRes, optionsRes, answersRes] = await Promise.all([
    supabase
      .from('pre_questions_with_scoring')
      .select('*')
      .order('close_at', { ascending: true }),
    supabase.from('pre_question_options').select('*').order('sort_order'),
    user
      ? supabase
          .from('pre_question_answers')
          .select('*')
          .eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const questions = (questionsRes.data ?? []) as PreQuestion[];
  const options = (optionsRes.data ?? []) as PreQuestionOption[];
  const answers = (answersRes.data ?? []) as PreQuestionAnswer[];

  const answerMap = Object.fromEntries(
    answers.map((a) => [a.pre_question_id, a])
  );
  const optionMap: Record<string, PreQuestionOption[]> = {};
  for (const opt of options) {
    (optionMap[opt.pre_question_id] ??= []).push(opt);
  }

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="card py-16 text-center text-silver">
          <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No pre-questions yet. Check back soon!</p>
        </div>
      ) : (
        questions.map((q) => (
          <PreQuestionCard
            key={q.id}
            question={q}
            options={optionMap[q.id] ?? []}
            existing={answerMap[q.id] ?? null}
            isAuthenticated={!!user}
          />
        ))
      )}
    </div>
  );
}

export default function PreQuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15">
          <HelpCircle size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Pre-Questions</h1>
          <p className="text-sm text-silver">
            Answer before the tournament kicks off.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <QuestionCardSkeleton key={i} />)}
          </div>
        }
      >
        <QuestionsContent />
      </Suspense>
    </div>
  );
}
