# 16 — Sonda de manutenção na Mitra

> **Pergunta central:** a Mitra sustenta a *segunda volta*? Toda evidência que temos dela é de
> greenfield (§34 disseca um projeto entregue; b2c6024 registra uma sessão de build monitorada).
> Nada mede o que acontece quando o pedido é *"isso ficou errado, muda"* — que é exatamente onde
> `marketplace-central` e `MetalDocs` gastam PR hoje.
>
> **Profundidade:** funda. **Status:** em execução (aberta 2026-08-10).
> **Saída:** veredito ADOPT/REJECT/OWN por dimensão de manutenção, alimentando T5, T6, T8, T11, T13.

## Por que isto existe

O piso do Conexus foi medido só na subida. Se a Mitra constrói bem e mantém mal, o piso é mais baixo
do que os docs 01–07 sugerem — e as apostas OWN mudam de peso. Se ela mantém bem, o Conexus precisa
copiar o mecanismo antes de inventar o dele.

Baseline humano disponível: os dois repos reais estão, agora, fazendo exatamente esta classe de PR.

| PR real | Classe de manutenção |
|---|---|
| `fix(errors): one problem writer, and a guard that keeps it that way` (MetalDocs 436dcfea) | **consolidação** — N implementações da mesma preocupação viram 1 |
| `feat(gate): one verifier, one entry point` (MC 4ceba6e5) | **consolidação + ponto de entrada único** |
| `ci: retire release-images.yml — 18 runs, 18 failures` (MC 421e81d8) | **aposentadoria** — remover sem deixar referência pendurada |
| `feat(ingress): enforce the OpenAPI contract at runtime, once` (MetalDocs b7bce648) | **contrato numa fronteira só** |
| `refactor(gate): the panic rule becomes a ratchet count` (MC 15285fa3) | **troca de shape** com atualização de todos os chamadores |

A sonda reproduz essas classes no domínio da Mitra.

## Desenho

**Ambiente.** Projeto novo e descartável no workspace `METAL NOBRE NOVO AGENT`, dados fake.
Motivo: o projeto `Marketplace Central` que já existe na Mitra está **vivo** (sessão de 2026-08-10
20:46–20:50, decisões reais de integração Sankhya) e — por **S2** ([08-limites-e-gaps](../reference/mitra/08-limites-e-gaps.md))
— na Mitra o banco de DEV *é* o banco. Sonda não encosta em projeto real.

**Modelo.** Claude Opus 5 High, credencial de assinatura (OAuth). Registrar se mudar.
Limite de sessão da assinatura já bateu uma vez (20:50, reset 00:00 UTC) — é um dado operacional,
não um erro: anotar cada vez que a sonda parar por limite.

**Alvo.** Marketplace Central completo, não fatia: simulação de preço + configuração de marketplace.
Escopo espelha os `packages/feature-*` do repo real — classifications, connectors, inventory, orders,
products, simulator — mais dashboard e papéis.

**Brief da v1 sub-especificado de propósito.** Nada de erro plantado à mão: o brief descreve o
negócio, não a arquitetura. A bagunça que aparecer é da plataforma, e é esse o dado.

## Roteiro de turnos

| Turno | Pedido | O que está sendo medido |
|---|---|---|
| **V1** | Construir o app completo a partir do brief de negócio | Baseline: shape que a Mitra escolhe sozinha |
| **M1** | Consolidação — unificar a lógica que ela tiver duplicado (preço, erro, validação) | Ela *encontra* as duplicatas? Remove as antigas ou só adiciona a nova? |
| **M2** | Aposentadoria — remover uma área inteira, sem sobrar referência | Import órfão, componente morto, server function fantasma no registro |
| **M3** | Troca de shape — o que era 1 vira N (ex.: um marketplace vira vários) | Atualiza todos os chamadores? Migration como gate ou depois do fato? |
| **M4** | Contrato numa fronteira só — validação/erro num ponto de entrada único | Consegue impor invariante, ou espalha `if` de novo? |
| **M5** | Aditivo em cima do shape errado — feature que só faz sentido pós-M3 | O refactor de M3 aguentou, ou virou gambiarra em cima de gambiarra? |

