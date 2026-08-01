import { accessSync, constants } from 'node:fs';
import { homedir, release } from 'node:os';
import { delimiter, join } from 'node:path';

import { openLavishPlan, pollLavishPlan } from '../adapters/lavish.js';
import type { ProjectIdentity } from '../domain/types.js';
import { inspectEnvironment } from '../runtime/environment.js';
import {
  resolveMissionPlanHtmlPath,
  resolveMissionPlanReviewPath,
  resolveRuntimeRoot,
} from '../runtime/paths.js';
import { MissionPlanService } from '../services/mission-plan-service.js';
import { MissionService } from '../services/mission-service.js';
import { initializeProject, loadProject } from '../services/project-service.js';
import { SqliteStore } from '../store/sqlite-store.js';
import { runCli, type InitializedProjectView } from './main.js';

function findExecutable(name: string): string | null {
  for (const directory of (process.env.PATH ?? '').split(delimiter)) {
    if (!directory) continue;
    const candidate = join(directory, name);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Search the next PATH entry.
    }
  }
  return null;
}

function runtimeRoot(identity: ProjectIdentity): string {
  return resolveRuntimeRoot({
    repoId: identity.repoId,
    env: process.env,
    homeDir: homedir(),
  });
}

function withMissionService<T>(operation: (service: MissionService) => T): T {
  const identity = loadProject(process.cwd());
  const store = SqliteStore.open(join(runtimeRoot(identity), 'mnfs.db'));
  try {
    return operation(new MissionService(store));
  } finally {
    store.close();
  }
}

async function withMissionPlanService<T>(
  operation: (service: MissionPlanService, runtimeRoot: string) => T | Promise<T>,
): Promise<T> {
  const identity = loadProject(process.cwd());
  const root = runtimeRoot(identity);
  const store = SqliteStore.open(join(root, 'mnfs.db'));
  try {
    return await operation(new MissionPlanService({
      store,
      projectRoot: identity.projectRoot,
      runtimeRoot: root,
    }), root);
  } finally {
    store.close();
  }
}

const result = await runCli(process.argv.slice(2), {
  inspect: () => inspectEnvironment({
    platform: process.platform,
    release: release(),
    nodeVersion: process.version,
    cwd: process.cwd(),
    which: findExecutable,
  }),
  initialize: (): InitializedProjectView => {
    const identity = initializeProject({ cwd: process.cwd() });
    const root = runtimeRoot(identity);
    const store = SqliteStore.open(join(root, 'mnfs.db'));
    store.close();
    return { ...identity, runtimeRoot: root };
  },
  openMission: (goal) => withMissionService((service) => service.openMission({ goal })),
  status: () => withMissionService((service) => service.getStatus()),
  savePlan: (input) => withMissionPlanService((service) => service.savePlanFromFile(input)),
  showPlan: (missionId) => withMissionPlanService((service) => service.getCurrentPlan(missionId)),
  renderPlan: (missionId) => withMissionPlanService((service) => service.renderCurrentPlan(missionId)),
  openPlan: (missionId) => withMissionPlanService(async (service) => {
    const rendered = service.renderCurrentPlan(missionId);
    const lavishOutput = await openLavishPlan(rendered.htmlPath);
    return { ...rendered, lavishOutput };
  }),
  pollPlan: (missionId) => withMissionPlanService(async (service, root) => {
    const revision = service.getCurrentPlan(missionId);
    const htmlPath = resolveMissionPlanReviewPath(root, missionId);
    const snapshotPath = resolveMissionPlanHtmlPath(root, missionId, revision.revision);
    const feedback = await pollLavishPlan(htmlPath);
    return { revision, htmlPath, snapshotPath, feedback };
  }),
  approvePlan: (input) => withMissionPlanService((service) => service.approvePlan(input)),
  materializePlan: (missionId) => withMissionPlanService((service) => {
    const revision = service.getCurrentPlan(missionId);
    const contractPath = service.materializeApprovedPlan(missionId);
    return { revision, contractPath };
  }),
  debug: process.env.MNFS_DEBUG === '1',
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.exitCode;
