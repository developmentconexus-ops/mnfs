import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

import * as runtimePaths from '../../src/runtime/paths.js';

interface TrustedLeaseActionEntryResolver {
  resolveTrustedLeaseActionEntry?: (moduleUrl: string) => string;
}

test('resolves the trusted LeaseAction entry relative to the compiled CLI module', () => {
  const cliModuleUrl = pathToFileURL(resolve('dist/src/cli/entry.js')).href;
  const expectedHelperPath = resolve('dist/src/runtime/lease-action-entry.js');
  const { resolveTrustedLeaseActionEntry } = runtimePaths as TrustedLeaseActionEntryResolver;

  assert.ok(resolveTrustedLeaseActionEntry, 'trusted LeaseAction entry resolver must be exported');
  assert.equal(resolveTrustedLeaseActionEntry(cliModuleUrl), expectedHelperPath);
});
