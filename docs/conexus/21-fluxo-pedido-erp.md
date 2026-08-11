# Fluxo do pedido — do Mercado Livre ao ERP

> **Planejamento.** Nada aqui foi despachado. Escrito em 11/08/2026 depois de o usuário responder
> as cinco perguntas abertas de [20-arquitetura-plataforma.md](20-arquitetura-plataforma.md).
>
> Este documento existe porque uma restrição permanente **mudou**, e mudança de restrição precisa
> ficar escrita com escopo, data e barreira — não virar lembrança.

---

## 1. A autorização de escrita — escopo exato

Restrição anterior, em vigor desde o início do projeto: *"Sankhya é somente leitura. A liberação
virá em mensagem explícita minha."*

Mensagem explícita recebida em 11/08/2026: *"vamos já autorizar escrita no Sankhya, porque é base
de teste então é tranquilo"*.

### 1.1 O que passa a ser permitido

| Operação | Permitida | Condição |
|---|---|---|
| Criar **pedido de venda** (TOP de pedido) | **sim** | só a partir de pedido real do canal, um por pedido do canal |
| **Faturar** → gerar nota (TOP de NFE) | **sim** | só sobre pedido que **nós** criamos e que está no nosso vínculo |
| Ler qualquer coisa (GET, DbExplorer `SELECT`) | sim | já era |

### 1.2 O que continua proibido — e vira barreira com isca

| Operação | Estado | Por quê |
|---|---|---|
| `DELETE` / cancelamento de qualquer registro | **proibido** | não foi autorizado, e é o único irreversível de verdade |
| `UPDATE` de registro que não nasceu de nós | **proibido** | a autorização é para *criar o nosso fluxo*, não para editar a base alheia |
| Qualquer SQL não-`SELECT` via **DbExplorer** | **proibido** | o DbExplorer aceita SQL arbitrário. Escrita vai por **serviço nomeado**, nunca por SQL solto — assim o que é permitido é enumerável |
| Escrita em marketplace (status, resposta, anúncio) | **proibido** | inalterado |
| Escrita fora da base de teste | **proibido** | ver §5.3 — a base precisa ser *provada*, não configurada |

**Regra de fundo:** ampliar autorização é motivo para **mais** barreira, não menos. Antes, "Sankhya
só leitura" era uma frase única e fácil de verificar. Agora a fronteira é fina, e fronteira fina só
se sustenta em teste executável.

---

## 2. Quem é dono de cada estado

Este é o ponto que decide se o kanban funciona ou vira a próxima contradição.

O app **já sofreu** exatamente esse erro: a home e a Prontidão mediam coisas diferentes com o mesmo
rótulo, e o resultado foi um número acusar o catálogo por uma falha de importação. A causa era duas
derivações do mesmo fato. Aqui o risco é idêntico e maior: se guardarmos "faturada" no nosso banco
**e** o Sankhya guardar a nota, existem duas verdades, e elas vão divergir no primeiro erro de rede.

**Regra: cada coluna do kanban é derivada de exatamente uma autoridade.**

| Estado | Autoridade | Como é lido |
|---|---|---|
| Vendido no canal | **Mercado Livre** | pedido do canal, espelhado |
| Pedido criado no ERP | **Sankhya** | existe `NUNOTA` de pedido vinculado ao pedido do canal |
| Faturada | **Sankhya** | existe nota gerada a partir daquele pedido |
| **Separada / Embalada / Despachada** | **nosso banco** | ninguém mais registra isso — nem o ERP, nem o canal |

As três primeiras **nós não escrevemos como estado** — nós disparamos a ação e depois *lemos* o
resultado. Se a leitura discordar do que achamos que fizemos, quem ganha é o ERP, e a divergência
aparece na tela como divergência, não como número escolhido.

> Frase que precisa estar na tela: **"Faturada" quem diz é o Sankhya. Se o cartão não moveu, a nota
> não existe lá.**

---

## 3. O kanban

Pedido do usuário: *"vai movendo no Kanban… o operador só leria o Kanban para entender o fluxo tipo
faturada, embalagem"*.

