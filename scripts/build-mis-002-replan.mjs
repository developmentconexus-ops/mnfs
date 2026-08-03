#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { hashSecE1Bytes, validateSecE1 } from './sec-e1-policy.mjs';

const MISSION_ID = 'MIS-002';
const SECURITY_POLICY_HASH = /^sha256:[a-f0-9]{64}$/u;
const requirement = (number) => `CAP-EXEC-REQ-${String(number).padStart(3, '0')}`;
const ALL_REQUIREMENTS = Array.from({ length: 28 }, (_, index) => requirement(index + 1));

const CRITERION_STATEMENTS = new Map([
  [1, 'A Write Track has at most one current non-terminal Attempt, enforced transactionally and recovered consistently by a fresh process.'],
  [2, 'Attempt and Worker Run retain distinct durable identities so process replacement never rewrites logical attempt history.'],
  [3, 'Worker completion and process exit never accept a Claim or close a Feature without an MNFS Gate decision.'],
  [4, 'Claim creation and its matching Domain Event commit atomically or leave no durable mutation.'],
  [5, 'Every Attempt, Worker Run and Claim binds to the exact approved Mission contract hash and rejects stale authority.'],
  [6, 'Treehouse acquisition and release follow Intent–Action–Observation with durable intent and observed external identity.'],
  [7, 'Lease release is idempotent and fenced by both the MNFS Lease identity and the observed Treehouse resource identity.'],
  [8, 'Reconcile detects orphan worktrees and Leases without worktrees, preserves unlanded work and performs no automatic destruction.'],
  [9, 'The Pi Worker starts with cwd set to the exact leased Treehouse worktree.'],
  [10, 'Worker start requires the stable SEC-E1 definition hash and a matching run-specific effective policy hash bound to the current Attempt.'],
  [11, 'The E1 boundary denies protected host, credential, metadata and out-of-scope filesystem reads and writes.'],
  [12, 'The M2 Worker has no network access, no credential grant and no X2-or-higher external effect authority.'],
  [13, 'Sandbox initialization or policy validation failure prevents Worker start and exposes no direct-host fallback.'],
  [14, 'Dispatch includes a fresh Current Authority Snapshot for the qualified target, exact contract and current operational state.'],
  [15, 'The fixed Writer Pack declares target, contract, task, write-set, policy, output contract and termination condition.'],
  [16, 'Process exit is recorded only as an observation; durable lifecycle mutation occurs through validated MNFS services.'],
  [17, 'A fresh Lead recovers Track, Lease, Environment, Attempt, Worker Run and Claim without transcript, terminal scraping or Observational Memory.'],
  [18, 'A late result from a superseded Attempt is recorded as stale evidence and cannot mutate the current Attempt or Claim.'],
  [19, 'Cold deterministic verification produces a runner-owned Minimal Receipt bound to criterion, contract, result tree and environment.'],
  [20, 'Only an MNFS Gate with valid Evidence and Authority can accept the Claim.'],
  [21, 'Wrong contract hash, wrong result tree, stale Receipt or mismatched environment rejects or blocks acceptance.'],
  [22, 'Work and resources remain preserved until acceptance or explicit abandonment and then release idempotently after safe disposition.'],
  [23, 'Every M2 command used by the Golden Proof provides stable human and JSON output, typed errors and a concrete next action.'],
  [24, 'M2 persists Domain Events and references to logs, durations, adapter errors and available token counters without requiring an external backend.'],
  [25, 'The required Recovery and Security drills pass on canonical Ubuntu WSL2 with content-addressed evidence: duplicate Lease; Intent persisted before external acquisition; external worktree created before semantic commit; orphan worktree; Lease without worktree; Worker exit without Claim; Lead crash; active Worker Run without process; late result from a superseded Attempt; stale Claim or Receipt; sandbox unavailable; sandbox violation; policy-definition mismatch; effective-policy mismatch; repeated release; and release attempt by a stale Lease holder.'],
  [26, 'The approved M2 contract contains qualified identities and independently decidable criteria at Mission, Milestone and Feature levels.'],
  [27, 'Claims and closeout evidence declare requirements and documentation impact, and generated coverage remains current.'],
  [28, 'The complete deciding proof succeeds without Herdr, Observational Memory, pi-link, remote execution or an external observability backend.'],
]);

