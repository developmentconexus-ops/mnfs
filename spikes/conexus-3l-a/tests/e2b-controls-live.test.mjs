import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import tls from 'node:tls';
import { execFileSync } from 'node:child_process';
import { CommandExitError, Sandbox } from 'e2b';
import { ConexusWriteE2BSandbox } from '../src/physical-incarnation-guard.mjs';

const apiKey = process.env.E2B_API_KEY;
if (!apiKey) throw new Error('E2B_API_KEY is required for A2 control qualification');

const QUALIFIED_TEMPLATE_ID = '7ezun152y8jtqxf7llpl';
const QUALIFIED_TEMPLATE_DIGEST = '1309c097b7979014d8e37e03cb4bc2424d1f95ae40b3a81994a9175ef1a89d2c';
const timeoutMs = 180_000;

async function createQualified(opts = {}) {
  return Sandbox.create(QUALIFIED_TEMPLATE_ID, {
    apiKey,
    timeoutMs,
    lifecycle: { onTimeout: 'pause', autoResume: false },
    ...opts,
  });
}

async function killSandbox(sandbox) {
  if (sandbox) await sandbox.kill().catch(() => undefined);
}

async function waitForPrivateHttp(host, trafficAccessToken) {
  const url = `https://${host}/`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'e2b-traffic-access-token': trafficAccessToken },
        signal: AbortSignal.timeout(2_000),
      });
      if (response.status === 200) return response;
    } catch {
      // server may still be booting
    }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`private preview did not become ready at ${host}`);
}

