# Conexus — backlog de planejamento

> Método acordado (2026-08-10): loop Discovery → Decision → Execution, registro de decisão em
> `DECISOES.md`, evidência antes de decisão, zero cerimônia além disso. Cada tópico tem saída fixa:
> **1 decisão de ~1 página com evidência**. Profundo onde é caro errar, raso onde é barato mudar.
> A hierarquia A0–A10 / R0–R8 / lanes do MNFS **não se aplica** a estes docs.

| # | Tópico | Pergunta central | Profundidade | Status |
|---|---|---|---|---|
| 0 | [Relação Conexus × MNFS](01-relacao-mnfs.md) | O que do MNFS sobrevive? | funda | **DECIDIDO — C-000** |
| 1 | Visão e escopo do produto | O que É / para quem / caso 1 / o que NÃO é | funda | **em curso** |
| 2 | Requisitos: piso + teto | ADOPTs (piso) + 6 OWNs (teto) viram requisitos | funda | pendente |
| 3 | Runtime do agente (harness) | Claude Agent SDK × Claude Code headless × Pi | funda | pendente |
| 4 | Sandbox de execução | E2B × local × alternativa | funda | pendente |
| 5 | Registro de artefatos + 2 SDKs | SF/dataLoader/dbAction com slug + bind params | funda | pendente |
| 6 | Camada de dados | Postgres×MySQL, DB por projeto, migration gate, base efêmera | funda | pendente |
| 7 | Integração externa | Blueprint de conector, vault, túnel, perfil Sankhya | funda | pendente |
| 8 | Scaffold + frontend | Template React/Vite, UI-kit, publish | média | pendente |
| 9 | Agente de 1ª classe | Identidade, versão, tools, headless, contexto em camadas | funda | pendente |
| 10 | Estratégia de LLM | Modelos por fase, custo | rasa → aprofunda no build | pendente |
| 11 | Ciclo de vida | Git model, DEV→PROD, release, rollback | média | pendente |
| 12 | Runtime publicado | Auth/RBAC, embed, storage | rasa → aprofunda no build | pendente |
| 13 | Observabilidade mínima | Log de turno, custo, status — e só | rasa | pendente |
| 14 | Segurança proporcional | Credencial server-side, bind params, tenancy — o mínimo profissional | média | pendente |

Evidência-base: [referência Mitra](../reference/mitra/00-OVERVIEW.md) ·
[DECISION-REGISTER](../reference/mitra/DECISION-REGISTER.md) ·
[mapa congelado v0.9.0](../research/MITRA-INSPIRATION-MAP.md).
