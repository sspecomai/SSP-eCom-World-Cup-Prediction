-- =============================================================================
-- Supersports Thailand × World Cup 2026 Prediction Game — Seed Data
-- =============================================================================

-- ── Roles ────────────────────────────────────────────────────────────────────

insert into public.roles (role) values ('admin'), ('user') on conflict do nothing;

-- ── Scoring Rules ─────────────────────────────────────────────────────────────
-- Context: pre_question
-- Context: match_prediction / EXACT  (exact score + outcome fallback)
-- Context: match_prediction / OUTCOME (win/draw/lose only)

insert into public.scoring_rules
  (context, prediction_mode, score_correct, score_wrong, score_fallback, allow_edit_before_timeout)
values
  ('pre_question',     null,      10, -3, 0, true),
  ('match_prediction', 'EXACT',    8, -2, 3, true),
  ('match_prediction', 'OUTCOME',  4, -1, 0, true)
on conflict do nothing;

-- ── Pre-Questions ─────────────────────────────────────────────────────────────

insert into public.pre_questions
  (question_text, answer_type, open_at, close_at, scoring_rule_id)
select
  q.question_text,
  q.answer_type::public.answer_type,
  q.open_at::timestamptz,
  q.close_at::timestamptz,
  (select id from public.scoring_rules where context = 'pre_question' limit 1)
from (values
  (
    'Which country will win the FIFA World Cup 2026?',
    'single_choice',
    '2026-04-01 00:00:00+07',
    '2026-06-11 20:00:00+07'
  ),
  (
    'Who will be the Golden Boot winner (top scorer) of World Cup 2026?',
    'text',
    '2026-04-01 00:00:00+07',
    '2026-06-11 20:00:00+07'
  ),
  (
    'Which team will score the first goal of World Cup 2026?',
    'single_choice',
    '2026-04-01 00:00:00+07',
    '2026-06-11 23:45:00+07'
  ),
  (
    'How many total goals will be scored in the tournament?',
    'single_choice',
    '2026-04-01 00:00:00+07',
    '2026-06-11 23:45:00+07'
  ),
  (
    'Which player will win the Golden Ball (best player) at World Cup 2026?',
    'text',
    '2026-04-01 00:00:00+07',
    '2026-06-11 23:45:00+07'
  ),
  (
    'Will there be a penalty shootout in the final?',
    'single_choice',
    '2026-04-01 00:00:00+07',
    '2026-07-18 16:00:00+07'
  )
) as q(question_text, answer_type, open_at, close_at);

-- Options for "Which country will win the FIFA World Cup 2026?"
insert into public.pre_question_options (pre_question_id, option_text, sort_order)
select
  (select id from public.pre_questions where question_text = 'Which country will win the FIFA World Cup 2026?' limit 1),
  opt.name,
  opt.idx
from (values
  (0, 'Brazil'), (1, 'France'), (2, 'Argentina'), (3, 'England'),
  (4, 'Germany'), (5, 'Spain'), (6, 'Portugal'), (7, 'Netherlands'),
  (8, 'USA'),    (9, 'Other')
) as opt(idx, name);

-- Options for "Which team will score the first goal?"
insert into public.pre_question_options (pre_question_id, option_text, sort_order)
select
  (select id from public.pre_questions where question_text = 'Which team will score the first goal of World Cup 2026?' limit 1),
  opt.name,
  opt.idx
from (values
  (0, 'Brazil'), (1, 'France'), (2, 'Argentina'), (3, 'England'),
  (4, 'Germany'), (5, 'Spain'), (6, 'Mexico'), (7, 'USA'), (8, 'Other')
) as opt(idx, name);

-- Options for "How many total goals?"
insert into public.pre_question_options (pre_question_id, option_text, sort_order)
select
  (select id from public.pre_questions where question_text = 'How many total goals will be scored in the tournament?' limit 1),
  opt.name,
  opt.idx
from (values
  (0, 'Under 150'),
  (1, '150 – 169'),
  (2, '170 – 189'),
  (3, '190 – 210'),
  (4, 'Over 210')
) as opt(idx, name);

-- Options for "Will there be a penalty shootout in the final?"
insert into public.pre_question_options (pre_question_id, option_text, sort_order)
select
  (select id from public.pre_questions where question_text = 'Will there be a penalty shootout in the final?' limit 1),
  opt.name,
  opt.idx
from (values
  (0, 'Yes'), (1, 'No')
) as opt(idx, name);

-- ── Group Stage Matches ───────────────────────────────────────────────────────
-- 12 groups × 6 matches = 72 group stage matches (showing key ones)
-- World Cup 2026 hosts: USA, Canada, Mexico

