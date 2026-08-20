# AI Dialogue — Conexus OS Repository Consolidation

This file is temporary, branch-only, and non-authoritative. Fable must edit only `## Fable response`. Accepted corrections must land in canonical docs/tests before this file is deleted.

## Codex review request

### Reviewed identity

- Base: `origin/main` at PR #40 merge commit `01f01fa7cbef698ee06ecfd0b7b3828c72a2173e`.
- Candidate head: `2313342514379524ad5a6e7a714fff6bf02ccbfa`.
- Repository rename: `developmentconexus-ops/conexus-os`, homepage `https://conexus.fun/conexus`.
- Cleanup PR: #41 — `https://github.com/developmentconexus-ops/conexus-os/pull/41`.

### Final tree summary

- Before: 788 tracked files, 409 tracked Markdown files, 404 narrative Markdown files excluding raw Evidence/harnesses, 3,162 legacy-name occurrences.
- Candidate: 151 tracked files, 56 tracked Markdown files including the vendored skill and qualification READMEs, 38 permanent repository narrative documents excluding raw Evidence/harnesses, zero legacy-name paths/content before this temporary file was created.
- Fresh-actor route: `AGENTS.md` → `docs/INDEX.md` → one task row → one to three task documents; default pack at most five files.
- Canonical current owners: `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`, `docs/OPERATING-MODEL.md`.

### Deleted and rehomed groups

- Deleted predecessor Product implementation, CLI/bin, schemas, policies, tests, package identity, machine state, workflows, generated projections, acceptance packs, ADR/capability program, old spikes, planning skill, and program-only research.
- Deleted superseded dialogue, handoffs, review rounds, plans, prompts, duplicate routers, and `docs/superpowers`; Git is the historical archive.
- Rehomed Package A/B/D exact locks, criteria, fixtures, tests, source, JSON Evidence, and vendor DDL to `qualification/3l/{builder-substrate,mastra-runtime,managed-execution}`.
- Retained the official vendored Mastra skill and upstream provenance as an execution aid, not architecture authority.

### Canonical document map

- Product meaning and ecosystem routes: `docs/PRODUCT.md`.
- Structural overview and technology status: `docs/ARCHITECTURE.md`.
- Detailed owners/boundaries: nine task references under `docs/reference/`.
- Mastra mapping/findings/triggers: `docs/reference/mastra/`.
- Single decision register: `docs/DECISIONS.md`.
- Single phase/status authority: `docs/ROADMAP.md`.
- Workflow and proportional review: `docs/OPERATING-MODEL.md`.
- Method and repository rules: `docs/engineering/`.

### 3A semantic migration

- The complete accepted Product contract was moved intact (title updated, public ecosystem routes appended).
- A deterministic migration check proved all 50 top-level architecture-baseline sections have exactly one destination across the overview and task references.
- `docs/phases/3A-authority-baseline.md` preserves the reason, census, reconciliation, ratified outputs, supersession law, closure, reopen triggers, and PR #40 Git provenance.
- Current decisions C-000–C-018 were reconciled into one register with status, rationale, consequences, supersession/refinement, evidence, and reopen trigger; C-OS-001 records the operator-ratified public routes.

### 3L semantic and Evidence migration

- `docs/phases/3L-technology-qualification.md` preserves Package A/B/C/D/E outcomes, exact pins, claims proven/not proven, downstream obligations, final Fable result, and closure boundaries.
- Preserved exact claims: `CX-AGENT-MASTRA-01`, `CX-RUNTIME-ISOLATION-01`, `CX-MANAGED-JOB-01`.
- Root verification recomputes the Package-B lock digest and Package-D lock/vendor-DDL digests against Evidence.
- No Product implementation, live provider/model/E2B/Sankhya, MAR, recovery, or production correctness was newly claimed.

### Mastra mapping preservation

