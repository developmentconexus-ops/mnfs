---
id: DOC-PRODUCT-BLUEPRINT-04
title: Engineering System e Evolução para Software Factory
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
  - product blueprint section 4
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-07
tracking_issue: 6
---

## ARR-RECONCILIATION-2026-08-07 — Capability-first sourcing

The body below is reconciled to D-011 through D-016 and ADR-0013 through ADR-0015. Vendor-specific material is normative only when a later selecting Decision explicitly says so; sections labeled Historical / Incumbent Evidence are reference evidence, not current provider selection.

Material realization uses the canonical vocabulary:

`OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT`.

MNFS owns differentiated semantics and authority. Commodity machinery is adopted/adapted when a replaceable substrate eliminates meaningful machinery without becoming a second source of truth. Prefer the lowest sufficient upstream layer, one primary production substrate per concern and a concrete implementation until a second real consumer earns a generic abstraction.

Engineering Standards, applicability, Waivers, Golden Paths and proof ownership remain MNFS semantics; repository-native linters, scanners, typecheckers and other mature tools remain replaceable machinery behind those semantics.

---

# 4. Engineering System e Evolução para Software Factory

## 4.1 Por que esta camada é necessária

Até esta seção, o MNFS define com profundidade:

- como o operador expressa intenção;
- como uma Mission é planejada;
- como o contrato é aprovado;
- como workers são isolados;
- como Claims, Receipts e Verdicts governam qualidade;
- como trabalho é integrado;
- como QA e recovery fecham ciclos.

Isso resolve a governança do **trabalho**.

Ainda falta governar a forma como o **software produzido** deve ser estruturado e operar.

Sem essa camada, dois workers podem cumprir os critérios locais de suas Features e ainda produzir:

- APIs incompatíveis;
- contratos duplicados;
- fronteiras arquiteturais quebradas;
- migrations inseguras;
- frontend acoplado a detalhes internos do backend;
- observabilidade inconsistente;
- tratamento de erros divergente;
- testes que provam mocks, não comportamento;
- novas abstrações sem necessidade;
- implementações diferentes para o mesmo problema recorrente.

Uma Harness confiável precisa responder a duas perguntas distintas:

```text
1. O que deve ser construído e como o trabalho avança?
2. Quais propriedades o software construído precisa preservar?
```

O Product Lifecycle responde à primeira.

O Engineering System responde à segunda.

---

## 4.2 De Harness para Software Factory

O termo **software factory** não significa uma máquina que gera qualquer aplicação automaticamente.

No MNFS, Software Factory significa:

> Um sistema de produção de software que transforma conhecimento de engenharia em caminhos repetíveis, controles executáveis, feedback rápido e melhoria contínua.

A evolução conceitual é:

```text
Coding Agent
→ produz código

Harness
→ coordena planejamento, execução e verificação

Engineering System
→ define como software válido deve ser construído

Software Factory
→ combina Harness + Engineering System + Golden Paths + feedback + melhoria contínua
```

A fábrica não substitui julgamento.

Ela remove decisões repetitivas, torna invariantes mecânicos e reserva atenção humana ou de modelos fortes para o que realmente exige análise.

A experiência desejada é:

```text
Feature classificada
        ↓
Golden Path aplicável é selecionado
        ↓
contratos e templates corretos são fornecidos
        ↓
worker implementa dentro de fronteiras conhecidas
        ↓
fitness functions e guardrails executam
        ↓
review julga somente o que a máquina não decidiu
        ↓
evidência atualiza a Quality Posture do repositório
```

---

## 4.3 Dois eixos do MNFS

O MNFS possui dois eixos complementares.

## 4.3.1 Work Governance

Governa:

- Mission;
- Milestone;
- Feature;
- Write Track;
- Attempt;
- Worker Run;
- Claim;
- Receipt;
- Verdict;
- Integration Run;
- QA Journey;
- closeout.

Pergunta central:

> O trabalho está corretamente definido, executado e comprovado?

## 4.3.2 Engineering Governance

Governa:

- arquitetura;
- contracts;
- APIs;
- dados;
- migrations;
- integrações;
- segurança;
- observabilidade;
- resiliência;
- testes;
- delivery;
- operabilidade;
- manutenibilidade;
- experiência do usuário.

Pergunta central:

> O software produzido preserva as propriedades exigidas por este sistema?

## 4.3.3 Interseção

Toda Feature é governada pelos dois eixos:

```text
Feature Contract
+
Applicable Engineering Standards
+
Selected Golden Path
+
Verification Plan
```

Critérios de aceitação dizem **o que precisa ser verdadeiro**.

Engineering Standards dizem **quais propriedades não podem ser perdidas durante a implementação**.

