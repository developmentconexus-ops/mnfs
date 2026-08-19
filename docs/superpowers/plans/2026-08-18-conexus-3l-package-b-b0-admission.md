# Conexus 3L Package B — B0 Admission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute only `B0 — Admission + Criterion Compilation` for the operator-ratified Conexus 3L Package B, producing a reproducible exact-stack admission record and compiled B1–B4 proof map without executing Product-Agent qualification probes yet.

**Architecture:** B0 is deterministic qualification scaffolding, not Product implementation. It creates a standalone `spikes/conexus-3l-b/` probe workspace pinned to the admitted Mastra family, uses the installed Mastra skill + Context7 + exact locked package source to compile current criteria, proves admission validators can fail before they pass, and updates Phase-3 status only after Evidence is complete.

**Tech Stack:** Node 24.18.0, npm lockfile v3, `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL 17.10 where later storage probes require it, Node built-in test runner.

**Spec:** `docs/conexus/phase3/3L-B-product-agent-cross-runtime-qualification.md`

## Global Constraints

- Read `AGENTS.md` first and obey the canonical Conexus read path.
- DevelopmentConexus Engineering Method v1.0.0 is normative; do not duplicate/redefine it.
- Load the installed **Mastra skill** before Mastra-specific planning/editing/probing. Missing skill = STOP.
- Use **Context7** current Mastra docs; resolve `/mastra-ai/mastra`. Current docs are Evidence, not proof of the exact pinned package by themselves.
- Exact version-specific deciding claims come from the locked package source and/or later bounded runtime proof.
- No Product implementation, C-018, Package C–E execution, real business effect, merge, provider/model call, E2B call, external schedule activation or production dispatch.
- No `latest`, floating model/runtime identity, package lifecycle scripts or known Q0 deny-set dependency.
- Historical P1–P30 must be compiled against current authority before execution; do not recreate obsolete mechanisms in fixtures.
- B0 must prove its validators can fail before they are trusted to pass.
- Do not add a generic runtime/event/workflow/bus/outbox/registry abstraction.
- Stop on a material authority/boundary contradiction. Do not redesign architecture inside the harness.
- Final repository verification is `npm run verify` in addition to the Package-B B0 local verification.

---

## File Structure

Create:

```text
spikes/conexus-3l-b/package.json
spikes/conexus-3l-b/package-lock.json
spikes/conexus-3l-b/scripts/verify-lock.mjs
spikes/conexus-3l-b/scripts/validate-admission.mjs
spikes/conexus-3l-b/tests/admission.test.mjs
spikes/conexus-3l-b/admission/criteria.json
spikes/conexus-3l-b/evidence/context7-admission.json
spikes/conexus-3l-b/evidence/mastra-skill.json
spikes/conexus-3l-b/evidence/npm-tree.json
spikes/conexus-3l-b/evidence/source-map.json
spikes/conexus-3l-b/evidence/admission.json
docs/conexus/phase3/3L-B0-admission-record.md
```

Modify at B0 closure only:

```text
docs/conexus/phase3/LEDGER.md
docs/conexus/current/README.md
docs/conexus/current/ARCHITECTURE-BASELINE.md
```

Do not modify Product source/runtime modules.

---

### Task 1: Fresh worktree, authority revalidation, skill and Context7 prerequisites

**Files:**
- Read: `AGENTS.md`
- Read: `docs/engineering/standards/root-cause-global-maximum-method.md`
- Read: `docs/DOCUMENTATION-MAP.md`
- Read: `docs/conexus/current/README.md`
- Read: `docs/conexus/current/ARCHITECTURE-BASELINE.md`
- Read: `docs/conexus/phase3/LEDGER.md`
- Read: `docs/conexus/phase3/3L-B-product-agent-cross-runtime-qualification.md`
- Read: `docs/conexus/phase3/3L-Q0-qualification-manifest.md`
- Read: `docs/conexus/phase3/3A-R10-pre-implementation-convergence-realization-routing.md`
- Read: `docs/conexus/phase3/3G-05-production-agent-run-approval-trigger-continuation-architecture.md`
- Read: `docs/conexus/phase3/3G-06-gateway-effect-attempt-idempotency-budget-state-architecture.md`
- Read: `docs/conexus/phase3/3H-02-production-agent-runtime-realization.md`
- Read: `docs/conexus/phase3/3H-03-runtime-isolation-correlation-handoff.md`
- Create: `spikes/conexus-3l-b/evidence/context7-admission.json`
- Create: `spikes/conexus-3l-b/evidence/mastra-skill.json`

**Interfaces:**
- Consumes: current repo/PR state and ratified Package-B spec.
- Produces: exact execution HEAD plus evidence that required Mastra skill and Context7 inputs were loaded before Mastra work.

- [ ] **Step 1: Create an isolated worktree before edits**

Use the `superpowers:using-git-worktrees` skill. From the canonical repo:

```bash
git fetch origin
git status --short
git rev-parse HEAD
git rev-parse origin/agent/conexus-phase-3-system-design
```

Do not reset/stash/clean unrelated state. Create the worktree from the fresh remote branch using the skill's safe naming/location convention.

Expected: local work begins from the current `origin/agent/conexus-phase-3-system-design` identity with a clean owned worktree. If the branch moved, record the new HEAD and continue only after re-reading the changed authority delta.

- [ ] **Step 2: Revalidate PR state**

Run:

```bash
gh pr view 40 --repo developmentconexus-ops/mnfs \
  --json state,isDraft,headRefName,headRefOid,baseRefName,mergeable
