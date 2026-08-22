# 4B — Independent Fable Adversarial Review

**Status:** INDEPENDENT REVIEW EVIDENCE / NON-AUTHORITATIVE

**Reviewed candidate HEAD:** `734c00854b11d5c6cdbf28cecf001b0081ce22dc` (`agent/4b-executable-wire`, draft PR #56)

**Review branch:** `review/4b-fable`

**Reviewer:** independent Fable session, fresh context, repository authority read strictly per handoff route (`AGENTS.md` → `docs/index.md` → `docs/roadmap.md` → 4B contract → wire contract). This file is Evidence only; it changes no authority, checker, contract or PR state.

## 1. Verification reconstruction

Per `AGENTS.md`, verification was reproduced in a WSL2 Ubuntu Linux-filesystem worktree (fresh `git clone` of the exact candidate HEAD, Node v24.18.0, `npm ci`).

```text
run 1 (fresh clone, npm run verify)      = FAILURE
  → 3/40 repository tests failed
  → cause: test-file parallelism race, not wire content (see finding N1)

run 2 (same clone, after cleanup, serial-safe) = SUCCESS end-to-end
  → repository:check green
  → 40/40 repository tests pass
  → all 19 wire gates green through "Whole 4B executable proof passed."

CI cross-check = latest Verify on exact HEAD 734c008 = SUCCESS
```

The candidate's wire proofs are genuinely reproducible; the run-1 failure is a defect of the repository test harness itself (`tests/repository/repository-contract.test.mjs` mutates the real `docs/roadmap.md`/`README.md` in place while `tests/repository/architecture-verification.test.mjs` concurrently reads/copies them under `node --test` default file concurrency), and the hygiene negative-control test leaves an empty `docs/work/current/` directory behind, which makes every *subsequent* local `verify` fail `check-repository-hygiene.mjs:45-46`. CI is green only because each CI run starts from a fresh environment. This is a reproducibility defect of the proof harness, not of the wire content; classified N1 below.

Independent recount performed without trusting the candidate checkers:

```text
docs/product/operation-ledger.md distinct census IDs      = 111
owner-slice fragments referenced by openapi.yaml, sum IDs = 111
WS-03 / WS-06 / PRJ-04                                    = absent from active graph (4B-F01 honored)
x-conexus-4a-id occurrences across ALL yaml files         = 236
  → excess 125 IDs live only in three unreferenced dead fragments (finding M2)
IF_MATCH-annotated operations in active graph             = { PRJ-12, PAR-14 }
PRJ-11                                                    = CURRENT_OR_ABSENT, closed explicitly with
                                                            If-Match XOR If-None-Match: '*' (project-paths.yaml:288-323)
Technical Ingress                                         = 3 operations (TI-01..TI-03), zero census impact
Budget instance                                           = 2 declarations, truth-state conditionals real
```

## 2. Verdict

**4B candidate is substantively sound and survived adversarial challenge on its core claims** — 4A↔wire bijection, surface separation, session/authenticity law, disclosure classes, truth-state machine-expressibility, Budget proving instance, projection determinism and the post-#363 mixed-ingress correction all held under independent attack. Two bounded material corrections are required before ratification; neither reopens 4A.

## 3. Material findings

### M1 — Project-operation grammar admits unbounded payload semantics (`MATERIAL_CORRECTION_REQUIRED`)

The 4B contract requires that "arbitrary/mutable/unregistered operation execution is structurally impossible through the grammar" (`docs/phases/4b-executable-wire-contract.md` §14.2) and names `execute(anySlug, anyInput)` as the forbidden capability. The grammar blocks `anySlug` (static literal paths, deterministic slug, closed regime roots — verified genuine at `scripts/generate-project-openapi.mjs:23-56`) but does **not** block `anyInput`:

- `inputSchema` and `outputSchema` are bare `"$ref": "https://json-schema.org/draft/2020-12/schema"` (`contracts/api/project-operation.schema.json:36-41`). Any valid JSON Schema — including the boolean `true` and `{}` — validates. A declaration with `inputSchema: true` is grammar-valid and generator-accepted, producing one registered static route that carries arbitrary caller input, i.e. `execute(registeredSlug, anyInput)`.
- The generator's anti-executor guard is name-literal only: `generate-project-openapi.mjs:53-55` rejects a path containing `{operationSlug}` or a literal `execute` segment. `operationId: "ExecuteAnyOperation"` slugifies to `execute-any-operation` and passes; `"Dispatch"` passes outright. The whole-4B negative control (`scripts/run-wire-whole-4b-adversarial.mjs:273-281`) tests only the exact name `execute`.
- `requiredPins` has no `minItems` and never mandates `ACTIVE_RELEASE` (`project-operation.schema.json:68-83`) despite the schema's own self-description "one exact Release-pinned Project operation" (line 5). Release identity is still structural (a declaration is authoritative only inside an admitted Release, line 5), so this is not mutable-latest dispatch — but the schema currently enforces less than it declares.

The only current defense against a generic-payload declaration is human Release admission review — exactly the non-mechanical defense §2 of the 4B contract says must not be relied on ("Project codegen invents generic executor semantics").

**Smallest correction:** constrain `inputSchema`/`outputSchema` in `project-operation.schema.json` to non-boolean, object-rooted schemas (require `"type": "object"` at the root, forbid boolean forms), and extend the whole-4B negative control to a non-literal executor name (e.g. `ExecuteAnyOperation` with `inputSchema: true` must be rejected). Optionally align `requiredPins` enforcement with its description or soften the description.

**4A reopen:** NO. Pure 4B grammar tightening; no Product meaning changes.

### M2 — Wire contract §2.1 misdescribes the canonical artifact topology; three dead fragments persist (`MATERIAL_CORRECTION_REQUIRED`)

`docs/product/wire-contract.md:38-41` lists `fixed-paths.yaml` ("baseline referenced Path Item fragment"), `current-state-overrides.yaml` and `fixed-census-overrides.yaml` as components of the multi-file OpenAPI authority. At the reviewed HEAD this is false:

- `contracts/api/product/openapi.yaml:25-214` references exclusively the ten owner `*-paths.yaml` fragments. No file or script anywhere references the three named fragments (verified by repository-wide search).
- `fixed-paths.yaml` (2,803 lines, 114 `x-conexus-4a-id` entries) still contains the operator-subtracted `WS-03 UpdateWorkspace` (line 376), `WS-06 UpdateArea` (line 440) and `PRJ-04 UpdateProject` (line 510) — operations that `4B-F01` removed from ratified authority.
- `current-state-overrides.yaml` still carries `x-conexus-provisional: true` and `METHOD_PATH_MAPPED` states that the live slices forbid.

The active proof graph is unaffected (the bijection checker parses only the Redocly bundle of the entrypoint — `scripts/check-wire-bijection.mjs:4,30` — so the dead content cannot enter the census; this is why the candidate's 111↔111 claim still genuinely holds). But ratifying the candidate as-is would freeze a human-readable authority document that misstates its own canonical topology, while the repository retains a ~3,000-line stale, hand-editable parallel copy of the entire fixed Product wire — including subtracted operations — which is precisely the latent form of the "separately hand-maintained co-authority" failure §5 of the 4B contract forbids. A fresh consumer or maintainer grepping `contracts/` has no mechanical signal that these files are dead.

**Smallest correction:** delete `contracts/api/product/fixed-paths.yaml`, `current-state-overrides.yaml` and `fixed-census-overrides.yaml`; amend `wire-contract.md` §2.1 to list only the referenced fragments. Optionally add a one-line guard asserting every yaml under `contracts/api/product/` is reachable from the entrypoint.

**4A reopen:** NO. `4B-F01` and the 111 census are correct in the active graph; this removes stale duplication only.

## 4. Non-material findings

**N1 — Verification harness self-interference (`NON_MATERIAL_CORRECTION`).** (a) `repository-contract.test.mjs:50-116` mutates the real `docs/roadmap.md` and `README.md` in place; under `node --test` default file-level parallelism this races with `architecture-verification.test.mjs`, which reads/copies the same files — reproduced as 3 spurious failures on a fresh clone. (b) The hygiene contamination test (`repository-contract.test.mjs:20-35`) removes its fixture file but not the `docs/work/current/` directories it creates, so every subsequent local `verify` fails hygiene; `verify` is not locally idempotent. (c) A crashed test run can leave the real roadmap mutated on disk. Correction: use the temp-fixture-copy pattern already present in `architecture-verification.test.mjs:26-34` (or add `--test-concurrency=1` to `test:repository`), and remove the created directories. This directly affects the "repository verification green" exit-condition's independent reproducibility.

**N2 — Current-state carrier proof is annotation-level (`NON_MATERIAL_CORRECTION`).** `scripts/check-wire-carriers.mjs:21-22` proves `IF_MATCH == { PRJ-12, PAR-14 }` from the `x-conexus-current-state-carrier` annotation, not from actual `If-Match` parameters. A live fragment could add a required `If-Match` parameter to another operation without any gate firing; If-Match-absence assertions exist only in some owner-slice checkers (connections, release, MAR, PAR, gateway, observability) and not in identity-workspace, project, builder or brain. PRJ-11's optional If-Match under `CURRENT_OR_ABSENT` (`project-paths.yaml:288-323`) is correctly closed per §7 but demonstrates the annotation/parameter divergence. Correction: assert the exact set of operations carrying an `If-Match` parameter (required or optional) at the bundle level.

**N3 — Whole-4B gate freshness and control masking (`NON_MATERIAL_CORRECTION`).** `scripts/check-wire-whole-4b.mjs` and the adversarial runner validate `/tmp` artifacts with no provenance/freshness check; run standalone they silently pass against stale bundles — freshness is guaranteed only by `wire:verify` ordering (`package.json`). `expectRejected` (`run-wire-whole-4b-adversarial.mjs:146-151`) counts *any* throw as a fired control, so two in-memory controls are partially masked (deleting the `/api/`-prefix guard at line 67 still "passes" via the projection comparison at line 128), and the `{operationSlug}` control asserts the literal token it itself inserts. The projection-drift control (control 5) cannot fire under real drift because the projection is regenerated from the same bundle each verify. The duplicate method+path assertion in `check-wire-bijection.mjs:62-63` iterates parsed-object keys and can never fire (upstream Redocly lint covers duplicate keys). The strongest controls — real-schema Permission/targetURL rejection, real-generator execute rejection, and the mixed-ingress positive probe that caught the genuine #363 defect — are genuine. Correction: match expected error messages in `expectRejected`, and either hash-pin `/tmp` artifact provenance or document the ordering dependence in the gate output.

**N4 — Per-operation Problem-class distinctions are largely review-only (`NON_MATERIAL_CORRECTION` / partially `DEFER_TO_4D`).** The 401/403/404/409/412/422/503 vocabulary is centrally defined (`openapi.yaml:284-326`) and referenced per operation in the YAML, but no checker proves each operation wires the correct subset; the Kubb probe checks each status exists somewhere in the corpus, not per operation. Bounded per-operation assertions are worthwhile only where a concrete consumer branches; deeper enforcement belongs with 4D conformance.

**N5 — Divergent shared parameter components (`NON_MATERIAL_CORRECTION`).** `ProjectId`/`AgentId` parameter components are redefined per fragment with description-only differences, so the Redocly bundle renames them (`ProjectId-2`..`ProjectId-5`, `AgentId-2`) — five bundler warnings, and generated clients receive duplicate identical types. Correction: hoist the shared path-parameter components into the entrypoint (or unify descriptions).

**N6 — Grammar loose ends (`NON_MATERIAL_CORRECTION`).** `outcomeProfile` is never conditioned on `regime` (a `QUERY` + `COMMAND` declaration validates); `proof.positiveCaseId`/`negativeControlId` are free-form strings with no distinctness or registry linkage; `DEDICATED_SERVICE_SCOPED.serviceId` is a free-form pattern string; a PAR_TOOL-only declaration is schema-valid but `generate-project-openapi.mjs:60-62` hard-fails the entire generation run, which is stricter than the §12 prose ("is not forced into the HTTP OAD") — fail-closed in the safe direction, but the prose and the mechanism should agree.

**N7 — Technical callback error shape (`NON_MATERIAL_CORRECTION`, optional).** `contracts/api/technical/openapi.yaml:89-90` returns a bare `400` with no `problem+json` content for inadmissible OIDC callbacks. Acceptable for a protocol surface; noting for completeness. No OIDC RP-initiated-logout route exists; `IAM-02 EndSession` covers F1 session termination and no current authority requires Keycloak SLO wire, so this is `NO_FINDING` unless a real SLO consumer appears.

## 5. Deletion / YAGNI result

```text
DELETE (recommended, part of M2):
  contracts/api/product/fixed-paths.yaml              2,803 lines, dead, carries subtracted ops
  contracts/api/product/current-state-overrides.yaml    179 lines, dead, stale provisional markers
  contracts/api/product/fixed-census-overrides.yaml      51 lines, dead

DELETE or acknowledge decorative (N3):
  duplicate method+path assertion, check-wire-bijection.mjs:62-63 (cannot fire)

KEEP — challenged and survived:
  multi-file fragment topology (real size pressure; entrypoint-ref discipline works)
  shared IfMatch/IdempotencyKey/Problem components (repeated accepted semantics)
  opaque pageToken-only pagination (no speculative page-size/filter language found)
  x-conexus-* annotation vocabulary (drives real checkers; not dead metadata)
  Technical Ingress as separate 3-operation OAD (census impact 0 verified)
  tool-neutral projection manifest + isolated /tmp Kubb probe (no runtime deps leak)
```

No bespoke machinery was found duplicating OpenAPI/JSON Schema/OIDC/RFC 9457/RFC 9110 native capability; the candidate consistently prefers standard carriers (`If-Match`, `If-None-Match: '*'`, `Idempotency-Key`, `application/problem+json`, `__Host-` cookie prefix, Fetch Metadata). No new abstraction is required for any correction above.

## 6. Warnings disposition

| Warning | Count | Class | Disposition |
| --- | --- | --- | --- |
| Redocly `info-license` (product/technical/budget) | 3 | tool-shape noise | Private internal contract; optionally add `license` to silence. Not debt. |
| Redocly bundler `ProjectId`/`AgentId` renamed | 5 | **real signal, non-material** | Finding N5 — description-divergent duplicate components; unify/hoist. |
| Redocly `operation-2xx-response`/`4xx` on OIDC login/callback | 3 | tool-shape noise | Redirect-only (302/303) responses are the honest protocol shape; 503/400 present where meaningful. |
| Redocly `no-required-schema-properties-undefined` on generated Budget OAD | 14 | tool-shape noise (false positive) | Conditional `then.required` referencing base-level properties is valid JSON Schema 2020-12; this is exactly the truth-state mechanism that makes the negative controls fire. Real codegen transfer is covered by the Kubb probe. |
| npm deprecation `inflight`/`glob` | 2 | tool-shape noise | Transitive deps of npx-fetched proof tooling; nothing runtime. |
| AJV strict-mode notes on budget conditionals | — | tool-shape noise | Schemas compile and validate/refute fixtures correctly under `--spec=draft2020`. |

No warning was found to conceal a material defect. None were dismissed on exit-code grounds alone; each was traced to its source.

## 7. Priority-falsifier outcomes

```text
1  4A→4B authority fidelity          NO_FINDING on the active graph (111↔111 independently
                                     recounted from the ledger; 4B-F01 honored); M2 for the
                                     dead-fragment/topology contradiction
2  surface separation                NO_FINDING (CP/PA/HEADLESS/runtime/projects roots verified;
                                     Technical Ingress census impact 0; namespace never authority)
3  post-#363 mixed ingress           NO_FINDING (CONTROL_PLANE+PAR_TOOL split preserved as
                                     metadata; PAR_TOOL-only cannot leak — hard-fail; N6 prose
                                     tension only)
4  security / disclosure             NO_FINDING (opaque __Host- session; write-only credential with
                                     no response content enforced by checker; 403/404 non-disclosure
                                     vocabulary consistent; browser-authenticity law machine-annotated)
5  owner truth / uncertainty         NO_FINDING (truth-state enum + conditional forbid/require
                                     proven by real schema falsifiers; OUTCOME_UNKNOWN, MAR
                                     owner-vs-queue, telemetry-vs-owner, immutable Audit expressed)
6  generated projections / Kubb      NO_FINDING material (deterministic, byte-compare, real OAS,
                                     no-any, strict compile; /tmp isolation holds); N3 freshness
7  whole-4B negative-proof quality   PARTIAL — strongest controls genuine (incl. one that caught
                                     the live #363 defect); several in-memory controls are checker
                                     self-tests with masking (N3); M1 executor-name bypass
8  YAGNI / deletion                  M2 deletions; otherwise lean
9  standards leverage                NO_FINDING
10 warnings                          classified above; N5 the only real signal
```

## 8. Final answers

**4A reopen required?** **NO.** Both material findings are bounded 4B corrections (grammar constraint tightening; dead-file deletion + topology prose correction). No accepted Product operation, Permission, owner, scope or truth distinction was lost, invented or collapsed in the active wire.

**4B ratifiable after corrections?** **YES.** After M1 and M2 (with N1 strongly recommended alongside, since it protects the reproducibility of every future verification claim), the candidate expresses the accepted 4A authority faithfully, keeps Product/Technical/Project surfaces separate, and its executable proofs are predominantly genuine falsifiers. No finding requires new Product meaning, a new subsystem, or reopening any upstream phase.