function websocketUpgrade(host, trafficAccessToken) {
  return new Promise((resolve, reject) => {
    const key = crypto.randomBytes(16).toString('base64');
    const socket = tls.connect({ host, port: 443, servername: host });
    let data = Buffer.alloc(0);
    let settled = false;

    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else resolve(value);
    };

    const timer = setTimeout(() => finish(new Error('authenticated WebSocket upgrade timed out')), 8_000);
    socket.once('error', error => finish(error));
    socket.on('data', chunk => {
      data = Buffer.concat([data, chunk]);
      const text = data.toString('utf8');
      if (text.includes('conexus-ws-ok')) finish(null, text);
    });
    socket.once('secureConnect', () => {
      socket.write(
        [
          'GET /ws HTTP/1.1',
          `Host: ${host}`,
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Key: ${key}`,
          'Sec-WebSocket-Version: 13',
          `e2b-traffic-access-token: ${trafficAccessToken}`,
          '',
          '',
        ].join('\r\n'),
      );
    });
  });
}

async function readFileEventually(sandbox, filePath) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      return await sandbox.files.read(filePath);
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  throw new Error(`file did not appear: ${filePath}`);
}

async function processAlive(sandbox, pid) {
  try {
    await sandbox.commands.run(`kill -0 ${Number(pid)}`);
    return true;
  } catch {
    return false;
  }
}

async function waitProviderGone(sandboxId) {
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

test('A2-NET-01: deny-all plus one private allowlisted host fires; redirects and non-HTTP escape attempts remain blocked', async () => {
  let redirector;
  let source;

  try {
    redirector = await createQualified({
      network: { allowPublicTraffic: false, denyOut: ['0.0.0.0/0'] },
      metadata: { 'conexus-probe': '3l-a-redirect-target' },
    });
    assert.ok(redirector.trafficAccessToken);
    await redirector.files.write(
      '/tmp/conexus-redirect-server.cjs',
      `const http=require('node:http');const fs=require('node:fs');\n` +
        `http.createServer((req,res)=>{fs.appendFileSync('/tmp/conexus-redirect-hits.log',req.url+'\\n');` +
        `if(req.url==='/redirect'){res.writeHead(302,{Location:'https://1.1.1.1/'});res.end('redirect');}` +
        `else{res.writeHead(200,{'content-type':'text/plain'});res.end('allowlisted-ok');}}).listen(8080,'0.0.0.0');`,
    );
    await redirector.commands.run('node /tmp/conexus-redirect-server.cjs', { background: true });
    const redirectHost = redirector.getHost(8080);
    await waitForPrivateHttp(redirectHost, redirector.trafficAccessToken);

    source = await createQualified({
      network: {
        allowPublicTraffic: false,
        denyOut: ['0.0.0.0/0'],
        allowOut: [redirectHost],
        rules: {
          [redirectHost]: [
            {
              transform: {
                headers: { 'e2b-traffic-access-token': redirector.trafficAccessToken },
              },
            },
          ],
        },
      },
      metadata: { 'conexus-probe': '3l-a-network-source' },
    });

    const allowed = await source.commands.run(
      `curl -fsS --connect-timeout 3 --max-time 8 https://${redirectHost}/ok`,
    );
    assert.equal(allowed.stdout.trim(), 'allowlisted-ok');

    await assert.rejects(
      source.commands.run(`curl -fsSL --connect-timeout 3 --max-time 8 https://${redirectHost}/redirect`),
      CommandExitError,
    );
    const hits = await redirector.files.read('/tmp/conexus-redirect-hits.log');
    assert.match(hits, /\/redirect/, 'first redirect hop must have reached the allowlisted host');

    await assert.rejects(
      source.commands.run(
        "python3 - <<'PY'\nimport socket,struct\nq=b'\\x12\\x34\\x01\\x00\\x00\\x01\\x00\\x00\\x00\\x00\\x00\\x00'+b'\\x07example\\x03com\\x00'+b'\\x00\\x01\\x00\\x01'\ns=socket.create_connection(('8.8.8.8',53),timeout=2)\ns.sendall(struct.pack('!H',len(q))+q)\ns.settimeout(2)\nif not s.recv(2): raise RuntimeError('no DNS response')\nPY",
      ),
      CommandExitError,
    );

    const sourceEnv = await source.commands.run("env | grep -i 'traffic.*token' || true");
    assert.equal(sourceEnv.stdout.trim(), '', 'provider-side traffic-token transform must not become a guest env var');
  } finally {
    await killSandbox(source);
    await killSandbox(redirector);
  }
});

test('A2-PREVIEW-01: private RunPreview rejects anonymous HTTP and passes authenticated HTTP + WebSocket upgrade', async () => {
  let sandbox;

  try {
    sandbox = await createQualified({
      network: { allowPublicTraffic: false, denyOut: ['0.0.0.0/0'] },
      metadata: { 'conexus-probe': '3l-a-private-preview' },
    });
    assert.ok(sandbox.trafficAccessToken);
    await sandbox.files.write(
      '/tmp/conexus-preview-server.cjs',
      `const http=require('node:http');const crypto=require('node:crypto');\n` +
        `const s=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/plain'});res.end('conexus-preview-ok');});\n` +
        `s.on('upgrade',(req,socket)=>{const key=req.headers['sec-websocket-key'];` +
        `const accept=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');` +
        `socket.write('HTTP/1.1 101 Switching Protocols\\r\\nUpgrade: websocket\\r\\nConnection: Upgrade\\r\\nSec-WebSocket-Accept: '+accept+'\\r\\n\\r\\n');` +
        `const p=Buffer.from('conexus-ws-ok');socket.write(Buffer.concat([Buffer.from([0x81,p.length]),p]));});` +
        `s.listen(8080,'0.0.0.0');`,
    );
    await sandbox.commands.run('node /tmp/conexus-preview-server.cjs', { background: true });
    const host = sandbox.getHost(8080);
    const authenticatedReady = await waitForPrivateHttp(host, sandbox.trafficAccessToken);
    assert.equal(await authenticatedReady.text(), 'conexus-preview-ok');

    const anonymous = await fetch(`https://${host}/`, { signal: AbortSignal.timeout(5_000) });
    assert.equal(anonymous.status, 403, 'anonymous preview access must fail closed');

    const authenticated = await fetch(`https://${host}/`, {
      headers: { 'e2b-traffic-access-token': sandbox.trafficAccessToken },
      signal: AbortSignal.timeout(5_000),
    });
    assert.equal(authenticated.status, 200);
    assert.equal(await authenticated.text(), 'conexus-preview-ok');

    const upgraded = await websocketUpgrade(host, sandbox.trafficAccessToken);
    assert.match(upgraded, /101 Switching Protocols/);
    assert.match(upgraded, /conexus-ws-ok/);
  } finally {
    await killSandbox(sandbox);
  }
});

test('A2-QUIESCENCE-01: cancel, residual child/deferred writers, facility inventory and teardown are observable and controllable', async () => {
  const adapter = new ConexusWriteE2BSandbox({
    id: `conexus-3l-a-quiescence-${crypto.randomUUID().slice(0, 8)}`,
    template: QUALIFIED_TEMPLATE_ID,
    apiKey,
    timeout: timeoutMs,
    network: { allowPublicTraffic: false, denyOut: ['0.0.0.0/0'] },
  });
  let physicalId;
  let cancelChildPid;
  let deferredPid;

  try {
    await adapter.ensureRunning();
    physicalId = adapter.e2b.sandboxId;

    const controller = new AbortController();
    const tracked = await adapter.processes.spawn(
      "sh -c 'sleep 60 & child=$!; echo $child > /tmp/conexus-cancel-child.pid; wait $child'",
      { abortSignal: controller.signal },
    );
    cancelChildPid = Number((await readFileEventually(adapter.e2b, '/tmp/conexus-cancel-child.pid')).trim());
    assert.ok(Number.isInteger(cancelChildPid) && cancelChildPid > 1);

    const trackedResultPromise = tracked.wait();
    controller.abort();
    const trackedResult = await Promise.race([
      trackedResultPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('tracked cancellation did not finish')), 5_000)),
    ]);
    assert.equal(trackedResult.success, false, 'abort signal must terminate the tracked command');

    const cancelChildAlive = await processAlive(adapter.e2b, cancelChildPid);
    if (cancelChildAlive) {
      const ps = await adapter.e2b.commands.run(`ps -o pid=,ppid=,stat=,args= -p ${cancelChildPid}`);
      assert.match(ps.stdout, new RegExp(String(cancelChildPid)), 'surviving child must be visible to process-table inspection');
      await adapter.e2b.commands.run(`kill ${cancelChildPid}`).catch(() => undefined);
    }

    const deferred = await adapter.e2b.commands.run(
      "sh -c 'nohup sh -c \"sleep 4; printf late > /tmp/conexus-deferred.txt\" >/tmp/conexus-deferred.log 2>&1 & echo $!'",
    );
    deferredPid = Number(deferred.stdout.trim());
    assert.ok(Number.isInteger(deferredPid) && deferredPid > 1);
    const deferredPs = await adapter.e2b.commands.run(`ps -o pid=,ppid=,stat=,args= -p ${deferredPid}`);
    assert.match(deferredPs.stdout, new RegExp(String(deferredPid)), 'self-daemonized deferred writer must be visible before reuse');

    const facilities = await adapter.e2b.commands.run(
      [
        "for c in crontab atq systemctl; do if command -v $c >/dev/null 2>&1; then echo $c=present; else echo $c=absent; fi; done",
        "echo PID1=$(ps -p 1 -o comm=)",
        "if command -v crontab >/dev/null 2>&1; then crontab -l 2>&1 || true; fi",
        "if command -v atq >/dev/null 2>&1; then atq 2>&1 || true; fi",
        "if command -v systemctl >/dev/null 2>&1; then systemctl list-timers --all --no-pager 2>&1 | head -80 || true; fi",
      ].join('; '),
    );
    console.log(`A2_QUIESCENCE_FACILITIES=${JSON.stringify(facilities.stdout.trim().split('\n'))}`);

    await adapter.e2b.commands.run(`kill ${deferredPid}`);
    await new Promise(resolve => setTimeout(resolve, 4_500));
    const deferredDidNotFire = await adapter.e2b.commands.run('test ! -e /tmp/conexus-deferred.txt');
    assert.equal(deferredDidNotFire.exitCode, 0, 'quiescence cleanup must prevent deferred mutation after terminal boundary');

    await adapter._destroy();
    assert.equal(await waitProviderGone(physicalId), true, 'destroy must remove the physical sandbox from provider inventory');
    physicalId = undefined;
  } finally {
    if (physicalId) await Sandbox.kill(physicalId, { apiKey }).catch(() => undefined);
  }
});

