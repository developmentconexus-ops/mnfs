import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const adversarialRunner = 'scripts/run-wire-whole-4b-adversarial.mjs';

if (!fs.existsSync(adversarialRunner)) {
  throw new Error('Whole 4B executable proof is missing');
}

const result = spawnSync('node', [adversarialRunner], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');

if (result.status !== 0) {
  throw new Error('Whole 4B adversarial proof failed');
}

console.log('Whole 4B executable proof passed.');
