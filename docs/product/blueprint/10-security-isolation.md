---
id: DOC-PRODUCT-BLUEPRINT-10
title: Segurança, Isolamento, Ambientes, Credenciais e Efeitos Externos
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
  - product blueprint section 10
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-DOCUMENTATION-MAP
review_triggers:
  - material change to this section's concepts
last_reviewed: 2026-08-02
tracking_issue: 6
---

# 10. Segurança, Isolamento, Ambientes, Credenciais e Efeitos Externos

## 10.1 Propósito

Esta seção define como o MNFS limita tecnicamente e governa semanticamente o que um Actor pode:

- ler;
- escrever;
- executar;
- conectar;
- autenticar;
- alterar;
- publicar;
- destruir;
- enviar;
- consumir;
- operar fora do repositório.

O objetivo é impedir que:

- um Worker execute com todo o poder do usuário WSL;
- um worktree seja confundido com sandbox;
- um container seja confundido com autorização;
- uma permissão concedida em prompt seja confundida com enforcement;
- secrets sejam copiados para Context Packs, logs ou memória observacional;
- acesso de rede amplo permita exfiltração;
- uma ferramenta permitida realize um efeito não autorizado;
- um Worker altere a própria política de segurança;
- um dependency script comprometa o host;
- dois Tracks contaminem o mesmo banco ou provider;
- um agent opere produção apenas porque possui credentials;
- uma extensão Pi não revisada entre no trusted computing base;
- uma sandbox failure degrade silenciosamente para execução irrestrita.

No MNFS:

> **Authority define o que uma ação significa e quem pode autorizá-la. Isolation define o que o processo consegue fazer tecnicamente. As duas são necessárias.**

---

# 10.2 Base de pesquisa

Esta seção foi construída com base em documentação e implementações de mercado, incluindo:

- Pi Extensions, Packages e sandbox example;
- Anthropic Sandbox Runtime;
- permission model do Claude Code;
- OpenAI guidance para autonomy e approval boundaries;
- Development Container Specification;
- Daytona Sandboxes e sua Pi extension;
- E2B Sandboxes;
- Ona Environments e Agents;
- Firecracker microVMs;
- GitHub Actions OIDC;
- AWS temporary credentials e least privilege;
- 1Password CLI;
- SOPS;
- NIST SSDF;
- OpenSSF Scorecard.

A análise completa está registrada em:

```text
MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1.md
```

## 10.2.1 Limite das referências

Ferramentas de mercado não definem automaticamente o modelo correto do MNFS.

Cada uma resolve partes diferentes:

- Pi oferece extensão e tool interception;
- Sandbox Runtime oferece enforcement local;
- Dev Containers oferecem reproducibilidade;
- Daytona, E2B e Ona oferecem ambientes remotos;
- Firecracker oferece uma referência de isolamento por microVM;
- OIDC, STS, 1Password e SOPS resolvem classes diferentes de credential delivery;
- SSDF e Scorecard ajudam a organizar supply-chain security.

O MNFS precisa compor essas ideias sem duplicar suas autoridades.

---

# 10.3 Distinções fundamentais

## 10.3.1 Authority

Define quem pode decidir que uma ação é permitida.

Exemplo:

```text
Operator pode autorizar deploy.
```

## 10.3.2 Permission

Define se uma operação é permitida pela policy atual.

Exemplo:

```text
Writer pode executar testes.
Writer não pode executar git push.
```

## 10.3.3 Capability

É uma operação técnica disponibilizada ao Actor.

Exemplo:

```text
RUN_TESTS
WRITE_TRACK
READ_PROVIDER_SANDBOX
CREATE_PULL_REQUEST
```

## 10.3.4 Tool permission

Controla se uma tool call pode ser iniciada.

Pode ser aplicada por:

- Pi extension;
- allowlist;
- denylist;
- permission prompt;
- MNFS tool wrapper.

Não é necessariamente uma barreira de sistema operacional.

## 10.3.5 OS sandbox

Limita tecnicamente o processo e seus filhos.

Pode controlar:

- filesystem;
- network;
- Unix sockets;
- process namespaces;
- syscalls;
- resource use.

## 10.3.6 Worktree isolation

Separa árvores de código concorrentes.

Não separa:

- credentials;
- home directory;
- network;
- database;
- port;
- provider account;
- Docker daemon;
- Windows filesystem;
- processos.

## 10.3.7 Environment reproducibility

Define:

- runtimes;
- packages;
- services;
- users;
- startup;
- configuration.

Dev Containers resolvem principalmente essa dimensão.

## 10.3.8 Environment isolation

Separa recursos de uma execução dos recursos de outra.

Pode usar:

- process sandbox;
- container;
- VM;
- microVM;
- remote sandbox.

## 10.3.9 Credential Grant

Disponibiliza uma identidade limitada a um target, escopo e tempo.

## 10.3.10 External Effect

É uma mudança observável fora do workspace isolado.

Exemplos:

- push;
- PR;
- issue comment;
- provider mutation;
- deployment;
- production write;
- purchase;
- email;
- migration;
- deletion.

---

# 10.4 Princípio de defesa em profundidade

O modelo MNFS possui oito planos complementares:

```text
Plane 1 — Domain Authority
Plane 2 — Tool Capability
Plane 3 — Process Sandbox
Plane 4 — Execution Environment
Plane 5 — Credential Broker
Plane 6 — Network and Egress Policy
Plane 7 — External Effect Gate
Plane 8 — Evidence, Audit and Reconcile
```

## 10.4.1 Plane 1 — Domain Authority

Responde:

> Quem pode autorizar esta ação?

## 10.4.2 Plane 2 — Tool Capability

Responde:

> A operação técnica necessária foi disponibilizada a este Role?

## 10.4.3 Plane 3 — Process Sandbox

Responde:

> Mesmo que o processo tente ultrapassar a policy, o sistema operacional o impede?

## 10.4.4 Plane 4 — Execution Environment

Responde:

> Onde o código, dependências e serviços estão executando e quais recursos são compartilhados?

## 10.4.5 Plane 5 — Credential Broker

Responde:

> Qual identidade temporária e limitada está disponível?

## 10.4.6 Plane 6 — Network Policy

