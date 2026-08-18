import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { CommandExitError, Sandbox } from 'e2b';

const apiKey = process.env.E2B_API_KEY;
if (!apiKey) throw new Error('E2B_API_KEY is required for A2 DB/reconciliation qualification');

const QUALIFIED_TEMPLATE_ID = '7ezun152y8jtqxf7llpl';
const QUALIFIED_TEMPLATE_DIGEST = '1309c097b7979014d8e37e03cb4bc2424d1f95ae40b3a81994a9175ef1a89d2c';
const timeoutMs = 120_000;

async function createQualified(opts = {}) {
  return Sandbox.create(QUALIFIED_TEMPLATE_ID, {
    apiKey,
    timeoutMs,
    lifecycle: { onTimeout: 'pause', autoResume: false },
    network: { allowPublicTraffic: false, denyOut: ['0.0.0.0/0'] },
    ...opts,
  });
}

async function providerGone(sandboxId) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`https://api.e2b.app/sandboxes/${sandboxId}`, {
      headers: { 'X-API-Key': apiKey },
      signal: AbortSignal.timeout(2_000),
    });
    if (response.status === 404) return true;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  return false;
}

async function startQualifiedPg(sandbox) {
  const start = await sandbox.commands.run(
    [
      'set -eu',
      'rm -rf /tmp/conexus-pgdata',
      'install -d -o postgres -g postgres /tmp/conexus-pgdata',
      "runuser -u postgres -- /usr/lib/postgresql/17/bin/initdb -D /tmp/conexus-pgdata -A trust --encoding=UTF8 --locale-provider=builtin --builtin-locale=C.UTF-8 >/tmp/conexus-initdb.log",
      "runuser -u postgres -- /usr/lib/postgresql/17/bin/pg_ctl -D /tmp/conexus-pgdata -l /tmp/conexus-postgres.log -o '-h 127.0.0.1 -p 55432' -w start",
    ].join(' && '),
    { user: 'root' },
  );
  assert.equal(start.exitCode, 0, start.stderr);
}

async function stopQualifiedPg(sandbox) {
  await sandbox.commands
    .run("runuser -u postgres -- /usr/lib/postgresql/17/bin/pg_ctl -D /tmp/conexus-pgdata -m fast -w stop", {
      user: 'root',
    })
    .catch(() => undefined);
}

function psql(sql, { role = 'postgres', database = 'postgres' } = {}) {
  return `/usr/lib/postgresql/17/bin/psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 55432 -U ${role} -d ${database} -Atc ${JSON.stringify(sql)}`;
}

