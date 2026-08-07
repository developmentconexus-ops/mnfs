from pathlib import Path

p = Path('scripts/test-documentation-tooling.mjs')
s = p.read_text()
old = "assert.match(statusText, /PR #24 merge \\/ integration:[^\\n]*NOT AUTHORIZED/u, 'STATUS must keep P1 integration separately gated');"
new = "assert.match(statusText, /PR #24 merge \\/ integration:[^\\n]*COMPLETE[^\\n]*def9e5fe819f76950d61fba2cf5abcda1533c07f/u, 'STATUS must bind completed P1 integration to the real merge commit');"
if old not in s:
    raise SystemExit('missing stale integration-gate assertion')
p.write_text(s.replace(old, new, 1))
