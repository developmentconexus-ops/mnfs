import assert from 'node:assert/strict';
import test from 'node:test';

import { runCli } from '../../src/cli/main.ts';
import type { EnvironmentReport } from '../../src/runtime/environment.ts';

const readyReport: EnvironmentReport = {
  schemaVersion: 1,
  ready: true,
  environment: 'wsl2',
  nodeVersion: '24.18.0',
  cwd: '/home/leandro/src/mnfs',
  tools: [
    { name: 'git', required: true, path: '/usr/bin/git' },
    { name: 'pi', required: true, path: '/usr/bin/pi' },
    { name: 'lavish-axi', required: false, path: null },
    { name: 'treehouse', required: false, path: null },
    { name: 'herdr', required: false, path: null },
  ],
  missingRequired: [],
  missingOptional: ['lavish-axi', 'treehouse', 'herdr'],
  problems: [],
};

test('doctor --json returns a stable machine-readable report', async () => {
  const result = await runCli(['doctor', '--json'], {
    inspect: () => readyReport,
  });

  assert.equal(result.exitCode, 0);
  assert.deepEqual(JSON.parse(result.stdout), readyReport);
  assert.equal(result.stderr, '');
});

test('doctor text output distinguishes required readiness from optional tools', async () => {
  const result = await runCli(['doctor'], {
    inspect: () => readyReport,
  });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /READY MNFS foundation environment/);
  assert.match(result.stdout, /WARN lavish-axi not found \(optional\)/);
  assert.match(result.stdout, /WARN treehouse not found \(optional\)/);
  assert.match(result.stdout, /WARN herdr not found \(optional\)/);
});

test('doctor exits non-zero when required readiness fails', async () => {
  const result = await runCli(['doctor', '--json'], {
    inspect: () => ({
      ...readyReport,
      ready: false,
      missingRequired: ['pi'],
      problems: [
        {
          code: 'REQUIRED_TOOL_MISSING',
          message: 'Required tool not found: pi',
          remediation: 'Install Pi inside WSL2 and rerun mnfs doctor.',
        },
      ],
    }),
  });

  assert.equal(result.exitCode, 1);
});

test('unknown commands return usage and exit code 2', async () => {
  const result = await runCli(['unknown'], {
    inspect: () => readyReport,
  });

  assert.equal(result.exitCode, 2);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /mnfs doctor \[--json\]/);
});
