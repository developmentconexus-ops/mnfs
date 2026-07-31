export type MnfsErrorCode =
  | 'INVALID_ARGUMENTS'
  | 'WSL2_REQUIRED'
  | 'LINUX_FILESYSTEM_REQUIRED'
  | 'NODE_VERSION_UNSUPPORTED'
  | 'REQUIRED_TOOL_MISSING'
  | 'NOT_GIT_REPOSITORY'
  | 'PROJECT_IDENTITY_INVALID'
  | 'PROJECT_NOT_INITIALIZED'
  | 'PROJECT_INITIALIZATION_FAILED'
  | 'RUNTIME_HOME_INVALID'
  | 'PLAN_INVALID'
  | 'INTERNAL_ERROR';

export class MnfsError extends Error {
  readonly code: MnfsErrorCode;
  readonly exitCode: number;
  readonly remediation: string | undefined;

  constructor(
    code: MnfsErrorCode,
    message: string,
    options: { readonly exitCode?: number; readonly remediation?: string } = {},
  ) {
    super(message);
    this.name = 'MnfsError';
    this.code = code;
    this.exitCode = options.exitCode ?? 1;
    this.remediation = options.remediation;
  }
}