const verification = {
  test: {
    method: 'TEST',
    owner: 'MNFS-RUNNER',
    proofType: 'RECEIPT',
    proofOwner: 'MNFS-RUNNER',
  },
  demonstration: {
    method: 'DEMONSTRATION',
    owner: 'MNFS-RUNNER',
    proofType: 'RECEIPT',
    proofOwner: 'MNFS-RUNNER',
  },
  inspectionArtifact: {
    method: 'INSPECTION',
    owner: 'MNFS-RUNNER',
    proofType: 'ARTIFACT',
    proofOwner: 'MNFS-RUNNER',
  },
  inspectionRecord: {
    method: 'INSPECTION',
    owner: 'MNFS-RUNNER',
    proofType: 'RECORD',
    proofOwner: 'MNFS-RUNNER',
  },
  gateVerdict: {
    method: 'TEST',
    owner: 'MNFS-GATE',
    proofType: 'VERDICT',
    proofOwner: 'MNFS-GATE',
  },
  goldenVerdict: {
    method: 'DEMONSTRATION',
    owner: 'MNFS-RUNNER',
    proofType: 'VERDICT',
    proofOwner: 'MNFS-GATE',
  },
};

function verificationFor(number) {
  if ([20, 21].includes(number)) return verification.gateVerdict;
  if ([15, 26, 27].includes(number)) return verification.inspectionArtifact;
  if ([24, 28].includes(number)) return verification.inspectionRecord;
  if ([8, 11, 12, 17, 25].includes(number)) return verification.demonstration;
  return verification.test;
}

function qualifiedCriterion(ownerId, criterionId) {
  return `${ownerId}/${criterionId}`;
}

function customCriterion(
  ownerId,
  id,
  statement,
  requirementNumbers,
  verificationPlan,
) {
  return {
    id,
    qualifiedId: qualifiedCriterion(ownerId, id),
    statement,
    requirementRefs: requirementNumbers.map(requirement),
    verificationPlan: { ...verificationPlan },
  };
}

function criteria(ownerId, numbers) {
  return numbers.map((number, index) => {
    const statement = CRITERION_STATEMENTS.get(number);
    if (!statement) throw new Error(`Missing criterion statement for ${requirement(number)}.`);
    const id = `AC-${String(index + 1).padStart(2, '0')}`;
    return customCriterion(ownerId, id, statement, [number], verificationFor(number));
  });
}

function feature(
  milestoneId,
  id,
  title,
  outcome,
  requirementNumbers,
  dependsOn = [],
  additionalCriteria = [],
) {
  const qualifiedId = `${MISSION_ID}/${milestoneId}/${id}`;
  return {
    id,
    qualifiedId,
    title,
    outcome,
    acceptanceCriteria: [
      ...criteria(qualifiedId, requirementNumbers),
      ...additionalCriteria.map((criterion) => customCriterion(
        qualifiedId,
        criterion.id,
        criterion.statement,
        criterion.requirementNumbers,
        criterion.verificationPlan,
      )),
    ],
    requirementRefs: requirementNumbers.map(requirement),
    dependsOn,
  };
}

function environmentBinding(securityPolicyHash) {
  return {
    environmentRef: 'ENV-E1',
    securityPolicyRef: 'SEC-E1',
    securityPolicyHash,
  };
}

