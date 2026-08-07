---
id: ADR-0015
title: Property-based Execution Environments
document_type: architecture_decision_record
form: explanation
authority: decision
status: accepted
date: 2026-08-07
owners:
  - developmentconexus-ops
approvers:
  - operator
supersedes:
  - ADR-0006
  - ADR-0008
superseded_by: null
related:
  - DOC-PRODUCT-BLUEPRINT-05
  - DOC-PRODUCT-BLUEPRINT-10
  - DOC-PRODUCT-BLUEPRINT-12
  - TRACKING-DECISIONS
tracking_issue: 23
---

# ADR-0015 — Property-based Execution Environments

## Context

ADR-0006 correctly separated Domain Authority, Tool Capability, Process Sandbox, Execution Environment, Credential, Network and External Effect planes, but fixed the near-term local realization as `E1 = Treehouse + OS sandbox`.

ADR-0008 separated Execution Environment lifecycle from Treehouse Lease and reserved remote evolution, but modeled environment options through an ordinal E0–E4 ladder and named a preferred future remote provider.

D3/D-013 and D-015 established that technology, locality, workspace model and isolation strength are independent dimensions. Modern process sandboxes, containers, user-kernel runtimes and embedded microVMs invalidate a single ordinal ladder as the product semantic model.

## Decision drivers

- Preserve separate authority/security/effect planes.
- Define what the product requires without embedding a vendor or technology rung.
- Keep provider/model credentials outside untrusted execution where possible.
- Allow local strong isolation without pretending it is necessarily “later” than containers.
- Preserve Git result identity and fresh Recovery across environment providers.
- Select concrete substrates only after host and conformance Evidence.

## Decision

MNFS models an **Execution Environment** through independent required/observed properties. At minimum, an Environment specification may describe:

```text
agent placement
compute location
isolation boundary
mutable workspace model
persistence / snapshot / fork capability
network posture
credential delivery posture
resource/process limits
recovery capability
Git result boundary
provider/version provenance
```

Typical values are descriptive rather than ordinal. For example:

```text
agentPlacement: CONTROL_SIDE | IN_ENVIRONMENT
computeLocation: LOCAL | REMOTE
isolationBoundary: PROCESS | CONTAINER | USER_KERNEL | MICROVM_VM
networkPosture: NONE | DENY_DEFAULT | ALLOWLISTED
credentialDelivery: NONE | BROKERED | RAW_EXPLICIT_EXCEPTION
```

Named profiles may compile useful combinations, but the properties are the semantics. A profile name must not hide weaker security or a different authority boundary.

## Security planes

The following planes remain distinct even when one substrate implements several mechanically:

1. Domain Authority;
2. Tool Capability;
3. Process/compute isolation;
4. Execution Environment lifecycle;
5. Credential brokerage;
6. Network/Egress policy;
7. External Effect Gate;
8. Evidence/Audit/Reconcile.

Technical isolation never grants domain authority.

## Agent placement

`CONTROL_SIDE` is preferred when the selected Agent Runtime can be strictly reduced to MNFS-brokered capabilities. In that shape:

```text
trusted side
MNFS + Agent Runtime + provider authentication
        ↓ controlled/brokered operations
untrusted execution side
workspace + shell/tests/repo code/services
```

This keeps provider/subscription credentials outside untrusted code.

`IN_ENVIRONMENT` is required or preferred when the Runtime cannot be sufficiently reduced or the execution topology demands whole-agent containment. In that case, brokered credential/inference delivery is preferred over raw provider secrets inside the workload.

No placement is universal; the selected realization must prove its capability boundary.

## Workspace and result

The Environment may provide the mutable workspace directly or bind a separate workspace realization under ADR-0014.

Accepted output remains provider-neutral Git identity:

```text
baseCommitSha + resultTreeSha [+ optional resultCommitSha]
```

A snapshot, delta DB, VM disk, container rootfs or remote volume is execution state, not acceptance authority.

## Local and remote realizations

No local process sandbox, microVM runtime, container platform or remote provider is selected by this ADR.

The deciding sequence is:

```text
ARR-S0 host capability Evidence
→ ARR-S2 local Execution Envelope conformance
→ optional ARR-S2W workspace comparison
→ ARR-S3 vertical composition
```

`ARR-S2` compares eligible process-envelope and stronger-isolation hypotheses under one candidate-independent contract. Remote platforms remain future candidates until a named remote/parallel consumer makes that decision material.

## Fail-closed requirements

Protected execution must fail closed when required Environment properties cannot be established. Missing isolation, policy, credential/network posture or resource binding cannot silently fall back to unrestricted host execution.

## Consequences

### Positive

- Security semantics survive tool/provider churn.
- Process sandbox, microVM and future remote environments can be compared fairly.
- WSL2 remains the canonical host without being mislabeled as the security boundary.
- Credential/network architecture is evaluated independently from compute technology.
- Workspace machinery can be eliminated when the selected environment already provides it.

### Negative

- Product documentation must distinguish semantic properties from concrete adapters.
- Selecting a realization requires comparative conformance rather than relying on a simple level number.
- Recovery/Reconcile must observe provider-specific external state through concrete bindings.

## Validation

Environment selection must prove, as applicable:

- exact source/workspace boundary;
- protected host read/write denial;
- network posture;
- credential posture;
- child-process containment;
- fail-closed startup;
- toolchain compatibility;
- crash/restart/reconcile behavior;
- Git fidelity/result extraction;
- cleanup/resource disposition;
- host compatibility;
- startup/disk/repeat-run/operational cost;
- public supported boundary and pinned provenance.

## Migration

Accepted AS-02/Treehouse/E1 Evidence remains historical evidence for that realization and can be reused where it proves provider-neutral properties. It does not constitutionally select the future environment.

## Supersession

This ADR supersedes ADR-0006 and ADR-0008. It preserves the security-plane separation and environment/provider replaceability while superseding the fixed E1 realization, ordinal E0–E4 ladder and provider-specific future ranking.