```

Expected semantic state:

```text
state       = OPEN
isDraft     = true
headRefName = agent/conexus-phase-3-system-design
baseRefName = main
merged      = false by repository reality
```

If the PR is merged/closed or head branch changed materially, STOP and report.

- [ ] **Step 3: Read the canonical authority in the exact order required by AGENTS**

Read the files listed for this task. Write no summary-as-authority document. Keep notes as ephemeral execution context.

Expected: current router still says 3L in progress, Package A complete, Package B next/not qualified, Product implementation blocked, C-018 not ratified, no merge authorization.

- [ ] **Step 4: Load the installed Mastra skill**

Use Codex's installed-skill mechanism to load the **Mastra skill** before any Mastra API/source reasoning.

Create `spikes/conexus-3l-b/evidence/mastra-skill.json` with this exact shape using observed values:

```json
{
  "loaded": true,
  "skill": "mastra",
  "resolvedIdentifierOrPath": "<observed by executor>",
  "loadedBeforeMastraWork": true
}
```

`resolvedIdentifierOrPath` must be the actual value exposed by the execution environment, not an invented path. If the skill is unavailable, do not create a fake record: STOP and report `MISSING EXECUTION PREREQUISITE`.

- [ ] **Step 5: Query Context7 before source inspection**

Use Context7 to resolve `Mastra`; expected current library ID is:

```text
/mastra-ai/mastra
```

Query exactly these three concepts separately:

```text
1. Agent construction + editor override surface + RequestContext runtime semantics
2. thread/resource memory scoping + storage/PubSub sharing semantics
3. suspension/resume persistence + process-loss/retry durability semantics
```

Create `spikes/conexus-3l-b/evidence/context7-admission.json`:

```json
{
  "libraryId": "/mastra-ai/mastra",
  "queriedConcepts": [
    "agent-request-context-editor",
    "memory-thread-resource-storage-pubsub",
    "suspend-resume-process-loss"
  ],
  "authorityClass": "CURRENT_EXTERNAL_EVIDENCE_NOT_CONEXUS_AUTHORITY",
  "versionSpecificProof": false
}
```

If Context7 resolves a materially different official library or the current docs contradict the accepted architecture, record the contradiction and STOP for adjudication rather than rewriting the spec.

- [ ] **Step 6: Commit the prerequisite evidence**

```bash
git add spikes/conexus-3l-b/evidence/context7-admission.json \
        spikes/conexus-3l-b/evidence/mastra-skill.json
