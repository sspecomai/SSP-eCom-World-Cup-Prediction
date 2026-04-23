-- Supersports Thailand eCom World Cup 2026 Prediction schema
create extension if not exists "uuid-ossp";

create type public.app_role as enum ('admin', 'user');
create type public.answer_type as enum ('single_choice', 'multi_choice', 'text');
create type public.prediction_mode as enum ('OUTCOME', 'EXACT');
create type public.tournament_stage as enum ('group', 'round_of_16', 'quarter_final', 'semi_final', 'final');

create table public.roles (
  id uuid primary key default uuid_generate_v4(),
  role public.app_role not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  display_name text not null,
  nickname text not null unique,
  favorite_team text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scoring_rules (
  id uuid primary key default uuid_generate_v4(),
  context text not null check (context in ('pre_question', 'match_prediction')),
  prediction_mode public.prediction_mode,
  score_correct integer not null,
  score_wrong integer not null,
  score_fallback integer default 0,
  allow_edit_before_timeout boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pre_questions (
  id uuid primary key default uuid_generate_v4(),
  question_text text not null,
  answer_type public.answer_type not null,
  open_at timestamptz not null,
  close_at timestamptz not null,
  scoring_rule_id uuid not null references public.scoring_rules(id),
  correct_answer text,
  is_locked boolean not null default false,
  is_result_published boolean not null default false,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (close_at > open_at)
);

create table public.pre_question_options (
  id uuid primary key default uuid_generate_v4(),
  pre_question_id uuid not null references public.pre_questions(id) on delete cascade,
  option_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pre_question_answers (
  id uuid primary key default uuid_generate_v4(),
  pre_question_id uuid not null references public.pre_questions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  answer_value text not null,
  score integer,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pre_question_id, user_id)
);

create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz not null,
  stage public.tournament_stage not null,
  prediction_close_at timestamptz not null,
  scoring_mode public.prediction_mode not null,
  scoring_rule_id uuid not null references public.scoring_rules(id),
  final_home_score integer,
  final_away_score integer,
  is_locked boolean not null default false,
  is_result_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (prediction_close_at <= kickoff_at)
);

create table public.match_predictions (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  predicted_home_score integer not null,
  predicted_away_score integer not null,
  score integer,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id)
);

create or replace function public.is_admin() returns boolean
language sql stable security definer as $$
  select exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.id = auth.uid() and r.role = 'admin'
  );
$$;

create or replace view public.leaderboard_summary as
select
  u.id as user_id,
  u.nickname as username,
  coalesce(sum(pqa.score), 0) as pre_question_score,
  coalesce(sum(mp.score), 0) as match_prediction_score,
  coalesce(sum(pqa.score), 0) + coalesce(sum(mp.score), 0) as total_score,
  coalesce(sum(case when m.scoring_mode = 'EXACT' then mp.score else 0 end), 0) as exact_result_points,
  coalesce(sum(case when m.scoring_mode = 'OUTCOME' then mp.score else 0 end), 0) as win_draw_lose_points,
  least(coalesce(min(pqa.submitted_at), now()), coalesce(min(mp.submitted_at), now())) as first_submission_at
from public.users u
left join public.pre_question_answers pqa on pqa.user_id = u.id
left join public.match_predictions mp on mp.user_id = u.id
left join public.matches m on m.id = mp.match_id
group by u.id, u.nickname;

alter table public.users enable row level security;
alter table public.pre_questions enable row level security;
alter table public.pre_question_options enable row level security;
alter table public.pre_question_answers enable row level security;
alter table public.matches enable row level security;
alter table public.match_predictions enable row level security;
alter table public.scoring_rules enable row level security;

create policy "users own profile" on public.users for select using (auth.uid() = id or public.is_admin());
create policy "users update own profile" on public.users for update using (auth.uid() = id or public.is_admin());
create policy "admin manage users" on public.users for all using (public.is_admin()) with check (public.is_admin());

create policy "all read questions" on public.pre_questions for select using (true);
create policy "admin manage pre_questions" on public.pre_questions for all using (public.is_admin()) with check (public.is_admin());

create policy "all read question options" on public.pre_question_options for select using (true);
create policy "admin manage question options" on public.pre_question_options for all using (public.is_admin()) with check (public.is_admin());

create policy "users own answers" on public.pre_question_answers for select using (user_id = auth.uid() or public.is_admin());
create policy "users submit answers" on public.pre_question_answers for insert with check (user_id = auth.uid());
create policy "users update own answers" on public.pre_question_answers for update using (user_id = auth.uid() or public.is_admin());
create policy "admin manage answers" on public.pre_question_answers for all using (public.is_admin()) with check (public.is_admin());

create policy "all read matches" on public.matches for select using (true);
create policy "admin manage matches" on public.matches for all using (public.is_admin()) with check (public.is_admin());

create policy "users own predictions" on public.match_predictions for select using (user_id = auth.uid() or public.is_admin());
create policy "users submit predictions" on public.match_predictions for insert with check (user_id = auth.uid());
create policy "users update own predictions" on public.match_predictions for update using (user_id = auth.uid() or public.is_admin());
create policy "admin manage predictions" on public.match_predictions for all using (public.is_admin()) with check (public.is_admin());

create policy "admin scoring rules" on public.scoring_rules for all using (public.is_admin()) with check (public.is_admin());
create policy "read scoring rules" on public.scoring_rules for select using (true);
