# 3K Fable Dialogue — Frontend / Product Architecture Intake & Decomposition

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Phase:** 3K — Frontend / Product Architecture  
**Purpose:** one complete independent intake/sweep/decomposition of 3K before any 3K decision. This file does not create authority, does not decide any 3K question, does not reopen 3B–3J, does not authorize implementation, merge or PR readiness.

---

## 1. Canonical state reconstructed independently

Reconstructed on **2026-08-17** from `AGENTS.md → engineering method → DOCUMENTATION-MAP → DECISOES.md → LEDGER.md → exact authorities` at `e7cd864`:

```text
3A = CONTINUOUS / 3A-R6 + 3A-R7 APPROVED
3B..3J = CLOSED / APPROVED
pre-3K Global Platform Coherence Checkpoint = CLOSED / POSITIVE
  CURRENT STRUCTURE CONFIRMED
  F-GPC-01 / AGT-4 = RESOLVED by 3A-R7
  C-003 F1 orphan requirements = 0
  reopen 3B–3J = NONE
3K = NEXT / NOT STARTED
implementation gate intact: C-018 → F3B-R1 → Realization Planning
  → accepted executable plans → only then product code
```

C-001 remains product vision authority. First vertical anchor = **C-001 caso 1 — Analisador Inteligente de Orçamentos** (3A-R6 §8), salvo redirect explícito do operador.

---

## 2. What 3K is — and is not

### 2.1 Owned by 3K

Per 3A-R6 §8: **product navigation, user-observable authority and main journeys** — the level at which coding actors must not invent the product. Plus, carried into 3K by later authority:

```text
3A-R7 §7  AGT-4 Platform Consultant surface (owner/scope frozen; surface open)
3A-R7 §7  product guardrail: internal robustness mostly invisible in Golden Path
3A-R6 §9  conditional trigger adjudication: does the first vertical require
          Sankhya mirror/sync? (job/v1 itself stays C-007-owned)
LEDGER §12 rows routed "3K": archive/unpublish/trigger/recovery UX where
          vertical requires; Release/Promotion/rollback UI at journey level;
          approval-card/display contracts; Project binding UI; Product Agent
          Conversation/memory/trigger UI; async/attempt status projection;
          MANIFEST_INVALID user-observable classes
```

### 2.2 NOT owned by 3K (already closed or owned elsewhere)

```text
generated-app frontend infrastructure    C-012 frozen (stack, scaffold, UI kit,
                                         honest-UI mechanics, gates) — 3K does not redesign
published-runtime auth/session/RBAC      C-015 closed (laws), 3I (authority)
security/egress/CSP laws                 C-016/3I-05 closed
serving topology                          3C-15/3J-01 closed
pixel design / complete design system    3A-R6 §8 DEFER; design-system material in
                                         repo (22-handoff + untracked drafts) = evidence
                                         input for Realization, never authority
exact components/layout/copy/tokens      Realization
technology truth                          3L
recovery semantics                        3M
global verification                       3N
vertical proof contract                   3O (consumes 3K's vertical)
```

---

## 3. Evidence inputs

```text
C-001            pillars/complements; caso 1; fase 1 interna sem self-signup
C-003            surface-bearing requirements: HAR-7/8/9, OBS-1/2/3, AGT-2/4/5,
                 CER-1/2/5, PUB-1..5, CIC-3, QUA-1
3A-R6 §8/§9      3K MUST list + vertical anchor + job/v1 conditional
3A-R7            consultant owner/negatives + product guardrail (§7)
3B..3J closed laws (LEDGER)             what UI may only project, never own
C-013/C-017      status/checklist/timeline/checkpoint machinery UI must mirror
C-014/C-015/C-016 promotion gate + permission diff + dependency diff surfaces
Mitra evidence   directness benchmark; Marketplace Central handoff (22-handoff):
                 real users = small team, desktop, pt-BR, work tool all day
checkpoint §8    product-surface complexity is the risk, not backend count
```

---

## 4. Complete sweep — material 3K decisions by block

Classification per 3A-R6 rule: would a coding actor have to choose owner / authority / durable meaning / trust / public contract? wrong choice = material retrofit? first product depends?

### Block GP — Golden Path information architecture & journeys

