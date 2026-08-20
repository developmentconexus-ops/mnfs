import fs from 'node:fs/promises';
import path from 'node:path';
import { startCodexDeviceLogin } from '@mastra/code-sdk/auth/providers/openai-codex';

const outputPath = process.env.CODEX_DEVICE_PENDING_PATH ?? path.resolve('a3-codex-device-pending.json');

const pending = await startCodexDeviceLogin();
await fs.writeFile(outputPath, `${JSON.stringify(pending, null, 2)}\n`, 'utf8');

console.log(`CODEX_DEVICE_URL=${pending.url}`);
console.log(`CODEX_DEVICE_CODE=${pending.userCode}`);
console.log(`CODEX_DEVICE_EXPIRES_AT=${new Date(pending.deadlineAt).toISOString()}`);
console.log(`CODEX_DEVICE_INSTRUCTIONS=${pending.instructions}`);
console.log(`CODEX_DEVICE_PENDING_PATH=${outputPath}`);
