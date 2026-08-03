import { dirname } from 'node:path';

import { createFixture } from './fixture.mjs';
import { createRuntimeOperations as createBaseRuntimeOperations } from './orchestrator-runtime.mjs';
import { createRunStore } from './run-state.mjs';
import {
  acquireTreehouseLease,
  releaseTreehouseLease,
} from './treehouse.mjs';

export * from './orchestrator-runtime.mjs';

function cleanObject(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitizeFixture(fixture) {
  const { marker: _marker, ...rest } = fixture;
  return cleanObject(rest);
}

export function createRuntimeOperations(options = {}) {
  const now = options.now ?? (() => new Date().toISOString());
  const fixtureFactory = options.createFixture ?? createFixture;
  const leaseAcquire = options.acquireTreehouseLease ?? acquireTreehouseLease;
  const leaseRelease = options.releaseTreehouseLease ?? releaseTreehouseLease;
  let operations;

  async function updateLatest(updater) {
    const current = await operations.latest();
    const runStore = await createRunStore(dirname(current.artifactRoot));
    return runStore.update(current.runId, updater);
  }

  operations = createBaseRuntimeOperations({
    ...options,
    createFixture: async (input) => {
      const fixture = await fixtureFactory(input);
      const persistedFixture = sanitizeFixture(fixture);
      await updateLatest((current) => ({
        ...current,
        updatedAt: now(),
        lease: {
          acquired: false,
          fixture: persistedFixture,
        },
      }));
      return fixture;
    },
    acquireTreehouseLease: async (input) => {
      const lease = await leaseAcquire(input);
      await updateLatest((current) => ({
        ...current,
        updatedAt: now(),
        lease: {
          ...cleanObject(lease),
          acquired: true,
          fixture: current.lease?.fixture,
        },
      }));
      return lease;
    },
    releaseTreehouseLease: async (input) => {
      if (input.lease?.acquired !== true) {
        return {
          released: false,
          status: 'NOT_ACQUIRED',
        };
      }
      return leaseRelease(input);
    },
  });

  return Object.freeze({
    ...operations,
    async phaseOne(input) {
      const result = await operations.phaseOne(input);
      await updateLatest((current) => ({
        ...current,
        updatedAt: now(),
        lease: {
          ...current.lease,
          acquired: true,
        },
      }));
      return result;
    },
  });
}