- Conexus OS owns Product authority, Workspace/Project, Release, RuntimeAgentProjection, AgentRun, ApprovalRequest, TriggerRevision, Gateway EffectAttempt, authorization/revocation/current owner truth, and terminal Product/business truth.
- Mastra provides Agent runtime, Memory, RequestContext, native approval/suspend/resume, Workflow for real deterministic flow, Scheduler mechanics, storage adapters, and observability contracts.
- Preserved direct Agent, explicit Memory scope, RequestContext non-authority and stale-continuation finding, native approval with PAR ownership, Gateway effect ownership, Scheduler through PAR ingress, rejection of universal Workflow wrapping, DurableAgent deferral, separate BuilderMastra/ParMastra instances, tested same-process boundary, disabled globals, and observability dependency correction.
- Current Context7 docs were consulted, but exact pins/source/Evidence remain deciding.

### Research preservation

- Mitra: complete concatenated full study, influence matrix, maintenance probe, observation log, raw build observation, and agent-question evidence; explicitly research-only and raw evidence marked do-not-read-by-default.
- Factory AI: complete factory study plus influence material covering Missions/handoff, readiness/trust, QA/review/stuck detection, orchestration, and supervision; explicitly research-only.
- Mastra: evaluation and provenance separated from current architecture authority.
- Stale links into deleted history were converted mechanically to plain citation labels without deleting their text.

### Diagram preservation

Eleven source-first Mermaid artifacts cover system context, Workspace/Project/Brain, semantic owners/modules, Builder, Product Agent, approval/effect authority, Release/Promotion, managed sync, Sankhya/read model, first production topology, and observability versus owner truth. `docs/diagrams/INDEX.md` names the semantic owner of each.

### Zero-legacy and verification evidence

Before this temporary review file was added:

```text
git ls-files | grep -i <legacy-name>                     = no matches
git grep -I -n -i <legacy-name>                         = no matches
git ls-files | grep -Ei transient-review-name-patterns   = no matches
npm ci                                                   = exit 0
npm run verify                                           = exit 0
git diff --check                                         = exit 0
```

Environment: Ubuntu WSL2 Linux-filesystem worktree, Node `24.18.0`, npm `12.0.2`, `/bin/bash`.

Root GREEN checks: repository hygiene (151 files), relative links/index, canonical status/exactly one next phase, package identity, temporary-artifact absence, qualification lock/provenance, and repository tests.

### Known limitations

- No configured Fable invocation exists in the current Codex environment; operator action is required after this brief is pushed.
- The 38 permanent narrative documents exceed the directional 15–30 target because the mission simultaneously requires five canonical owners, ten detailed references, four Mastra references, two phase summaries, ten deep research documents, engineering docs, and diagram index. The default task pack remains bounded and raw Evidence is excluded.
- Root verification intentionally does not rerun live qualification suites. The exact accepted harnesses and rerun instructions are preserved for explicit requalification.
- Detailed framework/managed-execution findings preserve accepted decision text and may contain historical narrative, but are explicitly subordinate references rather than current status owners.

### Mandatory adversarial questions

1. Was any still-current 3A Product or architecture authority lost?
2. Was any accepted 3B–3L decision lost or silently weakened?
3. Is the current Conexus-to-Mastra mapping complete and accurate?
4. Were Mastra qualification claims overstated?
5. Are Mitra and Factory AI preserved deeply enough to remain useful references?
6. Is any raw research incorrectly treated as Product authority?
7. Are current diagrams semantically complete and non-duplicative?
8. Is there more than one current status/decision authority?
9. Is the fresh-actor read path actually short and task-oriented?
10. Is any permanent document merely ceremony or Git-history duplication?
11. Does any legacy program artifact or naming remain?
12. Is any deleted executable Evidence necessary for plausible requalification?
13. Can 3M begin without reconstructing deleted history or making a silent material choice?

## Fable response