Responde:

> Para onde o processo pode enviar dados?

## 10.4.7 Plane 7 — External Effect Gate

Responde:

> O efeito específico foi aprovado e ainda está dentro do contrato?

## 10.4.8 Plane 8 — Evidence e Reconcile

Responde:

> O que realmente aconteceu e o estado externo corresponde ao registrado?

## 10.4.9 Regra

Nenhuma camada substitui outra.

```text
approval without sandbox
→ não limita tecnicamente o processo

sandbox without Authority
→ não define se a ação é apropriada

container without credential policy
→ pode continuar excessivamente privilegiado

network allowlist without effect policy
→ pode permitir exfiltração em domínio autorizado
```

---

# 10.5 Threat model

## 10.5.1 Modelo local inicial

Confiáveis:

- Operator;
- MNFS Core version revisada;
- first-party adapters;
- host owner;
- Approved Contract;
- effective security policy compilada.

Falíveis ou potencialmente não confiáveis:

- saída do LLM;
- código do repositório;
- scripts de instalação;
- dependencies;
- issue e PR text;
- web content;
- logs;
- generated files;
- third-party Pi packages;
- provider responses;
- downloaded binaries.

Workers são tratados inicialmente como:

```text
honest but fallible
```

Porém, prompt injection ou conteúdo comprometido pode fazê-los agir como código hostil.

## 10.5.2 Threat classes

### T01 — Host write

Worker altera arquivo fora do worktree.

### T02 — Secret read

Worker lê:

- SSH;
- cloud credentials;
- Kubernetes config;
- `.env`;
- password manager socket;
- browser profile;
- Windows user files.

### T03 — Egress

Worker envia código ou secret pela rede.

### T04 — Git destruction

Worker executa:

- force push;
- branch deletion;
- history rewrite;
- hook/config tampering.

### T05 — Shared-resource contamination

Dois Tracks usam o mesmo:

- database;
- schema;
- port;
- provider;
- queue;
- browser profile.

### T06 — Production effect

Worker altera sistema real.

### T07 — Malicious install script

Dependency executa código inesperado durante setup.

### T08 — Compromised extension

Pi extension executa com os privilégios do usuário.

### T09 — Policy tampering

Worker altera:

- sandbox config;
- Pi settings;
- MNFS policy;
- CI workflow;
- credentials binding.

### T10 — Command injection

Input não confiável é interpolado numa shell.

### T11 — Privileged socket

Acesso ao Docker socket ou outro daemon permite escapar da boundary.

### T12 — Prompt injection

Repository ou web content tenta redefinir Authority.

### T13 — Credential persistence

Secret é salvo em:

- log;
- prompt;
- transcript;
- memory;
- Artifact;
- commit.

### T14 — Over-broad identity

Credential permite mais ações ou recursos que o necessário.

### T15 — Sandbox fail-open

Falha do enforcement executa comando sem proteção.

### T16 — Supply-chain compromise

Dependency, binary, action ou package está comprometido.

### T17 — Windows interoperability escape

Processo WSL acessa host mounts ou executáveis Windows indevidamente.

### T18 — Policy drift

Security policy usada pelo Worker não corresponde à versão aprovada.

### T19 — Untrusted repository execution

Clone ou PR executa scripts maliciosos.

### T20 — False isolation assumption

Sistema acredita estar protegido apenas por worktree, WSL ou container.

---

# 10.6 Trust boundaries

```text
Operator
   │
   ▼
MNFS Core / Policy
   │
   ├── trusted adapters
   │
   ▼
Execution Boundary
   │
   ├── Pi Actor
   ├── repository code
   ├── dependencies
   └── tool processes
   │
   ▼
External Systems
```

## 10.6.1 Trusted computing base local

Inclui:

- MNFS binary/code;
- effective policy;
- SQLite;
- Pi runtime;
- loaded Pi extensions;
- sandbox runtime;
- process adapter;
- Treehouse;
- operating-system enforcement.

Cada third-party package adicionado ao Pi pode ampliar a TCB.

## 10.6.2 Untrusted content boundary

Tratados como dados:

- source files;
- docs encontradas no repositório;
- issues;
- PR descriptions;
- web pages;
- provider responses;
- generated logs;
- package documentation.

Esses conteúdos não podem:

- conceder capability;
- alterar Authority;
- modificar policy;
- injetar secret;
- autorizar effect.

---

# 10.7 Entidades de segurança

## 10.7.1 Execution Environment Spec

Define o ambiente necessário.

```ts
interface ExecutionEnvironmentSpec {
  id: string;
  kind:
    | 'HOST_INSPECTION'
    | 'LOCAL_SANDBOX'
    | 'DEV_CONTAINER'
    | 'REMOTE_CONTAINER'
    | 'REMOTE_VM'
    | 'MICROVM';

  baseRef?: string;
  repositoryRef: string;
  contractHash: string;

  filesystemPolicy: FilesystemPolicy;
  networkPolicy: NetworkPolicy;
  resourcePolicy: ResourcePolicy;
  credentialRequirements: CredentialRequirement[];
  serviceRequirements: ServiceRequirement[];

  setupPhase?: PhasePolicy;
  executionPhase: PhasePolicy;
  verificationPhase?: PhasePolicy;
  deliveryPhase?: PhasePolicy;

  contentHash: string;
}
```

## 10.7.2 Execution Environment Instance

É uma instância concreta de um Spec.

```text
ENV-001
```

Contém:

- adapter;
- external ID;
- state;
- owner;
- Work Track;
- created at;
- observed capabilities;
- policy hash;
- filesystem identity;
- network identity;
- cleanup state.

## 10.7.3 Environment Lease

Autoriza temporariamente o uso de uma Environment Instance.

É diferente do Treehouse Lease.

```text
Treehouse Lease
→ worktree físico

Environment Lease
→ runtime e recursos de execução
```

No M2 local, ambos podem estar vinculados à mesma Track sem exigir um sistema genérico separado.

## 10.7.4 Credential Grant

Concede credencial temporária a um Actor ou Effect Executor.

## 10.7.5 Effect Request

Solicita uma ação externa.

## 10.7.6 Effect Receipt

Registra o efeito observado.

## 10.7.7 Security Violation

