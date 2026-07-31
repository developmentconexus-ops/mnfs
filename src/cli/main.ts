import { MnfsError } from '../domain/errors.js';
import type { Mission, ProjectIdentity, ProjectStatus } from '../domain/types.js';
import type { EnvironmentReport } from '../runtime/environment.js';
import { parseArgs } from './args.js';

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface InitializedProjectView extends ProjectIdentity {
  readonly runtimeRoot: string;
}

export interface CliDependencies {
  inspect(): EnvironmentReport;
  initialize?(): InitializedProjectView;
  openMission?(goal: string): Mission;
  status?(): ProjectStatus;
  readonly debug?: boolean;
}

const USAGE = `Usage:
  mnfs doctor [--json]
  mnfs init [--json]
  mnfs mission open --goal <text> [--json]
  mnfs status [--json]
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
        stdout: args.json ? `${JSON.stringify(report)}\n` : formatDoctor(report),
        stderr: '',
      };
    }

    if (args.kind === 'init') {
      const project = (dependencies.initialize ?? (() => missingDependency('initialize')))();
      return {
        exitCode: 0,
        stdout: args.json
          ? `${JSON.stringify(project)}\n`
          : `Initialized MNFS for ${project.projectRoot}\nRuntime ${project.runtimeRoot}\n`,
        stderr: '',
      };
    }

    if (args.kind === 'mission-open') {
      const mission = (dependencies.openMission ?? (() => missingDependency('openMission')))(args.goal);
      return {
        exitCode: 0,
        stdout: args.json
          ? `${JSON.stringify(mission)}\n`
          : `Opened ${mission.id} — ${mission.goal}\n`,
        stderr: '',
      };
    }

    const status = (dependencies.status ?? (() => missingDependency('status')))();
    return {
      exitCode: 0,
      stdout: args.json ? `${JSON.stringify(status)}\n` : formatStatus(status),
      stderr: '',
    };
  } catch (error) {
    return errorResult(error, dependencies.debug === true);
  }
}
