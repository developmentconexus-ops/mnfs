import fs from 'node:fs/promises';
import path from 'node:path';
import { Agent } from '@mastra/core/agent';
import { pollCodexDeviceLogin } from '@mastra/code-sdk/auth/providers/openai-codex';
import { AuthStorage } from '@mastra/code-sdk/auth/storage';
import { openaiCodexProvider } from '@mastra/code-sdk/providers/openai-codex';
import {
  ACTOR_MODEL_SLUG,
  A3_THINKING_LEVEL,
  CODEX_AUTH_PROVIDER,
  OM_MODEL_SLUG,
} from './a3-admission.mjs';
import { smokeCodexModel } from './a3-live.mjs';

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

async function smoke(modelId, marker) {
  const agent = new Agent({
    id: `conexus-a3-codex-oauth-smoke-${modelId}`,
    name: `Conexus A3 Codex OAuth smoke ${modelId}`,
    instructions: 'Qualification smoke only. Follow the user request exactly.',
    model: openaiCodexProvider(modelId, {
      thinkingLevel: A3_THINKING_LEVEL,
      authStorage,
    }),
    maxRetries: 0,
  });

  const text = await smokeCodexModel(agent, marker);
  if (text !== marker) throw new Error(`${modelId} OAuth smoke returned unexpected text: ${JSON.stringify(text)}`);
  console.log(`CODEX_OAUTH_SMOKE_${modelId.toUpperCase().replaceAll(/[^A-Z0-9]+/g, '_')}=PASS`);
}

await smoke(ACTOR_MODEL_SLUG, 'CODEX_SOL_SMOKE_OK');
await smoke(OM_MODEL_SLUG, 'CODEX_LUNA_SMOKE_OK');

console.log('CODEX_OAUTH_SMOKE=PASS');
console.log(`CODEX_OAUTH_ACTOR_MODEL=${ACTOR_MODEL_SLUG}`);
console.log(`CODEX_OAUTH_OM_MODEL=${OM_MODEL_SLUG}`);
console.log(`CODEX_AUTH_PATH=${authPath}`);