Registra uma tentativa bloqueada ou desvio detectado.

Não presume malícia.

---

# 10.8 Isolation levels

## 10.8.1 E0 — Inspection

Uso:

- Planning;
- read-only Investigation;
- initial Review;
- status;
- documentation analysis.

Propriedades:

- sem escrita no Repository;
- sem credentials;
- network off por default;
- read scope delimitado;
- sem external mutation.

## 10.8.2 E1 — Local Worktree + OS Sandbox

Target inicial para Writers locais.

Propriedades:

- Treehouse worktree;
- Pi tool interception;
- sandbox do process tree;
- write somente no worktree e temp/runtime explicitamente permitidos;
- deny read de credential paths;
- network off por default;
- sem production credentials;
- protected policy paths;
- process/resource limits quando disponíveis.

## 10.8.3 E2 — Dev Container

Uso:

- toolchain complexa;
- múltiplos services;
- parity local/CI;
- environment drift;
- setup repetível.

Propriedades:

- environment-as-code;
- container user não root quando possível;
- mounts explícitos;
- lifecycle commands;
- side services;
- security policy separada.

## 10.8.4 E3 — Remote Sandbox

Uso:

- código não confiável;
- paralelismo elevado;
- host local não deve executar código;
- múltiplos environments;
- lifecycle remoto;
- preview e services.

Candidatos futuros:

- Daytona;
- E2B;
- Ona-compatible environment.

## 10.8.5 E4 — Dedicated VM ou microVM

Uso:

- multi-tenant;
- high-risk untrusted execution;
- customer-isolated workloads;
- stronger kernel boundary.

Referência:

- Firecracker-based platform;
- VM sandbox provider.

MNFS não construirá esse runtime diretamente no local roadmap.

---

# 10.9 WSL2 security position

## 10.9.1 Papel

WSL2 é:

- canonical local runtime;
- Linux environment;
- boundary operacional do Windows.

Não é:

- per-Worker sandbox;
- credential isolation;
- network isolation;
- multi-tenant environment.

## 10.9.2 Riscos relevantes

WSL pode expor:

- `/mnt/c`;
- home do usuário;
- Windows executables;
- host-local services;
- credential stores;
- Docker sockets;
- shared network.

## 10.9.3 Política

Para Worker E1:

- Repository deve estar no filesystem Linux;
- host mounts são negados por default;
- Windows executable interop não é capability default;
- sensitive home paths são denied;
- Unix sockets são denied por default;
- WSL é o host do sandbox, não sua prova de isolamento.

---

# 10.10 Pi security integration

## 10.10.1 Pi extensions e packages

Pi extensions podem:

- registrar tools;
- interceptar calls;
- substituir built-ins;
- persistir state;
- executar arbitrary code.

Por isso:

```text
Pi extension
→ trusted executable dependency
```

Não é apenas prompt content.

## 10.10.2 Package admission

Third-party package precisa de:

- source review;
- exact version pin;
- license review;
- dependency review;
- checksum/lock preservation;
- capability inventory;
- upgrade drill;
- removal path.

## 10.10.3 No mutable project trust

Project-local `.pi` content pode estar dentro do Repository.

Um Worker não pode escrever na configuração que define sua active security boundary.

Estratégia:

```text
versioned policy source
→ resolve before dispatch
→ validate
→ freeze outside Worker write-set
→ execute by hash
```

## 10.10.4 Tool interception

Security Adapter precisa controlar o caminho real de execução.

Não é suficiente adicionar uma skill dizendo:

> Não leia secrets.

---

# 10.11 Candidate local sandbox

## 10.11.1 Composição

```text
Pi sandbox extension pattern
+
@anthropic-ai/sandbox-runtime
```

## 10.11.2 Capabilities pesquisadas

Em Linux:

- bubblewrap;
- filesystem restrictions;
- network namespace;
- proxy-mediated allowlist;
- seccomp;
- Unix-socket restrictions;
- process-tree enforcement;
- protected paths.

## 10.11.3 Policy inicial

```text
filesystem:
  denyRead:
    - ~/.ssh
    - ~/.aws
    - ~/.config/gcloud
    - ~/.kube
    - Windows host mounts
  allowRead:
    - worktree
    - required system/tool paths
  allowWrite:
    - worktree
    - attempt temp
    - approved cache
  denyWrite:
    - .git/config
    - .git/hooks
    - .mnfs
    - .pi
    - .env
    - security policy

network:
  allowedDomains: []
  allowLocalBinding: false

unixSockets:
  deny by default
```

A configuração final precisa refletir limites reais do Linux implementation.

## 10.11.4 Fail closed

Se o sandbox não inicia:

```text
SANDBOX_UNAVAILABLE
→ Worker does not start
```

Nunca executar sem sandbox como fallback silencioso.

## 10.11.5 Limitações

- beta research preview;
- diferenças de plataforma;
- domain allowlist não garante request safety;
- Linux path rules possuem limitações;
- broad exception pode enfraquecer a boundary;
- Docker socket equivale a poder host;
- depende de bubblewrap e componentes locais.

## 10.11.6 Classificação

```text
CANDIDATE
→ ADOPT ONLY AFTER AS-02
```

---

# 10.12 Dev Containers

## 10.12.1 Função

Dev Container é um contrato de ambiente reproduzível.

Pode definir:

- image;
- Dockerfile;
- Compose;
- tools;
- users;
- services;
- lifecycle;
- mounts;
- ports;
- environment metadata.

## 10.12.2 Repository Profile binding

Exemplo conceitual:

```json
{
  "environment": {
    "kind": "DEV_CONTAINER",
    "config": ".devcontainer/devcontainer.json",
    "createCommand": "devcontainer up",
    "execCommand": "devcontainer exec"
  }
}
```

## 10.12.3 Checks

MNFS deve inspecionar:

- `privileged`;
- `capAdd`;
- `securityOpt`;
- mounts;
- Docker socket;
- host paths;
- root user;
- environment variables;
- lifecycle scripts;
- forwarded ports;
- side services.

## 10.12.4 Não é sandbox suficiente

Container com:

- privileged mode;
- broad bind mount;
- host socket;
- host credentials;
- unrestricted network;

