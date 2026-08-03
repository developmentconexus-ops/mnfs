const SOCKET_PROBE_CODE = `
const net = require('node:net');
const path = process.argv[1];
const socket = net.createConnection({ path }, () => { socket.destroy(); process.exit(0); });
socket.on('error', () => process.exit(23));
setTimeout(() => { socket.destroy(); process.exit(23); }, 2000).unref();
`;

export function socketScenarios(context) {
  return [
    {
      scenarioId: 'S8',
      name: 'Unix and privileged socket denial',
      expected: 'DENY',
      policyKey: 'networkOff',
      argv: [process.execPath, '-e', SOCKET_PROBE_CODE, '--', context.fixture.controlledSocket],
      timeoutMs: 10_000,
      targetPaths: [context.fixture.controlledSocket],
      observedResources: ['outsideWrite'],
      failureCode: 'SOCKET_POLICY_BYPASS',
      dockerSocketPresent: context.dockerSocketPresent === true,
    },
  ];
}
