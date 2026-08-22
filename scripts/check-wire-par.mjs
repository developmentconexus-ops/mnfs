import fs from 'node:fs';

const oas = JSON.parse(fs.readFileSync('/tmp/conexus-product-openapi.bundle.json', 'utf8'));
const methods = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace']);
const operations = new Map();

for (const [path, pathItem] of Object.entries(oas.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem ?? {})) {
    if (!methods.has(method)) continue;
    const id = operation?.['x-conexus-4a-id'];
    if (id) operations.set(id, { path, method: method.toUpperCase(), operation, pathItem });
    if (/^(Stream|Resume|Observe|Retry|Execute)Agent/i.test(operation?.operationId ?? '')) {
      throw new Error(`${operation.operationId} must remain runtime/technical mechanics, not a caller Product operation`);
    }
  }
}

const expectedIds = Array.from({ length: 16 }, (_, index) => `PAR-${String(index + 1).padStart(2, '0')}`);
for (const id of expectedIds) {
  const value = operations.get(id);
  if (!value) throw new Error(`Product Agent Runtime schema closure missing operation ${id}`);
  if (value.operation['x-conexus-contract-state'] !== 'SCHEMA_CLOSED') throw new Error(`${id} is not SCHEMA_CLOSED`);
  for (const response of Object.values(value.operation.responses ?? {})) {
    if (response?.['x-conexus-provisional'] === true) throw new Error(`${id} still has provisional response authority`);
  }
}

function entry(id) {
  const value = operations.get(id);
  if (!value) throw new Error(`missing operation ${id}`);
  return value;
}

function op(id) {
  return entry(id).operation;
}

function resolveLocalRef(value) {
  if (!value?.$ref || !value.$ref.startsWith('#/')) return value;
  return value.$ref
    .slice(2)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((node, part) => node?.[part], oas);
}

function resolveSchema(schema) {
  let current = schema;
  const seen = new Set();
  while (current?.$ref?.startsWith('#/')) {
    if (seen.has(current.$ref)) throw new Error(`schema ref cycle while checking ${current.$ref}`);
    seen.add(current.$ref);
    current = resolveLocalRef(current);
  }
  return current;
}

function resolvedParameters(id) {
  const value = entry(id);
  const parameters = new Map();
  for (const candidate of [...(value.pathItem.parameters ?? []), ...(value.operation.parameters ?? [])]) {
    const resolved = resolveLocalRef(candidate);
    parameters.set(`${resolved?.in}\0${resolved?.name}`, resolved);
  }
  return [...parameters.values()];
}

function parameter(id, where, name) {
  return resolvedParameters(id).find((candidate) => candidate?.in === where && candidate?.name === name);
}

function hasRequiredParameter(id, where, name) {
  return parameter(id, where, name)?.required === true;
}

function requestSchema(id) {
  return resolveSchema(op(id).requestBody?.content?.['application/json']?.schema);
}

function successSchema(id, status = '200') {
  return resolveSchema(op(id).responses?.[status]?.content?.['application/json']?.schema);
}

function assertClosedObject(schema, label) {
  const resolved = resolveSchema(schema);
  if (!resolved || resolved.type !== 'object' || resolved.additionalProperties !== false) {
    throw new Error(`${label} must be a closed object schema`);
  }
  return resolved;
}

function required(schema, ...names) {
  const set = new Set(resolveSchema(schema)?.required ?? []);
  for (const name of names) if (!set.has(name)) throw new Error(`${name} must be required`);
}

function property(schema, name) {
  return resolveSchema(resolveSchema(schema)?.properties?.[name]);
}

function assertOwnerIssuedState(schema, name, label) {
  const state = property(schema, name);
  if (state?.type !== 'string' || state?.enum) throw new Error(`${label} must remain owner-issued until exact lifecycle vocabulary is ratified`);
}

function assertEnum(schema, name, values, label) {
  const actual = [...(property(schema, name)?.enum ?? [])].sort();
  const expected = [...values].sort();
  if (actual.join(',') !== expected.join(',')) throw new Error(`${label} enum drifted: ${actual.join(',')}`);
}

function rejectProperties(schema, label, names) {
  const props = resolveSchema(schema)?.properties ?? {};
  for (const name of names) if (props[name]) throw new Error(`${label} must not expose framework/authority escape field ${name}`);
}

const runtimeEscapeFields = [
  'mastraRunId', 'toolCallId', 'threadId', 'requestContext', 'runtimeSnapshot', 'providerId',
  'provider', 'model', 'modelId', 'systemPrompt', 'instructions', 'activeTools', 'toolChoice',
  'releaseId', 'agentRevisionId', 'connectionId', 'targetUrl', 'rawReasoning'
];

