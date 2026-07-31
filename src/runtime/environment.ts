export type EnvironmentKind = 'wsl2' | 'linux' | 'windows' | 'unknown';

export type EnvironmentProblemCode =
  | 'WSL2_REQUIRED'
  | 'LINUX_FILESYSTEM_REQUIRED'
  | 'NODE_VERSION_UNSUPPORTED'
  | 'REQUIRED_TOOL_MISSING';

export interface EnvironmentProblem {
  code: EnvironmentProblemCode;
  message: string;
  remediation: string;
}

export interface EnvironmentProbeInput {
  platform: NodeJS.Platform;
  release: string;
  nodeVersion: string;
  cwd: string;
  which(name: string): string | null;
}

export interface ToolStatus {
  name: string;
  required: boolean;
  path: string | null;
}

export interface EnvironmentReport {
  schemaVersion: 1;
  ready: boolean;
  environment: EnvironmentKind;
  nodeVersion: string;
  cwd: string;
  tools: ToolStatus[];
  missingRequired: string[];
  missingOptional: string[];
  problems: EnvironmentProblem[];
}

const MINIMUM_NODE_VERSION = '24.18.0';
const REQUIRED_TOOLS = ['git', 'pi'] as const;
const OPTIONAL_TOOLS = ['lavish-axi', 'treehouse', 'herdr'] as const;

function detectEnvironment(platform: NodeJS.Platform, release: string): EnvironmentKind {
  if (platform === 'linux' && /microsoft|wsl/i.test(release)) return 'wsl2';
  if (platform === 'linux') return 'linux';
  if (platform === 'win32') return 'windows';
  return 'unknown';
}

function normalizeVersion(version: string): [number, number, number] | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isVersionAtLeast(actual: string, minimum: string): boolean {
  const actualParts = normalizeVersion(actual);
  const minimumParts = normalizeVersion(minimum);
  if (!actualParts || !minimumParts) return false;

  for (let index = 0; index < 3; index += 1) {
    const actualPart = actualParts[index] ?? 0;
    const minimumPart = minimumParts[index] ?? 0;
    if (actualPart > minimumPart) return true;
    if (actualPart < minimumPart) return false;
  }
  return true;
}

function normalizedVersion(version: string): string {
  return version.trim().replace(/^v/, '');
}

function isWindowsMountedPath(cwd: string): boolean {
  return /^\/mnt\/[a-z](?:\/|$)/i.test(cwd.replaceAll('\\', '/'));
}

export function inspectEnvironment(input: EnvironmentProbeInput): EnvironmentReport {
  const environment = detectEnvironment(input.platform, input.release);
  const nodeSupported = isVersionAtLeast(input.nodeVersion, MINIMUM_NODE_VERSION);
  const tools: ToolStatus[] = [
    ...REQUIRED_TOOLS.map((name) => ({ name, required: true, path: input.which(name) })),
    ...OPTIONAL_TOOLS.map((name) => ({ name, required: false, path: input.which(name) })),
  ];
  const missingRequired = tools
    .filter((tool) => tool.required && tool.path === null)
    .map((tool) => tool.name);
  const missingOptional = tools
    .filter((tool) => !tool.required && tool.path === null)
    .map((tool) => tool.name);
  const problems: EnvironmentProblem[] = [];

  if (environment !== 'wsl2') {
    problems.push({
      code: 'WSL2_REQUIRED',
      message: 'MNFS must run inside Ubuntu on WSL2.',
      remediation: 'Open Ubuntu in WSL2 and run this repository from its Linux filesystem.',
    });
  }
  if (isWindowsMountedPath(input.cwd)) {
    problems.push({
      code: 'LINUX_FILESYSTEM_REQUIRED',
      message: `Repository is under a Windows-mounted path: ${input.cwd}`,
      remediation: 'Move the repository under /home/<user>/src and rerun mnfs doctor.',
    });
  }
  if (!nodeSupported) {
    problems.push({
      code: 'NODE_VERSION_UNSUPPORTED',
      message: `Node ${normalizedVersion(input.nodeVersion)} is below the supported floor ${MINIMUM_NODE_VERSION}.`,
      remediation: `Install Node ${MINIMUM_NODE_VERSION} or newer inside WSL2.`,
    });
  }
  for (const name of missingRequired) {
    problems.push({
      code: 'REQUIRED_TOOL_MISSING',
      message: `Required tool not found: ${name}`,
      remediation: name === 'pi'
        ? 'Install Pi inside WSL2 and rerun mnfs doctor.'
        : `Install ${name} inside WSL2 and rerun mnfs doctor.`,
    });
  }

  return {
    schemaVersion: 1,
    ready: problems.length === 0,
    environment,
    nodeVersion: normalizedVersion(input.nodeVersion),
    cwd: input.cwd,
    tools,
    missingRequired,
    missingOptional,
    problems,
  };
}
