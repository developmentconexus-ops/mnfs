---
id: DOC-PRODUCT-BLUEPRINT-06
title: Papéis, Autoridades, Decisões Humanas e Modelo de Autonomia
document_type: product_blueprint_section
form: explanation
authority: constitutional
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
approvers:
  - operator
source_of_truth_for:
  - product blueprint section 6
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-07
tracking_issue: 6
---

## ARR-RECONCILIATION-2026-08-07 — Current Role and Authority rules

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

Role authority belongs to MNFS identities, not runtime Sessions. Planner, Investigator, Writer, Reviewer/Validator, Integrator and QA receive role-specific compiled packs with current Authority, target, proof and effect boundaries.

**Validator does not receive write authority by default**. The Writer implements and produces a Claim; independent verification/validation produces Receipts and Findings; only the governed MNFS Gate or explicitly authorized Operator transition may accept where policy assigns that authority.

Fresh Actor orientation and structured handoff must be sufficient without the previous conversation. Session continuity is an optimization only.

---

# 6. Papéis, Autoridades, Decisões Humanas e Modelo de Autonomia

## 6.1 Propósito

Esta seção define quem pode:

- propor;
- decidir;
- executar;
- verificar;
- aceitar;
- escalar;
- cancelar;
- corrigir;
- integrar;
- encerrar.

O objetivo é impedir que:

- um worker altere escopo;
- um reviewer crie trabalho novo;
- um Lead implemente e aprove o próprio diff;
- um processo externo se torne autoridade;
- uma sessão longa acumule poderes demais;
- decisões humanas sejam escondidas em prosa;
- agentes façam perguntas duplicadas ao operador;
- uma ferramenta mecânica tome decisões de produto;
- um modelo “mais forte” seja tratado como autoridade apenas por ser mais capaz.

No MNFS:

> **Capacidade de raciocínio não concede autoridade.**

Autoridade é definida pelo papel, pelo contrato e pela política vigente.

---

# 6.2 Distinções fundamentais

## 6.2.1 Actor

Actor é quem realiza uma ação.

Exemplos:

```text
operator:leandro
lead:WR-001
worker:WR-004
reviewer:WR-007
runner:mnfs
integrator:INT-003
```

## 6.2.2 Role

Role define responsabilidades e limites.

Exemplos:

- Operator;
- MNFS Lead;
- Planner;
- Investigator;
- Writer Worker;
- Reviewer;
- Verification Runner;
- Integrator;
- QA Actor.

## 6.2.3 Session

Session é um contexto conversacional ou de execução.

Uma Role pode sobreviver à perda de uma Session.

Exemplo:

```text
MNFS Lead role
├── Runtime Session S-001
└── Runtime Session S-002 após restart
```

## 6.2.4 Process

Process é uma instância operacional do sistema.

Pode hospedar:

- uma Session;
- um worker;
- um runner;
- uma integração;
- um QA actor.

Process não é Role.

## 6.2.5 Authority

Authority define qual decisão um Actor pode registrar validamente.

## 6.2.6 Permission

Permission define quais operações técnicas o Actor pode executar.

Authority e Permission não são equivalentes.

Exemplo:

```text
Worker possui permissão de escrever apenas no isolated mutable workspace autorizado.
Worker não possui autoridade para aceitar o próprio Claim.
```

---

# 6.3 Princípio do único liaison

O operador conversa diretamente apenas com o **MNFS Lead**.

```text
Operator
   ↓
MNFS Lead
   ├── Planner
   ├── Investigator
   ├── Writer Worker
   ├── Reviewer
   ├── Verification Runner
   ├── Integrator
   └── QA Actor
```

## 6.3.1 Razões

Um único liaison:

- reduz interrupções;
- evita perguntas duplicadas;
- preserva coerência;
- traduz detalhes técnicos;
- filtra ruído;
- consolida alternativas;
- mantém autoridade clara;
- reduz contexto exigido do operador;
- evita competição entre agentes por atenção.

## 6.3.2 Exceções

Outro Actor só pode interagir diretamente com o operador quando:

- o Lead delega explicitamente uma entrevista especializada;
- uma interface visual conduz uma decisão estruturada;
- o operador solicita contato direto;
- uma emergência exige confirmação imediata.

Mesmo nesses casos:

- o resultado vira Decision ou Artifact;
- o Lead recebe a referência;
- o estado não depende da conversa paralela.

