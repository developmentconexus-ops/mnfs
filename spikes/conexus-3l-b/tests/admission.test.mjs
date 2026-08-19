import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { verifyLock } from '../scripts/verify-lock.mjs';
import { validateAdmission } from '../scripts/validate-admission.mjs';

const realLock = JSON.parse(
  fs.readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8')
);
const realAdmission = JSON.parse(
  fs.readFileSync(new URL('../admission/criteria.json', import.meta.url), 'utf8')
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

test('lock verifier rejects resolved direct pin drift while root declarations remain exact', () => {
  const drifts = [
    ['@mastra/core', '1.56.1'],
    ['@mastra/memory', '1.25.1'],
    ['@mastra/pg', '1.19.1']
  ];

  for (const [name, driftedVersion] of drifts) {
    const bad = structuredClone(realLock);
    bad.packages[`node_modules/${name}`].version = driftedVersion;

    assert.equal(bad.packages[''].dependencies[name], realLock.packages[''].dependencies[name]);
    assert.throws(
      () => verifyLock(bad),
      new RegExp(`Resolved direct pin drift: ${name.replace('/', '\\/')}`, 'u')
    );
  }
});

test('lock verifier rejects Mastra prereleases', () => {
  const bad = structuredClone(realLock);
  bad.packages['node_modules/@mastra/core'].version = '1.56.0-rc.1';

  assert.throws(() => verifyLock(bad), /Mastra prerelease/u);
});

test('lock verifier admits the real Package-B lock', () => {
  assert.equal(verifyLock(realLock), true);
});

test('admission verifier rejects a superseded mechanism', () => {
  const bad = structuredClone(realAdmission);
  bad.criteria[0].currentMechanism = 'Mastra Stored Agent latest';

  assert.throws(() => validateAdmission(bad), /superseded mechanism/u);
});

test('admission verifier rejects literal pre-C-018 B1-B4 execution', () => {
  const bad = structuredClone(realAdmission);
  bad.executionRouting = { literalB1B4PreC018: true };

  assert.throws(
    () => validateAdmission(bad),
    /literal B1-B4 pre-C-018 execution is superseded/u
  );
});

test('admission verifier rejects a missing or extra technology probe', () => {
  const mutations = [
    {
      label: 'missing BT-3',
      mutate(probes) {
        return probes.filter((probe) => probe !== 'BT-3');
      }
    },
    {
      label: 'extra BT-6',
      mutate(probes) {
        return [...probes, 'BT-6'];
      }
    }
  ];

  for (const { label, mutate } of mutations) {
    const bad = structuredClone(realAdmission);
    bad.executionRouting.currentTechnologyProbes = mutate(
      bad.executionRouting.currentTechnologyProbes
    );

    assert.throws(
      () => validateAdmission(bad),
      /current technology probes must be exactly BT-1\.\.BT-5 in order/u,
      label
    );
  }
});

test('admission verifier rejects a missing or drifted criterion', () => {
  const bad = structuredClone(realAdmission);
  bad.criteria.find(({ id }) => id === 'B2-07').id = 'B2-99';

  assert.throws(() => validateAdmission(bad), /missing\/drifted criterion B2-07/u);
});

test('admission verifier rejects missing required semantic-home anchors', () => {
  const requiredAnchors = [
    ['B2-07', '3G-06'],
    ['B2-08', '3G-06'],
    ['B2-09', '3G-06'],
    ['B3-08', '3G-05'],
    ['B3-09', '3H-02'],
    ['B3-12', '3H-02'],
    ['B3-12', '3A-R9']
  ];

  for (const [id, anchor] of requiredAnchors) {
    const bad = structuredClone(realAdmission);
    const criterion = bad.criteria.find((entry) => entry.id === id);
    criterion.authority = criterion.authority.filter((entry) => entry !== anchor);

    assert.throws(
      () => validateAdmission(bad),
      new RegExp(`${id} missing required authority anchor ${anchor}`, 'u')
    );
  }
});

test('admission verifier rejects forbidden semantic-home anchors', () => {
  const forbiddenAnchors = [
    ['B2-08', '3G-05'],
    ['B2-09', '3G-05'],
    ['B3-08', '3G-06'],
    ['B3-09', '3G-06'],
    ['B3-12', '3H-03']
  ];

  for (const [id, anchor] of forbiddenAnchors) {
    const bad = structuredClone(realAdmission);
    const criterion = bad.criteria.find((entry) => entry.id === id);
    if (!criterion.authority.includes(anchor)) criterion.authority.push(anchor);

    assert.throws(
      () => validateAdmission(bad),
      new RegExp(`${id} forbidden authority anchor ${anchor}`, 'u')
    );
  }
});

test('admission verifier admits the current complete criterion compilation', () => {
  assert.equal(validateAdmission(realAdmission), true);
});