> **Reviewer substitution — read this first.** Fable could not be invoked: the operator's Fable model returned `You're out of usage credits` and the dispatched review terminated before producing output. On explicit operator instruction this independent review was performed instead by **Claude Opus 5**, in a session separate from the one that authored the consolidation. It is therefore an independent adversarial review, but it is **not** a Fable parecer and must not be recorded as one. If the project requires the reviewer identity to be Fable, this section must be re-run and replaced.

### Findings

Verification environment: Ubuntu WSL2, Linux-filesystem clone, Node `24.18.0`, npm `12.0.2` — matching the environment recorded in the brief. Base `01f01fa7cbef698ee06ecfd0b7b3828c72a2173e`, candidate `2313342514379524ad5a6e7a714fff6bf02ccbfa`, review head `77f4484`. Diff scale: 823 files changed, 6,220 insertions, 287,401 deletions.

**Claims independently reproduced (not taken from the brief):**

- The 50-destination claim is true. Each of the 50 top-level `# N.` sections of `docs/conexus/current/ARCHITECTURE-BASELINE.md` resolves to exactly one `## N.` destination across `docs/ARCHITECTURE.md` and `docs/reference/*`; zero sections have zero or multiple destinations.
- No section was compressed. Per-section body lines base to candidate total 2,416 to 3,142; the lowest per-section ratio is 0.97 (section 34) and no section fell below it.
- 107 of 107 normative baseline lines (`never`, `MUST`, `must not`, `rejected`, `!=`, `fail-closed`, `is not`) longer than 25 characters survive **verbatim** in the candidate corpus. A negative control confirmed the check discriminates.
- Zero legacy naming: `git ls-files` filtered for the legacy name returns 0 paths, `git grep -I -i` returns 0 files, across the whole tree including `qualification/` and `AI_DIALOG.md`.
- `npm ci && npm run verify` is **GREEN at `2313342`** (hygiene 151 files, doc index/links, canonical state, qualification provenance, and the repository contract test all pass).
- Package-A deciding identity is intact: `sha256(qualification/3l/builder-substrate/package-lock.json)` = `7f61c6c74ad92b23abd0fb44353bc63f444ab01dd3b62d23cec7d7de4b1051d5`, byte-identical to the value published in `docs/ARCHITECTURE.md` section 40, and all five Package-A pins match.
- All of C-000 through C-018 plus C-OS-001 are present in `docs/DECISIONS.md`. All 11 diagrams are indexed with a named semantic owner and an explicit "current when" invalidation condition.
- Deleted executable spikes (`spikes/arr-s0`, `spikes/arr-s1`, `spikes/as-02`, `spikes/tc-01`) are predecessor-program only. All three 3L packages were rehomed at `R100` rename similarity with rerun instructions retained.
- Anti-resurrection authority survives, including one mechanically enforced case: `qualification/3l/mastra-runtime/scripts/validate-admission.mjs:38` still rejects `/UniversalEnvelope/iu`.

**Defects found:**

1. **The PR head does not pass its own verification.** At `77f4484`, `npm run verify` fails with `temporary root artifact: AI_DIALOG.md` (`scripts/check-repository-hygiene.mjs:20`). This is the hygiene guard working as designed, and the brief honestly scoped its GREEN claim to "before this temporary review file was added" — but the branch as it currently stands is RED and cannot merge until this file is deleted.

2. **Decision status labels drifted, in the promoting direction.** Against `docs/conexus/current/DECISION-RECONCILIATION.md:164-181`:
   - C-008: base `PARTIALLY_SUPERSEDED / SUBSTRATE QUALIFIED WITH GUARD` becomes `QUALIFIED WITH REQUIRED GUARD` at `docs/DECISIONS.md:15`. The `PARTIALLY_SUPERSEDED` disposition is gone from the status column. Its content survives in the "Supersedes / refines" column, so no meaning is lost — but `docs/DECISIONS.md:3` states "A status weaker than qualified must never be promoted by wording," and this row is the one case where the status column reads stronger than its base disposition.
   - C-000, C-010, C-015: base `PARTIALLY_SUPERSEDED` becomes `PARTIALLY SUPERSEDED / CORE PRESERVED`. The `CORE PRESERVED` qualifier was not part of the base disposition for these three.
   - C-003 `REFINED / REQUIREMENT INTENT PRESERVED` becomes `REFINED`; C-009 `PRESERVE AS RATIONALE/EVIDENCE` becomes `PRESERVE AS RESEARCH RATIONALE`.
   - The base registry's controlled disposition vocabulary (`DECISION-RECONCILIATION.md:40-74`) has no destination, so status labels are now free text with no defined term set. This is the enabling condition for all of the above.

