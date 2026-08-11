# Backlog — Marketplace Central

> Fila combinada entre o usuário e o Claude condutor. Serve para **não despachar tudo de uma vez**
> no agente da Mitra. Um lote por turno; o próximo só entra depois de o anterior fechar e ser
> conferido na tela publicada.
>
> Atualizado em 11/08/2026. Legenda de estado: **EM VOO** (turno atual do agente) · **PRONTO**
> (pode despachar) · **BLOQUEADO** (falta pré-requisito) · **PARADO** (decisão de não fazer agora).

---

## A. EM VOO — turno atual do agente

| # | Item | Observação |
|---|---|---|
| A1 | Contadores derivados de lista truncada | Cresceu de 3 casos declarados para ≥7 medidos: ABC 400/5.942, Confirmar categoria 40/925, Fila 60/1.622, Alertas com `LIMIT 200`, "Pronto e não vende" 30, CSV 300 |
| A2 | Alerta de estoque canal × ERP nos 30 vinculados | Exige mostrar os dois lados **com data de cada leitura** e declarar a idade do espelho |
| A3 | Vocabulário de status do canal | `under_review` cru convivendo com "Pausado no canal"; mapeamento vira dado por canal; status desconhecido aparece cru e marcado |
| A4 | Paginação duplicada em `/anuncios` | Cosmético |

---

## B. PRONTO — pode despachar, em ordem de valor

> Ordem revista em 11/08 depois das respostas do usuário. A escrita no Sankhya foi autorizada
> (escopo estreito em [21-fluxo-pedido-erp.md](21-fluxo-pedido-erp.md) §1) e isso criou uma escada:
> **lote 2 = só leitura · lote 3 = só frontend · lote 4 = a escrita.** Os lotes 2 e 3 são
> independentes; o 4 depende dos dois.

### Lote 2 — leitura pura (`SELECT` / GET, nenhuma escrita)

| # | Item | Por que vale | Risco |
|---|---|---|---|
| **B1** | **Custo real via DbExplorer** (`CUSSEMICMS`) | Destrava tudo que é financeiro. `PRODUTO_CUSTOS` tem 0 linhas hoje | Mecanismo novo. **Exige trava `SELECT`-only com isca executável** — DbExplorer aceita SQL arbitrário, então a proibição de SQL de escrita precisa virar estrutura, não lembrança |
| **B11** | **Sondar a estrutura do pedido no ERP** — lista de TOP (pedido e NFE), empresa, série, tipo de negociação, campo que aceita o carimbo do id do canal, identificador de instância | São as 4 incógnitas de [21](21-fluxo-pedido-erp.md) §10. Sem elas, o lote 4 é chute | Nenhum — mesmo mecanismo `SELECT` do B1 |
| **B5'** | **Medir os pedidos reais do ML** — total por status, janela de datas, campos do payload, se o SKU casa com os 30 vínculos | Usuário informou: **abertos = zero**, muitos já enviados. Decide se a Expedição entra na demonstração ou não ([21](21-fluxo-pedido-erp.md) §7) | Baixo — leitura |

### Lote 3 — frontend, sem tocar em ERP

| # | Item | Por que vale | Risco |
|---|---|---|---|
| **B12** | **Login demonstrativo** — Funcionário · Supervisor, com a tela declarando *"não é autenticação"* | Pedido direto. Não puxa o conserto de sessão junto, porque não cria poder novo ([21](21-fluxo-pedido-erp.md) §8) | Nenhum |
| **B13** | **Reorganizar a navegação + ⚙ Configuração** — fundir `/integracao` + `/integracao/mercado-livre` + parte de `/canais` | Hoje são três portas para o mesmo assunto ([20](20-arquitetura-plataforma.md) §2) | Nenhum |
| **B14** | **Página de configuração da integração Sankhya** — TOPs, empresa, série, negociação, parceiro do canal, escolhidos de **lista lida do ERP**, não digitados | Digitar código de TOP à mão é como o pedido nasce com a operação errada | Nenhum enquanto só grava configuração |

### Lote 4 — escrita no ERP (barreira **antes** da funcionalidade)

| # | Item | Por que vale | Risco |
|---|---|---|---|
| **B15** | **Barreira de escrita + as 6 iscas** (I1–I6 de [21](21-fluxo-pedido-erp.md) §5.1) | Regra que não reprova o padrão proibido nasce morta | — é a trava |
| **B16** | **Trinco de idempotência** — `UNIQUE (CANAL_ID, PEDIDO_CANAL_ID)` decidido pelo banco + carimbo do id do canal no registro do ERP | Sem isso, pedido duplicado no ERP e nenhuma recuperação possível após crash | **Alto** se malfeito |
| **B17** | **Criar pedido de venda** a partir do pedido do canal | É o fluxo que o usuário desenhou | Alto |
| **B18** | **Confirmar faturamento** → nota | idem | Alto |
| **B19** | **Kanban de expedição** — 3 colunas derivadas do ERP, 2 do nosso banco, com a fonte declarada em cada uma | O operador lê o fluxo. Cartão anda porque o estado real andou, não porque foi arrastado | Médio — o risco é a dupla verdade ([21](21-fluxo-pedido-erp.md) §2) |