Isso resolve a pergunta "kanban arrastável ou fila priorizada" de um jeito melhor do que as duas
opções: **o cartão não é arrastado — ele anda porque o estado real andou.**

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Vendido      │ Pedido no    │ Faturada     │ Em embalagem │ Despachada   │
│ no canal     │ ERP          │              │              │              │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ fonte: ML    │ fonte:       │ fonte:       │ fonte: nosso │ fonte: nosso │
│              │ Sankhya      │ Sankhya      │ banco        │ banco        │
│              │              │              │              │              │
│ ação:        │ ação:        │ ação:        │ ação:        │ (fim do que  │
│ [criar no    │ [confirmar   │ [iniciar     │ [marcar      │ podemos      │
│  ERP]        │  faturamento]│  embalagem]  │  despachada] │  registrar)  │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
       │              │              │
       └──── escreve no Sankhya ─────┘        └── escreve só no nosso banco ──┘
```

Duas naturezas de coluna, e a tela precisa mostrar a diferença — não por estética, por
responsabilidade: nas três primeiras o app **causa efeito num sistema de registro**; nas duas
últimas ele guarda uma anotação nossa.

**Limite que continua valendo e precisa estar escrito no rodapé da coluna:** *"Despachada" é
registro nosso. O Mercado Livre não fica sabendo por aqui.* A autorização de escrita cobriu o
Sankhya; não cobriu o canal.

O operador **não arrasta**. Ele aperta um botão de ação na coluna em que o pedido está. Ordem
dentro da coluna: mais antigo primeiro, com o prazo do canal visível.

---

## 4. Idempotência — o risco número um da escrita

Escrever num ERP tem um modo de falha que leitura não tem: **fazer duas vezes**. Pedido duplicado
não é bug de tela, é documento a mais na base.

### 4.1 O trinco

Uma tabela de vínculo, e a **restrição de unicidade é o trinco** — não um `if` no código:

```
PEDIDO_CANAL_ERP
  CANAL_ID
  PEDIDO_CANAL_ID          -- id do pedido no ML
  ESTADO                   -- INTENCAO | CRIADO | FALHOU
  NUNOTA_PEDIDO            -- preenchido depois
  NUNOTA_NOTA              -- preenchido no faturamento
  CRIADO_EM / ATUALIZADO_EM
  UNIQUE (CANAL_ID, PEDIDO_CANAL_ID)
