# Adendo à sonda (tópico 16) — 6 lacunas do fluxo do harness Mitra

> Para a sessão paralela que opera a Mitra ao vivo. Auditoria de 2026-08-11 (sessão de decisões)
> concluiu: fluxo do harness ~80% mapeado com evidência primária. Achado estrutural: o "cérebro"
> é o Claude Code CLI alugado dentro de E2B; o que a Mitra construiu é o envelope (CLAUDE.md
> gerado + prompts de missão + fila de steering + gate de aprovação + protocolo de turno). As 6
> lacunas abaixo são todas do ENVELOPE — alvos perfeitos para captura ao vivo. Nenhuma bloqueia o
> tópico 9, mas fechá-las eleva a referência de ~80% para ~100%.

Regras herdadas do roteiro da sonda (16-sonda-manutencao-mitra.md): projeto descartável /
playground, nunca credencial de produção, nada destrutivo, evidência em `docs/conexus/evidence/`
com data e método de captura.

## P1 — CLAUDE.md completo do builder

- **Lacuna**: temos o esqueleto do protocolo de turno (SYNC→BACKEND→FRONTEND→BUILD→SHARE) e
  citações verbatim do projeto 55833, não o arquivo inteiro.
- **Captura**: no sandbox do builder, obter conteúdo integral do CLAUDE.md do projeto (e de
  qualquer arquivo irmão de instrução — ex.: regras de fase, templates de docs de planejamento).
- **Evidência esperada**: arquivo verbatim completo + path + data.
- **Alimenta**: tópico 9 (contexto em camadas), tópico 13 (protocolo de turno → eventos).

## P2 — Loop de feedback de erro de build

- **Lacuna**: `build_status` existe no fio, mas não sabemos O QUE a plataforma injeta de volta no
  agente quando build falha, nem como erro de runtime do app publicado chega ao agente.
- **Captura**: em projeto descartável, forçar falha de build (erro de sintaxe proposital) e
  observar: payload dos eventos WS, o que aparece no próximo turno do agente (mensagem
  injetada? arquivo? re-prompt automático?), quantos retries automáticos existem.
- **Evidência esperada**: sequência de eventos WS + reação do agente, timeline.
- **Alimenta**: tópico 9 (loop de conserto), C-002 (validador independente — comparação).

## P3 — Steering no meio do turno

- **Lacuna**: fila de steering drena no SYNC (início do turno). Não provado: mensagem enviada
  DURANTE turno longo interrompe, enfileira ou se perde? Comportamento real do cancelar (O5:
  `/cancel` inconsistente).
- **Captura**: disparar tarefa longa, enviar mensagem no meio, observar quando/como o agente a
  vê; repetir com cancel.
- **Evidência esperada**: timeline mensagem-enviada × agente-reage, estados do task.
- **Alimenta**: tópico 9 (protocolo de interação), tópico 13.

## P4 — Prompt do estágio de escopo (Gemini)

- **Lacuna**: comportamento mapeado (4 gates de suficiência + gate humano; inventa valores para
  fechar rápido), texto do prompt não capturado.
- **Captura**: network capture na conversa de escopo; se prompt for 100% server-side, registrar
  impossibilidade e capturar o máximo do comportamento (perguntas exatas dos 4 gates).
- **Evidência esperada**: request/response ou transcript comportamental + nota de limite.
- **Alimenta**: tópico 9 (pipeline 2 estágios), tópico 15.

## P5 — Subagentes no builder

- **Lacuna**: nunca observado uso de Task/subagents do CLI. Assumimos agente único sem prova.
- **Captura**: durante build substancial, observar `stream_tool_activity` procurando marcadores
  de subagente/Task tool (ou ausência consistente).
- **Evidência esperada**: presença/ausência com amostra de atividade de tools de 1 build inteiro.
- **Alimenta**: tópico 9 (perfil de runtime), tópico 10 (custo).

## P6 — Compactação / contexto longo

- **Lacuna**: gestão de contexto delegada ao CLI, zero telemetria na UI (E3). O que sobrevive a
  compactação no meio de projeto grande além dos docs relidos?
- **Captura**: sessão longa contínua no mesmo task; observar sinais indiretos (mudança de
  comportamento, releitura de docs, heartbeat/eventos novos). Sonda mais fraca — aceitar
  resultado parcial.
- **Evidência esperada**: notas de observação com timestamps; qualquer evento WS novo.
- **Alimenta**: tópico 9 (memória externalizada como mecanismo de foco).

## Prioridade sugerida

P1 > P2 > P3 (baratas, alto valor) · P5 (grátis durante qualquer build) · P4, P6 (melhor
esforço). Registrar resultados no 17-log-observacao-mitra.md como OBS-XX normais.
