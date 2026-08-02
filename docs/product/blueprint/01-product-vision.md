---
id: DOC-PRODUCT-BLUEPRINT-01
title: Visão do Produto
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
  - product blueprint section 1
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-02
tracking_issue: 6
---

# 1. Visão do Produto

## 1.1 Definição

MNFS é uma **development harness planning-first e evidence-driven**, construída sobre Pi, que transforma um objetivo do operador em uma entrega de software planejada, executada, verificada, integrada e comprovada.

O operador conversa com um único agente principal, o **MNFS Lead**. Esse lead conduz o planejamento, coordena agentes especializados, apresenta decisões, acompanha a execução e devolve resultados consolidados.

Os agentes trabalhadores são executores probabilísticos. O MNFS é o control plane determinístico que governa:

- contratos;
- estado;
- identidade;
- transições;
- isolamento;
- padrões de engenharia;
- Golden Paths;
- guardrails e fitness functions;
- evidências;
- gates;
- recuperação;
- integração;
- encerramento.

A experiência pretendida é:

```text
operador descreve um objetivo
        ↓
MNFS investiga e esclarece o necessário
        ↓
MNFS produz um plano estruturado
        ↓
operador revisa visualmente no Lavish
        ↓
operador aprova um contrato por hash
        ↓
MNFS divide o trabalho em trilhas seguras
        ↓
workers Pi executam em worktrees isolados
        ↓
workers emitem CLAIMS e evidências
        ↓
MNFS verifica, revisa e corrige conforme o risco
        ↓
mudanças são compostas em ambiente limpo
        ↓
QA valida o sistema como usuário
        ↓
MNFS entrega e encerra a missão com evidência
```

M0 e M1 já provaram partes essenciais dessa visão: identidade durável de repositório, SQLite fora dos worktrees, recuperação em processo novo, planejamento estruturado, revisão visual por Lavish e aprovação vinculada ao hash exato do contrato.

---

## 1.2 O problema que o MNFS resolve

Agentes de código modernos conseguem produzir muito código rapidamente, mas não são, por conta própria, sistemas confiáveis de desenvolvimento de software.

Uma sessão isolada tende a otimizar a tarefa imediatamente visível. O produto, porém, depende de relações que atravessam:

- backend;
- frontend;
- banco;
- contratos;
- autorização;
- infraestrutura;
- testes;
- operação;
- experiência do usuário.

Sem uma Harness, aparecem padrões recorrentes:

### Perda de intenção

O agente esquece decisões, restrições ou critérios quando a sessão cresce ou é reiniciada.

### Conclusão falsa

O agente afirma que uma feature está pronta porque:

- o código compila;
- testes locais passam;
- um mock responde;
- o arquivo foi criado;
- a própria implementação parece correta.

Nada disso prova, sozinho, que o comportamento necessário existe no sistema real.

### Features localmente corretas e sistemicamente incompletas

Cada parte parece funcionar, mas:

- o adapter não foi conectado;
- o endpoint não foi registrado;
- o frontend não consome o contrato real;
- a migration não participa do fluxo;
- o erro não chega ao usuário;
- uma dependência continua stubada.

### Autoavaliação permissiva

O mesmo contexto que planejou e implementou tende a defender as próprias decisões e aceitar evidências fracas.

### Loops de reparo sem aprendizado

O agente repete tentativas semelhantes, muda pequenas linhas e continua atacando a mesma falha sem formular uma nova hipótese.

### Excesso de prosa sem enforcement

Regras importantes ficam em documentos, prompts e skills, mas não são transformadas em:

- schemas;
- testes;
- estados;
- políticas;
- comandos;
- gates.

### Coordenação cara

Agentes e reviewers recebem contexto demais, repetem análises, disputam ownership e consomem mais tokens coordenando o trabalho do que resolvendo o problema.

O MNFS existe para converter essas lições em mecanismos executáveis, sem preservar a complexidade específica do Claude Code.

