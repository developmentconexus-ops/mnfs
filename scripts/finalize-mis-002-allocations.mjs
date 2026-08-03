#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const APPROVED_HASH = 'sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3';
const POLICY_HASH = 'sha256:f3dfca19f39bdd733f414831834a380b997e4938c10669c89a034cd9ad9c2471';
const HISTORICAL_HASH = 'sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1';
const HISTORICAL_BLOB = '6b79117fe66cd5c9c8142099828812f470ce20de';
const ACCEPTANCE_ID = 'ACCEPTANCE-MIS-002-REPLAN';

function fail(message) {
  throw new Error(message);
}

function collectCriterionIds(contract) {
  const ids = new Set(contract.content.acceptanceCriteria.map((criterion) => criterion.qualifiedId));
  for (const milestone of contract.content.milestones) {
    for (const criterion of milestone.acceptanceCriteria) ids.add(criterion.qualifiedId);
    for (const feature of milestone.features) {
      for (const criterion of feature.acceptanceCriteria) ids.add(criterion.qualifiedId);
    }
  }
  return ids;
}

function approvedTarget(requirement, criterionIds) {
  const proposed = requirement.proposedAllocation ?? [];
  const allocated = requirement.allocatedTo ?? [];

  if (proposed.length > 0) {
    if (!proposed.every((value) => value.startsWith('proposed:'))) {
      fail(`${requirement.id}: malformed proposed allocation`);
    }
    const targets = proposed.map((value) => value.replace(/^proposed:/u, ''));
    if (allocated.length > 0 && JSON.stringify(allocated) !== JSON.stringify(targets)) {
      fail(`${requirement.id}: existing approved allocation conflicts with proposed target`);
    }
    for (const target of targets) {
      if (!criterionIds.has(target)) fail(`${requirement.id}: criterion absent from approved contract: ${target}`);
    }
    return targets;
  }

  if (allocated.length === 0) fail(`${requirement.id}: no proposed or approved allocation`);
  for (const target of allocated) {
    if (target.startsWith('proposed:')) fail(`${requirement.id}: approved target retains proposed prefix`);
    if (!criterionIds.has(target)) fail(`${requirement.id}: criterion absent from approved contract: ${target}`);
  }
  return allocated;
}

function acceptanceDocument(contract, rows) {
  const table = rows
    .map(({ id, level, target }) => `| \`${id}\` | ${level} | \`${target}\` |`)
    .join('\n');

  return `---
id: ${ACCEPTANCE_ID}
title: MIS-002 schema-v2 Replan Acceptance
document_type: acceptance_report
form: explanation
authority: evidence
status: accepted
version: 1.0.0
owners:
  - developmentconexus-ops
related:
  - CAP-EXECUTION
  - CAP-EXECUTION-COVERAGE
  - ACCEPTANCE-CAP-EXECUTION-R3
  - ACCEPTANCE-AS-02-LOCAL-PI-SANDBOX-WSL2
  - DESIGN-MIS-002-REPLAN
tracking_issue: 9
last_reviewed: 2026-08-03
---

# MIS-002 schema-v2 Replan Acceptance

## Decision

The Operator reviewed the complete schema-v2 Replan in Lavish and authorized exact-hash approval with:

\`\`\`text
MNFS_APPROVE_PLAN mission=MIS-002 hash=${APPROVED_HASH}
\`\`\`

The planning service approved and materialized MIS-002 revision 5, schema 2, at \`${APPROVED_HASH}\` on \`${contract.approvedAt}\`.

This accepts the Mission contract and exact criterion allocation. It does not implement the Worker, enter R5 microdesign, unblock M2 or authorize dispatch.

## Preservation and bindings

\`\`\`text
Historical revision 3 blob: ${HISTORICAL_BLOB}
Historical content hash:    ${HISTORICAL_HASH}
SEC-E1 definition hash:     ${POLICY_HASH}
CAP-EXECUTION version:      0.1.0
\`\`\`

Revision 3 remains immutable historical evidence. Revision 5 contains two Milestones, 3+5 Features, 28 requirement references, independently decidable criteria at every level and explicit Golden Proof composition criteria.

## Approved requirement allocations

| Requirement | Level | Approved criterion |
|---|---|---|
${table}

All 28 targets were converted mechanically by removing only \`proposed:\` and proving each resulting qualified criterion exists in the approved revision 5 contract.

## Mechanical readiness

\`\`\`text
R0 Baseline              PASS
R1 Applicability         PASS
R2 Requirements          PASS
R3 Capability Readiness  PASS
R4 Contract Readiness    PASS
R5 Milestone Microdesign NOT_STARTED
\`\`\`

R4 PASS does not mean implementation has started. M2 remains blocked pending a separate exact Operator token tied to \`${APPROVED_HASH}\` and R0-R4. Until then, M01 microdesign and Worker dispatch remain prohibited.
`;
}

