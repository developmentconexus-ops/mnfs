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
  | { readonly kind: 'help' }
  | { readonly kind: 'invalid'; readonly message: string };

function parseJsonOnly(argv: readonly string[], command: string): boolean | ParsedCommand {
  if (argv.length === 1) return false;
  if (argv.length === 2 && argv[1] === '--json') return true;
  return { kind: 'invalid', message: `${command} accepts only the optional --json flag.` };
}

function parseMissionOpen(argv: readonly string[]): ParsedCommand {
  let goal: string | undefined;
  let json = false;

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--json') {
      if (json) return { kind: 'invalid', message: 'mission open received duplicate --json.' };
      json = true;
      continue;
    }
    if (token === '--goal' && typeof argv[index + 1] === 'string') {
      if (goal !== undefined) return { kind: 'invalid', message: 'mission open received duplicate --goal.' };
      goal = argv[index + 1];
      index += 1;
      continue;
    }
    return { kind: 'invalid', message: `Unknown mission open argument: ${token ?? ''}` };
  }

  if (!goal?.trim()) {
    return { kind: 'invalid', message: 'mission open requires --goal <text>.' };
  }
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
      if (json) return { kind: 'invalid', message: `${command} received duplicate --json.` };
      json = true;
      continue;
    }
    if (token === undefined || !allowed.has(token)) {
      return { kind: 'invalid', message: `Unknown ${command} argument: ${token ?? ''}` };
    }
    if (values.has(token)) {
      return { kind: 'invalid', message: `${command} received duplicate ${token}.` };
    }

    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--') || value.trim().length === 0) {
      return { kind: 'invalid', message: `${command} requires a value for ${token}.` };
    }
    values.set(token, value.trim());
    index += 1;
  }

  return { values, json };
}

function requiredOption(options: NamedOptions, name: string, command: string): string | ParsedCommand {
  const value = options.values.get(name);
  return value ?? { kind: 'invalid', message: `${command} requires ${name} <value>.` };
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
    const options = parseNamedOptions(
      argv,
      2,
      command,
      new Set(['--mission', '--hash']),
    );
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

  return { kind: 'invalid', message: `Unknown plan command: ${operation ?? ''}` };
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

  return { kind: 'invalid', message: `Unknown command: ${argv.join(' ')}` };
}