pode ser reproduzível e inseguro.

## 10.12.5 Decisão

```text
SUPPORT
NOT UNIVERSALLY REQUIRED
```

---

# 10.13 Remote sandbox market scan

## 10.13.1 Daytona

Pontos fortes:

- Pi extension existente;
- one sandbox per Session;
- tools redirected to sandbox;
- persistence e resume;
- container e VM classes;
- filesystem/process APIs;
- snapshots;
- network restrictions;
- reconciliation;
- Git branch integration.

Riscos de adoção direta:

- external platform dependency;
- API credentials;
- branch/push behavior próprio;
- lifecycle diferente do Treehouse;
- cost;
- network;
- vendor semantics.

Classificação:

```text
PRIMARY FUTURE CANDIDATE
for RemoteExecutionEnvironmentAdapter
```

## 10.13.2 E2B

Pontos fortes:

- simple sandbox API;
- filesystem;
- command execution;
- isolated code;
- CI use cases.

Classificação:

```text
FUTURE ALTERNATIVE
for narrow remote execution
```

## 10.13.3 Ona

Pontos fortes:

- isolated environments;
- Dev Containers;
- agents;
- policies;
- task-based environments;
- cloud/VPC;
- automation;
- persistent workspace.

Risco:

- sobrepõe grande parte da Software Factory MNFS.

Classificação:

```text
REFERENCE PLATFORM
NOT CORE DEPENDENCY
```

## 10.13.4 Firecracker

Pontos fortes:

- KVM isolation;
- minimal VMM;
- seccomp;
- cgroups;
- namespaces;
- jailer;
- microVM density.

Risco:

- operar Firecracker corretamente é infraestrutura especializada;
- host security permanece necessária;
- egress precisa ser filtrado externamente;
- patching é responsabilidade operacional.

Classificação:

```text
E4 ARCHITECTURE REFERENCE
```

---

# 10.14 Environment selection policy

## 10.14.1 Inputs

- Role;
- Repository trust;
- code trust;
- risk;
- required services;
- credentials;
- external effects;
- concurrency;
- duration;
- cost;
- host sensitivity.

## 10.14.2 Selection

```text
read-only trusted repo
→ E0

local bounded write, trusted repo
→ E1

complex reproducible stack
→ E2 + security controls

untrusted code or high parallelism
→ E3

multi-tenant/high-assurance
→ E4
```

## 10.14.3 Escalation

Risk pode elevar o Environment.

Não reduzir silenciosamente quando adapter estiver indisponível.

```text
required E3 unavailable
→ BLOCK
```

Não:

```text
fallback to E1 with same credentials
```

---

# 10.15 Filesystem policy

## 10.15.1 Read model

Read pode ser:

```text
WORKTREE_ONLY
REPOSITORY
DECLARED_DEPENDENCY_PATHS
SYSTEM_TOOLCHAIN
HOST_BROAD
```

Default Writer:

```text
WORKTREE + required toolchain
```

## 10.15.2 Write model

Write é allow-only:

- worktree;
- Attempt temp;
- approved cache;
- generated artifacts path.

## 10.15.3 Protected paths

Default:

- `.git/config`;
- `.git/hooks`;
- global Git config;
- `.mnfs/repo.json`;
- Approved Contracts;
- runtime SQLite;
- active policy;
- `.pi` security/extensions;
- secret files;
- shell profiles;
- system executables;
- Windows host mounts.

## 10.15.4 Generated code

Generated output precisa estar no write-set ou em explicit generated paths.

## 10.15.5 Violation

Blocked filesystem access produz:

```text
SECURITY_VIOLATION
```

com:

- Actor;
- command/tool;
- path;
- operation;
- policy;
- timestamp;
- result.

---

# 10.16 Network policy

## 10.16.1 Default

```text
DENY_ALL
```

## 10.16.2 Modes

```text
OFF
REGISTRY_ONLY
DOCUMENTATION_READ
PROVIDER_SANDBOX
DECLARED_ALLOWLIST
DELIVERY
```

## 10.16.3 Setup versus execution

Setup pode precisar:

- package registry;
- OS packages;
- image registry;
- source fetch.

Execution normalmente não precisa de internet ampla.

## 10.16.4 Domain allowlist limitation

Permitir domínio não limita:

- HTTP method;
- path;
- target account;
- upload;
- arbitrary repository;
- payload content.

Exemplo:

```text
allow github.com
```

pode permitir:

- documentação read;
- clone;
- push;
- gist;
- issue mutation;
- data exfiltration.

## 10.16.5 High-risk egress

Pode exigir:

- request proxy;
- method restrictions;
- API path restrictions;
- token scope;
- audit log;
- Effect Request;
- separate executor.

## 10.16.6 Local binding

Port binding é denied por default.

Golden Path pode pedir allocation explícita.

---

# 10.17 Permission and capability policy

## 10.17.1 Capability-based

Não conceder uma shell irrestrita conceitualmente quando uma capability menor resolve.

Preferir:

```text
RUN_TEST_COMMAND
READ_GIT_STATUS
OPEN_CLAIM
READ_PROVIDER_SANDBOX
```

a:

```text
FULL_BASH
FULL_GITHUB
FULL_CLOUD
```

## 10.17.2 Shell

Shell é necessária para software development.

Sua segurança depende de:

- OS sandbox;
- cwd;
- environment;
- network;
- credentials;
- command evidence;
- external-effect separation.

## 10.17.3 Permission prompt

Prompt humano é usado quando:

- policy não decide;
- effect é material;
- scope aumenta;
- capability é nova;
- operation é irreversível.

## 10.17.4 Bypass mode

Qualquer modo sem prompts requer:

- Environment compatível;
- precompiled policy;
- no sensitive credentials;
- effect denial;
- audit.

---

# 10.18 Credential architecture

## 10.18.1 Princípio

Worker não recebe o environment completo do usuário.

Recebe apenas um `Credential Grant`.

## 10.18.2 Classes

```text
NONE
BUILD_READ
PACKAGE_REGISTRY_READ
TEST_SANDBOX
PROVIDER_SANDBOX
SHARED_NONPROD_READ
SHARED_NONPROD_WRITE
PRODUCTION_READ
PRODUCTION_WRITE
DELIVERY
```

