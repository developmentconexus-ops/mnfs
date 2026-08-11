# Conexus — backlog de planejamento

> Método acordado (2026-08-10): loop Discovery → Decision → Execution, registro de decisão em
> `DECISOES.md`, evidência antes de decisão, zero cerimônia além disso. Cada tópico tem saída fixa:
> **1 decisão de ~1 página com evidência**. Profundo onde é caro errar, raso onde é barato mudar.
> A hierarquia A0–A10 / R0–R8 / lanes do MNFS **não se aplica** a estes docs.

| # | Tópico | Pergunta central | Profundidade | Status |
|---|---|---|---|---|
| 0 | [Relação Conexus × MNFS](01-relacao-mnfs.md) | O que do MNFS sobrevive? | funda | **DECIDIDO — C-000** |
| 1 | [Visão e escopo do produto](02-visao-escopo.md) | O que É / para quem / caso 1 / o que NÃO é | funda | **DECIDIDO — C-001** |
| 2 | [Requisitos: piso + teto](03-requisitos.md) | ADOPTs (piso) + pilares P1–P3 + C1–C4 viram requisitos | funda | **RASCUNHO — aguarda ratificação** |
| 3 | [Runtime do agente (harness)](04-runtime-agente.md) | Hub próprio × Mastra; Pi × Agent SDK × ACP como workers | funda | **DECIDIDO — C-002** |
| 4 | Sandbox de execução | E2B × local × alternativa | funda | pendente |
| 5 | Registro de artefatos + 2 SDKs | SF/dataLoader/dbAction com slug + bind params | funda | pendente |
| 6 | Camada de dados | Postgres×MySQL, DB por projeto, migration gate, base efêmera | funda | pendente |
| 7 | Integração externa | Blueprint de conector, vault, túnel, perfil Sankhya | funda | pendente |
| 8 | Scaffold + frontend | Template React/Vite, UI-kit, publish | média | pendente |
| 9 | Agente de 1ª classe | Identidade, versão, tools, headless, contexto em camadas | funda | pendente |
| 10 | Estratégia de LLM | Modelos por fase, custo | rasa → aprofunda no build | pendente |
| 11 | Ciclo de vida | Git model, DEV→PROD, release, rollback | média | pendente |
| 12 | Runtime publicado | Auth/RBAC, embed, storage | rasa → aprofunda no build | pendente |
| 13 | Observabilidade mínima | Log de turno, custo, status, checklist vivo (TodoWrite→eventos→UI) + `tasks.md` durável | rasa | pendente |
| 14 | Segurança proporcional | Credencial server-side, bind params, tenancy — o mínimo profissional | média | pendente |
| 15 | Cérebro da empresa | Camada semântica por grupo de projetos: schema+regras+processos, discovery assistido, retroalimentação | funda | pendente |

Evidência-base: [referência Mitra](../reference/mitra/00-OVERVIEW.md) ·
[DECISION-REGISTER](../reference/mitra/DECISION-REGISTER.md) ·
[mapa congelado v0.9.0](../research/MITRA-INSPIRATION-MAP.md).
