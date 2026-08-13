# Fase 3 — Detailed Decision Index

Este diretório contém decisões detalhadas da Fase 3 que complementam o ledger `../24-arquitetura-system-design.md`.

A partir de 3B-16, decisões muito extensas podem receber arquivo próprio para preservar exemplos, diagramas, invariantes, racional e limites sem transformar o ledger principal em um arquivo impraticável. O ledger principal continua sendo a síntese; estes arquivos são parte da evidência e especificação da decisão correspondente.

## Status

| ID | Decisão | Status | Documento |
|---|---|---|---|
| 3B-01..3B-15 | System Context & Boundaries | APROVADO | `../24-arquitetura-system-design.md` |
| 3B-16 | Project-Internal Resource Ownership | APROVADO | [3B-16-project-internal-resource-ownership.md](3B-16-project-internal-resource-ownership.md) |
| 3B-17 | Project Isolation and Explicit Reuse | APROVADO | decisão aprovada em sessão; detalhamento será consolidado na revisão transversal de 3B |

## 3B-17 — síntese normativa

Projects são independentes e isolados por padrão.

Reuso F1 ocorre somente por:

- Platform/scaffold para infraestrutura genérica;
- Workspace Brain para semântica empresarial;
- Workspace Connections para integrações externas.

É proibido no F1:

- acesso direto ao database de outro Project;
- import direto de source de outro Project;
- uso direto de ArtifactRevision ou AgentRevision de outro Project;
- shared mutable state entre Projects;
- chamadas runtime Project→Project sem nova decisão arquitetural.

Duplicação local pequena é preferível a abstração compartilhada prematura. Uma abstração comum só nasce depois de consumidores reais demonstrarem semântica e lifecycle estáveis; nesse caso ela sobe para a raiz correta: Platform, Brain, Connector ou uma futura package layer explicitamente decidida.

Clone/template futuro cria Projects independentes e não live inheritance.

## Encerramento de 3B

Com 3B-17 aprovada, as boundaries previstas para **3B — System Context & Boundaries** estão fechadas:

```text
Workspace / tenancy
Project boundary
Change / Builder boundary
Inception / Baseline
proportional planning
repository ownership
ReBAC / Areas / permissions
authorization surfaces
Workspace resources / Project bindings
Project-internal ownership
Project isolation / reuse
```

O próximo passo é uma revisão transversal de 3B-01..3B-17 para detectar contradições, duplicações ou gaps antes de iniciar **3C — Domain / Module Architecture**.

Isso não encerra a Fase 3 completa, não constitui C-018 e não autoriza implementação.

## Regra

- `APROVADO` exige aprovação explícita do operador e commit;
- arquivo detalhado não cria entidade ou mecanismo adicional no produto;
- diagramas e exemplos são explicativos; invariantes e seção “Decisão” são normativas;
- C-018 só será proposta após reconciliação transversal de toda a Fase 3.
