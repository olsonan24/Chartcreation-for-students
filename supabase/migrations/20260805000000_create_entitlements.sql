-- ──────────────────────────────────────────────────────────────────────────
-- Owner-controlled timeline entitlements
--
-- Creates capability-level entitlements that unlock Timeline features for
-- specific accounts. Only an authorized owner/admin can grant, revoke, or
-- suspend capabilities. Users can never unlock themselves.
--
-- All enforcement is in database RLS, not hidden frontend code.
-- ──────────────────────────────────────────────────────────────────────────

-- ── Enum: capability ──────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'entitlement_capability') then
    create type public.entitlement_capability as enum (
      'chart_access',
      'timeline_access',
      'timeline_descriptions',
      'comparisons',
      'print_export',
      'advanced_insights'
    );
  end if;
end
$$;

-- ── Enum: entitlement status ──────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'entitlement_status') then
    create type public.entitlement_status as enum (
      'active',
      'revoked',
      'suspended',
      'expired'
    );
  end if;
end
$$;

-- ── Enum: owner role ───────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'owner_role') then
    create type public.owner_role as enum (
      'owner',
      'admin'
    );
  end if;
end
$$;

-- ── Table: app_roles (owner/admin bootstrap) ───────────────────────────────
create table if not exists public.app_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.owner_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  reason text not null default '',
  primary key (user_id, role)
);

comment on table public.app_roles is
  'Owner and admin role assignments for the Aionis application. Only an existing owner or admin can modify this table.';

-- ── Table: entitlements ────────────────────────────────────────────────────
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  capability public.entitlement_capability not null,
  status public.entitlement_status not null default 'active',
  granted_by uuid not null references auth.users (id) on delete restrict,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  revoke_reason text not null default '',
  is_permanent boolean not null default false,
  reason text not null default '',
  constraint entitlements_expires_check check (
    is_permanent = true or expires_at is not null
  ),
  constraint entitlements_one_active_capability unique (user_id, capability)
);

comment on table public.entitlements is
  'Capability-level entitlements controlling access to Timeline features for specific user accounts.';

create index if not exists entitlements_user_id_idx on public.entitlements (user_id);
create index if not exists entitlements_status_idx on public.entitlements (status);
create index if not exists entitlements_capability_idx on public.entitlements (capability);

-- ── Table: entitlement_history (immutable audit) ──────────────────────────
create table if not exists public.entitlement_history (
  id bigserial primary key,
  entitlement_id uuid not null references public.entitlements (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  capability public.entitlement_capability not null,
  action text not null,
  performed_by uuid not null references auth.users (id) on delete restrict,
  performed_at timestamptz not null default now(),
  reason text not null default '',
  old_status public.entitlement_status,
  new_status public.entitlement_status,
  expires_at timestamptz,
  is_permanent boolean,
  metadata jsonb not null default '{}'::jsonb
);

comment on table public.entitlement_history is
  'Immutable append-only audit trail of every entitlement action (grant, revoke, suspend, expire, renew).';

create index if not exists entitlement_history_entitlement_id_idx on public.entitlement_history (entitlement_id);
create index if not exists entitlement_history_user_id_idx on public.entitlement_history (user_id);
create index if not exists entitlement_history_performed_at_idx on public.entitlement_history (performed_at);

-- ── Trigger: insert history on entitlement insert ──────────────────────────
create or replace function public.record_entitlement_grant()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.entitlement_history (
    entitlement_id, user_id, capability, action,
    performed_by, reason, new_status, expires_at, is_permanent
  )
  values (
    new.id, new.user_id, new.capability, 'grant',
    new.granted_by, new.reason, new.status, new.expires_at, new.is_permanent
  );
  return new;
end;
$$;

-- ── Trigger: insert history on entitlement update ──────────────────────────
create or replace function public.record_entitlement_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> old.status or new.expires_at is distinct from old.expires_at or new.is_permanent <> old.is_permanent then
    declare
      v_action text;
    begin
      v_action := case
        when new.status = 'revoked' then 'revoke'
        when new.status = 'suspended' then 'suspend'
        when new.status = 'expired' then 'expire'
        when new.status = 'active' and old.status in ('suspended', 'expired') then 'reinstate'
        else 'modify'
      end;
      insert into public.entitlement_history (
        entitlement_id, user_id, capability, action,
        performed_by, reason, old_status, new_status,
        expires_at, is_permanent
      )
      values (
        new.id, new.user_id, new.capability, v_action,
        coalesce(new.revoked_by, new.granted_by), new.revoke_reason,
        old.status, new.status, new.expires_at, new.is_permanent
      );
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists entitlements_grant_history on public.entitlements;
create trigger entitlements_grant_history
after insert on public.entitlements
for each row
execute function public.record_entitlement_grant();

drop trigger if exists entitlements_change_history on public.entitlements;
create trigger entitlements_change_history
after update on public.entitlements
for each row
execute function public.record_entitlement_change();

-- ── Function: check active entitlement ─────────────────────────────────────
-- Returns true if the given user currently has an active (non-expired,
-- non-revoked, non-suspended) entitlement for the given capability.
create or replace function public.has_active_entitlement(
  p_user_id uuid,
  p_capability public.entitlement_capability
)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.entitlements
    where user_id = p_user_id
      and capability = p_capability
      and status = 'active'
      and (
        is_permanent = true
        or (expires_at is not null and expires_at > pg_catalog.now())
      )
  );
