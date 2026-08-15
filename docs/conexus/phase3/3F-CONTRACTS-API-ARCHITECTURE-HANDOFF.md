# 3F — Contracts & API Architecture Initial Handoff

**Status:** HANDOFF / NOT STARTED  
**Fase:** 3F — Contracts & API Architecture  
**Pré-condição:** 3E CLOSED / APPROVED via `3E-R1-data-architecture-final-closure.md`  
**Importante:** este handoff não inicia 3F, não constitui decisão 3F, não constitui C-018 e não autoriza implementação, merge ou PR readiness.

## Objetivo

Preparar uma fresh session para trabalhar **a primeira decisão de 3F junto com o operador**, sem pré-decidir contracts, DTOs, envelopes, versionamento ou tecnologia.

Antes de propor qualquer decisão, reconstruir a authority conforme `AGENTS.md` e a cadeia de leitura ali definida. Para o intake específico de 3F, consultar depois:

- `docs/conexus/phase3/LEDGER.md`;
- `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`;
- `docs/conexus/phase3/3E-R1-data-architecture-final-closure.md`;
- 3C owner docs somente quando uma superfície concreta exigir evidência de ownership;
- C-005..C-017 somente quando uma regra fundacional específica for necessária.

Reviews `*-FABLE-*` são inputs não-autoritativos.

---

## Intake já fechado antes de 3F

3F não deve redecidir:

```text
module ownership                       → 3C
module import/dependency direction     → 3D
sete use cases cross-owner de L7       → 3D
approval claim como única inversão     → 3D
hub_control / schema ownership         → 3E
46 durable record classes              → 3E
16 Tier-2 FKs                          → 3E
opaque ID × digest × generation × ref  → 3E
```

3D permanece direct-call-first: não criar ports/interfaces/transport contracts para toda chamada interna apenas porque 3F existe.

---

## Trabalho roteado para 3F

O fechamento de 3E entrega os seguintes itens, sem definir solução:

```text
DTO/API/envelope shapes
error taxonomy / failure representation
approval capability signature
ConnectionRef / exact ConnectionRevisionRef contract
Project binding contracts
re-tipagem F3B-R2: MissionPlan v2 → Change / Work Unit
DEDICATED identity/authority exchange — dimensão de contract, com security em 3I
```

Esses itens não precisam virar uma única abstração. Cada um deve pagar por um consumidor e boundary reais.

---

## Primeira decisão para trabalhar com o operador

### Candidata: 3F-01 — Contract Surface Classification & Versioning Boundary

Pergunta central, ainda **NÃO DECIDIDA**:

> Quais boundaries concretas do Conexus F1 precisam de um contrato explícito/versionado, e quais devem permanecer apenas como chamadas internas tipadas dentro do modular monolith?

Essa decisão vem primeiro porque 3D já congelou `direct-call-first`. Sem separar as superfícies, 3F corre dois riscos opostos:

```text
API/port em tudo
→ abstração genérica e ceremony sem consumidor

contrato implícito em boundary externa/material
→ decisão escondida na implementação
```

A sessão com o operador deve comparar concretamente, no mínimo:

- Control Plane / L7;
- public module APIs usadas pelos sete flows aprovados;
- Capability Gateway;
- Managed Application Runtime / published app surface;
- Builder e Production Agent Runtime onde há boundary real;
- approval-claim inversion;
- DEDICATED Platform Services exchange;
- artefatos/config/binding contracts já pinados por authority anterior.

O objetivo da primeira decisão é classificar **superfícies reais**, não inventar um `UniversalContract`, `ApiModule`, mediator ou provider framework.

---

## O que NÃO decidir neste handoff

Não congelar ainda:

```text
OpenAPI/JSON Schema/TypeScript como formato final
HTTP route inventory
DTOs campo a campo
error codes completos
pagination/filter syntax
exact approval signature
versioning scheme final
SDK generation
GraphQL/gRPC/event contracts
complete DEDICATED auth protocol
FSMs 3G
runtime mechanics 3H
security/threat enforcement 3I
deployment topology 3J
technology qualification 3L
```

Qualquer escolha dessas só entra quando a primeira decisão de 3F mostrar a boundary/consumer que a exige.

---

## Guardrails

- sem implementação de produto;
- sem merge;
- PR #40 permanece DRAFT;
- sem marcar ready;
- preserve YAGNI;
- nenhuma abstração genérica antes do segundo consumidor real compatível;
- review externo não vira authority automaticamente;
- current Mastra behavior só pode ser usado como premissa após Context7 `/mastra-ai/mastra` + skill de Mastra disponível no ambiente;
- não iniciar 3G+ por antecipação.

---

## Condição de início de 3F

```text
3E = CLOSED / APPROVED
3F = NEXT / NOT STARTED
```

3F só muda de `NOT STARTED` quando a primeira decisão for efetivamente trabalhada com o operador e então materializada pelo fluxo normal de Decision → approval → commit.
