# Handoff — Design System do Marketplace Central

> Documento para ser colado no Claude.ai como briefing. **Tema, paleta e linguagem visual não são
> definidos aqui de propósito** — é isso que se está pedindo que ele proponha. O que está aqui é o
> que o produto faz, o que ele vai fazer, o que já existe de componente, e as regras que qualquer
> proposta visual tem que respeitar.
>
> Escrito em 11/08/2026. Tudo que aparece como número foi medido no app publicado, não estimado.

---

## 1. O que é o produto

**Marketplace Central**, da metalúrgica **Metal Nobre**. É o painel que liga o ERP da empresa
(Sankhya) aos marketplaces (hoje só o Mercado Livre está tecnicamente integrado).

A pergunta que o app responde é: **o que anunciar, em qual canal, por quanto** — e depois disso,
**o que já vendeu e o que precisa sair da fábrica**.

Quem usa: uma equipe pequena. Dois perfis previstos (§6) — o **supervisor**, que decide o que
anunciar e a que preço, e o **funcionário de expedição**, que só precisa saber o que embalar e
enviar. Uso em desktop, em tela de escritório. Não é produto de consumidor: é ferramenta de
trabalho usada o dia inteiro pelas mesmas pessoas.

---

## 2. Stack atual (medida no bundle publicado)

| Item | Valor |
|---|---|
| Framework | React (SPA, `<div id="root">`), roteador com 20 rotas |
| Build | Vite — `index-DUh7G2jC.js` (898 KB), `index-D7DHyQ7o.css` (33 KB) |
| CSS | **Tailwind CSS v4** (usa `@layer theme`, cores em `oklch`, `--spacing`, `--radius-*`) |
| Fonte | `Inter` com fallback de sistema — declarada uma vez, sem escala tipográfica própria |
| Idioma | `pt-BR` |
| Ícones | Nenhuma biblioteca. Emoji e caracteres soltos |
| Gráficos | SVG feito à mão (`components/ui/Chart.tsx`), sem lib |
| Dark mode | Não existe |

**Onde o código vive:** dentro de um ambiente de desenvolvimento hospedado (Mitra). Não dá para
exportar o repositório inteiro para fora. O que dá para entregar como insumo é: este documento, o
CSS publicado (`index-D7DHyQ7o.css`, baixável da URL acima) e **capturas de tela**, que para um
trabalho de design valem mais que o fonte. A proposta que voltar do Claude.ai é aplicada aqui
dentro, escrevendo os componentes de novo — então ela deve vir como **tokens + regras + componentes
em React/Tailwind v4**, não como um patch de arquivos.

---

## 3. O estado visual de hoje — o diagnóstico, medido

O app **não tem tema**. Ele usa a paleta padrão do Tailwind direto nas classes, escolhida caso a
caso por quem escreveu cada tela. Isso é literalmente o "muito branco, muito paia".

Levantamento do CSS publicado — o conjunto **inteiro** de cor em uso, 43 tokens:

- **Âmbar** `amber-50/100/200/300/600/700/800/900` — é o mais próximo de uma cor de marca que
  existe. O favicon é um quadrado `#b45309` (amber-700) com um "M" branco. **É o único sinal de
  identidade no produto todo.**
- **Vermelho** `red-50/100/300/500/600/700/800/900` — erro, alerta, divergência
- **Esmeralda** `emerald-50/100/200/300/600/700/800/900` — saudável, ok, confirmado
- **Azul** `blue-50/100/200/700/800/900` — informação, nota de rodapé
- **Laranja** `orange-100/800` — um único estado intermediário
- **Slate** `slate-100/300/700` — só três tons, e é toda a estrutura neutra que existe
- `shadow-sm/md/lg/xl/2xl`, `rounded/md/lg/xl/full` — usados sem critério

Os três problemas reais, e são de sistema, não de gosto:

1. **Não existe neutro.** Nenhum `bg-white`, nenhum `gray-*`, nenhum `stone-*` no CSS. O fundo é o
   branco do papel do navegador e o texto é preto padrão. Todo o "ar" da tela é ausência de decisão,
   não decisão. Daí a impressão de página em branco com caixinhas em cima.
2. **Cor não é vocabulário, é improviso.** Âmbar aparece como marca *e* como aviso. Azul aparece
   como informação *e* como link. Não há regra dizendo o que cada cor significa, então o usuário não
   aprende a ler a tela pela cor.