---

## 1.3 Promessa central

> **O MNFS transforma intenção em entrega comprovada, sem depender da memória, da autodeclaração ou da boa vontade de uma sessão de IA.**

Essa promessa possui quatro dimensões.

### 1.3.1 Controle

O sistema deve saber, de maneira estruturada:

- qual missão está ativa;
- qual contrato foi aprovado;
- quais unidades de trabalho existem;
- quais dependências bloqueiam cada unidade;
- qual worker possui qual trilha;
- qual estado cada execução ocupa;
- qual evidência foi produzida;
- qual decisão falta;
- o que pode avançar.

### 1.3.2 Qualidade

Nenhum trabalho é aceito apenas porque o implementador declarou conclusão.

O MNFS deve distinguir:

```text
CLAIM
→ o worker afirma que cumpriu

RECEIPT
→ uma verificação controlada produziu evidência

VERDICT
→ uma autoridade permitida decidiu
```

A qualidade final deve combinar, conforme o risco:

- verificações determinísticas;
- análise arquitetural;
- review independente;
- integração;
- QA como usuário;
- evidência ligada aos critérios.

### 1.3.3 Continuidade

Uma sessão é substituível.

O operador deve poder:

- fechar o lead;
- reiniciar o terminal;
- trocar o modelo;
- perder uma mensagem;
- interromper um worker;

sem perder a missão, o estado ou as evidências já aceitas.

### 1.3.4 Eficiência

O MNFS deve aplicar rigor proporcional ao risco.

Não haverá uma cerimônia completa para toda alteração:

```text
mudança simples
→ execução direta + checks determinísticos

mudança intermediária
→ contrato + worker + checks + review direcionado

mudança crítica
→ planejamento profundo + isolamento + gates ampliados + QA real
```

Eficiência significa reduzir:

- contexto carregado;
- rounds de review;
- retries cegos;
- handoffs;
- reconstrução de informação;
- workers desnecessários;
- ferramentas sem ganho comprovado.

---

## 1.4 Experiência final do operador

O operador não deve administrar uma frota de agentes manualmente.

Ele deve conversar com um único ponto de contato:

```text
OPERADOR
    ↓
MNFS LEAD
```

O lead é responsável por traduzir a intenção do operador para o sistema e os resultados do sistema para o operador.

### O operador faz

- descreve objetivos;
- responde perguntas de produto;
- revisa o plano visualmente;
- aprova o contrato;
- decide trade-offs que alteram escopo, arquitetura, risco ou orçamento;
- autoriza ações irreversíveis;
- acompanha o status;
- aceita ou rejeita recomendações do lead.

### O operador não precisa fazer

- abrir worktrees;
- escolher qual worker recebe cada arquivo;
- enviar prompt individual para cada agente;
- interpretar logs brutos;
- acompanhar processos;
- lembrar comandos internos;
- decidir se um teste técnico é suficiente;
- copiar informações entre sessões;
- reconstruir o estado após um restart;
- avaliar sozinho se uma feature está realmente completa.

### Os workers não conversam diretamente com o operador

Workers reportam ao MNFS Lead por meio de:

- estado estruturado;
- artefatos;
- claims;
- findings;
- pedidos de decisão.

Isso evita que múltiplos agentes:

- façam perguntas duplicadas;
- apresentem versões conflitantes da realidade;
- pressionem por decisões locais;
- exponham detalhes técnicos desnecessários.

O padrão de um único liaison é uma das inspirações operacionais herdadas do FirstMate, enquanto o MNFS adiciona contratos, gates, evidência e QA como partes centrais do produto.

---

## 1.5 O MNFS como sistema code-first

O antigo `mnfs-harness` dependia fortemente de:

- documentos extensos;
- prompts;
- skills;
- hooks que interpretavam texto;
- convenções registradas em prosa;
- comportamento lembrado pela sessão.

