# Mastra Qualification Provenance

Decision order:

```text
accepted Conexus OS authority
→ vendored official Mastra skill (`.agents/skills/mastra`, upstream metadata retained)
→ current Context7 source `/mastra-ai/mastra`
→ exact qualification packages/source/configuration
→ falsifiable RED/GREEN harnesses
→ raw JSON Evidence
→ Architecture-Lead adjudication
```

Current documentation checked during repository consolidation on 2026-08-20 covered RequestContext, Memory thread/resource scoping, native approval/suspension, Scheduler, Workflow, storage domains, and observability exporters. It was supporting evidence only.

Exact deciding pins: `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL `17.10`, Node `24.18.0`. Package-B lock SHA-256: `5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0`.

Reproducible artifacts live under `qualification/3l/mastra-runtime/`; durable adjudication lives in [../../phases/3L-technology-qualification.md](../../phases/3l-technology-qualification.md).

