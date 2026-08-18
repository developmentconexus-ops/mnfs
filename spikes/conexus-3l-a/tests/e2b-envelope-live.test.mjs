import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { Sandbox, Template } from 'e2b';

const apiKey = process.env.E2B_API_KEY;
if (!apiKey) throw new Error('E2B_API_KEY is required for A2 envelope qualification');

const timeoutMs = 180_000;
const allocation = Object.freeze({ cpuCount: 2, memoryMB: 4096 });
const postgresqlDebVersion = '17.10-1.pgdg12+1';
const buildPackages = Object.freeze([
  'ca-certificates',
  'curl',
  'gnupg',
  'git',
  'chromium',
  'procps',
  'lsof',
]);

function builderTemplate() {
  return Template()
    .fromNodeImage('24.18.0-bookworm')
    .aptInstall(buildPackages, { noInstallRecommends: true })
    .runCmd(
      [
        'install -d -m 0755 /usr/share/postgresql-common/pgdg',
        'curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc',
        'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt-archive.postgresql.org/pub/repos/apt bookworm-pgdg-archive main" > /etc/apt/sources.list.d/pgdg.list',
      ],
      { user: 'root' },
    )
    .aptInstall(
      [`postgresql-17=${postgresqlDebVersion}`, `postgresql-client-17=${postgresqlDebVersion}`],
      { noInstallRecommends: true },
    );
}

async function providerInfo(sandboxId) {
  const response = await fetch(`https://api.e2b.app/sandboxes/${sandboxId}`, {
    headers: { 'X-API-Key': apiKey },
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.ok, true, `E2B provider info failed with HTTP ${response.status}`);
  return response.json();
}

async function metricsEventually(sandboxId) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const metrics = await Sandbox.getMetrics(sandboxId, { apiKey });
    if (metrics.length > 0) return metrics;
    await new Promise(resolve => setTimeout(resolve, 1_000));
  }
  return [];
}

async function exactTemplateIdentity() {
  const template = builderTemplate();
  const templateJson = await Template.toJSON(template);
  const digest = crypto
    .createHash('sha256')
    .update(JSON.stringify({ templateJson, allocation, e2bSdk: '2.40.0' }))
    .digest('hex');
  return {
    template,
    templateJson,
    digest,
    name: `conexus-3l-a-builder-${digest.slice(0, 16)}`,
  };
}