## 10.18.3 Estrutura conceitual

```ts
interface CredentialGrant {
  id: CredentialGrantId;
  target: EntityReference;
  actor: ActorRef;

  class: CredentialClass;
  provider: string;
  resourceScope: string[];
  actionScope: string[];

  issuedAt: string;
  expiresAt?: string;

  delivery:
    | 'PROCESS_ENV'
    | 'TEMP_FILE'
    | 'SOCKET'
    | 'WORKLOAD_IDENTITY'
    | 'REMOTE_PROVIDER';

  secretRef?: string;
  policyHash: string;

  state:
    | 'REQUESTED'
    | 'ACTIVE'
    | 'EXPIRED'
    | 'REVOKED'
    | 'RELEASED'
    | 'DIVERGED';
}
```

## 10.18.4 Secret storage

SQLite guarda:

- metadata;
- reference;
- scope;
- expiry;
- state.

Não guarda plaintext secret.

## 10.18.5 Delivery

Secret é entregue:

- ao processo específico;
- no momento necessário;
- sem aparecer no prompt;
- sem entrar no Context Pack;
- sem ser escrito no worktree.

## 10.18.6 Redaction

Logs, Events e Artifacts devem possuir:

- known-secret redaction;
- token-pattern detection;
- output size limits;
- restricted storage;
- incident handling.

Redaction é Safety Net.

Não substitui evitar exposição.

## 10.18.7 Telemetry policy

Security Policy também governa telemetria.

Por default, não exportar:

- raw prompts;
- raw model outputs;
- source code;
- diffs;
- credentials;
- customer data.

Exportar IDs, hashes, classifications e Artifact refs quando suficientes.

---

# 10.19 Credential priority

Ordem preferencial:

```text
1. Workload identity / OIDC
2. Temporary role or session credential
3. Narrow service-account credential
4. Process-injected secret from secure vault
5. Encrypted repository secret with external key
6. Long-lived static secret only when unavoidable
```

## 10.19.1 Temporary credentials

Benefícios:

- expiration;
- reduced reuse;
- no embedding;
- narrow session;
- auditable issuance;
- easier rotation.

## 10.19.2 Long-lived credentials

Quando inevitáveis:

- narrow scope;
- separate account;
- storage external to Repository;
- regular rotation;
- access audit;
- no general Writer access.

---

# 10.20 Local secret bindings

## 10.20.1 1Password CLI

Candidate binding para:

- process-scoped environment injection;
- references instead of plaintext;
- service accounts;
- vault-scoped access;
- local interactive workflows.

Não é obrigatório.

## 10.20.2 SOPS

Candidate binding para:

- encrypted YAML/JSON/ENV/INI in Git;
- meaningful diffs;
- age/KMS recipients;
- key rotation;
- `exec-env`;
- `exec-file`.

A private key ou KMS identity permanece fora do Repository.

## 10.20.3 Environment variables

Environment variable pode ser delivery mechanism.

Não deve ser long-term storage ou source of truth.

## 10.20.4 Secret files

Quando ferramenta exige file:

- create in protected temp;
- strict permissions;
- exclude from worktree;
- delete after use;
- record cleanup;
- never commit.

---

# 10.21 CI and cloud identity

## 10.21.1 GitHub Actions OIDC

Preferred when supported:

```text
workflow identity
→ OIDC token
→ cloud trust policy
→ short-lived access token
```

Evita duplicar long-lived cloud secret em GitHub.

## 10.21.2 Cloud temporary credentials

Exemplo de binding:

```text
AWS STS AssumeRole
```

Principles:

- short duration;
- least privilege;
- resource conditions;
- session tags;
- no root/static key;
- explicit job identity.

## 10.21.3 MNFS future cloud

Remote Worker deverá receber:

- workload identity;
- per-run grant;
- no inherited operator credential;
- expiry shorter than run where possible;
- effect-bound action scope.

---

# 10.22 Execution phases

## 10.22.1 SETUP

Objetivo:

- install dependencies;
- build environment;
- prefetch artifacts;
- configure services.

Pode permitir network limitada.

Não recebe production credentials.

## 10.22.2 AGENT_EXECUTION

Objetivo:

- inspect;
- edit;
- test;
- produce Claim.

Default:

- network off;
- no external write;
- no production credentials.

## 10.22.3 VERIFICATION

Objetivo:

- run deterministic checks;
- integration;
- live sandbox tests.

Pode receber:

- read-only or test credentials;
- fixed environment;
- no implementation authority.

## 10.22.4 DELIVERY

Objetivo:

- PR;
- release;
- deploy;
- post-deploy verification.

Separada por:

- Role;
- Environment;
- credentials;
- Authority;
- Effect Gate.

---

# 10.23 External Effect classification

## X0 — PURE

Sem mutation persistente externa.

Exemplos:

- parse;
- calculate;
- read local immutable Artifact.

## X1 — LOCAL_REVERSIBLE

Mutation no workspace isolado.

Exemplos:

- edit worktree;
- temp files;
- local build;
- local database disposable.

## X2 — ISOLATED_SANDBOX

Mutation em recurso descartável dedicado.

Exemplos:

- provider sandbox por Track;
- disposable test database;
- ephemeral preview.

## X3 — SHARED_NONPROD

Mutation em recurso compartilhado de teste ou staging.

Exemplos:

- shared staging DB;
- shared test account;
- team environment.

## X4 — EXTERNAL_REVERSIBLE

External mutation normalmente reversível.

Exemplos:

- branch push;
- pull request;
- issue comment;
- preview deploy.

## X5 — PRODUCTION_OR_COSTLY

Pode afetar usuário, dinheiro ou operação real.

Exemplos:

- production deploy;
- customer message;
- purchase;
- paid cloud resource;
- production data write.

## X6 — DESTRUCTIVE_OR_IRREVERSIBLE

Exemplos:

- data deletion;
- destructive migration;
- credential rotation;
- release revocation;
- irreversible external submission.

---

# 10.24 Effect Request

## 10.24.1 Estrutura

