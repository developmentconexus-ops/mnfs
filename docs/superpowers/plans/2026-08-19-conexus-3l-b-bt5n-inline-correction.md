---
id: PLAN-CONEXUS-3L-B-BT5N-INLINE-CORRECTION
title: Conexus 3L Package B BT-5N Inline Harness Correction Plan
document_type: implementation_plan
form: how_to
authority: guidance
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
last_reviewed: 2026-08-19
execution_mode: inline
---

# Conexus 3L Package B BT-5N Inline Harness Correction Plan

> **For the Codex executor:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` in one continuous session. Do **not** use `superpowers:subagent-driven-development`, parallel agents or a fresh agent per task.

**Goal:** Correct the bounded BT-5N harness wiring mismatch, execute the complete PostgreSQL-backed role-isolation proof, and return one honest candidate verdict for Architecture-Lead / Package-B closure adjudication.

**Architecture:** Keep the accepted same-process candidate unchanged: two explicit role-specific Mastra instances, stores, PostgreSQL schemas and PubSubs. The correction wires the already-created role PubSub explicitly into both the role Agent and the owning Mastra instance, eliminating implicit Agent PubSub resolution from the probe. No Product or runtime architecture is added.

**Tech Stack:** Node `24.18.0`, npm lockfile v3, `node:test`, `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL `17.10`, installed Mastra skill, Context7 `/mastra-ai/mastra`.

**Spec:** `docs/conexus/phase3/3L-R1-framework-native-proportional-qualification-rebaseline.md`  
**Admission:** `docs/conexus/phase3/3L-B-BT5N-lead-adjudication.md`

## Global Constraints

- Repository: `developmentconexus-ops/mnfs`.
- Branch: `agent/conexus-phase-3-system-design`.
- PR: `#40`; keep `OPEN / DRAFT / NOT MERGED`.
- Start with `git fetch`; revalidate remote HEAD, PR state and the latest accepted adjudication commit.
- Use one isolated worktree through `superpowers:using-git-worktrees`.
- Execute this plan inline in one continuous Codex session.
- Read `AGENTS.md`, Engineering Method, current README, 3L-R1 and BT-5N lead adjudication before editing.
- Load `.agents/skills/mastra/SKILL.md` before Mastra-specific inspection or editing.
- Use Context7 `/mastra-ai/mastra` when current documentation is material.
- Claims about `1.56.0` require exact installed declarations/source and runtime Evidence.
- Keep Package-B lock SHA-256 exactly `5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0`.
- Do not modify dependency manifests, lockfile, versions or transitive closure.
- Provider/model API calls = `0`; deterministic local model fixture remains allowed.
- E2B calls = `0`; real external effects = `0`.
- Do not create process split, RuntimeBus, EventBus, generic PubSub abstraction, queue, outbox, lease/fencing system, Product module/schema/owner or new database.
- Do not remove a meaningful assertion merely to obtain GREEN.
- Package B remains open until Architecture-Lead closure adjudication.

---

## Task 1: Revalidate the exact source contract and freeze the correction

**Files:**
- Read: `spikes/conexus-3l-b/evidence/bt5n-source.json`
- Read: exact installed `node_modules/@mastra/core/dist/agent/**`, Agent declarations and deciding bundle
- Modify only if the existing source artifact is factually incomplete: `spikes/conexus-3l-b/evidence/bt5n-source.json`

**Produces:** source-bound confirmation that explicit Agent PubSub wiring is a supported public realization in the exact lock.

- [ ] Reinstall and verify the exact Package-B lock:

```bash
cd spikes/conexus-3l-b
npm ci --ignore-scripts --audit=false --fund=false
npm run verify:lock
sha256sum package-lock.json
```

Expected lock SHA-256:

```text
5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0
```

- [ ] Inspect the exact installed Agent declaration and deciding source for:

```text
AgentConfig.pubsub
Agent constructor assignment/order
Agent.getPubSub resolution order
Mastra Agent attachment
standalone/ephemeral fallback condition
```

- [ ] Record the source verdict in the execution report:

```text
EXPLICIT_AGENT_PUBSUB_SUPPORTED
```

or stop with:

```text
STOP_SOURCE_CONTRADICTION
```

Do not proceed if the exact installed public contract does not support explicit Agent PubSub wiring.

---

## Task 2: Correct only the role fixture and run the focused discriminant

**Files:**
- Modify: `spikes/conexus-3l-b/fixtures/bt5n-role-fixtures.mjs`
- Test: `spikes/conexus-3l-b/tests/bt5n-role-instance-isolation.test.mjs`

**Produces:** the full existing BT-5N positive test running past the earlier object-identity boundary without weakening its isolation assertions.