test('A2-ENVELOPE-01: exact custom Builder template provisions the required 2vCPU/4GiB toolchain and exposes measurable resource evidence', async () => {
  const identity = await exactTemplateIdentity();
  const existed = await Template.exists(identity.name, { apiKey });
  let buildInfo = null;
  let buildDurationMs = 0;

  if (!existed) {
    const started = performance.now();
    buildInfo = await Template.build(identity.template, identity.name, {
      apiKey,
      cpuCount: allocation.cpuCount,
      memoryMB: allocation.memoryMB,
    });
    buildDurationMs = Math.round(performance.now() - started);
    assert.ok(buildInfo.templateId);
    assert.ok(buildInfo.buildId);
  }

  let sandbox;
  let sandboxId;
  let pgStarted = false;
  const sandboxStartedAt = performance.now();

  try {
    sandbox = await Sandbox.create(identity.name, {
      apiKey,
      timeoutMs,
      allowInternetAccess: false,
      lifecycle: { onTimeout: 'pause', autoResume: false },
      network: { allowPublicTraffic: false },
      metadata: {
        'conexus-probe': '3l-a-builder-envelope',
        'conexus-template-digest': identity.digest.slice(0, 32),
      },
    });
    sandboxId = sandbox.sandboxId;
    const sandboxReadyMs = Math.round(performance.now() - sandboxStartedAt);

    const info = await providerInfo(sandboxId);
    assert.equal(info.sandboxID, sandboxId);
    assert.equal(info.cpuCount, allocation.cpuCount, 'qualified template must allocate exactly 2 vCPU');
    assert.equal(info.memoryMB, allocation.memoryMB, 'qualified template must allocate exactly 4 GiB');
    assert.equal(info.allowInternetAccess, false);
    assert.equal(info.network?.allowPublicTraffic, false);
    assert.equal(typeof info.templateID, 'string');
    assert.ok(info.templateID.length > 0, 'provider-side template ID must be observable');
    assert.equal(typeof info.envdVersion, 'string');
    assert.ok(info.envdVersion.length > 0, 'envd version must be observable');

    const nodeVersion = (await sandbox.commands.run('node --version')).stdout.trim();
    assert.equal(nodeVersion, 'v24.18.0');

    const gitVersion = (await sandbox.commands.run('git --version')).stdout.trim();
    assert.match(gitVersion, /^git version /);

    const chromiumVersion = (await sandbox.commands.run('chromium --version')).stdout.trim();
    assert.match(chromiumVersion, /Chromium/i);
    await sandbox.files.write('/tmp/conexus-browser-probe.html', '<html><body>conexus-browser-ok</body></html>');
    const browserSmoke = await sandbox.commands.run(
      "chromium --headless --no-sandbox --disable-gpu --dump-dom file:///tmp/conexus-browser-probe.html | grep -q 'conexus-browser-ok'",
    );
    assert.equal(browserSmoke.exitCode, 0);

    const pgReadyStartedAt = performance.now();
    const pgStart = await sandbox.commands.run(
      [
        'set -eu',
        'install -d -o postgres -g postgres /tmp/conexus-pgdata',
        "runuser -u postgres -- /usr/lib/postgresql/17/bin/initdb -D /tmp/conexus-pgdata -A trust >/tmp/conexus-initdb.log",
        "runuser -u postgres -- /usr/lib/postgresql/17/bin/pg_ctl -D /tmp/conexus-pgdata -l /tmp/conexus-postgres.log -o '-h 127.0.0.1 -p 55432' -w start",
      ].join(' && '),
      { user: 'root' },
    );
    assert.equal(pgStart.exitCode, 0, pgStart.stderr);
    pgStarted = true;
    const pgReadyMs = Math.round(performance.now() - pgReadyStartedAt);

    const pgVersion = (
      await sandbox.commands.run(
        "/usr/lib/postgresql/17/bin/psql -h 127.0.0.1 -p 55432 -U postgres -d postgres -Atc 'show server_version;'",
      )
    ).stdout.trim();
    assert.match(pgVersion, /^17\.10(?:\D|$)/, `expected PostgreSQL 17.10, got ${pgVersion}`);

    // Generate a short-lived CPU/memory/disk signal so provider metrics prove the observation surface fires.
    await sandbox.commands.run(
      "python3 - <<'PY'\nimport hashlib\nx = b'conexus'\nfor _ in range(120000):\n    x = hashlib.sha256(x).digest()\nopen('/tmp/conexus-metric-signal.bin','wb').write(x * 4096)\nPY",
    );
    await new Promise(resolve => setTimeout(resolve, 1_500));
    const metrics = await metricsEventually(sandboxId);
    assert.ok(metrics.length > 0, 'provider-side resource metrics must be observable');

    const peak = metrics.reduce(
      (acc, item) => ({
        cpuUsedPct: Math.max(acc.cpuUsedPct, item.cpuUsedPct ?? 0),
        memUsed: Math.max(acc.memUsed, item.memUsed ?? 0),
        memTotal: Math.max(acc.memTotal, item.memTotal ?? 0),
        diskUsed: Math.max(acc.diskUsed, item.diskUsed ?? 0),
        diskTotal: Math.max(acc.diskTotal, item.diskTotal ?? 0),
      }),
      { cpuUsedPct: 0, memUsed: 0, memTotal: 0, diskUsed: 0, diskTotal: 0 },
    );
    assert.ok(peak.memTotal > 0);
    assert.ok(peak.diskTotal > 0);

    console.log(
      `A2_ENVELOPE_EVIDENCE=${JSON.stringify({
        templateName: identity.name,
        templateDigestSha256: identity.digest,
        templateId: info.templateID,
        buildId: buildInfo?.buildId ?? 'REUSED_EXISTING_TEMPLATE',
        templateWasReused: existed,
        buildDurationMs,
        sandboxReadyMs,
        pgReadyMs,
        nodeVersion,
        gitVersion,
        chromiumVersion,
        pgVersion,
        postgresqlDebVersion,
        envdVersion: info.envdVersion,
        cpuCount: info.cpuCount,
        memoryMB: info.memoryMB,
        diskSizeMB: info.diskSizeMB ?? null,
        metricsSamples: metrics.length,
        peak,
      })}`,
    );
  } finally {
    if (sandbox && pgStarted) {
      await sandbox.commands
        .run("runuser -u postgres -- /usr/lib/postgresql/17/bin/pg_ctl -D /tmp/conexus-pgdata -m fast -w stop", {
          user: 'root',
        })
        .catch(() => undefined);
    }
    if (sandbox) await sandbox.kill().catch(() => undefined);
    else if (sandboxId) await Sandbox.kill(sandboxId, { apiKey }).catch(() => undefined);
  }
});
