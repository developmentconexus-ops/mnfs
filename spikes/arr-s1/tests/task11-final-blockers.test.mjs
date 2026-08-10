import assert from 'node:assert/strict';
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { createAcpFixtureCapabilities } from '../src/acp/fixture-capabilities.mjs';
import { createAcpStdioClient } from '../src/acp/client.mjs';
import { runPiRpcProcess, translatePiRpcFixtureCalls } from '../src/pi-rpc.mjs';
import { deriveTrustedAuthProof } from '../src/proof-driver.mjs';
import { startProcess } from '../src/process-runner.mjs';
import { persistCandidateRecoveryState } from '../src/recovery.mjs';

const HASH = (value) => `sha256:${'a'.repeat(64 - String(value).length)}${value}`;

describe('Task 11 final blocker regressions', () => {
  it('uses the frozen Pi RPC executable boundary and real JSONL mode', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'mnfs-arr-s1-pi-rpc-'));
    const executable = path.join(root, 'pi');
    const runtime = path.join(root, 'pi-runtime.mjs');
    await writeFile(runtime, `import { writeSync } from 'node:fs';
process.stdin.resume();
const emit = (message) => writeSync(1, JSON.stringify(message) + '\\n');
setTimeout(() => {
    emit({ type: 'response', id: 'mnfs-s1-prompt', command: 'prompt', success: true });
    emit({ type: 'tool_execution_start', toolCallId: 'read-1', toolName: 'read_nonce_file', args: { path: 'fixture/nonce.txt' } });
    emit({ type: 'tool_execution_end', toolCallId: 'read-1', toolName: 'read_nonce_file', result: { content: [{ type: 'text', text: 'nonce-value' }] } });
    emit({ type: 'tool_execution_start', toolCallId: 'write-1', toolName: 'edit_result_file', args: { path: 'result.txt', content: 'RESULT=nonce-value\\n' } });
    emit({ type: 'tool_execution_end', toolCallId: 'write-1', toolName: 'edit_result_file', result: { content: [{ type: 'text', text: 'edited' }] } });
    emit({ type: 'message_end', message: { role: 'assistant', provider: 'fixture-provider', model: 'fixture-model', stopReason: 'stop' } });
    emit({ type: 'agent_settled' });
}, 100);
`);
    await writeFile(executable, `#!/bin/sh
exec ${process.execPath} ${runtime} "$@"
`, { mode: 0o700 });
    await chmod(executable, 0o700);
    let revalidated = false;
    try {
      const attempt = await runPiRpcProcess({
        executable,
        cwd: root,
        env: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C', RPC_INPUT_LOG: path.join(root, 'rpc-input.log') },
        prompt: 'fixture prompt',
        beforeSpawn: async () => {
          revalidated = (await readFile(executable)).length > 0;
        },
      });
      assert.equal(revalidated, true);
      assert.deepEqual(attempt.processResult.argv, [
        executable, '--mode', 'rpc', '--tools', 'read,edit', '--no-extensions', '--no-skills',
        '--no-prompt-templates', '--no-themes', '--no-context-files',
      ]);
      assert.equal(attempt.settled.protocol, 'PI_RPC_JSONL');
      assert.equal(attempt.settled.responseAccepted, true);
      assert.deepEqual(translatePiRpcFixtureCalls(attempt.messages, {
        workspacePath: root,
        nonceRelativePath: 'fixture/nonce.txt',
        targetRelativePath: 'result.txt',
      }), [
        { id: 'read_nonce_file', path: 'fixture/nonce.txt', value: 'nonce-value' },
        { id: 'edit_result_file', path: 'result.txt', content: 'RESULT=nonce-value\n' },
      ]);
      assert.doesNotMatch(await readFile(new URL('../src/actor-run-child.mjs', import.meta.url), 'utf8'), /createRpcSession/u);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('reopens hash-bound MNFS run-state and Evidence in a fresh Node process', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'mnfs-arr-s1-recovery-'));
    const binding = {
      runId: 'run-recovery-regression',
      candidateShape: 'PI-SDK',
      runKey: HASH('b'),
      contractHash: HASH('c'),
      fixtureHash: HASH('d'),
      sourceTreeHash: HASH('e'),
    };
    try {
      const recovery = await persistCandidateRecoveryState({
        runRoot: root,
        binding,
        candidateShape: 'PI-SDK',
        observations: [{ protocol: 'PI-SDK', normalOutcome: 'NORMAL_EXIT' }],
        checkpoints: { cancellation: 'CANCELLED', processDeath: 'SIGNAL_DEATH' },
      });
      const child = new URL('../src/fresh-recovery-child.mjs', import.meta.url).pathname;
        const execution = startProcess({
        argv: [process.execPath, child, JSON.stringify({
          candidateShape: 'PI-SDK',
          runRoot: root,
          binding,
          fixture: { fixtureHash: binding.fixtureHash },
          recoveryRecords: recovery.records,
        })],
        cwd: root,
        env: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' },
        timeoutMs: 5000,
        terminationGraceMs: 100,
        stdoutLimitBytes: 64 * 1024,
        stderrLimitBytes: 64 * 1024,
      });
      const childResult = await execution.result;
      assert.equal(childResult.outcome, 'NORMAL_EXIT', childResult.stderr.toString('utf8'));
      const stdout = childResult.stdout.toString('utf8');
      assert.ok(stdout.trim(), `fresh recovery child produced no JSON: ${childResult.stderr.toString('utf8')}`);
      const result = JSON.parse(stdout);
      assert.equal(result.verified, true);
      assert.equal(result.stateReopened, true);
      assert.equal(result.evidenceHashesValid, true);
      assert.equal(result.bindingMatches, true);
      assert.equal(result.fixtureBindingMatches, true);
      assert.equal(result.runtimeSessionRequired, false);
      assert.equal(result.transcriptRequired, false);
      assert.equal(result.fixtureVerified, null);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not derive C05 from preflight auth readiness', () => {
    const proof = deriveTrustedAuthProof({
      preflight: {
        credentials: {
          status: 'READY',
          authMethodClass: 'local-double',
          providerClass: 'fixture',
        },
      },
      rawObservations: [],
    });

    assert.equal(proof.outcome, 'NOT_PROVEN');
  });

  it('derives C05 only from a completed trusted provider/model observation', () => {
    const success = deriveTrustedAuthProof({
      rawObservations: [{
        type: 'message_end',
        message: {
          role: 'assistant',
          provider: 'fixture-provider',
          model: 'fixture-model',
          stopReason: 'stop',
        },
      }],
    });
    const failure = deriveTrustedAuthProof({
      rawObservations: [{
        type: 'message_end',
        message: {
          role: 'assistant',
          provider: 'fixture-provider',
          model: 'fixture-model',
          stopReason: 'error',
        },
      }],
    });

    assert.equal(success.outcome, 'AUTHORIZED_OPERATION');
    assert.equal(failure.outcome, 'NOT_PROVEN');
  });

  it('translates ACP v1 filesystem requests into the shared logical fixture', async () => {
    const fixture = {
      workspacePath: '/tmp/mnfs-arr-s1-fixture',
      nonceRelativePath: 'fixture/nonce.txt',
      targetRelativePath: 'result.txt',
      nonce: 'nonce-value',
      expectedContent: 'result: nonce-value\n',
    };
    const capabilities = createAcpFixtureCapabilities(fixture, {
      readTextFile: async () => fixture.nonce,
      writeTextFile: async () => undefined,
    });

    await capabilities.handlers['fs/read_text_file']({
      sessionId: 'session-1',
      path: `${fixture.workspacePath}/${fixture.nonceRelativePath}`,
    });
    await capabilities.handlers['fs/write_text_file']({
      sessionId: 'session-1',
      path: `${fixture.workspacePath}/${fixture.targetRelativePath}`,
      content: fixture.expectedContent,
    });

    assert.deepEqual(capabilities.logicalToolCalls(), [
      { id: 'read_nonce_file', path: fixture.nonceRelativePath, value: fixture.nonce },
      { id: 'edit_result_file', path: fixture.targetRelativePath, content: fixture.expectedContent },
    ]);
    assert.equal(capabilities.clientCapabilities.fs.readTextFile, true);
    assert.equal(capabilities.clientCapabilities.fs.writeTextFile, true);
  });

  it('registers only real ACP v1 filesystem capabilities and never requires an invented fixture gate', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'mnfs-arr-s1-acp-'));
    const fixture = {
      workspacePath: root,
      nonceRelativePath: 'fixture/nonce.txt',
      targetRelativePath: 'result.txt',
      nonce: 'nonce-value',
      expectedTree: {},
    };
    const capabilities = createAcpFixtureCapabilities(fixture, {
      readTextFile: async () => 'NONCE=nonce-value\n',
      writeTextFile: async () => undefined,
    });
    const registered = new Map();
    const initializeCalls = [];
    const client = {
      onRequest(method, handler) {
        registered.set(method, handler);
        return this;
      },
      connectWith(_stream, operation) {
        return operation({
          async request(method, params) {
            initializeCalls.push({ method, params });
            return { protocolVersion: 1, agentCapabilities: {} };
          },
          buildSession() { throw new Error('session is not needed for capability registration'); },
          notify() {},
        });
      },
    };
    try {
      const common = await createAcpStdioClient({
        processSpec: {
          argv: [process.execPath, '-e', 'setInterval(() => {}, 1000)'],
          cwd: root,
          env: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' },
          timeoutMs: 5000,
          terminationGraceMs: 100,
          stdoutLimitBytes: 4096,
          stderrLimitBytes: 4096,
        },
        clientFactory: () => client,
        ndJsonStream: () => ({ writable: true, readable: true }),
        clientCapabilities: capabilities.clientCapabilities,
        clientRequestHandlers: capabilities.handlers,
      });
      await common.initialize();
      assert.deepEqual([...registered.keys()].sort(), ['fs/read_text_file', 'fs/write_text_file', 'session/request_permission']);
      assert.deepEqual(initializeCalls[0].params.clientCapabilities, capabilities.clientCapabilities);
      assert.equal('terminal' in initializeCalls[0].params.clientCapabilities, false);
      await common.shutdown();
      assert.doesNotMatch(await readFile(new URL('../src/executors.mjs', import.meta.url), 'utf8'), /supportsFixtureTools/u);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