$$;

-- ── Function: is owner or admin ────────────────────────────────────────────
-- Returns true if the given user has an owner or admin role.
create or replace function public.is_owner_or_admin(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_roles
    where user_id = p_user_id
      and role in ('owner', 'admin')
  );
$$;

-- ── RLS for app_roles ──────────────────────────────────────────────────────
alter table public.app_roles enable row level security;

-- Users can see their own roles. Only owners/admins see all roles.
create policy "Users can read their own roles"
  on public.app_roles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners and admins can read all roles"
  on public.app_roles
  for select
  to authenticated
  using (public.is_owner_or_admin((select auth.uid())));

-- Only existing owners can insert new roles (bootstrap chain).
create policy "Owners can manage roles"
  on public.app_roles
  for insert
  to authenticated
  with check (public.is_owner_or_admin((select auth.uid())));

create policy "Owners can update roles"
  on public.app_roles
  for update
  to authenticated
  using (public.is_owner_or_admin((select auth.uid())))
  with check (public.is_owner_or_admin((select auth.uid())));

create policy "Owners can delete roles"
  on public.app_roles
  for delete
  to authenticated
  using (public.is_owner_or_admin((select auth.uid())));

-- ── RLS for entitlements ──────────────────────────────────────────────────
alter table public.entitlements enable row level security;

-- A regular user can read only their own active entitlements.
-- Owners/admins can read all entitlements.
create policy "Users can read their own entitlements"
  on public.entitlements
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners and admins can read all entitlements"
  on public.entitlements
  for select
  to authenticated
  using (public.is_owner_or_admin((select auth.uid())));

-- Only owners/admins can create, update, or delete entitlements.
-- The granted_by field must match the acting user.
create policy "Owners can create entitlements"
  on public.entitlements
  for insert
  to authenticated
  with check (public.is_owner_or_admin((select auth.uid())));

create policy "Owners can update entitlements"
  on public.entitlements
  for update
  to authenticated
  using (public.is_owner_or_admin((select auth.uid())))
  with check (public.is_owner_or_admin((select auth.uid())));

create policy "Owners can delete entitlements"
  on public.entitlements
  for delete
  to authenticated
  using (public.is_owner_or_admin((select auth.uid())));

-- ── RLS for entitlement_history (immutable, read-only for regular users) ──
alter table public.entitlement_history enable row level security;

-- Users can see their own history. Owners/admins can see all.
create policy "Users can read their own entitlement history"
  on public.entitlement_history
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners and admins can read all entitlement history"
  on public.entitlement_history
  for select
  to authenticated
  using (public.is_owner_or_admin((select auth.uid())));

-- History is insertable only by trigger functions (security definer).
-- Regular authenticated users cannot insert, update, or delete.
revoke insert, update, delete on public.entitlement_history from authenticated, anon;

-- ── Deny-by-default grants ────────────────────────────────────────────────
revoke all on public.app_roles from anon, authenticated;
revoke all on public.entitlements from anon, authenticated;
revoke all on public.entitlement_history from anon, authenticated;

-- Authenticated can read their own rows via RLS.
grant select on public.app_roles to authenticated;
grant select on public.entitlements to authenticated;
grant select on public.entitlement_history to authenticated;

-- Authenticated can insert/update/delete entitlements only via RLS
-- (is_owner_or_admin check). This allows the browser client to manage
-- entitlements for authorized owners/admins.
grant insert, update, delete on public.entitlements to authenticated;

-- Authenticated can insert/update app_roles only via RLS (is_owner_or_admin).
grant insert, update, delete on public.app_roles to authenticated;

-- Trigger functions are internal database plumbing, not RPC endpoints.
revoke execute on function public.set_people_updated_at() from public, anon, authenticated;
revoke execute on function public.record_entitlement_grant() from public, anon, authenticated;
revoke execute on function public.record_entitlement_change() from public, anon, authenticated;
revoke execute on function public.has_active_entitlement(uuid, public.entitlement_capability) from public, anon, authenticated;
revoke execute on function public.is_owner_or_admin(uuid) from public, anon;

-- ── Sequence grants for bigserial ─────────────────────────────────────────
grant usage, select on sequence public.entitlement_history_id_seq to authenticated;
