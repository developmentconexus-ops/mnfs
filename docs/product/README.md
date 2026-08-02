---
id: DOC-PRODUCT-INDEX
title: MNFS Product Documentation
document_type: product_index
form: reference
authority: constitutional
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - product documentation entrypoint
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-CAPABILITY-REALIZATION-METHOD
  - DOC-DOCUMENTATION-MAP
last_reviewed: 2026-08-02
---

# MNFS product documentation

The Product Blueprint defines what MNFS is. The Capability Realization Method defines how approved product intent is converted into traceable implementation and evidence.

## Canonical documents

- [Product Blueprint aggregate](PRODUCT-BLUEPRINT.md)
- [Capability Realization Method](CAPABILITY-REALIZATION-METHOD.md)
- [Documentation Map](../DOCUMENTATION-MAP.md)
- [Capability Roadmap](../roadmap.md)
- [ADR decision log](../adr/README.md)

## Editable Product Blueprint sources

1. [Product vision](blueprint/01-product-vision.md)
2. [Domain model](blueprint/02-domain-model.md)
3. [Lifecycle and flows](blueprint/03-lifecycle-flows.md)
4. [Engineering System](blueprint/04-engineering-system.md)
5. [System architecture](blueprint/05-system-architecture.md)
6. [Roles and authority](blueprint/06-roles-authority.md)
7. [Quality and evidence](blueprint/07-quality-evidence.md)
8. [State and recovery](blueprint/08-state-recovery.md)
9. [Context and memory](blueprint/09-context-memory.md)
10. [Security and isolation](blueprint/10-security-isolation.md)
11. [Operator experience and observability](blueprint/11-operator-observability.md)
12. [Capability roadmap](blueprint/12-capability-roadmap.md)
13. [Documentation governance](blueprint/13-documentation-governance.md)

## Editing rule

Edit the modular source file, run `npm run docs:generate`, then run `npm run docs:check`. Never edit the aggregate directly.
