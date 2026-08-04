-- Read-only inspection of effective default ACLs for objects created by postgres.
-- The expected result is 10 rows with automatically_accessible = false.
with
parameters as (
  select
    'postgres'::regrole::oid as owner_oid,
    'public'::regnamespace::oid as schema_oid
),
object_kinds(object_code, object_type, checked_privileges) as (
  values
    ('r'::"char", 'table'::text, array['SELECT', 'INSERT', 'UPDATE', 'DELETE']::text[]),
    ('S'::"char", 'sequence'::text, array['USAGE', 'SELECT']::text[]),
    ('f'::"char", 'function'::text, array['EXECUTE']::text[])
),
checked_roles(object_type, role_name) as (
  values
    ('table'::text, 'anon'::text),
    ('table'::text, 'authenticated'::text),
    ('table'::text, 'service_role'::text),
    ('sequence'::text, 'anon'::text),
    ('sequence'::text, 'authenticated'::text),
    ('sequence'::text, 'service_role'::text),
    ('function'::text, 'public'::text),
    ('function'::text, 'anon'::text),
    ('function'::text, 'authenticated'::text),
    ('function'::text, 'service_role'::text)
),
global_defaults as (
  select
    object_kinds.object_code,
    coalesce(
      default_acl.defaclacl,
      pg_catalog.acldefault(object_kinds.object_code, parameters.owner_oid)
    ) as acl
  from object_kinds
  cross join parameters
  left join pg_catalog.pg_default_acl as default_acl
    on default_acl.defaclrole = parameters.owner_oid
    and default_acl.defaclnamespace = 0
    and default_acl.defaclobjtype = object_kinds.object_code
),
schema_defaults as (
  select
    object_kinds.object_code,
    default_acl.defaclacl as acl
  from object_kinds
  cross join parameters
  left join pg_catalog.pg_default_acl as default_acl
    on default_acl.defaclrole = parameters.owner_oid
    and default_acl.defaclnamespace = parameters.schema_oid
    and default_acl.defaclobjtype = object_kinds.object_code
),
effective_privileges as (
  select global_defaults.object_code, privilege.*
  from global_defaults
  cross join lateral pg_catalog.aclexplode(global_defaults.acl) as privilege
  union all
  select schema_defaults.object_code, privilege.*
  from schema_defaults
  cross join lateral pg_catalog.aclexplode(schema_defaults.acl) as privilege
)
select
  checked_roles.object_type,
  checked_roles.role_name,
  coalesce(
    bool_or(
      effective_privileges.privilege_type = any(object_kinds.checked_privileges)
      and case
        when effective_privileges.grantee = 0 then true
        when checked_roles.role_name = 'public' then false
        else pg_catalog.pg_has_role(
          checked_roles.role_name,
          effective_privileges.grantee,
          'MEMBER'
        )
      end
    ),
    false
  ) as automatically_accessible
from checked_roles
join object_kinds using (object_type)
left join effective_privileges using (object_code)
group by checked_roles.object_type, checked_roles.role_name
order by checked_roles.object_type, checked_roles.role_name;