// Published-App Conversation is Conexus identity. Mastra thread/runtime identity stays private.
const conversation = assertClosedObject(successSchema('PAR-02'), 'PAR-02 success');
required(conversation, 'conversationId', 'projectId', 'agentId', 'messages');
rejectProperties(conversation, 'PAR-02 Conversation', ['threadId', 'mastraThreadId', 'runtimeSnapshot', 'providerId']);
const messages = property(conversation, 'messages');
if (messages?.type !== 'array' || !messages.items) throw new Error('PAR-02 messages must be a user-visible Conversation history');
const message = assertClosedObject(messages.items, 'PAR-02 ConversationMessage');
required(message, 'messageId', 'role', 'text');
assertEnum(message, 'role', ['USER', 'AGENT'], 'ConversationMessage role');

if (!hasRequiredParameter('PAR-03', 'header', 'Idempotency-Key')) throw new Error('PAR-03 must require Idempotency-Key');
const createConversation = requestSchema('PAR-03');
if (createConversation) {
  const body = assertClosedObject(createConversation, 'PAR-03 request');
  if (Object.keys(body.properties ?? {}).length !== 0) throw new Error('PAR-03 must not accept caller-defined Conversation/runtime configuration');
}
const createdConversation = assertClosedObject(successSchema('PAR-03', '201'), 'PAR-03 success');
required(createdConversation, 'conversationId', 'projectId', 'agentId', 'messages');
rejectProperties(createdConversation, 'PAR-03 Conversation', runtimeEscapeFields);

// Interactive turn intake admits an exact owner AgentRun and returns immediately; stream transport remains a technical projection.
if (!hasRequiredParameter('PAR-04', 'header', 'Idempotency-Key')) throw new Error('PAR-04 must require Idempotency-Key');
if (op('PAR-04')['x-conexus-current-state-carrier'] !== 'IDEMPOTENCY_KEY') throw new Error('PAR-04 must preserve IDEMPOTENCY_KEY intake semantics');
const turn = assertClosedObject(requestSchema('PAR-04'), 'PAR-04 request');
required(turn, 'text');
if (property(turn, 'text')?.type !== 'string') throw new Error('PAR-04 text must be a string');
rejectProperties(turn, 'PAR-04 request', runtimeEscapeFields);
if (turn.properties?.messages) throw new Error('PAR-04 must not accept caller-supplied full conversation history as authority');
const contextRefs = property(turn, 'contextRefs');
if (contextRefs) {
  if (contextRefs.type !== 'array' || !contextRefs.items) throw new Error('PAR-04 contextRefs must be an array');
  const contextRef = assertClosedObject(contextRefs.items, 'PAR-04 contextRef');
  required(contextRef, 'kind', 'ref');
}
const interactiveAdmission = assertClosedObject(successSchema('PAR-04', '202'), 'PAR-04 success');
required(interactiveAdmission, 'agentRunId', 'conversationId', 'projectId', 'agentId', 'releaseId');
rejectProperties(interactiveAdmission, 'PAR-04 admission', ['mastraRunId', 'toolCallId', 'threadId', 'runtimeSnapshot']);

// Headless invocation is the same Product Agent concept under separate authority, not a second runtime model.
if (!hasRequiredParameter('PAR-05', 'header', 'Idempotency-Key')) throw new Error('PAR-05 must require Idempotency-Key');
const headless = assertClosedObject(requestSchema('PAR-05'), 'PAR-05 request');
required(headless, 'input');
const headlessInput = property(headless, 'input');
if (headlessInput?.type !== 'object' || headlessInput?.['x-conexus-schema-source'] !== 'RELEASE_AGENT_INTERACTION') {
  throw new Error('PAR-05 input must be validated from the exact Release-pinned Agent interaction contract');
}
rejectProperties(headless, 'PAR-05 request', runtimeEscapeFields);
const headlessAdmission = assertClosedObject(successSchema('PAR-05', '202'), 'PAR-05 success');
required(headlessAdmission, 'agentRunId', 'projectId', 'agentId', 'releaseId');
rejectProperties(headlessAdmission, 'PAR-05 admission', ['mastraRunId', 'toolCallId', 'threadId', 'runtimeSnapshot']);

// AgentRun is PAR owner truth; runtime finish/stream close never implies external-effect success.
const agentRun = assertClosedObject(successSchema('PAR-07'), 'PAR-07 success');
required(agentRun, 'agentRunId', 'projectId', 'agentId', 'releaseId', 'origin', 'runState');
assertEnum(agentRun, 'origin', ['INTERACTIVE', 'HEADLESS', 'SCHEDULE'], 'AgentRun origin');
assertOwnerIssuedState(agentRun, 'runState', 'AgentRun runState');
rejectProperties(agentRun, 'PAR-07 AgentRun', ['mastraRunId', 'threadId', 'toolCallId', 'allEffectsSucceeded', 'overallSuccess', 'effectsSucceeded']);
const runOutput = property(agentRun, 'output');
if (runOutput && (runOutput.type !== 'object' || runOutput['x-conexus-schema-source'] !== 'RELEASE_AGENT_OUTPUT')) {
  throw new Error('PAR-07 output must remain an exact Release-pinned Agent output projection');
}

