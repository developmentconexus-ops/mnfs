import test from 'node:test';
import assert from 'node:assert/strict';
import { Agent } from '@mastra/core/agent';

function deterministicLocalModel(identity, invocations) {
  return {
    specificationVersion: 'v2',
    provider: 'conexus-local-fixture',
    modelId: identity,
    supportedUrls: {},
    async doGenerate() {
      invocations.push(identity);
      return {
        content: [{ type: 'text', text: identity }],
        finishReason: 'stop',
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        warnings: []
      };
    },
    async doStream() {
      throw new Error('BT-1 uses only deterministic generate()');
    }
  };
}

function projection(identity, invocations) {
  return {
    identity,
    agent: new Agent({
      id: `bt1-${identity}`,
      name: `BT-1 ${identity}`,
      instructions: `Return the code-defined ${identity} identity.`,
      model: deterministicLocalModel(identity, invocations),
      editor: false
    })
  };
}

test('BT-1 negative control detects mutable instance substitution', () => {
  const invocations = [];
  const oldExact = projection('oldExact', invocations);
  const newMutable = projection('newMutable', invocations);
  let mutableCurrent = newMutable;
  const deliberatelyMutableSelector = () => mutableCurrent;

  assert.equal(deliberatelyMutableSelector(), newMutable);
  assert.equal(deliberatelyMutableSelector().identity, 'newMutable');

  mutableCurrent = oldExact;
  assert.equal(deliberatelyMutableSelector(), oldExact);
});

test('BT-1 governed path invokes only the exact direct Agent with Editor closed', async () => {
  const invocations = [];
  const oldExact = projection('oldExact', invocations);
  const newMutable = projection('newMutable', invocations);

  const governedSelected = oldExact;
  const output = await governedSelected.agent.generate('identify the selected projection');

  assert.equal(governedSelected, oldExact);
  assert.equal(output.text, 'oldExact');
  assert.deepEqual(invocations, ['oldExact']);
  assert.equal(invocations.includes(newMutable.identity), false);
  assert.equal(oldExact.agent.__getEditorConfig(), false);
  assert.equal(newMutable.agent.__getEditorConfig(), false);
});
