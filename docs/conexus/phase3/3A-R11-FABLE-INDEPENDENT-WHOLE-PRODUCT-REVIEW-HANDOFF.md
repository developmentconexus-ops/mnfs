# 3A-R11 — Fable Independent Whole-Product Review Handoff

**Status:** REVIEW BRIEF / NON-AUTHORITATIVE  
**Checkpoint:** 3A-R11 — Whole-Product Authority Rebaseline  
**Review target commit:** `86a261875895712c50ba9bce229f5612bcdaa092`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Implementation:** BLOCKED  
**Package B:** PAUSED / NOT OPENED  

> This handoff is **bootstrap only, never authority**. Reconstruct the current repo state and authority before reaching any conclusion. Do not trust the conclusions summarized here merely because they are written here.

---

# 1. Role assigned to Fable

Act as an **independent Senior/Staff/Principal Software Engineer, Software Architect and whole-product systems reviewer**.

Do not optimize for agreement with the current Conexus design or with the author of R11.

Your task is not to polish Markdown. Your task is to falsify the proposition:

> **The new `docs/conexus/current/` tree accurately and completely compiles the accepted Conexus Product and architecture, removes stale-authority archaeology without creating a second competing architecture, preserves real future seams without overbuilding them, and is safe to ratify as the current discovery/source-of-truth layer before Package B is rederived.**

If that proposition is false in a material way, raise a Finding with exact authority/evidence.

---

# 2. Governing posture

Use DevelopmentConexus Engineering Method v1.0.0.

In particular:

```text
Authority freezes execution, not inquiry.
Mechanism != Authority.
Current implementation/history = Evidence, not target authority by existence.
Prepare the seam, not the entire future capability.
Unknown/Deferred never becomes a convenient default.
A reviewer finding is Evidence, not requirement authority.
A control/claim is not proven merely because an artifact exists.
```

Attack the preferred structure. Search for the Global Maximum, but do not reward redesign/generalization merely because it is architecturally fashionable.

Every proposed new abstraction/module/service/database/framework must show a current consumer or material failure class.

---

# 3. Mandatory authority reconstruction

First revalidate Git/PR state. Do not assume this handoff's target SHA is still branch HEAD; if HEAD moved after preparation, identify the exact delta before reviewing.

Read at minimum:

```text
AGENTS.md
→ docs/engineering/standards/root-cause-global-maximum-method.md
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/phase3/3A-R11-whole-product-authority-rebaseline.md
→ docs/conexus/phase3/3A-R11-activation.md
→ docs/conexus/current/README.md
→ docs/conexus/current/PRODUCT-CONTRACT.md
→ docs/conexus/current/ARCHITECTURE-BASELINE.md
→ docs/conexus/current/DECISION-RECONCILIATION.md
→ docs/conexus/phase3/3A-R11-authority-census.md
→ docs/conexus/phase3/3A-R11-r11a-census-completion.md
→ docs/conexus/phase3/3A-R11-whole-product-coherence-pass.md
→ docs/conexus/phase3/3A-R11-whole-product-coherence-round2.md
→ docs/conexus/phase3/3A-R11-fresh-actor-review.md
```

Then independently sample/reconstruct the detailed accepted authority needed to challenge the compilation. At minimum inspect the current semantic homes for the high-risk classes below.

Do **not** rely only on R11's own self-citations.

---

# 4. Detailed accepted authority that must be sampled

## Product / requirements / historical-generation pressure

```text
docs/conexus/DECISOES.md
docs/conexus/02-visao-escopo.md
docs/conexus/03-requisitos.md
```

Inspect the detailed homes linked by decisions when a disposition is in doubt.

## Builder / runtime generation

```text
docs/conexus/phase3/3A-R5-builder-coding-runtime-reassessment.md
docs/conexus/phase3/3H-01-builder-coding-runtime-realization-session-sandbox-mapping.md
docs/conexus/phase3/3H-03-runtime-isolation-correlation-handoff.md
docs/conexus/phase3/3H-R1-runtime-agent-architecture-final-closure.md
```