git commit -m "spike(conexus): record Package B execution prerequisites"
```

---

### Task 2: Materialize the minimal Package-B lock closure

**Files:**
- Create: `spikes/conexus-3l-b/package.json`
- Create: `spikes/conexus-3l-b/package-lock.json`
- Create: `spikes/conexus-3l-b/evidence/npm-tree.json`

**Interfaces:**
- Consumes: Q0 pins and Task-1 prerequisites.
- Produces: exact deterministic Package-B dependency closure; later B1–B4 code may use only this closure unless an explicit repin/addition is adjudicated.

- [ ] **Step 1: Create the minimal package manifest**

Create `spikes/conexus-3l-b/package.json` exactly:

```json
{
  "name": "@developmentconexus/conexus-3l-package-b",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": "24.18.0"
  },
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "verify:lock": "node scripts/verify-lock.mjs",
    "verify:admission": "node scripts/validate-admission.mjs",
    "verify": "npm run verify:lock && npm run verify:admission && npm test"
  },
  "dependencies": {
    "@mastra/core": "1.56.0",
    "@mastra/memory": "1.25.0",
    "@mastra/pg": "1.19.0"
  }
}
```

Do not add `@mastra/code-sdk` or `@mastra/e2b` merely because Package A used them. If exact B0 source inspection later proves another direct package is required for a current B1–B4 property, STOP and report the exact consumer before changing the manifest.

- [ ] **Step 2: Generate the lock without lifecycle scripts**

Run:

```bash
cd spikes/conexus-3l-b
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
```

Expected: lockfile v3, exact root direct pins above, no package lifecycle scripts executed.

- [ ] **Step 3: Install exact locked bytes without lifecycle scripts**

Run:

```bash
npm ci --ignore-scripts --no-audit --no-fund
```

Expected: success under Node 24.18.0.

- [ ] **Step 4: Capture dependency closure and lock digest**

Run:

```bash
node --version
npm --version
npm ls --all --json > evidence/npm-tree.json
sha256sum package-lock.json
```

Record the observed SHA-256 later in `evidence/admission.json`; do not copy the historical Package-A digest by assumption.

- [ ] **Step 5: Commit the exact closure**

```bash
git add spikes/conexus-3l-b/package.json \
        spikes/conexus-3l-b/package-lock.json \
        spikes/conexus-3l-b/evidence/npm-tree.json
git commit -m "spike(conexus): freeze Package B dependency closure"
```

---

### Task 3: TDD the supply-chain / lock admission guard

**Files:**
- Create: `spikes/conexus-3l-b/scripts/verify-lock.mjs`
- Create/modify: `spikes/conexus-3l-b/tests/admission.test.mjs`

**Interfaces:**
- Consumes: Task-2 lock.
- Produces: `verifyLock(lockObject)` that fails closed for direct-pin drift, Q0 deny-set hits and prerelease Mastra versions.

- [ ] **Step 1: Write the RED lock test first**

Create `tests/admission.test.mjs` initially with:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyLock } from '../scripts/verify-lock.mjs';

test('lock verifier rejects a Q0-denied Mastra version', () => {
  const bad = {
    lockfileVersion: 3,
    packages: {
      '': {
        dependencies: {
          '@mastra/core': '1.56.0',
          '@mastra/memory': '1.25.0',
          '@mastra/pg': '1.19.0'
        }
      },
      'node_modules/@mastra/core': { version: '1.42.1' }
    }
  };

  assert.throws(() => verifyLock(bad), /Q0 deny-set/u);
});
```

Do not create `verify-lock.mjs` yet.

- [ ] **Step 2: Run RED and verify the test fails for the intended reason**

```bash
npm test
```

Expected: FAIL because `../scripts/verify-lock.mjs` does not exist.

- [ ] **Step 3: Implement the minimal lock verifier**

