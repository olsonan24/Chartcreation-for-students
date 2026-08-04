# Evidence Lineage and Reproducibility Foundation

Status: repository-local Phase 5 foundation for `PRIVATE_AIONIS_BACKEND`. It defines domain rules and safe development adapters; it is not a service or production persistence layer.

## Evidence, facts, and inference

Source evidence is an immutable observation or input. Calculated and human-confirmed facts remain attributable records with their own provenance. A generated conclusion is an artifact, not evidence supporting itself. Supporting and contradictory evidence use distinct lineage relationships. Rejected or superseded information may remain as negative knowledge only with a reason and explicit reconsideration conditions.

The merged `evidence-record.schema.json` remains the canonical evidence contract. The domain convention requires its `provenance` object to contain `sourceIdentity`, nullable exact `sourceVersion`, `observedAt`, `actorIdentity`, and `deletionPolicyReference`. `classification` is the sensitivity class; `tenantScope`, `accessPolicyId`, and `retentionPolicy` preserve isolation, access, and retention boundaries. The immutable content digest is encoded as:

```text
sha256:c14n-json-v1:<lowercase hexadecimal digest>
```

## Canonical hashing

`c14n-json-v1` accepts only unambiguous JSON values. It sorts object keys, preserves array order, normalizes negative zero, rejects non-finite numbers, sparse arrays, cyclic values, non-plain objects, symbols, functions, `undefined`, and unpaired Unicode surrogates, then hashes UTF-8 canonical bytes with SHA-256. Key order therefore has no effect; meaningful content changes do. Verification compares the complete algorithm/version/digest identity and detects tampering. Fixed values live in `fixtures/golden-digests.json`.

## Domain records and interfaces

The core in `.agents/skills/aionis-operating-system/scripts/evidence-lineage/core.mjs` provides:

- immutable evidence and artifact acceptance through `InMemoryEvidenceRepository`;
- explicit component-version registration without a `latest` alias;
- merged generation-manifest validation plus an artifact/version wrapper and exact component-role bindings;
- deterministic lineage validation, ancestor tracing, machine-readable reports, and a human-readable formatter;
- reproduction planning and approved synthetic comparison;
- append-only supersession resolution and rollback-plan/history validation;
- `SyntheticFixtureRepository` for atomic, repository-local development fixtures.

The repository interface returns cloned snapshots and rejects conflicting repeat acceptance. A secure private adapter can later implement the same acceptance/query boundary while enforcing authentication, authorization, transactions, tenant isolation, encryption, retention/deletion, and audit logging. Domain validation must remain outside that adapter so a backend change cannot weaken immutability, lineage, version, or comparison rules.

The in-memory and fixture adapters are not production personal-data persistence. The fixture adapter writes only below this directory, accepts only repository-relative paths, validates before atomic replacement, and permits clearly synthetic identities only.

## Lineage and versions

Lineage edges point from an artifact to an ancestor or governing record. Supported relationships cover evidence, calculations, rules, modifiers, prompts, constitution and synthesis versions, manifests, approvals, releases, supersession, and rollback. Missing IDs, duplicate relationship IDs, self-links, cycles, generated-conclusion self-support, and cross-tenant links fail validation. Supporting and contradictory evidence remain separately queryable.

The registry covers calculation engine, formula baseline, constitution, rule set, modifier set, synthesis engine, prompt, model provider, model identity, model configuration, knowledge snapshot, canonicalization algorithm, evidence schema, generation-manifest schema, and release. Each entry has a stable ID, exact version, optional content digest, effective time, supersession status, environment applicability, provenance, and approval reference when required.

## Generation and reproduction

The merged generation manifest binds provider/model/configuration, prompt, constitution, calculation and synthesis engines, knowledge snapshot, evidence/rules/modifiers, language tier, confidence, environment, release, timeout/retry, workload/token and cost budgets, fallback disclosure, and acceptance policy. Its wrapper binds the exact artifact ID/version and all additional registry roles, including formula baseline and schema/canonicalization versions. Tests use synthetic provider and model identities; the core never calls a provider.

A reproduction plan reports missing evidence, digest drift, missing/unavailable component versions, exact configuration drift, determinism, fallback use, comparison policy, and precise blockers. Deterministic output requires exact equality after only Unicode NFC and newline normalization for strings, or canonical JSON normalization for structured output. Stochastic output never claims byte equality; it requires an approved versioned policy and compares only declared exact, numeric-tolerance, or required-key properties. No semantic model judging exists.

## Supersession, negative knowledge, and rollback

Accepted records are never edited. Corrections create new evidence or artifact versions plus a separate forward/backward supersession relation. Forks, multiple predecessors, and cycles fail. Resolution returns the root, complete history, and deterministic current effective version. Historical manifests remain attached to their artifact versions.

Rollback plans identify the failed and prior known-good artifact versions, trigger, reason, current approval, evidence, actor, timestamp, forward-fix/restoration status, and post-rollback checks. Synthetic history records retain both failed and restored versions. This foundation plans and validates rollback; it cannot mutate a hosted release or environment.

## Privacy and access rules

Validation rejects secrets, credentials, raw tokens, database passwords, personal-name/DOB/profile fields, email-like values, private keys, JWT-like values, private or personal evidence routed to `DEV_TOOLING`, cross-tenant lineage, and non-synthetic tracked identities. No cross-user aggregate exception or global-learning eligibility is implemented. Real personal evidence, production credentials, and hosted state are prohibited from fixtures, errors, and logs.

## Development commands

```text
npm run aionis:evidence -- help
npm run aionis:evidence -- validate-all
npm run aionis:evidence -- digest --input docs/aionis-operating-system/evidence-lineage/fixtures/golden-digests.json
npm run aionis:evidence -- validate-evidence --record docs/aionis-operating-system/evidence-lineage/fixtures/synthetic-lineage-store.json --id synthetic-evidence-source-v1
npm run aionis:evidence -- validate-lineage
npm run aionis:evidence -- trace-ancestors --id synthetic-conclusion@2.0.0 --json
npm run aionis:evidence -- validate-manifest --id synthetic-generation-manifest-v2
npm run aionis:evidence -- reproduction-plan --artifact synthetic-conclusion --version 2.0.0
npm run aionis:evidence -- resolve-supersession --id synthetic-conclusion@1.0.0
npm run aionis:evidence -- validate-rollback --id synthetic-rollback-plan
npm run validate:evidence
```

Commands fail nonzero with bounded errors. Mutation is dry-run by default; `register-component --accept` is limited to a validated tracked synthetic store and uses atomic replacement.