```

Sequência obrigatória:

1. `INSERT` da intenção. **Se a unicidade recusar, para aqui** — outro alguém já está criando. Nenhuma chamada ao ERP acontece.
2. Só quem ganhou o `INSERT` chama o Sankhya.
3. Grava `NUNOTA` e passa para `CRIADO`.

Mesmo padrão já provado em `test-renovacao.mjs`: **quem decide a corrida é o banco**, não uma
releitura comparada em memória. Aquela trava, na versão errada, deixou passar 2 renovações em três
formas de corrida diferentes. Aqui o custo do mesmo erro é pedido duplicado no ERP.

### 4.2 A janela de crash

Entre o passo 2 e o 3 existe um buraco: chamamos o Sankhya e morremos antes de anotar o `NUNOTA`.
O vínculo fica em `INTENCAO` e **não sabemos** se o documento existe lá.

Sem tratamento, a recuperação é adivinhação. Com um detalhe simples, vira leitura:

> **Carimbar o id do pedido do canal dentro do próprio registro do Sankhya** (campo de observação
> ou campo `AD_`, a definir na sondagem).

Aí a reconciliação é um `SELECT`: procura pelo id do canal, achou → adota o `NUNOTA`; não achou →
recria. **A escrita passa a ser auto-reconciliável.** Sem o carimbo, não há recuperação possível —
e por isso o carimbo é requisito, não enfeite.

---

## 5. A barreira, com iscas

Padrão já usado em `test-metodo-ml.mjs` e `test-renovacao.mjs`: regra que não reprova o padrão
proibido nasce morta.

### 5.1 Iscas que o teste precisa reprovar

| # | Isca | Resultado exigido |
|---|---|---|
| I1 | `UPDATE`/`DELETE`/`INSERT` enviado ao DbExplorer | recusado antes de sair |
| I2 | Criar pedido para um `PEDIDO_CANAL_ID` que já tem vínculo | recusado, zero chamadas ao ERP |
| I3 | Faturar um `NUNOTA` que não está no nosso vínculo | recusado |
| I4 | Qualquer chamada de cancelamento/exclusão | recusado |
| I5 | Escrita com o identificador de base diferente do de teste | recusado |
| I6 | Escrita em host de marketplace | recusado (já existe, não pode enfraquecer) |

### 5.2 O critério tem que ser egresso, não destino

Erro já cometido nesta plataforma: a barreira de método detectava "fala com o ML" pelo **hostname**.
Quando o host passou a vir do banco, nenhum código novo continha "mercadolibre" e a barreira parou
de vigiar sem avisar.

Portanto: **qualquer código que faça egresso** (`fetch`, `https`, `callIntegrationMitra`) entra na
inspeção. Escrita permitida é a que se **declara** — passa por uma função nomeada única com o
escopo do §1.1. Chamada de escrita que não passe por ela é reprovada por construção.

### 5.3 A base precisa ser provada

"É base de teste, então é tranquilo" é verdade **hoje**. Uma configuração trocada, e a mesma barreira
autoriza escrita em produção sem mudar uma linha de código.

Requisito: antes da primeira escrita, ler um identificador da instância e **comparar com o
identificador de teste conhecido**. Diferente → recusa. Isso é a isca I5, e é a única proteção que
sobrevive a alguém editando a configuração.

---

## 6. A página de configuração da integração Sankhya

Vai para a **⚙ Configuração**, conforme §2 de [20](20-arquitetura-plataforma.md). Pedido direto do
usuário: *"dá para deixar tudo isso em uma página de configuração de integração do Sankhya"*.

| Campo | Para quê | Origem |
|---|---|---|
| TOP de pedido de venda | qual operação cria o pedido | escolhido de lista lida do ERP |
| TOP de nota (NFE) | qual operação fatura | idem |
| Empresa / Série | obrigatórios do documento | idem |
| Tipo de negociação | condição de pagamento | idem |
| Parceiro padrão do canal | quem é o cliente do pedido de marketplace | ver §6.1 |
| Campo de carimbo do id do canal | onde gravamos o id do ML (§4.2) | definido na sondagem |
| Identificador da base | o que a isca I5 compara | lido, **não digitado** |
| Escrita habilitada | interruptor visível | nosso |

As listas de TOP, empresa, série e negociação **são lidas do ERP** e escolhidas numa lista. Digitar
código de TOP à mão é como o operador erra e o pedido nasce com a operação errada.

### 6.1 O comprador — e um cuidado de dado pessoal

O pedido do ML traz dados do comprador. Copiar isso para o ERP significa levar dado pessoal de
pessoa real para uma base de teste, e para dentro de logs.

Padrão proposto: **um parceiro genérico do canal** ("Consumidor Mercado Livre"), configurável. Se
depois for preciso parceiro por comprador, é decisão separada, com o motivo escrito.

Vale independente disso: **nenhum dado de comprador em doc, log ou prompt.**

---

## 7. O problema que a resposta 3 revelou

Resposta do usuário: *"Abertos zeros, mas tem muitos já enviados em fluxo, tem que avaliar isso,
estudar payload e API do Mercado Livre."*

Consequência direta: **hoje não existe pedido aberto para alimentar a primeira coluna.** Um kanban
cujo primeiro estágio nasce vazio não demonstra fluxo — demonstra tela vazia.

Antes de construir, é preciso medir, e a medição é uma tarefa de leitura:

- quantos pedidos existem no total, por status (`paid`, `shipped`, `delivered`, `cancelled`)
- qual a janela de datas que a API devolve
- que campos vêm no payload: itens, SKU do vendedor, quantidade, valor, frete, prazo
- se o SKU do anúncio no pedido casa com o vínculo que já temos (30 anúncios ligados)

Três saídas possíveis, decididas **depois** da medição, não antes:

| Se… | Então |
|---|---|
| existem pedidos enviados com payload completo | o kanban nasce com pedidos reais, rotulados **"pedido real de <data>, reprocessado para demonstração"** |
| o payload de pedido antigo vier pobre | mostrar o fluxo com o que houver e declarar o que falta |
| nada utilizável | a Expedição não entra na demonstração — melhor ausente do que fingida |

**Não inventar pedido.** Todo o valor desta plataforma até aqui vem de cada número dizer o que mede.
Um pedido fabricado dentro de um fluxo que grava no ERP é o pior lugar possível para começar a
fingir.

---

## 8. Login demonstrativo

Pedido do usuário: *"queria ter a opção de login mas só demonstrativo… só escolher login como
funcionário e como supervisor"*. E sobre consertar a sessão: *"somente se for necessário, já que
login é fake, só para eles visualizarem"*.

Decisão: **não consertar a sessão agora.** O pré-requisito duro que eu havia levantado (o token de
~27 anos viajando na URL, OBS-36) existe para proteger poder real. Um seletor de papel que só troca
a visão não cria poder novo — logo, não puxa o pré-requisito junto.

Desenho:

- tela com duas escolhas: **Funcionário** · **Supervisor**
- o papel muda o que a navegação mostra
- trocar de papel é um clique, sem senha, sem cadastro
- **a tela diz o que é**: *"Seleção de perfil para demonstração. Não é autenticação."*

| Papel | Vê |
|---|---|
| **Funcionário** | Expedição, e só. Pedido, itens, quantidade, endereço. **Sem custo, sem margem, sem configuração** |
| **Supervisor** | tudo, incluindo ⚙ Configuração |

Dois papéis bastam — o usuário respondeu *"não, por agora não"* para papéis adicionais.

> Limite a declarar: **isto é filtro de visão, não permissão.** Nada aqui impede alguém de trocar
> o papel no navegador. Vira permissão de verdade no dia em que a sessão for consertada.

A visão estreita do funcionário é **recurso**: menos tela é menos erro, e margem não é assunto de
quem embala.

---

## 9. Ordem de execução

Escalada deliberada: **ler → desenhar → escrever.** O irreversível vai por último, com o máximo de
evidência acumulada.

| Lote | O que | Risco | Por que nesta ordem |
|---|---|---|---|
| **atual** | A1–A4 (contadores, alerta de estoque, vocabulário, paginação) | nenhum | já em voo |
| **2** | **Leitura, tudo `SELECT`/GET:** custo via DbExplorer (B1) · lista de TOP/empresa/série · estrutura do pedido no ERP · medir pedidos reais do ML (B5, §7) | nenhum — nenhuma escrita | é o lote que **decide** o desenho do 4. Fazer o 4 antes é chutar |
| **3** | Login demonstrativo · reorganização da navegação · ⚙ Configuração (páginas ainda sem gravar no ERP) | nenhum — frontend | independente do lote 2, pode andar em paralelo se o 2 travar |
| **4** | **Escrita:** trinco de idempotência · barreira com as 6 iscas · criar pedido · faturar | **alto** | só depois de 2 e 3, e a barreira **entra antes** da primeira chamada de escrita |

Dentro do lote 4, a ordem também é fixa: **barreira e iscas primeiro, escrita depois.** Barreira
escrita depois da funcionalidade é barreira desenhada para deixar passar o que já existe.

---

## 10. O que ainda não sei, e vou descobrir por sondagem

Honestidade sobre o grau de certeza — nada abaixo foi verificado nesta instância:

- os nomes exatos dos serviços de gravação e de faturamento da API Sankhya do cliente
- se o faturamento é um serviço direto ou um fluxo de confirmação em etapas
- qual campo aceita o carimbo do id do canal (§4.2) sem atrapalhar nada
- que identificador de instância dá para ler para a isca I5 (§5.3)

Tudo isso é resolvido no **lote 2**, só com leitura. Nenhuma escrita antes de essas quatro estarem
respondidas por medição.