3. **Mutable status is restated in eight unguarded places.** `docs/ROADMAP.md:3` declares itself "the single current phase/status authority", but `scripts/check-current-state.mjs:6` guards only six canonical documents, and it checks their *combined* text rather than their agreement. Outside that set, current status is restated at `AGENTS.md:24`, `README.md:5`, `docs/phases/3L-technology-qualification.md:52-54`, `docs/reference/runtime-and-agents.md:193-196`, `docs/reference/managed-execution-qualification.md:8` and `:722`, and `docs/reference/mastra/framework-findings.md:8` and `:547`. When 3M starts, nothing forces these to change with the roadmap. `docs/reference/runtime-and-agents.md` is the sharpest case because it is a current reference, not a frozen phase record. Separately, `docs/ARCHITECTURE.md:3` claims to be the "technology-status authority" while `docs/ROADMAP.md:3` claims "single current phase/status authority" — two documents asserting adjacent status authority.

4. **Preserved research instructs readers to open files that no longer exist.** The mechanical link-to-label conversion left 27 backticked references to deleted filenames inside `docs/research/`, including `DECISION-REGISTER.md` (x3), `MITRA-INSPIRATION-MAP.md` (x4) and `08-limites-e-gaps.md` (x4). These read as navigation, not citation: `docs/research/mitra/full-study.md:16` says "**Comece aqui.**" of `DECISION-REGISTER.md`, and `:176` says to read `DECISION-REGISTER.md` in full. `scripts/check-doc-index.mjs` cannot catch these because they are not Markdown links. The referenced content is in fact preserved — the Mitra decision register is the head of `docs/research/mitra/influence-on-conexus.md:1` — so this is misrouting, not loss.

5. **Package-A provenance is unguarded.** `scripts/check-qualification-provenance.mjs` recomputes the Package-B lock digest and the Package-D lock and vendor-DDL digests, but performs no check on Package A, even though `docs/ARCHITECTURE.md:196` publishes an exact Package-A lock SHA-256 as deciding identity. `qualification/3l/builder-substrate/package.json` also has no `verify:lock`/`verify:admission` scripts, unlike Packages B and D. I recomputed the digest by hand and it matches, so this is an unguarded-but-currently-correct gap, not drift.

6. **A second research subject is preserved under a name that does not disclose it.** The FirstMate Inspiration Map is not deleted; it is concatenated into `docs/research/factory-ai/influence-on-conexus.md:1185-1209`. Neither the filename nor its `docs/INDEX.md` description ("adopted/adapted/deferred/rejected influence") indicates that the file contains a second, unrelated research subject. Discoverability only.

7. **The canonical-state guard is a freeze, not a validator.** `scripts/check-current-state.mjs:16` hardcodes `3M = NEXT / NOT STARTED` and its siblings as *required* strings, so the script must be edited in the same commit that starts 3M. This is defensible as a tripwire, but it means the guard can only assert the present state and can never validate a future one.

**Answers to the 13 mandatory adversarial questions**

