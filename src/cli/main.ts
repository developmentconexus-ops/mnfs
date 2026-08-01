import { MnfsError } from '../domain/errors.js';
import type { MissionPlanRevision } from '../domain/mission-plan.js';
import type { Mission, ProjectIdentity, ProjectStatus } from '../domain/types.js';
import type { EnvironmentReport } from '../runtime/environment.js';
import type { ApprovePlanResult, RenderPlanResult } from '../services/mission-plan-service.js';
import { parseArgs } from './args.js';

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface InitializedProjectView extends ProjectIdentity {
  readonly runtimeRoot: string;
}

export interface SavePlanCliInput {
  readonly missionId: string;
  readonly inputPath: string;
  readonly expectedPreviousHash?: string;
}

export interface OpenPlanResult extends RenderPlanResult {
  readonly lavishOutput: string;
}

export interface PollPlanResult extends RenderPlanResult {
  readonly feedback: string;
}

export interface MaterializePlanResult {
  readonly revision: MissionPlanRevision;
  readonly contractPath: string;
}

type Awaitable<T> = T | Promise<T>;

export interface CliDependencies {
  inspect(): EnvironmentReport;
  initialize?(): Awaitable<InitializedProjectView>;
  openMission?(goal: string): Awaitable<Mission>;
  status?(): Awaitable<ProjectStatus>;
  savePlan?(input: SavePlanCliInput): Awaitable<MissionPlanRevision>;
  showPlan?(missionId: string): Awaitable<MissionPlanRevision>;
  renderPlan?(missionId: string): Awaitable<RenderPlanResult>;
  openPlan?(missionId: string): Awaitable<OpenPlanResult>;
  pollPlan?(missionId: string): Awaitable<PollPlanResult>;
  approvePlan?(input: {
    readonly missionId: string;
    readonly contentHash: string;
  }): Awaitable<ApprovePlanResult>;
  materializePlan?(missionId: string): Awaitable<MaterializePlanResult>;
  readonly debug?: boolean;
}

const USAGE = `Usage:
  mnfs doctor [--json]
  mnfs init [--json]
  mnfs mission open --goal <text> [--json]
  mnfs status [--json]
  mnfs plan save --mission <id> --input <file> [--expected-hash <hash>] [--json]
  mnfs plan show --mission <id> [--json]
  mnfs plan render --mission <id> [--json]
  mnfs plan open --mission <id> [--json]
  mnfs plan poll --mission <id> [--json]
  mnfs plan approve --mission <id> --hash <hash> [--json]
  mnfs plan materialize --mission <id> [--json]
`;

function formatDoctor(report: EnvironmentReport): string {
  const lines: string[] = [
    `${report.ready ? 'READY' : 'NOT READY'} MNFS foundation environment`,
    `INFO environment ${report.environment}`,
    `INFO node ${report.nodeVersion}`,
    `INFO cwd ${report.cwd}`,
  ];

  for (const tool of report.tools) {
    if (tool.path) lines.push(`PASS ${tool.name} ${tool.path}`);
    else if (tool.required) lines.push(`FAIL ${tool.name} not found (required)`);
    else lines.push(`WARN ${tool.name} not found (optional)`);
  }

  for (const problem of report.problems) {
    lines.push(`FAIL ${problem.code} — ${problem.message}`);
    lines.push(`  ${problem.remediation}`);
  }

  return `${lines.join('\n')}\n`;
}

function formatStatus(status: ProjectStatus): string {
  const lines = [
    'MNFS project status',
    `Missions ${status.missions.total} total · ${status.missions.open} open · ${status.missions.closed} closed`,
  ];
  for (const mission of status.missions.active) {
    lines.push(`${mission.id} ${mission.status} — ${mission.goal}`);
  }
  return `${lines.join('\n')}\n`;
}

function formatPlanRevision(revision: MissionPlanRevision, verb: 'Saved' | 'Current'): string {
  const next = revision.status === 'APPROVED'
    ? `Next: mnfs plan materialize --mission ${revision.missionId}`
    : `Next: mnfs plan render --mission ${revision.missionId}`;
  return `${verb} ${revision.missionId} plan revision ${revision.revision} ${revision.status}\nHash ${revision.contentHash}\nGoal ${revision.content.goal}\n${next}\n`;
}

function missingDependency(name: string): never {
  throw new MnfsError('INTERNAL_ERROR', `CLI dependency is not configured: ${name}`);
}

