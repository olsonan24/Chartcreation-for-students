import test from 'node:test'
import assert from 'node:assert/strict'
import { applyOperation, assertAnalyticsLink, assertApprovalReference, assertLifecycleTransition, classifyScopeChanges } from './validate-contracts.mjs'

test('legal and illegal lifecycle transitions are distinguished', () => {
  assert.doesNotThrow(() => assertLifecycleTransition({ from: 'RELEASED', to: 'OBSERVING' }))
  assert.throws(() => assertLifecycleTransition({ from: 'DRAFT', to: 'RELEASED' }), /illegal lifecycle transition/)
})

test('stale and invalidated approvals cannot authorize an artifact', () => {
  const approval = { artifactId: 'artifact', artifactVersion: '1.0.0', decision: 'APPROVED', invalidatedAt: null }
  assert.doesNotThrow(() => assertApprovalReference(approval, { artifactId: 'artifact', version: '1.0.0' }))
  assert.throws(() => assertApprovalReference({ ...approval, artifactVersion: '0.9.0' }, { artifactId: 'artifact', version: '1.0.0' }), /stale artifact version/)
  assert.throws(() => assertApprovalReference({ ...approval, invalidatedAt: '2026-08-04T00:00:00Z' }, { artifactId: 'artifact', version: '1.0.0' }), /invalidated/)
})

test('analytics contract linkage freezes purpose and rejects prohibited fields', () => {
  const contracts = [{ contractId: 'ops', version: '1.0.0', status: 'current', eventClass: 'operational', target: 'DEV_TOOLING', purposeKey: 'health', eventNames: ['health.checked'], permittedFields: ['status'], prohibitedFields: ['name'] }]
  const event = { contractId: 'ops', contractVersion: '1.0.0', eventClass: 'operational', target: 'DEV_TOOLING', purposeKey: 'health', eventName: 'health.checked', payload: { status: 'ok' } }
  assert.doesNotThrow(() => assertAnalyticsLink(event, contracts))
  assert.throws(() => assertAnalyticsLink({ ...event, purposeKey: 'changed' }, contracts), /purpose mismatch/)
  assert.throws(() => assertAnalyticsLink({ ...event, payload: { name: 'synthetic' } }, contracts), /prohibited analytics field/)
})

test('fixture mutations do not modify their base object', () => {
  const base = { nested: { keep: true }, removeMe: true }
  const changed = applyOperation(base, { type: 'remove', path: 'removeMe' })
  assert.equal(base.removeMe, true)
  assert.equal(changed.removeMe, undefined)
})

test('scope guard admits only the exact default-privilege database artifacts', () => {
  const approved = classifyScopeChanges([
    'supabase/migrations/20260804191700_harden_postgres_default_privileges.sql',
    'supabase/tests/database/future_default_privileges.test.sql'
  ])
  assert.deepEqual(approved, { unauthorized: [], product: [] })

  const rejected = classifyScopeChanges([
    'vite.config.ts',
    'vercel.json'
  ])
  assert.deepEqual(rejected.unauthorized, [
    'vite.config.ts',
    'vercel.json'
  ])
  assert.deepEqual(rejected.product, [
    'vite.config.ts',
    'vercel.json'
  ])
})

test('scope guard admits authorized entitlement feature paths', () => {
  const approved = classifyScopeChanges([
    'supabase/migrations/20260805000000_create_entitlements.sql',
    'supabase/migrations/20260805142719_finalize_admin_access.sql',
    'supabase/tests/database/entitlements_rls.test.sql',
    'features/entitlements/entitlement.types.ts',
    'features/entitlements/entitlement.repository.ts',
    'features/entitlements/useEntitlements.ts',
    'features/entitlements/TimelineLockedScreen.tsx',
    'features/entitlements/entitlements.css',
    'features/owner/OwnerDashboard.tsx',
    'features/owner/owner.css',
    'app/page.tsx',
    'lib/supabase/database.types.ts',
    'tests/entitlement.repository.test.ts',
  ])
  assert.deepEqual(approved, { unauthorized: [], product: [] })
})

test('scope guard admits the authorized Bulgarian alphabet feature paths', () => {
  const approved = classifyScopeChanges([
    '.agents/skills/aionis-ai-workflow/scripts/verify-workflow.mjs',
    'app/globals.css',
    'app/page.tsx',
    'features/people/nameKeyboard.ts',
    'features/people/personReport.ts',
    'features/people/people.repository.ts',
    'lib/name-alphabets.ts',
    'lib/numerology.ts',
    'lib/supabase/database.types.ts',
    'supabase/migrations/20260805010000_add_people_name_alphabet_mode.sql',
    'supabase/tests/database/people_rls.test.sql',
    'tests/nameKeyboard.test.ts',
    'tests/e2e/print-proof.mjs',
    'tests/numerology.test.mjs',
    'tests/personReport.test.ts',
    'tsconfig.json',
  ])
  assert.deepEqual(approved, { unauthorized: [], product: [] })
})

test('scope guard rejects unrelated product changes', () => {
  const rejected = classifyScopeChanges([
    'public/experimental.svg',
    'lib/experimental.ts',
    'features/auth/experimental.ts',
  ])
  assert.deepEqual(rejected.unauthorized, [
    'public/experimental.svg',
    'lib/experimental.ts',
    'features/auth/experimental.ts',
  ])
  assert.deepEqual(rejected.product, [
    'public/experimental.svg',
    'lib/experimental.ts',
    'features/auth/experimental.ts',
  ])
})
