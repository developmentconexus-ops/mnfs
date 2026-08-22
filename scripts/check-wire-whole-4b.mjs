import fs from 'node:fs';

const adversarialRunner = 'scripts/run-wire-whole-4b-adversarial.mjs';

if (!fs.existsSync(adversarialRunner)) {
  throw new Error('Whole 4B executable proof is missing');
}

throw new Error('Whole 4B executable proof is missing');
