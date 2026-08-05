begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(19);

-- Set up test users
insert into auth.users (id, email)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'user@example.test'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'other@example.test'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'admin@example.test');

-- Bootstrap the owner role for the owner user
insert into public.app_roles (user_id, role, granted_by, reason)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Initial bootstrap');

-- Bootstrap admin role for the admin user
insert into public.app_roles (user_id, role, granted_by, reason)
values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'admin', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Admin grant');

-- Add some test people records so the search function works
insert into public.people (id, user_id, full_name, called_name, date_of_birth)
values
  ('11111111-aaaa-4aaa-8aaa-111111111111', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Test Person', '', date '1990-01-01'),
  ('22222222-aaaa-4aaa-8aaa-222222222222', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Other Person', '', date '1991-02-02');

-- ── Test: Owner can read all app_roles ──────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);

select extensions.results_eq(
  $$select count(*)::bigint from public.app_roles$$,
  $$values (2::bigint)$$,
  'Owner can read all app_roles'
);

-- ── Test: Regular user can read only their own roles ──────────────────────
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', true);

select extensions.results_eq(
  $$select count(*)::bigint from public.app_roles$$,
  $$values (0::bigint)$$,
  'Regular user with no role sees zero app_roles rows'
);

-- ── Test: Regular user cannot insert app_roles ───────────────────────────
select extensions.throws_ok(
  $$insert into public.app_roles (user_id, role, reason) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'owner', 'Self-escalation attempt')$$,
  '42501',
  null,
  'Regular user cannot self-escalate to owner role'
);

-- ── Test: Regular user cannot insert entitlements ─────────────────────────
select extensions.throws_ok(
  $$insert into public.entitlements (user_id, capability, granted_by, reason, is_permanent)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'chart_access', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Self-grant attempt', true)$$,
  '42501',
  null,
  'Regular user cannot grant entitlements to themselves'
);

-- ── Test: Owner can insert entitlements ────────────────────────────────────
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);

select extensions.lives_ok(
  $$insert into public.entitlements (user_id, capability, granted_by, reason, is_permanent)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'chart_access', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Test grant', true)$$,
  'Owner can grant entitlement to regular user'
);

-- ── Test: Granting created entitlement_history via trigger ───────────────
select extensions.results_eq(
  $$select count(*)::bigint from public.entitlement_history where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  $$values (1::bigint)$$,
  'Granting an entitlement recorded immutable history'
);

-- ── Test: Regular user can read their own entitlements ────────────────────
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', true);

select extensions.results_eq(
  $$select count(*)::bigint from public.entitlements where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  $$values (1::bigint)$$,
  'Regular user can read their own entitlements'
);

-- ── Test: Regular user cannot read other user entitlements ───────────────
select extensions.results_eq(
  $$select count(*)::bigint from public.entitlements where user_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'$$,
  $$values (0::bigint)$$,
  'Regular user cannot read other user entitlements'
);

-- ── Test: Regular user cannot read entitlement_history ───────────────────
select extensions.results_eq(
  $$select count(*)::bigint from public.entitlement_history$$,
  $$values (1::bigint)$$,
  'Regular user reads only their own entitlement_history'
);

-- ── Test: Regular user cannot update their own entitlement ───────────────
select extensions.results_eq(
  $$with changed as (
      update public.entitlements
      set status = 'revoked'
      where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      returning 1
    )
    select count(*)::bigint from changed$$,
  $$values (0::bigint)$$,
  'Regular user cannot modify their own entitlement'
);

-- ── Test: Regular user cannot delete their own entitlement ──────────────
select extensions.results_eq(
  $$with changed as (
      delete from public.entitlements
      where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      returning 1
    )
    select count(*)::bigint from changed$$,
  $$values (0::bigint)$$,
  'Regular user cannot delete their own entitlement'
);

-- ── Test: Owner can read all entitlements ────────────────────────────────
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);

select extensions.results_eq(
  $$select count(*)::bigint from public.entitlements$$,
  $$values (1::bigint)$$,
  'Owner can read all entitlements'
);

-- ── Test: Owner can read all entitlement_history ─────────────────────────
select extensions.results_eq(
  $$select count(*)::bigint from public.entitlement_history$$,
  $$values (1::bigint)$$,
  'Owner can read all entitlement_history'
);

-- ── Test: Owner can revoke (update) an entitlement ───────────────────────
select extensions.lives_ok(
  $$update public.entitlements set status = 'revoked', revoked_by = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', revoked_at = pg_catalog.now(), revoke_reason = 'Test revocation' where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' and capability = 'chart_access'$$,
  'Owner can revoke an entitlement'
);

-- ── Test: Revoking creates history entry ────────────────────────────────
select extensions.results_eq(
  $$select count(*)::bigint from public.entitlement_history where action = 'revoke'$$,
  $$values (1::bigint)$$,
  'Revoking an entitlement created revoke history entry'
);

-- ── Test: has_active_entitlement function returns false for revoked ─────
reset role;
select extensions.results_eq(
  $$select public.has_active_entitlement('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid, 'chart_access'::public.entitlement_capability)$$,
  $$values (false)$$,
  'has_active_entitlement returns false for revoked entitlement'
);

-- ── Test: Admin can grant entitlements ───────────────────────────────────
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', true);

select extensions.lives_ok(
  $$insert into public.entitlements (user_id, capability, granted_by, reason, is_permanent)
    values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'timeline_access', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Admin grant', true)$$,
  'Admin can grant entitlement to other user'
);

-- ── Test: Anon cannot read entitlements ─────────────────────────────────
reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select extensions.throws_ok(
  $$select * from public.entitlements$$,
  '42501',
  null,
  'Anon cannot read entitlements'
);

-- ── Test: Anon cannot read app_roles ───────────────────────────────────
select extensions.throws_ok(
  $$select * from public.app_roles$$,
  '42501',
  null,
  'Anon cannot read app_roles'
);

select * from extensions.finish();
rollback;