## 6.3.3 Regra

Workers nunca bloqueiam o sistema esperando resposta direta do operador.

Eles escalam ao Lead.

---

# 6.4 Operator

## 6.4.1 Definição

Operator é a autoridade humana final sobre produto, risco, escopo e irreversibilidade.

## 6.4.2 Pode decidir

- objetivo da Mission;
- outcome esperado;
- escopo incluído;
- escopo excluído;
- aprovação do contrato;
- mudança material do contrato;
- prioridade;
- orçamento;
- risco aceito;
- breaking change;
- operação destrutiva;
- uso de ambiente real sensível;
- produção;
- cancelamento da Mission;
- Waiver de alto impacto;
- encerramento incompleto;
- trade-off de produto.

## 6.4.3 Pode autorizar

- push;
- merge final;
- deploy;
- migration destrutiva;
- escrita em produção;
- envio de dados;
- rotação de secrets;
- nova dependência material;
- ação irreversível.

A necessidade de autorização é definida pelo Repository Profile e pela política da Mission.

## 6.4.4 Não precisa fazer

- escolher worker;
- escrever prompts;
- abrir worktrees;
- executar testes;
- reconciliar estado;
- interpretar logs;
- revisar todos os diffs;
- administrar terminais;
- lembrar comandos internos;
- decidir detalhes locais de implementação.

## 6.4.5 Obrigações do MNFS com o Operator

Toda solicitação de decisão deve apresentar:

```text
question
why now
options
recommendation
impact
risk
blocked entities
default if no decision
```

Nunca apresentar apenas:

> “O que você quer fazer?”

## 6.4.6 Direito de interrupção

Operator pode:

- pausar;
- cancelar;
- pedir status;
- pedir evidência;
- exigir review adicional;
- trocar prioridade;
- rejeitar recomendação;
- solicitar Replan.

Essas ações precisam virar estado estruturado.

---

# 6.5 MNFS Lead

## 6.5.1 Definição

MNFS Lead é o liaison e coordenador principal da Mission.

É um papel de governança, não um super-worker.

## 6.5.2 Responsabilidades

- entender intenção;
- conduzir Intake;
- coordenar Planning;
- consolidar investigações;
- apresentar decisões;
- manter o Operator informado;
- resolver dependências;
- preparar execução;
- selecionar lanes;
- despachar Actors;
- acompanhar estado;
- detectar blockers;
- iniciar Recovery;
- adjudicar conflitos permitidos;
- coordenar Integration;
- conduzir Closeout.

## 6.5.3 Pode decidir

Dentro do contrato:

- ordem de execução;
- alocação de workers;
- seleção entre Golden Paths equivalentes;
- retry permitido;
- reuso de worktree;
- escalada de risco;
- pedido de review;
- investigação adicional;
- pausa técnica;
- resolução de conflito operacional;
- prioridade entre Tracks não conflitantes.

## 6.5.4 Não pode decidir sozinho

- alterar objetivo;
- alterar escopo material;
- remover Acceptance Criterion;
- reduzir um `MUST`;
- aceitar risco de produto;
- aprovar breaking change;
- ignorar gate decisivo;
- realizar operação irreversível sem autoridade;
- encerrar Mission incompleta;
- aprovar o próprio grande diff.

## 6.5.5 Não deve fazer

- implementar grandes Features;
- editar múltiplas superfícies por conveniência;
- revisar trabalho que ele próprio implementou;
- absorver debugging detalhado;
- ler logs completos quando um Actor pode resumir;
- carregar todo o contexto de todos os workers;
- esconder unknowns;
- transformar recomendação em Decision sem autoridade.

## 6.5.6 Trabalho direto permitido

O Lead pode realizar ações pequenas e mecânicas quando delegar seria mais caro e não criaria conflito de autoridade.

Exemplos:

- registrar uma Decision já formulada;
- atualizar tracking;
- corrigir typo;
- executar status;
- chamar Application Service;
- criar referência;
- consolidar output estruturado.

Se a ação produzir um diff significativo, ela deve virar Write Track.

---

# 6.6 Planner

## 6.6.1 Definição

Planner transforma intenção e evidência em proposta estruturada.

## 6.6.2 Responsabilidades

