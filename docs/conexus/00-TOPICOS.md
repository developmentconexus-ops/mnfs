# Conexus — backlog de planejamento

> Método acordado (2026-08-10): loop Discovery → Decision → Execution, registro de decisão em
> `DECISOES.md`, evidência antes de decisão, zero cerimônia além disso. Cada tópico tem saída fixa:
> **1 decisão de ~1 página com evidência**. Profundo onde é caro errar, raso onde é barato mudar.
> A hierarquia A0–A10 / R0–R8 / lanes do MNFS **não se aplica** a estes docs.

| # | Tópico | Pergunta central | Profundidade | Status |
|---|---|---|---|---|
| 0 | [Relação Conexus × MNFS](01-relacao-mnfs.md) | O que do MNFS sobrevive? | funda | **DECIDIDO — C-000** |
| 1 | [Visão e escopo do produto](02-visao-escopo.md) | O que É / para quem / caso 1 / o que NÃO é | funda | **DECIDIDO — C-001** |
| 2 | [Requisitos: piso + teto](03-requisitos.md) | ADOPTs (piso) + pilares P1–P3 + C1–C4 viram requisitos | funda | **DECIDIDO — C-003** |
| 3 | [Runtime do agente (harness)](04-runtime-agente.md) | Hub próprio × Mastra; Pi × Agent SDK × ACP como workers | funda | **DECIDIDO — C-002** |
| 4 | [Sandbox de execução](05-sandbox.md) | E2B × local × alternativa | funda | **DECIDIDO — C-008** (supersede C-004; ativação probe-gated `CX-SBX-E2B-01`) |
| 5 | [Registro de artefatos + 2 SDKs](06-registro-artefatos.md) | SF/dataLoader/dbAction com slug + bind params | funda | **DECIDIDO — C-005** |
| 6 | [Camada de dados](07-camada-dados.md) | Postgres×MySQL, DB por projeto, migration gate, base efêmera | funda | **DECIDIDO — C-006** |
| 7 | [Integração externa](08-integracao-externa.md) | Blueprint de conector, vault, túnel, perfil Sankhya | funda | **DECIDIDO — C-007** |
| 8 | Scaffold + frontend | Template React/Vite, UI-kit, publish | média | pendente |
| 9 | Agente de 1ª classe | Identidade, versão, tools, headless, contexto em camadas | funda | **aberto** — [pesquisa interna](pesquisa-interna-agente.md) concluída (7 correções à direção + proposta de decisão); [prompt externo](pesquisa-externa-agente-prompt.md) rodando; lacunas de harness → [adendo da sonda](sonda-addendum-harness-flow.md) |
| 10 | Estratégia de LLM | Modelos por fase, custo | rasa → aprofunda no build | pendente |
| 11 | Ciclo de vida | Git model, DEV→PROD, release, rollback | média | pendente |
| 12 | Runtime publicado | Auth/RBAC, embed, storage | rasa → aprofunda no build | pendente |
| 13 | Observabilidade mínima | Log de turno, custo, status, checklist vivo (TodoWrite→eventos→UI) + `tasks.md` durável | rasa | pendente |
| 14 | Segurança proporcional | Credencial server-side, bind params, tenancy — o mínimo profissional | média | pendente |
| 16 | [Sonda de manutenção na Mitra](16-sonda-manutencao-mitra.md) | A Mitra sustenta a segunda volta? Evidência atual é toda greenfield | funda | **roteiro completo — veredito escrito, falta ratificar como C-0xx** |
| 15 | Cérebro da empresa | Camada semântica por grupo de projetos: schema+regras+processos, discovery assistido, retroalimentação | funda | **pronto para abrir** — evidência na mesa (OBS-47) |

> **Entrada obrigatória do T15, antes de gastar a aposta mais cara** (`17-log`, OBS-47): a Mitra **já
> tem a metade estrutural** de camada semântica — `DynamicCubeQuery` + `dimension_store`, com
> dimensão, atributo tipado, função de agregação padrão por atributo, chave única, cardinalidade e
> cubo de destino, tudo em chaves i18n (UI real). O que ela **não** tem: a camada atravessar
> **projetos**, e carregar **regra e processo** — só estrutura de dado. O diferencial do Conexus é
> exatamente esses dois pontos, não "ter camada semântica".

Evidência-base: [referência Mitra](../reference/mitra/00-OVERVIEW.md) ·
[DECISION-REGISTER](../reference/mitra/DECISION-REGISTER.md) ·
[mapa congelado v0.9.0](../research/MITRA-INSPIRATION-MAP.md).
