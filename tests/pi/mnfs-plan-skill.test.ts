import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const SKILL_PATH = join(process.cwd(), '.pi', 'skills', 'mnfs-plan', 'SKILL.md');
const REFERENCE_PATH = join(process.cwd(), '.pi', 'skills', 'mnfs-plan', 'references', 'plan-schema.md');

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

function frontmatter(source: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  assert.ok(match, 'skill must start with YAML frontmatter');
  const body = match[1];
  assert.ok(body !== undefined);
  return Object.fromEntries(
    body.split('\n').map((line) => {
      const separator = line.indexOf(':');
      assert.notEqual(separator, -1, `invalid frontmatter line: ${line}`);
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }),
  );
}

test('mnfs-plan is a discoverable project-local Pi skill with bounded instructions', () => {
  const skill = read(SKILL_PATH);
  const metadata = frontmatter(skill);

  assert.equal(metadata.name, 'mnfs-plan');
  assert.match(metadata.description ?? '', /mission plan/i);
  assert.match(metadata.description ?? '', /Lavish/i);
  assert.ok((metadata.description ?? '').length <= 1024);
  assert.ok(skill.split('\n').length <= 180, 'keep progressive-disclosure instructions concise');
  assert.match(skill, /references\/plan-schema\.md/);
});

test('mnfs-plan enforces the complete hash-bound planning loop', () => {
  const skill = read(SKILL_PATH);
  const requiredMarkers = [
    'node bin/mnfs.mjs status --json',
    'node bin/mnfs.mjs plan show --mission',
    'node bin/mnfs.mjs plan save --mission',
    '--expected-hash',
    'node bin/mnfs.mjs plan open --mission',
    'node bin/mnfs.mjs plan poll --mission',
    'node bin/mnfs.mjs plan approve --mission',
    'MNFS_APPROVE_PLAN mission=<mission-id> hash=<current-hash>',
    'PLAN_REVISION_CONFLICT',
    'PLAN_BLOCKED',
  ];

  for (const marker of requiredMarkers) {
    assert.equal(skill.includes(marker), true, `missing workflow marker: ${marker}`);
  }

  assert.match(skill, /Never edit the rendered HTML/i);
  assert.match(skill, /Never write directly to SQLite/i);
  assert.match(skill, /Do not start implementation/i);
  assert.match(skill, /user-ended|operator ended|session is ended/i);
});

test('plan schema reference documents every authoritative field and invariant', () => {
  const reference = read(REFERENCE_PATH);
  for (const marker of [
    'schemaVersion',
    'missionId',
    'successCriteria',
    'scope',
    'assumptions',
    'milestones',
    'features',
    'acceptanceCriteria',
    'risks',
    'questions',
    'dependsOn',
    'ANSWERED',
    'OPEN',
  ]) {
    assert.equal(reference.includes(marker), true, `missing schema marker: ${marker}`);
  }

  assert.match(reference, /full JSON document/i);
  assert.match(reference, /unique/i);
  assert.match(reference, /cycle/i);
  assert.match(reference, /blocking/i);
});
