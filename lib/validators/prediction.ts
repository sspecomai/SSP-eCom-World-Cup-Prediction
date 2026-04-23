import { z } from 'zod';

export const matchPredictionSchema = z.object({
  match_id: z.string().uuid().or(z.string().min(2)),
  predicted_home_score: z.number().int().min(0).max(20),
  predicted_away_score: z.number().int().min(0).max(20)
});

export const preQuestionAnswerSchema = z.object({
  pre_question_id: z.string().uuid().or(z.string().min(2)),
  answer_value: z.string().min(1)
});
