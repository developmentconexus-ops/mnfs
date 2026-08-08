import { randomBytes as cryptoRandomBytes } from 'node:crypto';
import { requireRunId } from './paths.mjs';

export function generateRunId({ now = () => new Date(), randomBytes = cryptoRandomBytes } = {}) {
  const instant = now();
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) throw new TypeError('ARR-S0 run-id clock returned an invalid Date');
  const stamp = instant.toISOString()
    .replace(/[-:]/gu, '')
    .replace('.', '')
    .replace('T', 't')
    .replace('Z', 'z');
  const suffix = Buffer.from(randomBytes(3)).toString('hex');
  return requireRunId(`arr-s0-${stamp}-${suffix}`);
}
