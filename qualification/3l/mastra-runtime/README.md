# Package B — Mastra Runtime Qualification

Evidence-only harness for `CX-AGENT-MASTRA-01` and `CX-RUNTIME-ISOLATION-01`. It is not Product implementation.

Exact pins: `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, Node `24.18.0`, PostgreSQL `17.10`. Exact lock SHA-256: `5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0`.

## Reproduce

Provide a disposable PostgreSQL 17.10 database through `TEST_DATABASE_URL`, then:

```bash
npm ci
npm run verify
```

The suite is serial and includes explicit RED controls. It must not use provider/model credentials, E2B, or real external effects. Raw Evidence and source-admission records live in `evidence/`; criteria live in `admission/criteria.json`.

