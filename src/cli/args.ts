export type ParsedCommand =
  | { readonly kind: 'doctor'; readonly json: boolean }
  | { readonly kind: 'init'; readonly json: boolean }
  | { readonly kind: 'mission-open'; readonly goal: string; readonly json: boolean }
  | { readonly kind: 'status'; readonly json: boolean }
  | {
      readonly kind: 'plan-save';
      readonly missionId: string;
      readonly inputPath: string;
      readonly expectedPreviousHash?: string;
      readonly json: boolean;
    }
  | { readonly kind: 'plan-show'; readonly missionId: string; readonly json: boolean }
  | { readonly kind: 'plan-render'; readonly missionId: string; readonly json: boolean }
  | { readonly kind: 'plan-open'; readonly missionId: string; readonly json: boolean }
  | { readonly kind: 'plan-poll'; readonly missionId: string; readonly json: boolean }
  | {
      readonly kind: 'plan-approve';
      readonly missionId: string;
      readonly contentHash: string;
      readonly json: boolean;
    }
  | { readonly kind: 'plan-materialize'; readonly missionId: string; readonly json: boolean }
  | {
      readonly kind: 'track-open';
      readonly missionId: string;
      readonly milestoneId: string;
      readonly featureId: string;
      readonly contractHash: string;
      readonly baseCommitSha: string;
      readonly idempotencyKey: string;
      readonly json: boolean;
    }
  | { readonly kind: 'track-show'; readonly trackId: string; readonly json: boolean }
  | {
      readonly kind: 'track-abandon';
      readonly trackId: string;
      readonly expectedVersion: number;
      readonly json: boolean;
    }
  | {
      readonly kind: 'lease-grant';
      readonly trackId: string;
      readonly expectedVersion: number;
      readonly idempotencyKey: string;
      readonly json: boolean;
    }
  | { readonly kind: 'lease-show'; readonly leaseId: string; readonly json: boolean }
  | {
      readonly kind: 'lease-release';
      readonly leaseId: string;
      readonly expectedVersion: number;
      readonly idempotencyKey: string;
      readonly json: boolean;
    }
  | { readonly kind: 'recover'; readonly trackId?: string; readonly json: boolean }
  | { readonly kind: 'help' }
  | { readonly kind: 'invalid'; readonly message: string };

const M01_MISSION_ID = 'MIS-002';
const M01_MILESTONE_ID = 'M01';
const FEATURE_ID_PATTERN = /^F\d{2,}$/;
const CONTRACT_HASH_PATTERN = /^sha256:[0-9a-f]{64}$/;
const GIT_OBJECT_ID_PATTERN = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const WRITE_TRACK_ID_PATTERN = /^WT-\d{3,}$/;
const LEASE_ID_PATTERN = /^LSE-\d{3,}$/;
const IDEMPOTENCY_KEY_PATTERN = /^[!-~]{1,256}$/;

function invalid(message: string): ParsedCommand {
  return { kind: 'invalid', message };
}

function parseJsonOnly(argv: readonly string[], command: string): boolean | ParsedCommand {
  if (argv.length === 1) return false;
  if (argv.length === 2 && argv[1] === '--json') return true;
  return invalid(`${command} accepts only the optional --json flag.`);
}

function parseMissionOpen(argv: readonly string[]): ParsedCommand {
  let goal: string | undefined;
  let json = false;

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--json') {
      if (json) return invalid('mission open received duplicate --json.');
      json = true;
      continue;
    }
    if (token === '--goal' && typeof argv[index + 1] === 'string') {
      if (goal !== undefined) return invalid('mission open received duplicate --goal.');
      goal = argv[index + 1];
      index += 1;
      continue;
    }
    return invalid(`Unknown mission open argument: ${token ?? ''}`);
  }

  if (!goal?.trim()) return invalid('mission open requires --goal <text>.');
  return { kind: 'mission-open', goal: goal.trim(), json };
}

interface NamedOptions {
  readonly values: ReadonlyMap<string, string>;
  readonly json: boolean;
}

