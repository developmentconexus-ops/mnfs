# Conexus 3L Package B BT-4N Native Scheduler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove or falsify whether the exact pinned Mastra scheduler can present one stable logical scheduled occurrence through a supported deterministic seam before any Product Agent execution, while preserving PAR as the only future AgentRun admission authority.

**Architecture:** Keep Mastra schedule/timer/CAS mechanics native and subordinate. The probe may use one deterministic workflow/adapter fixture only if that is the smallest supported native seam for receiving a scheduled occurrence before Product execution. The fixture records occurrence material and a synthetic PAR-ingress count; it contains no Product Agent, model, business tool, Gateway effect or Product owner implementation.

**Tech Stack:** Node 24.18.0, npm lockfile v3, `node:test`, exact existing Package-B lock (`@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`), PostgreSQL 17.10, repo-installed Mastra skill, Context7 `/mastra-ai/mastra`.

**Spec:** `docs/conexus/phase3/3L-R1-framework-native-proportional-qualification-rebaseline.md`  
**Admission:** `docs/conexus/phase3/3L-B-BT3N-lead-adjudication.md`

## Global Constraints

- Revalidate PR #40 and branch HEAD before touching files.
- Use an isolated worktree via `superpowers:using-git-worktrees`.
- Read `AGENTS.md`, Engineering Method, current README, 3L-R1 and BT-3N lead adjudication before execution.
- Load `.agents/skills/mastra/SKILL.md` before Mastra-specific reasoning/editing/probing.
- Query Context7 `/mastra-ai/mastra` for current schedule/workflow docs when material; version-specific deciding claims require exact installed `@mastra/core 1.56.0` source and/or runtime proof.
- Do not change `spikes/conexus-3l-b/package.json`, `package-lock.json`, direct/transitive pins or dependencies.
- Provider/model calls = 0. E2B calls = 0. Real external effects = 0.
- No Product Agent, PAR owner, AgentRun, Gateway, Product schema, ScheduleOccurrence durable record or Product implementation may be created in the spike.
- No custom scheduler, generic automation domain, EventBus, queue, outbox or new database.
- BT-5N remains blocked. Package C remains `DEFER SAFELY / NOT EXECUTED`.
- Stop immediately on a material contradiction instead of redesigning architecture inside the harness.

---

### Task 1: Project BT-3N lead adjudication into the live routers

