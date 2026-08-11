# Organização da plataforma — navegação, perfis e fluxo de dados

> Documento de **planejamento**, não de execução. Nada aqui foi despachado para o agente.
> Escrito em 11/08/2026 a pedido do usuário: *"vamos organizar a plataforma… criar um campo de
> engrenagem configuração… pensar em tipos de usuário… mas tem que ter um fluxo e lógica de dados"*.

---

## 1. O diagnóstico da navegação atual

Hoje são 16 rotas em três grupos: **Decidir**, **Operar**, **Fonte (ERP)**.

O agrupamento existe, mas mistura duas naturezas que não deveriam conviver:

| Rota | Grupo hoje | Natureza real |
|---|---|---|
| `/canais` | Operar | **configuração** — política de comissão, frete, prazo |
| `/integracao/mercado-livre` | Operar | **configuração** — conexão técnica |
| `/custos` | Operar | **configuração/importação** |
| `/integracao` | Fonte (ERP) | **configuração** — cobertura de fontes |

O erro de fundo: **a navegação está organizada por tabela, não por momento de trabalho.** Quem
abre o app não pensa "quero ver a tabela de canais" — pensa "o que eu faço agora?" ou "por que
esse número está assim?".

Regra de corte proposta: **o que se configura uma vez sai da navegação principal e vai para a
engrenagem. O que se decide todo dia fica.**

---

## 2. Navegação proposta

### Trabalho do dia
- **Visão Geral** — chegada, o que é real, o que está esperando pessoa
- **Fila do dia** — porta única do que precisa de decisão humana (categoria a confirmar, vínculo
  em disputa, alerta aberto). As telas fundas continuam existindo; a fila é a **porta**, não o
  substituto
- **Expedição** — *novo*, o kanban do funcionário (ver §4)

### Anúncios
- **Anúncios** — já no canal / em preparação (a separação já foi corrigida)
- **Prontidão de anúncio**
- **Oportunidades**

### Dinheiro
- **Simulador**
- (futuro) **Margem por anúncio**, quando o custo destravar

### Fonte (ERP)
- **Catálogo**
- **Demanda**

### ⚙ Configuração *(engrenagem, fora da navegação principal)*
- **Canais** — política comercial por canal
- **Conexões** — `/integracao` + `/integracao/mercado-livre` fundidos, uma aba por canal
- **Custos** — importação e origem do custo
- **Fontes e cobertura** — o que hoje é o aviso "Amostra parcial", virando página com ação
- **Usuários e perfis** — ver §3

**Fusões propostas:** `/integracao` + `/integracao/mercado-livre` + parte de `/canais` viram uma
área só de Conexões, com aba por canal. Três portas para o mesmo assunto é o que faz a plataforma
parecer maior e mais confusa do que é.

---

## 3. Perfis de usuário

### 3.1 O bloqueio que vem antes

O app guarda a sessão num Bearer em `localStorage`, e o [OBS-36](17-log-observacao-mitra.md) mediu
que **o token de sessão do app publicado viaja na URL e vale ~27 anos**.

Hoje isso é um defeito. **Com perfis, vira grave:** um link copiado dá acesso permanente com os
poderes daquele perfil, e não há como revogar. Perfil construído sobre esse token é decorativo.

> **Pré-requisito duro:** sessão com validade curta, renovável, que não viaja na URL. Sem isso,
> não construir perfis — construir seria dar a impressão de controle sem o controle.

### 3.2 Os três perfis

| Perfil | Vê | Não vê | Pode registrar |
|---|---|---|---|
| **Operador de expedição** | Expedição e só. Pedido, itens, quantidade, endereço de envio | preço de custo, margem, configuração, catálogo inteiro | avanço de etapa do próprio pedido |
| **Analista de anúncio** | Prontidão, categoria, vínculo, anúncios, simulador, oportunidades | configuração de conexão, usuários | decisão de categoria, decisão de vínculo, rascunho de anúncio |
| **Supervisor** | tudo, incluindo configuração e a trilha de quem decidiu o quê | — | tudo o que os outros podem, mais configuração |

A visão estreita do operador é **recurso, não limitação**: menos tela é menos erro, e margem não é
assunto de quem embala.

### 3.3 O ganho de governança que vem de graça

Hoje o app distingue `CORROBORADA` (máquina) de `CONFIRMADA_POR_PESSOA` (humano). Com perfis, a
segunda passa a carregar **qual** pessoa. A decisão ganha autor, e a trilha de auditoria deixa de
ser "alguém confirmou" para virar "fulano confirmou às 14h32, com esta evidência na tela".

Isso alimenta diretamente o *Passaporte de Decisão* que está parado em
[18-plano-loop-governado.md](18-plano-loop-governado.md).

---

## 4. Expedição — e o limite que precisa ser declarado

### 4.1 Onde a escrita pode morar

Marcar "embalado" é uma escrita. Os três destinos possíveis:

| Destino | Permitido? |
|---|---|
| Mercado Livre (status de envio) | **não** — escrita em marketplace |
| Sankhya (baixa, expedição) | **não** — ERP é somente leitura |
| **Banco do próprio app** | **sim** |

Consequência que precisa ser dita em voz alta: **o funcionário marca embalado no nosso sistema e o
Mercado Livre continua sem saber.** O app vira uma camada de *preparação e conferência*, não o
sistema de registro da expedição.

Isso é coerente com o resto do produto — decisão registrada localmente, efeito externo bloqueado —
mas é meio sistema **por escolha**, e a escolha é do usuário, não minha.

### 4.2 Qual pedido alimenta a fila

| Fonte | Natureza | Serve para embalar? |
|---|---|---|
| Pedidos reais do ML (`/orders/search`, já devolveu 200) | reais, poucos | **sim** — são vendas de verdade |
| 9.366 pedidos do Sankhya | volume, mas **base de teste** | não — ninguém embala pedido de teste |

Recomendação: a Expedição nasce sobre os pedidos reais do ML. Volume vem depois, se a base de
produção entrar.

### 4.3 Kanban ou lista?

Kanban serve quando a etapa é ambígua e a pessoa escolhe o que puxar. Expedição costuma ser
**fila ordenada** — o mais antigo primeiro, ou o de prazo mais apertado. Proposta: **lista
priorizada com etapas explícitas** (a separar → separado → embalado → despachado) em vez de
colunas arrastáveis. Menos bonito, menos erro, e o critério de ordem fica visível em vez de
escondido na posição do cartão.

Decidir com o usuário antes de construir.

---

## 5. O fluxo de dados, ponta a ponta

```
  Sankhya (ERP)  ──leitura──▶  espelho local  ──▶  prontidão / decisões locais
                                                          │
                                                          ▼
                                              anúncio EM PREPARAÇÃO
                                                          │
                                              ╔═══════════▼═══════════╗
                                              ║  BARREIRA 1           ║
                                              ║  publicação bloqueada ║
                                              ╚═══════════════════════╝

  Mercado Livre  ──leitura──▶  espelho de anúncio  ──▶  vínculo anúncio ↔ SKU
        │                                                       │
        └──leitura──▶  pedidos reais  ──▶  EXPEDIÇÃO (estado local)
                                                          │
                                              ╔═══════════▼═══════════╗
                                              ║  BARREIRA 2           ║
                                              ║  baixa no ERP e       ║
                                              ║  status no canal      ║
                                              ║  bloqueados           ║
                                              ╚═══════════════════════╝
```

**Duas barreiras, ambas explícitas. Tudo entre elas é nosso e é onde o produto vive.**

Cada barreira precisa de teste executável com isca — o padrão que já funcionou em
`test-metodo-ml.mjs` e `test-renovacao.mjs`. Barreira que não reprova o padrão proibido nasce
morta.

---

## 6. Perguntas abertas — **respondidas em 11/08/2026**

As respostas mudaram três decisões estruturais. O desenho que saiu delas está em
[21-fluxo-pedido-erp.md](21-fluxo-pedido-erp.md).

| # | Pergunta | Resposta | O que muda |
|---|---|---|---|
| 1 | Expedição meia-boca é aceitável? | **Não precisa ser meia-boca — escrita no Sankhya autorizada** (base de teste). Pedido do ML vira pedido de venda, botão de confirmar faturamento gera a nota, e o kanban anda | §4.1 abaixo está **superado**. Escopo estreito e barreiras em [21](21-fluxo-pedido-erp.md) §1 e §5 |
| 2 | Kanban ou fila priorizada? | **Kanban**, mas *"o operador só leria o kanban para entender o fluxo"* | Resolve melhor que as duas opções: o cartão **não é arrastado**, ele anda porque o estado real andou. [21](21-fluxo-pedido-erp.md) §3 |
| 3 | Consertar a sessão antes dos perfis? | *"Somente se for necessário, já que o login é fake, só para eles visualizarem"* | O pré-requisito duro de §3.1 **não se aplica** a um seletor de papel: ele não cria poder novo. Vira "filtro de visão, não permissão", declarado na tela |
| 4 | Quantos pedidos reais o ML tem? | **Abertos = zero.** Muitos já enviados, em fluxo. *"Tem que estudar payload e API do Mercado Livre"* | Vira **pré-requisito medido**: a primeira coluna do kanban nasce vazia. [21](21-fluxo-pedido-erp.md) §7 |
| 5 | Três perfis bastam? | *"Não, por agora não"* — **dois**: funcionário e supervisor | O perfil "Analista de anúncio" de §3.2 sai por ora |

### Superado por estas respostas

- **§3.1** (sessão como pré-requisito duro) — continua verdadeiro para permissão real, mas não
  bloqueia o login demonstrativo.
- **§4.1** (tabela de onde a escrita pode morar) — a linha "Sankhya: **não**" caiu. Mercado Livre
  continua **não**.
- **§4.3** (recomendação de fila em vez de kanban) — decidido kanban não-arrastável.