```ts
interface EffectRequest {
  id: EffectRequestId;
  target: EntityReference;
  actor: ActorRef;

  effectClass: 'X0' | 'X1' | 'X2' | 'X3' | 'X4' | 'X5' | 'X6';

  operation: string;
  destination: string;
  resourceRefs: string[];
  inputArtifactRefs: ArtifactRef[];

  expectedOutcome: string;
  rollback?: string;
  idempotencyKey?: string;

  requiredCredentialClass: CredentialClass;
  requiredAuthority: ActorRole;

  policyHash: string;
  contractHash: string;

  state:
    | 'REQUESTED'
    | 'APPROVED'
    | 'DENIED'
    | 'EXECUTING'
    | 'COMPLETED'
    | 'FAILED'
    | 'UNKNOWN'
    | 'RECONCILING';
}
```

## 10.24.2 Effect is not tool name

```text
git status
→ X0

git commit
→ X1

git push feature branch
→ X4

git push --force protected branch
→ X6
```

## 10.24.3 Approval

Authority depende do:

- effect class;
- Repository Profile;
- environment;
- resource;
- contract;
- reversibility.

---

# 10.25 Effect Executor

## 10.25.1 Papel

Executa external mutation após aprovação.

É separado do ordinary Writer quando effect é X4–X6.

## 10.25.2 Inputs

- approved Effect Request;
- Credential Grant;
- input Artifacts;
- expected state;
- idempotency key;
- rollback plan.

## 10.25.3 Output

Effect Receipt.

## 10.25.4 No free-form mutation

Effect Executor usa:

- typed command;
- provider adapter;
- fixed arguments;
- constrained credential;
- known target.

Não recebe uma solicitação vaga:

> Publique isso.

---

# 10.26 Effect Receipt

```ts
interface EffectReceipt {
  id: EffectReceiptId;
  requestId: EffectRequestId;

  executor: ActorRef;
  credentialGrantId?: CredentialGrantId;

  startedAt: string;
  finishedAt: string;

  observedDestination: string;
  providerOperationId?: string;

  result:
    | 'SUCCEEDED'
    | 'FAILED'
    | 'UNKNOWN';

  beforeRef?: ArtifactRef;
  afterRef?: ArtifactRef;
  outputRef: ArtifactRef;

  reconciliationRequired: boolean;
}
```

## 10.26.1 Unknown

Timeout após external request pode significar:

- effect não ocorreu;
- effect ocorreu;
- effect ocorreu parcialmente.

Resultado:

```text
UNKNOWN
→ RECONCILE
```

Nunca retry cego em effect não idempotente.

---

# 10.27 Production policy

## 10.27.1 Default

Writer Worker:

```text
no production credentials
no production network path
no production mutation tools
```

## 10.27.2 Production read

Ainda exige:

- purpose;
- data classification;
- least privilege;
- audit;
- redaction;
- Operator or configured authority when sensitive.

## 10.27.3 Production write

Exige:

- Mission/Feature criterion;
- explicit Effect Request;
- D5 Authority;
- Credential Grant;
- rollback/Safety Net;
- environment verification;
- post-effect Receipt;
- Reconcile.

## 10.27.4 Break-glass

Emergency Override não entrega credential universal ao Worker.

Cria Effect Request excepcional com:

- reason;
- scope;
- expiry;
- Operator;
- audit;
- remediation.

---

# 10.28 Prompt injection and instruction hierarchy

## 10.28.1 Untrusted instructions

Texto em:

- source;
- README;
- issue;
- PR;
- web;
- log;
- provider response;

não altera Role Contract.

## 10.28.2 Authority hierarchy

```text
MNFS Domain and Policy
→ Current Authority Snapshot
→ Context Pack / Role Contract
→ Operator Decision
→ task content
→ repository/web content as data
```

Operator Decision entra por state estruturado, não por texto ambíguo dentro do Repository.

## 10.28.3 Exfiltration defense

- no secrets for ordinary readers;
- network off;
- Effect Request for external mutation;
- source-backed decisions;
- bounded tools;
- suspicious content Finding;
- no automatic execution of instructions found in data.

---

# 10.29 Supply-chain security

## 10.29.1 Reference framework

MNFS usa NIST SSDF 1.1 como linguagem de referência para:

- prepare organization;
- protect software;
- produce well-secured software;
- respond to vulnerabilities.

Não como programa de compliance completo no MVP.

## 10.29.2 Pi package supply chain

Regras:

- pin version or commit;
- review source;
- inspect package manifest;
- inspect install scripts;
- record license;
- inventory capabilities;
- test in isolated environment;
- no auto-update during active Mission;
- explicit upgrade.

## 10.29.3 Dependency install

Setup policy pode:

- use lockfile;
- disable arbitrary scripts when possible;
- run install in isolated Environment;
- use registry allowlist;
- verify integrity;
- cache approved artifacts.

## 10.29.4 OpenSSF Scorecard

Pode fornecer supporting evidence sobre:

- branch protection;
- pinned dependencies;
- token permissions;
- security policy;
- vulnerabilities;
- CI tests;
- review;
- release practices.

Não é Verdict final sobre dependency safety.

## 10.29.5 SBOM and provenance

Entram quando:

- release requirements;
- customer requirement;
- supply-chain risk;
- package distribution;
- incident response.

Não são obrigatórios para toda local Feature.

---

# 10.30 Security Standards candidates

```text
SEC-ENV-001
Every executable Role has an Environment Profile.

SEC-FS-001
Writer writes only to declared paths.

SEC-FS-002
Active security policy is outside Worker write authority.

SEC-NET-001
Network is denied by default.

SEC-NET-002
Broad egress requires Effect Policy, not only domain allowlist.

SEC-CRED-001
Secrets never enter Context Packs, prompts or observational memory.

SEC-CRED-002
Temporary credentials are preferred.

SEC-CRED-003
Credential Grant is scoped to Role, target, actions and time.

SEC-EFFECT-001
External mutation requires Effect Request.

SEC-EFFECT-002
Production effects use a separate executor and receipt.

SEC-EXT-001
Pi extensions and packages are pinned and reviewed.

SEC-SUPPLY-001
Dependency installation follows a declared setup policy.

SEC-LOG-001
Sensitive outputs are redacted and access-controlled.

SEC-REC-001
Unknown external effects require reconcile before retry.
```