test('A2-SHARE-01: exact git bundle reaches runner-side custody and remains verifiable after sandbox loss', async () => {
  let sandbox;
  let sandboxId;
  let quarantineRoot;

  try {
    sandbox = await createQualified({
      network: { allowPublicTraffic: false, denyOut: ['0.0.0.0/0'] },
      metadata: { 'conexus-probe': '3l-a-share-custody' },
    });
    sandboxId = sandbox.sandboxId;

    await sandbox.commands.run(
      [
        'set -eu',
        'rm -rf /tmp/conexus-share-repo',
        'mkdir -p /tmp/conexus-share-repo',
        'cd /tmp/conexus-share-repo',
        'git init -q -b main',
        "git config user.name 'Conexus Qualification'",
        "git config user.email 'qualification@invalid.local'",
        "printf 'base\\n' > app.txt",
        'git add app.txt',
        "git commit -q -m 'base'",
      ].join(' && '),
    );
    const baseSha = (await sandbox.commands.run('cd /tmp/conexus-share-repo && git rev-parse HEAD')).stdout.trim();

    await sandbox.commands.run(
      [
        'set -eu',
        'cd /tmp/conexus-share-repo',
        "printf 'result\\n' > app.txt",
        "printf 'candidate\\n' > result.txt",
        'git add app.txt result.txt',
        "git commit -q -m 'result'",
        'git bundle create /tmp/conexus-share.bundle main',
      ].join(' && '),
    );
    const resultSha = (await sandbox.commands.run('cd /tmp/conexus-share-repo && git rev-parse HEAD')).stdout.trim();
    const resultTreeSha = (
      await sandbox.commands.run("cd /tmp/conexus-share-repo && git rev-parse 'HEAD^{tree}'")
    ).stdout.trim();

    const bundleBytes = await sandbox.files.read('/tmp/conexus-share.bundle', { format: 'bytes' });
    assert.ok(bundleBytes.byteLength > 0);
    const bundleSha256 = crypto.createHash('sha256').update(bundleBytes).digest('hex');

    // Custody now exists outside disposable runtime state. Only after this point do we destroy the VM.
    await sandbox.kill();
    sandbox = undefined;
    assert.equal(await waitProviderGone(sandboxId), true);

    quarantineRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'conexus-3l-a-quarantine-'));
    const bundlePath = path.join(quarantineRoot, 'share.bundle');
    const bareRepo = path.join(quarantineRoot, 'quarantine.git');
    fs.writeFileSync(bundlePath, Buffer.from(bundleBytes));
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(bundlePath)).digest('hex'), bundleSha256);

    execFileSync('git', ['init', '--bare', '--quiet', bareRepo]);
    execFileSync('git', ['--git-dir', bareRepo, 'fetch', '--quiet', bundlePath, 'main:refs/quarantine/candidate']);
    const importedSha = execFileSync('git', ['--git-dir', bareRepo, 'rev-parse', 'refs/quarantine/candidate'], {
      encoding: 'utf8',
    }).trim();
    const importedTree = execFileSync(
      'git',
      ['--git-dir', bareRepo, 'rev-parse', 'refs/quarantine/candidate^{tree}'],
      { encoding: 'utf8' },
    ).trim();
    const changedPaths = execFileSync('git', ['--git-dir', bareRepo, 'diff', '--name-only', baseSha, resultSha], {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean)
      .sort();

    assert.equal(importedSha, resultSha);
    assert.equal(importedTree, resultTreeSha);
    assert.deepEqual(changedPaths, ['app.txt', 'result.txt']);

    console.log(
      `A2_SHARE_EVIDENCE=${JSON.stringify({
        qualifiedTemplateId: QUALIFIED_TEMPLATE_ID,
        qualifiedTemplateDigestSha256: QUALIFIED_TEMPLATE_DIGEST,
        baseSha,
        resultSha,
        resultTreeSha,
        bundleSha256,
        bundleBytes: bundleBytes.byteLength,
        changedPaths,
        verifiedAfterSandboxLoss: true,
      })}`,
    );
  } finally {
    await killSandbox(sandbox);
    if (sandboxId) await Sandbox.kill(sandboxId, { apiKey }).catch(() => undefined);
    if (quarantineRoot) fs.rmSync(quarantineRoot, { recursive: true, force: true });
  }
});