function parseNamedOptions(
  argv: readonly string[],
  start: number,
  command: string,
  allowed: ReadonlySet<string>,
): NamedOptions | ParsedCommand {
  const values = new Map<string, string>();
  let json = false;

  for (let index = start; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--json') {
      if (json) return invalid(`${command} received duplicate --json.`);
      json = true;
      continue;
    }
    if (token === undefined || !allowed.has(token)) {
      return invalid(`Unknown ${command} argument: ${token ?? ''}`);
    }
    if (values.has(token)) return invalid(`${command} received duplicate ${token}.`);

    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--') || value.trim().length === 0) {
      return invalid(`${command} requires a value for ${token}.`);
    }
    values.set(token, value.trim());
    index += 1;
  }

  return { values, json };
}

function requiredOption(options: NamedOptions, name: string, command: string): string | ParsedCommand {
  const value = options.values.get(name);
  return value ?? invalid(`${command} requires ${name} <value>.`);
}

function requirePattern(
  value: string,
  pattern: RegExp,
  label: string,
  command: string,
): string | ParsedCommand {
  return pattern.test(value) ? value : invalid(`${command} received malformed ${label}: ${value}.`);
}

function requirePositiveInteger(value: string, label: string, command: string): number | ParsedCommand {
  if (!/^\d+$/.test(value)) return invalid(`${command} requires a positive integer for ${label}.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return invalid(`${command} requires a positive integer for ${label}.`);
  }
  return parsed;
}

function requireIdempotencyKey(value: string, command: string): string | ParsedCommand {
  return requirePattern(value, IDEMPOTENCY_KEY_PATTERN, 'idempotency key', command);
}

function parsePlan(argv: readonly string[]): ParsedCommand {
  const operation = argv[1];
  const command = `plan ${operation ?? ''}`.trim();

  if (operation === 'save') {
    const options = parseNamedOptions(
      argv,
      2,
      command,
      new Set(['--mission', '--input', '--expected-hash']),
    );
    if ('kind' in options) return options;
    const missionId = requiredOption(options, '--mission', command);
    if (typeof missionId !== 'string') return missionId;
    const inputPath = requiredOption(options, '--input', command);
    if (typeof inputPath !== 'string') return inputPath;
    const expectedPreviousHash = options.values.get('--expected-hash');
    return {
      kind: 'plan-save',
      missionId,
      inputPath,
      ...(expectedPreviousHash === undefined ? {} : { expectedPreviousHash }),
      json: options.json,
    };
  }

  if (operation === 'approve') {
    const options = parseNamedOptions(argv, 2, command, new Set(['--mission', '--hash']));
    if ('kind' in options) return options;
    const missionId = requiredOption(options, '--mission', command);
    if (typeof missionId !== 'string') return missionId;
    const contentHash = requiredOption(options, '--hash', command);
    if (typeof contentHash !== 'string') return contentHash;
    return { kind: 'plan-approve', missionId, contentHash, json: options.json };
  }

  const simpleKinds = {
    show: 'plan-show',
    render: 'plan-render',
    open: 'plan-open',
    poll: 'plan-poll',
    materialize: 'plan-materialize',
  } as const;
  if (operation !== undefined && operation in simpleKinds) {
    const simpleOperation = operation as keyof typeof simpleKinds;
    const options = parseNamedOptions(argv, 2, command, new Set(['--mission']));
    if ('kind' in options) return options;
    const missionId = requiredOption(options, '--mission', command);
    if (typeof missionId !== 'string') return missionId;
    return { kind: simpleKinds[simpleOperation], missionId, json: options.json };
  }

  return invalid(`Unknown plan command: ${operation ?? ''}`);
}

function parseTrack(argv: readonly string[]): ParsedCommand {
  const operation = argv[1];
  const command = `track ${operation ?? ''}`.trim();

  if (operation === 'open') {
    const options = parseNamedOptions(
      argv,
      2,
      command,
      new Set([
        '--mission',
        '--milestone',
        '--feature',
        '--contract',
        '--base',
        '--idempotency-key',
      ]),
    );
    if ('kind' in options) return options;

    const missionId = requiredOption(options, '--mission', command);
    if (typeof missionId !== 'string') return missionId;
    if (missionId !== M01_MISSION_ID) return invalid(`${command} supports only ${M01_MISSION_ID}.`);

    const milestoneId = requiredOption(options, '--milestone', command);
    if (typeof milestoneId !== 'string') return milestoneId;
    if (milestoneId !== M01_MILESTONE_ID) return invalid(`${command} supports only ${M01_MILESTONE_ID}.`);

    const featureValue = requiredOption(options, '--feature', command);
    if (typeof featureValue !== 'string') return featureValue;
    const featureId = requirePattern(featureValue, FEATURE_ID_PATTERN, 'Feature id', command);
    if (typeof featureId !== 'string') return featureId;

    const contractValue = requiredOption(options, '--contract', command);
    if (typeof contractValue !== 'string') return contractValue;
    const contractHash = requirePattern(contractValue, CONTRACT_HASH_PATTERN, 'contract hash', command);
    if (typeof contractHash !== 'string') return contractHash;

    const baseValue = requiredOption(options, '--base', command);
    if (typeof baseValue !== 'string') return baseValue;
    const baseCommitSha = requirePattern(baseValue, GIT_OBJECT_ID_PATTERN, 'Git object id', command);
    if (typeof baseCommitSha !== 'string') return baseCommitSha;

    const keyValue = requiredOption(options, '--idempotency-key', command);
    if (typeof keyValue !== 'string') return keyValue;
    const idempotencyKey = requireIdempotencyKey(keyValue, command);
    if (typeof idempotencyKey !== 'string') return idempotencyKey;

    return {
      kind: 'track-open',
      missionId,
      milestoneId,
      featureId,
      contractHash,
      baseCommitSha,
      idempotencyKey,
      json: options.json,
    };
  }

  if (operation === 'show') {
    const options = parseNamedOptions(argv, 2, command, new Set(['--track']));
    if ('kind' in options) return options;
    const value = requiredOption(options, '--track', command);
    if (typeof value !== 'string') return value;
    const trackId = requirePattern(value, WRITE_TRACK_ID_PATTERN, 'Write Track id', command);
    return typeof trackId === 'string'
      ? { kind: 'track-show', trackId, json: options.json }
      : trackId;
  }

  if (operation === 'abandon') {
    const options = parseNamedOptions(
      argv,
      2,
      command,
      new Set(['--track', '--expected-version']),
    );
    if ('kind' in options) return options;
    const trackValue = requiredOption(options, '--track', command);
    if (typeof trackValue !== 'string') return trackValue;
    const trackId = requirePattern(trackValue, WRITE_TRACK_ID_PATTERN, 'Write Track id', command);
    if (typeof trackId !== 'string') return trackId;
    const versionValue = requiredOption(options, '--expected-version', command);
    if (typeof versionValue !== 'string') return versionValue;
    const expectedVersion = requirePositiveInteger(versionValue, '--expected-version', command);
    return typeof expectedVersion === 'number'
      ? { kind: 'track-abandon', trackId, expectedVersion, json: options.json }
      : expectedVersion;
  }

  return invalid(`Unknown track command: ${operation ?? ''}`);
}

function parseLease(argv: readonly string[]): ParsedCommand {
  const operation = argv[1];
  const command = `lease ${operation ?? ''}`.trim();

  if (operation === 'grant') {
    const options = parseNamedOptions(
      argv,
      2,
      command,
      new Set(['--track', '--expected-version', '--idempotency-key']),
    );
    if ('kind' in options) return options;
    const trackValue = requiredOption(options, '--track', command);
    if (typeof trackValue !== 'string') return trackValue;
    const trackId = requirePattern(trackValue, WRITE_TRACK_ID_PATTERN, 'Write Track id', command);
    if (typeof trackId !== 'string') return trackId;
    const versionValue = requiredOption(options, '--expected-version', command);
    if (typeof versionValue !== 'string') return versionValue;
    const expectedVersion = requirePositiveInteger(versionValue, '--expected-version', command);
    if (typeof expectedVersion !== 'number') return expectedVersion;
    const keyValue = requiredOption(options, '--idempotency-key', command);
    if (typeof keyValue !== 'string') return keyValue;
    const idempotencyKey = requireIdempotencyKey(keyValue, command);
    return typeof idempotencyKey === 'string'
      ? {
          kind: 'lease-grant',
          trackId,
          expectedVersion,
          idempotencyKey,
          json: options.json,
        }
      : idempotencyKey;
  }

  if (operation === 'show') {
    const options = parseNamedOptions(argv, 2, command, new Set(['--lease']));
    if ('kind' in options) return options;
    const value = requiredOption(options, '--lease', command);
    if (typeof value !== 'string') return value;
    const leaseId = requirePattern(value, LEASE_ID_PATTERN, 'Lease id', command);
    return typeof leaseId === 'string'
      ? { kind: 'lease-show', leaseId, json: options.json }
      : leaseId;
  }

  if (operation === 'release') {
    const options = parseNamedOptions(
      argv,
      2,
      command,
      new Set(['--lease', '--expected-version', '--idempotency-key']),
    );
    if ('kind' in options) return options;
    const leaseValue = requiredOption(options, '--lease', command);
    if (typeof leaseValue !== 'string') return leaseValue;
    const leaseId = requirePattern(leaseValue, LEASE_ID_PATTERN, 'Lease id', command);
    if (typeof leaseId !== 'string') return leaseId;
    const versionValue = requiredOption(options, '--expected-version', command);
    if (typeof versionValue !== 'string') return versionValue;
    const expectedVersion = requirePositiveInteger(versionValue, '--expected-version', command);
    if (typeof expectedVersion !== 'number') return expectedVersion;
    const keyValue = requiredOption(options, '--idempotency-key', command);
    if (typeof keyValue !== 'string') return keyValue;
    const idempotencyKey = requireIdempotencyKey(keyValue, command);
    return typeof idempotencyKey === 'string'
      ? {
          kind: 'lease-release',
          leaseId,
          expectedVersion,
          idempotencyKey,
          json: options.json,
        }
      : idempotencyKey;
  }

  return invalid(`Unknown lease command: ${operation ?? ''}`);
}

function parseRecover(argv: readonly string[]): ParsedCommand {
  const options = parseNamedOptions(argv, 1, 'recover', new Set(['--track']));
  if ('kind' in options) return options;
  const value = options.values.get('--track');
  if (value === undefined) return { kind: 'recover', json: options.json };
  const trackId = requirePattern(value, WRITE_TRACK_ID_PATTERN, 'Write Track id', 'recover');
  return typeof trackId === 'string'
    ? { kind: 'recover', trackId, json: options.json }
    : trackId;
}

export function parseArgs(argv: readonly string[]): ParsedCommand {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') return { kind: 'help' };

  if (argv[0] === 'doctor') {
    const json = parseJsonOnly(argv, 'doctor');
    return typeof json === 'boolean' ? { kind: 'doctor', json } : json;
  }
  if (argv[0] === 'init') {
    const json = parseJsonOnly(argv, 'init');
    return typeof json === 'boolean' ? { kind: 'init', json } : json;
  }
  if (argv[0] === 'status') {
    const json = parseJsonOnly(argv, 'status');
    return typeof json === 'boolean' ? { kind: 'status', json } : json;
  }
  if (argv[0] === 'mission' && argv[1] === 'open') return parseMissionOpen(argv);
  if (argv[0] === 'plan') return parsePlan(argv);
  if (argv[0] === 'track') return parseTrack(argv);
  if (argv[0] === 'lease') return parseLease(argv);
  if (argv[0] === 'recover') return parseRecover(argv);

  return invalid(`Unknown command: ${argv.join(' ')}`);
}
