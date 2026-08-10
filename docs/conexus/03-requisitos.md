# Tópico 2 — Requisitos: piso + teto

**Status: RASCUNHO — aguarda revisão do operador.**
Fontes: piso = ADOPTs do [DECISION-REGISTER](../reference/mitra/DECISION-REGISTER.md); teto =
pilares P1–P3 + C1–C4 ([visão, C-001](02-visao-escopo.md)); requisitos negativos =
[08-limites-e-gaps](../reference/mitra/08-limites-e-gaps.md) (não repetidos aqui — a tabela S/O/C/E
de lá vale como anexo normativo).

**Fases:** `MVP` = o mínimo para entregar o caso 1 (replicar o Analisador de Orçamentos) ·
`F1` = fase interna completa · `F2` = SaaS.

## HAR — Harness de build

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| HAR-1 | Protocolo de turno rígido (SYNC → trabalho → BUILD → SHARE; 1 commit/turno; sandbox descartável, git como único sobrevivente) | MVP | piso [01](../reference/mitra/01-harness-agentico.md) |
| HAR-2 | Etapa de escopo separada do build; estágio 2 **audita** o estágio 1 contra o dado real (Data Discovery por SQL antes de codar) | MVP | piso [07](../reference/mitra/07-padrao-de-projeto.md) |
| HAR-3 | Checkpoint humano: contrato aprovado antes de codar; `AskUserQuestion` com **bloqueio mecânico** no harness | MVP | piso + gap E4 |
| HAR-4 | Docs de planejamento versionados como memória (`arquitetura`, `ux`, `design`, `tasks`) relidos pelo agente | MVP | piso [07](../reference/mitra/07-padrao-de-projeto.md) |
| HAR-5 | Scaffold versionado byte-controlado (template rico → agente herda decisões) com escape hatch | MVP | piso + P2 |
| HAR-6 | Engenharia como artefato: padrões vivem no template + gates mecânicos (lint, typecheck, teste, benchmark) — zero manual de governança | MVP | P2 |
| HAR-7 | Plano visual aprovável (schema v2 + render HTML + grafo de dependências reusados do acervo MNFS) na etapa de escopo | F1 | C-000 REUSE |
| HAR-8 | Checklist vivo de execução: TodoWrite do harness → eventos tipados → UI marca ao vivo; `tasks.md` durável com status/output + causa-raiz ao final | MVP | piso [§17/§34.10](../research/MITRA-INSPIRATION-MAP.md) |
| HAR-9 | Entrega só fecha com "Limitações conhecidas" + critérios de aceite numéricos verificáveis | MVP | piso (traço de honestidade) |

## REG — Registro de artefatos

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| REG-1 | Dois SDKs, dois privilégios: build-time privilegiado (DDL/provisão) × runtime restrito (executa artefato registrado) | MVP | piso [02](../reference/mitra/02-registro-artefatos.md) |
| REG-2 | Artefatos referenciados por **slug estável**, nunca id numérico | MVP | REJECT C1 |
| REG-3 | **Uma** sintaxe de binding com **bind parameters reais** (nunca interpolação de string) | MVP | REJECT S1/C2 |
| REG-4 | Provisionamento idempotente (`list → update | create` por slug); "o script é a versão" | MVP | piso |
| REG-5 | Envelope de resposta único e tipado (fim do normalizador defensivo) | MVP | piso [02](../reference/mitra/02-registro-artefatos.md) |

## DAT — Camada de dados

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| DAT-1 | 1 banco por projeto; credencial no vault do servidor; agente roda DDL sem ver senha | MVP | piso [03](../reference/mitra/03-camada-dados.md) |
| DAT-2 | Migration como **gate** versionado (não log pós-fato); dry-run antes do deploy | MVP | REJECT O1/O2 |
| DAT-3 | Base efêmera + fixtures para teste (nunca smoke contra produção) | F1 | REJECT S2/O3 |
| DAT-4 | UTF-8 fim a fim | MVP | gap E6 |

## INT — Integração externa

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| INT-1 | Conector declarativo: blueprint + `fieldsSchema` + teste de conexão; credencial por handle simbólico, sempre server-side | MVP | piso [04](../reference/mitra/04-integracao-externa.md) |
| INT-2 | Perfil de ERP versionado e plugável; **Sankhya primeiro** (TOPs, paginação 5k, gateway) | MVP | piso + caso 1 |
| INT-3 | Helper de paginação/upsert/cursor como biblioteca do harness (não código gerado em string) | MVP | piso §34.6 + REJECT C3 |
| INT-4 | Canal de credencial dedicado com escopo por empresa/ambiente (nunca token colado no chat) | F1 | REJECT S4 |
| INT-5 | SQL livre só em Discovery, read-only + allowlist | F1 | ADAPT [04](../reference/mitra/04-integracao-externa.md) |
| INT-6 | Túnel gerenciado para on-prem | F2 | piso |

