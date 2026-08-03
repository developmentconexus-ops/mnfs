import { as02Error, assertAs02 } from './errors.mjs';

export function quotePosixArg(value) {
  assertAs02(typeof value === 'string', 'INVALID_COMMAND_ARGV', 'Command arguments must be strings.', {
    type: typeof value,
  });
  assertAs02(!value.includes('\0'), 'INVALID_COMMAND_ARGV', 'Command arguments cannot contain NUL bytes.');
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

export function commandFromArgv(argv) {
  if (!Array.isArray(argv) || argv.length === 0) {
    throw as02Error('INVALID_COMMAND_ARGV', 'Command argv must be a non-empty array.');
  }
  return argv.map(quotePosixArg).join(' ');
}