## Métricas — binárias, por turno

Impressão não conta. Cada linha é sim/não ou número.

- Import órfão remanescente (arquivo importado que ninguém usa / import apontando para removido)
- Componente ou função duplicada em vez de editada
- Chamadores atualizados: todos / parciais / nenhum
- Registro de artefatos (server function, dataLoader, dbAction) consistente com o código
- Arquivo morto deixado no projeto
- Migration antes ou depois do deploy
- Precisou de handhold humano (quantas correções de rota)
- Custo: turnos, tools, tempo de parede, parada por limite de sessão

## Registro de execução

Log completo e verbatim em [17-log-observacao-mitra.md](17-log-observacao-mitra.md) (OBS-01..48).
Ambiente real: projeto **Marketplace Central** (`w-146638/p-55853`), Sankhya **Sandbox**
(`api.sandbox.sankhya.com.br`), somente GET. Desvio do desenho original: a sonda rodou **no projeto que
já existia**, não num descartável — ele estava em scoping, não em produção, e o escopo batia.

| Data | Turno | Modelo | Resultado | Evidência |
|---|---|---|---|---|
| 10/08 23:0x–00:11 | **Fase 0/1** — descoberta do ERP, read-only | GPT-5.6 Sol Medium | Gate de ambiente cumprido antes da 1ª chamada; 7 endpoints mapeados; lacunas declaradas (EAN, fiscal) | OBS-17, 21, 25, 27, 28 |
| 11/08 00:14–00:53 | **V1** — app completo a partir de brief só-negócio | GPT-5.6 Sol Medium | Entregue e funcional (7 telas, 19 SFs, commit `7bdc122`). Cobertura truncada em silêncio | OBS-29..37 |
| 11/08 01:25–02:58 | **M1** — troca de shape para hub de marketplace + 3 correções | Claude Opus 5 High | **Fechado.** Estoque 45 → 45.947; produtos 5.000 → 38.877; EAN descoberto em campo não documentado (7.011 produtos desbloqueados); 15/15 e2e. `git push` recusado (credencial do sandbox) | OBS-38..51 |

| 11/08 03:13–03:32 | **M2** — aditivo sobre o shape novo: custo em massa + inteligência de anúncio | Claude Opus 5 High | **Fechado.** 53 checagens; lei de conservação (`lidas = casadas + rejeitadas`); 8 motivos de recusa nomeados; regra oficial do ML × política local separadas; push OK, `origin/main` = `cb7e248` | OBS-53..55 |

| 11/08 03:38–04:03 | **M3** — varredura transversal (acentuação) + demanda + sondagem de canais | Claude Opus 5 High | **Fechado.** 4 estragos auto-infligidos por regex, todos corrigidos; filtro de data quebrado achado antes de nascer; mapa de canais honesto; estado publicado virou artefato verificável | OBS-57..60 |

| 11/08 04:14–04:30 | **M4** — auditoria de dívida com evidência + consolidação | Claude Opus 5 High | **Fechado.** 8 arquivos órfãos e 6 scripts removidos, 2 SFs mortas removidas, 6 duplicações consolidadas; **2 regressões próprias descobertas via artefato órfão**; recusou burlar o guarda de `DROP` mesmo autorizado | OBS-61, 62 |

| 11/08 04:35–04:47 | **M5** — aditivo sobre o shape consolidado (canal Amazon ponta a ponta) | Claude Opus 5 High | **Fechado.** 4 arquivos alterados + 2 novos; *"nenhum arquivo foi tocado para a Amazon funcionar"*; **derrubou a hipótese de que a consolidação barateia extensão**; 2 dívidas de acoplamento achadas e pagas | OBS-63 |

**Troca de modelo no meio da sonda** (reset de limite da assinatura à meia-noite UTC): V1 e M1 não têm o
mesmo executor. Vira o achado mais importante, não um defeito do método — ver veredito.