## CER — Cérebro da empresa (P1)

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| CER-1 | Projetos organizados em **grupos por empresa**; cérebro do grupo herdado como contexto por todos os projetos | MVP | P1 |
| CER-2 | Cérebro v0: base estruturada editável (schema semântico, definições canônicas, regras de negócio, processos, campanhas) — seed manual, formato versionado | MVP | P1 (Minos como referência) |
| CER-3 | Discovery assistido: sonda no banco do ERP propõe mapeamentos e **pergunta** o que não infere (loop de entrevista) | F1 | P1 |
| CER-4 | Retroalimentação: descobertas de projeto (ex.: "VLRCUS não é custo") promovidas ao cérebro do grupo | F1 | P1 + C3-dogfood |
| CER-5 | Contexto em camadas determinístico: plataforma → empresa (cérebro) → projeto → tarefa | MVP | OWN + ADR-0004 (REFERENCE) |

## AGT — Agentes de plataforma (P3 + C1)

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| AGT-1 | Agente como objeto de 1ª classe: identidade, versão, tools declaradas, política, ciclo de vida | F1 | OWN central |
| AGT-2 | Central de agentes: criar/gerenciar/observar agentes da plataforma (candidato: Mastra) | F1 | P3 |
| AGT-3 | Agente headless por evento (cron/webhook) com identidade de serviço — insight→ação (notificar vendedor, campanha) | F1 | C1 + OWN |
| AGT-4 | Consultor de plataforma: agente que conhece docs/SDKs/padrões do Conexus (usa o mecanismo do cérebro) | F1 | P3 + C4 |
| AGT-5 | Sessão de agente embutível com eventos tipados (streaming, fila, reconexão) — forma do `AgentTaskSession` | F1 | ADOPT [01](../reference/mitra/01-harness-agentico.md) |

## PUB — Runtime publicado

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| PUB-1 | Publish injeta config de ambiente no HTML; app usa só o SDK restrito | MVP | piso [06](../reference/mitra/06-runtime-publicado.md) |
| PUB-2 | Auth em origem separada (app nunca vê senha); token no fragment, limpo; refresh token (não iframe) | MVP | piso + E5 |
| PUB-3 | RBAC leitura≠escrita, escopado, administrável via SDK; home por perfil | F1 | piso |
| PUB-4 | Chat-embed com handshake de estado (`loaded→init→ready→opened`), origem explícita no postMessage | F1 | piso + REJECT S3 |
| PUB-5 | Storage privado por padrão; público = opt-in assinado; prefixo por tenant | MVP | REJECT S8 |

## CIC — Ciclo de vida

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| CIC-1 | Branch por construtor + main baseline; merge sem force/rebase; conflito → pergunta em linguagem de negócio | MVP | piso [05](../reference/mitra/05-ciclo-de-vida.md) |
| CIC-2 | PROD = projeto forkado ligado ao DEV; deploy por snapshot versionado; rollback por tag | F1 | piso |
| CIC-3 | Promote com steps nomeados observáveis; falha de deploy vira tarefa do agente | F1 | piso |
| CIC-4 | Duplicação de projeto pergunta sobre dados (default: sem dados) | F1 | REJECT O4 |

## OBS — UI e observabilidade

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| OBS-1 | Custo/tokens por turno e por projeto visíveis na UI | MVP | C3 + gap E3 |
| OBS-2 | Três estados de UI sempre distintos: vazio / carregando / falhou; rota indisponível se declara | MVP | REJECT E1/E2 |
| OBS-3 | Log de turno estruturado (tools, duração, resultado) consultável | F1 | — |

## SEG — Segurança proporcional

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| SEG-1 | Credencial nunca no cliente, nunca no repo, nunca no chat; vault server-side | MVP | REJECT S4/S5 |
| SEG-2 | Tenancy com fronteira no servidor (header é trace, não fronteira) | MVP | REJECT S7 |
| SEG-3 | Privilégio explícito e auditável (sem admin implícito de workspace em todo projeto) | F2 | REJECT S6 |
| SEG-4 | Nada além disso na fase 1 — sem SOC2 theater, sem threat model formal; revisita na F2 | — | método C-000 |

## QUA — Qualidade do builder

| ID | Requisito | Fase | Fonte |
|---|---|---|---|
| QUA-1 | **Golden benchmark**: caso 1 como suíte de regressão do builder (mesma spec → comparar saída vs Mitra e vs versões anteriores) | MVP | C2 |
| QUA-2 | Smoke test que reproduz as chamadas da UI + reporte honesto de falhas | MVP | piso [07](../reference/mitra/07-padrao-de-projeto.md) |
| QUA-3 | Revisão final item-a-item contra o prompt original antes de entregar | MVP | piso |

## Contagem por fase

MVP: 28 requisitos · F1: 15 · F2: 3. MVP entrega o caso 1 com cérebro v0 (seed manual) e sem
headless/RBAC completo — enxuto de propósito.

## Decisão

_(pendente — operador ratifica ou ajusta fases/cortes)_
