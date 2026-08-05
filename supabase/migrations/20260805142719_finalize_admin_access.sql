-- Finalize owner/admin policy access without exposing security-definer helpers
-- through the public Data API schema. Also grant permanent full access to the
-- two explicitly designated Aionis administrator email addresses. If a
-- designated address signs up after this migration, the auth trigger applies
-- the same role and entitlements at account creation time.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_owner_or_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_roles
    where user_id = (select auth.uid())
      and role in ('owner', 'admin')
  );
$$;

revoke all on function private.is_owner_or_admin() from public, anon, authenticated;
grant execute on function private.is_owner_or_admin() to authenticated;

-- Entitlement history is immutable to authenticated users. Its trigger
-- functions therefore execute with the migration owner's privileges.
alter function public.record_entitlement_grant() security definer;
alter function public.record_entitlement_change() security definer;

revoke execute on function public.record_entitlement_grant()
  from public, anon, authenticated;
revoke execute on function public.record_entitlement_change()
  from public, anon, authenticated;

alter policy "Owners and admins can read all roles"
  on public.app_roles
  using ((select private.is_owner_or_admin()));

alter policy "Owners can manage roles"
  on public.app_roles
  with check ((select private.is_owner_or_admin()));

alter policy "Owners can update roles"
  on public.app_roles
  using ((select private.is_owner_or_admin()))
  with check ((select private.is_owner_or_admin()));

alter policy "Owners can delete roles"
  on public.app_roles
  using ((select private.is_owner_or_admin()));

alter policy "Owners and admins can read all entitlements"
  on public.entitlements
  using ((select private.is_owner_or_admin()));

alter policy "Owners can create entitlements"
  on public.entitlements
  with check ((select private.is_owner_or_admin()));

alter policy "Owners can update entitlements"
  on public.entitlements
  using ((select private.is_owner_or_admin()))
  with check ((select private.is_owner_or_admin()));

alter policy "Owners can delete entitlements"
  on public.entitlements
  using ((select private.is_owner_or_admin()));

alter policy "Owners and admins can read all entitlement history"
  on public.entitlement_history
  using ((select private.is_owner_or_admin()));

-- Keep the superseded public helper unavailable as an RPC endpoint.
revoke execute on function public.is_owner_or_admin(uuid) from public, anon, authenticated;

create or replace function private.ensure_designated_admin_access(
  p_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_catalog.lower(coalesce(p_email, '')) not in (
    'olsonan24@gmail.com',
    'youwillalertme@gmail.com'
  ) then
    return;
  end if;

  insert into public.app_roles (user_id, role, granted_by, reason)
  values (
    p_user_id,
    'admin',
    p_user_id,
    'Designated Aionis administrator'
  )
  on conflict (user_id, role) do update
    set reason = excluded.reason;

  insert into public.entitlements (
    user_id,
    capability,
    status,
    granted_by,
    expires_at,
    revoked_by,
    revoked_at,
    revoke_reason,
    is_permanent,
    reason
  )
  select
    p_user_id,
    capability,
    'active',
    p_user_id,
    null,
    null,
    null,
    '',
    true,
    'Permanent access for designated Aionis administrator'
  from pg_catalog.unnest(
    pg_catalog.enum_range(null::public.entitlement_capability)
  ) as capability
  on conflict (user_id, capability) do update
    set status = excluded.status,
        granted_by = excluded.granted_by,
        expires_at = excluded.expires_at,
        revoked_by = excluded.revoked_by,
        revoked_at = excluded.revoked_at,
        revoke_reason = excluded.revoke_reason,
        is_permanent = excluded.is_permanent,
        reason = excluded.reason;
end;
$$;

revoke all on function private.ensure_designated_admin_access(uuid, text)
  from public, anon, authenticated;

create or replace function private.apply_designated_admin_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.ensure_designated_admin_access(new.id, new.email);
  return new;
end;
$$;

revoke all on function private.apply_designated_admin_access()
  from public, anon, authenticated;

drop trigger if exists apply_designated_admin_access on auth.users;
create trigger apply_designated_admin_access
after insert or update of email on auth.users
for each row
execute function private.apply_designated_admin_access();

-- Backfill any designated accounts that already exist when the migration runs.
do $$
declare
  designated_user record;
begin
  for designated_user in
    select id, email
    from auth.users
    where pg_catalog.lower(email) in (
      'olsonan24@gmail.com',
      'youwillalertme@gmail.com'
    )
  loop
    perform private.ensure_designated_admin_access(
      designated_user.id,
      designated_user.email
    );
  end loop;
end;
$$;