Golden Paths dizem **qual é a maneira preferencial de chegar ao resultado**.

Guardrails dizem **o que não pode passar**.

Safety Nets dizem **como recuperar quando algo falha**.

---

# 4.4 Taxonomia de controles

O MNFS adota quatro formas principais de controle.

## 4.4.1 Golden Path — orientar

Golden Path torna a opção recomendada:

- fácil de descobrir;
- fácil de iniciar;
- completa;
- segura por padrão;
- integrada aos checks;
- adaptável quando necessário.

Ele não existe para bloquear alternativas.

Existe para evitar que cada worker reinvente:

- estrutura;
- contratos;
- error handling;
- testes;
- observabilidade;
- delivery.

Exemplo:

```text
Golden Path: adicionar endpoint HTTP

1. declarar ou atualizar contrato;
2. validar compatibilidade;
3. implementar provider;
4. atualizar consumer tipado;
5. adicionar auth e error contract;
6. executar contract tests;
7. executar integração;
8. atualizar documentação;
9. validar jornada aplicável.
```

## 4.4.2 Guardrail — impedir

Guardrail bloqueia uma condição considerada inaceitável.

Exemplos:

- dependência de camada proibida;
- migration destrutiva sem aprovação;
- endpoint público sem contrato;
- segredo versionado;
- fallback stubado num fluxo live;
- acesso cross-tenant sem boundary;
- Claim aceito com Receipt stale.

Guardrails devem ser poucos, claros e ligados a riscos reais.

## 4.4.3 Safety Net — recuperar

Safety Net reduz o impacto de uma falha.

Exemplos:

- rollback;
- backup;
- feature flag;
- retry idempotente;
- reconcile;
- migration expand/contract;
- release gradual;
- isolated mutable workspace preservado após integração falha.

Safety Net não justifica ignorar qualidade.

Ela reconhece que falhas ainda ocorrerão.

## 4.4.4 Manual Checkpoint — julgar

Checkpoint humano ou de autoridade especializada é usado quando:

- a decisão é irreversível;
- há risco de produto;
- escopo muda;
- contrato público quebra;
- segurança ou privacidade exigem aceitação;
- duas alternativas válidas possuem trade-offs;
- automação não possui evidência suficiente.

O MNFS não deve transformar preferência subjetiva em guardrail mecânico.

---

# 4.5 Hierarquia do Engineering System

O sistema possui quatro níveis.

```text
MNFS Engineering Constitution
        ↓
Capability Standards
        ↓
Repository Profile
        ↓
Mission Applicability
```

## 4.5.1 MNFS Engineering Constitution

Conjunto pequeno de princípios universais para software produzido pelo MNFS.

Exemplos:

- mudanças possuem critérios de aceitação;
- boundaries validam dados externos;
- integração real não é provada por fallback escondido;
- erros não são convertidos silenciosamente em sucesso;
- decisões irreversíveis exigem autoridade adequada;
- observabilidade não pode depender apenas de texto humano;
- teste precisa provar comportamento relevante;
- trabalho novo não pode reduzir silenciosamente a saúde global do código.

A Constitution deve permanecer pequena.

Ela não define:

- framework web;
- banco;
- estilo de pasta;
- biblioteca de validação;
- formato de API;
- estratégia de deploy universal.

## 4.5.2 Capability Standards

Padrões reutilizáveis por domínio de engenharia.

Exemplos:

```text
API-001 — API contract ownership
DATA-001 — migration safety
ARCH-001 — dependency direction
TEST-001 — regression proof
SEC-001 — authorization boundary
OBS-001 — structured operational signals
UI-001 — loading/error/empty states
```

Um padrão pode ser aplicável a muitos repositórios, mas não é automaticamente ativado em todos.

## 4.5.3 Repository Profile

O Repository Profile escolhe e concretiza os padrões para um produto.

Ele define:

- quais capabilities existem;
- quais standards se aplicam;
- quais ferramentas implementam cada check;
- quais Golden Paths estão disponíveis;
- quais comandos executam cada lane;
- quais exceções estão vigentes;
- quais ambientes provam critérios live;
- quais padrões são `RATIFIED`, `ASSUMED`, `OPEN` ou `DEPRECATED`.

Exemplo:

```text
API-001
status: RATIFIED
contract source: api/openapi.yaml
compatibility check: npm run api:breaking
client generation: npm run api:client
provider verification: npm run test:contract
```

## 4.5.4 Mission Applicability

A Mission não redefine padrões.

Ela declara:

- quais standards são acionados;
- quais Golden Paths são usados;
- quais regras não se aplicam;
- quais Waivers foram aprovadas;
- quais critérios provam conformidade.