// Approval queue is current-eligibility Product authority; Mastra HITL is only pause/resume mechanics.
const approval = assertClosedObject(successSchema('PAR-09'), 'PAR-09 success');
required(approval, 'approvalRequestId', 'projectId', 'agentRunId', 'proposalRef', 'proposalDigest', 'approvalState', 'proposal');
assertOwnerIssuedState(approval, 'approvalState', 'ApprovalRequest approvalState');
rejectProperties(approval, 'PAR-09 ApprovalRequest', ['mastraRunId', 'toolCallId', 'threadId', 'requestContext']);
const sealedProposal = property(approval, 'proposal');
if (sealedProposal?.type !== 'object' || sealedProposal?.['x-conexus-schema-source'] !== 'SEALED_APPROVAL_PROPOSAL') {
  throw new Error('PAR-09 proposal must project the exact sealed approval subject');
}

if (op('PAR-10')['x-conexus-current-state-carrier'] !== 'EXPLICIT_SEALED_SUBJECT') throw new Error('PAR-10 must preserve EXPLICIT_SEALED_SUBJECT');
if (parameter('PAR-10', 'header', 'If-Match')) throw new Error('PAR-10 must not use false command-subresource If-Match');
if (op('PAR-10')['x-conexus-effect-fence'] !== 'OWNER_GATEWAY_IC4') throw new Error('PAR-10 must preserve owner/Gateway IC4 effect fence');
const decision = assertClosedObject(requestSchema('PAR-10'), 'PAR-10 request');
required(decision, 'decision', 'expectedSubjectDigest');
assertEnum(decision, 'decision', ['ALLOW_ONCE', 'DENY'], 'PAR-10 decision');
for (const forbidden of ['proposal', 'args', 'tool', 'operation', 'connectionId', 'targetUrl', 'effectPayload', 'EXPIRED', 'STALE']) {
  if (decision.properties?.[forbidden]) throw new Error(`PAR-10 must not allow caller to replace/forge sealed approval subject via ${forbidden}`);
}

// F1 trigger authoring admits only bounded SCHEDULE semantics; native scheduler mechanics remain substrate.
const trigger = assertClosedObject(successSchema('PAR-12'), 'PAR-12 success');
required(trigger, 'triggerId', 'projectId', 'agentId', 'triggerRevisionId', 'triggerKind', 'schedule', 'triggerState');
assertEnum(trigger, 'triggerKind', ['SCHEDULE'], 'AgentTrigger kind');
assertOwnerIssuedState(trigger, 'triggerState', 'AgentTrigger triggerState');
const schedule = assertClosedObject(property(trigger, 'schedule'), 'AgentTrigger schedule');
required(schedule, 'cron', 'timeZone');
if (property(schedule, 'cron')?.type !== 'string' || property(schedule, 'timeZone')?.type !== 'string') throw new Error('AgentTrigger schedule must use cron + IANA timeZone strings');
rejectProperties(trigger, 'AgentTrigger', ['threadId', 'resourceId', 'providerOptions', 'prompt', 'model', 'metadata']);

if (!hasRequiredParameter('PAR-13', 'header', 'Idempotency-Key')) throw new Error('PAR-13 must require Idempotency-Key');
const createTrigger = assertClosedObject(requestSchema('PAR-13'), 'PAR-13 request');
required(createTrigger, 'schedule');
rejectProperties(createTrigger, 'PAR-13 request', ['enabled', 'status', 'prompt', 'threadId', 'resourceId', 'providerOptions', 'metadata', 'model']);
const createSchedule = assertClosedObject(property(createTrigger, 'schedule'), 'PAR-13 schedule');
required(createSchedule, 'cron', 'timeZone');

if (op('PAR-14')['x-conexus-current-state-carrier'] !== 'IF_MATCH') throw new Error('PAR-14 must remain the literal PAR If-Match operation');
if (!hasRequiredParameter('PAR-14', 'header', 'If-Match')) throw new Error('PAR-14 must require If-Match');
const reviseTrigger = assertClosedObject(requestSchema('PAR-14'), 'PAR-14 request');
required(reviseTrigger, 'schedule');
rejectProperties(reviseTrigger, 'PAR-14 request', ['enabled', 'status', 'prompt', 'threadId', 'resourceId', 'providerOptions', 'metadata', 'model']);

if (op('PAR-15')['x-conexus-current-state-carrier'] !== 'EXPLICIT_TRIGGER_REVISION') throw new Error('PAR-15 must preserve EXPLICIT_TRIGGER_REVISION');
if (parameter('PAR-15', 'header', 'If-Match')) throw new Error('PAR-15 must not use command-subresource If-Match');
const enable = assertClosedObject(requestSchema('PAR-15'), 'PAR-15 request');
required(enable, 'expectedTriggerRevisionId');

if (op('PAR-16')['x-conexus-current-state-carrier'] !== 'OWNER_CURRENT') throw new Error('PAR-16 must remain an owner-current narrowing command');
if (requestSchema('PAR-16')) throw new Error('PAR-16 narrowing disable must not require caller-supplied widening/configuration input');

console.log('Product Agent Runtime schema closure passed (16 operations; Conversation/AgentRun/approval/trigger owner boundaries closed and stream mechanics kept technical).');
