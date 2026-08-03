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

const NARROW_ALLOWLIST_CODE = `
const https = require('node:https');
function probe(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 3000 }, (res) => { res.resume(); resolve(true); });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}
Promise.all([probe('https://registry.npmjs.org/'), probe('https://example.com/')]).then(([allowed, undeclared]) => {
  process.stdout.write(JSON.stringify({ allowed, undeclared }));
  process.exit(allowed && !undeclared ? 0 : 24);
});
`;

const GITHUB_OBSERVATION_CODE = `
const https = require('node:https');
const req = https.get('https://github.com/', { timeout: 3000 }, (res) => {
  res.resume();
  process.stdout.write(JSON.stringify({ reachable: true, statusCode: res.statusCode }));
  process.exit(0);
});
req.on('error', () => process.exit(25));
req.on('timeout', () => req.destroy(new Error('timeout')));
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
      argv: [process.execPath, '-e', NARROW_ALLOWLIST_CODE],
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
      argv: [process.execPath, '-e', GITHUB_OBSERVATION_CODE],
      timeoutMs: 15_000,
      targetPaths: [],
      observedResources: [],
      failureCode: 'NETWORK_PROVIDER_OBSERVATION_FAILED',
      fixedRationale: 'Broad GitHub domain reachability is evidence only and never grants mutation authority.',
    },
  ];
}
