---
id: ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
title: TC-01 Treehouse Production Adapter Conformance Evidence
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - ACCEPTANCE-TC-01-TASK-12-DETERMINISTIC-ADVERSARIAL-REVIEW
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - DOC-PROJECT-STATUS
  - TRACKING-WORKLOG
tracking_issue: 16
last_reviewed: 2026-08-04
---

# TC-01 Treehouse Production Adapter Conformance Evidence

## Authority

The Operator explicitly authorized Task 13 and executed the canonical TC-01 harness on the Linux-owned Ubuntu WSL2 checkout.

This Evidence establishes the observed conformance of the pinned Treehouse candidate for the bounded physical Lease contract required by `MIS-002/M01`.

It does not authorize:

- final R5 approval;
- M01 production implementation;
- Pi Worker dispatch;
- automatic merge of PR #17.

## Canonical result

```text
Run ID:                    tc01-20260804-144054-4315b6f2
Verdict:                   ACCEPT
Scenario coverage:         15/15 PASS
Recorded limitations:      none
Cleanup:                   COMPLETED
Runtime Evidence root:     /home/leandrotheodoro/.local/state/mnfs/fixtures/tc-01/tc01-20260804-144054-4315b6f2
```

The Evidence was reopened in a fresh Node.js process before cleanup. Manifest hashes resolved, all fifteen scenarios were present and the independently derived Verdict remained `ACCEPT`.

## Exact provenance

| Field | Observed value |
| --- | --- |
| Environment | `WSL2` |
| Ubuntu | `26.04` |
| Kernel | `6.18.33.2-microsoft-standard-WSL2` |
| Node.js | `v24.18.0` |
| npm | `12.0.2` — operational only, not a Verdict binding |
| Git | `2.53.0` |
| Treehouse version | `2.1.1` — raw installed output was `v2.1.1` and was strictly canonicalized |
| Treehouse executable realpath | `/usr/local/bin/treehouse` |
| Treehouse executable SHA-256 | `sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3` |
| Harness execution head | `459e2269ff56fa04fafb5e1328a8e1dcd5ffc468` |
| Final reviewed harness head used for cleanup | `bb4e5a67bd589d322f1f716c51995c927c0031d4` |

The command-shape hash remained unchanged across the runtime fixes and cleanup:

```text
sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84
```

## Accepted adapter command shapes

```text
treehouse get --lease --lease-holder <holder> --json
treehouse status --json
treehouse return <path> --if-lease-id <lease-id> --if-lease-holder <holder>
```

Required process boundary:

```text
argument arrays
shell: false
stdin: closed
bounded stdout/stderr
explicit timeout
allowlisted environment
strict UTF-8 and JSON
fresh semantic observation after mutation
```

Forbidden operations remain:

```text
--force
destroy
broad prune
automatic destructive recovery
stderr-regex state inference
direct Git fallback inside the same adapter operation
```

## Scenario results

| Scenario | Result | Observed contract |
| --- | --- | --- |
| `TC01-S01` | `PASS` | Exact WSL2, Ubuntu, Node, Git, Treehouse realpath/version/hash and required capabilities were observed. |
| `TC01-S02` | `PASS` | One leased linked worktree was acquired through strict JSON and remained inside the disposable pool. |
| `TC01-S03` | `PASS` | No forbidden `git fetch` occurred and the fixture contained no `origin`. |
| `TC01-S04` | `PASS` | Source repository and pool mutation boundaries remained intact. |
| `TC01-S05` | `PASS` | A fresh client rediscovered the exact Lease without a second acquisition. |
| `TC01-S06` | `PASS` | Exact Lease identity and process observations remained stable. |
| `TC01-S07` | `PASS` | Correct conditional release was accepted only after fresh status proved the Lease absent. |
| `TC01-S08` | `PASS` | A stale Lease ID could not release or mutate the current Lease/worktree. |
| `TC01-S09` | `PASS` | A wrong holder could not release or mutate the current Lease/worktree. |
| `TC01-S10` | `PASS` | Dirty sentinel bytes and the exact Lease were preserved; trusted cleanup later removed the sentinel and released the Lease. |
| `TC01-S11` | `PASS` | Repeated release was classified semantically without issuing a second return command. |
| `TC01-S12` | `PASS` | Missing and unmanaged paths were classified explicitly without changing managed Lease state. |
| `TC01-S13` | `PASS` | `status --json` did not mutate Treehouse private state, the Lease or repository state. |
| `TC01-S14` | `PASS` | Every command record satisfied the controlled process contract. |
| `TC01-S15` | `PASS` | Tooling, host identity, candidate bytes and command shapes matched the accepted freshness identity. |

## Final artifact hashes

Raw command stdout/stderr artifacts remain only in the Linux-owned runtime Evidence root and were not promoted to Git.