- decompor Mission;
- identificar Milestones;
- definir Features;
- formular Acceptance Criteria;
- mapear dependencies;
- propor ownership;
- identificar riscos;
- levantar assumptions;
- identificar questions;
- sugerir Golden Paths;
- mapear Engineering Standards;
- construir Verification Plan.

## 6.6.3 Pode propor

- arquitetura;
- contratos;
- decomposição;
- alternativas;
- ordem;
- risco;
- critérios;
- Safety Nets;
- Waivers candidatas.

## 6.6.4 Não pode

- aprovar o próprio plano;
- responder silenciosamente questão de produto;
- tornar assumption fato;
- iniciar workers;
- alterar código;
- registrar contrato aprovado;
- eliminar risco apenas por opinião.

## 6.6.5 Independência

Planner pode ser:

- o próprio Lead;
- Actor especializado via Agent Runtime;
- outro modelo;
- combinação de investigadores;
- co-planner independente.

Independência adicional é usada quando:

- arquitetura é material;
- escopo é grande;
- risco é alto;
- incerteza é relevante.

---

# 6.7 Investigator

## 6.7.1 Definição

Investigator produz conhecimento verificável.

## 6.7.2 Modos

```text
REPOSITORY_SCOUT
TECHNOLOGY_RESEARCH
BUG_REPRODUCTION
ARCHITECTURE_DISCOVERY
DEPENDENCY_ANALYSIS
OPERABILITY_INSPECTION
```

## 6.7.3 Responsabilidades

- responder pergunta delimitada;
- buscar fontes;
- distinguir fato de inferência;
- registrar evidence refs;
- reportar unknowns;
- evitar solução prematura.

## 6.7.4 Pode

- ler código;
- executar comandos read-only;
- rodar reproduções autorizadas;
- consultar documentação;
- produzir mapas;
- sugerir opções.

## 6.7.5 Não pode

- implementar por padrão;
- alterar contrato;
- aceitar risco;
- modificar state;
- extrapolar sem marcar inference;
- esconder falta de evidência.

## 6.7.6 Termination condition

Toda Investigation Track precisa de:

- pergunta;
- budget;
- exit criteria.

Investigação não pode se tornar exploração indefinida.

---

# 6.8 Writer Worker

## 6.8.1 Definição

Writer Worker produz uma mudança dentro de uma Write Track.

## 6.8.2 Responsabilidades

- validar dispatch packet;
- validar contract hash;
- trabalhar no cwd correto;
- respeitar write-set;
- seguir Golden Path;
- cumprir Engineering Standards;
- executar verificações locais;
- preservar evidência;
- escalar bloqueios;
- emitir Claim.

## 6.8.3 Pode decidir

Somente decisões locais compatíveis com o contrato.

Exemplos:

- nome de função;
- organização interna;
- helper local;
- ordem de pequenos passos;
- refactor necessário dentro do escopo.

## 6.8.4 Precisa escalar

- escrita fora do write-set;
- nova dependência;
- mudança de contrato;
- mudança de schema não planejada;
- scope expansion;
- risco não previsto;
- impossibilidade técnica;
- conflito de ownership;
- ambiente incorreto;
- regra `MUST` incompatível;
- necessidade de Waiver.

## 6.8.5 Nunca pode

- aceitar o próprio Claim;
- fechar Feature;
- fechar Milestone;
- alterar Approved Contract;
- editar SQLite;
- liberar Lease por conta própria;
- fazer push;
- fazer deploy;
- ocultar teste não executado;
- reportar assumption como pass;
- substituir integração real por mock escondido.

## 6.8.6 Completion protocol

Worker termina sua responsabilidade quando:

- código está identificável;
- evidence refs existem;
- Claim foi registrado;
- status `COMPLETED_BY_WORKER` foi aceito pelo MNFS.

Ele pode permanecer `IDLE` e addressable para Correction.

---

# 6.9 Reviewer

## 6.9.1 Definição

Reviewer realiza julgamento independente sobre trabalho produzido.

## 6.9.2 Independência

Reviewer não pode ser:

- o mesmo Worker Run;
- a mesma Session que implementou;
- o Lead quando o Lead implementou o diff;
- um contexto contaminado por defesa da solução.

## 6.9.3 Responsabilidades

- verificar arquitetura;
- verificar correção;
- verificar simplicidade;
- verificar testes;
- verificar contracts;
- confirmar findings;
- registrar receipts de investigação;
- emitir Verdict dentro do escopo.