**Files:**
- Modify: `scripts/test-conexus-3l-r1-routing.mjs`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/current/ARCHITECTURE-BASELINE.md` only for technology-status projection if currently stale
- Modify: `docs/conexus/current/DECISION-RECONCILIATION.md` only if its Package-B route still says BT-3N pending
- Modify: `docs/conexus/phase3/LEDGER.md`
- Modify: `docs/conexus/phase3/3L-B-technology-qualification.md`
- Test: `scripts/test-conexus-3l-r1-routing.mjs`

**Interfaces:**
- Consumes: `3L-B-BT3N-lead-adjudication.md` verdict.
- Produces: one canonical router state with `BT-3N PASS / LEAD-ADJUDICATED`, `BT-4N NEXT / EXECUTION AUTHORIZED`, `BT-5N BLOCKED`.

- [ ] **Step 1: Add the RED router assertions**

Extend `scripts/test-conexus-3l-r1-routing.mjs` with assertions equivalent to:

```js
assert.match(readme, /BT-3N[^\n]*PASS[^\n]*LEAD-ADJUDICATED/iu);
assert.match(ledger, /BT-3N[^\n]*PASS[^\n]*LEAD-ADJUDICATED/iu);
assert.match(readme, /BT-4N[^\n]*NEXT[^\n]*AUTHORIZED/iu);
assert.match(ledger, /BT-4N[^\n]*NEXT[^\n]*AUTHORIZED/iu);
assert.match(readme, /BT-5N[^\n]*BLOCKED/iu);
assert.match(ledger, /BT-5N[^\n]*BLOCKED/iu);
assert.doesNotMatch(readme, /ARCHITECTURE-LEAD ADJUDICATION = PENDING/iu);
```

- [ ] **Step 2: Run the router test and capture RED**

Run:

```bash
node scripts/test-conexus-3l-r1-routing.mjs
```

Expected before projection: non-zero exit because current routers still say BT-3N lead adjudication pending.

- [ ] **Step 3: Project only the adjudicated status**

Update the listed current/router documents so they state exactly:

```text
BT-3N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY
BT-4N = NEXT / EXECUTION AUTHORIZED
BT-5N = BLOCKED / NOT AUTHORIZED
Package B = IN PROGRESS / NOT CLOSED
Package C = DEFER SAFELY / NOT EXECUTED
Product implementation = BLOCKED
C-018 = NOT RATIFIED
```

Do not change Product meaning or architecture beyond this status projection.

- [ ] **Step 4: Run the router test and capture GREEN**

Run:

```bash
node scripts/test-conexus-3l-r1-routing.mjs
```

Expected: exit 0 and `Conexus 3L-R1 routing test passed.`

- [ ] **Step 5: Commit the projection**

```bash
git add scripts/test-conexus-3l-r1-routing.mjs docs/conexus/current docs/conexus/phase3/LEDGER.md docs/conexus/phase3/3L-B-technology-qualification.md
git commit -m "docs(conexus): project BT-3N lead adjudication"
```

---

### Task 2: Freeze the exact BT-4N public-source admission

**Files:**
- Create: `spikes/conexus-3l-b/evidence/bt4n-source.json`
- Read only: exact installed `node_modules/@mastra/core/**` source and declarations
- Read only: `.agents/skills/mastra/SKILL.md`

**Interfaces:**
- Consumes: exact Package-B lock.
- Produces: source-level decision on the smallest public native schedule target/seam and exact source SHA-256 identities.

- [ ] **Step 1: Verify the lock before source inspection**

```bash
cd spikes/conexus-3l-b
npm run verify:lock
```

Expected: `Package B lock admission passed.`

- [ ] **Step 2: Locate supported scheduler/workflow-target surfaces in the exact installed bytes**

Run bounded source searches, for example:

```bash
rg -n "schedule|scheduler|cron|workflow" node_modules/@mastra/core/dist \
  --glob '*.d.ts' --glob '*.js' > /tmp/bt4n-schedule-source.txt
```

Inspect only exported/public paths needed to answer:

```text
A. how one schedule is registered/claimed/fired
B. whether a workflow/deterministic target is supported without direct Product Agent execution
C. which pre-execution occurrence/schedule/slot fields are exposed
D. whether duplicate/concurrent ticks share stable logical material
```

- [ ] **Step 3: Hash every deciding exact source file**

For each deciding file:

```bash
sha256sum node_modules/@mastra/core/dist/<exact-file>
```

- [ ] **Step 4: Write `bt4n-source.json`**

Use this closed shape:

```json
{
  "probe": "BT-4N",
  "lockSha256": "5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0",
  "coreVersion": "1.56.0",
  "context7Library": "/mastra-ai/mastra",
  "sourceFiles": [],
  "nativeScheduleClaimMechanics": "SUPPORTED|NOT_SUPPORTED|UNKNOWN",
  "deterministicNonAgentTarget": "SUPPORTED|NOT_SUPPORTED|UNKNOWN",
  "stableOccurrenceMaterialBeforeProductExecution": "SUPPORTED|NOT_SUPPORTED|UNKNOWN",
  "candidatePublicSurface": "<exact public API name from installed declarations>",
  "unknowns": []
}
```

Populate every placeholder-like angle-bracket field with the exact discovered public API name before commit; if no public surface exists, use `null` and explain it in `unknowns` rather than inventing one.

- [ ] **Step 5: Commit source admission**

```bash
git add spikes/conexus-3l-b/evidence/bt4n-source.json
git commit -m "test(conexus): admit BT-4N scheduler source"
```

---

### Task 3: Implement the BT-4N RED controls and native positive probe

**Files:**
- Create: `spikes/conexus-3l-b/fixtures/bt4n-child.mjs`
- Create: `spikes/conexus-3l-b/tests/bt4n-native-scheduler-ingress.test.mjs`

**Interfaces:**
- Consumes: the exact public candidate surface recorded in `bt4n-source.json`.
- Produces: deterministic schedule-occurrence observations and a synthetic PAR-ingress counter only.

- [ ] **Step 1: Write the negative direct-agent guard test first**

The test must fail the harness if the selected schedule target invokes an `Agent`, model, Product tool or effect. Use counters initialized to zero and assert:

```js
assert.equal(observation.productAgentExecutions, 0);
assert.equal(observation.modelCalls, 0);
assert.equal(observation.businessToolCalls, 0);
assert.equal(observation.realExternalEffects, 0);
```

The only allowed execution target is the deterministic ingress fixture.

- [ ] **Step 2: Write concurrent-tick / one-logical-slot assertions**

Drive two scheduler/tick contenders against one due schedule/slot using the exact supported public/native mechanism. Assert that the native substrate does not create two independently authoritative logical occurrences for one due slot and capture the pre-execution material used to identify that slot.

The assertion must compare the exact logical occurrence material, not wall-clock delivery timestamps or random process-local IDs.

- [ ] **Step 3: Write duplicate/redelivery assertions**

Present the same logical due slot again through the smallest supported redelivery/retry path the exact substrate exposes. Assert either:

```text
same stable logical material is presented again
```

or, if the native substrate suppresses redelivery entirely, record the stable source facts from which the narrow adapter can deterministically identify the same slot.

- [ ] **Step 4: Write the deterministic ingress fixture**

The fixture may only:

```text
receive native schedule occurrence data
normalize/copy exact stable occurrence material
increment syntheticParIngressCount
emit BT4N_RESULT JSON
```

It must not construct Product Agent, AgentRun, Gateway, Connection, ApprovalRequest, Product owner state or model/tool execution.

- [ ] **Step 5: Run only BT-4N and prove the controls fire**

```bash
cd spikes/conexus-3l-b
node --test --test-concurrency=1 tests/bt4n-native-scheduler-ingress.test.mjs
```

Expected valid outcomes:

```text
PASS_NATIVE_SCHEDULE_INGRESS
NARROW_ADAPTER_REQUIRED
FAIL_SCHEDULER_SUBSTRATE
```

If the direct-agent/model/tool/effect control becomes non-zero, the test must fail rather than relabel the path as acceptable.

- [ ] **Step 6: Commit the probe**

```bash
git add spikes/conexus-3l-b/fixtures/bt4n-child.mjs spikes/conexus-3l-b/tests/bt4n-native-scheduler-ingress.test.mjs
git commit -m "test(conexus): probe BT-4N native scheduler ingress"
```

---

### Task 4: Record bounded BT-4N Evidence and stop

**Files:**
- Create: `spikes/conexus-3l-b/evidence/bt4n.json`
- Modify: `docs/conexus/phase3/3L-B-technology-qualification.md`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/phase3/LEDGER.md`

**Interfaces:**
- Consumes: actual BT-4N runtime result.
- Produces: executor Evidence only; Architecture Lead still adjudicates before BT-5N.

- [ ] **Step 1: Write the result artifact**

Record exactly:

```json
{
  "probe": "BT-4N",
  "lockSha256": "5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0",
  "nativeScheduleClaim": "PASS|FAIL|NOT_PROVEN",
  "stableOccurrenceMaterial": "<actual bounded material or null>",
  "concurrentTickResult": "<actual result>",
  "duplicateRedeliveryResult": "<actual result>",
  "syntheticParIngressCount": 0,
  "productAgentExecutions": 0,
  "modelCalls": 0,
  "businessToolCalls": 0,
  "providerCalls": 0,
  "e2bCalls": 0,
  "realExternalEffects": 0,
  "verdict": "PASS_NATIVE_SCHEDULE_INGRESS|NARROW_ADAPTER_REQUIRED|FAIL_SCHEDULER_SUBSTRATE",
  "limitations": []
}
```

Replace all sample values with observed values. `syntheticParIngressCount` may be non-zero when the deterministic ingress is actually exercised; only Product/model/business/effect counters are required to remain zero.

- [ ] **Step 2: Project executor status without self-adjudicating**

Current docs must state:

```text
BT-4N EXECUTION = COMPLETE
BT-4N EXECUTOR VERDICT = <actual verdict>
ARCHITECTURE-LEAD ADJUDICATION = PENDING
BT-5N = BLOCKED / NOT AUTHORIZED
```

- [ ] **Step 3: Run Package-B verification**

```bash
cd spikes/conexus-3l-b
npm run verify
```

Expected: exit 0 if the chosen BT-4N verdict is a faithfully represented bounded result and all existing tests still pass.

- [ ] **Step 4: Run full repository verification**

```bash
cd ../..
npm run verify
```

Expected: exit 0.

- [ ] **Step 5: Commit Evidence**

```bash
git add spikes/conexus-3l-b/evidence/bt4n.json docs/conexus/current/README.md docs/conexus/phase3/LEDGER.md docs/conexus/phase3/3L-B-technology-qualification.md
git commit -m "docs(conexus): record BT-4N executor evidence"
```

- [ ] **Step 6: Wait for fresh PR CI and STOP**

Require fresh success for:

```text
Conexus 3L Package B
Documentation
```

Do not execute BT-5N regardless of BT-4N result. Return Evidence to Architecture Lead.

---

## Self-review checklist

Before handing execution off, verify that the resulting plan/probe has:

```text
BT-3N adjudication projected before BT-4N execution
Mastra skill loaded
Context7/current docs used only as external Evidence
exact 1.56.0 source used for version-specific deciding claims
existing Package-B lock unchanged
one real RED control for direct Product/model/effect bypass
native scheduler/CAS behavior rather than a custom scheduler
stable occurrence material tested before Product execution
concurrent-tick behavior tested
duplicate/redelivery behavior tested or honestly classified NOT_PROVEN
no Product Agent/model/business tool/Gateway effect executed
no ScheduleOccurrence durable class
no Product owner/schema/database created
BT-5N still blocked
Package C still deferred
fresh Package-B + root verification
fresh CI before completion claim
```
