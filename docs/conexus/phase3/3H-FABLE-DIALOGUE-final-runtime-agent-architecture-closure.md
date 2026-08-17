# 3H — ChatGPT ↔ Fable Dialogue — Runtime & Agent Architecture Final Closure

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-R1 — Runtime & Agent Architecture Final Closure`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `6a46d9a576f34b195fff214774365c5eb6af0a7f`  
**Important:** review/coherence closure only. This file is not authority, does not close 3H, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Protocol

1. Reconstruct authority from `AGENTS.md` and follow its read order.
2. Apply DevelopmentConexus Engineering Method v1.0.0.
3. Read at minimum:
   - `docs/conexus/DECISOES.md`;
   - `docs/conexus/phase3/LEDGER.md`;
   - `docs/conexus/phase3/3H-01-builder-coding-runtime-realization-session-sandbox-mapping.md`;
   - `docs/conexus/phase3/3H-02-production-agent-runtime-realization.md`;
   - `docs/conexus/phase3/3H-03-runtime-isolation-correlation-handoff.md`;
   - relevant routed authority from 3C-10, 3C-13, 3D-R1, 3E-R1, 3F-R1 and 3G-R1 when testing coherence.
4. Approved architecture is baseline, not dogma. Reopen only for a reachable Material Finding and globally superior correction.
5. Do not invent 3H-04 for naming symmetry or future optionality.
6. The closure question is whether any **material runtime/agent architecture decision** remains in 3H after 3H-01..03.
7. A 3L probe still being pending is not itself a reason to keep architecture open if architecture has already frozen the property and reopen trigger.
8. Work whose actual owner is security, deployment, technology qualification, recovery, UX or verification must remain routed there rather than being absorbed into 3H.
9. If a current framework claim is load-bearing, verify it using Context7 `/mastra-ai/mastra` + current source/primary sources.
10. Append numbered rounds; ChatGPT↔Fable agreement is not operator approval.
11. Do not alter `LEDGER.md`, approved authority or product code during this dialogue.

---

# Round 1 — ChatGPT

## 1. Closure target

3H-R1 should answer exactly:

> Do 3H-01, 3H-02 and 3H-03 together provide a coherent, buildable and sufficiently complete Runtime & Agent Architecture for Conexus F1, with every remaining uncertainty either a qualified realization question or explicitly routed later-owner work?

If yes:

```text
3H = CLOSED / APPROVED
3H-04 = NOT JUSTIFIED
next phase = 3I — Security / Authority Architecture
```

If no, name the exact missing material decision/failure class rather than adding a generic package.

---

## 2. Approved 3H spine

### 3H-01 — Builder runtime

Freezes the Builder runtime realization around:

```text
CodingSession = durable Builder cognitive/runtime lineage
persistent Mastra thread = cognition/history, never authority
AgentController live Session = ephemeral runtime incarnation
current config mechanically reapplied every dispatch/rebind
ActorRun source disposition = FRESH_BASE | CONTINUE_LINEAGE
physical E2B incarnation observed/reverified
quiescence required before lineage reuse
Hub custody before output presentation
fresh verifier cognition + fresh candidate materialization
runtime refs/telemetry = correlation only
```

### 3H-02 — Production Agent runtime

Freezes PAR realization around:

```text
exact Release → rebuildable RuntimeAgentProjection → direct Mastra Agent
AgentRun admitted/pinned before model/tool execution
selective durable suspension for real waits
ApprovalRequest remains authority
Gateway remains effect replay/idempotency authority
Conversation/Memory scopes separated
SCHEDULE = Mastra timer mechanics → guarded PAR ingress
stable intended occurrence before AgentRun admission
single-flight/no hidden backlog
Stored Agent/Editor/latest cannot become Product authority
EVENT/Signals remain outside operational F1
old run resumes exact old runtime composition
```

### 3H-03 — cross-runtime isolation/correlation/handoff

Freezes:

```text
BuilderMastra != ParMastra
separate persistent stores + role-local PubSub/runtime namespaces
same process allowed only under qualified role isolation
process split only on unpartitionable enabled global mutable state
Conexus IDs = durable causal anchors; traces/runtime refs observational
one domain run → 0..N traces
RequestContext = rebuild + replace-whole on dispatch/resume
owner IDs not in OTel baggage by default
F5 control handoff != Operational Telemetry
F5 target identity derives from owner dispatch context
producer_trust taxonomy reused
Verification Observability = Hub + Mastra + E2B + app with provenance
E2B pull exact-sandbox anchor + OTLP enrichment
```

---

## 3. Cross-coherence tests

### C1 — Builder vs PAR Mastra usage

No conflict:

```text
Builder → AgentController/collaborative CodingSession semantics
PAR     → direct Agent default
```

They are different product roles, not competing recommendations.

3H-03 prevents their role-specific state/tool/storage/PubSub surfaces from bleeding into each other.

### C2 — runtime state vs authority

Uniform law across all three decisions:

```text
stored thread != authority
runtime session != authority
sandbox != authority
runtime Agent state != Release/AgentRun authority
trace/context != authority
telemetry != authority
```

Conexus owner state/pins remain sovereign.

### C3 — persistence topology

3H respects 3E:

```text
hub_control = domain/control authority
mastra_builder = Builder substrate
mastra_par = PAR substrate
```

No module cross-reads Mastra vendor tables; no new durable class was introduced in 3H.

### C4 — direct-call-first

3H respects 3D:

```text
no RuntimeBus
no EventBus
no generic queue
no generic outbox
no workflow engine owned by Conexus
```

F5 remains typed owner handoff, direct in-process by default.

### C5 — effects/approval

3H preserves 3F/3G:

```text
runtime tool proposal
→ PAR sealed proposal / ApprovalRequest where needed
→ resume same AgentRun
→ Gateway revalidates exact subject/claim
→ Gateway alone owns effect attempt/replay truth
```

Runtime retry/checkpoint/recovery never grants effect permission.

### C6 — observability

3H preserves 3C-13:

```text
Observed(X) != Authoritative(X)
```

and realizes causal navigation without new provenance ontology:

```text
HUB_AUTHORITY
GATEWAY_AUTHORITY
PROVIDER_OBSERVED
GUEST_OBSERVED
```

---

## 4. Closure-boundary audit of remaining routed work

### Correctly 3I — Security / Authority

```text
credential custody
approver eligibility/revocation
runtime principal/trust enforcement
E2B guest capability expiry
browser/workspace/code-exec egress
DEDICATED identity/delegation
security narrowing / emergency stop
OTel baggage/redaction/egress policy
```

None requires redefining runtime identity/session/agent mechanics.

### Correctly 3J — Deployment / Operations

```text
Builder/PAR physical process/container placement
conditional process split if CX-RUNTIME-ISOLATION-01 fires
worker/process supervision
mastra_par backup/restore
old runtime coexistence/drain/cutover
collector/backend topology
```

3H froze the properties/process-split trigger; 3J chooses topology.

### Correctly 3L — Technology Qualification

```text
CX-BUILDER-MASTRA-01
CX-AGENT-MASTRA-01
CX-RUNTIME-ISOLATION-01
exact Mastra APIs/version behavior
stable schedule occurrence transport
physical sandbox attribution
PubSub/default-bucket/global-state isolation
OtelBridge/export mapping
E2B pull/OTLP pinned-version behavior
memory/upgrade compatibility
```

A failed probe can reopen realization; architecture need not remain open pending the probe.

### Correctly 3M — Failure / Recovery

```text
when run becomes orphaned/lost
numeric timeout policy
missing/corrupt snapshot/custody handling
admitted-but-undispatched repair
repeated quiescence/reconnect failure
OUTCOME_UNKNOWN settlement
```

3H froze what mechanics are observable/controllable and which assumptions are admissible; 3M chooses recovery policy.

### Correctly 3K / 3N / 3O

```text
runtime/approval/trace/debug UX               → 3K
Verification Observability qualification       → 3L/3N
architecture-wide falsification                → 3N
vertical end-to-end proof                      → 3O
```

---

## 5. Suspect residues tested for a possible 3H-04

### R1 — InceptionInvestigation pre-Change agent execution shape

No current concrete consumer has proven that InceptionInvestigation requires a fourth runtime architecture. Existing Builder/agent mechanics can be reused or the decision can return through Decision Loop when the actual execution shape is defined.

Verdict candidate:

```text
DEFER SAFELY / Decision Loop
not 3H-04
```

### R2 — `job/v1` queue/scheduler substrate

No current runtime consumer requires a Conexus shared scheduler/queue. Product Agent schedule mechanics are already realized by 3H-02.

Verdict:

```text
3L/Decision Loop only on concrete need
not 3H-04
```

### R3 — async/attempt status projection

This is query/UI projection convenience over existing owner facts, not runtime architecture truth.

Verdict:

```text
3K/implementation
not 3H-04
```

### R4 — multi-agent / networks / Durable Agents / Observational Memory

Current framework capabilities exist but are not enabled F1 requirements. 3H-02/03 already define enablement and qualification triggers.

Verdict:

```text
Decision Loop + 3L when named consumer exists
not 3H-04
```

### R5 — process split

3H-03 already freezes the condition-triggered boundary. Choosing the physical split belongs to 3J after qualification evidence.

Verdict:

```text
no new runtime decision
```

---

## 6. YAGNI / completeness test

Closure is valid only if both are true:

```text
1. no current failure class remains without an architectural owner
2. no proposed 3H-04 adds current value beyond already-routed work
```

Current candidate result:

```text
remaining material 3H decision = 0
3H-04 = NOT JUSTIFIED
new module = 0
new durable record class = 0
new queue/bus/outbox/lease = 0
mandatory microservice/process split = 0
```

---

## 7. Candidate closure sentence

> **3H-R1 — Runtime & Agent Architecture Final Closure:** Runtime & Agent Architecture is CLOSED / APPROVED for Conexus F1: Builder coding execution is realized by a durable Conexus CodingSession over ephemeral AgentController/Mastra/E2B mechanics with explicit lineage, quiescence, custody and independent-verifier laws; Production Agents are realized as exact Release-pinned direct Mastra Agent projections with selective durable waits, guarded scheduling and Gateway-owned effect authority; Builder and PAR execute through role-isolated Mastra/store/PubSub contexts with Conexus-domain-first correlation, owner-bound F5 handoff and provenance-preserving Verification Observability; same-process co-location remains admissible only while technology qualification proves enabled process-global state is safely partitioned, with physical split routed to 3J on a material failure; no remaining current failure class justifies 3H-04, and all unresolved security, deployment, technology, recovery, UX and verification work is explicitly routed to 3I–3O or Decision Loop.

---

## 8. Questions for Fable — Final Closure Review

### A. Completeness

1. Name any current F1 runtime/agent failure class that is not owned by 3H-01/02/03 or explicitly routed later.
2. Is any routed item actually a disguised missing 3H architecture decision?
3. Does closing 3H before executing 3L probes create a logical circularity, or are the property + reopen triggers sufficient?
4. Is there any hidden need for 3H-04?

### B. Coherence

5. Attack AgentController-for-Builder vs direct-Agent-for-PAR. Is there any shared abstraction we should freeze, or would that be accidental symmetry?
6. Attack CodingSession/thread/runtime identity vs Conversation/AgentRun identity. Can any runtime ref accidentally become a cross-role authority?
7. Attack separate `mastra_builder` / `mastra_par` plus same-process Mastra instances. Any contradiction with 3H-03?
8. Attack RequestContext rebuild/replace-whole against Builder continuation and PAR exact old-Release resume. Does replacing context accidentally destroy required cognition/state?
9. Attack F5 direct-call baseline against future process split. Does current design preserve a clean transport seam without prebuilding a bus/outbox?
10. Attack Verification Observability: is deciding evidence sufficiently separated from observational telemetry?

### C. Boundary ownership

11. Which current open finding belongs in 3H rather than 3I/3J/3L/3M/3K/3N/3O? Give concrete failure class.
12. Does the process-split trigger belong to 3H (property) with 3J (topology), as proposed?
13. Does technology qualification have enough explicit obligations to falsify same-process isolation and runtime continuity?
14. Is the InceptionInvestigation runtime shape safely deferred?
15. Is `job/v1` safely removed from later-3H routing?

### D. Global Maximum / closure

16. What is the strongest argument for keeping 3H open?
17. What is the strongest argument for a 3H-04 and can you construct its current consumer?
18. What is the most deletable 3H law without reopening a named failure class?
19. Did any 3H decision overengineer the F1?
20. Final verdict:
   - `CLOSE 3H`
   - `KEEP 3H OPEN — MATERIAL DECISION MISSING`
   - `REOPEN PRIOR 3H DECISION`
   - `STOP / SPLIT PREREQUISITE`
21. If `CLOSE 3H`, list any wording corrections required in 3H-R1 before operator approval.

For every Material Finding use:

```text
claim challenged
reachable failure class
authority affected
evidence
smallest correction
Global Maximum effect
reopen required? yes/no
owner if deferred
```

Append `Round 1 — Fable` to this same file. Do not edit LEDGER, approved authority or product code. Commit/push only the dialogue change.