1. **No.** 50/50 baseline sections routed, no section compressed, 107/107 normative lines verbatim.
2. **No decision was lost.** Four status labels were reworded and one lost its `PARTIALLY_SUPERSEDED` prefix (finding 2); the underlying supersession content survives in adjacent columns.
3. **Yes.** Every mapping element named in the brief was located: direct Agent, explicit Memory scope, `RequestContext` non-authority and stale continuation, native approval with PAR ownership, Gateway effect ownership, Scheduler through PAR ingress, rejection of universal Workflow wrapping, DurableAgent deferral, separate BuilderMastra/ParMastra instances, tested same-process boundary, disabled globals, observability dependency correction.
4. **No.** Every claim retains its scoping: "for current F1 tested properties", `QUALIFIED_SAME_PROCESS` "for enabled F1 surfaces", "tested transactional-admission subset", "downstream remainder preserved", Package C `DEFER SAFELY / NOT EXECUTED`, Package E `NO PRE-C-018 RUNTIME PROBE`. The scoping language matches the base registry.
5. **Yes.** Factory AI full study is line-identical (1,052). Mitra preserves all 10 chapters plus the decision register (2,893 lines) plus probe, observation log, raw build observation and agent-question evidence. Finding 4 affects navigation into it, not its depth.
6. **No.** `docs/INDEX.md` authority hierarchy places research below Evidence; `docs/research/mitra/INDEX.md:3` states "Mitra is reference Evidence, never implicit Conexus OS authority"; C-009 is `PRESERVE AS RESEARCH RATIONALE`.
7. **Yes.** 11 of 11 diagrams indexed, each with a distinct semantic owner and an invalidation condition, with an explicit instruction not to treat a diagram as authority.
8. **One decision authority; status authority is nominally single but practically diffuse** — see finding 3.
9. **Yes.** Walked it: `AGENTS.md` (25 lines) routes to `docs/INDEX.md`, which offers 17 task rows each naming one to two documents under an explicit five-file cap, an authority hierarchy, and a do-not-read-by-default list. The orphan-document check in `scripts/check-doc-index.mjs` mechanically prevents unreferenced narrative documents.
10. **No pure ceremony found.** `docs/evidence/qualification/3L/summary.md` is 10 lines and routes rather than restates; the two phase summaries record reasons, closure boundaries and reopen triggers rather than duplicating Git history.
11. **No.** Zero legacy paths and zero legacy content, verified independently. The hygiene guard itself avoids tripping its own content check by assembling the forbidden token from characters.
12. **No.** All three 3L packages were rehomed intact with reproduce instructions; the deleted spikes belong to the predecessor program whose corresponding decision (C-004) is `SUPERSEDED`.
13. **Yes.** `docs/ROADMAP.md:26` names 3M's entry requirement and exit obligations, and the recovery invariants it must close are preserved verbatim as section 45 in `docs/reference/runtime-and-agents.md:281-294`. No deleted history must be reconstructed to start 3M.

### Severity

| # | Finding | Severity | Justification |
| --- | --- | --- | --- |
| 1 | PR head fails `npm run verify` on `AI_DIALOG.md` | **BOUNDED** | Real merge blocker, but self-resolving: the guard exists precisely to force deletion of this file before merge. |
| 2 | Decision status-label drift; disposition vocabulary has no destination | **BOUNDED** | No decision meaning is lost — superseded content moved to another column — but the register's own anti-promotion law is weakened at C-008 and the controlled label set is gone. |
| 3 | Eight unguarded restatements of mutable status | **BOUNDED** | No contradiction today; all eight agree. It is a drift surface that opens the moment 3M starts, and it is mechanically unguarded. |
| 4 | Dangling navigation into deleted research filenames | **BOUNDED** | Content is preserved; a reader following "Comece aqui" reaches nothing. Cheap to fix, invisible to the link checker. |
| 5 | Package-A provenance unguarded by root verification | **BOUNDED** | Digest currently correct by manual recomputation; the asymmetry with B and D means future drift would be silent. |
| 6 | FirstMate preserved inside an undisclosed filename | **COSMETIC** | Discoverability only; no loss. |
| 7 | Canonical-state guard freezes rather than validates | **COSMETIC** | Defensible as intentional tripwire; noted so it is not mistaken for a state validator. |

No finding is MATERIAL. No finding blocks the consolidation on semantic-loss or architecture-conflict grounds.

### Semantic-loss assessment