| # | Decision | Class |
|---|---|---|
| GP-1 | F1 Control Plane surface inventory (which surfaces exist at all) | MUST |
| GP-2 | Navigation/IA model: Account → Workspace → Project → planes (build / assets / release / use) | MUST |
| GP-3 | Golden Path journey composition: intenção → entendimento → aprovação proporcional → construção → progresso → preview → prova → publicação → uso | MUST |
| GP-4 | Progressive-disclosure law as normative rule: internals (ActorRun/WorkUnit/FSM/digests/rigor) surface only when materially useful for decision/trust/diagnosis; never hidden: truth/authority items (see §7) | MUST |
| GP-5 | Entry/first-run journey (operator-created accounts, setup credential exchange — C-015 mechanics closed; journey open) | MUST |
| GP-6 | Control Plane × published MANAGED apps browser origin/trust-zone adjudication — C-015 named the trigger ("classes de confiança distintas"); 3K must adjudicate, coding actor must not | MUST |
| GP-7 | Workspace/Project creation + selection journeys | MUST |
| GP-8 | Preview/review journey (RunPreview private via hub proxy — C-008/C-012 mechanics closed; journey open) | MUST |
| GP-9 | MANAGED app access/serving journey (how users reach real apps) | MUST |
| GP-10 | Inception/Baseline approval journey | MUST |
| GP-11 | Archive/unpublish/trigger-disable UX | MUST only where vertical requires; else DEFER (LEDGER §12) |

### Block AP — Approval, permission & risk surfaces

| # | Decision | Class |
|---|---|---|
| AP-1 | Proportional human checkpoint presentation (C-017: FAST compact ↔ CONTROLLED deep; existence never waived) | MUST |
| AP-2 | Approval-card display contract: exact claim subject binding (3F-03/3G-01), render-from-receipt (C-010), never paraphrased authority | MUST |
| AP-3 | Permission diff + dependency diff as first-class promote-gate surfaces (C-015/C-016 laws → one human gate surface) | MUST |
| AP-4 | Permissions/access-management surfaces for F1 role model {admin, member} (C-015 closed roles; surface open) | MUST |
| AP-5 | Release composition / Promotion / rollback operator journey incl. maintenance-required presentation (semantics C-014/3G-08/3J-03; UX journey open) | MUST |

### Block EV — Truth, evidence, status & cost presentation

| # | Decision | Class |
|---|---|---|
| EV-1 | UI-status-is-projection law: every user-visible state derives from owner FSMs (C-013 "UI = projeção"); no second state vocabulary; distinct terminal truths never merged (3G non-unification map) | MUST |
| EV-2 | Builder progress surface: plano visual aprovável (HAR-7) + checklist vivo (HAR-8) + WorkUnit/ActorRun at user-relevant abstraction | MUST |
| EV-3 | Finding / Evidence / verifier feedback presentation (validator reports Finding, never fixes — C-017) | MUST |
| EV-4 | Run/operational timeline for trust/diagnosis (C-013 Run Timeline = F1 surface) | MUST |
| EV-5 | Cost/context visibility surface: tokens/USD/duration per run/project (OBS-1/C3; desconhecido ≠ 0 carried to UI) | MUST |
| EV-6 | Failure/error presentation families over 3F-05 public keys + C-016 sanitized envelope + traffic_state honesty (nunca nomear ator externo sem RESPONSE_RECEIVED) | MUST |
| EV-7 | Honest-state law at Control Plane: vazio/carregando/falhou distinct (OBS-2), PARTIAL/UNKNOWN visible, MANIFEST_INVALID user-observable classes | MUST |
| EV-8 | Entrega com "Limitações conhecidas" + aceite verificável surface (HAR-9) | MUST |
| EV-9 | Log filtrável/export surface (OBS-3) | DEFER detail to Realization; F1 floor = C-013 timeline |

### Block AS — Workspace asset surfaces