Essa abordagem foi útil para descobrir o método, mas não é a arquitetura final.

No MNFS Pi-first, a regra é:

> **Tudo que pode ser decidido deterministicamente deve sair da prosa e entrar no código.**

### Pertence ao código

- persistência;
- IDs;
- hashes;
- FSMs;
- transições;
- leases;
- uniqueness;
- idempotência;
- retries permitidos;
- limites;
- resolução de paths;
- criação de worktrees;
- dispatch;
- reconciliação;
- recovery;
- validação de schema;
- acceptance gates determinísticos;
- CLI;
- adapters;
- política de risco mensurável.

### Pertence a artefatos estruturados

- missão;
- milestones;
- features;
- critérios;
- contratos;
- decisões;
- riscos;
- write tracks;
- attempts;
- claims;
- receipts;
- findings;
- verdicts;
- evidência;
- closeout.

### Pertence a skills, templates e prosa

- instruções de raciocínio;
- entrevista de planejamento;
- rubricas de julgamento;
- orientação de investigação;
- briefing de função;
- explicações para o operador;
- padrões de escrita;
- exemplos;
- templates iniciais;
- perguntas que exigem decisão humana.

### Skills são portas de entrada, não o control plane

Uma skill pode orientar o Pi a:

```text
analisar objetivo
→ chamar comandos MNFS
→ produzir plano estruturado
→ abrir Lavish
→ interpretar feedback
```

Mas não deve poder:

- aprovar um plano diretamente;
- alterar SQLite;
- conceder um lease;
- marcar um claim como aceito;
- fechar uma feature;
- inventar uma transição;
- ignorar um gate.

---

## 1.6 O que o MNFS é

O MNFS é:

- uma Harness de desenvolvimento;
- um control plane para agentes de software;
- uma máquina de planejamento e execução;
- uma camada de contratos;
- um sistema de evidência;
- um sistema de recuperação;
- um coordenador de trabalho isolado;
- um gate de qualidade;
- uma interface entre operador e múltiplos agentes;
- uma base local que poderá evoluir para plataforma;
- um sistema de produção de software que torna o caminho correto mais fácil, verificável e repetível.

---

## 1.7 O que o MNFS não é

O MNFS não é:

- um modelo de linguagem;
- um substituto do Pi;
- um fork completo do FirstMate;
- apenas uma coleção de prompts;
- apenas uma biblioteca de skills;
- um gerador automático de código;
- um IDE;
- um terminal multiplexer;
- um gerenciador de Git genérico;
- um framework universal de workflows;
- um swarm irrestrito de agentes;
- um sistema que maximiza o número de workers;
- uma plataforma cloud no primeiro momento.

FirstMate permanece uma referência operacional e uma fonte seletiva de padrões; Pi é o primeiro runtime; Lavish, Treehouse e ferramentas futuras entram por fronteiras estreitas. Nenhum adapter se torna autoridade do domínio.

---

## 1.8 Princípios constitucionais

### P1 — Controle determinístico, execução probabilística

LLMs raciocinam e produzem trabalho. O MNFS controla estado, contratos e avanço.

### P2 — Uma sessão é descartável

Nenhuma missão depende da continuidade de um transcript.

### P3 — Mensagem é notificação, não memória

Informação durável vive em SQLite ou em artefato content-addressed.

### P4 — CLAIM não é veredito

O implementador nunca é a autoridade final sobre o próprio trabalho.

### P5 — Evidência não escrita não aconteceu

Uma afirmação sem artefato ou verificação não pode fechar critério.

### P6 — Trabalho isolado precisa ser composto

Um worktree verde não prova que o sistema integrado está verde.

### P7 — Implementer e reviewer são papéis distintos quando o risco exige julgamento

Self-review não é suficiente como gate independente.

### P8 — QA deve observar o produto como usuário quando o critério é comportamental

Código, mocks e endpoints isolados não substituem a jornada real.

