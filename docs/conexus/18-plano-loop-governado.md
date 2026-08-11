# Plano do Loop Governado — guardado, **não** em execução

> **Estado: EM ESPERA.** Decisão do usuário em 11/08/2026: *"vamos corrigir e alinhar todo
> funcionamento da plataforma antes disso"*. Este documento existe para o plano não se perder
> enquanto a base é acertada. Nada aqui deve ser implementado antes de a plataforma estar
> operacional ponta a ponta.
>
> Origem: consulta ao GPT-5.6 Sol xHigh (prompt em
> [pesquisa-externa-demo-alinhamento-prompt.md](pesquisa-externa-demo-alinhamento-prompt.md)),
> mais a auditoria multi-marketplace do agente embarcado.

---

## 1. A cena única, ponta a ponta

Não é "um chat". É esta sequência, e nada além dela:

> SKU/grupo pendente → agente consulta dados → explica o bloqueio → prepara correção → valida
> contra a regra real do canal → pede aprovação → registra decisão local auditável.

## 2. Ferramentas específicas, nunca `consulta_livre`

O agente embarcado recebe um conjunto fechado:

- `explicarProntidao`
- `prepararRascunho`
- `proporCategoria`
- `registrarDecisaoAprovada`

**O agente propõe; o botão humano é quem chama a função de escrita.** Não há evidência de que o
gate de aprovação do construtor exista igual no runtime embarcado — então a fronteira é desenhada
por nós, não herdada.

O gerador de título/atributos entra **dentro** desse fluxo, não como produto separado. A saída
precisa: citar a categoria e as regras consultadas; passar por validador determinístico; poder
responder "evidência insuficiente"; nunca usar confiança numérica não calibrada.

## 3. Três telas, não um redesenho

- tela de chegada
- cartão de aprovação
- recibo de decisão

Hierarquia obrigatória em todas:

> problema → evidência → proposta → limite de autoridade → decisão humana → impacto

O recibo mostra: fonte, universo medido, atualização, regra do canal, estado da máquina, decisão
humana, `houve_resposta`, efeito permitido e efeito proibido. **Um recibo real anterior fica
visível enquanto o agente trabalha** — a primeira impressão não pode depender de uma resposta ao
vivo terminar.

## 4. Ideia diferenciadora — "Passaporte de Decisão por SKU"

Cada recomendação nasce com um artefato verificável junto: o que recomenda, com quais dados, qual
universo foi medido, que regra externa foi consultada, onde a evidência é parcial, **o que poderia
invalidar a conclusão**, quem aprovou, quais efeitos são permitidos e proibidos.

Recomendação que carrega a própria prova. Nas ofertas públicas consultadas (ANYMARKET SBOTs,
Nubimetrics, Real Trends) não se encontrou recibo de governança por decisão como proposta central.

Tese: *"Nossa IA sabe agir, sabe pedir autorização e consegue provar por que não agiu."*

## 5. Cortes explícitos (não construir)

- Curva ABC demanda × margem — indefensável enquanto custo estiver bloqueado e a amostra de pedidos
  cobrir menos de 1%, enviesada por recência.
- "Tops do ERP" só com definição e cobertura escritas na mesma tela.
- Redesenho geral.
- Gerador de anúncios separado do loop.

## 6. Rótulos a corrigir antes de qualquer feature

Números que estavam sendo ditos errado:

| Dito errado | Medido de verdade |
|---|---|
| "~46 mil SKUs" | **38.877 produtos** e **45.947 linhas de estoque** |
| "88,6% com requisitos atendidos" | 88,6% = **o canal devolveu uma classificação** |
| "95% de acurácia" | 38 de 40 descrições **retornaram classificação** — não é acurácia contra verdade humana |
| "873 / 411 / 380 prontos" | **383** prontos e corroborados após o corpus |

## 7. Pré-condição declarada pelo usuário

Plataforma operacional primeiro. Exemplo concreto levantado em 11/08: **"Operar Anúncios" não
mostra anúncio de marketplace nenhum**, mesmo com 34 anúncios reais já espelhados e 30 vinculados.
Enquanto telas assim existirem, o loop não começa.
