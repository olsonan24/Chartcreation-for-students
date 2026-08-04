create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  called_name text not null default '',
  date_of_birth date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint people_full_name_length check (
    char_length(btrim(full_name)) between 1 and 200
  ),
  constraint people_called_name_length check (
    char_length(called_name) <= 200
  ),
  constraint people_date_of_birth_range check (
    date_of_birth >= date '1000-01-01'
  )
);

comment on table public.people is
  'Minimal source data used by the Aionis application to reproduce a person chart.';

create index people_user_id_idx on public.people (user_id);

create function public.set_people_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger people_set_updated_at
before update on public.people
for each row
execute function public.set_people_updated_at();

alter table public.people enable row level security;

revoke all on table public.people from anon;
grant select, insert, update, delete on table public.people to authenticated;

create policy "Users can read their own people"
on public.people
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own people"
on public.people
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own people"
on public.people
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own people"
on public.people
for delete
to authenticated
using ((select auth.uid()) = user_id);
