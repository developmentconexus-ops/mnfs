const NETWORK_OFF_CODE = `
const dns = require('node:dns');
const https = require('node:https');
const net = require('node:net');
let escaped = false;
let pending = 3;
const done = () => { pending -= 1; if (pending === 0) process.exit(escaped ? 0 : 23); };
dns.lookup('example.com', (error) => { if (!error) escaped = true; done(); });
const request = https.get('https://example.com/', { timeout: 1500 }, () => { escaped = true; request.destroy(); done(); });
request.on('error', done); request.on('timeout', () => request.destroy(new Error('timeout')));
const socket = net.connect({ host: '1.1.1.1', port: 443, timeout: 1500 }, () => { escaped = true; socket.destroy(); done(); });
socket.on('error', done); socket.on('timeout', () => socket.destroy(new Error('timeout')));
`;

const PROBE_HELPER = `
function probe(url) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const req = https.get(url, { timeout: 5000 }, (res) => {
      res.resume();
      finish({ reachable: true, statusCode: res.statusCode ?? null, errorCode: null });
    });
    req.on('error', (error) => finish({
      reachable: false,
      statusCode: null,
      errorCode: typeof error?.code === 'string' ? error.code : null,
    }));
    req.on('timeout', () => req.destroy(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })));
  });
}
`;

const NARROW_ALLOWLIST_CODE = `
const https = require('node:https');
${PROBE_HELPER}
Promise.all([probe('https://registry.npmjs.org/'), probe('https://example.com/')]).then(([allowed, undeclared]) => {
  process.stdout.write(JSON.stringify({ allowed, undeclared }));
  process.exit(allowed.reachable && !undeclared.reachable ? 0 : 24);
});
`;

const GITHUB_OBSERVATION_CODE = `
const https = require('node:https');
${PROBE_HELPER}
probe('https://github.com/').then((github) => {
  process.stdout.write(JSON.stringify({ github }));
  process.exit(github.reachable ? 0 : 25);
});
`;

export function networkScenarios(context) {
  return [
    {
      scenarioId: 'S5',
      name: 'Network denied by default',
      expected: 'DENY',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', NETWORK_OFF_CODE],
      timeoutMs: 15_000,
      targetPaths: [],
      observedResources: ['outsideWrite'],
      failureCode: 'NETWORK_POLICY_BYPASS',
    },
    {
      scenarioId: 'S6',
      name: 'Narrow domain allowlist',
      expected: 'OBSERVE',
      policyKey: 'narrowNetwork',
      argv: [process.execPath, '--use-env-proxy', '-e', NARROW_ALLOWLIST_CODE],
      timeoutMs: 20_000,
      targetPaths: [],
      observedResources: [],
      failureCode: 'NETWORK_ALLOWLIST_FAILED',
    },
    {
      scenarioId: 'S7',
      name: 'Broad GitHub domain risk',
      expected: 'OBSERVE',
      policyKey: 'githubBroad',
      argv: [process.execPath, '--use-env-proxy', '-e', GITHUB_OBSERVATION_CODE],
      timeoutMs: 15_000,
      targetPaths: [],
      observedResources: [],
      failureCode: 'NETWORK_PROVIDER_OBSERVATION_FAILED',
      fixedRationale: 'Broad GitHub domain reachability is evidence only and never grants mutation authority.',
    },
  ];
}
