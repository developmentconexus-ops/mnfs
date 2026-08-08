#!/usr/bin/env node
import { executeCli } from '../src/cli.mjs';

try {
  process.exitCode = await executeCli(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`${JSON.stringify({
    ok: false,
    error: String(error?.message ?? error),
  })}\n`);
  process.exitCode = 1;
}
