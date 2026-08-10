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
MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=277dffc521754a4370bfd94132dc9467589fdcf0 contract_sha256=sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a base_sha=032620c35c95e932e6f5c5468c85273ddac25f38 verify_run=31286529184 scope=pi-first-runtime-conformance
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

