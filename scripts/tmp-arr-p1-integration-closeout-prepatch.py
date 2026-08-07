from pathlib import Path

p = Path('scripts/test-documentation-tooling.mjs')
s = p.read_text()
replacements = {
    "assert.match(statusText, /PR #24 merge \\/ integration:[^\\n]*NOT AUTHORIZED/u, 'STATUS must keep P1 integration separately gated');":
        "assert.match(statusText, /PR #24 merge \\/ integration:[^\\n]*COMPLETE[^\\n]*def9e5fe819f76950d61fba2cf5abcda1533c07f/u, 'STATUS must bind completed P1 integration to the real merge commit');",
    "assert.match(arrReviewText, /P1 \\/ GATE-R[^\\n]*ACCEPTED — D-017/u, 'ARR review must close GATE-R');":
        "assert.match(arrReviewText, /P1 \\/ GATE-R[^\\n]*ACCEPTED \\/ INTEGRATED — D-017/u, 'ARR review must record integrated GATE-R');",
}
for old, new in replacements.items():
    if old not in s:
        raise SystemExit(f'missing stale tracking assertion: {old}')
    s = s.replace(old, new, 1)
p.write_text(s)