export function buildMis002Replan(securityPolicyHash) {
  if (!SECURITY_POLICY_HASH.test(securityPolicyHash)) {
    throw new Error('security policy hash must be a lowercase sha256:<64 hex> value.');
  }

  const m01Requirements = [1, 2, 4, 5, 6, 7, 8];
  const m02Requirements = [3, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  const missionRequirements = [23, 24, 25, 26, 27, 28];

  const missionAcceptanceCriteria = [
    ...criteria(MISSION_ID, missionRequirements),
    customCriterion(
      MISSION_ID,
      'AC-07',
      'Mission Golden Proof: starting from the approved schema-v2 contract, MNFS creates one Write Track and current Attempt, persists and observes one Treehouse Lease, validates SEC-E1, compiles fresh authority, dispatches the fixed Pi Worker, persists and completes a Claim, terminates the Lead, recovers the same authoritative state with a fresh Lead, proves protected resources and network remained inaccessible, produces a runner-owned Minimal Deterministic Receipt, accepts only through the MNFS Gate, preserves evidence and completes idempotent Environment and Treehouse release.',
      Array.from({ length: 28 }, (_, index) => index + 1),
      verification.goldenVerdict,
    ),
  ];

  const m01AcceptanceCriteria = [
    ...criteria('MIS-002/M01', m01Requirements),
    customCriterion(
      'MIS-002/M01',
      'AC-08',
      'M01 composition proof: across crash windows and retries, SQLite lifecycle state and matching Domain Events remain coherent with the observed Treehouse worktree and Lease, and a fresh process recovers the same contract-bound identities without duplicate current work or destructive reconciliation.',
      m01Requirements,
      verification.demonstration,
    ),
  ];

  const m02AcceptanceCriteria = [
    ...criteria('MIS-002/M02', m02Requirements),
    customCriterion(
      'MIS-002/M02',
      'AC-16',
      'M02 composition proof on canonical Ubuntu WSL2: the E1 boundary, Pi Worker, durable Claim, fresh Lead recovery, runner-owned Minimal Receipt, MNFS Gate acceptance, evidence preservation and idempotent Environment and Treehouse release execute as one recoverable flow.',
      m02Requirements,
      verification.goldenVerdict,
    ),
  ];

  return {
    schemaVersion: 2,
    missionId: MISSION_ID,
    title: 'M2 governed one-Worker execution and recovery',
    goal: 'Prove that MNFS can execute one fixed deterministic Pi Writer task in a leased Treehouse worktree under SEC-E1, persist and recover authoritative execution state across Lead replacement, independently verify the result and accept it only through an MNFS Gate.',
    acceptanceCriteria: missionAcceptanceCriteria,
    scope: {
      included: [
        'One Write Track with one current non-terminal Attempt and one Pi Worker Run at a time.',
        'Durable Write Track, Lease, Attempt, Worker Run, Claim, Receipt, Gate Verdict, Security Violation and Domain Event identities required by the M2 proof.',
        'Treehouse Lease acquisition, inspection, reconciliation and release through Intent–Action–Observation.',
        'A fixed MNFS-defined deterministic repository task executed in the leased worktree.',
        'Local E1 sandbox execution bound to the stable SEC-E1 definition and a run-specific effective policy hash.',
        'Current Authority Snapshot and fixed Writer Pack compilation before dispatch.',
        'Fresh-Lead recovery without transcript, terminal scraping or Observational Memory.',
        'One runner-owned Minimal Deterministic Receipt and an explicit MNFS Claim Acceptance Gate.',
        'Stable human and JSON CLI behavior, typed errors, local observability and required WSL2 failure drills.',
      ],
      excluded: [
        'Arbitrary operator-supplied Worker tasks.',
        'Multiple concurrent Workers, worker pools, scheduling policies or parallel Write Tracks.',
        'Independent Reviewer, Correction workflow or Reviewer Verdict.',
        'Integration queue, browser QA, generalized QA journeys or generalized Evidence Bundles.',
        'Observational Memory, pi-link or Herdr as a deciding dependency.',
        'Remote sandboxes, remote execution, Web Console or an external observability backend.',
        'Credential grants, network access and X2-or-higher external or production effects.',
        'Automatic merge, integration or release of unaccepted work.',
        'A generalized repository-identity recovery command; it is tracked by Issue #15 and is not required for the bounded M2 Golden Proof.',
      ],
    },
    assumptions: [
      'The canonical execution environment is a Linux-owned checkout under Ubuntu WSL2.',
      'The canonical checkout retains a valid .mnfs/repo.json bound to its existing runtime database; governed reattachment is tracked by Issue #15.',
      'Treehouse, Pi, Bubblewrap and the pinned Sandbox Runtime dependencies are available or fail closed before dispatch.',
      'The trusted provider host may use valid subscription OAuth, while the Worker receives no provider credential or arbitrary host environment variable.',
      'The fixed M2 task requires no network, credential or production effect.',
      'Historical MIS-002 revision 3 remains immutable with approved content hash sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1.',
      'Exact command names, migrations and the concrete demo fixture are frozen during R5 microdesign before any Worker dispatch.',
    ],
    productMilestoneRefs: ['M2'],
    capabilityRefs: [
      {
        id: 'CAP-EXECUTION',
        specPath: 'docs/capabilities/CAP-EXECUTION/SPEC.md',
        version: '0.1.0',
      },
    ],
    requirementRefs: [...ALL_REQUIREMENTS],
    environmentBinding: environmentBinding(securityPolicyHash),
    documentationImpact: {
      status: 'UPDATED',
      refs: [
        'CAP-EXECUTION',
        'CAP-EXECUTION-COVERAGE',
        'DOC-PRODUCT-BLUEPRINT-02',
        'DESIGN-MIS-002-REPLAN',
        'ACCEPTANCE-CAP-EXECUTION-R3',
      ],
      rationale: 'The Replan binds the accepted Capability, SEC-E1 boundary, hierarchical criteria, requirement allocation, recovery proof and documentation impact required for M2.',
    },
    requirementsImpact: {
      status: 'UPDATED',
      refs: [...ALL_REQUIREMENTS],
      rationale: 'All 28 capability requirements receive explicit lineage in the schema-v2 Mission contract; approved allocation remains a separate post-approval traceability step.',
    },
    milestones: [
      {
        id: 'M01',
        qualifiedId: 'MIS-002/M01',
        title: 'Durable Execution and Lease Core',
        outcome: 'MNFS possesses a durable, contract-bound execution identity model and can acquire, observe, reconcile and release one Treehouse Lease through explicit external-operation semantics.',
        acceptanceCriteria: m01AcceptanceCriteria,
        requirementRefs: m01Requirements.map(requirement),
        dependsOn: [],
        features: [
          feature(
            'M01',
            'F01',
            'Execution identity and persistence',
            'Write Track, Attempt, Worker Run and Claim identities persist with exact contract binding, optimistic versioning, typed conflicts and atomic Domain Events.',
            [1, 2, 4, 5],
            [],
            [
              {
                id: 'AC-05',
                statement: 'Applying the M2 database migration to an existing M0/M1 SQLite database preserves repository identity, missions, Domain Events, historical plan revisions and exact approved content, and a fresh process recovers the migrated state.',
                requirementNumbers: [],
                verificationPlan: verification.test,
              },
            ],
          ),
          feature(
            'M01',
            'F02',
            'Treehouse Lease lifecycle',
            'MNFS grants, inspects and releases one Treehouse worktree through durable intent, observed external identity, idempotency and stale-holder fencing.',
            [6, 7],
            ['MIS-002/M01/F01'],
          ),
          feature(
            'M01',
            'F03',
            'Lease reconciliation foundation',
            'A fresh process reports orphan worktrees and Leases without worktrees, preserves unlanded work and recommends a safe next action without automatic destruction.',
            [8],
            ['MIS-002/M01/F01', 'MIS-002/M01/F02'],
          ),
        ],
      },
      {
        id: 'M02',
        qualifiedId: 'MIS-002/M02',
        title: 'Governed E1 Worker, Recovery and Acceptance',
        outcome: 'One Pi Worker executes the fixed deterministic task in a leased worktree under E1, produces a durable Claim, survives Lead replacement, receives runner-owned deterministic proof and is accepted only by an MNFS Gate.',
        acceptanceCriteria: m02AcceptanceCriteria,
        requirementRefs: m02Requirements.map(requirement),
        environmentBinding: environmentBinding(securityPolicyHash),
        dependsOn: ['MIS-002/M01'],
        features: [
          feature(
            'M02',
            'F01',
            'E1 Environment and secure dispatch',
            'The Pi Worker starts in the leased worktree only after fail-closed SEC-E1 validation with seven brokered tools, no network, no credentials and no X2-or-higher authority.',
            [9, 10, 11, 12, 13],
            ['MIS-002/M01/F02', 'MIS-002/M01/F03'],
          ),
          feature(
            'M02',
            'F02',
            'Current Authority Snapshot and fixed Writer Pack',
            'Dispatch compiles fresh bounded authority and a fixed task contract containing the qualified target, exact contract, write-set, policy, output and termination condition.',
            [14, 15],
            ['MIS-002/M01/F01'],
          ),
          feature(
            'M02',
            'F03',
            'Pi Worker process and durable Claim',
            'MNFS observes the Pi process, records Worker Run lifecycle and persists a structured Claim for the fixed edit without interpreting process exit or Worker completion as acceptance.',
            [3, 16],
            ['MIS-002/M02/F01', 'MIS-002/M02/F02'],
          ),
          feature(
            'M02',
            'F04',
            'Fresh-Lead recovery and Attempt fencing',
            'A fresh Lead recovers the same execution state, classifies lost processes and fences duplicate or late results while preserving work and operator attention.',
            [17, 18],
            ['MIS-002/M02/F03'],
          ),
          feature(
            'M02',
            'F05',
            'Minimal verification, Gate and safe release',
            'MNFS produces one runner-owned deterministic Receipt, validates freshness, accepts only through the Gate and releases Environment and Treehouse resources after safe disposition.',
            [19, 20, 21, 22],
            ['MIS-002/M02/F04'],
          ),
        ],
      },
    ],
    risks: [
      {
        id: 'R01',
        description: 'Treehouse path, permission or cleanup behavior in canonical WSL2 diverges from the observed AS-02 boundary.',
        mitigation: 'Keep Treehouse behind a narrow adapter, validate exact Linux-owned paths and require real WSL2 acceptance for the Golden Proof.',
      },
      {
        id: 'R02',
        description: 'A crash between external worktree action and semantic commit leaves an orphan resource or a Lease without a worktree.',
        mitigation: 'Persist intent first, observe external identity, reconcile read-only by default and cover every crash window with deterministic drills.',
      },
      {
        id: 'R03',
        description: 'Worker text, process exit or a completion notification is treated as authoritative lifecycle state.',
        mitigation: 'Permit durable state transitions only through validated MNFS services and reserve acceptance authority for the Gate.',
      },
      {
        id: 'R04',
        description: 'The stable policy definition or run-specific compiled policy drifts after the contract is approved.',
        mitigation: 'Bind both hashes to the Attempt and fail closed before Worker start on either mismatch.',
      },
      {
        id: 'R05',
        description: 'A late result from a superseded Attempt mutates the current Claim or overwrites newer work.',
        mitigation: 'Fence every mutation by Track, Attempt generation, Worker Run and exact contract hash; retain stale results only as evidence.',
      },
      {
        id: 'R06',
        description: 'Cleanup releases or destroys work before acceptance or explicit abandonment.',
        mitigation: 'Preserve work by default, separate safe disposition from physical release and prohibit force destruction in the normal lifecycle.',
      },
      {
        id: 'R07',
        description: 'The walking skeleton grows into scheduler, review, integration, QA or remote execution scope.',
        mitigation: 'Enforce the explicit exclusions and require a new Capability/Mission decision for every deferred subsystem.',
      },
      {
        id: 'R08',
        description: 'A provider, Pi, Sandbox Runtime or broker dependency changes behavior after the accepted proof.',
        mitigation: 'Pin reviewed versions, record dependency identity in Attempts and rerun security/recovery proof when a review trigger changes.',
      },
      {
        id: 'R09',
        description: 'Loss of .mnfs/repo.json disconnects an otherwise valid checkout from its existing authoritative runtime database.',
        mitigation: 'Require a valid repository identity for the M2 Golden Proof, never run init over proven state, and implement governed read-only-first reattachment under Issue #15.',
      },
    ],
    questions: [
      {
        id: 'Q01',
        question: 'Who defines the fixed M2 repository task and when are its exact fixture bytes frozen?',
        blocking: true,
        status: 'ANSWERED',
        answer: 'MNFS defines the deterministic task. The exact disposable fixture path and bytes are frozen in approved R5 microdesign before dispatch and are not operator-supplied at runtime.',
      },
      {
        id: 'Q02',
        question: 'Is Herdr required for any deciding M2 criterion?',
        blocking: true,
        status: 'ANSWERED',
        answer: 'No. Herdr remains an optional later presentation capability and is absent from every deciding M2 criterion.',
      },
      {
        id: 'Q03',
        question: 'Which policy hash is reusable across Attempts?',
        blocking: true,
        status: 'ANSWERED',
        answer: 'The contract binds the exact-byte hash of the stable SEC-E1 definition. Every Attempt separately records the compiled effective policy hash after run-specific paths are resolved.',
      },
      {
        id: 'Q04',
        question: 'How much of the Receipt and Evidence subsystem belongs in M2?',
        blocking: true,
        status: 'ANSWERED',
        answer: 'M2 implements one bounded runner-owned Minimal Deterministic Receipt for the fixed Golden Proof. Generalized Receipts, Integration, adaptive QA and Evidence Bundles remain M5 and later.',
      },
    ],
  };
}

function parseOutputArgument(args) {
  let output;
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token !== '--output') throw new Error(`Unknown argument: ${token}`);
    if (output !== undefined) throw new Error('--output may be provided only once.');
    const value = args[index + 1];
    if (!value || value.startsWith('--')) throw new Error('--output requires a path.');
    output = value;
    index += 1;
  }
  if (!output) throw new Error('--output is required.');
  return path.resolve(output);
}

async function main(args) {
  const output = parseOutputArgument(args);
  const policyUrl = new URL('../policies/SEC-E1.json', import.meta.url);
  const policyBytes = await readFile(policyUrl);
  const policyErrors = validateSecE1(JSON.parse(policyBytes.toString('utf8')));
  if (policyErrors.length > 0) {
    throw new Error(`SEC-E1 validation failed:\n${policyErrors.map((error) => `- ${error}`).join('\n')}`);
  }
  const securityPolicyHash = hashSecE1Bytes(policyBytes);
  const candidate = buildMis002Replan(securityPolicyHash);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    status: 'BUILT',
    missionId: MISSION_ID,
    output,
    securityPolicyHash,
    milestones: candidate.milestones.length,
    features: candidate.milestones.reduce((total, milestone) => total + milestone.features.length, 0),
    requirements: candidate.requirementRefs.length,
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