Create `scripts/verify-lock.mjs`:

```javascript
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DENY = new Set([
  '@mastra/core@1.42.1',
  '@mastra/memory@1.20.4',
  '@mastra/e2b@0.3.4'
]);

const REQUIRED_DIRECT = {
  '@mastra/core': '1.56.0',
  '@mastra/memory': '1.25.0',
  '@mastra/pg': '1.19.0'
};

export function verifyLock(lock) {
  if (lock.lockfileVersion !== 3) {
    throw new Error(`Expected lockfileVersion 3, got ${lock.lockfileVersion}`);
  }

  const root = lock.packages?.['']?.dependencies ?? {};
  for (const [name, version] of Object.entries(REQUIRED_DIRECT)) {
    if (root[name] !== version) {
      throw new Error(`Direct pin drift: ${name} expected ${version}, got ${root[name]}`);
    }
  }

  for (const [pkgPath, meta] of Object.entries(lock.packages ?? {})) {
    if (!pkgPath.startsWith('node_modules/')) continue;
    const name = pkgPath.slice('node_modules/'.length);
    const version = meta?.version;
    if (!version) continue;

    if (DENY.has(`${name}@${version}`) || name.includes('easy-day-js')) {
      throw new Error(`Q0 deny-set dependency present: ${name}@${version}`);
    }

    if (name.startsWith('@mastra/') && /-(?:alpha|beta|rc|next|canary)[.-]?/iu.test(version)) {
      throw new Error(`Mastra prerelease is not admitted: ${name}@${version}`);
    }
  }

  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  verifyLock(lock);
  console.log('Package B lock admission passed.');
}
```

- [ ] **Step 4: Add positive and pin-drift controls**

Append tests that load the real `package-lock.json` and assert `verifyLock(realLock) === true`, plus a mutated fixture with root `@mastra/core: '1.56.1'` and assert `/Direct pin drift/`.

- [ ] **Step 5: Run GREEN**

```bash
npm run verify:lock
npm test
```

Expected: PASS; negative fixtures prove both deny-set and direct-pin controls fire.

- [ ] **Step 6: Commit**

```bash
git add scripts/verify-lock.mjs tests/admission.test.mjs
git commit -m "test(conexus): enforce Package B lock admission"
```

---

### Task 4: Inspect exact pinned Mastra source and bind current docs to exact bytes

**Files:**
- Create: `spikes/conexus-3l-b/evidence/source-map.json`

**Interfaces:**
- Consumes: installed exact lock bytes, Mastra skill, Context7 concepts.
- Produces: source-level map used to write B1–B4 harness code without guessed APIs.

- [ ] **Step 1: Confirm exact installed direct versions**

Run:

```bash
node -e "for (const p of ['@mastra/core','@mastra/memory','@mastra/pg']) console.log(p, require('./node_modules/'+p+'/package.json').version)"
```

Expected exactly:

```text
@mastra/core 1.56.0
@mastra/memory 1.25.0
@mastra/pg 1.19.0
```

Any drift = STOP.

- [ ] **Step 2: Search exact installed bytes for the Package-B surfaces**

Run scoped source searches, not generic web search:

```bash
rg -n "RequestContext|requestContextSchema|editor" node_modules/@mastra/core > evidence/source-request-context-editor.txt
rg -n "defaultAgentThreadPubSub|PubSub|threadId|resourceId" node_modules/@mastra/core node_modules/@mastra/memory > evidence/source-memory-pubsub.txt
rg -n "suspend|resume|suspended|retryCounts|lastPersistedStatusByRun" node_modules/@mastra/core > evidence/source-suspend-resume.txt
rg -n "schedule|cron|timezone|claimId|scheduled" node_modules/@mastra/core > evidence/source-schedule.txt
```

These text files are temporary inspection artifacts. Do **not** commit large copied vendor-source dumps. Use them only to identify the exact load-bearing files/functions.

- [ ] **Step 3: Inspect the identified exact files with the Mastra skill guidance**