## 6.9.4 Pode

- expandir reads para confirmar;
- abrir Finding;
- aprovar;
- rejeitar;
- bloquear;
- marcar speculative;
- pedir evidência adicional.

## 6.9.5 Não pode

- implementar correção;
- gerar novo escopo;
- mudar Acceptance Criterion;
- escolher preferência pessoal como regra;
- bloquear por estilo mecânico;
- aceitar operação de produto;
- resolver finding sem nova evidência.

## 6.9.6 Review authority

Reviewer decide somente o target atribuído:

```text
Claim
Feature
Milestone
Integration Run
```

O Verdict não ultrapassa esse target.

---

# 6.10 Verification Runner

## 6.10.1 Definição

Verification Runner executa checks determinísticos.

## 6.10.2 Natureza

É uma autoridade mecânica, não uma persona.

## 6.10.3 Responsabilidades

- executar comando exato;
- usar cwd correto;
- fixar environment;
- capturar output;
- produzir Receipt;
- reportar timeout;
- preservar SHA;
- mapear resultado.

## 6.10.4 Não pode

- interpretar arquitetura;
- aceitar risco;
- ignorar failure;
- mudar comando;
- corrigir código;
- inventar fallback;
- converter unknown em pass.

## 6.10.5 Deterministic authority

Quando um Standard possui check confiável:

```text
runner result
→ autoridade sobre aquela propriedade específica
```

Reviewer não pode invalidar arbitrariamente um pass mecânico.

Pode contestar:

- applicability;
- qualidade do check;
- cobertura;
- staleness;
- binding incorreto.

---

# 6.11 Integrator

## 6.11.1 Definição

Integrator compõe Write Tracks aceitas.

## 6.11.2 Responsabilidades

- preparar workspace limpo;
- verificar base;
- aplicar Tracks;
- registrar ordem;
- resolver conflitos autorizados;
- executar checks compostos;
- produzir candidate SHA;
- preservar sources.

## 6.11.3 Pode

- escolher ordem dentro da política;
- resolver conflito mecânico;
- rejeitar Track incompatível;
- abrir Finding de composição;
- exigir Rebase.

## 6.11.4 Não pode

- redefinir comportamento;
- modificar contrato;
- mascarar conflito;
- realizar refactor amplo;
- corrigir Feature sem Correction;
- destruir worktree de origem;
- integrar Track não aceita.

## 6.11.5 Conflict classes

### Mechanical conflict

Pode ser resolvido pelo Integrator quando:

- intenção é inequívoca;
- não altera comportamento;
- policy permite;
- diff é pequeno;
- verificação cobre.

### Semantic conflict

Precisa retornar para:

- Lead;
- Worker;
- Planner;
- Operator.

---

# 6.12 QA Actor

## 6.12.1 Definição

QA Actor valida comportamento como usuário, operador ou consumidor.

## 6.12.2 Responsabilidades

- seguir Journey;
- observar comportamento;
- registrar evidência;
- não presumir implementação;
- capturar falhas;
- emitir resultado.

## 6.12.3 Pode

- usar browser;
- usar API;
- operar ambiente;
- observar logs relevantes;
- registrar screenshots e traces;
- abrir Finding.

## 6.12.4 Não pode

- corrigir durante a mesma passagem;
- ler primeiro a justificativa do implementador;
- aprovar por aparência do código;
- substituir Journey real por mock;
- alterar critérios;
- aceitar risk.

## 6.12.5 Freshness

QA Journey sempre se vincula ao candidate SHA e ao ambiente.

Novo SHA material invalida o resultado afetado.

---

# 6.13 Engineering System Maintainer

## 6.13.1 Definição

Papel responsável por evoluir Standards, Golden Paths e Fitness Functions.

Inicialmente pode ser exercido pelo Lead com aprovação do Operator.

## 6.13.2 Responsabilidades

- analisar Findings recorrentes;
- propor Standards;
- pilotar checks;
- medir falsos positivos;
- evoluir Golden Paths;
- deprecar regras;
- acompanhar Waivers;
- atualizar Quality Posture.

## 6.13.3 Não pode

- transformar preferência em `MUST`;
- criar gate sem failure mode;
- aplicar regra retroativamente sem migração;
- esconder custo;
- ignorar bypasses;
- manter Standard sem owner ou rationale.

---

# 6.14 Model e Provider Resolver