3. **Não existe escala.** Tipografia vai de `text-xs` a `text-2xl` sem hierarquia declarada;
   espaçamento e raio de canto variam por tela; sombra idem. Cada tela foi desenhada sozinha.

---

## 4. As telas — 20 rotas, o que cada uma decide

Agrupadas pela decisão que cada uma serve. Isso importa para o design porque as densidades são
muito diferentes: umas são painel de leitura rápida, outras são planilha de trabalho.

### Decidir o que anunciar (o miolo do produto)

| Rota | O que a tela decide | Densidade |
|---|---|---|
| `/` | Home. Painel de entrada: 4 cartões de contagem, lista de oportunidades, gráfico de barras do que falta no cadastro | Média — é a vitrine |
| `/oportunidades` | Ranking de produtos por potencial de margem × giro. A tela mais importante | Alta — tabela longa |
| `/simulador` | Simular preço de venda num canal e ver a margem resultante | Baixa — formulário |
| `/demanda` | Curva de demanda / giro por produto | Média — gráfico |
| `/catalogo` | Os 38.877 produtos do ERP, com filtro | Muito alta — tabela |
| `/custos` | Custo real por produto vindo do ERP, com cobertura declarada | Alta — tabela |

### Preparar o produto para o canal

| Rota | O que a tela decide | Densidade |
|---|---|---|
| `/prontidao` | O que falta em cada produto para poder ser anunciado (custo, EAN, estoque, título, NCM) | Alta |
| `/confirmar-categoria` | Fila de decisão humana: confirmar a categoria do canal para um produto | Média — fila item a item |
| `/fila` | Fila geral de pendências | Média |
| `/vinculos` | Ligação produto do ERP ↔ anúncio do canal, por código de barras | Alta |

### Operar o canal

| Rota | O que a tela decide | Densidade |
|---|---|---|
| `/anuncios` | Os 34 anúncios espelhados do Mercado Livre, com status do canal | Alta — tabela paginada |
| `/pedidos` | Pedidos reais vindos do canal | Alta |
| `/alertas` | Divergências que exigem ação: estoque canal × ERP, duplicidade | Média — cartões de exceção |
| `/canais` | Os 6 canais cadastrados e o estado de cada um | Baixa |

### Encanamento

| Rota | O que faz |
|---|---|
| `/integracao` · `/integracao/mercado-livre` · `/oauth/ml` | Conexão OAuth com o canal, estado do token, botão de reconectar |
| `/login` | Existe, mas hoje é decorativa (§6) |
| `*` · `/*` | 404 |

---

## 5. Os componentes que já existem

Ficam em `frontend/src/components/ui/`. São de baixo nível e sem opinião — a proposta de design deve
substituir ou reescrever esses, e é o lugar mais barato de aplicar um tema:

`Card` · `Button` · `Chart` (SVG à mão) · `Checkbox` · `Input` · `Radio` · `Select`

Três componentes de domínio, e estes são os interessantes porque carregam a regra do produto:

- **`Campo`** — rótulo + valor + **fonte do dado e data da leitura ao lado**. Nenhum número no app
  aparece órfão.
- **`ListaCobertura`** — lista que declara quantos itens ela cobre de quantos existem.
- **`IndicadorCobertura`** — mostra a fração coberta e, junto, a **consequência** de não estar
  coberto (mapa `CONSEQUENCIA`). Não é uma barra de progresso: é um aviso com número.

E `lib/amostra.ts`, que formata rótulos de amostragem (`rotuloAmostra`, `bateuNoTeto`,
`fracaoCoberta`) em pt-BR via `Intl.NumberFormat`.

---

## 6. O que ainda vai existir — precisa caber no sistema desde já

Está desenhado e entra nas próximas semanas. A proposta visual tem que já acomodar:

1. **Login demonstrativo, dois perfis.** O usuário escolhe **Funcionário** ou **Supervisor** e entra.
   **Não é autenticação** — a tela é obrigada a dizer isso na cara. É filtro de visão, não permissão.
   Precisa de um tratamento visual que não finja segurança que não existe.