---

# 4.6 Engineering Standard

## 4.6.1 Definição

Engineering Standard é uma regra normativa sobre uma propriedade do software ou do processo de engenharia.

## 4.6.2 Estrutura conceitual

```ts
interface EngineeringStandard {
  id: string;
  version: number;
  domain: EngineeringDomain;
  title: string;
  statement: string;
  level: 'MUST' | 'SHOULD' | 'MAY';
  status: 'CANDIDATE' | 'RATIFIED' | 'ENFORCED' | 'DEPRECATED';
  applicability: ApplicabilityRule;
  rationaleRef: string;
  enforcement: EnforcementBinding[];
  requiredEvidence: EvidenceRequirement[];
  exceptionPolicy: ExceptionPolicy;
}
```

## 4.6.3 Níveis normativos

### MUST

Invariante bloqueante quando aplicável.

Violação exige:

- correção;
- Waiver;
- ou mudança do Standard.

### SHOULD

Caminho recomendado.

Desvio exige razão registrada quando material, mas não bloqueia automaticamente.

### MAY

Opção suportada.

Não cria obrigação.

## 4.6.4 Status do Standard

### CANDIDATE

Hipótese ainda não comprovada.

Pode gerar observação, não gate.

### RATIFIED

Foi aceita como regra válida.

Ainda pode não possuir enforcement completo.

### ENFORCED

Possui check confiável e pode bloquear conforme o nível.

### DEPRECATED

Foi substituída ou deixou de ser aplicável.

## 4.6.5 Regra de promoção

Um Standard não deve nascer como gate forte apenas porque parece uma boa prática.

Fluxo:

```text
finding ou necessidade recorrente
→ candidate
→ piloto
→ falsos positivos avaliados
→ ratificação
→ enforcement
```

---

# 4.7 Modos de enforcement

Uma regra pode ser implementada por um ou mais modos.

| Modo | Função | Exemplo |
|---|---|---|
| `DOCUMENT` | explicar | rationale e exemplos |
| `PROMPT` | orientar julgamento | rubrica de review |
| `SCAFFOLD` | gerar caminho correto | template de endpoint |
| `LINT` | detectar padrão estático | import proibido |
| `TEST` | provar comportamento | contract test |
| `GATE` | bloquear avanço | breaking API change |
| `OBSERVE` | medir sem bloquear | tamanho de arquivo |
| `REPAIR` | corrigir com segurança | formatter |
| `CHECKPOINT` | pedir decisão | migration destrutiva |

A regra code-first não significa que todo Standard precisa de lint.

Significa que, quando uma propriedade pode ser decidida mecanicamente com confiança, ela não deve depender somente de uma frase numa skill.

---

# 4.8 Catálogo de domínios de engenharia

O catálogo inicial precisa cobrir as superfícies abaixo.

Ele não precisa implementar todos os Standards imediatamente.

## 4.8.1 Architecture

- module boundaries;
- layer direction;
- cycles;
- composition roots;
- dependency ownership;
- cross-domain access;
- public versus internal interfaces;
- generated versus authored code.

## 4.8.2 API e Contracts

- fonte de verdade;
- schemas;
- versionamento;
- compatibilidade;
- error envelope;
- auth;
- pagination;
- idempotency;
- generated clients;
- consumer/provider verification.

## 4.8.3 Data e Migrations

- schema ownership;
- migration ordering;
- forward/backward compatibility;
- backfill;
- destructive operations;
- rollback ou compensação;
- data validation;
- transactional boundaries;
- indexes e constraints.

## 4.8.4 Frontend e Backend Integration

- typed boundary;
- loading/error/empty states;
- stale data;
- retries;
- authorization visibility;
- feature flags;
- schema drift;
- user-level proof.

## 4.8.5 Testing e Verification

- regression proof;
- unit boundaries;
- integration tests;
- contract tests;
- migration tests;
- live QA;
- deterministic fixtures;
- test isolation;
- anti-test-theater.

## 4.8.6 Security e Privacy

- authentication;
- authorization;
- tenancy;
- secrets;
- sensitive logging;
- input validation;
- dependency provenance;
- destructive actions;
- auditability.

## 4.8.7 Reliability e Resilience

- timeout;
- retry;
- idempotency;
- circuit breaking quando necessário;
- graceful degradation;
- recovery;
- concurrency;
- cancellation;
- resource cleanup.

## 4.8.8 Observability

- structured logs;
- metrics;
- traces;
- correlation IDs;
- health checks;
- actionable errors;
- operational dashboards;
- audit events.

## 4.8.9 Configuration

