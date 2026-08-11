# Prompt de alinhamento — GPT-5.6 Sol xHigh — demo de amanhã (Marketplace Central)

> Cole o bloco abaixo num turno com **GPT-5.6 Sol xHigh** (na Mitra, quando a aba OpenAI OAuth
> estiver conectada, ou no ChatGPT). Objetivo: avaliação fria + priorização do que construir hoje
> para a apresentação de amanhã, que concorre a prêmio de melhor projeto.

---

Você é avaliador e estrategista de produto. Amanhã este projeto será apresentado numa competição
interna de melhores projetos construídos na plataforma Mitra (app-builder agêntico). Quero sua
avaliação fria e um plano priorizado do que construir HOJE. Não estime esforço em tempo humano —
quem executa é um agente de código; pense em dependências e risco, não em horas.

## O que o app é

"Marketplace Central — Hub de Marketplace" para uma metalúrgica (Metal Nobre). Fonte de dados: ERP
Sankhya (base de teste, acesso SOMENTE LEITURA via REST). Canal alvo: Mercado Livre (conexão OAuth2
construída à mão — a plataforma não tem conector OAuth2; falta só PKCE para concluir). Nenhuma
publicação em marketplace é permitida nesta fase — o app é de decisão e preparação, não de execução.

## O que já existe, medido (não é plano, está no ar)

- Espelho do catálogo Sankhya: ~46 mil SKUs, estoque, EAN, categoria, imposto, pedidos.
- Pipeline de prontidão de anúncio: 3.970 SKUs analisados, 88,6% com requisitos de categoria
  atendidos, medição contra as regras REAIS da API pública do ML (categoria, atributos
  obrigatórios, max_title_length) — 95% de acerto medido do mapeamento de categoria.
- Decisão de categoria com estados separados: CORROBORADA (máquina) nunca se mistura com
  CONFIRMADA_POR_PESSOA (humano). 229 pendentes viraram fila de trabalho.
- Simulador de precificação (custo real bloqueado: CUSSEMICMS existe no ERP mas não é acessível
  por GET; pendência documentada).
- Fila do dia, Oportunidades, Alertas, indicador de cobertura por fonte com 3 estados e motivo.
- Corpus de testes de regras de negócio (25 casos) que já pegou defeito antes de produção.
- Segurança da conexão ML: state anti-CSRF de uso único, segredo só server-side, erro com
  `houve_resposta` (a tela é proibida de culpar terceiro sem tráfego real).
- Resposta medida sobre outros canais: só o ML tem API pública utilizável sem credencial de
  seller; Amazon/Shopee/Magalu/etc. exigem contrato — decisão comercial, não técnica.

## Referências de mercado (o que concorrentes fazem)

- Anymarket: "SBOTs" — agentes de IA que publicam anúncios, corrigem erros de integração e
  enriquecem cadastros 24/7; anúncios escritos por IA.
- Nubimetrics: otimizador de anúncios com sugestões práticas; descoberta de categorias lucrativas;
  certificada Platinum pelo ML.
- Real Trends / GoSmarter: dashboards, histórico, precificação.

## O que o organizador da competição valoriza (pesquisa sobre jurados de demos de agentes)

Protótipo funcionando de ponta a ponta > slide. Integração real com sistemas de verdade.
Autonomia com governança (aprovação, trilha de auditoria, observabilidade). Agentes que planejam e
usam ferramentas, não chatbot renomeado.

## Candidatos que estou considerando para HOJE (critique, corte, reordene, acrescente)

1. Concluir PKCE → conta ML conectada AO VIVO na demo (anúncios reais da conta, perguntas, pedidos).
2. Agente embarcado no app publicado (loop já confirmado ao vivo na plataforma): painel de chat
   que responde "por que este SKU não está pronto?" e executa ações via server functions com
   aprovação humana.
3. Gerador de título/atributos por IA medido contra as regras da categoria (com campo de
   confiança — nada de erro com convicção).
4. Análises: curva ABC demanda × margem, "tops" do ERP, oportunidade por categoria.
5. Polimento de frontend para nível "magnífico" de demo.

## Restrições invioláveis

Sankhya somente leitura. Nenhuma publicação/escrita em marketplace. Nenhuma credencial em
prompt/log/doc. Nada de número inventado: o app só mostra o que mediu, e diz "não dá" com evidência
quando não dá.

## O que quero de você

1. Nota fria 0–10 do estado atual como candidato a prêmio, com justificativa.
2. Os 3 itens de maior impacto para amanhã, em ordem, com o porquê (impacto no júri ÷ risco).
3. O roteiro da demo em 7 minutos: que tela abre primeiro, que história se conta, onde o "uau".
4. Um risco que provavelmente não estou vendo.
5. Uma ideia que nenhum dos concorrentes acima tem e que caiba no que já existe.
