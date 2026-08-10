import { readFile, writeFile } from 'node:fs/promises';

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function emptyResources() {
  return {
    extensions: [],
    skills: [],
    prompts: [],
    themes: [],
    agentsFiles: [],
  };
}

class DefaultResourceLoader {
  constructor() {}
  getExtensions() { return emptyResources(); }
  getSkills() { return emptyResources(); }
  getPrompts() { return emptyResources(); }
  getThemes() { return emptyResources(); }
  getAgentsFiles() { return emptyResources(); }
  getSystemPrompt() { return ''; }
  getSystemPromptSource() { return null; }
  getAppendSystemPrompt() { return ''; }
  getAppendSystemPromptSources() { return []; }
  extendResources() {}
  async reload() {}
}

class SettingsManager {
  static inMemory() { return new SettingsManager(); }
}

class SessionManager {
  static inMemory(cwd) { return new SessionManager(cwd); }
  constructor(cwd) { this.cwd = cwd; }
}

function createSession({ cwd, customTools = [] }) {
  const subscribers = new Set();
  let disposed = false;
  let aborted = false;
  const sessionId = `sdk-fixture-${cwd}`;
  const emit = (event) => {
    for (const subscriber of subscribers) subscriber(event);
  };
  const tool = (name) => customTools.find((item) => item?.name === name);

  return {
    sessionId,
    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    async prompt() {
      if (disposed) throw new Error('fixture runtime session is disposed');
      await wait(100);
      if (aborted) {
        emit({ type: 'agent_end', willRetry: false });
        return { status: 'CANCELLED', outcome: 'CANCELLED' };
      }
      const read = tool('read_nonce_file');
      const edit = tool('edit_result_file');
      if (typeof read?.execute !== 'function' || typeof edit?.execute !== 'function') {
        throw new Error('fixture runtime requires the supported custom tool API');
      }
      emit({ type: 'agent_start' });
      emit({ type: 'turn_start' });
      emit({ type: 'tool_execution_start', toolCallId: 'fixture-read', toolName: 'read_nonce_file', args: { path: 'fixture/nonce.txt' } });
      const nonceResult = await read.execute('fixture-read', { path: 'fixture/nonce.txt' });
      emit({ type: 'tool_execution_end', toolCallId: 'fixture-read', toolName: 'read_nonce_file', result: nonceResult, isError: false });
      emit({ type: 'tool_execution_start', toolCallId: 'fixture-edit', toolName: 'edit_result_file', args: { path: 'result.txt' } });
      const nonce = nonceResult?.content?.[0]?.text;
      const editResult = await edit.execute('fixture-edit', { path: 'result.txt', nonce });
      emit({ type: 'tool_execution_end', toolCallId: 'fixture-edit', toolName: 'edit_result_file', result: editResult, isError: false });
      emit({
        type: 'message_end',
        message: {
          role: 'assistant',
          provider: 'fixture-provider',
          model: 'fixture-model',
          authMethodClass: 'local-double',
          stopReason: process.env.MNFS_FIXTURE_AUTH_OUTCOME === 'failure' ? 'error' : 'stop',
        },
      });
      emit({ type: 'turn_end', message: { role: 'assistant' } });
      emit({ type: 'agent_end', willRetry: false });
      return { status: 'COMPLETED', outcome: 'COMPLETED' };
    },
    async abort() {
      aborted = true;
    },
    dispose() {
      disposed = true;
      subscribers.clear();
    },
  };
}

export function createAgentSession(options) {
  return createSession(options);
}

export { DefaultResourceLoader, SettingsManager, SessionManager };
