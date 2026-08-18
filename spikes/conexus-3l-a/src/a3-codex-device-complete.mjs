import fs from 'node:fs/promises';
import path from 'node:path';
import { Agent } from '@mastra/core/agent';
import { pollCodexDeviceLogin } from '@mastra/code-sdk/auth/providers/openai-codex';
import { AuthStorage } from '@mastra/code-sdk/auth/storage';
import { openaiCodexProvider } from '@mastra/code-sdk/providers/openai-codex';
import { ACTOR_MODEL_SLUG, A3_THINKING_LEVEL, CODEX_AUTH_PROVIDER } from './a3-admission.mjs';

const pendingPath = process.env.CODEX_DEVICE_PENDING_PATH ?? path.resolve('a3-codex-device-pending.json');
const authPath = process.env.CODEX_AUTH_PATH ?? '/tmp/conexus-a3-codex-auth.json';
const pending = JSON.parse(await fs.readFile(pendingPath, 'utf8'));

let credentials;
while (Date.now() < pending.deadlineAt) {
  const result = await pollCodexDeviceLogin(pending);
  if (result.status === 'complete') {
    credentials = result.credentials;
    break;
  }
  if (result.status === 'failed') throw new Error(result.error);
  await new Promise(resolve => setTimeout(resolve, Math.max(500, result.nextPollMs ?? pending.intervalMs ?? 1000)));
}

if (!credentials) throw new Error('Codex device authorization expired before completion');

const authStorage = new AuthStorage(authPath);
authStorage.set(CODEX_AUTH_PROVIDER, { type: 'oauth', ...credentials });

const smokeAgent = new Agent({
  id: 'conexus-a3-codex-oauth-smoke',
  name: 'Conexus A3 Codex OAuth smoke',
  instructions: 'Qualification smoke only. Follow the user request exactly.',
  model: openaiCodexProvider(ACTOR_MODEL_SLUG, {
    thinkingLevel: A3_THINKING_LEVEL,
    authStorage,
  }),
  maxRetries: 0,
});

const response = await smokeAgent.generate('Reply with exactly CODEX_OAUTH_SMOKE_OK and nothing else.');
const text = response.text?.trim() ?? '';
if (text !== 'CODEX_OAUTH_SMOKE_OK') {
  throw new Error(`Codex OAuth smoke returned unexpected text: ${JSON.stringify(text)}`);
}

console.log('CODEX_OAUTH_SMOKE=PASS');
console.log(`CODEX_OAUTH_ACTOR_MODEL=${ACTOR_MODEL_SLUG}`);
console.log(`CODEX_AUTH_PATH=${authPath}`);
