# ARR-S1 deterministic harness

This directory contains the deterministic implementation of the accepted ARR-S1
contract and plan. It owns the candidate-independent criteria, fixtures,
authority binding, preflight, orchestration seams and report validation.

The harness does not download, install, stage or execute Pi, Pi-ACP, OpenCode or
any other real candidate. It does not call a provider, OAuth or API. Tests use
deterministic observations and injected seams only.

The later controlled gate must provide the exact external authority below before
candidate operations are permitted:

```text
MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=<accepted-plan-git-blob> contract_sha256=<accepted-contract-sha256> base_sha=<GATE-S1-base_sha> verify_run=<GATE-S1-verify_run> scope=pi-first-runtime-conformance
```

Missing prerequisites, stale exact bytes, unsafe source/state-root observations
and incomplete credential/provenance observations produce `BLOCKED`. The
harness never performs automatic remediation and records only provider and
authentication-method classes, never secrets.

The machine interface is:

```text
preflight --json
run --json
report --run-id RUN_ID --json
```
