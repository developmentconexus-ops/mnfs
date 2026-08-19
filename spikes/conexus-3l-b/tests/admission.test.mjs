import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { verifyLock } from '../scripts/verify-lock.mjs';

const realLock = JSON.parse(
  fs.readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8')
);

test('lock verifier rejects a Q0-denied Mastra version', () => {
  const bad = {
    lockfileVersion: 3,
    packages: {
      '': {
        dependencies: {
          '@mastra/core': '1.56.0',
          '@mastra/memory': '1.25.0',
          '@mastra/pg': '1.19.0'
        }
      },
      'node_modules/@mastra/core': { version: '1.42.1' }
    }
  };

  assert.throws(() => verifyLock(bad), /Q0 deny-set/u);
});

test('lock verifier rejects direct pin drift', () => {
  const bad = structuredClone(realLock);
  bad.packages[''].dependencies['@mastra/core'] = '1.56.1';

  assert.throws(() => verifyLock(bad), /Direct pin drift/u);
});

test('lock verifier rejects Mastra prereleases', () => {
  const bad = structuredClone(realLock);
  bad.packages['node_modules/@mastra/core'].version = '1.56.0-rc.1';

  assert.throws(() => verifyLock(bad), /Mastra prerelease/u);
});

test('lock verifier admits the real Package-B lock', () => {
  assert.equal(verifyLock(realLock), true);
});
