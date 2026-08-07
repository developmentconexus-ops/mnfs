import {
  TC01_SCENARIO_IDS,
  runTc01Scenarios as runTc01ScenarioCore,
} from './scenario-runner-core.mjs';

export { TC01_SCENARIO_IDS };

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function replaceObject(target, source) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, source);
}

export async function runTc01Scenarios(input) {
  const originalSnapshotPrivateState = input?.observers?.snapshotPrivateState;
  const originalObserveStatus = input?.client?.observeStatus;
  if (typeof originalSnapshotPrivateState !== 'function' || typeof originalObserveStatus !== 'function') {
    return runTc01ScenarioCore(input);
  }

  let mutablePrivateBaseline = null;
  let initialPrivateSnapshotObserved = false;

  const observers = {
    ...input.observers,
    async snapshotPrivateState(spec) {
      const label = initialPrivateSnapshotObserved
        ? 'S13-private-after-status'
        : spec?.label;
      const snapshot = await originalSnapshotPrivateState({ ...spec, label });
      if (!initialPrivateSnapshotObserved) {
        initialPrivateSnapshotObserved = true;
        mutablePrivateBaseline = isPlainObject(snapshot) ? snapshot : null;
      }
      return snapshot;
    },
  };

  const client = {
    ...input.client,
    async observeStatus(...args) {
      if (mutablePrivateBaseline !== null) {
        const immediateBefore = await originalSnapshotPrivateState({
          fixture: input.fixture,
          label: 'S13-private-before-status',
        });
        if (isPlainObject(immediateBefore)) replaceObject(mutablePrivateBaseline, immediateBefore);
      }
      return originalObserveStatus(...args);
    },
  };

  return runTc01ScenarioCore({
    ...input,
    observers,
    client,
  });
}
