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

function updateFrom(message) {
  return message?.notification?.update ?? message?.update ?? message?.params?.update ?? null;
}

function pathFromTool(update) {
  const input = update?.rawInput ?? update?.input ?? {};
  const pathValue = input.path ?? input.filePath ?? input.file_path;
  if (typeof pathValue === 'string') return pathValue;
  return update?.locations?.find((location) => typeof location?.path === 'string')?.path ?? null;
}

function textFromOutput(output) {
  if (typeof output === 'string') return output;
  if (typeof output?.text === 'string') return output.text;
  if (Array.isArray(output?.content)) return output.content.find((item) => typeof item?.text === 'string')?.text ?? null;
  return null;
}

function absoluteOrRelativePath(fixture, value) {
  if (value === fixture.nonceRelativePath || value === `${fixture.workspacePath}/${fixture.nonceRelativePath}`) return fixture.nonceRelativePath;
  if (value === fixture.targetRelativePath || value === `${fixture.workspacePath}/${fixture.targetRelativePath}`) return fixture.targetRelativePath;
  return null;
}

function logicalOperation(update, relativePath, fixture) {
  const operation = String(update?.title ?? update?.name ?? update?.kind ?? '').toLowerCase();
  if (relativePath === fixture?.nonceRelativePath || /read/u.test(operation)) return 'read_nonce_file';
  if (/edit|write/u.test(operation)) return 'edit_result_file';
  return relativePath === fixture?.targetRelativePath ? 'edit_result_file' : null;
}

export function translateAcpLogicalFixtureCalls(rawEvents = [], fixture) {
  const pending = new Map();
  const calls = [];
  for (const message of rawEvents ?? []) {
    const update = updateFrom(message);
    if (!update || typeof update !== 'object') continue;
    const id = update.toolCallId;
    if (typeof id !== 'string' || id.length === 0) continue;
    if (update.sessionUpdate === 'tool_call') {
      pending.set(id, structuredClone(update));
      if (update.rawOutput !== undefined) {
        const relativePath = absoluteOrRelativePath(fixture, pathFromTool(update));
        const operation = logicalOperation(update, relativePath, fixture);
        if (operation === 'read_nonce_file') calls.push({ id: operation, path: fixture.nonceRelativePath, value: logicalNonce(textFromOutput(update.rawOutput) ?? '', fixture) });
        if (operation === 'edit_result_file') calls.push({ id: operation, path: fixture.targetRelativePath, content: update.rawInput?.content ?? update.rawInput?.text ?? textFromOutput(update.rawOutput) });
      }
      continue;
    }
    if (update.sessionUpdate !== 'tool_call_update') continue;
    const start = pending.get(id) ?? {};
    pending.delete(id);
    const relativePath = absoluteOrRelativePath(fixture, pathFromTool(start));
    const operation = logicalOperation(start, relativePath, fixture);
    if (operation === 'read_nonce_file') {
      calls.push({ id: operation, path: fixture.nonceRelativePath, value: logicalNonce(textFromOutput(update.rawOutput ?? update.output ?? update.content) ?? '', fixture) });
    } else if (operation === 'edit_result_file') {
      calls.push({
        id: operation,
        path: fixture.targetRelativePath,
        content: start.rawInput?.content ?? start.rawInput?.text ?? textFromOutput(update.rawOutput ?? update.output ?? update.content),
      });
    }
  }
  return calls;
}

function permissionToolCall(input) {
  return input?.toolCall ?? input?.request?.toolCall ?? input ?? {};
}

function permissionPath(toolCall) {
  const input = toolCall?.rawInput ?? toolCall?.input ?? {};
  return input.path ?? input.filePath ?? input.file_path ?? toolCall?.locations?.find((location) => typeof location?.path === 'string')?.path ?? null;
}

function permissionOperation(toolCall) {
  return String(toolCall?.title ?? toolCall?.name ?? toolCall?.kind ?? '').toLowerCase();
}

export function createAcpFixtureCapabilities(fixture, { readTextFile: readOverride, writeTextFile: writeOverride } = {}) {
  requireFixture(fixture);
  const rawCalls = [];
  const permissionCalls = [];
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

  const requestPermission = async (params = {}) => {
    const toolCall = permissionToolCall(params);
    const pathValue = permissionPath(toolCall);
    const relativePath = absoluteOrRelativePath(fixture, pathValue);
    const operation = permissionOperation(toolCall);
    const expected = (relativePath === fixture.nonceRelativePath && /read/u.test(operation))
      || (relativePath === fixture.targetRelativePath && /edit|write/u.test(operation));
    const option = Array.isArray(params.options)
      ? params.options.find((candidate) => /allow/u.test(String(candidate?.kind ?? candidate?.name ?? '').toLowerCase()))
      : null;
    const response = expected && option?.optionId
      ? { outcome: { outcome: 'selected', optionId: option.optionId } }
      : { outcome: { outcome: 'cancelled' } };
    permissionCalls.push({
      method: 'session/request_permission',
      sessionId: params.sessionId ?? null,
      operation,
      path: pathValue,
      expected,
      allowed: response.outcome.outcome === 'selected',
      response: clone(response),
      authority: 'MNFS_PERMISSION_UI_NON_AUTHORITY',
    });
    return response;
  };

  return Object.freeze({
    clientCapabilities: Object.freeze({
      fs: Object.freeze({ readTextFile: true, writeTextFile: true }),
    }),
    handlers: Object.freeze({
      'fs/read_text_file': readTextFile,
      'fs/write_text_file': writeTextFile,
      'session/request_permission': requestPermission,
    }),
    rawCalls() {
      return rawCalls.map(clone);
    },
    logicalToolCalls({ rawEvents = [] } = {}) {
      const eventCalls = translateAcpLogicalFixtureCalls(rawEvents, fixture);
      if (eventCalls.length > 0) return eventCalls.map(clone);
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
    permissionEvidence() {
      return permissionCalls.map(clone);
    },
  });
}