function errorResult(error: unknown, debug: boolean): CliResult {
  if (error instanceof MnfsError) {
    const remediation = error.remediation ? `\n${error.remediation}` : '';
    return {
      exitCode: error.exitCode,
      stdout: '',
      stderr: `${error.code}: ${error.message}${remediation}\n`,
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  const detail = debug && error instanceof Error && error.stack ? `\n${error.stack}` : '';
  return {
    exitCode: 1,
    stdout: '',
    stderr: `INTERNAL_ERROR: ${message}${detail}\n`,
  };
}

function jsonOutput(value: unknown): string {
  return `${JSON.stringify(value)}\n`;
}

export async function runCli(
  argv: readonly string[],
  dependencies: CliDependencies,
): Promise<CliResult> {
  const args = parseArgs(argv);
  if (args.kind === 'help') return { exitCode: 0, stdout: USAGE, stderr: '' };
  if (args.kind === 'invalid') {
    return {
      exitCode: 2,
      stdout: '',
      stderr: `INVALID_ARGUMENTS: ${args.message}\n${USAGE}`,
    };
  }

  try {
    if (args.kind === 'doctor') {
      const report = dependencies.inspect();
      return {
        exitCode: report.ready ? 0 : 1,
        stdout: args.json ? jsonOutput(report) : formatDoctor(report),
        stderr: '',
      };
    }

    if (args.kind === 'init') {
      const project = await (dependencies.initialize ?? (() => missingDependency('initialize')))();
      return {
        exitCode: 0,
        stdout: args.json
          ? jsonOutput(project)
          : `Initialized MNFS for ${project.projectRoot}\nRuntime ${project.runtimeRoot}\n`,
        stderr: '',
      };
    }

    if (args.kind === 'mission-open') {
      const mission = await (dependencies.openMission ?? (() => missingDependency('openMission')))(args.goal);
      return {
        exitCode: 0,
        stdout: args.json
          ? jsonOutput(mission)
          : `Opened ${mission.id} — ${mission.goal}\n`,
        stderr: '',
      };
    }

    if (args.kind === 'status') {
      const status = await (dependencies.status ?? (() => missingDependency('status')))();
      return {
        exitCode: 0,
        stdout: args.json ? jsonOutput(status) : formatStatus(status),
        stderr: '',
      };
    }

    if (args.kind === 'plan-save') {
      const revision = await (dependencies.savePlan ?? (() => missingDependency('savePlan')))({
        missionId: args.missionId,
        inputPath: args.inputPath,
        ...(args.expectedPreviousHash === undefined
          ? {}
          : { expectedPreviousHash: args.expectedPreviousHash }),
      });
      return {
        exitCode: 0,
        stdout: args.json ? jsonOutput(revision) : formatPlanRevision(revision, 'Saved'),
        stderr: '',
      };
    }

    if (args.kind === 'plan-show') {
      const revision = await (dependencies.showPlan ?? (() => missingDependency('showPlan')))(args.missionId);
      return {
        exitCode: 0,
        stdout: args.json ? jsonOutput(revision) : formatPlanRevision(revision, 'Current'),
        stderr: '',
      };
    }

    if (args.kind === 'plan-render') {
      const rendered = await (dependencies.renderPlan ?? (() => missingDependency('renderPlan')))(args.missionId);
      return {
        exitCode: 0,
        stdout: args.json
          ? jsonOutput(rendered)
          : `Rendered ${rendered.revision.missionId} plan revision ${rendered.revision.revision}\nArtifact ${rendered.htmlPath}\nNext: mnfs plan open --mission ${rendered.revision.missionId}\n`,
        stderr: '',
      };
    }

    if (args.kind === 'plan-open') {
      const opened = await (dependencies.openPlan ?? (() => missingDependency('openPlan')))(args.missionId);
      return {
        exitCode: 0,
        stdout: args.json
          ? jsonOutput(opened)
          : `Opened ${opened.revision.missionId} plan revision ${opened.revision.revision} in Lavish\nArtifact ${opened.htmlPath}\nNext: mnfs plan poll --mission ${opened.revision.missionId}\n`,
        stderr: '',
      };
    }

    if (args.kind === 'plan-poll') {
      const polled = await (dependencies.pollPlan ?? (() => missingDependency('pollPlan')))(args.missionId);
      return {
        exitCode: 0,
        stdout: args.json
          ? jsonOutput(polled)
          : `Lavish feedback for ${polled.revision.missionId} revision ${polled.revision.revision}\n${polled.feedback}\nNext: revise with --expected-hash ${polled.revision.contentHash}, or approve that exact hash.\n`,
        stderr: '',
      };
    }

    if (args.kind === 'plan-approve') {
      const approved = await (dependencies.approvePlan ?? (() => missingDependency('approvePlan')))({
        missionId: args.missionId,
        contentHash: args.contentHash,
      });
      return {
        exitCode: 0,
        stdout: args.json
          ? jsonOutput(approved)
          : `Approved ${approved.revision.missionId} plan revision ${approved.revision.revision}\nHash ${approved.revision.contentHash}\nContract ${approved.contractPath}\n`,
        stderr: '',
      };
    }

    const materialized = await (dependencies.materializePlan ?? (() => missingDependency('materializePlan')))(args.missionId);
    return {
      exitCode: 0,
      stdout: args.json
        ? jsonOutput(materialized)
        : `Materialized ${materialized.revision.missionId} approved plan revision ${materialized.revision.revision}\nContract ${materialized.contractPath}\n`,
      stderr: '',
    };
  } catch (error) {
    return errorResult(error, dependencies.debug === true);
  }
}
