---
id: DOC-ARR-S1-AGENT-RUNTIME-CONTRACT
title: ARR-S1 Agent Runtime Conformance Contract
document_type: architecture_spike_contract
form: reference
authority: contract
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
related:
  - DOC-ARR-SPIKE-GOVERNANCE
  - ADR-0013
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE
tracking_issue: 23
last_reviewed: 2026-08-08
---

# ARR-S1 Agent Runtime Conformance Contract

## 1. Purpose

ARR-S1 answers two related but distinct questions:

1. **Which concrete Agent Runtime should MNFS use first?**
2. **Should the initial MNFS/runtime integration boundary be runtime-specific or ACP?**

The contract is candidate-independent. Operator preference may determine investigation order, but cannot change deciding criteria or promote a candidate that fails them.

The accepted architectural baseline remains:

```text
MNFS owns Role / ActorRun / Attempt / Authority / Claim / Evidence / Verdict / Recovery
Agent Runtime owns model/provider mechanics, agent loop, live events and runtime Session
Runtime Session is observational state, never MNFS authority
fresh MNFS recovery must work without transcript/session resume
```

No candidate execution is authorized by this proposed contract. Real candidate execution requires an accepted S1 contract, accepted S1 plan and later exact `GATE-S1` authority.

---

## 2. Pi-first investigation order

ARR-S1 is intentionally **Pi-first** because Pi is the incumbent with historical AS-02 evidence and currently exposes supported SDK and RPC programmatic boundaries.

Pi-first is an execution-order optimization, not winner preselection.

The sequence is:

```text
Phase A — Pi integration-shape qualification
  A1 Pi SDK
  A2 Pi-ACP
  A3 direct Pi RPC only when a deciding ambiguity remains

Phase B — mandatory external challenger
  B1 OpenCode native ACP

Phase C — conditional second ACP implementation
  C1 only when ACP remains decision-relevant and two independent ACP implementations
     have not already been proved by Pi-ACP + OpenCode ACP
```

If Pi-ACP and OpenCode ACP both pass through the same MNFS ACP client harness, those are two real ACP implementations for the interoperability question. A third ACP implementation is not required merely for ceremony.

If Pi SDK wins and OpenCode ACP exposes a material ACP advantage that could still alter the boundary decision, a second independent ACP implementation such as `codex-acp` becomes required before selecting ACP as the product boundary.

---

## 3. Frozen provenance snapshot

The dedicated S1 execution plan must revalidate these identities immediately before any real run. A newer release may replace a frozen candidate only through a plan/contract-compatible provenance refresh before the first candidate executes; after one candidate executes, comparison fairness requires all affected candidates to use the same contract revision and the frozen provenance set unless the comparison is formally invalidated and rerun.

| Candidate / boundary | Frozen version | Frozen source identity | License | Role |
|---|---:|---|---|---|
| Pi coding agent | `@earendil-works/pi-coding-agent@0.84.1` | tag `v0.84.1` → `53fa77ccd8a279eb87e92294ef3687b03ff80112` | MIT | incumbent runtime |
| Pi SDK | Pi `0.84.1` public SDK | same Pi release | MIT | primary Pi integration hypothesis |
| Pi RPC | Pi `0.84.1`, `pi --mode rpc` | same Pi release | MIT | process-boundary diagnostic/fallback |
| Pi-ACP | `pi-acp@0.0.33` | `svkozak/pi-acp@d1cffc047ab37a096ee70ca39cfc1de463db8d12` | MIT | ACP boundary over Pi RPC |
| ACP TS SDK | `@agentclientprotocol/sdk@1.3.0` | `agentclientprotocol/typescript-sdk@e1054d0122e844cca9f1016a598a1da06f78ccef` | Apache-2.0 | MNFS ACP client harness |
| OpenCode | release `v1.18.15` | `325529761beb79a004de6d86e48b8db69cf4eba3` | MIT | mandatory external ACP challenger |

Important provenance observations:

