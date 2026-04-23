insert into public.roles (role) values ('admin'), ('user') on conflict do nothing;

insert into public.scoring_rules (context, prediction_mode, score_correct, score_wrong, score_fallback, allow_edit_before_timeout)
values
('pre_question', null, 10, -3, 0, true),
('match_prediction', 'OUTCOME', 4, -1, 0, true),
('match_prediction', 'EXACT', 8, -2, 3, true);

insert into public.pre_questions (question_text, answer_type, open_at, close_at, scoring_rule_id)
select
  'Which team will score the first goal of World Cup 2026?',
  'single_choice',
  '2026-05-20 08:00:00+07',
  '2026-06-10 23:59:00+07',
  id
from public.scoring_rules
where context = 'pre_question'
limit 1;

insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id)
select 'Thailand', 'Japan', '2026-06-12 19:00:00+07', 'group', '2026-06-12 18:45:00+07', 'EXACT', id
from public.scoring_rules where context='match_prediction' and prediction_mode='EXACT' limit 1;

insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id)
select 'Brazil', 'Germany', '2026-06-14 20:00:00+07', 'group', '2026-06-14 19:45:00+07', 'OUTCOME', id
from public.scoring_rules where context='match_prediction' and prediction_mode='OUTCOME' limit 1;
