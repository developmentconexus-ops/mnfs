# 3C-01 — Modular Monolith no F1

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão

O Conexus F1 será realizado como **modular monolith no Hub**: um único backend Node/TypeScript implantável, dividido em módulos de domínio/capability com ownership explícito, APIs internas estreitas e dependências controladas.

Os módulos são boundaries de código e domínio, **não microservices**.

```text
Conexus Hub
│
├── Identity & Access
├── Workspace
├── Project
├── Builder
├── Artifact Registry
├── Connections
├── Capability Gateway
├── Brain
├── Production Agent Runtime
├── Release / Deployment
├── Observability
└── Storage
```

A lista acima é ponto de partida para 3C, não catálogo final de módulos. 3C deverá validar, fundir, dividir ou renomear módulos conforme responsabilidades e consumidores reais.

## Fora do processo do Hub por natureza

```text
PostgreSQL
E2B sandbox / Pi worker
GitHub
external systems
blob/object storage
```

Esses componentes externos não transformam os módulos internos em serviços distribuídos.

## Invariantes

1. Um deployable backend principal no F1.
2. Módulos internos não ganham rede, service discovery ou deployment lifecycle próprios por default.
3. Cada módulo deve possuir responsabilidade clara, ownership explícito e public internal API definida.
4. Consumers não importam internals de outro módulo livremente.
5. Compartilhar `hub_control` fisicamente não autoriza acesso arbitrário às tabelas de outro módulo; ownership de dados será definido em 3E.
6. Cross-module calls permanecem in-process até existir requisito real que justifique processo/serviço separado.
7. Boundaries preservam replaceability por isolamento, não por abstrações genéricas antecipadas.
8. Microservices, service mesh, distributed transactions e deploy independente por módulo ficam fora do F1 sem consumidor e requisito operacional reais.

## Racional

O modular monolith preserva boundaries necessárias para evolução e testabilidade sem introduzir prematuramente custo de rede, consistência distribuída, observabilidade cross-service, service discovery, versionamento de protocolos internos e coordenação de deployments.

Se um módulo futuramente demonstrar necessidade real de isolamento operacional — escala independente, trust boundary física, disponibilidade distinta ou lifecycle de deployment próprio — sua extração poderá ser avaliada atrás da API interna já existente.

## Próximo passo

A próxima sessão inicia 3C propriamente dita, definindo para cada módulo candidato:

```text
responsabilidade
owns
does not own
public internal API
allowed dependencies
forbidden dependencies
events/interactions
authority boundary
```

Nenhum detalhe de implementação, tabela ou framework adicional é autorizado por esta decisão.
