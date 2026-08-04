-- Supabase projects may define default table privileges for API roles.
-- Reset this table explicitly so authenticated users receive only the CRUD
-- privileges required by the people repository. RLS still restricts every
-- operation to rows owned by auth.uid().
revoke all on table public.people from anon, authenticated;
grant select, insert, update, delete on table public.people to authenticated;

-- This trigger function is internal database plumbing, not an RPC endpoint.
revoke execute on function public.set_people_updated_at() from public, anon, authenticated;