- Pi documents both SDK and RPC as supported programmatic modes.
- Pi-ACP is listed in the ACP registry but describes itself as an MVP-style adapter and currently bridges ACP to `pi --mode rpc`.
- Pi-ACP `0.0.33` declares `@agentclientprotocol/sdk ^0.26.0`, while the frozen MNFS ACP client uses current SDK `1.3.0`; interoperability must therefore be proved on the wire, not inferred from package names.
- Pi-ACP currently does not implement ACP filesystem or terminal delegation; Pi continues local file/process operations unless MNFS constrains the Pi side separately.
- OpenCode exposes native ACP via `opencode acp` and is a challenger to both Pi runtime choice and ACP-boundary value.

---

## 4. Threat, authority and credential boundary

ARR-S1 evaluates runtime conformance, not the final execution sandbox. The preferred topology under ADR-0015 is control-side placement when the runtime can be reduced to explicit MNFS-approved capabilities:

```text
trusted control side
MNFS semantic kernel
        ↓
ActorRun runtime process
        ↓
Agent Runtime
        ↓ explicit MNFS-controlled operations only
S2 execution envelope / mutable workspace
```

Provider/subscription credentials remain control-side and must not be copied into the untrusted S2 workspace merely because a runtime supports them.

S1 may use an already-authorized provider login only under the later execution gate. Evidence must never persist raw OAuth tokens, API keys, cookies, credential files or complete inherited environments.

Runtime completion never grants Claim or acceptance authority.

---

## 5. Required deciding criteria

Every executed runtime shape is evaluated against the same criteria. Values are `PASS`, `FAIL`, `BLOCKED`, or `UNKNOWN`.

| ID | Criterion | Required proof |
|---|---|---|
| `S1-C01` | exact working directory control | runtime starts in the exact fixture workspace and never silently substitutes another cwd |
| `S1-C02` | exact environment control | runtime receives only the reviewed environment projection; ambient host variables are not inherited silently |
| `S1-C03` | deterministic tool/resource inventory | prompt-visible and callable tools/resources exactly match the frozen inventory |
| `S1-C04` | discovery suppression/bounding | extensions, skills, prompts, MCP servers or other discovery cannot silently expand the inventory |
| `S1-C05` | supported authentication path | at least one current upstream-supported operator authentication route works for the tested shape without exposing raw credentials to the fixture workspace |
| `S1-C06` | cancellation | MNFS can request cancellation and observe bounded settled termination without orphaning uncontrolled work |
| `S1-C07` | bounded event/output surface | streaming/events/output are structured, bounded and attributable to the exact ActorRun |
| `S1-C08` | unambiguous settled/final semantics | MNFS can determine when the runtime turn is finished, failed or cancelled without model narrative |
| `S1-C09` | process-death classification | abrupt runtime-process death is observable distinctly from successful completion |
| `S1-C10` | fresh MNFS recovery | a fresh MNFS process can recover authoritative state without runtime Session/transcript resume |
| `S1-C11` | structured result/event surface | required tool, assistant, error and lifecycle observations are machine-readable rather than scraped from human TUI text |
| `S1-C12` | public/supported integration boundary | tested boundary is documented/supported upstream or explicitly accepted as an adapter risk |
| `S1-C13` | exact provenance and license | executable/package/source identity and license are pinned in Evidence |
| `S1-C14` | no authority inversion | runtime Session, internal plan, permission UX or completion cannot override MNFS Mission/Attempt/Claim/Gate authority |
| `S1-C15` | machinery leverage | integration eliminates or avoids a named MNFS machinery class rather than merely adding another translation layer |
| `S1-C16` | maintenance/upgrade boundedness | required adapter surface, upgrade coupling and failure modes are explicit and small enough for M2 |

No candidate may PASS by weakening tool inventory, discovery rules, recovery requirements or other criteria after another candidate has run.

---

## 6. Fixed S1 fixture

All executed candidates consume the same logical fixture:

```text
one disposable Git workspace
one deterministic nonce-bearing task
one explicit MNFS tool/resource inventory
one provider/model class chosen only for producing the controlled task result
one bounded event recorder
one cancellation checkpoint
one forced process-death checkpoint
one fresh-MNFS recovery checkpoint
```

The task must require at least one real tool/resource operation whose result cannot be correctly produced from the prompt alone.

Candidate-specific adapters may translate the same logical inventory into SDK, RPC or ACP calls, but they may not add capabilities unavailable to another candidate unless the difference itself is recorded as deciding Evidence.

---

## 7. Pi integration-shape rules

### Pi SDK

Pi SDK is the primary Pi hypothesis because MNFS is Node.js/TypeScript and the public SDK exposes direct session/runtime, tool and event control.