## 6.14.1 Definição

Componente de policy que escolhe runtime, provider, modelo e effort adequados.

Não é uma autoridade de produto.

## 6.14.2 Inputs

- Role;
- risk;
- complexity;
- context size;
- tool requirements;
- budget;
- provider availability;
- prior performance.

## 6.14.3 Output

```text
runtime
provider
model
effort
limits
fallbacks
```

## 6.14.4 Regras

- nenhuma matriz fixa de modelos na Constitution;
- effort explícito quando suportado;
- fallback preserva Role e gate;
- modelo indisponível não reduz qualidade silenciosamente;
- trocar provider não altera autoridade.

---

# 6.15 Modelo de autonomia

Autonomia não é binária.

Cada ação possui um nível.

## 6.15.1 Nível A0 — Observe

Actor pode:

- ler;
- inspecionar;
- medir;
- reportar.

Não pode escrever.

Exemplos:

- Investigator;
- Reviewer read-only;
- status;
- architecture scan.

## 6.15.2 Nível A1 — Propose

Actor pode produzir:

- plano;
- opção;
- diff sugerido;
- Decision recommendation;
- Standard candidate.

Não pode aplicar.

## 6.15.3 Nível A2 — Execute Reversible

Actor pode executar ação reversível e isolada.

Exemplos:

- editar worktree;
- criar branch;
- rodar testes;
- gerar artefato;
- iniciar worker;
- abrir Claim.

## 6.15.4 Nível A3 — Advance Governed State

Actor pode alterar estado MNFS quando preconditions mecânicas são satisfeitas.

Exemplos:

- salvar Plan Revision;
- ativar Lease;
- marcar Claim under verification;
- registrar Receipt;
- aceitar deterministic criterion.

Essa autoridade normalmente pertence a Application Services.

## 6.15.5 Nível A4 — Approve Material Change

Exige autoridade de Lead, Gate ou Operator.

Exemplos:

- aceitar Claim;
- aprovar Plan;
- aceitar Waiver;
- fechar Feature;
- aceitar Integration Run.

## 6.15.6 Nível A5 — Irreversible / External Impact

Exige checkpoint explícito adequado.

Exemplos:

- push;
- deploy;
- produção;
- exclusão;
- migration destrutiva;
- envio externo;
- gasto relevante;
- mudança de contrato público.

## 6.15.7 Regra

O Role define o teto.

A Mission e o Repository Profile podem reduzir esse teto.

Nunca aumentar silenciosamente.

---

# 6.16 Autonomia por risco

## Baixo risco

MNFS pode:

- planejar lane mínima;
- executar worker;
- rodar checks;
- aceitar deterministic criteria;
- fechar Feature local;
- preparar integração.

Operator é chamado somente para:

- produto;
- irreversibilidade;
- exceção.

## Médio risco

Exige:

- review independente;
- Acceptance Criteria claros;
- evidência;
- Lead acompanha;
- Operator em trade-offs materiais.

## Alto risco

Exige:

- Planning aprofundado;
- decisões explícitas;
- gate independente;
- QA;
- safety nets;
- checkpoints humanos;
- delivery controlado.

## Unknown

Default conservador temporário.

A investigação deve reduzir unknown.

---

# 6.17 Modelo de decisões

## 6.17.1 D0 — Mechanical

Decisão totalmente determinística.

Exemplo:

```text
schema inválido
→ rejeitar
```

Authority:

```text
MNFS Core / Runner
```

## 6.17.2 D1 — Local Implementation

Não altera contrato.

Exemplos:

- nome interno;
- helper;
- pequena estrutura;
- algoritmo equivalente.

Authority:

```text
Writer Worker
```

## 6.17.3 D2 — Execution Coordination

Altera ordem ou estratégia operacional sem alterar outcome.

Exemplos:

- reusar worktree;
- trocar Worker Run;
- serializar Track;
- executar investigation;
- elevar review.

Authority:

```text
MNFS Lead
```

## 6.17.4 D3 — Engineering Trade-off

Escolha arquitetural dentro do escopo aprovado.

Exemplos:

- usar alternativa técnica;
- criar adapter;
- alterar internal contract;
- aceitar complexidade adicional.

Authority:

```text
Lead
+
Operator quando material
+
ADR quando durável
```

## 6.17.5 D4 — Product / Contract

Altera:

- behavior;
- escopo;
- Acceptance Criterion;
- contrato público;
- user journey;
- risco aceito.

Authority:

```text
Operator
```

## 6.17.6 D5 — Irreversible / External

Produz impacto externo difícil de reverter.

Authority:

```text
Operator ou autoridade configurada
```

---

# 6.18 Decision Request Contract

Toda Decision Request possui:

```ts
interface DecisionRequest {
  id: DecisionId;
  level: 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
  question: string;
  contextRefs: ArtifactRef[];
  options: DecisionOption[];
  recommendation?: string;
  impact: string[];
  risk: string[];
  blocks: EntityReference[];
  requiredAuthority: ActorRole;
  defaultAction: 'PAUSE' | 'BLOCK' | 'USE_SAFE_DEFAULT' | 'CANCEL';
}
```

## 6.18.1 Boa solicitação

```text
Precisamos escolher como versionar o endpoint público.

A. Criar /v2 agora
   Impacto: novo client e documentação.
   Risco: baixo para consumers atuais.

B. Alterar /v1
   Impacto: quebra clients existentes.
   Risco: alto.

Recomendação: A.
Bloqueia: MIS-010/M02/F03.
```

## 6.18.2 Solicitação inválida

```text
Qual abordagem você prefere?
```

Sem:

- contexto;
- opções;
- impacto;
- recomendação;
- blocker.

---

# 6.19 Escalation Flow

```text
Actor encontra bloqueio
        ↓
classifica Decision Level
        ↓
persiste Decision Request
        ↓
entidades afetadas ficam BLOCKED
        ↓
Lead recebe notificação
        ↓
Lead resolve D1/D2
ou
Operator resolve D3/D4/D5 conforme policy
        ↓
Decision registrada
        ↓
Context Packs afetados ficam stale
        ↓
retomada ou Replan
```

## 6.19.1 Regra de bloqueio

Somente entidades afetadas são bloqueadas.

Tracks independentes continuam.

## 6.19.2 Timeout

Decision humana não expira automaticamente.

Status mostra:

- idade;
- impacto;
- blocked entities;
- next action.

---

# 6.20 Authority Matrix

| Ação | Worker | Reviewer | Runner | Integrator | Lead | Operator |
|---|---:|---:|---:|---:|---:|---:|
| Ler contrato | Sim | Sim | Sim | Sim | Sim | Sim |
| Alterar isolated mutable workspace | Sim | Não | Não | Só integração | Limitado | Não |
| Criar Claim | Solicita | Não | Não | Não | Pode coordenar | Não |
| Produzir Receipt | Não autoritativo | Não | Sim | Sim para integração | Não | Não |
| Abrir Finding | Pode reportar | Sim | Sim mecânico | Sim | Sim | Sim |
| Aceitar Claim | Não | Pode recomendar | Só critério mecânico | Não | Conforme gate | Não diretamente |
| Alterar contrato | Não | Não | Não | Não | Propõe | Aprova |
| Criar Waiver | Propõe | Propõe | Não | Propõe | Propõe | Aprova quando exigido |
| Fazer merge | Não | Não | Não | Prepara | Autoriza/executa conforme profile | Pode exigir checkpoint |
| Fazer deploy | Não | Não | Não | Não | Solicita | Autoriza |
| Fechar Feature | Não | Não | Não | Não | Via MNFS gate | Pode intervir |
| Fechar Mission | Não | Não | Não | Não | Prepara | Autoriza quando exigido |
| Cancelar Mission | Não | Não | Não | Não | Recomenda | Sim |

---

# 6.21 Separation of Duties

## 6.21.1 Implementer ≠ Reviewer

Obrigatório quando julgamento independente é parte do gate.

## 6.21.2 Planner ≠ Approver

Planner propõe.

Operator aprova o contrato.

## 6.21.3 Worker ≠ Gate

Worker Claims.

MNFS verifica.

## 6.21.4 Integrator ≠ Feature Implementer

Integrator não corrige semanticamente.

## 6.21.5 QA ≠ Corrector

QA observa.

Correction é outro ciclo.

## 6.21.6 Runner ≠ Policy Author

Runner executa bindings.

Standards e applicability vêm do Engineering System.

---

# 6.22 Bounded Delegation

Toda delegação possui:

```text
role
target
allowed actions
forbidden actions
inputs
outputs
budget
termination condition
escalation path
```

