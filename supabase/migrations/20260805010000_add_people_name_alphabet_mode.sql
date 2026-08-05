alter table public.people
  add column name_alphabet_mode text not null default 'latin';

alter table public.people
  add constraint people_name_alphabet_mode_check
  check (name_alphabet_mode in ('latin', 'bulgarian-cyrillic'));

comment on column public.people.name_alphabet_mode is
  'Alphabet used to interpret name letters while preserving the shared chart engine.';
