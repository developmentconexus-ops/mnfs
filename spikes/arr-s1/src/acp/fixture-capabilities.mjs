import { readFile, writeFile } from 'node:fs/promises';

function clone(value) {
  return structuredClone(value);
}

function requireFixture(fixture) {
  if (!fixture || typeof fixture !== 'object') throw new TypeError('ACP fixture capabilities require a fixture');
  for (const key of ['workspacePath', 'nonceRelativePath', 'targetRelativePath', 'nonce', 'expectedTree']) {
    if (typeof fixture[key] !== 'string' && key !== 'expectedTree') throw new TypeError(`ACP fixture is missing ${key}`);
  }
}

function absolutePath(fixture, relativePath) {
  return `${fixture.workspacePath}/${relativePath}`;
}

function logicalNonce(content, fixture) {
  const value = String(content).trim();
  return value.startsWith('NONCE=') ? value.slice('NONCE='.length) : value;
}

export function createAcpFixtureCapabilities(fixture, { readTextFile: readOverride, writeTextFile: writeOverride } = {}) {
  requireFixture(fixture);
  const rawCalls = [];
  const expectedNoncePath = absolutePath(fixture, fixture.nonceRelativePath);
  const expectedTargetPath = absolutePath(fixture, fixture.targetRelativePath);

  const readTextFile = async (params = {}) => {
    if (params.path !== expectedNoncePath) throw new Error('ACP fixture nonce path is invalid');
    const content = readOverride
      ? await readOverride(params)
      : await readFile(expectedNoncePath, 'utf8');
    const response = { content: String(content) };
    rawCalls.push({ method: 'fs/read_text_file', params: clone(params), response: clone(response) });
    return response;
  };

  const writeTextFile = async (params = {}) => {
    if (params.path !== expectedTargetPath) throw new Error('ACP fixture result path is invalid');
    if (typeof params.content !== 'string') throw new TypeError('ACP fixture write content is required');
    if (writeOverride) await writeOverride(params);
    else await writeFile(expectedTargetPath, params.content, { mode: 0o600 });
    const response = {};
    rawCalls.push({ method: 'fs/write_text_file', params: clone(params), response: clone(response) });
    return response;
  };

  return Object.freeze({
    clientCapabilities: Object.freeze({
      fs: Object.freeze({ readTextFile: true, writeTextFile: true }),
    }),
    handlers: Object.freeze({
      'fs/read_text_file': readTextFile,
      'fs/write_text_file': writeTextFile,
    }),
    rawCalls() {
      return rawCalls.map(clone);
    },
    logicalToolCalls() {
      return rawCalls.flatMap((call) => {
        if (call.method === 'fs/read_text_file') {
          return [{
            id: 'read_nonce_file',
            path: fixture.nonceRelativePath,
            value: logicalNonce(call.response.content, fixture),
          }];
        }
        if (call.method === 'fs/write_text_file') {
          return [{
            id: 'edit_result_file',
            path: fixture.targetRelativePath,
            content: call.params.content,
          }];
        }
        return [];
      });
    },
  });
}
