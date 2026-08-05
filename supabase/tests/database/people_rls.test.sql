begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(10);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'user-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'user-b@example.test');

insert into public.people (id, user_id, full_name, called_name, date_of_birth)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'User A Person', '', date '1990-01-01'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'User B Person', '', date '1991-02-02');

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

select extensions.lives_ok(
  $$insert into public.people (user_id, full_name, called_name, date_of_birth)
    values ('11111111-1111-4111-8111-111111111111', 'User A New Person', '', date '1992-03-03')$$,
  'User A can create a row owned by User A'
);

select extensions.results_eq(
  $$select count(*)::bigint from public.people where user_id = '11111111-1111-4111-8111-111111111111'$$,
  $$values (2::bigint)$$,
  'User A can read User A records'
);

select extensions.results_eq(
  $$select name_alphabet_mode from public.people where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  $$values ('latin'::text)$$,
  'Existing records default to Latin alphabet mode'
);

select extensions.lives_ok(
  $$insert into public.people (user_id, full_name, called_name, date_of_birth, name_alphabet_mode)
    values ('11111111-1111-4111-8111-111111111111', 'Bulgarian Person', '', date '1992-03-04', 'bulgarian-cyrillic')$$,
  'User A can save Bulgarian alphabet mode on an owned person'
);

select extensions.results_eq(
  $$select count(*)::bigint from public.people where user_id = '22222222-2222-4222-8222-222222222222'$$,
  $$values (0::bigint)$$,
  'User A cannot read User B records'
);

select extensions.results_eq(
  $$with changed as (
      update public.people set full_name = 'Compromised'
      where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      returning id
    ) select count(*)::bigint from changed$$,
  $$values (0::bigint)$$,
  'User A cannot update User B records'
);

select extensions.results_eq(
  $$with removed as (
      delete from public.people
      where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      returning id
    ) select count(*)::bigint from removed$$,
  $$values (0::bigint)$$,
  'User A cannot delete User B records'
);

select extensions.throws_ok(
  $$insert into public.people (user_id, full_name, called_name, date_of_birth)
    values ('22222222-2222-4222-8222-222222222222', 'Wrong Owner', '', date '1993-04-04')$$,
  '42501',
  null,
  'User A cannot insert a row owned by User B'
);

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select extensions.throws_ok(
  $$select * from public.people$$,
  '42501',
  null,
  'An unauthenticated request cannot read people'
);

select extensions.throws_ok(
  $$insert into public.people (user_id, full_name, called_name, date_of_birth)
    values ('11111111-1111-4111-8111-111111111111', 'Anonymous Person', '', date '1994-05-05')$$,
  '42501',
  null,
  'An unauthenticated request cannot create people'
);

select * from extensions.finish();
rollback;