Todos começam como:

```text
CANDIDATE
```

até piloto e enforcement confiável.

---

# 10.31 Security Context Pack

O ordinary Writer Pack inclui referências, não secrets.

```text
Environment:
  E1 LOCAL_SANDBOX
Policy hash:
  sha256:...
Network:
  OFF
Credentials:
  NONE
Allowed effects:
  X0, X1
Protected paths:
  policy://SEC-POL-004
Escalation:
  Effect Request required for X2+
```

## 10.31.1 Secrets

Pack pode declarar:

```text
requires Credential Class PROVIDER_SANDBOX
```

Não inclui valor.

## 10.31.2 Policy freshness

Mudança em:

- Environment Spec;
- sandbox policy;
- Credential policy;
- network policy;
- effect policy;

torna dispatch ou Pack stale.

---

# 10.32 Security violations

## 10.32.1 Estrutura

```ts
interface SecurityViolation {
  id: string;
  actor: ActorRef;
  target: EntityReference;

  category:
    | 'FILESYSTEM'
    | 'NETWORK'
    | 'CREDENTIAL'
    | 'CAPABILITY'
    | 'POLICY_TAMPER'
    | 'EXTERNAL_EFFECT'
    | 'SUPPLY_CHAIN';

  attemptedOperation: string;
  resource: string;
  policyHash: string;

  blocked: boolean;
  evidenceRef: ArtifactRef;
  observedAt: string;
}
```

## 10.32.2 Interpretação

Uma violation pode ser:

- erro de configuração;
- dependency behavior;
- command legítimo fora da allowlist;
- prompt injection;
- comportamento suspeito.

Não concluir malícia sem evidência.

## 10.32.3 Resposta

- block;
- create Finding;
- request capability;
- amend Profile;
- rotate credentials;
- terminate Run;
- incident response;
- Replan.

---

# 10.33 Incident response

## 10.33.1 Gatilhos

- secret exposed;
- unauthorized external effect;
- sandbox bypass;
- compromised dependency;
- policy tampering;
- suspicious egress;
- production mutation unknown.

## 10.33.2 Fluxo

```text
detect
→ contain
→ preserve evidence
→ revoke credentials
→ classify impact
→ reconcile external state
→ recover
→ root cause
→ update Standards/Golden Path
```

## 10.33.3 Preserve

Não apagar imediatamente:

- logs;
- process data;
- diff;
- Effect Receipt;
- network evidence;
- credential metadata.

Secrets leaked in evidence require restricted storage and redaction, not casual copying.

## 10.33.4 Domain state

Incident pode colocar:

- Track;
- Environment;
- Mission;
- Credential Grant;

em:

```text
SECURITY_BLOCKED
```

---

# 10.34 AS-02 — Local Pi Sandbox on WSL2

## 10.34.1 Objetivo

Validar:

```text
Pi sandbox extension pattern
+
@anthropic-ai/sandbox-runtime
+
Treehouse worktree
+
WSL2
```

## 10.34.2 Ambiente

- canonical WSL2;
- Repository no Linux filesystem;
- pinned Pi version;
- pinned Sandbox Runtime version;
- bubblewrap;
- socat;
- ripgrep;
- controlled sentinel secrets;
- disposable test repo.

## 10.34.3 Cenários

### S1 — Worktree write

Escrita permitida funciona.

### S2 — Host write escape

Escrita fora do worktree falha.

### S3 — Credential read

Tentativas contra:

- `~/.ssh`;
- `~/.aws`;
- `~/.config/gcloud`;
- `~/.kube`;
- sentinel `.env`;

falham.

### S4 — Windows host mounts

Read/write em `/mnt/c` falha por default.

### S5 — Network default

Egress falha.

### S6 — Narrow allowlist

Package/documentation access funciona somente quando configurado.

### S7 — Broad provider risk

GitHub broad access é testado e classificado como insuficiente para write safety.

### S8 — Unix sockets

Docker socket e outros privileged sockets são inacessíveis.

### S9 — Policy tamper

Worker não altera:

- active sandbox policy;
- `.pi` security config;
- `.mnfs`;
- Git hooks/config.

### S10 — Toolchain compatibility

Funcionam:

- Git read/status;
- Node;
- npm;
- TypeScript;
- tests;
- file tools;
- Treehouse path.

### S11 — Child processes

Restrictions propagam.

### S12 — Violation observability

Violation produz evidence ou diagnóstico suficiente.

### S13 — Fail closed

Sandbox unavailable não executa comando diretamente.

### S14 — Performance

Medir:

- spawn latency;
- command latency;
- test latency;
- memory;
- repeated execution.

### S15 — Restart

WSL/process restart não altera policy sem detecção.

## 10.34.4 Acceptance Criteria

1. nenhum protected sentinel é legível;
2. nenhuma escrita escapa das roots autorizadas;
3. network off funciona;
4. allowed domains funcionam sem ampliar write authority;
5. Docker socket permanece bloqueado;
6. active policy é imutável ao Worker;
7. common MNFS toolchain funciona;
8. child process permanece limitado;
9. sandbox failure fecha a execução;
10. overhead é medido;
11. configuration e violations são observáveis;
12. disable/upgrade/removal são documentados.

## 10.34.5 Removal Conditions

Substituir ou remover quando:

- bypass material;
- WSL2 support instável;
- common toolchains exigem exceptions excessivas;
- security diagnostics são insuficientes;
- Pi upgrades quebram repetidamente;
- melhor adapter prova menor risco e complexidade.

---

# 10.35 M2 security slice

M2 não implementa o Security System completo.

Precisa garantir:

```text
one Pi Worker
does not mean
full user authority
```

## Inclui

- explicit cwd;
- `shell: false`;
- arguments separated;
- environment allowlist;
- no production credentials;
- network off by default;
- protected paths;
- external effects denied;
- security policy hash;
- AS-02 or equivalent accepted local boundary before general execution;
- security failure reflected in state;
- no fail-open.

## Não inclui

- generic Credential Broker;
- full Effect Executor;
- Dev Container engine;
- remote sandbox;
- production access;
- OIDC;
- SBOM;
- multi-tenant security;
- security dashboard.

## Contract reconciliation