## Product Agent generation

```text
docs/conexus/09-agente-primeira-classe.md
docs/conexus/phase3/3C-10-production-agent-runtime-module-boundary.md
docs/conexus/phase3/3G-05-production-agent-run-approval-trigger-continuation-architecture.md
docs/conexus/phase3/3H-02-production-agent-runtime-realization.md
```

## Brain

```text
docs/conexus/15-cerebro-empresa.md
docs/conexus/phase3/3C-09-brain-module-boundary.md
```

## Release / environment / duplication

```text
docs/conexus/12-ciclo-de-vida.md
docs/conexus/phase3/3C-11-release-module-boundary.md
docs/conexus/phase3/3G-08-release-promotion-runtime-admissibility-architecture.md
```

## Observability / cost / F5

```text
docs/conexus/11-observabilidade.md
docs/conexus/phase3/3C-13-observability-audit-module-boundary.md
docs/conexus/phase3/3H-03-runtime-isolation-correlation-handoff.md
docs/conexus/phase3/3K-02-trust-decision-observable-truth.md
```

## Security / credentials / spend / trust

```text
docs/conexus/phase3/3I-01-current-authorization-approver-eligibility-revocation.md
docs/conexus/phase3/3I-02-credential-capability-custody.md
docs/conexus/phase3/3I-03-per-run-model-spend-enforcement.md
docs/conexus/phase3/3I-05-trust-zones-crossings-hub-control-least-privilege.md
docs/conexus/phase3/3I-R1-security-authority-architecture-final-closure.md
```

## First production

```text
docs/conexus/phase3/3J-01-first-production-topology-placement-ingress.md
docs/conexus/phase3/3J-R1-deployment-operations-architecture-final-closure.md
```

## Product surfaces / first vertical / Product Agent UX

```text
docs/conexus/phase3/3K-01-product-model-project-shell-build-workspace-inspectability.md
docs/conexus/phase3/3K-02-trust-decision-observable-truth.md
docs/conexus/phase3/3K-03-first-vertical-composition-data-path.md
docs/conexus/phase3/3K-04-product-agent-authoring-management-use-journey.md
docs/conexus/phase3/3K-R1-frontend-product-architecture-final-closure.md
```

## Current realization routing / technology Evidence

```text
docs/conexus/phase3/3A-R8-project-baseline-change-engineering-coherence.md
docs/conexus/phase3/3A-R9-managed-job-deterministic-sync-dispatch-reconciliation.md
docs/conexus/phase3/3A-R10-pre-implementation-convergence-realization-routing.md
docs/conexus/phase3/3L-Q0-qualification-manifest.md
docs/conexus/phase3/3L-A-builder-substrate-cognition.md
```

Read additional exact authority whenever a claim cannot be adjudicated from the above.

---

# 5. What R11 is trying to solve

The old active discovery path requires a reader to reconstruct a large evolving decision corpus in order to answer basic current-state questions.

Known examples of historical/current generation pressure include:

```text
Pi primary Builder
→ current Mastra AgentController / persistent CodingSession / E2B

C-008 guest-readable LLM capability
→ 3I-02 model credential control-side; guest LLM key deleted

C-010 Vercel AI SDK Product Agent loop
→ direct Mastra Agent from exact RuntimeAgentProjection

pg-boss named early
→ current scheduler/queue = reconstructible mechanism; pg-boss Package-D candidate only

historical URL-fragment app auth
→ current server-side session/opaque cookie authority

historical PROD fork wording
→ current PROD environment of same Project
```

R11 does **not** intend to delete history. It intends to remove stale history from the path required to discover the present.

---

# 6. Candidate current-tree roles

Fable must challenge whether these are the correct roles and whether any became duplicate semantic authority.

```text
docs/conexus/current/README.md
→ short current entrypoint/status/router

PRODUCT-CONTRACT.md
→ current Product meaning, journeys, F1/future/non-product invariants

ARCHITECTURE-BASELINE.md
→ current owner/boundary/persistence/runtime/security/topology/qualification projection

DECISION-RECONCILIATION.md
→ current decision-generation routing and stale-inheritance prevention
```