test('A2-DB-01: BuildValidationDatabase substrate preserves PG17.10, builtin C.UTF-8, ICU pt-BR, least-privilege roles and loopback-only bind', async () => {
  let sandbox;
  let pgStarted = false;

  try {
    sandbox = await createQualified({ metadata: { 'conexus-probe': '3l-a-build-validation-db' } });
    await startQualifiedPg(sandbox);
    pgStarted = true;

    const serverVersion = (await sandbox.commands.run(psql('SHOW server_version;'))).stdout.trim();
    assert.match(serverVersion, /^17\.10(?:\D|$)/, `expected PostgreSQL 17.10, got ${serverVersion}`);

    const dbIdentity = (
      await sandbox.commands.run(
        psql(
          "SELECT concat_ws('|', datlocprovider, pg_encoding_to_char(encoding), datlocale) FROM pg_database WHERE datname = current_database();",
        ),
      )
    ).stdout.trim();
    assert.equal(dbIdentity, 'b|UTF8|C.UTF-8');

    const listenAddresses = (await sandbox.commands.run(psql('SHOW listen_addresses;'))).stdout.trim();
    assert.equal(listenAddresses, '127.0.0.1');
    const listener = await sandbox.commands.run("lsof -nP -iTCP:55432 -sTCP:LISTEN || true", { user: 'root' });
    assert.match(listener.stdout, /127\.0\.0\.1:55432\s+\(LISTEN\)/);
    assert.doesNotMatch(listener.stdout, /\*:55432|\[::\]:55432/);

    const bootstrapSql = [
      "CREATE COLLATION public.conexus_pt_br (provider = icu, locale = 'pt-BR');",
      'CREATE ROLE conexus_probe_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE;',
      'CREATE ROLE conexus_probe_migrator LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE;',
      'CREATE ROLE conexus_probe_query LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE;',
      'CREATE ROLE conexus_probe_action LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE;',
      'ALTER ROLE conexus_probe_query SET default_transaction_read_only = on;',
      'GRANT conexus_probe_owner TO conexus_probe_migrator;',
      'CREATE SCHEMA app AUTHORIZATION conexus_probe_owner;',
      'SET ROLE conexus_probe_owner;',
      'CREATE TABLE app.items (id integer PRIMARY KEY, name text COLLATE public.conexus_pt_br NOT NULL);',
      'RESET ROLE;',
      'GRANT USAGE ON SCHEMA app TO conexus_probe_query, conexus_probe_action;',
      'GRANT SELECT ON TABLE app.items TO conexus_probe_query;',
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.items TO conexus_probe_action;',
    ].join(' ');
    const bootstrap = await sandbox.commands.run(psql(bootstrapSql));
    assert.equal(bootstrap.exitCode, 0, bootstrap.stderr);

    const collation = (
      await sandbox.commands.run(
        psql("SELECT concat_ws('|', collprovider, colllocale) FROM pg_collation WHERE collname = 'conexus_pt_br';"),
      )
    ).stdout.trim();
    assert.match(collation, /^i\|.+/);

    const roleSafety = (
      await sandbox.commands.run(
        psql(
          "SELECT concat_ws('|', rolname, rolsuper, rolcreatedb, rolcreaterole, rolcanlogin) FROM pg_roles WHERE rolname IN ('conexus_probe_owner','conexus_probe_migrator','conexus_probe_query','conexus_probe_action') ORDER BY rolname;",
        ),
      )
    ).stdout.trim().split('\n');
    assert.equal(roleSafety.length, 4);
    for (const row of roleSafety) {
      const [name, superuser, createdb, createrole, canlogin] = row.split('|');
      assert.equal(superuser, 'false', `${name} must not be superuser`);
      assert.equal(createdb, 'false', `${name} must not create databases`);
      assert.equal(createrole, 'false', `${name} must not create roles`);
      if (name === 'conexus_probe_owner') assert.equal(canlogin, 'false', 'owner must be NOLOGIN');
      else assert.equal(canlogin, 'true', `${name} must be a login role for this conformance fixture`);
    }

    const actionInsert = await sandbox.commands.run(
      psql("INSERT INTO app.items(id, name) VALUES (1, 'Água');", { role: 'conexus_probe_action' }),
    );
    assert.equal(actionInsert.exitCode, 0, actionInsert.stderr);

    const queryRead = (
      await sandbox.commands.run(psql("SELECT concat_ws('|', id, name) FROM app.items;", { role: 'conexus_probe_query' }))
    ).stdout.trim();
    assert.equal(queryRead, '1|Água');

    const queryReadOnly = (
      await sandbox.commands.run(psql('SHOW default_transaction_read_only;', { role: 'conexus_probe_query' }))
    ).stdout.trim();
    assert.equal(queryReadOnly, 'on');

    await assert.rejects(
      sandbox.commands.run(
        psql("INSERT INTO app.items(id, name) VALUES (2, 'blocked');", { role: 'conexus_probe_query' }),
      ),
      CommandExitError,
    );
    await assert.rejects(
      sandbox.commands.run(psql('CREATE TABLE app.action_ddl_forbidden(id integer);', { role: 'conexus_probe_action' })),
      CommandExitError,
    );
    await assert.rejects(
      sandbox.commands.run(psql('SET ROLE conexus_probe_owner;', { role: 'conexus_probe_action' })),
      CommandExitError,
    );

    const migratorDdl = await sandbox.commands.run(
      psql(
        'SET ROLE conexus_probe_owner; CREATE TABLE app.migration_probe(id integer); RESET ROLE;',
        { role: 'conexus_probe_migrator' },
      ),
    );
    assert.equal(migratorDdl.exitCode, 0, migratorDdl.stderr);

    console.log(
      `A2_DB_EVIDENCE=${JSON.stringify({
        qualifiedTemplateId: QUALIFIED_TEMPLATE_ID,
        qualifiedTemplateDigestSha256: QUALIFIED_TEMPLATE_DIGEST,
        serverVersion,
        dbIdentity,
        collation,
        listenAddresses,
        roleSafety,
        queryReadOnly,
        queryWriteDenied: true,
        actionDdlDenied: true,
        actionOwnerAssumptionDenied: true,
        migratorOwnerAssumption: true,
      })}`,
    );
  } finally {
    if (sandbox && pgStarted) await stopQualifiedPg(sandbox);
    if (sandbox) await sandbox.kill().catch(() => undefined);
  }
});

test('A2-RECONCILE-01: an orphan sandbox is discoverable by owner metadata and destroyable without the original local handle', async () => {
  const marker = `actor-run-${crypto.randomUUID()}`;
  let original;
  let physicalId;

  try {
    original = await createQualified({
      metadata: {
        'conexus-probe': '3l-a-orphan-reconciliation',
        'conexus-owner-ref': marker,
      },
    });
    physicalId = original.sandboxId;
    assert.ok(physicalId);

    // Simulate hub/process loss: reconciliation has only the durable owner marker,
    // not the original SDK object. Provider inventory must recover the physical id.
    original = null;
    const paginator = Sandbox.list({
      apiKey,
      query: { metadata: { 'conexus-owner-ref': marker }, state: ['running', 'paused'] },
    });
    const found = await paginator.nextItems();
    assert.equal(found.length, 1, 'owner marker must resolve one physical sandbox');
    assert.equal(found[0].sandboxId, physicalId);
    assert.equal(found[0].metadata?.['conexus-owner-ref'], marker);

    await Sandbox.kill(found[0].sandboxId, { apiKey });
    assert.equal(await providerGone(physicalId), true, 'reconciliation kill must remove provider-side orphan');

    const after = Sandbox.list({
      apiKey,
      query: { metadata: { 'conexus-owner-ref': marker }, state: ['running', 'paused'] },
    });
    const afterItems = await after.nextItems();
    assert.equal(afterItems.length, 0);

    console.log(
      `A2_RECONCILIATION_EVIDENCE=${JSON.stringify({
        ownerMarker: marker,
        recoveredPhysicalSandboxId: physicalId,
        recoveredState: found[0].state,
        timeoutMs,
        lifecycle: 'pause/no-auto-resume',
        providerGoneAfterKill: true,
      })}`,
    );
    physicalId = undefined;
  } finally {
    if (original) await original.kill().catch(() => undefined);
    if (physicalId) await Sandbox.kill(physicalId, { apiKey }).catch(() => undefined);
  }
});
