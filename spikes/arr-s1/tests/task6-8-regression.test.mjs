import assert from 'node:assert/strict';
import test from 'node:test';

import { createPiAcpAdapter } from '../src/adapters/pi-acp.mjs';
import { evaluateApplicability } from '../src/applicability.mjs';

const ENTRYPOINT = '/state/candidates/pi-acp/bin/pi-acp';
const CWD = '/tmp/mnfs-arr-s1-fixture';

test('Pi-ACP requires an exact absolute PI_ACP_PI_COMMAND instead of ambient PATH resolution', () => {
  assert.throws(
    () => createPiAcpAdapter({
      executable: ENTRYPOINT,
      cwd: CWD,
      env: { PATH: '/usr/bin:/bin' },
    }),
    /PI_ACP_PI_COMMAND.*absolute/u,
  );

  assert.throws(
    () => createPiAcpAdapter({
      executable: ENTRYPOINT,
      cwd: CWD,
      env: { PATH: '/usr/bin:/bin', PI_ACP_PI_COMMAND: 'pi' },
    }),
    /PI_ACP_PI_COMMAND.*absolute/u,
  );
});

test('PI-RPC becomes required when finalized Pi shapes leave maintenance cost ambiguous', () => {
  const result = evaluateApplicability({
    piSdk: { finalized: true, verdict: 'PASS', observations: { sdkVsPiAcpMaintenanceCostAmbiguous: true } },
    piAcp: { finalized: true, verdict: 'PASS' },
    openCode: { finalized: true, verdict: 'PASS' },
  });

  assert.equal(result.piRpc, 'REQUIRED');
});

test('SECOND-ACP is required when OpenCode shows material ACP advantage and finalized Pi-ACP did not pass', () => {
  const result = evaluateApplicability({
    piSdk: { finalized: true, verdict: 'PASS' },
    piAcp: { finalized: true, verdict: 'BLOCKED' },
    openCode: {
      finalized: true,
      verdict: 'PASS',
      observations: { materialAcpBoundaryAdvantage: true },
    },
  });

  assert.equal(result.secondAcp, 'REQUIRED');
});