### P9 — Rigor proporcional ao risco

Mais agentes e mais gates somente quando aumentam a confiança necessária.

### P10 — Sem retry cego

Nova tentativa exige nova hipótese, nova evidência ou mudança de plano.

### P11 — YAGNI é vinculante

Nova abstração, adapter ou serviço precisa de uma necessidade presente e uma prova nomeada.

### P12 — Nenhuma ferramenta externa é autoridade de domínio

- Pi executa;
- Lavish apresenta;
- Treehouse gerencia worktrees;
- Herdr apresenta terminais;
- Git guarda código;
- SQLite guarda runtime;
- MNFS decide o estado da missão.

### P13 — O caminho correto deve ser o caminho mais fácil

Boas práticas recorrentes devem ser transformadas em Golden Paths, templates, comandos, checks e feedback acionável. O MNFS não depende de o worker lembrar uma convenção quando ela pode ser fornecida ou verificada mecanicamente.

### P14 — Authority e isolation são complementares

Permissão em prompt, worktree ou container não constitui uma boundary de segurança completa. Ações são governadas por Authority e Effect Policy, enquanto filesystem, network, credentials e processos são limitados por enforcement técnico proporcional ao risco.

### P15 — Medição existe para informar decisões

O MNFS não coleta métricas para fabricar atividade, ranquear agentes ou produzir um score universal de produtividade. Cada sinal precisa declarar qual decisão informa, sua cobertura, limitações e condição de ação.

### P16 — Provar antes de generalizar

O MNFS evolui por walking skeletons e vertical slices. Cada nova abstração, adapter, Golden Path ou plataforma precisa nascer de um Product Milestone com consumidor, Golden Proof, Entry Gate e Removal Conditions.

### P17 — Um conceito possui uma fonte canônica

Documentos podem explicar, resumir e aplicar um conceito, mas somente uma fonte o governa. Conversas, issues, tracking, research e projections não podem redefinir silenciosamente decisões, contratos ou state.

---

## 1.9 Definição de sucesso do produto

O MNFS estará cumprindo sua visão quando o operador puder fornecer um objetivo relevante e o sistema conseguir:

1. produzir um plano completo e revisável;
2. registrar um contrato aprovado;
3. decompor o trabalho sem colisões evitáveis;
4. iniciar executores isolados;
5. acompanhar o estado sem ler transcripts;
6. sobreviver a restarts;
7. impedir falso progresso;
8. detectar trabalho incompleto;
9. corrigir sem loops cegos;
10. integrar as partes;
11. validar o comportamento real;
12. entregar evidência compreensível;
13. encerrar a missão com rastreabilidade;
14. realizar tudo isso com menos intervenção e desperdício do que uma sessão de coding agent sem Harness.

O sucesso não será medido pela quantidade de agentes, ferramentas, documentos ou estados.

Será medido por:

- qualidade do software aceito;
- redução de regressões;
- redução de false completion;
- continuidade;
- clareza de decisões;
- eficiência de tokens e tempo;
- menor intervenção operacional;
- capacidade de reproduzir por que algo foi aceito.

---

## 1.10 Visão de evolução

### Hoje — local-first

```text
Windows
→ navegador e apresentação

WSL2
→ MNFS, Pi, Git, SQLite, worktrees e testes
```

### Próxima evolução

```text
Pi Lead
→ múltiplos Pi workers
→ Treehouse
→ integração
→ gates
→ QA
```

### Futuro

```text
MNFS Web / Cloud
        ↓
control plane remoto
        ↓
Pi SDK ou RPC
        ↓
workers em ambientes isolados
```

O core de domínio não deve ser reescrito para essa evolução.

A persistência, o transporte e o executor poderão mudar por adapter, enquanto permanecem estáveis:

- contratos;
- entidades;
- transições;
- políticas;
- evidências;
- gates;
- experiência do operador.

---