R11 claims these are **projections/routing authorities**, not replacements for detailed semantic homes.

Falsify that claim. If a current artifact silently creates new detailed semantics or can disagree with its detailed home, identify exactly where.

---

# 7. Mandatory adversarial questions

## 7.1 Completeness / accidental deletion

Search for a still-current Product requirement/invariant from C-001/C-003/C-011/C-013/C-014 or 3B–3K that the current tree lost or weakened.

Pay special attention to:

```text
visual/proportional Plan
Hub-owned live checklist
tasks.md purpose-only semantics
Platform Consultant
Brain assisted Discovery
AnalyticQuery
Brain health/drift/context budgets
Project duplication
private-by-default bytes
cost/tokens/duration visibility
Golden benchmark / Worker Eval
Release/environment/config/migration discipline
first-production recovery/activation obligations
implementation-dependent first-build probes
```

## 7.2 False preservation / stale inheritance

Try to find an obsolete mechanism that still appears current or could reasonably be implemented from the current tree.

At minimum attack:

```text
Pi primary Builder
fresh cognitive reset every WU
guest LLM key
Vercel AI SDK Product Agent authority
Mastra Stored/Editor/latest Agent authority
mutable artifact registration API
UniversalEnvelope
mandatory EVENT/webhook
Agent runtime as auth principal
URL-fragment auth
postMessage universal chat handshake
PROD as separate Project
security deferred because internal F1
generic agent_event owner/table
memory/RAG as Brain authority
public Internet first-installation ingress
```

## 7.3 Duplicate or missing authority

Search for:

- two owners of the same meaning;
- a meaning with no owner;
- Projection/Runtime/Storage becoming authority;
- current tree itself becoming a second semantic owner instead of routing to detailed authority;
- Workspace/Project/Brain/Connection/Release/PAR/Gateway overlap;
- Observability/F5 ambiguity;
- Product Agent definition vs runtime state authority drift.

## 7.4 Product ↔ architecture mismatch

For each whole-product journey, ask whether the architecture can realize it **without inventing a new owner during implementation**.

Especially:

```text
Inception/Baseline
Plan/build/verify
Brain Discovery/publication/binding
Connection qualification/binding
static Query vs AnalyticQuery
Project duplication
Release/Promotion/migrations
Published App independent authorization
Product Agent authoring/use/resume
exact effect approval
managed sync/catch-up
Budget Analyzer
maintenance/KnowledgeProposal
```

## 7.5 Technology proof honesty

Search for any statement that upgrades:

```text
selected/current
→ qualified
```

without deciding Evidence.

Current expected strengths to challenge:

```text
Mastra Builder tested A-properties    qualified only as tested
E2B                                  qualified with required physical guard
Codex OAuth                          qualified only tested Package-A path
Builder OM                           evaluated / keep off
Product Agent Mastra                 current / Package B not qualified
same-process runtime isolation       current / Package B not qualified
model spend                          current obligation / C not qualified
managed execution                    current semantics / D not qualified
pg-boss                              candidate only
F5/deciding observation              current shape / E not qualified
first-prod topology                  current architecture / activation proofs pending
```

## 7.6 Future seam / YAGNI

Attack from both directions:

1. Did R11 delete a future seam that is genuinely evidenced and would make future evolution structurally expensive?
2. Did R11 introduce dormant F1 machinery for a future without a current consumer?

Sample future classes:

```text
SaaS/private-source reachability
multi-repo
cross-Workspace exchange
DEDICATED
HA/PITR
advanced Agent memory
EVENT
Durable Agent
Agent networks
MCP/A2A
Agent browser/source access
Connection failover
KMS/HSM
SSO/SCIM
public/embed
richer app roles
Brain RAG/index
```

## 7.7 First installation vs universal product architecture

Check that on-prem Windows-host → Linux-guest → private LAN/VPN topology is correctly scoped to first installation and is not accidentally elevated to universal SaaS law.

## 7.8 Package B compilation

This is important because Package B resumes immediately after R11 closes.

