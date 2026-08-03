import { isAbsolute } from 'node:path';
import { realpathSync } from 'node:fs';

import { as02Error } from './errors.mjs';

export const PI_BUILTIN_TOOL_NAMES = Object.freeze(['bash', 'read', 'write', 'edit', 'grep', 'find', 'ls']);
export const BROKERED_TOOL_NAMES = Object.freeze(['bash', 'read', 'write', 'edit', 'grep', 'find', 'ls']);
export const PI_ANTHROPIC_AUTH_VERSION = '2.0.1';
export const PI_ANTHROPIC_AUTH_SOURCE = `npm:@gotgenes/pi-anthropic-auth@${PI_ANTHROPIC_AUTH_VERSION}`;

export function bashOnlyInventory() {
  return [...PI_BUILTIN_TOOL_NAMES];
}

export function brokeredCandidateInventory() {
  return [...BROKERED_TOOL_NAMES];
}

export function brokeredCandidateArgs(extensionPath) {
  if (typeof extensionPath !== 'string' || !isAbsolute(extensionPath)) {
    throw as02Error('PI_EXTENSION_PATH_INVALID', 'Pi extension path must be absolute.', { extensionPath });
  }
  let exact;
  try {
    exact = realpathSync.native(extensionPath);
  } catch (cause) {
    throw as02Error('PI_EXTENSION_PATH_INVALID', 'Pi extension path must exist.', {
      extensionPath,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
  if (exact === '/mnt' || exact.startsWith('/mnt/')) {
    throw as02Error('PI_EXTENSION_PATH_INVALID', 'Pi extension must live on the Linux filesystem.', { exact });
  }
  return [
    '--no-builtin-tools',
    '--no-extensions',
    '-e',
    PI_ANTHROPIC_AUTH_SOURCE,
    '-e',
    exact,
  ];
}