2. **⚙ Configuração.** Área nova, hoje inexistente. Vai absorver as três portas de integração que
   hoje são rotas separadas, mais uma página de configuração do ERP (escolher tipo de operação,
   empresa, série — tudo por lista lida do ERP, nada digitado).
3. **Kanban de Expedição** — a tela do funcionário. Cinco colunas: *Vendido no canal → Pedido no ERP
   → Faturada → Separada/Embalada → Despachada*. Regra dura: **o cartão anda porque o estado real
   andou, não porque foi arrastado.** Cada coluna tem uma autoridade só — as três primeiras são de
   sistemas externos (canal, ERP) e as duas últimas são nossas. **Isso precisa ser visível no
   desenho**: o operador tem que enxergar quais colunas ele move e quais só acontecem com ele.
4. **Navegação reorganizada.** Hoje são 20 rotas num nível só. Vai virar grupos — os quatro de §4.

---

## 7. Restrições de design — não negociáveis

Isto é o caráter do produto e é o que ele tem de diferente. Nenhuma proposta pode passar por cima:

1. **Nenhum número aparece sem dizer o que mede e sobre quantas linhas.** "383 prontos" sozinho é
   proibido; "383 prontos e confirmados · mais 490 com categoria a confirmar" é o padrão. O sistema
   visual precisa de um lugar previsto para essa segunda linha — hoje ela é enfiada como texto
   pequeno cinza e fica feia justamente por não ter lugar.
2. **Estado vazio tem que dizer por que está vazio.** "0 alertas" pode significar "está tudo certo"
   ou "não conferimos nada". São coisas opostas e a tela tem que distinguir as duas.
3. **Amostra parcial se declara.** Muitas tabelas mostram um recorte (400 de 5.942). O recorte
   aparece no topo da própria tela — veja a faixa "Amostra parcial: EAN / GTIN e Pedidos de venda" na
   home. Precisa de um componente de verdade, não de um parágrafo solto.
4. **Rótulo não pode exagerar.** Já aconteceu de a tela dizer "pronto para anunciar" quando media
   outra coisa. A regra virou teste automático.
5. **Fonte e data do dado ao lado do dado.** Um número do ERP e um número do canal na mesma tela têm
   idades diferentes, e isso tem que ser legível.
6. **Densidade é requisito, não defeito.** Metade das telas são tabelas de milhares de linhas usadas
   o dia inteiro. Um design arejado demais quebra o uso. O contrário do "muito branco" aqui não é
   "mais espaço bonito" — é **mais contraste e mais hierarquia na mesma densidade**.

---

## 8. O que se está pedindo

Uma proposta de **design system**, entregue como:

- **Tokens** — paleta (com neutros de verdade, que hoje não existem), escala tipográfica, escala de
  espaçamento, raio, sombra, elevação. Em formato Tailwind v4 (`@theme`), porque é a stack.
- **Semântica da cor** — regra explícita de o que cada cor significa neste produto: marca, saudável,
  atenção, erro, informação, estado desconhecido/não medido. Esse último é importante e raro:
  o produto precisa mostrar **"não sei"** como um estado visual de primeira classe.
- **Modo claro e escuro.**
- **Componentes** reescritos: `Card`, `Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Chart`,
  tabela densa, badge de status, estado vazio, faixa de amostra parcial, cartão de kanban.
- **Padrão de layout**: casca da aplicação, navegação em grupos, cabeçalho de página, densidade de
  tabela.

O que **não** se está pedindo: mudar o que as telas fazem, mexer em dado, ou inventar tela nova além
das de §6.

Ponto de partida sugerido, mas aberto: o único traço de identidade existente é o **âmbar `#b45309`**
do favicon, e a empresa é uma **metalúrgica**. Se houver um caminho melhor, é bem-vindo — mas se o
âmbar for descartado, vale dizer o que entra no lugar como marca.

---

## Anexos a mandar junto

1. Este documento.
2. `index-D7DHyQ7o.css` — o CSS publicado, baixável de
   `https://146638-55853.build.mitralab.io/assets/index-D7DHyQ7o.css`
3. **Capturas de tela** — é o insumo mais valioso e não dá para gerar daqui. Vale capturar: `/`,
   `/oportunidades`, `/anuncios`, `/prontidao`, `/alertas`, `/catalogo`. As três primeiras mostram os
   três padrões diferentes (painel, ranking, tabela paginada).
