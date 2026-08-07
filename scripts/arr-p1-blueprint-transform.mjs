#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceDir = path.join(root, 'docs/product/blueprint');
const marker = 'ARR-RECONCILIATION-2026-08-07';
const precedence = 'Any conflicting tool-specific statement below is historical realization context, not current constitutional authority.';

const blocks = new Map([
  ['01-product-vision.md', `## ARR-RECONCILIATION-2026-08-07 — Current constitutional direction

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

The current product architecture is:

\`\`\`text
Thin Sovereign Semantic Kernel
+ Validation-first Planning
+ Replaceable Open Agent Runtime
+ Property-based Execution Environment
+ Provider-neutral Git Result Boundary
+ Independent Evidence / Gates
+ Capability-first Sourcing
\`\`\`

Pi, Treehouse and the historical fixed E1 realization remain useful implementation Evidence and candidates where applicable; they are not constitutional requirements after D-012 through D-015. Product M2 keeps its secure one-Worker outcome but its realization is an Opportunity Replan and revision-5 M02 must not be implemented.`],

  ['02-domain-model.md', `## ARR-RECONCILIATION-2026-08-07 — Current domain semantics

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

**Runtime Session is observational**. Role, ActorRun, Attempt, Authority, Claim, Evidence and Verdict remain MNFS domain truth; losing or replacing a runtime Session cannot lose or redefine them.

A WriteTrack semantically owns an isolated mutable workspace, not an inherent Git worktree. Its physical realization may be a worktree, COW state, private rootfs/disk or another selected substrate. Accepted result identity remains provider-neutral Git base/result identity.

Child criteria and bounded work declare upward \`CONTRIBUTES_TO\` lineage to parent outcomes. Execution Environment identity/bindings describe independent properties and selected concrete realization; this reconciliation does not create speculative generic provider entities.`],

  ['03-lifecycle-flows.md', `## ARR-RECONCILIATION-2026-08-07 — Current planning and execution lifecycle

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

The current lifecycle is validation-first:

\`\`\`text
Operator Intent
→ Investigation / Localization
→ Validation Baseline
→ adversarial correctness review
→ Milestone / Feature decomposition + CONTRIBUTES_TO coverage
→ Execution Design & Readiness
→ Fresh bounded Actor work
→ Claim
→ deterministic Receipts
→ independent Review / Validation
→ Finding routing
→ composition validation
→ Mission outcome validation
→ Closeout / Learning
\`\`\`

Correctness and approved realization are frozen for bounded execution; tactical Actor planning may adapt to observations inside those bounds. Findings route to Correction/new Attempt, a new bounded Feature when scope already permits it, or Decision/Replan when correctness, architecture, security or outcome is wrong.`],

  ['04-engineering-system.md', `## ARR-RECONCILIATION-2026-08-07 — Capability-first sourcing

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

Material realization uses the canonical vocabulary:

\`OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT\`.

MNFS owns differentiated semantics and authority. Commodity machinery is adopted/adapted when a replaceable substrate eliminates meaningful machinery without becoming a second source of truth. Prefer the lowest sufficient upstream layer, one primary production substrate per concern and a concrete implementation until a second real consumer earns a generic abstraction.

Engineering Standards, applicability, Waivers, Golden Paths and proof ownership remain MNFS semantics; repository-native linters, scanners, typecheckers and other mature tools remain replaceable machinery behind those semantics.`],

  ['05-system-architecture.md', `## ARR-RECONCILIATION-2026-08-07 — Current system architecture

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

The architecture is a Thin Sovereign Semantic Kernel with a **Replaceable Agent Runtime** and a property-based Execution Environment outside the semantic core.

\`\`\`text
Operator / MNFS domain authority
        ↓
Planning + Context compilation
        ↓
Role / ActorRun boundary
        ↓
replaceable Agent Runtime
        ↓ controlled capability boundary
Execution Environment
  + isolated mutable workspace
  + compute/isolation properties
  + network/credential/resource policy
        ↓
provider-neutral Git result identity
        ↓
Verification / independent Validation / MNFS Gate
\`\`\`

SQLite remains operational-state authority and Git remains code/result identity. Initial adapters stay concrete; this architecture does not authorize a generic runtime/environment/workspace provider framework without a second production consumer.`],

  ['06-roles-authority.md', `## ARR-RECONCILIATION-2026-08-07 — Current Role and Authority rules

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

Role authority belongs to MNFS identities, not runtime Sessions. Planner, Investigator, Writer, Reviewer/Validator, Integrator and QA receive role-specific compiled packs with current Authority, target, proof and effect boundaries.

**Validator does not receive write authority by default**. The Writer implements and produces a Claim; independent verification/validation produces Receipts and Findings; only the governed MNFS Gate or explicitly authorized Operator transition may accept where policy assigns that authority.

Fresh Actor orientation and structured handoff must be sufficient without the previous conversation. Session continuity is an optimization only.`],

  ['07-quality-evidence.md', `## ARR-RECONCILIATION-2026-08-07 — Current Evidence and acceptance rules

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

**Implementer completion never grants acceptance**. Claim, deterministic Receipt, independent Finding/Review and Verdict remain distinct evidence stages.

Proof-first is universal; TDD is required where executable TEST is the correct deciding proof and a meaningful RED state can be established before implementation. Parent Milestone/Mission outcomes still require composition and outcome validation even when every child unit is green.

Evidence bound to the wrong/stale contract, Attempt, policy, environment or Git result identity cannot decide the current target.`],

  ['08-state-recovery.md', `## ARR-RECONCILIATION-2026-08-07 — Current Recovery semantics

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

**Fresh Recovery does not depend on runtime transcript**. Recovery loads authoritative MNFS state, observes Git plus selected Environment/workspace/runtime resources, classifies divergence and chooses the safe governed next action.

Runtime Sessions, worktree paths, COW deltas, snapshots, VM disks and remote volumes are observations/execution artifacts, not domain authority. Late or superseded Attempts cannot mutate the current target. A HANDOFF_REQUIRED or interrupted Actor is never reclassified as successful merely because partial work exists.`],

  ['09-context-memory.md', `## ARR-RECONCILIATION-2026-08-07 — Current Context and handoff model

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

Authority-critical context is eager: current Authority Snapshot, target, relevant Validation criteria, Execution Unit/Role Contract, architecture/interface constraints, write/resource boundaries, Environment/tool/security policy, proof contract and termination conditions.

Large optional Blueprint history, unrelated Standards, research, vendor docs and tool schemas use progressive disclosure. Runtime Session memory remains observational and may disappear without losing truth.

\`HANDOFF_REQUIRED\` means bounded context/runtime budget ended with coherent state available for a Fresh Actor; it is neither success nor failure. Handoff communicates structured current truth and the next permitted action, not conversational history.`],

  ['10-security-isolation.md', `## ARR-RECONCILIATION-2026-08-07 — Current security and Execution Environment semantics

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

The separate planes remain: Domain Authority, Tool Capability, process/compute isolation, Execution Environment lifecycle, Credential brokerage, Network/Egress policy, External Effect Gate and Evidence/Audit/Reconcile.

**E0 → E4 ordinal ladder is superseded** as the semantic model. Environment requirements are independent properties such as agent placement, compute location, isolation boundary, workspace model, persistence, network posture, credential delivery, resource limits, recovery capability and Git result boundary.

\`CONTROL_SIDE\` placement is preferred when strict MNFS-brokered capabilities are provable so provider credentials stay outside untrusted execution. \`IN_ENVIRONMENT\` is used when whole-agent containment is required, with brokered credential/inference delivery preferred over raw secrets. Protected execution fails closed. No concrete sandbox/microVM/workspace substrate is selected until the approved ARR-S0/S2/S2W evidence gates.`],

  ['12-capability-roadmap.md', `## ARR-RECONCILIATION-2026-08-07 — Current M2 Opportunity-Replan path

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

Product M2 preserves the secure one-Worker vertical-slice outcome while its realization follows the accepted Architecture Realization Review path:

\`\`\`text
ARR-S0  Host Capability Probe
→ ARR-S1 Agent Runtime Conformance
  + ARR-S2 Local Execution Envelope Conformance
→ ARR-S2W Workspace comparison only if S2 requires it
→ ARR-S3 Vertical Composition Proof
→ substrate selection Decision
→ superseding CAP-EXECUTION / MIS-002 Replan
→ new M02 R5 Execution Design + implementation plan
\`\`\`

Revision-5 M02 is a superseded execution path and must not be implemented. Named runtimes/environments remain candidates or historical Evidence until their deciding spike/Decision.`],

  ['13-documentation-governance.md', `## ARR-RECONCILIATION-2026-08-07 — Current development/documentation governance

This reconciliation block has precedence over older realization-specific wording in this section. ${precedence}

The Development Governance Method and accepted **Layered Agent Execution Planning** design govern how architecture inquiry, Decisions and bounded execution relate. MCRM remains the single Capability Realization lifecycle; execution-planning completeness is a derived projection rather than a second manual checklist.

The tooling registry is a projection of capability-realization Decisions, never architecture authority. Accepted Decisions/ADRs/specifications/contracts remain canonical sources; generated Blueprint/Roadmap/Coverage artifacts must be regenerated and checked from their editable sources.

Plan approval may be bound to exact reviewed hashes/blobs. Superseded historical documents are preserved as history instead of silently rewritten into a different decision.`],
]);

function insertAfterFrontmatter(content, block, file) {
  if (content.includes(marker)) return content;
  const match = content.match(/^---\n[\s\S]*?\n---\n/u);
  if (!match) throw new Error(`${file}: missing canonical frontmatter boundary`);
  let next = `${match[0]}\n${block}\n\n---\n\n${content.slice(match[0].length).replace(/^\n*/u, '')}`;
  next = next.replace(/^last_reviewed: \d{4}-\d{2}-\d{2}$/mu, 'last_reviewed: 2026-08-07');
  return next;
}

for (const [name, block] of blocks) {
  const file = path.join(sourceDir, name);
  const original = await readFile(file, 'utf8');
  const updated = insertAfterFrontmatter(original, block, name);
  await writeFile(file, updated, 'utf8');
}

console.log(`Applied ${blocks.size} deterministic ARR Blueprint reconciliation blocks.`);