function statusDocument() {
  return `---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.4.0
owners:
  - developmentconexus-ops
related:
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-ROADMAP
  - EVID-PLAN-CONTRACT-SCHEMA-V2
  - ACCEPTANCE-CAP-EXECUTION-R3
  - ${ACCEPTANCE_ID}
tracking_issue: 9
---

# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2; Windows remains the browser, terminal and desktop host
- **Completed Product Milestones:** M0 — Foundation Walking Skeleton; M1 — Visual Mission Planning
- **Architecture Baseline:** accepted and merged through PR #11 at \`f28cf2b58b7f1682450399c6edb50c983fff0cc2\`
- **Current enabler:** Issue #9 — M2 readiness decision
- **Implementation PR:** #14 — \`plan/mis-002-replan\` (draft)
- **M2 state:** blocked pending explicit Operator unblock; Worker implementation has not started
- **Approved M2 contract:** MIS-002 revision 5, schema v2, \`${APPROVED_HASH}\`
- **Historical contract:** revision 3 preserved at blob \`${HISTORICAL_BLOB}\`

## Architecture and contract progress

- [x] Product Blueprint, Roadmap, Governance and Capability Realization Method approved.
- [x] CAP-EXECUTION applicability and 28 requirements reconciled.
- [x] Plan Contract schema v2 implemented and verified.
- [x] AS-02 accepted on canonical Ubuntu WSL2.
- [x] CAP-EXECUTION version 0.1.0 accepted; R3 PASS.
- [x] MIS-002 revision 5 reviewed in Lavish and exact-hash approved.
- [x] All 28 requirements allocated to exact approved criterion identities.
- [x] MCRM R0-R4 mechanically PASS.
- [ ] Operator explicitly unblocks M2 for R5 M01 microdesign.

## Readiness result

\`\`\`text
R0 Baseline              PASS
R1 Applicability         PASS
R2 Requirements          PASS
R3 Capability Readiness  PASS
R4 Contract Readiness    PASS
R5 Milestone Microdesign NOT_STARTED
\`\`\`

## Current blocker

The only remaining governance blocker is the separate Operator decision authorizing M2 to enter R5 microdesign. No Worker implementation or dispatch is authorized.

## Immediate next action

1. Present the final R0-R4 evidence packet and exact approved hash.
2. Require the exact M2-unblock token.
3. Record the decision without starting implementation automatically.
4. After unblock, write M01 microdesign before any Worker dispatch.
`;
}

export async function finalizeMis002Allocations() {
  const contract = JSON.parse(await readFile('.mnfs/missions/MIS-002/plan.json', 'utf8'));
  if (contract.missionId !== 'MIS-002') fail('contract mission must be MIS-002');
  if (contract.revision !== 5) fail(`contract revision must be 5, received ${contract.revision}`);
  if (contract.contentHash !== APPROVED_HASH) fail(`contract hash mismatch: ${contract.contentHash}`);
  if (contract.content.schemaVersion !== 2) fail('contract must use schemaVersion 2');
  if (!contract.approvedAt) fail('contract must be approved');

  const criterionIds = collectCriterionIds(contract);
  const tracePath = 'docs/capabilities/CAP-EXECUTION/TRACEABILITY.json';
  const trace = JSON.parse(await readFile(tracePath, 'utf8'));
  if (trace.requirements.length !== 28) fail(`expected 28 requirements, received ${trace.requirements.length}`);

  const rows = [];
  for (const requirement of trace.requirements) {
    const targets = approvedTarget(requirement, criterionIds);
    requirement.allocatedTo = targets;
    requirement.proposedAllocation = [];
    rows.push({ id: requirement.id, level: requirement.level, target: targets.join(', ') });

    if (['CAP-EXEC-REQ-026', 'CAP-EXEC-REQ-027'].includes(requirement.id)) {
      requirement.state = 'DESIGNED';
      requirement.blockers = [];
      requirement.evidencedBy ??= [];
      if (!requirement.evidencedBy.includes(ACCEPTANCE_ID)) {
        requirement.evidencedBy.push(ACCEPTANCE_ID);
      }
    }
  }

  trace.baseline.missionContract = {
    missionId: 'MIS-002',
    currentRevision: 5,
    status: 'APPROVED_SCHEMA_V2',
  };
  trace.readiness.R4 = {
    result: 'PASS',
    reason: 'Approved MIS-002 revision 5 schema-v2 contract allocates all 28 requirements to exact criteria',
  };
  trace.blockingItems = [];
  trace.nextSequence = [
    'review mechanical R0-R4 evidence',
    'obtain explicit Operator M2 unblock',
    'write M01 microdesign only after unblock',
  ];

  await writeFile(tracePath, `${JSON.stringify(trace, null, 2)}\n`, 'utf8');
  await writeFile(
    'docs/acceptance/2026-08-03-mis-002-replan.md',
    acceptanceDocument(contract, rows),
    'utf8',
  );
  await writeFile('docs/tracking/STATUS.md', statusDocument(), 'utf8');

  const worklogPath = 'docs/tracking/WORKLOG.md';
  let worklog = await readFile(worklogPath, 'utf8');
  if (!worklog.includes('### MIS-002 revision 5 approval and R4 allocation')) {
    worklog += `\n\n### MIS-002 revision 5 approval and R4 allocation\n\n- Operator supplied exact approval token for \`${APPROVED_HASH}\` after Lavish and adversarial review.\n- Planning service materialized MIS-002 revision 5 as the approved schema-v2 contract; revision 3 remains immutable history.\n- Converted all 28 proposed allocations to exact approved criterion identities and removed \`BLOCK-MIS-002-REPLAN\`.\n- Added acceptance evidence \`${ACCEPTANCE_ID}\`; R0-R4 must pass mechanically with R5 NOT_STARTED.\n- M2 remains blocked pending a separate exact Operator decision; no Worker code, M01 microdesign or dispatch was authorized.\n`;
    await writeFile(worklogPath, worklog, 'utf8');
  }

  return {
    status: 'FINALIZED',
    missionId: 'MIS-002',
    revision: 5,
    contentHash: APPROVED_HASH,
    allocations: rows.length,
    acceptanceId: ACCEPTANCE_ID,
  };
}

async function main() {
  console.log(JSON.stringify(await finalizeMis002Allocations(), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