-- Helper: get scoring rule IDs
do $$
declare
  exact_rule_id   uuid;
  outcome_rule_id uuid;
begin
  select id into exact_rule_id   from public.scoring_rules where context = 'match_prediction' and prediction_mode = 'EXACT'   limit 1;
  select id into outcome_rule_id from public.scoring_rules where context = 'match_prediction' and prediction_mode = 'OUTCOME' limit 1;

  -- ── Group A ─────────────────────────────────────────────────────────────────
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('USA',       'Serbia',    '2026-06-11 19:00:00-05', 'group', '2026-06-11 18:30:00-05', 'EXACT',   exact_rule_id),
  ('Uruguay',   'Panama',    '2026-06-11 16:00:00-05', 'group', '2026-06-11 15:30:00-05', 'EXACT',   exact_rule_id),
  ('USA',       'Panama',    '2026-06-15 16:00:00-05', 'group', '2026-06-15 15:30:00-05', 'EXACT',   exact_rule_id),
  ('Serbia',    'Uruguay',   '2026-06-15 19:00:00-05', 'group', '2026-06-15 18:30:00-05', 'OUTCOME', outcome_rule_id),
  ('Serbia',    'Panama',    '2026-06-19 16:00:00-05', 'group', '2026-06-19 15:30:00-05', 'OUTCOME', outcome_rule_id),
  ('Uruguay',   'USA',       '2026-06-19 16:00:00-05', 'group', '2026-06-19 15:30:00-05', 'EXACT',   exact_rule_id);

  -- ── Group B ─────────────────────────────────────────────────────────────────
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('Mexico',    'New Zealand','2026-06-12 20:00:00-06','group', '2026-06-12 19:30:00-06', 'EXACT',   exact_rule_id),
  ('Brazil',    'Saudi Arabia','2026-06-12 17:00:00-06','group','2026-06-12 16:30:00-06', 'EXACT',   exact_rule_id),
  ('Brazil',    'Mexico',    '2026-06-16 20:00:00-06', 'group', '2026-06-16 19:30:00-06', 'EXACT',   exact_rule_id),
  ('New Zealand','Saudi Arabia','2026-06-16 14:00:00-06','group','2026-06-16 13:30:00-06','OUTCOME', outcome_rule_id),
  ('Saudi Arabia','Mexico',  '2026-06-20 20:00:00-06', 'group', '2026-06-20 19:30:00-06', 'OUTCOME', outcome_rule_id),
  ('New Zealand','Brazil',   '2026-06-20 20:00:00-06', 'group', '2026-06-20 19:30:00-06', 'EXACT',   exact_rule_id);

  -- ── Group C ─────────────────────────────────────────────────────────────────
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('Argentina', 'Iceland',   '2026-06-13 13:00:00-05', 'group', '2026-06-13 12:30:00-05', 'EXACT',   exact_rule_id),
  ('Ecuador',   'Romania',   '2026-06-13 16:00:00-05', 'group', '2026-06-13 15:30:00-05', 'OUTCOME', outcome_rule_id),
  ('Argentina', 'Ecuador',   '2026-06-17 16:00:00-05', 'group', '2026-06-17 15:30:00-05', 'EXACT',   exact_rule_id),
  ('Romania',   'Iceland',   '2026-06-17 13:00:00-05', 'group', '2026-06-17 12:30:00-05', 'OUTCOME', outcome_rule_id),
  ('Argentina', 'Romania',   '2026-06-21 16:00:00-05', 'group', '2026-06-21 15:30:00-05', 'EXACT',   exact_rule_id),
  ('Iceland',   'Ecuador',   '2026-06-21 16:00:00-05', 'group', '2026-06-21 15:30:00-05', 'OUTCOME', outcome_rule_id);

  -- ── Group D ─────────────────────────────────────────────────────────────────
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('France',    'Bolivia',   '2026-06-13 20:00:00-05', 'group', '2026-06-13 19:30:00-05', 'EXACT',   exact_rule_id),
  ('Belgium',   'Senegal',   '2026-06-13 17:00:00-05', 'group', '2026-06-13 16:30:00-05', 'OUTCOME', outcome_rule_id),
  ('France',    'Belgium',   '2026-06-17 20:00:00-05', 'group', '2026-06-17 19:30:00-05', 'EXACT',   exact_rule_id),
  ('Senegal',   'Bolivia',   '2026-06-17 17:00:00-05', 'group', '2026-06-17 16:30:00-05', 'OUTCOME', outcome_rule_id),
  ('France',    'Senegal',   '2026-06-21 20:00:00-05', 'group', '2026-06-21 19:30:00-05', 'EXACT',   exact_rule_id),
  ('Belgium',   'Bolivia',   '2026-06-21 20:00:00-05', 'group', '2026-06-21 19:30:00-05', 'OUTCOME', outcome_rule_id);

  -- ── Group E ─────────────────────────────────────────────────────────────────
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('Spain',     'Tunisia',   '2026-06-14 16:00:00-05', 'group', '2026-06-14 15:30:00-05', 'EXACT',   exact_rule_id),
  ('Germany',   'Thailand',  '2026-06-14 19:00:00-05', 'group', '2026-06-14 18:30:00-05', 'EXACT',   exact_rule_id),
  ('Spain',     'Germany',   '2026-06-18 19:00:00-05', 'group', '2026-06-18 18:30:00-05', 'EXACT',   exact_rule_id),
  ('Thailand',  'Tunisia',   '2026-06-18 16:00:00-05', 'group', '2026-06-18 15:30:00-05', 'EXACT',   exact_rule_id),
  ('Spain',     'Thailand',  '2026-06-22 20:00:00-05', 'group', '2026-06-22 19:30:00-05', 'EXACT',   exact_rule_id),
  ('Germany',   'Tunisia',   '2026-06-22 20:00:00-05', 'group', '2026-06-22 19:30:00-05', 'OUTCOME', outcome_rule_id);

  -- ── Group F ─────────────────────────────────────────────────────────────────
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('England',   'Nigeria',   '2026-06-14 13:00:00-05', 'group', '2026-06-14 12:30:00-05', 'EXACT',   exact_rule_id),
  ('Portugal',  'DR Congo',  '2026-06-14 16:00:00-05', 'group', '2026-06-14 15:30:00-05', 'EXACT',   exact_rule_id),
  ('England',   'Portugal',  '2026-06-18 13:00:00-05', 'group', '2026-06-18 12:30:00-05', 'EXACT',   exact_rule_id),
  ('DR Congo',  'Nigeria',   '2026-06-18 16:00:00-05', 'group', '2026-06-18 15:30:00-05', 'OUTCOME', outcome_rule_id),
  ('England',   'DR Congo',  '2026-06-22 13:00:00-05', 'group', '2026-06-22 12:30:00-05', 'EXACT',   exact_rule_id),
  ('Nigeria',   'Portugal',  '2026-06-22 13:00:00-05', 'group', '2026-06-22 12:30:00-05', 'OUTCOME', outcome_rule_id);

  -- ── Knockout Stages (placeholder TBD teams) ──────────────────────────────────

  -- Round of 16
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('Group A 1st', 'Group B 2nd', '2026-06-29 16:00:00-05', 'round_of_16', '2026-06-29 15:30:00-05', 'EXACT', exact_rule_id),
  ('Group C 1st', 'Group D 2nd', '2026-06-29 20:00:00-05', 'round_of_16', '2026-06-29 19:30:00-05', 'EXACT', exact_rule_id),
  ('Group E 1st', 'Group F 2nd', '2026-06-30 16:00:00-05', 'round_of_16', '2026-06-30 15:30:00-05', 'EXACT', exact_rule_id),
  ('Group B 1st', 'Group A 2nd', '2026-06-30 20:00:00-05', 'round_of_16', '2026-06-30 19:30:00-05', 'EXACT', exact_rule_id);

  -- Quarter-finals
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('R16 Winner 1', 'R16 Winner 2', '2026-07-03 16:00:00-05', 'quarter_final', '2026-07-03 15:30:00-05', 'EXACT', exact_rule_id),
  ('R16 Winner 3', 'R16 Winner 4', '2026-07-03 20:00:00-05', 'quarter_final', '2026-07-03 19:30:00-05', 'EXACT', exact_rule_id);

  -- Semi-finals
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('QF Winner 1', 'QF Winner 2', '2026-07-07 19:00:00-05', 'semi_final', '2026-07-07 18:30:00-05', 'EXACT', exact_rule_id),
  ('QF Winner 3', 'QF Winner 4', '2026-07-08 19:00:00-05', 'semi_final', '2026-07-08 18:30:00-05', 'EXACT', exact_rule_id);

  -- The Final
  insert into public.matches (home_team, away_team, kickoff_at, stage, prediction_close_at, scoring_mode, scoring_rule_id) values
  ('SF Winner 1', 'SF Winner 2', '2026-07-19 17:00:00-05', 'final', '2026-07-19 16:00:00-05', 'EXACT', exact_rule_id);

end;
$$;
