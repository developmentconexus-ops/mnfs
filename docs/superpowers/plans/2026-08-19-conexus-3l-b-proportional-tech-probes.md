---
id: PLAN-CONEXUS-3L-B-PROPORTIONAL-TECH-PROBES
title: Conexus 3L Package B Proportional Technology Probes Implementation Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
last_reviewed: 2026-08-19
---

# Conexus 3L Package B Proportional Technology Probes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute only the five operator-ratified pre-C-018 Package-B technology probes (`BT-1..BT-5`) needed to falsify the selected Mastra/runtime realization, while preserving the 52 compiled obligations for their real downstream proof stages.

**Architecture:** Package B remains a standalone qualification spike under `spikes/conexus-3l-b/`. The existing exact lock, Mastra skill, Context7 evidence and pinned-source map are reused. No Product owner/module is implemented for a probe; local fixtures exist only to exercise the external Mastra/runtime property under test. One deterministic GitHub workflow proves the spike on every relevant PR change.

**Tech Stack:** Node 24.18.0, npm lockfile v3, `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL 17.10 for storage/restart/isolation probes, Node built-in test runner.

**Spec:** `docs/conexus/phase3/3L-B-proof-routing-amendment.md`

## Global Constraints

- Revalidate remote HEAD/PR before edits; expected bootstrap HEAD includes the approved proof-routing amendment.
- Read `AGENTS.md` → Method → Documentation Map → `current/README` → Package-B amendment/semantic homes.
- Load the installed **Mastra skill** before Mastra-specific source/API/test work. Missing skill = STOP.
- Use Context7 `/mastra-ai/mastra` only when current docs materially help; exact version-specific claims must be checked against the locked source and/or executable probe.
- Reuse the existing Package-B lock. Do not repin or add a direct dependency without stopping for Architecture-Lead adjudication.
- No Product implementation, Product schemas, PAR/Gateway/Release owner implementation, Product UI, C-018, Package C–E execution or merge.
- No provider/model call, E2B call, secret, external schedule activation or real external effect.
- A minimal deterministic local model/tool fixture is permitted only where it exercises a Mastra control path without claiming provider/model behavior.
- Do not execute B1-01..B4-18 literally. They are proof inventory after the amendment.
- Stop on a material architecture contradiction. Do not redesign inside the spike.
- Keep Evidence proportional: one compact result record per BT probe, plus one final Package-B qualification record.
- Run local Package-B verification and root `npm run verify`; Package-B GitHub Actions must be fresh `SUCCESS` before completion is claimed.

---

## File Structure

Modify:

```text
docs/conexus/phase3/3L-B-product-agent-cross-runtime-qualification.md
spikes/conexus-3l-b/admission/criteria.json
spikes/conexus-3l-b/scripts/validate-admission.mjs
spikes/conexus-3l-b/tests/admission.test.mjs
.github/workflows/conexus-3l-b.yml
docs/conexus/current/README.md
docs/conexus/current/ARCHITECTURE-BASELINE.md
docs/conexus/phase3/LEDGER.md
docs/conexus/phase3/3L-B0-admission-record.md
```

Create as needed while executing probes:

```text
spikes/conexus-3l-b/tests/bt1-direct-agent.test.mjs
spikes/conexus-3l-b/tests/bt2-conversation-memory.test.mjs
spikes/conexus-3l-b/tests/bt3-suspend-process-loss.test.mjs
spikes/conexus-3l-b/tests/bt4-schedule-occurrence.test.mjs
spikes/conexus-3l-b/tests/bt5-runtime-isolation.test.mjs
spikes/conexus-3l-b/fixtures/               # only narrowly required deterministic child/fake fixtures
spikes/conexus-3l-b/evidence/bt1.json
spikes/conexus-3l-b/evidence/bt2.json
spikes/conexus-3l-b/evidence/bt3.json
spikes/conexus-3l-b/evidence/bt4.json
spikes/conexus-3l-b/evidence/bt5.json
docs/conexus/phase3/3L-B-technology-qualification.md
```

Do not create Product modules or a miniature Conexus runtime under the spike.

---

### Task 1: Rewire the admission pack from 52-test execution to proof inventory

**Files:**
- Modify: `docs/conexus/phase3/3L-B-product-agent-cross-runtime-qualification.md`
- Modify: `spikes/conexus-3l-b/admission/criteria.json`
- Modify: `spikes/conexus-3l-b/scripts/validate-admission.mjs`
- Modify: `spikes/conexus-3l-b/tests/admission.test.mjs`
- Modify: `docs/conexus/current/README.md`
- Modify: `docs/conexus/current/ARCHITECTURE-BASELINE.md`
- Modify: `docs/conexus/phase3/LEDGER.md`
- Modify: `docs/conexus/phase3/3L-B0-admission-record.md`

**Interfaces:**
- Consumes: `3L-B-proof-routing-amendment.md`, B0 final Lead PASS.
- Produces: machine-checkable current execution routing: B0 PASS, BT-1..BT-5 current, 52 obligations preserved but not literal pre-C-018 execution.

- [ ] **Step 1: Add the RED execution-routing control**

Extend the admission test with a mutated record that says literal B1–B4 execution is allowed pre-C-018 and require rejection.

Required assertion shape:

```javascript
const bad = structuredClone(realAdmission);
bad.executionRouting.literalB1B4PreC018 = true;
assert.throws(() => validateAdmission(bad), /literal B1-B4 pre-C-018 execution is superseded/u);
```

Run:

```bash
cd spikes/conexus-3l-b
npm test
```

Expected: RED because `executionRouting`/the new guard is not implemented yet.

- [ ] **Step 2: Materialize the minimal machine routing**

Add this top-level record to `admission/criteria.json`:

```json
"executionRouting": {
  "mode": "PROOF_INVENTORY_PLUS_TECH_PROBES",
  "literalB1B4PreC018": false,
  "currentTechnologyProbes": ["BT-1", "BT-2", "BT-3", "BT-4", "BT-5"],
  "firstBuildConformance": [
    "B1-01..B1-10",
    "B2-01",
    "B2-03..B2-09",
    "B2-11..B2-12",
    "B3-01..B3-12",
    "B4-01..B4-18"
  ],
  "failureRecovery": ["B2-02", "B2-10"],
  "observabilityFamilies": "ROUTED_TO_E"
}
```

This routing metadata is navigation/enforcement, not a second architecture authority.

- [ ] **Step 3: Enforce exactly the current route**

`validateAdmission()` must fail unless:

```text
mode = PROOF_INVENTORY_PLUS_TECH_PROBES
literalB1B4PreC018 = false
currentTechnologyProbes = exactly BT-1..BT-5 in order
failureRecovery = exactly B2-02, B2-10
observabilityFamilies = ROUTED_TO_E
```

Do not encode Product semantics beyond the approved amendment.

- [ ] **Step 4: Add missing-probe and extra-probe negative controls**

Add two table-driven mutations:

```javascript
// remove BT-3 -> reject
// add BT-6 -> reject
```

Run:

```bash
npm test
```

Expected: GREEN for the real record and RED behavior observed through the negative fixtures.

- [ ] **Step 5: Rewire human-facing routing**

Current status wording must become semantically equivalent to:

```text
Package B = IN PROGRESS
B0 = LEAD-ADJUDICATED / PASS
Proof-routing amendment = APPROVED / CURRENT
BT-1..BT-5 = NEXT / NOT EXECUTED
52 obligations = PRESERVED DOWNSTREAM PROOF INVENTORY
CX-AGENT-MASTRA-01 = NOT YET QUALIFIED
CX-RUNTIME-ISOLATION-01 = NOT YET QUALIFIED
```

The parent `3L-B` document must prominently route execution to `3L-B-proof-routing-amendment.md` and state that its B1→B4 sections are partially superseded **only for execution timing**.

- [ ] **Step 6: Verify and commit routing**

Run:

```bash
cd spikes/conexus-3l-b
npm run verify
cd ../../
npm run verify
```

Commit only after both are green.

---

### Task 2: BT-1 — Direct Agent authority closure

**Files:**
- Create: `spikes/conexus-3l-b/tests/bt1-direct-agent.test.mjs`
- Create: `spikes/conexus-3l-b/evidence/bt1.json`
- Read: exact source files already hashed in `evidence/source-map.json`

**Interfaces:**
- Consumes: exact Package-B lock and direct-Agent/editor source surface.
- Produces: verdict `PASS | FAIL_REALIZATION | NOT_PROVEN` for direct-instance execution/override closure.

- [ ] **Step 1: Load Mastra skill and re-check exact direct-Agent/editor source**

Do not begin from remembered API spelling. Record only source/API facts needed to construct the test.

- [ ] **Step 2: Write the negative-control test first**

The fixture must construct two distinguishable code-defined Agent instances (`oldExact`, `newMutable`) using a deterministic no-provider model fixture compatible with the exact pinned model interface.

The negative control must demonstrate that a deliberately introduced mutable selector **would** choose `newMutable`, proving the test can detect substitution.

Conceptual assertion:

```javascript
assert.equal(deliberatelyMutableSelector().identity, 'newMutable');
```

- [ ] **Step 3: Test the governed direct-instance path**

Exercise the direct code-defined Agent instance itself; do not call a Stored/latest lookup. Prove:

```text
selected object identity = oldExact
only oldExact local model fixture is invoked
newMutable fixture call count = 0
```

- [ ] **Step 4: Prove Editor/override closure on exact pinned source/runtime surface**

Use the exact supported configuration (currently expected to be `editor:false` only if pinned source confirms it). The test/source assertion must prove governed instructions/model/tools are not required to be taken from mutable Editor state.

If the exact pinned API cannot close the override channel, do not invent a wrapper in this task; return `FAIL_REALIZATION` for Lead adjudication.

- [ ] **Step 5: Write `evidence/bt1.json`**

Record:

```json
{
  "probe": "BT-1",
  "lockSha256": "<current admitted lock digest>",
  "negativeControlFired": true,
  "directInstancePath": "PASS|FAIL|NOT_PROVEN",
  "editorOverrideClosure": "PASS|FAIL|NOT_PROVEN",
  "providerCalls": 0,
  "verdict": "PASS|FAIL_REALIZATION|NOT_PROVEN"
}
```

Use the actual observed values; do not invent a digest or PASS.

- [ ] **Step 6: Run and commit**

```bash
node --test tests/bt1-direct-agent.test.mjs
npm run verify
```

Stop after a failing load-bearing property; do not compensate architecturally inside the spike.

---

### Task 3: BT-2 — Conversation / memory substrate isolation

**Files:**
- Create: `spikes/conexus-3l-b/tests/bt2-conversation-memory.test.mjs`
- Create: `spikes/conexus-3l-b/evidence/bt2.json`

**Interfaces:**
- Consumes: exact `@mastra/memory` + `@mastra/pg` lock.
- Produces: substrate verdict for explicit thread/resource separation.

- [ ] **Step 1: Confirm exact memory/thread APIs from skill + pinned source**

Use PostgreSQL 17.10; do not enable Semantic Recall, OM, Extractors or other advanced memory merely to run the probe.

- [ ] **Step 2: Write an insufficient-scope negative control**

Construct two logical conversations whose intentionally weak substrate key omits one required dimension and demonstrate observable alias/leakage at the exact primitive being tested.

The control must actually exhibit the failure; a hypothetical assertion is insufficient.

- [ ] **Step 3: Prove corrected explicit scope separation**

Using distinct explicit thread/resource identities, prove:

```text
conversation A history/thread state != conversation B
resource A cannot silently reuse a thread owned by incompatible resource B
thread-scoped and resource-scoped behavior are distinguishable
```

Do not claim this proves the future Conexus owner-key encoder; it proves the substrate can support one.

- [ ] **Step 4: Record `evidence/bt2.json` and run**

Required fields:

```text
probe
PostgreSQL exact version
lock digest
negative control result
thread isolation result
resource ownership/mismatch result
advanced memory enabled = false
verdict
```

Run:

```bash
node --test tests/bt2-conversation-memory.test.mjs
npm run verify
```

---

### Task 4: BT-3 — Suspend / process loss / fresh RequestContext capability

**Files:**
- Create: `spikes/conexus-3l-b/tests/bt3-suspend-process-loss.test.mjs`
- Create narrowly required child fixtures under `spikes/conexus-3l-b/fixtures/`
- Create: `spikes/conexus-3l-b/evidence/bt3.json`

**Interfaces:**
- Consumes: exact direct-Agent suspend/resume and PostgreSQL storage APIs.
- Produces: fresh-process continuation capability plus honest active-crash characterization.

- [ ] **Step 1: Resolve exact direct-Agent suspension/resume surface**

Use Mastra skill, current Context7 only if useful, then exact pinned source. Do not substitute a Workflow wrapper unless the direct-Agent path itself is proven unavailable; such a result is a Finding/`FAIL_REALIZATION`, not permission to change architecture.

- [ ] **Step 2: Create a deterministic suspend fixture**

Use a no-provider local model/tool fixture that causes one genuine direct-Agent tool suspension and persists it in PostgreSQL.

The fixture must record the initial RequestContext containing an explicit poison key such as:

```json
{"currentRole":"OLD","unknownStaleKey":"MUST_DISAPPEAR"}
```

- [ ] **Step 3: Prove real process boundary**

Run the suspend phase in a child Node process, wait until durable suspension is observed, then exit/terminate that process. Resume from a **new Node process** created after the first is gone.

A same-process object recreation does not satisfy this step.

- [ ] **Step 4: Resume with a fresh RequestContext**

Pass a new effective context such as:

```json
{"currentRole":"NEW"}
```

The resumed executing surface must observe `currentRole=NEW` and must not receive `unknownStaleKey` as effective authority-shaped context.

If Mastra unavoidably merges restored stale keys into the effective context despite supplied current context, record FAIL; do not hide it with a fake Conexus owner implementation.

- [ ] **Step 5: Characterize plain active-Agent process loss separately**

Start a non-suspended direct Agent path that remains active long enough for deterministic termination. Kill its process and inspect only what the exact substrate durably reports afterward.

Record observations as `KNOWN`/`UNKNOWN`; do not invent owner terminal state or recovery policy.

- [ ] **Step 6: Record `evidence/bt3.json`, run serially, commit**

Run with test concurrency 1:

```bash
node --test --test-concurrency=1 tests/bt3-suspend-process-loss.test.mjs
npm run verify
```

---

### Task 5: BT-4 — Schedule intended-slot / redelivery substrate

**Files:**
- Create: `spikes/conexus-3l-b/tests/bt4-schedule-occurrence.test.mjs`
- Create: `spikes/conexus-3l-b/evidence/bt4.json`

**Interfaces:**
- Consumes: exact Mastra schedule/worker source already mapped in B0.
- Produces: `NATIVE_SUFFICIENT | NARROW_ADAPTER_REQUIRED | NOT_PROVEN | FAIL_REALIZATION`.

- [ ] **Step 1: Reinspect exact scheduler/worker source and public surface**

Answer narrowly:

```text
what identifies schedule?
what identifies intended fire slot?
what does a delivery/redelivery payload contain before Product execution?
can the target be a bounded ingress/adapter instead of direct Product Agent generation?
```

- [ ] **Step 2: Write the transport-time negative control**

Demonstrate that deriving occurrence identity from delivery/current wall-clock time creates different identities for two deliveries of the same intended slot.

Conceptually:

```javascript
assert.notEqual(deriveFromDeliveryTime(firstDelivery), deriveFromDeliveryTime(redelivery));
```

- [ ] **Step 3: Exercise the strongest native schedule path available without external/Product activation**

Using exact local schedule mechanics, capture the pre-execution wake facts for one logical slot and a deterministic redelivery/replay of that same slot where the API permits it.

The deciding question is whether stable source facts exist **before** any hypothetical PAR admission.

- [ ] **Step 4: Adjudicate native vs narrow adapter**

If exact native data exposes stable intended-slot identity, record `NATIVE_SUFFICIENT`.

If native mechanics expose schedule identity + intended slot facts but require a thin conversion before owner ingress, record:

```text
NARROW_ADAPTER_REQUIRED
```

This fires the existing 3H-02 seam and is a valid Package-B result. Do not create a second scheduler.

If the property cannot be established without external/billable mechanics, record `NOT_PROVEN` and stop for Lead adjudication.

- [ ] **Step 5: Record `evidence/bt4.json`, run, commit**

```bash
node --test tests/bt4-schedule-occurrence.test.mjs
npm run verify
```

---

### Task 6: BT-5 — Same-process Builder ↔ PAR isolation

**Files:**
- Create: `spikes/conexus-3l-b/tests/bt5-runtime-isolation.test.mjs`
- Create: `spikes/conexus-3l-b/evidence/bt5.json`

**Interfaces:**
- Consumes: exact Mastra instance/storage/PubSub surfaces.
- Produces: `QUALIFIED_SAME_PROCESS | PROCESS_SPLIT_REQUIRED | NOT_PROVEN`.

- [ ] **Step 1: Enumerate only enabled/current-path process-global facilities**

Start from 3H-03 + exact pinned source. Deferred OM/Durable-Agent machinery must not be enabled just to test it.

- [ ] **Step 2: Construct two role-specific Mastra graphs**

In one Node process create:

```text
BuilderMastra → Builder-specific persistent store + explicit PubSub + Builder-only registered surface
ParMastra     → PAR-specific persistent store + distinct explicit PubSub + PAR-only registered surface
```

Use separate PostgreSQL logical databases/schemas as permitted by the exact probe setup so store writes are mechanically distinguishable.

- [ ] **Step 3: Prove the shared-PubSub negative control fires**

Deliberately wire a separate control pair to one unpartitioned PubSub and demonstrate cross-role observation/collision relevant to the runtime primitive.

Then restore distinct PubSub instances and prove disjoint observation.

- [ ] **Step 4: Prove governed role separation on current enabled surfaces**

At minimum demonstrate:

```text
store writes stay role-local
opposite-role registered identities cannot be resolved through the other role instance
role-local mutable objects are distinct
module-default PubSub canary receives zero governed role events where the exact source permits canary observation
standalone/ephemeral fallback is not required for the exercised governed path
```

If an enabled process-global facility bleeds despite the smallest reliable instance/PubSub/store partition, record the exact failure and do not introduce a bus/proxy.

- [ ] **Step 5: Decide the exact verdict**

```text
no reachable unpartitionable bleed = QUALIFIED_SAME_PROCESS
reachable load-bearing unpartitionable bleed = PROCESS_SPLIT_REQUIRED
insufficient evidence = NOT_PROVEN
```

- [ ] **Step 6: Record `evidence/bt5.json`, run serially, commit**

```bash
node --test --test-concurrency=1 tests/bt5-runtime-isolation.test.mjs
npm run verify
```

---

### Task 7: Package-B evidence closure and stop

**Files:**
- Create: `docs/conexus/phase3/3L-B-technology-qualification.md`
- Modify: `.github/workflows/conexus-3l-b.yml`
- Modify routing docs only after actual evidence exists.

**Interfaces:**
- Consumes: BT-1..BT-5 exact result records.
- Produces: one reviewable Package-B qualification result for Architecture-Lead adjudication. Does **not** self-authorize Package C.

- [ ] **Step 1: Extend the deterministic Package-B workflow**

Keep the existing B0 admission job. Add PostgreSQL 17.10 and execute the exact BT test files. No secrets or provider/model/E2B calls.

The workflow must fail if any executable PASS-required probe test fails. A probe whose evidence verdict is deliberately `NOT_PROVEN`/`NARROW_ADAPTER_REQUIRED` may only be represented as such if its test asserts that exact observed bounded result rather than forcing green semantics.

- [ ] **Step 2: Write the qualification result from observed Evidence**

`3L-B-technology-qualification.md` must state for each BT:

```text
question
exact source/runtime identity
negative control result
positive/observed result
Known / Unknown / limitation
verdict
architecture consequence, if any
```

Then state candidate package verdicts without overclaiming:

```text
CX-AGENT-MASTRA-01 = QUALIFIED | QUALIFIED_WITH_LIMITATION | NOT_PROVEN | FAIL_REALIZATION
CX-RUNTIME-ISOLATION-01 = QUALIFIED_SAME_PROCESS | PROCESS_SPLIT_REQUIRED | NOT_PROVEN
```

Do not mark Package B closed yourself.

- [ ] **Step 3: Run full verification**

```bash
cd spikes/conexus-3l-b
npm run verify
cd ../../
npm run verify
```

Push and wait for fresh GitHub Actions:

```text
Conexus 3L Package B = SUCCESS
Documentation = SUCCESS
```

Existing Package-A workflows must remain non-regressed if they run.

- [ ] **Step 4: STOP and report**

Return:

```text
final HEAD
BT-1 verdict
BT-2 verdict
BT-3 verdict
BT-4 verdict
BT-5 verdict
Package-B local verify result
root npm run verify result
Package-B workflow run/result
new dependency? yes/no
provider/model/E2B calls = 0
Product code = 0
Material Findings
```

Do not start Package C, 3M, Product implementation, C-018 or merge. Evidence returns to the Architecture Lead for adjudication and, if appropriate, Fable challenge.