Exemplo:

```text
Role: Writer Worker
Target: MIS-010/M02/F03 / WT-004
Allowed: editar src/api/** e tests/api/**
Forbidden: migrations/**, push, contract changes
Output: Claim + commit
Budget: 45 min / configured token budget
Escalation: MNFS Lead
```

## 6.22.1 Regra

Prompt genérico como:

> “Implemente esta Feature e faça o que for necessário”

é inválido para dispatch.

---

# 6.23 Capability Tokens conceituais

MNFS pode representar autorização como capabilities estruturadas.

Exemplos:

```text
READ_REPOSITORY
WRITE_TRACK
RUN_TESTS
OPEN_CLAIM
REQUEST_DECISION
APPLY_INTEGRATION
USE_BROWSER
USE_NETWORK_READ
USE_PROVIDER_SANDBOX
REQUEST_CREDENTIAL
REQUEST_EXTERNAL_EFFECT
EXECUTE_APPROVED_EFFECT
```

No MVP local, isso pode ser policy, não sandbox real.

No cloud, capabilities poderão se tornar enforcement técnico.

---

# 6.24 Human Checkpoints

## Obrigatórios quando aplicável

- contrato aprovado;
- scope change;
- breaking API;
- migration destrutiva;
- production access;
- gasto relevante;
- data export;
- security waiver;
- accepted risk;
- Mission cancellation;
- incomplete closeout.

## Não obrigatórios por default

- retry local;
- escolha de worker;
- execução de testes;
- criação de worktree;
- correção pequena;
- review adicional;
- integração local reversível.

O objetivo é preservar soberania humana sem transformar o Operator em scheduler.

---

# 6.25 Model Independence

Role não é modelo.

```text
Writer Worker
≠ GPT específico

Reviewer
≠ Claude específico

Planner
≠ modelo frontier específico
```

## Regras

- modelo é binding;
- provider é binding;
- effort é binding;
- authority vem do Role;
- fallback preserva o mesmo contrato;
- troca de modelo é registrada quando relevante;
- políticas podem evoluir com telemetria.

---

# 6.26 Política de memória por Role

| Role | Session Observational Memory | Política inicial |
|---|---|---|
| MNFS Lead | Candidata | habilitar somente após Architecture Spike |
| Planner | Opcional | apenas dentro da mesma fase de Planning |
| Investigator | Desligada por default | produzir Artifact e encerrar |
| Writer Worker | Desligada por default | Context Pack bounded é a fonte |
| Long-running Writer | Condicional | somente para Track longa e isolada |
| Reviewer — primeiro pass | Desligada | preservar independência |
| Reviewer — remedy pass | Reuso da mesma Session | somente mesmo Finding e delta limitado |
| Integrator | Desligada | execução curta e determinística |
| QA Actor | Desligada/fresh | evitar implementation bias |
| Closeout Actor | Opcional | agregação estruturada domina |

Nunca compartilhar a mesma memória observacional entre Lead e Writer, Workers paralelos, Writer e Reviewer, Reviewer e QA ou Missions diferentes.

Memória observacional é contexto `SUPPORTING`.

Não concede Authority nem Permission.

# 6.28 Session Lifecycle

## Lead Session

Pode ser longa, mas é descartável.

Rotação permitida por:

- Milestone;
- contexto;
- falha;
- atualização;
- solicitação do Operator.

## Worker Session

Pode permanecer após Claim para Correction.

Estado:

```text
ACTIVE
IDLE_ADDRESSABLE
RELEASED
LOST
```

## Reviewer Session

Round inicial deve ser independente.

Remedy re-review pode reutilizar contexto quando:

- é o mesmo Finding;
- é o mesmo target;
- o delta é limitado;
- policy permite.

## QA Session

Fresh por Journey decisiva, salvo continuação operacional controlada.

---

# 6.28 Failure of Authority

## Unauthorized action

Se Actor tenta ação fora da autoridade:

```text
AUTHORITY_DENIED
```

Sem mudança de estado.

## Permission exists, authority absent

Exemplo:

Worker consegue executar `git push`, mas não está autorizado.

A Harness deve:

- evitar fornecer a capability;
- detectar quando possível;
- registrar violation;
- bloquear aceite.

## Authority exists, environment unavailable

Exemplo:

Operator aprovou deploy, mas credentials ausentes.

Resultado:

```text
BLOCKED
```

Não:

```text
APPROVED_AND_DONE
```

---

# 6.29 Emergency Override

## 6.28.1 Propósito

Permitir intervenção quando a Harness bloqueia incorretamente ou uma emergência exige avanço.

## 6.28.2 Authority

Operator.

## 6.28.3 Conteúdo

```text
target
blocked rule
reason
scope
temporary controls
expected repair
expires
```

## 6.28.4 Regra

Override:

- não apaga evidência;
- não finge que gate passou;
- não é permanente;
- aparece no closeout;
- pode gerar Standard correction.

---

# 6.30 Autonomy Budget

Além de tokens e tempo, uma execução possui orçamento de autonomia.

Pode limitar:

- número de Attempts;
- número de arquivos;
- duração;
- tool calls;
- external writes;
- review rounds;
- retries;
- decisões locais;
- scope expansion.

Exemplo:

```json
{
  "maxAttempts": 2,
  "maxFiles": 8,
  "externalWrites": false,
  "allowDependencyChange": false,
  "allowSchemaChange": false,
  "operatorCheckpointOn": [
    "breaking-contract",
    "destructive-migration"
  ]
}
```

Budget excedido não implica failure técnico.

Implica:

```text
BLOCKED
→ Lead ou Operator decide
```

---

# 6.31 Operator Experience

O Operator deve receber:

## Status

```text
MIS-010 executing
3/7 Features closed
2 Tracks active
1 Claim awaiting review
1 Decision blocking M03
next: approve DEC-004
```

## Decision

Curta, estruturada e recomendada.

## Completion

```text
Outcome
What changed
What was verified
What remains
Risks
Evidence
Delivery
```

## Nunca receber por default

- transcript integral;
- logs completos;
- raciocínio interno;
- mensagens de cada worker;
- detalhes mecânicos irrelevantes;
- decisões já cobertas por policy.

---

# 6.32 Role Contracts como código e artefato

Cada Role deve possuir:

- schema de input;
- schema de output;
- allowed actions;
- forbidden actions;
- error model;
- escalation path;
- evidence requirements.

Parte será código.

Parte será skill ou template.

Exemplo:

```text
Writer Worker Contract
├── dispatch schema
├── Context Pack
├── Claim schema
├── authority policy
├── runtime skill/template
└── process adapter
```

A skill explica.

A policy limita.

O schema valida.

O Application Service autoriza.

---

# 6.33 Non-goals do modelo de autonomia

Não construir agora:

- RBAC multiuser completo;
- OAuth próprio;
- sandbox de capability;
- permission broker;
- policy engine externo;
- aprovação por múltiplas pessoas;
- organization hierarchy;
- compliance workflow;
- autonomous product decisions;
- swarm democrático;
- votação entre modelos;
- authority baseada em confidence score;
- agentes negociando diretamente com o Operator.

---

# 6.34 Invariantes de autoridade

1. Capacidade de raciocínio não concede autoridade.
2. Operator é autoridade final de produto e risco.
3. Lead é liaison único.
4. Workers não falam diretamente com o Operator por default.
5. Worker não aceita o próprio Claim.
6. Planner não aprova o próprio contrato.
7. Reviewer não corrige no mesmo ciclo.
8. QA não corrige durante a Journey.
9. Runner não faz julgamento.
10. Integrator não redefine comportamento.
11. Role é independente de modelo.
12. Session é descartável.
13. Permission técnica não implica Authority.
14. Ação fora de autoridade falha sem mudança de estado.
15. Decision material é persistida.
16. Pergunta ao Operator contém opções e recomendação.
17. Apenas entidades afetadas bloqueiam.
18. Override é auditável e temporário.
19. Autonomy Budget é explícito.
20. Nenhum Actor pode ampliar o próprio poder.

---

# Decisão resumida da Seção 6

> **O MNFS separa rigorosamente Actor, Role, Session, Process, Permission e Authority. O Operator mantém soberania sobre produto, contrato, risco e ações irreversíveis; o MNFS Lead é o único liaison e coordena a Mission; Planners propõem; Investigators produzem fatos; Writer Workers implementam e emitem Claims; Runners produzem Receipts; Reviewers julgam; Integrators compõem; QA Actors validam como usuário. Autonomia é concedida por nível, escopo e budget, nunca inferida da capacidade do modelo.**

---