- environment separation;
- secrets;
- defaults;
- validation;
- startup failure;
- feature flags;
- configuration ownership.

## 4.8.10 Delivery e Operations

- CI;
- build reproducibility;
- artifact identity;
- deployment;
- rollback;
- database rollout;
- release evidence;
- production verification.

## 4.8.11 Documentation e Operability

- architecture map;
- setup;
- commands;
- runbooks;
- API docs;
- migration notes;
- decision history;
- ownership;
- deprecation.

## 4.8.12 Code Health

- simplicity;
- duplication;
- naming;
- file/module size;
- dead code;
- dependency hygiene;
- generated artifacts;
- technical debt;
- garbage collection.

## 4.8.13 UX e Accessibility

Quando aplicável:

- keyboard use;
- accessibility;
- responsive behavior;
- error clarity;
- latency feedback;
- empty states;
- destructive confirmation;
- browser compatibility.

---

# 4.9 API Contract System

## 4.9.1 Objetivo

Impedir que backend, frontend e integrações desenvolvam interpretações divergentes da mesma API.

## 4.9.2 Fonte de verdade

O Repository Profile precisa declarar qual artefato governa o contrato.

Exemplos possíveis:

- OpenAPI;
- GraphQL schema;
- protobuf;
- AsyncAPI;
- typed in-process interface;
- provider SDK oficial.

O MNFS não impõe OpenAPI universalmente.

Quando uma API HTTP pública usa OpenAPI, a especificação fornece uma descrição independente de linguagem capaz de ser consumida por humanos e ferramentas para documentação, geração e testes.

## 4.9.3 Golden Path — adicionar ou alterar API

```text
1. identificar consumers;
2. alterar contrato primeiro ou junto da Feature;
3. validar schema;
4. avaliar breaking change;
5. gerar ou atualizar tipos/client;
6. implementar provider;
7. verificar auth e errors;
8. executar provider tests;
9. executar consumer contract tests;
10. integrar frontend/backend;
11. atualizar documentação;
12. executar QA aplicável.
```

## 4.9.4 Guardrails possíveis

- endpoint sem contrato;
- breaking change não aprovado;
- response fora do schema;
- consumer ad hoc ignorando client oficial;
- erro não documentado;
- campo sensível exposto;
- rota sem política de autorização;
- contrato alterado sem consumers identificados.

## 4.9.5 Contract tests

Consumer-driven contracts podem registrar as expectativas reais do consumer e verificar o provider contra essas interações.

Ferramentas como Pact são candidatas quando:

- múltiplos serviços ou equipes;
- deploys independentes;
- incompatibilidade é risco real;
- o custo da infraestrutura é justificado.

Não são dependência universal do MNFS.

## 4.9.6 Critérios de aceitação de API

Exemplos:

```text
Feature criterion
→ endpoint responde segundo o contrato

Milestone criterion
→ frontend e provider interoperam no fluxo completo

Mission criterion
→ consumidor final completa a jornada sem incompatibilidade
```

---

# 4.10 Data e Migration System

## 4.10.1 Objetivo

Garantir que mudanças de dados sejam:

- compatíveis;
- recuperáveis;
- observáveis;
- testáveis;
- coordenadas com código.

## 4.10.2 Golden Path — mudança de schema

```text
1. declarar objetivo e impacto;
2. mapear readers e writers;
3. classificar mudança aditiva ou destrutiva;
4. escolher estratégia de rollout;
5. criar migration;
6. criar ou ajustar constraints;
7. testar upgrade;
8. testar aplicação em estado anterior e novo quando necessário;
9. separar backfill quando o volume justificar;
10. validar rollback ou compensação;
11. integrar deploy order;
12. verificar dados após rollout.
```

## 4.10.3 Estratégias possíveis

O Profile pode adotar:

- expand/migrate/contract;
- dual read/write;
- shadow column;
- online migration;
- feature flag;
- maintenance window;
- backup + restore.

Nenhuma estratégia é universal.

## 4.10.4 Guardrails possíveis

- alteração destrutiva sem checkpoint;
- migration sem owner;
- schema alterado sem model/contract update;
- backfill pesado dentro de transaction de deploy;
- índice ausente em acesso crítico;
- migration não testada;
- código novo dependente de schema ainda não implantado.

## 4.10.5 Safety Nets

- backup;
- transaction;
- rollback;
- compensating migration;
- feature flag;
- deploy sequencing;
- reconciliation query.

---

# 4.11 Frontend–Backend Integration System

## 4.11.1 Objetivo

Evitar que frontend e backend fiquem individualmente verdes, mas não componham um produto funcional.

## 4.11.2 Propriedades esperadas

Quando aplicável:

- contrato compartilhado;
- client tipado;
- loading;
- empty;
- error;
- unauthorized;
- stale state;
- retry;
- cancellation;
- observability;
- user journey.

## 4.11.3 Golden Path — nova capability user-facing

```text
1. congelar contrato da interação;
2. definir estados da experiência;
3. implementar provider;
4. implementar client/adapter;
5. implementar UI;
6. testar consumer e provider;
7. executar integração real;
8. executar browser QA;
9. registrar evidência visual e operacional.
```

## 4.11.4 Integration honesty

Um seam live não pode ser considerado provado quando:

- composition root ainda usa stub;
- frontend usa fixture permanente;
- backend real não foi iniciado;
- auth foi bypassada;
- network failure nunca foi exercitada;
- contrato foi simulado, mas provider real não foi verificado.

Mocks permanecem úteis em testes localizados.

Eles não substituem a prova do seam real.

---

# 4.12 Testing e Verification System

## 4.12.1 Testes derivam de risco e critério

MNFS não deve impor uma pirâmide fixa para todo software.

O Verification Plan deriva de:

- Acceptance Criterion;
- failure mode;
- arquitetura;
- custo;
- risco;
- ambiente.

## 4.12.2 Portfólio de prova

| Tipo | Prova principal |
|---|---|
| Unit | regra local |
| Component | módulo com dependências controladas |
| Integration | interação real entre componentes |
| Contract | compatibilidade entre consumer e provider |
| Migration | evolução do estado de dados |
| End-to-end | jornada técnica completa |
| Live QA | experiência real de usuário ou operação |
| Static | propriedade estrutural |
| Review | julgamento arquitetural |

## 4.12.3 Anti-test-theater

Um teste é inadequado quando:

- apenas repete a implementação;
- valida o mock;
- não falha com o defeito que afirma prevenir;
- ignora erro relevante;
- não exercita o seam nomeado;
- possui assertion vaga;
- depende de timing frágil sem necessidade;
- passa sem a capability real estar conectada.

## 4.12.4 Regression proof

Bug fix precisa, quando possível, de:

```text
reprodução vermelha
→ correção
→ prova verde
```

Quando automação não é adequada, a Mission precisa de evidência alternativa explícita.

---

# 4.13 Architecture Fitness Functions

## 4.13.1 Definição

Fitness Function é um check contínuo sobre uma propriedade arquitetural.

Exemplos:

- direção de dependências;
- ausência de ciclos;
- tamanho máximo de módulo;
- boundary parsing;
- uso de logger estruturado;
- nenhum acesso direto cross-domain;
- adapters somente no composition root;
- APIs públicas documentadas;
- package privado não importado externamente.

## 4.13.2 Função no MNFS

```text
Architecture Standard
→ Fitness Function
→ Receipt
→ Gate ou Quality Posture
```

## 4.13.3 Implementações possíveis

- TypeScript AST;
- ESLint custom;
- dependency-cruiser;
- tests estruturais;
- ArchUnit em Java;
- Semgrep;
- custom scripts;
- database checks;
- schema diff.

ArchUnit, por exemplo, permite testar dependências entre packages, layers, slices e ciclos como testes normais em projetos Java.

A ferramenta é um detalhe do Profile.

## 4.13.4 Regras de qualidade

Fitness Function precisa:

- ser determinística;
- ter erro acionável;
- apontar regra e locus;
- evitar falsos positivos;
- possuir teste próprio;
- declarar custo;
- poder rodar na lane correta.

---

# 4.14 Golden Paths

## 4.14.1 Definição

Golden Path é uma composição versionada de:

- perguntas;
- decisões;
- templates;
- código inicial;
- contracts;
- checks;
- exemplos;
- gates;
- evidence expectations.

Ele é mais do que um template de arquivos.

É uma rota completa de produção.

## 4.14.2 Tipos iniciais candidatos

```text
GP-BUGFIX
GP-API-ENDPOINT
GP-UI-FEATURE
GP-DATABASE-MIGRATION
GP-EXTERNAL-INTEGRATION
GP-BACKGROUND-JOB
GP-REFACTOR
GP-NEW-SERVICE
GP-LIBRARY-UPGRADE
```

Não precisamos implementar todos agora.

## 4.14.3 Seleção

Planejamento classifica a Feature.

O MNFS sugere o Golden Path.

O operador ou Lead pode:

- aceitar;
- escolher alternativa;
- declarar `NOT_APPLICABLE`;
- pedir novo path.

## 4.14.4 Flexibilidade

Golden Path é recomendado, não prisão.

Uma alternativa é permitida quando:

- necessidade não é coberta;
- custo seria desproporcional;
- arquitetura exige outra rota;
- experimento foi autorizado.