| # | Decision | Class |
|---|---|---|
| AS-1 | Brain surface: workspace Brain legibility, binding/provenance visible (inheritance must not look project-local like Mitra — checkpoint §9), machine-propose/human-publish journey (KnowledgeProposal) | MUST (depth = vertical-required; rest journey-level) |
| AS-2 | Connections surface: write-only credential ingress journey (C-016 — chat/agent never receives secret; agent generates link), testConnection/qualification visibility | MUST |
| AS-3 | Project binding surfaces (Brain/Connection bindings — 3F-04/3G-07) | MUST where vertical requires; else DEFER |
| AS-4 | Product Agent surfaces: definition/versions visibility (AGT-1/2), Conversation UI in published app (caso 1 agent lives there — C-010), SCHEDULE trigger admin (3H-02) | MUST |
| AS-5 | AGT-4 Platform Consultant surface placement (contextual assistance in Builder/Control-Plane journeys per 3A-R7; no global agent surface) | MUST |
| AS-6 | Agent memory/advanced-memory UI | DEFER — consumer-gated (3H-02) |

### Block VT — First vertical product composition

| # | Decision | Class |
|---|---|---|
| VT-1 | Caso 1 composition contract: which surfaces/planes it exercises — per approved authority already: Project/Baseline, Change/Builder/E2B, Connection + real Sankhya data, Brain-backed semantics, verified Release, MANAGED serving, real Account access, Product Agent conversation/tool read path, Evidence/timeline | MUST |
| VT-2 | Data acquisition path adjudication: live read via Gateway vs Sankhya mirror/sync — determines whether 3A-R6 §9 trigger fires (if mirror/sync → job/v1 enters C-007 Decision Loop before that vertical's Realization Planning) | MUST |
| VT-3 | No invented WRITE/effect: vertical stays read/insight unless product case genuinely requires effect (C-010 scope; checkpoint §10) | MUST (as negative law) |
| VT-4 | Benchmark comparability: vertical framed so QUA-1 golden comparison vs Mitra result remains possible | MUST |
| VT-5 | Cross-Project Brain reuse demo | REJECT F1 — G1-triggered (C-011); no fake second product |

---

## 5. DEFER SAFELY (trigger + later owner)

```text
embed surfaces                      → C-015 trigger (named consumer + TLS + exact origins)
public routes/forms                 → C-015 RC-1 trigger
dashboards/analytics UX             → 3A-R6 §8; real consumer
fleet/customer administration       → 3A-R6 §8; F2/SaaS
complete design system / pixel      → Realization; repo design-system material = input
theming/dark mode                   → real consumer (Mitra evidence: none needed)
external notification/alerting      → C-007/C-013 trigger
mobile native                       → C-001 non-goal (web responsivo)
i18n beyond pt-BR                   → real consumer
DEDICATED install/developer portal  → first real DEDICATED deployment
multi-workspace admin depth          → F1 role model suffices (C-015); SaaS trigger
UX of surfaces outside vertical     → 3A-R6 §8 DEFER
recovery/maintenance UX semantics   → journey pointer only; semantics 3M
```

## 6. REJECT F1

```text
internals administration consoles (ActorRun/WorkUnit/FSM/digest admin as primary UX)
second frontend state machine / status vocabulary (violates EV-1)
Mission/Milestone boards, fleet/multi-agent orchestration console (C-017)
readiness scores / quality dashboards (C-017)
workflow designer / visual orchestration builder
user-facing rigor tuning (agente/user nunca rebaixa rigor — C-017)
notification inbox / EVENT surfaces (3H-02 EVENT disabled F1)
generic dashboard-builder product framing (vertical must prove Conexus, not dashboards)
marketplace / template gallery (C-001 non-goal)
self-signup/billing surfaces (C-001 fase 2)
```

## 7. Never-hide list (guardrail boundary: hide complexity, never truth/authority)

The progressive-disclosure law (GP-4) must explicitly exclude from concealment:

```text
approval exact subject + what will be executed (render-from-receipt)
permission widening / dependency widening at promote gate
external-effect honesty: attempted/receipt/PARTIAL/OUTCOME_UNKNOWN
unknown ≠ zero (cost, counts, coverage)
provenance/trust distinctions the user depends on (verified vs claimed;
  platform-published vs tenant/user content — 3A-R7 §9.6)
serving verification status (SERVED_VERIFIED ladder end-state)
maintenance/degradation states (3J-03 capability-local honesty)
known limitations at delivery (HAR-9)
```

---

## 8. Confrontation checks

### 8.1 3A-R6 §8 MUST list coverage

All 14 §8 lines map into blocks above: Workspace/Project (GP-7), Inception/Baseline (GP-10+AP-1), Change/intent/correctness (GP-3+AP-1), Builder progress (EV-2), Finding/Evidence (EV-3), human approvals (AP-1/2), Connections admin (AS-2), Brain binding/use (AS-1/AS-3), Preview (GP-8), Release/Promotion/rollback (AP-5), Production Agent (AS-4), MANAGED access (GP-9), operational timeline (EV-4), permissions surfaces (AP-4). No §8 item unowned; sweep adds GP-4/GP-6, AP-2/3 detail, EV-5/6/7, AS-5, VT-* from later authority.

### 8.2 C-001 pillars

P1 → AS-1 legibility (Brain must read as company layer, not project-local); P2 → GP-4 (engineering invisible-by-default is the UX completion of P2); P3 → AS-4 + AS-5; C1 → AS-4 triggers + VT-1 agent path; C2 → VT-4; C3 → EV-5; C4 → AS-5.

### 8.3 C-003 surface requirements

HAR-7→EV-2 · HAR-8→EV-2 · HAR-9→EV-8 · OBS-1→EV-5 · OBS-2→EV-7 · OBS-3→EV-9 · AGT-2→AS-4 · AGT-4→AS-5 · AGT-5→AS-4 (in-app conversation; embed deferred per C-015) · CER-1/2/5→AS-1 · PUB-1..5→GP-9/GP-5 journeys over closed C-015 laws · CIC-3→EV-4 (promotion steps as events) · QUA-1→VT-4. No orphan.

### 8.4 Hide-complexity-without-hiding-truth

GP-4 + §7 pair is the mechanism: concealment is presentation-only and reversible (drill-down), never a data/authority filter; EV-1 forbids inventing calmer vocabulary that merges distinct truths.

### 8.5 What coding actors would invent if 3K stays silent

Navigation model; status vocabulary; approval presentation; permission surface; consultant placement; error-copy families; Control Plane origin decision; vertical data path. Each is captured above as MUST — this is the 3A-R6 §8 "coding actors cannot invent the product" test applied item by item.

---

## 9. Proposed decomposition — decision packages

```text
3K-01 — Product Information Architecture & Golden Path Journey
        GP-1..GP-11 (+ GP-4 guardrail-as-law + GP-6 origin/trust adjudication)

3K-02 — Approval, Permission & Risk Surface Architecture
        AP-1..AP-5 (+ never-hide list §7 as normative boundary)

3K-03 — Truth, Evidence, Status & Cost Presentation Architecture
        EV-1..EV-9

3K-04 — Workspace Asset Surfaces: Brain, Connections, Product Agents,
        Platform Consultant
        AS-1..AS-6

3K-05 — First Vertical Product Composition (caso 1)
        VT-1..VT-5; output = candidate-base do 3O proof contract;
        VT-2 may fire the C-007 job/v1 Decision Loop (outside 3K)

3K-R1 — bounded final closure
```

Dependency shape: 3K-01 → (3K-02, 3K-03, 3K-04 parallelizable) → 3K-05 → 3K-R1. 3K-05 last because it composes the surfaces the earlier decisions freeze.

### 3K-01 candidate — why first

1. Every other 3K decision attaches to the surface/journey skeleton; deciding approval cards or Brain surfaces before the IA exists invites rework — journey-first is the smallest-risk order.
2. It ratifies the central guardrail (GP-4 + §7) as normative law **before** any surface is designed, so directness constrains all subsequent 3K decisions instead of being retrofitted.
3. It contains the only trust-boundary adjudication in 3K (GP-6), which downstream surfaces (session, SDK, CSP realization) silently depend on.
4. It is exactly the layer 3A-R6 §8 names first: product navigation and main journey.

---

## 10. Open items deliberately NOT decided here

```text
all GP/AP/EV/AS/VT decisions            → 3K-01..3K-05 via mandated workflow
job/v1                                   → C-007 Decision Loop only if VT-2 fires
any 3L probe demand surfaced by 3K       → named only when a surface proves
                                           load-bearing tech behavior (none presumed)
```

## 11. Workflow

Per operator-mandated loop: this intake → independent challenge → 3K-01 dialogue/candidate → Fable adversarial review → independent challenge → consolidated candidate → operator `Aprovado` → only then authority + LEDGER.

No authority is created by this file. No product code. No merge.