For each B family, identify the minimum exact source locus:

```text
Agent direct construction / Editor override
RequestContext creation/use/restoration
thread/resource memory keys
role/local/default PubSub behavior
selective direct-Agent tool suspend/resume
plain active Agent crash/recovery behavior if source establishes it
schedule fire / intended-slot candidate fields
process-local retry/global mutable facilities relevant to enabled F1 paths
```

If direct-Agent suspension, schedule occurrence identity or role isolation cannot be located/understood on the exact pin, keep it `UNKNOWN` for execution planning; do not infer from Context7 current docs.

- [ ] **Step 4: Hash only the exact source files that inform deciding assumptions**

For each selected source file:

```bash
sha256sum <exact-file>
```

Create `evidence/source-map.json` with this exact schema:

```json
{
  "packages": {
    "@mastra/core": "1.56.0",
    "@mastra/memory": "1.25.0",
    "@mastra/pg": "1.19.0"
  },
  "surfaces": [
    {
      "concept": "<one Package-B concept>",
      "sourcePath": "<exact installed path>",
      "sha256": "<observed digest>",
      "state": "KNOWN"
    }
  ],
  "unknowns": []
}
```

If a concept remains genuinely unresolved, add its semantic name to `unknowns` instead of inventing a path.

- [ ] **Step 5: Delete temporary vendor-source search dumps before commit**

```bash
rm -f evidence/source-request-context-editor.txt \
      evidence/source-memory-pubsub.txt \
      evidence/source-suspend-resume.txt \
      evidence/source-schedule.txt
```

- [ ] **Step 6: Commit the compact source provenance map**

```bash
git add evidence/source-map.json
git commit -m "spike(conexus): map Package B pinned Mastra source"
```

---

### Task 5: TDD the historical→current criterion compilation

**Files:**
- Create: `spikes/conexus-3l-b/admission/criteria.json`
- Create: `spikes/conexus-3l-b/scripts/validate-admission.mjs`
- Modify: `spikes/conexus-3l-b/tests/admission.test.mjs`

**Interfaces:**
- Consumes: ratified 3L-B spec + source map.
- Produces: machine-checkable B1–B4 current criteria, routed Package-E criteria and P30 reopen trigger; no historical mechanism can be accidentally executed as current authority.

- [ ] **Step 1: Add a RED validator test**

Append to `tests/admission.test.mjs` a fixture containing one criterion whose mechanism string is `Mastra Stored Agent latest` and assert that `validateAdmission()` throws `/superseded mechanism/u`.

Run:

```bash
npm test
```

Expected: FAIL because `validate-admission.mjs` does not exist.

- [ ] **Step 2: Create the exact admission schema and validator**

Create `scripts/validate-admission.mjs` that exports `validateAdmission(record)` and enforces:

```text
schemaVersion = 1
package = "3L-B"
B5.admitted = false
criteria IDs unique
all B1-01..B1-10 present as ADMITTED
all B2-01..B2-12 present as ADMITTED
all B3-01..B3-12 present as ADMITTED
all B4-01..B4-18 present as ADMITTED
Package-E routed families present as ROUTED_TO_E
historical P30 present as REOPEN_TRIGGER
no criterion contains "latest", "Stored Agent latest", "Vercel AI SDK Product Agent", "UniversalEnvelope", "Pi as primary Builder", "generic Workflow/Scheduler/Automation"
no admitted criterion has empty protectedInvariant/authority/currentMechanism/proofClass/negativeFixture/requiredEvidence
proofClass is one of SOURCE | DETERMINISTIC | LOCAL_RUNTIME | PROCESS_RESTART | POSTGRES | NATIVE_LIVE
```

The validator must not inspect/decide Product semantics beyond the ratified spec; it only checks compiled-pack completeness and prohibited mechanism revival.

- [ ] **Step 3: Materialize `admission/criteria.json` from the spec**

Use this object shape:

```json
{
  "schemaVersion": 1,
  "package": "3L-B",
  "b5": { "admitted": false },
  "criteria": [
    {
      "id": "B1-01",
      "state": "ADMITTED",
      "track": "B1",
      "protectedInvariant": "exact Release facts produce one exact RuntimeAgentProjection",
      "authority": ["3H-02", "3A-R10", "3L-B"],
      "currentMechanism": "exact Release-pinned RuntimeAgentProjection to direct Mastra Agent",
      "proofClass": "DETERMINISTIC",
      "negativeFixture": "newer/mutable runtime projection is presented for an already pinned run and must be refused",
      "requiredEvidence": "owner pin and runtime projection identity remain exact"
    }
  ],
  "routedToPackageE": [],
  "reopenTriggers": []
}
```

Then add **every** B1/B2/B3/B4 ID and semantic wording from `3L-B-product-agent-cross-runtime-qualification.md`. Do not abbreviate with ranges in the JSON.

For Package-E routing, include named entries for:

```text
forged owner IDs / producer provenance
OTel baggage policy
shared-global-OTel role attribution
telemetry exporter degradation
required verification evidence missing/sampled
GUEST_OBSERVED forged authority fields
E2B provider-pull / OTLP-push deciding evidence
high-cardinality metric dimensions
MastraStorageExporter / OBS cross-schema boundary
```

For reopen triggers include historical P30 as:

```text
enable previously-deferred process-global Mastra capability → re-run cross-role isolation qualification before same-process admission
```

- [ ] **Step 4: Implement `validateAdmission()` and CLI mode**

CLI mode reads `admission/criteria.json`, validates it and prints:

```text
Package B admission compilation passed.
```

- [ ] **Step 5: Run RED controls and GREEN pack**

```bash
npm run verify:admission
npm test
```

Expected:

```text
negative fixture rejects superseded mechanism
negative fixture rejects missing/drifted criterion when test mutates input
real admission/criteria.json passes
```

- [ ] **Step 6: Commit**

```bash
git add admission/criteria.json scripts/validate-admission.mjs tests/admission.test.mjs
git commit -m "test(conexus): compile Package B current qualification criteria"
```

---

### Task 6: Close B0 with exact admission Evidence and route B1 as next