### Sem lote fixo — entram quando couber

| # | Item | Por que vale | Risco |
|---|---|---|---|
| **B2** | **Comissão real da API do ML** (`/sites/MLB/listing_prices`) | Hoje 14% é **chute nosso**. A taxa real vem por preço, categoria e tipo de anúncio | Baixo — leitura pública, já provada acessível |
| **B3** | **Ficha do anúncio** (clicar → tudo) | É o pedido direto do usuário. Casa natural para preço, comissão, frete, imposto, custo, estoque dos dois lados, giro — **cada campo com fonte e data ao lado** | Baixo |
| **B4** | **Frete real do anúncio** | A modalidade de envio vem no próprio anúncio; hoje é regra local ("grátis acima de R$79") | Baixo |
| **B5** | **Pedidos reais do ML** (`/orders/search` já devolveu 200) | Giro real por anúncio. Muito melhor que a amostra de pedidos do ERP (<1%, enviesada por recência) | Baixo |
| **B6** | **"Vai acabar em N dias"** | Velocidade real do ML × saldo real do ERP. Estoque inteligente com tudo medido, **sem depender de custo** | Depende de B5 |
| **B7** | **Anúncio ativo com estoque zero no ERP** | Risco de venda que não pode ser entregue → cancelamento e reputação no ML | Baixo |
| **B8** | **Anúncio pausado com estoque parado** | Dinheiro dormindo. Já visto na tela: "Pausado no canal" com 6 em estoque | Baixo |
| **B9** | Os 4 anúncios sem ligação | 1 com EAN em disputa + 3 sem EAN declarado no canal. Fila curta de decisão humana, já modelada | Baixo |
| **B10** | Perguntas do ML | `/my/received_questions/search` responde 200 (0 hoje). **Só leitura — responder é proibido** | Baixo |

---

## C. BLOQUEADO — falta pré-requisito

| # | Item | Depende de |
|---|---|---|
| C1 | Lucro real por anúncio (preço − comissão − frete − ICMS − custo) | **B1** |
| C2 | Preço abaixo do ponto de equilíbrio | **B1** |
| C3 | Curva ABC demanda × margem | **B1** — e o Codex mandou cortar enquanto a amostra de pedidos cobrir <1% |
| C4 | Outros marketplaces com dado real | Contrato comercial com cada canal. **Decisão de negócio, não técnica** — só o ML tem API pública utilizável sem credencial de seller |

---

## D. PARADO de propósito

| # | Item | Motivo |
|---|---|---|
| D1 | Loop Governado (ferramentas, três telas) | Decisão do usuário: plataforma operacional primeiro. Ver [18-plano-loop-governado.md](18-plano-loop-governado.md) |
| D2 | Passaporte de Decisão por SKU | Mesma decisão |
| D3 | Redesenho geral de frontend | Dispersão |
| D4 | Gerador de anúncios separado | Só dentro do loop, quando ele vier |

---

## E. Dívida nossa (fora da Mitra)

| # | Item | Estado |
|---|---|---|
| E1 | OBS-73 no log de observação | ✅ escrito |
| E2 | OBS-74 — renovação forçada, trava furada, 403 ≠ 401 | ❌ falta |
| E3 | OBS-75 — varredura de coerência, contradição home × prontidão | ❌ falta |
| E4 | Ratificar o tópico 16 como `C-0xx` em `DECISOES.md` | ❌ falta |
| E5 | Commitar os docs | ❌ 9 arquivos pendentes, incluindo o log inteiro (3.800+ linhas) |

---

## Regras da fila

1. **Um lote por turno.** Não empilhar pedido novo enquanto o agente está no meio de outro.
2. **Conferir na tela publicada** antes de dar o próximo — relato do agente não substitui olhar.
3. **Toda barreira de segurança nasce com isca.** Regra que não reprova o padrão antigo nasce morta.
4. **Nenhum número na tela sem dizer o que mede.**
5. Restrições em vigor (**atualizadas em 11/08**): escrita no Sankhya **autorizada apenas** para
   criar pedido e faturar nota que nós criamos, em base de teste provada — escopo completo e o que
   segue proibido em [21-fluxo-pedido-erp.md](21-fluxo-pedido-erp.md) §1 · DbExplorer segue
   `SELECT`-only · nenhuma escrita em marketplace · nenhuma pergunta respondida · nenhuma credencial
   em prompt, log ou doc · nenhum dado pessoal de comprador em doc, log ou prompt.
6. **Ampliar autorização exige mais barreira, não menos.** Fronteira larga se verifica lendo; fronteira
   fina só se sustenta em teste executável.