O Approved Contract de MIS-002 precisará ser reconciliado depois do Blueprint.

A arquitetura não deve permitir que “spawn Pi worker” signifique “spawn unrestricted Pi under the user account.”

---

# 10.36 Adoption matrix

| Tool ou conceito | Decisão | Papel |
|---|---|---|
| Pi tool interception | Adotar | capability enforcement |
| Pi sandbox example | Adotar como pattern | local integration reference |
| Anthropic Sandbox Runtime | Candidato | E1 OS sandbox |
| Dev Container Spec | Suportar | environment-as-code |
| Dev Container CLI | Candidato | local/CI environment adapter |
| Daytona | Future primary candidate | E3 remote workspace |
| E2B | Future alternative | narrow remote sandbox |
| Ona | Reference platform | Software Factory/environment model |
| Firecracker | Future reference | E4 isolation |
| 1Password CLI | Optional binding | local process secret injection |
| SOPS | Optional binding | encrypted config in Git |
| GitHub OIDC | Preferred CI pattern | short-lived cloud identity |
| AWS STS/equivalent | Preferred cloud pattern | temporary credentials |
| NIST SSDF 1.1 | Reference taxonomy | Security Standards |
| OpenSSF Scorecard | Optional supporting evidence | supply-chain risk |

---

# 10.37 Impacto no roadmap

## Antes do M2 unrestricted worker

Executar AS-02.

## M2

Adicionar Minimal Local Security Profile.

## Depois do M2

Entregar:

- Environment Profile v1;
- policy compilation;
- Security Violation model;
- Dev Container discovery;
- Credential Requirement declarations.

## Antes de external integrations generalizadas

Entregar:

- Credential Grant;
- Effect Request;
- Effect Receipt;
- Reconcile;
- provider sandbox policy.

## Antes de remote parallel workers

Avaliar:

- Daytona;
- E2B;
- customer/VPC requirements;
- environment costs;
- persistence;
- security boundaries.

## Antes de cloud multi-tenant

Definir:

- E4 boundary;
- workload identity;
- per-tenant isolation;
- secrets broker;
- audit;
- host hardening;
- incident response.

---

# 10.38 ADRs decorrentes

Após aprovação:

## ADR-0006 — Security planes and local execution isolation

Decide:

- Authority, permission, sandbox e Environment são separados;
- WSL2/worktree não são sandbox;
- E1 é o target local do Writer;
- Sandbox Runtime é candidato após AS-02;
- fail-open é proibido.

## ADR-0007 — Credential grants and external effects

Decide:

- credentials são scoped e temporárias;
- secrets não entram em prompts, Packs ou OM;
- production effects usam separate gate/executor;
- Effect Request/Receipt são duráveis.

## ADR-0008 — Reproducible and remote execution environments

Decide:

- Dev Containers são optional Environment Contract;
- Daytona é future primary remote candidate;
- E2B é alternativa;
- Ona e Firecracker são referências;
- Environment adapters não viram Domain Authority.

---

# 10.39 Non-goals

Não construir agora:

- custom container runtime;
- custom sandbox kernel;
- Firecracker platform;
- Kubernetes;
- service mesh;
- zero-trust platform completa;
- enterprise IAM;
- multiuser RBAC;
- secret manager próprio;
- universal HTTP proxy;
- packet inspection system;
- DLP completa;
- remote execution no M2;
- production automation;
- security compliance certification;
- SBOM obrigatório para toda Feature;
- Scorecard gate universal;
- policy DSL própria;
- automatic secret rotation;
- sandbox bypass detection universal;
- agent com acesso irrestrito “porque o Repository é privado”.

---

# 10.40 Invariantes de segurança

1. Authority e technical isolation são separadas.
2. Worktree não é sandbox.
3. WSL2 não é per-Worker sandbox.
4. Container não é automaticamente secure.
5. Dev Container resolve reproducibility, não toda segurança.
6. Writer possui Environment Profile.
7. Network é denied por default.
8. Filesystem write é allow-only.
9. Sensitive reads são denied.
10. Active security policy é imutável ao Worker.
11. Sandbox failure não executa sem proteção.
12. Pi packages são trusted code.
13. Third-party extensions são pinned e revisadas.
14. Worker não recebe user environment inteiro.
15. Secrets não entram em Context Pack.
16. Secrets não entram em observational memory.
17. SQLite não guarda plaintext secrets.
18. Temporary credentials são preferidas.
19. Credential Grant possui scope e expiry.
20. Production credentials não pertencem ao ordinary Writer.
21. Tool permission não substitui Effect Gate.
22. Effect class depende do impacto, não do command name.
23. X4–X6 usam Effect Request.
24. Production write exige D5 Authority.
25. Unknown external effect exige Reconcile.
26. Domain allowlist não é proteção suficiente contra exfiltration.
27. Docker socket é denied por default.
28. `/mnt/c` é denied para E1 por default.
29. Untrusted content não concede Authority.
30. Dependency setup ocorre sob policy.
31. Supply-chain score é supporting evidence.
32. Security Violation não presume malícia.
33. Incident preserva evidence e revoga credentials.
34. Remote Environment é adapter substituível.
35. M2 não executa unrestricted Pi como definição de sucesso.
36. Security tooling entra por spike, Acceptance Criteria e Removal Conditions.

---

# Decisão resumida da Seção 10

> **O MNFS adota defesa em profundidade e separa Domain Authority, tool capability, process sandbox, execution environment, credential grant, network policy e external-effect gate. O target local do Writer será E1: Treehouse worktree executado por Pi dentro de uma boundary de sistema operacional, com writes allow-only, sensitive reads bloqueados, network off, policy imutável e ausência de production credentials. A integração Pi + Anthropic Sandbox Runtime é candidata e precisa passar pelo AS-02 no WSL2. Dev Containers serão suportados como environment-as-code; Daytona é o principal candidato remoto futuro; E2B é alternativa; Ona e Firecracker são referências. Credentials serão temporárias e process-scoped; external mutations serão governadas por Effect Request, Effect Executor e Effect Receipt. M2 permanecerá simples, mas não poderá equivaler a executar um Pi Worker irrestrito com todos os poderes do usuário.**

---
