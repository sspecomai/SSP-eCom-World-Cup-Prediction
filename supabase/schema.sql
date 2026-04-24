-- =============================================================================
-- Supersports Thailand × World Cup 2026 Prediction Game
-- Supabase / PostgreSQL Schema
-- =============================================================================

create extension if not exists "uuid-ossp";

-- ── Enum Types ────────────────────────────────────────────────────────────────

create type public.app_role       as enum ('admin', 'user');
create type public.answer_type    as enum ('single_choice', 'multi_choice', 'text');
create type public.prediction_mode as enum ('OUTCOME', 'EXACT');
create type public.tournament_stage as enum (
  'group', 'round_of_16', 'quarter_final', 'semi_final', 'final'
);

-- ── Helpers ───────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Roles ────────────────────────────────────────────────────────────────────

create table public.roles (
  id         uuid primary key default uuid_generate_v4(),
  role       public.app_role not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger roles_updated_at before update on public.roles
  for each row execute function public.set_updated_at();

-- ── Users (Profiles) ─────────────────────────────────────────────────────────

create table public.users (
  id             uuid primary key references auth.users(id) on delete cascade,
  role_id        uuid not null references public.roles(id),
  display_name   text not null,
  nickname       text not null unique,
  favorite_team  text,
  football_alias text,
  avatar_url     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_users_nickname on public.users (nickname);

create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();

-- ── Scoring Rules ─────────────────────────────────────────────────────────────

create table public.scoring_rules (
  id                       uuid primary key default uuid_generate_v4(),
  context                  text not null check (context in ('pre_question', 'match_prediction')),
  prediction_mode          public.prediction_mode,
  score_correct            integer not null,
  score_wrong              integer not null,
  score_fallback           integer not null default 0,
  allow_edit_before_timeout boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create trigger scoring_rules_updated_at before update on public.scoring_rules
  for each row execute function public.set_updated_at();

-- ── Pre-Questions ─────────────────────────────────────────────────────────────

create table public.pre_questions (
  id                  uuid primary key default uuid_generate_v4(),
  question_text       text not null,
  answer_type         public.answer_type not null,
  open_at             timestamptz not null,
  close_at            timestamptz not null,
  scoring_rule_id     uuid not null references public.scoring_rules(id),
  correct_answer      text,
  is_locked           boolean not null default false,
  is_result_published boolean not null default false,
  created_by          uuid references public.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (close_at > open_at)
);

create index idx_pre_questions_close_at on public.pre_questions (close_at);

create trigger pre_questions_updated_at before update on public.pre_questions
  for each row execute function public.set_updated_at();

-- ── Pre-Question Options ──────────────────────────────────────────────────────

create table public.pre_question_options (
  id               uuid primary key default uuid_generate_v4(),
  pre_question_id  uuid not null references public.pre_questions(id) on delete cascade,
  option_text      text not null,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_pre_question_options_q on public.pre_question_options (pre_question_id);

create trigger pre_question_options_updated_at before update on public.pre_question_options
  for each row execute function public.set_updated_at();

-- ── Pre-Question Answers ──────────────────────────────────────────────────────

create table public.pre_question_answers (
  id               uuid primary key default uuid_generate_v4(),
  pre_question_id  uuid not null references public.pre_questions(id) on delete cascade,
  user_id          uuid not null references public.users(id) on delete cascade,
  answer_value     text not null,
  score            integer,
  submitted_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (pre_question_id, user_id)
);

create index idx_pqa_user    on public.pre_question_answers (user_id);
create index idx_pqa_question on public.pre_question_answers (pre_question_id);

create trigger pre_question_answers_updated_at before update on public.pre_question_answers
  for each row execute function public.set_updated_at();

-- ── Matches ───────────────────────────────────────────────────────────────────

create table public.matches (
  id                    uuid primary key default uuid_generate_v4(),
  home_team             text not null,
  away_team             text not null,
  kickoff_at            timestamptz not null,
  stage                 public.tournament_stage not null,
  prediction_close_at   timestamptz not null,
  scoring_mode          public.prediction_mode not null,
  scoring_rule_id       uuid not null references public.scoring_rules(id),
  final_home_score      integer,
  final_away_score      integer,
  is_locked             boolean not null default false,
  is_result_published   boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (prediction_close_at <= kickoff_at)
);

create index idx_matches_kickoff on public.matches (kickoff_at);
create index idx_matches_stage   on public.matches (stage);

create trigger matches_updated_at before update on public.matches
  for each row execute function public.set_updated_at();

-- ── Match Predictions ─────────────────────────────────────────────────────────

create table public.match_predictions (
  id                    uuid primary key default uuid_generate_v4(),
  match_id              uuid not null references public.matches(id) on delete cascade,
  user_id               uuid not null references public.users(id) on delete cascade,
  predicted_home_score  integer not null check (predicted_home_score >= 0),
  predicted_away_score  integer not null check (predicted_away_score >= 0),
  score                 integer,
  submitted_at          timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (match_id, user_id)
);

create index idx_mp_user  on public.match_predictions (user_id);
create index idx_mp_match on public.match_predictions (match_id);

create trigger match_predictions_updated_at before update on public.match_predictions
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Views
-- =============================================================================

-- ── Matches with scoring fields (denormalised) ────────────────────────────────

create or replace view public.matches_with_scoring as
select
  m.*,
  sr.score_correct         as correct_score,
  sr.score_wrong           as wrong_score,
  sr.score_fallback        as fallback_outcome_score,
  sr.allow_edit_before_timeout
from public.matches m
join public.scoring_rules sr on sr.id = m.scoring_rule_id;

-- ── Pre-questions with scoring fields (denormalised) ─────────────────────────

create or replace view public.pre_questions_with_scoring as
select
  pq.*,
  sr.score_correct,
  sr.score_wrong,
  sr.allow_edit_before_timeout
from public.pre_questions pq
join public.scoring_rules sr on sr.id = pq.scoring_rule_id;

-- ── Leaderboard summary ───────────────────────────────────────────────────────

create or replace view public.leaderboard_summary as
select
  u.id                                                             as user_id,
  u.display_name,
  u.nickname,
  u.favorite_team,
  u.avatar_url,
  coalesce(sum(pqa.score), 0)                                     as pre_question_score,
  coalesce(sum(mp.score),  0)                                     as match_prediction_score,
  coalesce(sum(pqa.score), 0) + coalesce(sum(mp.score), 0)        as total_score,
  -- Exact-result points: predictions where score = correct_score on EXACT matches
  coalesce(
    sum(
      case
        when m.scoring_mode = 'EXACT'
         and mp.predicted_home_score = m.final_home_score
         and mp.predicted_away_score = m.final_away_score
        then mp.score
        else 0
      end
    ), 0
  )                                                                as exact_result_points,
  -- Outcome points: predictions with outcome correct but not exact
  coalesce(
    sum(
      case
        when mp.score is not null
         and not (
               m.scoring_mode = 'EXACT'
               and mp.predicted_home_score = m.final_home_score
               and mp.predicted_away_score = m.final_away_score
             )
        then mp.score
        else 0
      end
    ), 0
  )                                                                as outcome_points,
  least(
    coalesce(min(pqa.submitted_at), now()),
    coalesce(min(mp.submitted_at),  now())
  )                                                                as first_submission_at
from public.users u
left join public.pre_question_answers pqa on pqa.user_id = u.id
left join public.match_predictions    mp  on mp.user_id  = u.id
left join public.matches              m   on m.id        = mp.match_id
group by u.id, u.display_name, u.nickname, u.favorite_team, u.avatar_url;

-- =============================================================================
-- Functions
-- =============================================================================

-- ── is_admin() ────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.id = auth.uid() and r.role = 'admin'
  );
$$;

-- ── Auto-create profile on signup ─────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_role_id uuid;
  raw_dn       text;
  raw_nn       text;
  suffix       int  := 0;
  final_nn     text;
begin
  select id into user_role_id from public.roles where role = 'user';

  raw_dn := coalesce(
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );
  raw_nn := coalesce(
    new.raw_user_meta_data->>'nickname',
    split_part(new.email, '@', 1)
  );

  -- Ensure nickname uniqueness by appending a suffix if needed
  final_nn := raw_nn;
  loop
    exit when not exists (select 1 from public.users where nickname = final_nn);
    suffix := suffix + 1;
    final_nn := raw_nn || suffix::text;
  end loop;

  insert into public.users (
    id, role_id, display_name, nickname, favorite_team, football_alias
  ) values (
    new.id,
    user_role_id,
    raw_dn,
    final_nn,
    new.raw_user_meta_data->>'favorite_team',
    new.raw_user_meta_data->>'football_alias'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Score all predictions for a match (called after publishing result) ────────

create or replace function public.score_match_predictions(p_match_id uuid)
returns void language plpgsql security definer as $$
declare
  m  matches%rowtype;
  sr scoring_rules%rowtype;
  pred_outcome text;
  actual_outcome text;
begin
  select * into m  from public.matches       where id = p_match_id;
  select * into sr from public.scoring_rules where id = m.scoring_rule_id;

  if m.final_home_score is null or m.final_away_score is null then return; end if;

  actual_outcome := case
    when m.final_home_score > m.final_away_score then 'H'
    when m.final_home_score < m.final_away_score then 'A'
    else 'D'
  end;

  update public.match_predictions p
  set score = case
    when m.scoring_mode = 'EXACT' then
      case
        when p.predicted_home_score = m.final_home_score
         and p.predicted_away_score = m.final_away_score
          then sr.score_correct
        when (case
                when p.predicted_home_score > p.predicted_away_score then 'H'
                when p.predicted_home_score < p.predicted_away_score then 'A'
                else 'D'
              end) = actual_outcome
          then sr.score_fallback
        else sr.score_wrong
      end
    else  -- OUTCOME
      case
        when (case
                when p.predicted_home_score > p.predicted_away_score then 'H'
                when p.predicted_home_score < p.predicted_away_score then 'A'
                else 'D'
              end) = actual_outcome
          then sr.score_correct
        else sr.score_wrong
      end
  end,
  updated_at = now()
  where p.match_id = p_match_id;
end;
$$;

-- ── Score all answers for a pre-question (called after publishing result) ─────

create or replace function public.score_pre_question_answers(p_question_id uuid)
returns void language plpgsql security definer as $$
declare
  q  pre_questions%rowtype;
  sr scoring_rules%rowtype;
begin
  select * into q  from public.pre_questions  where id = p_question_id;
  select * into sr from public.scoring_rules  where id = q.scoring_rule_id;

  if q.correct_answer is null then return; end if;

  update public.pre_question_answers a
  set score = case
    when lower(trim(a.answer_value)) = lower(trim(q.correct_answer))
      then sr.score_correct
    else sr.score_wrong
  end,
  updated_at = now()
  where a.pre_question_id = p_question_id;
end;
$$;

-- =============================================================================
-- Row-Level Security
-- =============================================================================

alter table public.users                enable row level security;
alter table public.scoring_rules        enable row level security;
alter table public.pre_questions        enable row level security;
alter table public.pre_question_options enable row level security;
alter table public.pre_question_answers enable row level security;
alter table public.matches              enable row level security;
alter table public.match_predictions    enable row level security;

-- ── Users ─────────────────────────────────────────────────────────────────────

-- Any authenticated user can read public profiles (needed for leaderboard)
create policy "read all profiles"
  on public.users for select using (auth.role() = 'authenticated');

-- Users can only update their own profile; admins can update anyone's
create policy "users update own profile"
  on public.users for update using (auth.uid() = id or public.is_admin());

-- Profile is auto-created by trigger; admins can insert directly
create policy "admin insert users"
  on public.users for insert with check (public.is_admin());

-- Only admins can delete
create policy "admin delete users"
  on public.users for delete using (public.is_admin());

-- ── Scoring Rules ─────────────────────────────────────────────────────────────

create policy "read scoring rules"
  on public.scoring_rules for select using (true);
create policy "admin manage scoring rules"
  on public.scoring_rules for all using (public.is_admin()) with check (public.is_admin());

-- ── Pre-Questions ─────────────────────────────────────────────────────────────

create policy "read all pre_questions"
  on public.pre_questions for select using (true);
create policy "admin manage pre_questions"
  on public.pre_questions for all using (public.is_admin()) with check (public.is_admin());

-- ── Pre-Question Options ──────────────────────────────────────────────────────

create policy "read all pre_question_options"
  on public.pre_question_options for select using (true);
create policy "admin manage pre_question_options"
  on public.pre_question_options for all using (public.is_admin()) with check (public.is_admin());

-- ── Pre-Question Answers ──────────────────────────────────────────────────────

create policy "users read own answers"
  on public.pre_question_answers for select
  using (user_id = auth.uid() or public.is_admin());

create policy "users submit answers"
  on public.pre_question_answers for insert
  with check (user_id = auth.uid());

create policy "users update own answers"
  on public.pre_question_answers for update
  using (user_id = auth.uid() or public.is_admin());

create policy "admin manage answers"
  on public.pre_question_answers for delete
  using (public.is_admin());

-- ── Matches ───────────────────────────────────────────────────────────────────

create policy "read all matches"
  on public.matches for select using (true);
create policy "admin manage matches"
  on public.matches for all using (public.is_admin()) with check (public.is_admin());

-- ── Match Predictions ─────────────────────────────────────────────────────────

create policy "users read own predictions"
  on public.match_predictions for select
  using (user_id = auth.uid() or public.is_admin());

create policy "users submit predictions"
  on public.match_predictions for insert
  with check (user_id = auth.uid());

create policy "users update own predictions"
  on public.match_predictions for update
  using (user_id = auth.uid() or public.is_admin());

create policy "admin manage predictions"
  on public.match_predictions for delete
  using (public.is_admin());