Mas o desvio precisa preservar Standards `MUST`.

## 4.14.5 Evolução

Golden Paths nascem de:

- tarefas recorrentes;
- bugs repetidos;
- práticas já comprovadas;
- padrões manuais com alto custo;
- scaffolds do Repository Profile.

---

# 4.15 Guardrails

## 4.15.1 Critério de admissão

Um guardrail bloqueante precisa responder:

1. Qual falha concreta previne?
2. A regra é decidível mecanicamente?
3. Qual é o custo de falso positivo?
4. Existe mensagem de correção?
5. Em qual lane deve rodar?
6. Há política de exceção?

## 4.15.2 Onde rodar

### Pre-dispatch

- contrato ausente;
- Profile incompleto;
- Golden Path obrigatório não resolvido;
- base inválida.

### During implementation

- write-set;
- segredo;
- import proibido;
- schema inválido.

### Claim gate

- missing tests;
- stale hash;
- contract divergence.

### Integration gate

- composição;
- migration;
- API compatibility;
- runtime wiring.

### Delivery gate

- CI;
- release;
- production policy.

---

# 4.16 Safety Nets

Safety Nets pertencem ao desenho da capability.

Uma Feature que adiciona risco operacional pode precisar também adicionar:

- rollback;
- cleanup;
- replay;
- idempotency;
- backup;
- reconciliation;
- alerting;
- feature flag;
- kill switch.

O MNFS deve perguntar:

> Se esta mudança falhar depois do merge, como o sistema retorna a uma condição segura?

Nem toda Feature precisa de rollback complexo.

Toda Feature precisa ao menos classificar o impacto de falha.

---

# 4.17 Waivers e exceções

## 4.17.1 Por que existem

Regras absolutas sem exceção tendem a:

- bloquear trabalho legítimo;
- gerar hacks;
- incentivar bypass oculto;
- tornar a plataforma irrelevante.

## 4.17.2 Estrutura

```ts
interface Waiver {
  id: string;
  standardId: string;
  scope: EntityReference[];
  reason: string;
  approvedBy: string;
  compensatingControls: string[];
  createdAt: string;
  expiresAt?: string;
  removalCondition?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'CLOSED';
}
```

## 4.17.3 Regras

- Waiver nunca é implícita.
- `MUST` só é ignorado com autoridade adequada.
- Waiver precisa aparecer no Context Pack.
- Gate precisa reconhecer apenas Waiver válida.
- Closeout lista Waivers ativas.
- Expiração cria trabalho visível.
- Exceção recorrente indica Standard ruim ou Golden Path incompleto.

---

# 4.18 Quality Posture

## 4.18.1 Objetivo

Mostrar onde o repositório é confiável, incompleto ou desconhecido.

Não é uma pontuação para marketing.

## 4.18.2 Unidade

Pode ser calculada por:

- domínio;
- package;
- capability;
- Engineering Standard;
- Golden Path;
- ambiente.

## 4.18.3 Estados

```text
VERIFIED
PARTIAL
MISSING
NOT_APPLICABLE
UNKNOWN
```

## 4.18.4 Exemplos

```text
API contracts          VERIFIED
Migration rollback     PARTIAL
Browser QA             MISSING
Tenant isolation       VERIFIED
Observability          UNKNOWN
```

## 4.18.5 Atualização

Evidence Bundles e Findings alteram a postura.

Uma Mission pode:

- melhorar;
- manter;
- ou degradar conscientemente a postura.

Degradação exige Decision ou Waiver quando material.

---

# 4.19 Repository Bootstrap

Antes de execução generalizada, MNFS precisa entender o repositório.

## 4.19.1 Processo

```text
read-only scouts
→ detectar stack e arquitetura
→ executar comandos existentes
→ mapear contracts e seams
→ propor Repository Profile
→ entrevista curta com operador
→ ratificar mínimo necessário
```

## 4.19.2 Saída mínima

- commands;
- modules;
- architecture boundaries;
- environments;
- API contract sources;
- migration system;
- test lanes;
- live QA capability;
- external systems;
- Golden Paths disponíveis;
- Standards aplicáveis;
- sections `OPEN`.

## 4.19.3 Regra

Profile nasce magro.

Ele cresce por evidência de campo.

Não tentar documentar todo o repositório antes da primeira Mission.

---

# 4.20 Integração com Planning

Toda Feature planejada precisa declarar:

```text
engineering_domains
applicable_standards
selected_golden_path
verification_bindings
required_safety_nets
waivers
```

O Planner não precisa escolher ferramentas arbitrariamente.

Ele usa o Repository Profile.

