# Package D — Managed-Execution Qualification

Evidence-only harness for the tested transactional managed-occurrence admission subset of `CX-MANAGED-JOB-01`. It does not prove Product MAR, recurrence, Release, Gateway, sync, cancellation, timeout, or recovery correctness.

Exact pins: `pg-boss 12.26.3`, `pg 8.22.0`, Node `24.18.0`, PostgreSQL `17.10`. The vendored pg-boss DDL and provenance live in `vendor/`.

## Reproduce

Use a disposable PostgreSQL 17.10 database. `DT1_DATABASE_URL` defaults to the documented local disposable database only; never point it at shared or production data.

```bash
npm ci
npm run verify
npm run evidence
```

The Evidence command recreates bounded qualification observations and may create/drop only its disposable test objects. It requires no provider/model/E2B credentials and must perform no real enterprise effect.
