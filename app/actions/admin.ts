'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { scoreMatchPrediction } from '@/lib/services/scoring';
import type { MatchRecord, MatchPrediction } from '@/lib/types';

type ActionResult = { error: string } | null;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('roles(role)')
    .eq('id', user.id)
    .single();

  const role = (profile?.roles as unknown as { role: string } | null)?.role;
  if (role !== 'admin') redirect('/dashboard');

  return supabase;
}

// ── Matches ──────────────────────────────────────────────────────────────────

export async function createMatch(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await requireAdmin();

  const homeTeam = formData.get('home_team') as string;
  const awayTeam = formData.get('away_team') as string;
  const stage = formData.get('stage') as string;
  const kickoffAt = formData.get('kickoff_at') as string;
  const predictionCloseAt = formData.get('prediction_close_at') as string;
  const scoringMode = formData.get('scoring_mode') as string;
  const scoringRuleId = formData.get('scoring_rule_id') as string;

  if (!homeTeam || !awayTeam || !stage || !kickoffAt || !predictionCloseAt) {
    return { error: 'All fields are required.' };
  }

  const { error } = await supabase.from('matches').insert({
    home_team: homeTeam,
    away_team: awayTeam,
    stage,
    kickoff_at: new Date(kickoffAt).toISOString(),
    prediction_close_at: new Date(predictionCloseAt).toISOString(),
    scoring_mode: scoringMode || 'EXACT',
    scoring_rule_id: scoringRuleId,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/matches');
  revalidatePath('/matches');
  return null;
}

export async function updateMatch(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const id = formData.get('id') as string;

  const { error } = await supabase
    .from('matches')
    .update({
      home_team: formData.get('home_team'),
      away_team: formData.get('away_team'),
      stage: formData.get('stage'),
      kickoff_at: new Date(formData.get('kickoff_at') as string).toISOString(),
      prediction_close_at: new Date(
        formData.get('prediction_close_at') as string
      ).toISOString(),
      scoring_mode: formData.get('scoring_mode'),
      scoring_rule_id: formData.get('scoring_rule_id'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/matches');
  revalidatePath('/matches');
  return null;
}

export async function deleteMatch(matchId: string): Promise<ActionResult> {
  const supabase = await requireAdmin();

  const { error } = await supabase.from('matches').delete().eq('id', matchId);
  if (error) return { error: error.message };

  revalidatePath('/admin/matches');
  revalidatePath('/matches');
  return null;
}

export async function publishMatchResult(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await requireAdmin();

  const matchId = formData.get('match_id') as string;
  const finalHome = parseInt(formData.get('final_home_score') as string, 10);
  const finalAway = parseInt(formData.get('final_away_score') as string, 10);

  if (isNaN(finalHome) || isNaN(finalAway)) {
    return { error: 'Valid final scores are required.' };
  }

  const { error: updateErr } = await supabase
    .from('matches')
    .update({
      final_home_score: finalHome,
      final_away_score: finalAway,
      is_result_published: true,
      is_locked: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId);

  if (updateErr) return { error: updateErr.message };

  // Fetch match + scoring rule for server-side scoring
  const { data: matchRow } = await supabase
    .from('matches_with_scoring')
    .select('*')
    .eq('id', matchId)
    .single();

  if (matchRow) {
    const match = matchRow as MatchRecord & {
      final_home_score: number;
      final_away_score: number;
    };
    match.final_home_score = finalHome;
    match.final_away_score = finalAway;

    const { data: preds } = await supabase
      .from('match_predictions')
      .select('*')
      .eq('match_id', matchId);

    if (preds?.length) {
      for (const pred of preds as MatchPrediction[]) {
        const { points } = scoreMatchPrediction(match, pred);
        await supabase
          .from('match_predictions')
          .update({ score: points, updated_at: new Date().toISOString() })
          .eq('match_id', matchId)
          .eq('user_id', pred.user_id);
      }
    }
  }

  revalidatePath('/admin/results');
  revalidatePath('/matches');
  revalidatePath('/leaderboard');
  revalidatePath('/dashboard');
  return null;
}

// ── Pre-questions ─────────────────────────────────────────────────────────────

export async function createPreQuestion(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const questionText = formData.get('question_text') as string;
  const answerType = formData.get('answer_type') as string;
  const openAt = formData.get('open_at') as string;
  const closeAt = formData.get('close_at') as string;
  const scoringRuleId = formData.get('scoring_rule_id') as string;

  if (!questionText || !answerType || !openAt || !closeAt) {
    return { error: 'All fields are required.' };
  }

  const { data: q, error } = await supabase
    .from('pre_questions')
    .insert({
      question_text: questionText,
      answer_type: answerType,
      open_at: new Date(openAt).toISOString(),
      close_at: new Date(closeAt).toISOString(),
      scoring_rule_id: scoringRuleId,
      created_by: user!.id,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Options (comma-separated)
  const optionsRaw = formData.get('options') as string;
  if (q && optionsRaw?.trim()) {
    const options = optionsRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        pre_question_id: q.id,
        option_text: text,
        sort_order: idx,
      }));
    if (options.length) {
      await supabase.from('pre_question_options').insert(options);
    }
  }

  revalidatePath('/admin/pre-questions');
  revalidatePath('/pre-questions');
  return null;
}

export async function updatePreQuestion(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const id = formData.get('id') as string;

  const { error } = await supabase
    .from('pre_questions')
    .update({
      question_text: formData.get('question_text'),
      answer_type: formData.get('answer_type'),
      open_at: new Date(formData.get('open_at') as string).toISOString(),
      close_at: new Date(formData.get('close_at') as string).toISOString(),
      scoring_rule_id: formData.get('scoring_rule_id'),
      correct_answer: formData.get('correct_answer') || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/pre-questions');
  revalidatePath('/pre-questions');
  return null;
}

export async function deletePreQuestion(questionId: string): Promise<ActionResult> {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from('pre_questions')
    .delete()
    .eq('id', questionId);

  if (error) return { error: error.message };

  revalidatePath('/admin/pre-questions');
  revalidatePath('/pre-questions');
  return null;
}

export async function publishPreQuestionResult(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await requireAdmin();

  const questionId = formData.get('question_id') as string;
  const correctAnswer = formData.get('correct_answer') as string;

  if (!correctAnswer?.trim()) return { error: 'Correct answer is required.' };

  const { error: updateErr } = await supabase
    .from('pre_questions')
    .update({
      correct_answer: correctAnswer.trim(),
      is_result_published: true,
      is_locked: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', questionId);

  if (updateErr) return { error: updateErr.message };

  // Score all answers
  const { data: question } = await supabase
    .from('pre_questions_with_scoring')
    .select('score_correct, score_wrong')
    .eq('id', questionId)
    .single();

  if (question) {
    await supabase.rpc('score_pre_question_answers', { question_id: questionId });
  }

  revalidatePath('/admin/results');
  revalidatePath('/pre-questions');
  revalidatePath('/leaderboard');
  revalidatePath('/dashboard');
  return null;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function setUserRole(
  userId: string,
  role: 'admin' | 'user'
): Promise<ActionResult> {
  const supabase = await requireAdmin();

  const { data: roleRow } = await supabase
    .from('roles')
    .select('id')
    .eq('role', role)
    .single();

  if (!roleRow) return { error: 'Role not found.' };

  const { error } = await supabase
    .from('users')
    .update({ role_id: roleRow.id, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return null;
}