Verify whether the reconciled current tree correctly implies that Package B should qualify:

```text
CX-AGENT-MASTRA-01
CX-RUNTIME-ISOLATION-01
```

against **current** Product Agent/runtime/security/Release/F5/RequestContext semantics, rather than replaying stale P1–P30 historical probes verbatim.

Challenge whether any Package-B load-bearing prerequisite is missing from the current tree.

Do not design/execute Package B yet.

---

# 8. Review against the user's explicit objective

The operator's underlying objective is not merely architectural cleanliness.

The current tree must let a new human/agent answer, without archaeology:

```text
What is Conexus?
What will the Product actually do?
What is F1 vs future?
What are the core concepts/journeys?
Who owns each meaning?
How is it architected today?
Which old decisions are stale?
Which technologies are actually proven?
What remains Unknown/Deferred?
Where do I go for exact detail/rationale?
What is the next governed action?
```

A terse registry that loses critical Product meaning fails this objective even if technically correct.

A giant duplicate spec that becomes impossible to keep coherent also fails it.

Evaluate whether the four-file shape is the smallest sustainable source-of-truth layer for this corpus size.

---

# 9. Review the review process itself

R11 has already produced internal Evidence:

```text
R11-A census
→ corpus covered
→ H1–H8 high-risk supersessions checked
→ 0 irreconcilable authority conflicts

R11-E Round 1
→ 0 material architecture/Product findings
→ 14 projection/completeness findings

Round-1 corrections
→ Registry/Product/Architecture candidates enriched

R11-E Round 2
→ 14/14 closed
→ 0 new material findings

R11-F Fresh Actor self-review
→ PASS
```

Do **not** trust those outcomes. Try to falsify them.

In particular, check whether self-review created confirmation bias by using its own candidate abstractions to prove themselves.

---

# 10. Required Finding format

For each issue, provide:

```text
Finding ID
Severity: MATERIAL | NON_MATERIAL
Category
Exact current-tree statement/path
Exact accepted authority/evidence that supports the challenge
Why it matters
Failure/counterexample
Recommended disposition:
  CORRECT_PROJECTION
  REOPEN_<smallest decision>
  DEFER_SAFELY
  NO_CHANGE_REQUIRED
New authority required? YES/NO
```

A suggestion with no authority/failure basis is not a material Finding.

If you propose a materially new Product requirement or architecture, mark it clearly as **new proposal**, not a correction.

---

# 11. Required final review output

End with:

## A. Finding summary

```text
Material Findings: N
Non-material Findings: N
New Product requirements proposed: N
Architecture reopen required: YES/NO
```

## B. Whole-product verdict

Choose one:

```text
CURRENT STRUCTURE CONFIRMED
CURRENT STRUCTURE CONFIRMED WITH NON-MATERIAL CORRECTIONS
BOUNDED CORRECTION REQUIRED
MATERIAL REOPEN REQUIRED
```

## C. Current-tree fitness

Explicitly answer:

```text
Can current/ become the canonical current discovery/source-of-truth layer? YES/NO/CONDITIONAL
Does it lose still-current Product meaning? YES/NO
Does it preserve stale mechanism as current? YES/NO
Does it create duplicate semantic authority? YES/NO
Does it overstate qualification? YES/NO
Does it overbuild Future? YES/NO
Does it erase justified Future seams? YES/NO
Is Package B safely rederivable from it after ratification? YES/NO/CONDITIONAL
```

## D. Strongest counterargument

State the strongest remaining argument **against** your own final verdict.

## E. Exact next action

State whether R11 may proceed to finding adjudication/operator ratification or which smallest Decision Loop must reopen first.

---

# 12. Hard boundaries

Do not:

- implement Product code;
- execute Package B;
- ratify C-018;
- merge PR #40;
- treat this handoff as authority;
- create a new methodology/framework;
- convert preferences into requirements;
- preserve a stale mechanism because migration looks easier;
- redesign accepted architecture without a material Finding.

The review is complete only when the strongest material counterexamples have been tested and the output is specific enough to adjudicate against repository authority.
