# Architecture

## Student App

The repository root is a Vite 8 / React 19 installable PWA deployed as static assets on Vercel.

| Concern | Source of truth |
| --- | --- |
| App coordination, charts, comparison, print report | `app/page.tsx` |
| Approved calculations | `lib/numerology.ts` |
| Typed Supabase browser client | `lib/supabase/client.ts` |
| Generated database types | `lib/supabase/database.types.ts` |
| Authentication/session state | `features/auth/AuthProvider.tsx`, `useAuth.ts` |
| Authentication gate/UI | `features/auth/AuthGate.tsx`, `AuthScreen.tsx` |
| Application person types | `features/people/people.types.ts` |
| Date/field mapping and validation | `features/people/people.mapper.ts` |
| Supabase people queries | `features/people/people.repository.ts` |
| People loading and mutations | `features/people/usePeople.ts` |
| Legacy import validation/deduplication | `features/people/legacyImport.ts` |
| Database schema, trigger, grants, RLS | `supabase/migrations/` |
| Database ownership tests | `supabase/tests/database/` |
| Screen and print styling | `app/globals.css` |
| New auth/import styling | `features/auth/auth.css`, `features/people/people-cloud.css` |
| PWA build/cache | `vite.config.ts`, generated Workbox service worker |

`app/page.tsx` coordinates views and passes `Client` source fields into the same `Report` class used by screen, comparison, and print. It contains no raw Supabase queries or database policy logic.

## Authentication Flow

`AuthProvider` restores the persisted Supabase session, subscribes to auth-state changes, and exposes sign-up, sign-in, and sign-out. `AuthGate` does not mount the private application until a valid session exists. Signing out clears the session synchronously, unmounting the chart application and its in-memory people state before the network sign-out completes.

Only the public URL and publishable key are used in the browser. Supabase secret and service-role credentials are forbidden in this codebase.

## People Data Flow

```text
Authenticated user
  -> usePeople loading/confirmed mutation state
  -> people.repository typed Supabase operations
  -> people.mapper DD/MM/YYYY <-> PostgreSQL date and row mapping
  -> public.people protected by grants and RLS
```

The repository obtains the authenticated user from `supabase.auth.getUser()` and sets `user_id` itself. It also filters reads/mutations by that user ID. This application check is defense in depth; the database independently enforces ownership with RLS.

The database stores only source data: full birth name, called name, date of birth, user ownership, and timestamps. Generated reports, chart rows, and timeline calculations are not persisted.

## Database Ownership and RLS

`public.people` grants Data API CRUD only to `authenticated`; `anon` has no table privilege. RLS is enabled with explicit SELECT, INSERT, UPDATE, and DELETE policies using `(select auth.uid()) = user_id`. UPDATE uses both `USING` and `WITH CHECK`.

The foreign key to `auth.users` cascades account deletion and has a supporting `user_id` index. A database trigger maintains `updated_at`.

The pgTAP suite proves own-row access, cross-user invisibility, rejected cross-owner insert, blocked cross-user update/delete, and blocked unauthenticated access. Hiding rows in React is never accepted as isolation proof.

## Legacy Local-Data Import

The previous key `pass7-mobile-clients-v1` is read only by `legacyImport.ts`. Records are parsed and validated without modifying the original value. After sign-in, the user receives one explicit Import or Skip choice for that account.

Duplicate identity is normalized lowercase full name + normalized lowercase called name + ISO DOB. Duplicates against cloud records and inside the legacy batch are skipped. New database UUIDs are generated for imports; legacy IDs are not reused. A failed or partial import leaves the original local data and handled marker untouched, so a retry can safely skip rows already created remotely.

## Print Pipeline

Printing remains browser-native through `window.print()`. `PassPrintReport` renders the shared A4 report and consumes the same `Report` instance as the screen view. Authentication and persistence changes do not alter print markup, formula values, or `app/globals.css` print rules.

## PWA and Connectivity

Workbox precaches the application shell and static artwork. This allows the installed shell to load after an online visit, but Supabase sessions and cloud records require network connectivity. There is no background/offline data synchronization in this release.

## Owner Console

The private owner console remains a separate loopback-only application outside this repository. It has no import, link, navigation path, or access to student names, DOBs, charts, sessions, or Supabase records.
