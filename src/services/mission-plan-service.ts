import { randomUUID } from 'node:crypto';
import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';

import { MnfsError } from '../domain/errors.js';
import {
  hasOpenBlockingQuestions,
  validateMissionPlan,
  type MissionPlanRevision,
} from '../domain/mission-plan.js';
import { renderMissionPlanHtml } from '../planning/render-plan.js';
import {
  resolveMissionPlanContractPath,
  resolveMissionPlanHtmlPath,
} from '../runtime/paths.js';
import { SqliteStore } from '../store/sqlite-store.js';

export interface SavePlanFromFileInput {
  readonly missionId: string;
  readonly inputPath: string;
  readonly expectedPreviousHash?: string;
}

export interface ApprovePlanInput {
  readonly missionId: string;
  readonly contentHash: string;
}

export interface ApprovePlanResult {
  readonly revision: MissionPlanRevision;
  readonly contractPath: string;
}

export interface RenderPlanResult {
  readonly revision: MissionPlanRevision;
  readonly htmlPath: string;
}

export interface MissionPlanServiceOptions {
  readonly store: SqliteStore;
  readonly projectRoot: string;
  readonly runtimeRoot?: string;
  readonly now?: () => string;
}

interface ApprovedPlanContract {
  readonly schemaVersion: 1;
  readonly missionId: string;
  readonly revision: number;
  readonly contentHash: string;
  readonly approvedAt: string;
  readonly content: MissionPlanRevision['content'];
}

function parsePlanFile(inputPath: string): unknown {
  let source: string;
  try {
    source = readFileSync(inputPath, 'utf8');
  } catch (error) {
    throw new MnfsError(
      'PLAN_INVALID',
      `Cannot read mission plan input ${inputPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  try {
    return JSON.parse(source) as unknown;
  } catch (error) {
    throw new MnfsError(
      'PLAN_INVALID',
      `Mission plan input ${inputPath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function publishContract(path: string, contract: ApprovedPlanContract): void {
  const temporaryPath = `${path}.tmp-${process.pid}-${randomUUID()}`;
  let descriptor: number | undefined;

  try {
    mkdirSync(dirname(path), { recursive: true });
    descriptor = openSync(temporaryPath, 'wx');
    writeFileSync(descriptor, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    renameSync(temporaryPath, path);
  } catch (error) {
    if (descriptor !== undefined) {
      try {
        closeSync(descriptor);
      } catch {
        // Best-effort cleanup must not replace the materialization error.
      }
    }
    try {
      rmSync(temporaryPath, { force: true });
    } catch {
      // The parent path itself may be invalid; preserve the original failure.
    }
    throw new MnfsError(
      'PLAN_MATERIALIZATION_FAILED',
      `Could not publish approved mission plan at ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function publishRenderedPlan(path: string, html: string): void {
  const temporaryPath = `${path}.tmp-${process.pid}-${randomUUID()}`;
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(temporaryPath, html, { encoding: 'utf8', flag: 'wx' });
    renameSync(temporaryPath, path);
  } catch (error) {
    try {
      rmSync(temporaryPath, { force: true });
    } catch {
      // Preserve the original artifact publication failure.
    }
    throw new MnfsError(
      'PLAN_MATERIALIZATION_FAILED',
      `Could not publish rendered mission plan at ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export class MissionPlanService {
  readonly #store: SqliteStore;
  readonly #projectRoot: string;
  readonly #runtimeRoot: string | undefined;
  readonly #now: () => string;

  constructor(options: MissionPlanServiceOptions) {
    this.#store = options.store;
    this.#projectRoot = options.projectRoot;
    this.#runtimeRoot = options.runtimeRoot;
    this.#now = options.now ?? (() => new Date().toISOString());
  }

  savePlanFromFile(input: SavePlanFromFileInput): MissionPlanRevision {
    const content = validateMissionPlan(parsePlanFile(input.inputPath), input.missionId);
    return this.#store.saveMissionPlanRevision({
      missionId: input.missionId,
      content,
      createdAt: this.#now(),
      ...(input.expectedPreviousHash === undefined
        ? {}
        : { expectedPreviousHash: input.expectedPreviousHash }),
    });
  }

  getCurrentPlan(missionId: string): MissionPlanRevision {
    const revision = this.#store.getCurrentMissionPlan(missionId);
    if (revision === undefined) {
      throw new MnfsError('PLAN_NOT_FOUND', `Mission ${missionId} has no mission plan.`);
    }
    return revision;
  }

  renderCurrentPlan(missionId: string): RenderPlanResult {
    if (this.#runtimeRoot === undefined) {
      throw new MnfsError(
        'RUNTIME_HOME_INVALID',
        'Mission plan rendering requires a runtime root.',
        { remediation: 'Construct MissionPlanService with the repository runtime root.' },
      );
    }

    const revision = this.getCurrentPlan(missionId);
    const htmlPath = resolveMissionPlanHtmlPath(
      this.#runtimeRoot,
      missionId,
      revision.revision,
    );
    publishRenderedPlan(htmlPath, renderMissionPlanHtml(revision));
    return { revision, htmlPath };
  }

  approvePlan(input: ApprovePlanInput): ApprovePlanResult {
    const current = this.getCurrentPlan(input.missionId);
    if (current.contentHash !== input.contentHash) {
      throw new MnfsError(
        'PLAN_APPROVAL_CONFLICT',
        `Current plan hash is ${current.contentHash}, not ${input.contentHash}.`,
      );
    }
    if (hasOpenBlockingQuestions(current.content)) {
      throw new MnfsError(
        'PLAN_BLOCKED',
        `Mission ${input.missionId} has an open blocking question and cannot be approved.`,
      );
    }

    const revision = this.#store.approveMissionPlan({
      missionId: input.missionId,
      contentHash: input.contentHash,
      approvedAt: this.#now(),
    });
    const contractPath = this.materializeApprovedPlan(input.missionId);
    return { revision, contractPath };
  }

  materializeApprovedPlan(missionId: string): string {
    const revision = this.getCurrentPlan(missionId);
    if (revision.status !== 'APPROVED' || revision.approvedAt === undefined) {
      throw new MnfsError(
        'PLAN_APPROVAL_CONFLICT',
        `Mission ${missionId} does not have an approved plan to materialize.`,
      );
    }

    const contractPath = resolveMissionPlanContractPath(this.#projectRoot, missionId);
    publishContract(contractPath, {
      schemaVersion: 1,
      missionId,
      revision: revision.revision,
      contentHash: revision.contentHash,
      approvedAt: revision.approvedAt,
      content: revision.content,
    });
    return contractPath;
  }
}