### Métricas binárias — parcial

| Métrica | V1 (GPT-5.6) | M1 (Opus 5) |
|---|---|---|
| Import órfão remanescente | — | **não** (declarado: *"sem tela morta nem função órfã"*) |
| Duplicou em vez de editar | — | **não** — reescreveu Visão Geral no lugar |
| Chamadores atualizados | — | **todos** (`mcProdutoDetalhe` corrigido na origem) |
| Registro de artefatos consistente | 19 SFs, smoke de 13 | **41 SFs, smoke de 41**, `sf-ids.ts` gerado; 2 SFs removidas com as rotas |
| Arquivo morto deixado | **sim** (importador defeituoso) | **não** — removeu por decisão própria |
| Migration antes ou depois | depois do fato | depois do fato |
| Cobertura de dado | **0,1%** do estoque, sem declarar | **completa**, declarada num lugar só |
| Verde vazio aceito | — | **não** — reprovou 1 de 13 por vacuidade |
| Handhold humano | 3 correções necessárias | **0** |
| Custo | `in 173.5K/out 17.8K` + `in 140.3K/out 28.1K` | `in 43.3M · out 195.0K · cache 43.2M` (99,8% cache) |
| Persistência | ok | ⚠ `git push` recusado — commit só local, sandbox efêmero |
| Parada por limite de sessão | 1 (Fase 1) | 0 |

**M2, M3 e M4 do roteiro foram satisfeitos dentro do turno M1**, sem serem pedidos separadamente
(aposentadoria sem órfão, troca de shape com todos os chamadores, contrato numa fronteira só). O
roteiro previa três turnos. Ver [OBS-51.3](17-log-observacao-mitra.md).

### O achado central, já estabelecido

Três defeitos de **contrato de SDK** (`integrationSlug`, `stopTracking` ×2) atravessaram **dois modelos**
e **dois turnos**. A correção do primeiro modelo não sobreviveu ao turno seguinte porque foi aplicada no
código, não na fonte da informação. Ver [OBS-44](17-log-observacao-mitra.md).

> Uma correção que não toca a fonte não sobrevive ao próximo turno.

E o contraste GPT-5.6 × Opus 5 no **mesmo projeto, no mesmo dia**, com resultados opostos em cobertura de
dado, aposentadoria de artefato e diagnóstico por classe, mostra que **a plataforma não impõe nenhum dos
dois comportamentos**.

## A resposta à pergunta central

**A Mitra sustenta a segunda volta?** Sim — e não por mérito dela.

Quatro turnos de manutenção real, com o app crescendo em cima de si mesmo, produziram um resultado
limpo: nenhum import órfão sobreviveu, nenhuma rota ficou sem link, nenhuma implementação antiga ficou
viva, e as duas regressões introduzidas no caminho foram encontradas e corrigidas **na mesma noite**.

Mas nada disso foi imposto pela plataforma. As invariantes que efetivamente reprovaram alguma coisa,
durante a noite inteira, foram **três**, e todas vêm do ecossistema, não da Mitra:

| Invariante | O que pegou |
|---|---|
| `tsc` (build) | renomeação de identificador por regex, acento dentro de expressão |
| `tsc` com `noUnusedLocals` | a categoria "import não utilizado" inteira — sozinho |
| FK do MySQL | pai inexistente na importação de grupos (e **causou** a regressão de `UNIDADE`) |

Tudo o mais — cobertura declarada, aposentadoria de artefato, recusa de dado inventado, consolidação
com critério, auditoria de órfãos — aconteceu porque **o modelo do turno escolheu**, ou porque **eu
pedi no prompt**. A Mitra não pede, não verifica e não reprova nenhuma dessas coisas.

**O achado mais útil para o Conexus não é sobre imports.** É este:

> **Artefato órfão é um detector barato de garantia quebrada.** Duas vezes na mesma auditoria — a
> tabela `ERP_UNIDADES` escrita e nunca lida, e a SF `registrarHistoricoCusto` registrada e nunca
> chamada — o órfão foi a **única** pista de um defeito funcional que build, teste, FK e tela não
> mostravam. Ver [OBS-61](17-log-observacao-mitra.md) e [OBS-62](17-log-observacao-mitra.md).

Um registro de artefatos que saiba **quem lê** e **quem escreve** cada tabela e cada SF transforma essa
auditoria manual — que só aconteceu porque um humano pediu às 4h da manhã — em alerta contínuo. É a
funcionalidade de maior retorno por custo que esta sonda encontrou, e vale mais que qualquer feature.

**E o padrão que atravessou a noite inteira**, em oito camadas independentes
([OBS-57](17-log-observacao-mitra.md)):

> Verificar o **canal** em vez do **conteúdo** produz falso positivo silencioso. `[]` de erro lido como
> fim de coleção; suíte verde sobre conjunto vazio; `cmd && echo ok`; campo fora da projeção lido como
> "não tem"; `HTTP 200` com erro no corpo; filtro opcional que curto-circuita; chave de objeto
> acentuada; `import type` lido como import default. Em todos, o código está correto e a **resposta**
> é que está errada — por isso nenhum passa por build, teste ou revisão de diff.

## Veredito

_(roteiro completo — V1 + M1..M5 executados. Fecha como C-0xx em [DECISOES.md](DECISOES.md).)_

1. **O piso da Mitra é o pior comportamento possível dentro dela.** Nada na plataforma força cobertura
   declarada, aposentadoria de artefato, registro consistente ou recusa de inventar dado. Tudo isso
   apareceu — mas como escolha do modelo do turno, não como invariante. As três invariantes que de fato
   reprovaram algo em nove horas vêm todas do ecossistema: `tsc`, `tsc --noUnusedLocals`, FK do MySQL.
2. **O Conexus não precisa de um modelo melhor; precisa tornar obrigatório o que o bom modelo fez
   espontaneamente.** Alimenta T5 (registro + contrato de SDK gerado), T13 (cobertura e proveniência na
   fronteira) e T14 (bind params).
3. **Manutenção só é corrigida por classe quando uma invariante mecânica reprova.** FK, build e
   validação de schema produziram correção estrutural; ausência de sinal produziu correção pontual.
4. **Artefato órfão é um detector de garantia quebrada, não higiene.** Duas regressões funcionais
   invisíveis foram achadas por ele, e por nada mais. → requisito de maior retorno da sonda: o registro
   de artefatos guarda **leitores e escritores** de cada tabela e SF, e "escrita sem leitura" é alerta
   contínuo. Vai para T5/T13.
5. **Consolidação ≠ extensibilidade** ([OBS-63](17-log-observacao-mitra.md)). Unificar N implementações
   barateia *mudar aquela preocupação*; não barateia *adicionar um caso*. Caso novo fica barato quando
   o eixo de variação virou **parâmetro e dado**, no desenho original. Duas alavancas distintas, não
   uma. Isto muda como justificamos PR de consolidação em `marketplace-central` e `MetalDocs`.
6. **O erro que atravessa tudo é verificar o canal em vez do conteúdo** — 8 camadas independentes numa
   noite. Nenhum passa por build, teste ou revisão de diff, porque o código está correto e a resposta é
   que está errada. Vira princípio de projeto, não item de checklist.
7. **Duas proteções server-side reais que não estavam na nossa avaliação:** o guarda que recusa
   placeholder em posição estrutural (OBS-53) e o bloqueio de `DROP` por padrão (OBS-60). A Mitra não é
   ingênua na camada de dado; o que falta a ela é **ambiente**, não guarda. S1 e S2 ficam mais precisos
   e com peso menor.
8. **Comportamento de segurança a exigir do agente do Conexus** (OBS-62): com autorização humana em
   mãos e o contorno técnico conhecido, o agente **recusou** replicar a chamada HTTP interna que burla
   o guarda de `DROP`. Caminho oficial ou recusa declarada — nunca o equivalente interno.
