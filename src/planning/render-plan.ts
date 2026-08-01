import type {
  FeaturePlan,
  MissionPlanRevision,
  PlanQuestion,
} from '../domain/mission-plan.js';
import { renderDependencyGraphSvg } from './dependency-graph.js';
import { escapeHtml } from './html.js';

function renderItems(items: readonly string[], emptyLabel: string): string {
  if (items.length === 0) return `<p class="empty">${escapeHtml(emptyLabel)}</p>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderFeature(feature: FeaturePlan): string {
  return `<article class="feature" id="feature-${escapeHtml(feature.id)}">
    <div class="card-heading"><span class="identifier">${escapeHtml(feature.id)}</span><h4>${escapeHtml(feature.title)}</h4></div>
    <p>${escapeHtml(feature.outcome)}</p>
    <h5>Acceptance criteria</h5>
    ${renderItems(feature.acceptanceCriteria, 'No acceptance criteria.')}
    ${feature.dependsOn.length === 0 ? '' : `<p class="dependency"><strong>Depends on:</strong> ${feature.dependsOn.map(escapeHtml).join(', ')}</p>`}
  </article>`;
}

function renderQuestion(question: PlanQuestion): string {
  const statusClass = question.status === 'OPEN' ? 'status-open' : 'status-answered';
  const blocking = question.blocking ? '<span class="badge badge-warning">Blocking</span>' : '';
  const answer = question.answer === undefined
    ? '<p class="empty">Awaiting an answer.</p>'
    : `<p class="answer"><strong>Answer:</strong> ${escapeHtml(question.answer)}</p>`;
  return `<article class="question">
    <div class="card-heading"><span class="identifier">${escapeHtml(question.id)}</span><span class="badge ${statusClass}">${question.status}</span>${blocking}</div>
    <h4>${escapeHtml(question.question)}</h4>
    ${answer}
  </article>`;
}

function reviewScript(): string {
  return `<script>
(() => {
  const root = document.getElementById('mnfs-plan-review');
  const status = document.getElementById('review-status');
  const approvalPrompt = root.dataset.approvalPrompt;
  const changePrefix = root.dataset.changePrefix;
  const queue = (prompt, metadata) => {
    if (!window.lavish || typeof window.lavish.queuePrompt !== 'function') {
      status.textContent = 'Open this artifact through Lavish to queue feedback.';
      return;
    }
    window.lavish.queuePrompt(prompt, metadata);
    status.textContent = 'Feedback queued. Send it from the Lavish conversation panel.';
  };

  document.getElementById('approve-plan').addEventListener('click', () => {
    queue(approvalPrompt, {
      selector: '#approve-plan',
      tag: 'approval',
      text: 'Approve current plan',
      queueKey: 'mnfs-plan-decision',
    });
  });

  document.getElementById('request-changes').addEventListener('click', () => {
    const input = document.getElementById('change-request');
    const feedback = input.value.trim();
    if (!feedback) {
      status.textContent = 'Describe the requested change before queueing it.';
      input.focus();
      return;
    }
    queue(changePrefix + '\\n' + feedback, {
      selector: '#change-request',
      tag: 'change-request',
      text: feedback,
      queueKey: 'mnfs-plan-decision',
    });
  });
})();
</script>`;
}

export function renderMissionPlanHtml(revision: MissionPlanRevision): string {
  const { content } = revision;
  const dependencyGraph = renderDependencyGraphSvg(content);
  const dependencies = dependencyGraph === undefined
    ? undefined
    : `<section class="panel" aria-labelledby="dependencies-heading">
    <div class="section-heading"><p class="eyebrow">Composition</p><h2 id="dependencies-heading">Dependency graph</h2></div>
    <div class="dependency-graph-scroll">${dependencyGraph}</div>
  </section>`;
  const milestones = content.milestones.map((milestone) => `<article class="milestone" id="milestone-${escapeHtml(milestone.id)}">
    <div class="card-heading"><span class="identifier">${escapeHtml(milestone.id)}</span><h3>${escapeHtml(milestone.title)}</h3></div>
    <p class="outcome">${escapeHtml(milestone.outcome)}</p>
    ${milestone.dependsOn.length === 0 ? '' : `<p class="dependency"><strong>Depends on:</strong> ${milestone.dependsOn.map(escapeHtml).join(', ')}</p>`}
    <div class="feature-grid">${milestone.features.map(renderFeature).join('')}</div>
  </article>`).join('');

  return `<!doctype html>
<html lang="en" data-lavish-live-reload-root>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(content.title)} · MNFS plan</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0b1020; color: #edf2ff; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at top left, #172554 0, transparent 34rem), #0b1020; line-height: 1.55; }
    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 40px 0 96px; }
    h1, h2, h3, h4, h5, p { margin-top: 0; }
    h1 { max-width: 880px; margin-bottom: 12px; font-size: clamp(2.25rem, 6vw, 4.75rem); line-height: 1.02; letter-spacing: -0.045em; }
    h2 { margin-bottom: 0; font-size: clamp(1.55rem, 3vw, 2.2rem); }
    h3, h4 { margin-bottom: 8px; }
    h5 { margin: 20px 0 8px; color: #bac7e8; text-transform: uppercase; letter-spacing: .08em; font-size: .72rem; }
    p, li { color: #c8d2ec; }
    ul { margin: 8px 0 0; padding-left: 22px; }
    .hero, .panel, .milestone, .feature, .risk, .question, .review { border: 1px solid rgba(148, 163, 184, .2); background: rgba(15, 23, 42, .78); box-shadow: 0 20px 70px rgba(2, 6, 23, .24); }
    .hero { padding: clamp(28px, 5vw, 64px); border-radius: 30px; }
    .panel, .review { margin-top: 24px; padding: clamp(24px, 4vw, 40px); border-radius: 24px; }
    .eyebrow { margin-bottom: 8px; color: #7dd3fc; font-size: .75rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    .lead { max-width: 820px; font-size: 1.12rem; }
    .meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
    .badge, .identifier { display: inline-flex; align-items: center; width: fit-content; border-radius: 999px; padding: 6px 10px; font-size: .72rem; font-weight: 800; letter-spacing: .05em; }
    .badge { background: #1e293b; color: #dbeafe; }
    .identifier { background: #172554; color: #93c5fd; }
    .badge-warning { background: #713f12; color: #fde68a; }
    .status-open { background: #7f1d1d; color: #fecaca; }
    .status-answered { background: #14532d; color: #bbf7d0; }
    .hash { overflow-wrap: anywhere; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .section-heading { margin-bottom: 24px; }
    .two-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    .subpanel { border-radius: 18px; padding: 20px; background: rgba(30, 41, 59, .48); }
    .milestone { margin-top: 18px; padding: 24px; border-radius: 20px; }
    .feature-grid, .risk-grid, .question-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(255px, 1fr)); gap: 16px; margin-top: 20px; }
    .feature, .risk, .question { padding: 20px; border-radius: 16px; background: rgba(15, 23, 42, .9); }
    .card-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
    .card-heading h3, .card-heading h4 { margin: 0; }
    .dependency { margin: 14px 0 0; font-size: .86rem; }
    .answer { margin-top: 14px; }
    .empty { color: #8290b2; font-style: italic; }
    .dependency-graph-scroll { overflow-x: auto; padding: 8px; border-radius: 16px; background: #070b16; }
    .dependency-graph { display: block; width: 100%; min-width: 640px; height: auto; }
    .dependency-edge { fill: none; stroke: #64748b; stroke-width: 2.5; }
    .dependency-arrow { fill: #64748b; }
    .dependency-node rect { stroke-width: 1.5; }
    .dependency-node-milestone rect { fill: #172554; stroke: #60a5fa; }
    .dependency-node-feature rect { fill: #13273a; stroke: #38bdf8; }
    .dependency-node-id { fill: #93c5fd; font: 800 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: .06em; }
    .dependency-node-title { fill: #e2e8f0; font: 650 14px Inter, ui-sans-serif, system-ui, sans-serif; }
    .review { position: relative; overflow: hidden; border-color: rgba(56, 189, 248, .45); }
    .review::before { content: ""; position: absolute; inset: 0 auto auto 0; width: 100%; height: 3px; background: linear-gradient(90deg, #38bdf8, #a78bfa); }
    textarea { width: 100%; min-height: 130px; resize: vertical; border: 1px solid #334155; border-radius: 14px; padding: 14px; background: #070b16; color: #f8fafc; font: inherit; }
    textarea:focus { border-color: #38bdf8; outline: 3px solid rgba(56, 189, 248, .18); }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px; }
    button { border: 0; border-radius: 999px; padding: 12px 18px; cursor: pointer; font: inherit; font-weight: 800; }
    button.primary { background: #38bdf8; color: #082f49; }
    button.secondary { background: #293548; color: #e2e8f0; }
    button:hover { transform: translateY(-1px); }
    #review-status { min-height: 1.5em; margin: 14px 0 0; color: #bae6fd; }
    @media (max-width: 720px) { main { width: min(100% - 20px, 1180px); padding-top: 10px; } .hero, .panel, .review { border-radius: 18px; } .two-column { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<main>
  <header class="hero">
    <p class="eyebrow">MNFS mission plan</p>
    <h1>${escapeHtml(content.title)}</h1>
    <p class="lead">${escapeHtml(content.goal)}</p>
    <div class="meta">
      <span class="badge">${escapeHtml(revision.missionId)}</span>
      <span class="badge">Revision ${revision.revision}</span>
      <span class="badge">${revision.status}</span>
      <span class="badge hash">${escapeHtml(revision.contentHash)}</span>
    </div>
  </header>

  <section class="panel" aria-labelledby="outcome-heading">
    <div class="section-heading"><p class="eyebrow">Outcome</p><h2 id="outcome-heading">Success and scope</h2></div>
    <div class="two-column">
      <article class="subpanel"><h3>Success criteria</h3>${renderItems(content.successCriteria, 'No success criteria.')}</article>
      <article class="subpanel"><h3>Assumptions</h3>${renderItems(content.assumptions, 'No assumptions recorded.')}</article>
      <article class="subpanel"><h3>Included</h3>${renderItems(content.scope.included, 'Nothing included.')}</article>
      <article class="subpanel"><h3>Excluded</h3>${renderItems(content.scope.excluded, 'Nothing excluded.')}</article>
    </div>
  </section>

  <section class="panel" aria-labelledby="milestones-heading">
    <div class="section-heading"><p class="eyebrow">Execution shape</p><h2 id="milestones-heading">Milestones and features</h2></div>
    ${milestones}
  </section>

  ${dependencies ?? ''}

  <section class="panel" aria-labelledby="risks-heading">
    <div class="section-heading"><p class="eyebrow">Adversarial view</p><h2 id="risks-heading">Risks and mitigations</h2></div>
    <div class="risk-grid">${content.risks.length === 0 ? '<p class="empty">No risks recorded.</p>' : content.risks.map((risk) => `<article class="risk"><span class="identifier">${escapeHtml(risk.id)}</span><h4>${escapeHtml(risk.description)}</h4><p><strong>Mitigation:</strong> ${escapeHtml(risk.mitigation)}</p></article>`).join('')}</div>
  </section>

  <section class="panel" aria-labelledby="questions-heading">
    <div class="section-heading"><p class="eyebrow">Decisions</p><h2 id="questions-heading">Open and answered questions</h2></div>
    <div class="question-grid">${content.questions.length === 0 ? '<p class="empty">No questions recorded.</p>' : content.questions.map(renderQuestion).join('')}</div>
  </section>

  <section
    class="review"
    id="mnfs-plan-review"
    data-lavish-question="mnfs-plan-review"
    data-mission-id="${escapeHtml(revision.missionId)}"
    data-content-hash="${escapeHtml(revision.contentHash)}"
    data-approval-prompt="${escapeHtml(`MNFS_APPROVE_PLAN mission=${revision.missionId} hash=${revision.contentHash}`)}"
    data-change-prefix="${escapeHtml(`MNFS_REQUEST_CHANGES mission=${revision.missionId} hash=${revision.contentHash}`)}"
    aria-labelledby="review-heading"
  >
    <p class="eyebrow">Operator gate</p>
    <h2 id="review-heading">Review this exact revision</h2>
    <p>Approval is bound to <span class="hash">${escapeHtml(revision.contentHash)}</span>. Requesting changes queues feedback; it never edits the structured plan directly.</p>
    <label for="change-request"><strong>Requested changes</strong></label>
    <textarea id="change-request" placeholder="Describe the exact change Pi should apply to the structured plan."></textarea>
    <div class="actions">
      <button class="secondary" type="button" id="request-changes">Queue requested changes</button>
      <button class="primary" type="button" id="approve-plan">Approve this exact hash</button>
    </div>
    <p id="review-status" role="status" aria-live="polite"></p>
  </section>
</main>
${reviewScript()}
</body>
</html>
`;
}
