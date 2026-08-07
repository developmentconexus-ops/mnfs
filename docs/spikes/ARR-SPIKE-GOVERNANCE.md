---
id: DOC-ARR-SPIKE-GOVERNANCE
title: MNFS Architecture Spike Governance
document_type: architecture_spike_governance
form: reference
authority: standard_policy
status: proposed
version: 0.1.0
owners:
  - developmentconexus-ops
approvers:
  - operator
related:
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - TRACKING-DECISIONS
tracking_issue: 23
last_reviewed: 2026-08-07
---

# MNFS Architecture Spike Governance

## 1. Purpose

This document defines one shared evidence and fairness contract for deciding MNFS Architecture Spikes.

An Architecture Spike exists to reduce a material uncertainty and produce Decision input. It is not product delivery and it does not grant production authority merely because a candidate runs successfully.

The governing rule is:

> **Define what would decide the question before executing candidates; preserve raw observations; derive the result mechanically; change the contract only through an explicit revision that invalidates affected comparisons.**

This policy is provider-neutral. It contains no Pi, OpenCode, nono, BoxLite, smolvm, Treehouse or other candidate-specific pass criteria.

---

## 2. Separation of authority

```text
Architecture Decision question
        ↓
Spike Validation Baseline / contract
        ↓
Candidate-independent fixture + criteria
        ↓
Candidate run(s)
        ↓
raw Evidence + measurements
        ↓
mechanical criterion results / verdict input
        ↓
independent review
        ↓
Operator / governed selecting Decision
```

A candidate run cannot modify:

- the question being decided;
- required criteria;
- fixture semantics;
- pass/fail definitions;
- security/effect authority;
- evidence schema;
- stopping rule;
- selection policy.

If any of those must change materially, revise the Spike contract and rerun every candidate whose Evidence would otherwise be compared under different rules.

---

## 3. Contract-before-candidates rule

Before the first candidate run, the Spike plan/contract freezes at least:

- Spike ID and exact contract version/hash;
- decision question;
- candidate-independent requirements;
- common fixture/source identity;
- host/environment assumptions;
- required criteria and result semantics;
- raw artifact requirements;
- measurement definitions;
- security/network/credential/effect boundaries;
- candidate provenance requirements;
- failure conditions;
- mechanical verdict/disposition input rules;
- fairness rules;
- stopping rule;
- which later Decision each class of outcome permits.

Candidate-specific configuration may differ only where the contract explicitly permits realization-specific setup.

---

## 4. Same fixture and same criteria

Comparative candidates receive the same:

```text
Validation Baseline
applicable requirements
source/fixture semantics
required criteria
measurement definitions
failure classifications
Evidence schema
```

Candidate-specific adapters/configuration may exist, but they may not weaken the common contract.

A tool is not allowed to receive an easier proof merely because its API is inconvenient.

---

## 5. Provenance

Every named candidate run records exact provenance sufficient to reproduce and reassess the result:

- candidate ID;
- primary source/repository/distribution identity;
- exact version or commit/digest;
- license observed for the tested bytes/project;
- public/supported integration boundary used by the Spike.

A named candidate without provenance is invalid Evidence.

A candidate may be absent for a host-fact Spike such as ARR-S0; in that case `candidate` is explicitly `null` rather than inferred.

---

## 6. No hidden setup or authority

A Spike plan names setup that may change the execution environment.

Candidate execution must not silently:

- install or update unrelated host software;
- enable virtualization/kernel features;
- start privileged services;
- inherit arbitrary host credentials/proxies;
- broaden network access;
- mount privileged host paths/sockets;
- gain production external-effect authority.

If additional setup is required, classify it before execution as an allowed bounded setup step, a setup Decision, a blocker or a Replan trigger.

---

## 7. Evidence schema

Machine Evidence conforms to:

```text
schemas/architecture-spike-evidence.schema.json
```

Required identity includes:

```text
spikeId
contractVersion
runId
startedAt / finishedAt
canonicalHost identity
source Git commit/tree
candidate + provenance when candidate != null
criterion results
raw artifact references + SHA-256
limitations
measurements
verdictInput
```