**Files:**
- Create: `spikes/conexus-3l-b/evidence/admission.json`
- Create: `docs/conexus/phase3/3L-B0-admission-record.md`
- Modify: `docs/conexus/phase3/LEDGER.md`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/current/ARCHITECTURE-BASELINE.md`

**Interfaces:**
- Consumes: Tasks 1–5 exact Evidence.
- Produces: durable B0 completion; B1 becomes next but remains unexecuted.

- [ ] **Step 1: Run the local B0 verification from a clean install**

```bash
cd spikes/conexus-3l-b
rm -rf node_modules
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
```

Expected: all lock/admission tests PASS.

- [ ] **Step 2: Capture exact admission identity**

Run:

```bash
git rev-parse HEAD
node --version
npm --version
sha256sum package-lock.json
```

Create `evidence/admission.json` with observed values and this semantic structure:

```json
{
  "package": "3L-B",
  "stage": "B0",
  "status": "COMPLETE",
  "repoHead": "<observed>",
  "node": "v24.18.0",
  "npm": "<observed>",
  "lockSha256": "<observed>",
  "directPins": {
    "@mastra/core": "1.56.0",
    "@mastra/memory": "1.25.0",
    "@mastra/pg": "1.19.0"
  },
  "context7LibraryId": "/mastra-ai/mastra",
  "mastraSkillLoaded": true,
  "historicalCriteriaCompiled": true,
  "b5Admitted": false,
  "next": "B1"
}
```

Use actual observed values for fields marked `<observed>`.

- [ ] **Step 3: Write the durable B0 admission record**

Create `docs/conexus/phase3/3L-B0-admission-record.md` containing only durable decision/proof value:

```text
Status = COMPLETE / B1 NEXT / B1 NOT EXECUTED
ratified Package-B spec path
exact HEAD at B0 close
exact lock digest/direct pins
Mastra skill prerequisite = satisfied
Context7 = /mastra-ai/mastra current-doc Evidence
exact pinned-source map = recorded
criterion counts by B1/B2/B3/B4
Package-E routed families
P30 reopen-trigger handling
Known / Unknown from source inspection
B5 = NOT ADMITTED unless a material B0 Finding explicitly changed that through adjudication
Material Finding = NONE, or STOP instead of writing a false COMPLETE record
Product implementation = BLOCKED
C-018 = NOT RATIFIED
merge = NOT AUTHORIZED
```

Do not copy raw Context7/vendor documentation into the record.

- [ ] **Step 4: Update the live Phase-3 status truth**

Patch `docs/conexus/phase3/LEDGER.md` narrowly so its current 3L status says:

```text
Package A = COMPLETE
Package B = IN PROGRESS / B0 COMPLETE / B1 NEXT
B1 = NOT EXECUTED
Packages C–E = NOT STARTED
```

Preserve all historical ledger content and the R11 read path. Do not rewrite the 100k+ file wholesale through a lossy interface.

- [ ] **Step 5: Update current projections without claiming qualification**

Patch `docs/conexus/current/README.md` and only the Package-B status header/routing statements in `docs/conexus/current/ARCHITECTURE-BASELINE.md` to reflect:

```text
Package B = IN PROGRESS / B0 COMPLETE / B1 NEXT
CX-AGENT-MASTRA-01 = NOT YET QUALIFIED
CX-RUNTIME-ISOLATION-01 = NOT YET QUALIFIED
```

Do not alter Product/architecture semantics.

- [ ] **Step 6: Run repository-wide verification**

From repo root:

```bash
npm run verify
```

Expected: SUCCESS.

- [ ] **Step 7: Self-review the B0 delta against the ratified spec**

Check explicitly:

```text
no Product code touched
no B1–B5 runtime probe executed
no provider/model/E2B call
Mastra skill loaded before Mastra work
Context7 used and kept Evidence-only
exact pin/source provenance recorded
historical criteria compiled, not replayed literally
Package-E obligations routed, not deleted
P30 treated as reopen trigger
no speculative abstraction
no C-018/merge authorization
```

Any failed check blocks B0 closure.

- [ ] **Step 8: Commit B0 closure**

```bash
git add spikes/conexus-3l-b/evidence/admission.json \
        docs/conexus/phase3/3L-B0-admission-record.md \
        docs/conexus/phase3/LEDGER.md \
        docs/conexus/current/README.md \
        docs/conexus/current/ARCHITECTURE-BASELINE.md
git commit -m "docs(conexus): close Package B B0 admission"
```

- [ ] **Step 9: Push the branch and report, but do not merge**

```bash
git push origin HEAD:agent/conexus-phase-3-system-design
```

Report:

```text
final HEAD
B0 local verification result
npm run verify result
exact lock SHA-256
Mastra direct pins
criterion counts
source-map UNKNOWNs if any
B5 admitted? expected NO
material Finding? expected NONE or STOP
next = B1 / NOT EXECUTED
```

Do not start B1 in the same execution unless the Architecture Lead explicitly reviews/adjudicates B0 Evidence first; Q0 requires package/stage evidence to be read rather than inherited by success claim.

---

## Self-Review Checklist

Before claiming this plan complete, verify:

- Spec coverage: B0 covers exact identity, Mastra skill, Context7, pinned source, historical compilation, falsification map, Evidence, status routing.
- Placeholder scan: observed runtime values are explicitly captured at execution rather than guessed; no semantic TBD/TODO remains.
- Type/field consistency: `verifyLock`, `validateAdmission`, evidence JSON names and paths are consistent across tasks.
- Scope: B1–B5 execution is not smuggled into B0.
- Authority: framework docs/skills remain Evidence/mechanics and never become Conexus authority.