No material semantic loss found. The 3A migration is provably lossless at the granularity I could test: 50/50 sections routed exactly once, no section compressed (2,416 to 3,142 body lines), and 107/107 normative baseline lines present verbatim. The decision registry's supporting registers — cross-cutting laws, the explicit-rejects table, deferred seams and technology-state labels — all have destinations, several reworded but semantically intact; the substantive rejects (`UniversalEnvelope`, Mission/Milestone, memory/RAG as Brain, live Brain inheritance, PROD as forked Project, generic `agent_event` ownership) each resolve to a named current home, and one is enforced by an executable guard. The only content genuinely absent is the base registry's disposition vocabulary and its legacy-requirement correction table (`REG-4`, `PUB-2`, `AGT-3`, `INT-6` and siblings); those IDs pointed at predecessor requirement documents that this consolidation deliberately deleted and that were already absent from the base Product contract, so their removal is coherent rather than lossy. The disposition vocabulary is the one piece whose deletion has a visible downstream cost (finding 2).

### Authority-duplication assessment

Decision authority is genuinely single: `docs/DECISIONS.md` is the only register, and no competing decision list exists. Status authority is single by declaration and diffuse in practice — `docs/ROADMAP.md:3` claims it, `docs/ARCHITECTURE.md:3` claims the adjacent "technology-status authority", and eight further locations restate mutable status outside the six documents the guard covers. Because `scripts/check-current-state.mjs` tests the union of the canonical texts rather than their agreement, and does not read the other eight files at all, the repository can enter a state where the roadmap says one thing and a current reference says another without any check failing. No such contradiction exists today.

### Stale-history assessment

Markdown link integrity is mechanically closed: `scripts/check-doc-index.mjs` validates every relative link in every tracked `.md`, and it passes. The residue is the class that checker cannot see — 27 backticked filename references to deleted research files, some phrased as instructions to open them (finding 4). Beyond that I found no document describing the repository as it no longer is, and no phase document asserting authority it no longer holds; the two phase summaries are explicitly scoped as durable records with closure boundaries and reopen triggers.

### Bootstrap/context-bloat assessment

The fresh-actor route works as claimed. `AGENTS.md` is 25 lines and hands off to `docs/INDEX.md`, which offers 17 task rows each naming one to two documents under an explicit five-file cap, an authority hierarchy, and a do-not-read-by-default list. The orphan-document check makes an unreferenced narrative document a build failure, so the index cannot silently fall behind the tree. On the brief's own admitted overshoot — 38 permanent narrative documents against a 15–30 target — I find no document that is pure ceremony or pure Git-history duplication; the count is driven by the nine task references, which are the mechanism that keeps the *per-task* pack small. Optimizing the total document count at the cost of the task pack would make bootstrap worse, not better. I do not treat the overshoot as a defect.

### Zero-legacy assessment

Clean. Zero legacy paths and zero legacy content across the entire tracked tree, verified independently rather than from the brief, and including `qualification/` and the temporary review file. The check is enforced on every run by `scripts/check-repository-hygiene.mjs`, over both paths and file bytes, with the forbidden token assembled character-by-character so the guard does not trip on its own source. `docs/conexus/current/` and the predecessor CLI, skill and machine-state paths are additionally blocked by explicit prefix rules. The one remaining transient artifact is `AI_DIALOG.md` itself, which the same guard rejects (finding 1).

### Verdict

```text
CONSOLIDATION_CONFIRMED_WITH_BOUNDED_FINDINGS
```

Required before merge: delete `AI_DIALOG.md` so `npm run verify` returns to GREEN. Recommended, in canonical documents rather than in this file: restore an explicit disposition vocabulary and reconcile the five drifted status labels in `docs/DECISIONS.md`; either extend `scripts/check-current-state.mjs` to the eight restating files or remove live status from `docs/reference/runtime-and-agents.md`, `AGENTS.md` and `README.md` and point them at the roadmap; repoint or drop the 27 dangling research filename references; and extend `scripts/check-qualification-provenance.mjs` to cover the Package-A lock digest it already publishes.
