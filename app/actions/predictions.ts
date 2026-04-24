'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { error: string } | null;

export async function submitMatchPrediction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Please log in to submit predictions.' };

  const matchId = formData.get('match_id') as string;
  const homeScore = parseInt(formData.get('home_score') as string, 10);
  const awayScore = parseInt(formData.get('away_score') as string, 10);

  if (!matchId) return { error: 'Invalid match.' };
  if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return { error: 'Scores must be non-negative numbers.' };
  }

  const { data: match } = await supabase
    .from('matches')
    .select('prediction_close_at, is_locked')
    .eq('id', matchId)
    .single();

  if (!match) return { error: 'Match not found.' };

  if (match.is_locked || new Date(match.prediction_close_at) <= new Date()) {
    return { error: 'Predictions are closed for this match.' };
  }

  const { error } = await supabase.from('match_predictions').upsert(
    {
      match_id: matchId,
      user_id: user.id,
      predicted_home_score: homeScore,
      predicted_away_score: awayScore,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'match_id,user_id' }
  );

  if (error) return { error: error.message };

  revalidatePath('/matches');
  revalidatePath('/dashboard');
  return null;
}

export async function submitPreQuestionAnswer(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Please log in to submit answers.' };

  const questionId = formData.get('question_id') as string;
  const answerValue = formData.get('answer_value') as string;

  if (!questionId) return { error: 'Invalid question.' };
  if (!answerValue?.trim()) return { error: 'Answer cannot be empty.' };

  const { data: question } = await supabase
    .from('pre_questions')
    .select('close_at, is_locked')
    .eq('id', questionId)
    .single();

  if (!question) return { error: 'Question not found.' };

  if (question.is_locked || new Date(question.close_at) <= new Date()) {
    return { error: 'This question is closed.' };
  }

  const { error } = await supabase.from('pre_question_answers').upsert(
    {
      pre_question_id: questionId,
      user_id: user.id,
      answer_value: answerValue.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'pre_question_id,user_id' }
  );

  if (error) return { error: error.message };

  revalidatePath('/pre-questions');
  revalidatePath('/dashboard');
  return null;
}