| Artifact | Final SHA-256 |
| --- | --- |
| `fixture.json` | `sha256:9112664863e17fae5e30a7e5fa41a7c7f9ebd4c414ed6e018fbc27e45476882b` |
| `artifacts/environment.json` | `sha256:990ace6a2cab4e2fa0a87504e7f5b5044242a12d7d269d895dcc56470cfcb7c0` |
| `artifacts/scenarios.json` | `sha256:0588e88c8d694a60fd9a5e00e34af71175531c2b6187b61e0bfc89a0cf174f90` |
| `artifacts/manifest.json` | `sha256:c91601cac5778dfb3528da71538ac233dc9fd85bbe9f912ce9115aafa13526f3` |
| `artifacts/verdict.json` | `sha256:8db2ca7b8495e2c41174da05f7776548b28a3569dda02bc241fbc436e2a6b9e8` |
| `artifacts/report.md` | `sha256:6a9e59f168603f5001606829168885488b58403237e19f3a1ea70f59ad4f973c` |
| `artifacts/cleanup.json` | `sha256:29e50f052500686a0a71d7dd844faff6174c9c18daf08c1474222dfc74412261` |

Manifest bindings:

```text
Scenarios SHA-256:      sha256:0588e88c8d694a60fd9a5e00e34af71175531c2b6187b61e0bfc89a0cf174f90
Command-shape SHA-256:  sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84
```

## Cleanup Evidence

The first cleanup attempt failed closed with `TC01_CLEANUP_BLOCKED` and removed nothing.

A read-only diagnostic showed `SOURCE_CHANGED`, while every HEAD, status, local-config, refs, tracked-tree and working-tree hash was identical. Root-cause analysis proved that the comparison used `JSON.stringify` and treated object property insertion order as semantic change.

The defect was corrected through an observed RED/GREEN cycle:

```text
RED head:     f7e722bd62faa6ccb37aee3430f867cb070917aa
RED workflow: 30923142365
RED job:      92038588740
RED result:   76 PASS / 1 expected FAIL

GREEN head:     b4e8078dc32bca42299c9ec03e5c3e3ce7149ee0
GREEN workflow: 30923366842
GREEN job:      92039349604
GREEN result:   PASS — 77/77 TC-01
```

The CLI also omitted structured blocker details. A separate RED/GREEN cycle added an allowlisted JSON error-detail surface without exposing raw outputs or environment values:

```text
RED head:     42263d7157cd392146b65d9c71b850923cb58903
RED workflow: 30923469530
RED job:      92039702478
RED result:   77 PASS / 1 expected FAIL

GREEN head:     bb4e5a67bd589d322f1f716c51995c927c0031d4
GREEN workflow: 30923659755
GREEN job:      92040355347
GREEN result:   PASS — 78/78 TC-01
```

The second cleanup review revalidated current provenance, command shape, Treehouse status, absence of live TC-01 Leases, worktree cleanliness, the full source baseline and run-path containment.

It returned:

```json
{
  "state": "COMPLETED",
  "rationale": "Trusted cleanup removed only run-scoped ephemeral fixture resources after finalized Evidence and safety checks."
}
```

Removed run-scoped resources:

```text
source-repo
pool-root
snapshots
fake-home
git-wrapper
unmanaged-repo
```

Preserved Evidence:

```text
fixture.json
environment.json
scenarios.json
manifest.json
verdict.json
report.md
cleanup.json
command artifacts
```

## Runtime instrumentation findings

### Version presentation

The installed candidate returned `v2.1.1`, while the original deterministic fixture returned `2.1.1`.

The harness now accepts only strict `v?<major>.<minor>.<patch>` text, permits one lowercase `v` prefix, canonicalizes to `2.1.1` and still rejects different versions or additional text. Candidate bytes remain bound by SHA-256.

```text
RED workflow:   30919284889
RED job:        92025350483
RED result:     75 PASS / 1 expected FAIL
GREEN workflow: 30919527946
GREEN job:      92026176091
GREEN result:   PASS — 76/76 TC-01
```

### Snapshot equality

Repository snapshots now use canonical JSON equality, which ignores object key order while preserving array order. Real changes to refs, entries, bytes, modes or identities continue to block cleanup.

## Design consequence

For the bounded `MIS-002/M01` physical Lease contract, Treehouse is an accepted adapter candidate only while all freshness bindings remain valid:

```text
Treehouse semantic version = 2.1.1
Treehouse executable SHA-256 = sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3
required capabilities = present
accepted command-shape SHA-256 = sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84
canonical WSL2 host and Linux-owned filesystem = required
```

A change in candidate bytes/version, required capabilities, Git/Node/Ubuntu/WSL identity or adapter command shape invalidates reuse and returns the adapter to review.

## Authority boundary

```text
TC-01 physical adapter conformance: ACCEPTED
R5 final microdesign review:        NOT_STARTED
M01 microdesign:                    PROPOSED
M01 implementation:                 PROHIBITED
Pi Worker dispatch:                 PROHIBITED
PR #17 automatic merge:             NOT AUTHORIZED
```

This Verdict is an R5 design input and does not authorize M01 implementation.