- [ ] Preserve the existing CI failure as RED Evidence:

```text
builder.agent.getPubSub() !== builder.pubsub
```

- [ ] Apply the smallest correction in `createRoleFixture`:

```js
const agent = new Agent({
  id: agentId,
  name: `${role} BT-5N Agent`,
  instructions: `Return only the attached ${role} fixture identity.`,
  model: deterministicLocalModel(role, counters),
  tools: { [toolKey]: tool },
  memory,
  pubsub,
  editor: false,
});
```

Use the same exact `pubsub` object already passed to the owning `Mastra` instance.

- [ ] Do not remove these discriminants:

```text
Agent Mastra attachment identity
Agent role PubSub identity
Builder Agent PubSub != PAR Agent PubSub
shared-PubSub negative control
registry isolation
store/schema isolation
schedule isolation
workflow event isolation
thread-stream isolation
standalone/ephemeral fallback exclusion
zero provider/E2B/real effects
```

- [ ] Run the focused test against PostgreSQL 17.10:

```bash
cd spikes/conexus-3l-b
node --test --test-concurrency=1 tests/bt5n-role-instance-isolation.test.mjs
```

Allowed outcomes:

```text
QUALIFIED_SAME_PROCESS
PROCESS_SPLIT_REQUIRED
NOT_PROVEN
```

Decision rules:

```text
explicit wiring passes + all enabled F1 role boundaries remain disjoint
→ QUALIFIED_SAME_PROCESS candidate

explicit wiring still resolves a different Agent PubSub
→ NOT_PROVEN / MATERIAL FRAMEWORK BEHAVIOR / STOP

enabled F1 cross-role mutable bleed is observed with no smaller reliable fence
→ PROCESS_SPLIT_REQUIRED candidate / STOP
```

Do not implement a process split or a new fence inside the harness.

---

## Task 3: Record Evidence, verify once, and stop

**Files:**
- Modify: `spikes/conexus-3l-b/evidence/bt5n.json`
- Modify only for executor status projection:
  - `docs/conexus/current/README.md`
  - `docs/conexus/current/ARCHITECTURE-BASELINE.md`
  - `docs/conexus/current/DECISION-RECONCILIATION.md`
  - `docs/conexus/phase3/LEDGER.md`
  - `docs/conexus/phase3/3L-B-technology-qualification.md`
  - `scripts/test-conexus-3l-r1-routing.mjs`

**Produces:** one fresh executor verdict; no Package-B self-closure.

- [ ] Replace the previous `NOT_PROVEN` result artifact only with actually observed values from the corrected full test.

Required Evidence includes:

```text
role instance identity
store/schema identities
Agent PubSub identities
shared-PubSub negative result
separate-PubSub positive result
registry lookup denials
schedule/store isolation
workflow event isolation
thread-stream isolation
model fixture counts
provider/E2B/real-effect counts
all limitations and requalification triggers
```

- [ ] Project only executor status:

```text
BT-5N EXECUTION = COMPLETE
BT-5N EXECUTOR VERDICT = <actual verdict>
ARCHITECTURE-LEAD / PACKAGE-B CLOSURE ADJUDICATION = PENDING
Package B = IN PROGRESS / NOT CLOSED
```

- [ ] Run Package-B verification once:

```bash
cd spikes/conexus-3l-b
npm run verify
```

- [ ] Run root verification once:

```bash
cd ../..
npm run verify
```

- [ ] Push to the same PR branch and wait for fresh CI:

```text
Conexus 3L Package B = SUCCESS
Documentation = SUCCESS
```

If an unrelated known flaky workflow fails, return its exact log and do not mutate unrelated code.

- [ ] Stop. Do not execute Package C, D, E, 3M, C-018, Product implementation, PR readiness or merge.

## Completion Report

Return exactly:

```text
final HEAD:
PR state:
execution mode = INLINE:
Package-B lock SHA-256:
Mastra skill loaded:
Context7 library:
exact Agent pubsub source files + SHA-256:
source verdict:
RED evidence:
minimal correction:
focused BT-5N result:
Agent attachment identities:
Agent PubSub identities:
shared-PubSub negative control:
registry isolation:
store/schema isolation:
schedule isolation:
workflow event isolation:
thread-stream isolation:
standalone/ephemeral fallback:
enabled process-global surfaces:
deferred process-global surfaces:
provider/model API calls:
E2B calls:
real external effects:
BT-5N executor verdict:
Package-B npm run verify:
root npm run verify:
fresh CI:
Findings:
Package B = NOT SELF-CLOSED
Package C = DEFER SAFELY / NOT EXECUTED
Package D = NOT EXECUTED
Package E = NOT EXECUTED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
merge = NOT PERFORMED
```
