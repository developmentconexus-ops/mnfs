import { join } from 'node:path';

import {
  createFixture as createFixtureCore,
  loadFixture,
} from './fixture-core.mjs';
import { syncDurableFile } from './durable-write.mjs';

export { loadFixture };

export async function createFixture(input) {
  const fixture = await createFixtureCore(input);
  await syncDurableFile(join(fixture.runRoot, 'fixture.json'));
  return fixture;
}