## Checks adicionais de readiness

- standard applicability;
- Golden Path fit;
- policy satisfiability;
- exception validity;
- quality posture impact;
- safety-net coverage.

---

# 4.21 Integração com Context Packs

O worker recebe somente as regras aplicáveis.

Exemplo:

```text
Feature MIS-010/M02/F03
Golden Path: GP-API-ENDPOINT
Standards:
  API-001 MUST
  SEC-003 MUST
  TEST-002 MUST
  OBS-001 SHOULD
Fitness Functions:
  npm run api:check
  npm run boundaries
Waivers:
  none
```

Isso substitui:

- manual gigante;
- AGENTS.md monolítico;
- toda a documentação injetada em toda sessão.

O entry point permanece curto e progressivo.

---

# 4.22 Integração com Verification e Review

## Máquina primeiro

Fitness Functions e deterministic checks executam antes do review.

Reviewer não gasta contexto procurando:

- formatação;
- import proibido;
- schema inválido;
- naming mecânico;
- arquivo grande;
- comando ausente.

## Julgamento depois

Reviewer avalia:

- arquitetura;
- trade-offs;
- correção;
- simplicidade;
- adequação da exceção;
- risco residual;
- impacto futuro nomeado.

## Feedback executável

Quando reviewers repetem o mesmo Finding mecânico:

```text
finding recorrente
→ candidate standard
→ fitness function
→ reviewer deixa de gastar tokens nisso
```

---

# 4.23 Integração com Closeout e Gardening

Mission closeout deve registrar:

- standards aplicados;
- regras violadas e corrigidas;
- Waivers;
- posture anterior e posterior;
- novas Defect Classes;
- Golden Path gaps;
- checks candidatos.

## Garbage collection

Agentes reproduzem padrões existentes, inclusive ruins.

O MNFS precisa de manutenção contínua:

- dead code;
- docs stale;
- abstrações duplicadas;
- policy drift;
- Waivers vencidas;
- Golden Paths quebrados;
- quality gaps.

A limpeza deve ocorrer em pequenos trabalhos direcionados, não em grandes “semanas de refactor”.

---

# 4.24 Metodologia de evolução do Engineering System

## Etapa 1 — Observar

Uma falha ou tarefa recorrente é registrada.

## Etapa 2 — Classificar

Ela pede:

- Golden Path?
- Guardrail?
- Safety Net?
- Manual Checkpoint?
- Apenas documentação?
- Nenhuma ação?

## Etapa 3 — Especificar

Criar Standard candidato com:

- escopo;
- risco;
- rationale;
- exemplo;
- método de prova;
- custo esperado.

## Etapa 4 — Implementar o menor controle

Preferência:

```text
template simples
→ check simples
→ gate somente quando confiável
```

## Etapa 5 — Pilotar

Medir:

- falhas evitadas;
- falsos positivos;
- tempo;
- tokens;
- bypasses;
- manutenção.

## Etapa 6 — Ratificar

Promover para `RATIFIED` ou `ENFORCED`.

## Etapa 7 — Revisar

Modelo e arquitetura mudam.

Regras que não agregam mais valor são removidas.

---

# 4.25 Ferramentas e política de adoção

MNFS não deve construir ou adotar uma ferramenta apenas porque ela é conhecida.

## Candidatos

- OpenAPI para HTTP contracts;
- Pact para consumer-driven contracts;
- dependency-cruiser para boundaries TypeScript;
- ArchUnit para arquitetura Java;
- Semgrep para padrões;
- OPA para policy-as-code cross-stack;
- Backstage templates como referência de scaffolding;
- linters customizados;
- scripts TypeScript;
- testes estruturais.

## Regra YAGNI

Começar com:

- TypeScript;
- JSON estruturado;
- comandos existentes do repositório;
- checks pequenos;
- adapters estreitos.

Adotar ferramenta externa quando:

1. resolve uma necessidade atual;
2. reduz complexidade total;
3. tem output determinístico;
4. possui manutenção aceitável;
5. pode ser substituída;
6. tem prova de valor.

OPA, por exemplo, separa decisão de política do ponto de enforcement e aceita dados estruturados; isso pode ser útil no futuro para políticas cross-stack. Não é necessário para o primeiro catálogo local.

---

# 4.26 Impacto no roadmap

Esta descoberta altera o roadmap conceitual.

## M2

Pode continuar como vertical slice fixa de um worker:

- uma tarefa demo;
- um Golden Path mínimo embutido;
- Profile mínimo do próprio MNFS;
- sem engine genérica de Standards.

M2 prova execução e recovery, não a fábrica completa.

## Antes da execução generalizada

