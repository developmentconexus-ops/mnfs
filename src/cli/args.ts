export type ParsedCommand =
  | { readonly kind: 'doctor'; readonly json: boolean }
  | { readonly kind: 'init'; readonly json: boolean }
  | { readonly kind: 'mission-open'; readonly goal: string; readonly json: boolean }
  | { readonly kind: 'status'; readonly json: boolean }
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
      json = true;
      continue;
    }
    if (token === '--goal' && typeof argv[index + 1] === 'string') {
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

  return { kind: 'invalid', message: `Unknown command: ${argv.join(' ')}` };
}