The S1 harness must prove that Pi can run with an exact explicit resource/tool set and without uncontrolled discovery. Embedding Pi in an ActorRun process is permitted; the sovereign MNFS state owner remains a separate process/durable store and must survive ActorRun death.

### Pi-ACP

Pi-ACP is tested as an **ACP boundary hypothesis**, not as proof that ACP automatically supplies security delegation.

Because Pi-ACP currently leaves filesystem/terminal execution on the Pi side, S1-C03/S1-C04 and the later S2 composition must prove that the Pi subprocess cannot bypass the intended MNFS execution path.

Pi-ACP PASS proves only the capabilities actually exercised by the frozen ACP client and fixture.

### Direct Pi RPC

Direct Pi RPC is not a mandatory full third candidate. It becomes a full tested shape only when one of these conditions holds:

- Pi SDK fails solely because an out-of-process boundary is required;
- Pi-ACP fails and the failure must be isolated between Pi RPC and the ACP translation layer;
- SDK vs Pi-ACP results remain ambiguous about process-boundary or maintenance cost.

Otherwise direct RPC remains supported-boundary provenance, not additional ceremony.

---

## 8. Challenger and early-stop rules

OpenCode native ACP is mandatory before a final S1 selection because D-012 requires a real external runtime comparison.

After Pi qualification and OpenCode ACP, S1 may terminate without another runtime when all of the following are true:

1. one Pi integration shape PASSes every required criterion;
2. OpenCode ACP has been **executed and finalized under the same contract** with a candidate verdict of `PASS` or `FAIL`; `BLOCKED` does not satisfy the required external comparison and cannot authorize a final runtime/boundary selection;
3. OpenCode exposes no unique required capability and does not eliminate a named material MNFS machinery class that the passing Pi shape requires;
4. remaining differences are optional ergonomics, ecosystem breadth or non-deciding performance/maintenance observations;
5. no unresolved finding can still change runtime or boundary selection.

If OpenCode ACP is `BLOCKED` before a meaningful real comparison completes, S1 cannot select Pi merely from incumbent Evidence. The spike terminates `BLOCKED` or `REPLAN_REQUIRED` according to whether the missing comparison can be completed under the accepted contract and authority.

If Pi-ACP and OpenCode ACP both PASS via the same MNFS ACP client, ACP interoperability has two real implementations and a selecting Decision may choose `ACP boundary + Pi initial runtime` without a third ACP candidate.

If Pi SDK wins but OpenCode ACP reveals a material boundary advantage, execute a second independent ACP implementation before selecting ACP generically.

---

## 9. Candidate and boundary verdicts

Each executed shape receives one conformance verdict:

```text
PASS
FAIL
BLOCKED
REJECT
```

- `PASS` — every required criterion is proved and Evidence integrity is valid.
- `FAIL` — the candidate/shape violates a required criterion under the frozen contract.
- `BLOCKED` — required proof cannot be completed because a prerequisite is unavailable or inconclusive without broadening authority.
- `REJECT` — unsafe mutation, credential leak, fail-open behavior, evidence tamper or contract violation occurred.

The final S1 Decision is separate from per-candidate PASS/FAIL. Permitted outputs are:

```text
SELECT PI + concrete Pi SDK adapter
SELECT PI + ACP boundary through Pi-ACP
SELECT ACP boundary + Pi as initial runtime
SELECT another tested runtime only when Evidence materially defeats Pi
BLOCK / REPLAN runtime assumption
```

No `AgentRuntimeProviderFactory`, plugin registry or generic runtime framework is authorized by selection alone.

---

## 10. Evidence integrity and non-claims

Every real run must use the shared Architecture Spike Evidence schema and bind:

- S1 contract version/hash;
- exact MNFS source commit/tree;
- candidate version/commit/binary/package identity;
- fixture identity;
- criterion results;
- raw artifact references/hashes;
- limitations and measurements;
- mechanically derived candidate verdict.

S1 does **not** by itself:

- select an Execution Environment;
- prove filesystem/network sandboxing supplied by ACP;
- authorize production Worker dispatch;
- authorize revision-5 M02 implementation;
- make runtime Session durable product authority;
- require ACP when a smaller concrete Pi adapter is better evidenced.