Antes de workers implementarem Features arbitrárias em repositórios diferentes, precisamos entregar:

- Repository Profile v1;
- Standards Registry v1;
- seleção de Golden Path;
- Context Pack com regras aplicáveis;
- fitness function runner básico.

## M3 e posteriores

O roadmap detalhado deverá decidir se isso vira:

- um Milestone próprio entre M2 e review generalizado;
- ou uma capability obrigatória dentro do novo M3.

Não devemos manter a ordem antiga automaticamente.

## M4–M6

- paralelo usa ownership e architecture rules;
- integração usa contract e migration standards;
- QA usa journey standards;
- delivery usa operational standards;
- calibration usa Quality Posture e telemetria.

---

# 4.27 Alterações canônicas nas Seções 1–3

## Seção 1

MNFS passa a ser definido também como:

> Sistema de produção de software que torna o caminho correto fácil, verificável e repetível.

Novo princípio:

> O caminho correto deve ser o caminho mais fácil.

## Seção 2

O modelo passa a incluir:

- Engineering Standard;
- Golden Path;
- Policy Rule;
- Fitness Function;
- Safety Net;
- Waiver;
- Quality Posture.

Repository Profile deixa de ser apenas comandos e passa a concretizar o Engineering System no repositório.

## Seção 3

Planning, Context Pack, Verification e Closeout passam a resolver:

- Standards aplicáveis;
- Golden Path;
- guardrails;
- Waivers;
- posture impact;
- gardening follow-ups.

---

# 4.28 O que não definir agora

Não devemos, neste momento:

- escrever centenas de regras universais;
- criar um DSL próprio;
- adotar OPA sem consumidor real;
- construir portal de desenvolvedor;
- copiar Backstage;
- impor Pact a todo repositório;
- impor OpenAPI a toda integração;
- criar score arbitrário de qualidade;
- bloquear código com Standards ainda não pilotados;
- transformar gosto pessoal em política;
- criar Golden Path para tarefa que ocorreu uma vez;
- gerar abstração multi-repo antes de M2.

Devemos definir:

- o modelo;
- a hierarquia;
- a metodologia;
- os primeiros domínios;
- a integração com a Harness;
- o ponto correto no roadmap.

---

# 4.29 Primeiros Standards candidatos

Esses Standards são candidatos para pesquisa e piloto, não gates automaticamente ativos.

```text
CORE-001  Toda mudança possui critérios e método de prova.
ARCH-001  Dependências respeitam boundaries declarados.
API-001   API possui fonte de contrato declarada.
DATA-001  Migration possui estratégia de compatibilidade.
TEST-001  Bug fix possui prova de regressão quando automatizável.
INT-001   Seam real não é validado apenas por mock.
SEC-001   Autorização é verificada no boundary correto.
OBS-001   Falhas operacionais produzem sinal estruturado.
OPS-001   Mudança de risco declara recovery ou compensação.
DOC-001   Mudança de comportamento atualiza fonte documental aplicável.
```

Cada um precisará passar pela metodologia de candidate → pilot → ratification.

---

# 4.30 Invariantes do Engineering System

1. Toda regra possui ID e owner conceitual.
2. Toda regra possui applicability explícita.
3. `MUST` violado exige correção ou Waiver.
4. `SHOULD` não vira bloqueio silencioso.
5. Golden Path orienta; guardrail bloqueia.
6. Ferramenta não define política; implementa policy binding.
7. Regra mecânica não permanece apenas em prompt.
8. Regra subjetiva não vira lint arbitrário.
9. Context Pack recebe somente Standards aplicáveis.
10. Mission não redefine Repository Standards.
11. Profile não guarda conteúdo transitório de Mission.
12. Exceção é explícita, limitada e auditável.
13. Unknown permanece unknown.
14. Falso positivo recorrente enfraquece ou remove gate.
15. Finding recorrente pode virar Standard.
16. Standard obsoleto é removido.
17. Quality Posture é baseada em evidência.
18. Golden Path possui prova e condição de manutenção.
19. A fábrica não bloqueia inovação legítima.
20. A fábrica reduz carga cognitiva sem esconder a realidade do sistema.

---

# Decisão resumida da Seção 4

> **O MNFS não será apenas uma Harness que coordena agentes. Ele incorporará um Engineering System que codifica como o software deve ser produzido por meio de Engineering Standards, Repository Profiles, Golden Paths, guardrails, fitness functions, safety nets e Waivers. Essa camada transforma conhecimento de engenharia em comportamento executável e prepara a evolução para uma Software Factory. O framework é definido agora; as regras e ferramentas entram incrementalmente, baseadas em falhas reais, tarefas recorrentes e provas de valor.**

---
