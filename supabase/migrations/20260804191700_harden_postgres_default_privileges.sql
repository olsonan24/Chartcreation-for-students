-- Objects created by the hosted Supabase SQL Editor are owned by postgres.
-- Keep future public objects out of Data API roles until a later migration
-- grants the exact privileges that object requires.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete
  on tables
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select
  on sequences
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute
  on functions
  from anon, authenticated, service_role;

-- PostgreSQL grants EXECUTE on new functions to PUBLIC globally. A
-- schema-scoped revoke cannot remove that built-in global default.
alter default privileges for role postgres
  revoke execute
  on functions
  from public;