Raw artifact bytes remain separate from the summary object and are referenced by ID/path/hash.

The validator must read the promoted bytes and recompute SHA-256; a string that merely looks like a digest is not proof of the artifact content.

---

## 8. Criterion results

Criterion IDs are unique within one Evidence record.

Result vocabulary:

```text
PASS
FAIL
BLOCKED
UNKNOWN
```

A required criterion that is `FAIL`, `BLOCKED` or `UNKNOWN` prevents a `PASS` verdict input.

`BLOCKED` and `UNKNOWN` are never silently converted to PASS because other criteria succeeded.

A model narrative cannot override the mechanical criterion state.

---

## 9. Raw artifacts and hash integrity

Every raw artifact reference contains:

```text
id
relative path
sha256:<64 lowercase hex>
sizeBytes
```

Validation requires:

- unique artifact IDs;
- relative contained paths only;
- referenced file exists beneath the declared artifact root;
- symlink/path escape is rejected;
- byte count equals `sizeBytes`;
- SHA-256 recomputed from exact bytes equals the declared digest;
- criterion/measurement artifact references resolve to declared artifact IDs.

A hash mismatch invalidates the Evidence record; it is not a warning.

---

## 10. Measurements

Measurements are descriptive Evidence, not automatic rankings unless the Spike contract explicitly makes a threshold deciding.

Each measurement records:

- stable measurement ID;
- value;
- unit;
- artifact references when applicable.

Examples may include startup latency, repeat-run cost, disk consumption or maintenance surface. The common contract defines how measurements are collected before candidates run.

---

## 11. No test weakening after failure

After a candidate runs, do not change a common criterion, fixture or proof because the preferred candidate failed.

If the contract itself is materially wrong:

```text
Finding
→ contract correction / version increment
→ invalidate affected comparison Evidence
→ rerun every affected candidate under the new version
```

Keeping one candidate's old PASS while rerunning only a failing competitor under easier rules is prohibited.

---

## 12. Independent Evidence and review

Raw Evidence is produced outside model self-assessment where practical and is hash-bound before interpretation.

A fresh Reviewer validates at least:

- exact contract version;
- source and candidate provenance;
- artifact hashes;
- criterion completeness;
- mechanical result derivation;
- limitations;
- candidate-independent fairness;
- absence of unauthorized setup/effects.

The implementer/candidate runner does not grant the selecting Decision.

---

## 13. Stopping rules

A Spike plan states when to stop, for example:

- every material candidate completed under the same contract;
- all candidates in a class are blocked by a proven host prerequisite;
- one candidate fails a mandatory security/authority property and no correction within the same candidate version/boundary can change that result;
- the decision question is shown to be malformed and requires Replan;
- further candidates add no new architecture class or meaningful trade-off.

Do not continue adding candidates merely to accumulate names.

---

## 14. Disposition

Spike output is Decision input such as:

```text
SELECT / PRESERVE
ADOPT / ADAPT
SPIKE_FURTHER
DEFER
REJECT
REPLAN
```

The Evidence schema deliberately stores `verdictInput`, not an authoritative architecture Decision. Selection occurs through the governed Decision loop after Evidence review.

---

## 15. Relationship to current ARR sequence

This common governance applies to:

```text
ARR-S0  Host Capability Probe
ARR-S1  Agent Runtime Conformance
ARR-S2  Local Execution Envelope Conformance
ARR-S2W Workspace comparison when required
ARR-S3  Vertical Composition Proof
```

Each Spike defines its own criteria and fixture under this common contract. Accepting this policy does not authorize S0 implementation, candidate execution or production Worker dispatch.

---

## 16. Graduation criteria

This policy is ready for acceptance when:

- the schema validates generic Spike identity/provenance/results/artifact references;
- semantic validation rejects duplicate criterion IDs;
- named candidate Evidence without provenance is rejected;
- required criterion non-PASS prevents PASS verdict input;
- artifact hash/size mismatches against actual bytes are rejected;
- common fairness and contract-revision rules are explicit;
- no candidate-specific pass condition has leaked into the shared layer.
