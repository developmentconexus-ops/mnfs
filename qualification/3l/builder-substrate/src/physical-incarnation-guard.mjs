import { E2BSandbox } from '@mastra/e2b';

const DEAD_SANDBOX_MARKERS = [
  'sandbox was not found',
  'Sandbox is probably not running',
  'Sandbox not found',
  'sandbox has been killed',
];

function looksLikeDeadSandbox(error) {
  const text = String(error ?? '');
  return DEAD_SANDBOX_MARKERS.some(marker => text.includes(marker));
}

function observedPhysicalId(sandbox) {
  const sandboxId = sandbox?.e2b?.sandboxId;
  if (typeof sandboxId !== 'string' || sandboxId.length === 0) {
    throw new PhysicalIncarnationLostError('physical sandboxId is not observable');
  }
  return sandboxId;
}

export class PhysicalIncarnationLostError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'PhysicalIncarnationLostError';
  }
}

export class PhysicalIncarnationMismatchError extends Error {
  constructor({ expected, observed, stage }) {
    super(`physical sandbox incarnation mismatch at ${stage}: expected ${expected}, observed ${observed}`);
    this.name = 'PhysicalIncarnationMismatchError';
    this.expectedPhysicalId = expected;
    this.observedPhysicalId = observed;
    this.stage = stage;
  }
}

export class LineageQuarantinedError extends Error {
  constructor() {
    super('write-capable sandbox lineage is quarantined; a new owner admission/binding is required');
    this.name = 'LineageQuarantinedError';
  }
}

/**
 * Qualification-only narrow adapter variant.
 *
 * @mastra/e2b@0.7.0 normally catches a dead-sandbox error inside process spawn,
 * calls ensureRunning(), and transparently repeats the operation once. For a
 * Conexus write-capable ActorRun that hides a physical-incarnation transition.
 * This exact-pin subclass removes only that retry behavior; lifecycle/start,
 * process management, networking and the provider adapter otherwise remain the
 * upstream implementation.
 */
export class ConexusWriteE2BSandbox extends E2BSandbox {
  async retryOnDead(fn) {
    return fn();
  }
}

/**
 * Smallest qualification guard required by 3H-01 P7/P8/P9/P28/P29.
 *
 * The owner binds one observed physical sandboxId before write execution. Any
 * mismatch or dead-sandbox error quarantines the lineage. A quarantined guard
 * refuses every later write before touching the sandbox, so recovery must occur
 * through a new Conexus admission rather than a transparent runtime retry.
 */
export class PhysicalIncarnationGuard {
  constructor({ sandbox, expectedPhysicalId } = {}) {
    if (!sandbox) throw new TypeError('sandbox is required');
    this.sandbox = sandbox;
    this.expectedPhysicalId = expectedPhysicalId ?? null;
    this.boundPhysicalId = null;
    this.quarantined = false;
  }

  #quarantine() {
    this.quarantined = true;
  }

  #requireUsable() {
    if (this.quarantined) throw new LineageQuarantinedError();
  }

  #assertObserved(expected, stage) {
    const observed = observedPhysicalId(this.sandbox);
    if (observed !== expected) {
      this.#quarantine();
      throw new PhysicalIncarnationMismatchError({ expected, observed, stage });
    }
    return observed;
  }

  async bind() {
    this.#requireUsable();
    await this.sandbox.ensureRunning();
    const observed = observedPhysicalId(this.sandbox);

    if (this.expectedPhysicalId && observed !== this.expectedPhysicalId) {
      this.#quarantine();
      throw new PhysicalIncarnationMismatchError({
        expected: this.expectedPhysicalId,
        observed,
        stage: 'binding',
      });
    }

    this.boundPhysicalId = observed;
    return observed;
  }

  async spawnWrite(command, options = {}) {
    this.#requireUsable();
    if (!this.boundPhysicalId) await this.bind();

    const expected = this.boundPhysicalId;
    this.#assertObserved(expected, 'pre-write');

    let result;
    try {
      const handle = await this.sandbox.processes.spawn(command, options);
      result = await handle.wait();
    } catch (error) {
      if (looksLikeDeadSandbox(error)) {
        this.#quarantine();
        throw new PhysicalIncarnationLostError(
          `physical sandbox ${expected} was lost during a write-capable operation`,
          { cause: error },
        );
      }
      throw error;
    }

    this.#assertObserved(expected, 'post-write');
    return { result, physicalSandboxId: expected };
  }
}
