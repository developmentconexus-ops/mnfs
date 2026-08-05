#!/usr/bin/env bash
set -Eeuo pipefail

PR_HEAD='3adb12c42394cf0d54fb386b1b85d83c38f8903a'
DETERMINISTIC='680b2e55d01f76da35922675c18ef997c56403d3'
RED='a6822409e2b860de534c5fc68e9cc1ee1afb8c4d'
BRANCH='design/mis-002-m01'
REMOTE='https://github.com/developmentconexus-ops/mnfs.git'
REPO="$HOME/src/mnfs"
NODE_VERSION='v24.18.0'
GIT_VERSION='git version 2.53.0'
KERNEL='6.18.33.2-microsoft-standard-WSL2'
UBUNTU='26.04'
TREEHOUSE_VERSION='2.1.1'
TREEHOUSE_SHA='c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3'
COMMAND_SHAPE='sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84'
CONTRACT='sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3'
TMP="$(mktemp -d "${TMPDIR:-/tmp}/mnfs-task14-preflight.XXXXXX")"
trap 'rm -rf -- "$TMP"' EXIT

ok() { printf 'PASS  %s\n' "$*"; }
die() { printf 'FAIL  %s\nMNFS_WSL2_PREFLIGHT_RESULT=FAIL\n' "$*"; exit 1; }
eq() { [[ "$2" == "$3" ]] || die "$1 expected [$2], observed [$3]"; ok "$1 = $3"; }
need() { command -v "$1" >/dev/null 2>&1 || die "required command missing: $1"; }
real_tool() {
  local p r
  p="$(type -P "$1" 2>/dev/null || true)"; [[ -n "$p" ]] || die "$1 is missing from PATH"
  r="$(readlink -f -- "$p")"; [[ -f "$r" && -x "$r" ]] || die "$1 is not one executable regular file: $r"
  [[ "$r" != /mnt && "$r" != /mnt/* ]] || die "$1 resolves under /mnt: $r"
  printf '%s' "$r"
}

printf '%s\n' '=== MNFS M01 TASK 14 — CANONICAL WSL2 PREFLIGHT ==='
printf 'authorization=MNFS_AUTHORIZE_M01_TASK_14_WSL2_PREFLIGHT\n'
printf 'plan=1.0.1\nmicrodesign=0.6.1\ndeterministic=%s\nexpected_pr_head=%s\n' "$DETERMINISTIC" "$PR_HEAD"
printf 'utc_started=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf '%s\n' 'PROHIBITED: git fetch/pull/reset/checkout; treehouse get/status/return; Lease helper; Pi Worker; merge'

for cmd in git node npm pi treehouse sha256sum findmnt readlink awk grep sed stat; do need "$cmd"; done
[[ -d "$REPO" ]] || die "canonical checkout missing: $REPO"
cd -- "$REPO"
REPO_REAL="$(pwd -P)"
eq 'repository realpath' "$REPO" "$REPO_REAL"
[[ ! -L "$REPO_REAL" ]] || die 'repository path is a symlink'
[[ "$REPO_REAL" != /mnt && "$REPO_REAL" != /mnt/* ]] || die "repository is under /mnt: $REPO_REAL"
eq 'repository owner uid' "$(id -u)" "$(stat -c %u -- "$REPO_REAL")"
FSTYPE="$(findmnt -n -o FSTYPE -T "$REPO_REAL")"
case "$FSTYPE" in 9p|drvfs|fuseblk|cifs|smb3|ntfs|ntfs3) die "non-Linux-local filesystem: $FSTYPE";; esac
ok "Linux-local filesystem = $FSTYPE"

printf '\n=== Exact Git lineage — no local mutation ===\n'
eq 'Git top-level' "$REPO_REAL" "$(git rev-parse --show-toplevel)"
eq 'branch' "$BRANCH" "$(git branch --show-current)"
eq 'upstream' "origin/$BRANCH" "$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}')"
eq 'HEAD' "$PR_HEAD" "$(git rev-parse HEAD)"
eq 'HEAD parent' "$DETERMINISTIC" "$(git rev-parse HEAD^)"
eq 'deterministic parent' "$RED" "$(git rev-parse HEAD^^)"
eq 'HEAD subject' 'docs: record Task 14 deterministic evidence' "$(git show -s --format=%s HEAD)"
eq 'tracking scope' 'docs/tracking/STATUS.md' "$(git diff-tree --no-commit-id --name-only -r "$PR_HEAD" | LC_ALL=C sort)"
eq 'correction scope' $'src/services/recovery-service.ts\ntests/services/recovery-service.test.ts' "$(git diff-tree --no-commit-id --name-only -r "$DETERMINISTIC" | LC_ALL=C sort)"
git merge-base --is-ancestor "$DETERMINISTIC" "$PR_HEAD" || die 'deterministic head is not an ancestor of PR head'
[[ -z "$(git status --porcelain=v1 --untracked-files=all)" ]] || { git status --short; die 'checkout is not clean'; }
git diff --check || die 'checkout contains whitespace-error diff'
ORIGIN="$(git remote get-url origin)"
case "$ORIGIN" in https://github.com/developmentconexus-ops/mnfs|https://github.com/developmentconexus-ops/mnfs.git|git@github.com:developmentconexus-ops/mnfs.git) ok "origin = $ORIGIN";; *) die "unexpected origin: $ORIGIN";; esac
GIT_TERMINAL_PROMPT=0 git ls-remote --exit-code "$REMOTE" "refs/heads/$BRANCH" >"$TMP/remote" 2>"$TMP/remote.err" || { cat "$TMP/remote.err"; die 'read-only ls-remote failed'; }
eq 'remote branch head' "$PR_HEAD" "$(awk 'NR==1{print $1}' "$TMP/remote")"
eq 'remote branch ref' "refs/heads/$BRANCH" "$(awk 'NR==1{print $2}' "$TMP/remote")"

printf '\n=== Host and executable provenance ===\n'
eq 'kernel name' 'Linux' "$(uname -s)"
eq 'kernel release' "$KERNEL" "$(uname -r)"
OS_ID="$(. /etc/os-release; printf '%s' "$ID")"; OS_VER="$(. /etc/os-release; printf '%s' "$VERSION_ID")"
eq 'distribution' 'ubuntu' "$OS_ID"; eq 'Ubuntu release' "$UBUNTU" "$OS_VER"
NODE_BIN="$(real_tool node)"; NPM_BIN="$(real_tool npm)"; GIT_BIN="$(real_tool git)"; PI_BIN="$(real_tool pi)"; TREEHOUSE_BIN="$(real_tool treehouse)"
ok "node = $NODE_BIN"; ok "npm = $NPM_BIN"; ok "git = $GIT_BIN"; ok "pi = $PI_BIN"; ok "treehouse = $TREEHOUSE_BIN"
eq 'Node version' "$NODE_VERSION" "$(node --version)"
eq 'Git version' "$GIT_VERSION" "$(git --version)"
eq 'Treehouse executable SHA-256' "$TREEHOUSE_SHA" "$(sha256sum "$TREEHOUSE_BIN" | awk '{print $1}')"
grep -Fq "$CONTRACT" docs/tracking/STATUS.md || die 'approved contract hash missing from STATUS'
grep -Fq "sha256:$TREEHOUSE_SHA" src/cli/entry.ts || die 'Treehouse executable hash drifted in production composition'
grep -Fq "$COMMAND_SHAPE" src/adapters/treehouse.ts || die 'Treehouse command-shape hash drifted'
grep -Fq "nodeVersion: '$NODE_VERSION'" src/cli/entry.ts || die 'accepted Node provenance drifted'
grep -Fq "gitVersion: '${GIT_VERSION#git version }'" src/cli/entry.ts || die 'accepted Git provenance drifted'
grep -Fq "kernelRelease: '$KERNEL'" src/cli/entry.ts || die 'accepted kernel provenance drifted'
grep -Fq "ubuntuRelease: '$UBUNTU'" src/cli/entry.ts || die 'accepted Ubuntu provenance drifted'
ok 'frozen production provenance constants match'

printf '\n=== Isolated Treehouse version/help probes only ===\n'
mkdir -p "$TMP/home" "$TMP/xdg/treehouse" "$TMP/pool" "$TMP/hooks" "$TMP/cwd"
printf 'max_trees = 2\nroot = "%s"\n' "$TMP/pool" >"$TMP/xdg/treehouse/config.toml"
TH_PATH="$(dirname "$TREEHOUSE_BIN"):$(dirname "$GIT_BIN"):/usr/bin:/bin"
th() {
  local name="$1"; shift
  (cd "$TMP/cwd" && env -i PATH="$TH_PATH" HOME="$TMP/home" XDG_CONFIG_HOME="$TMP/xdg" LANG=C.UTF-8 LC_ALL=C.UTF-8 \
    GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 GIT_TERMINAL_PROMPT=0 GIT_OPTIONAL_LOCKS=0 GIT_NO_LAZY_FETCH=1 \
    GCM_INTERACTIVE=Never TREEHOUSE_NO_UPDATE_CHECK=1 GIT_CONFIG_COUNT=3 GIT_CONFIG_KEY_0=core.hooksPath \
    GIT_CONFIG_VALUE_0="$TMP/hooks" GIT_CONFIG_KEY_1=credential.helper GIT_CONFIG_VALUE_1= \
    GIT_CONFIG_KEY_2=core.fsmonitor GIT_CONFIG_VALUE_2=false "$TREEHOUSE_BIN" "$@" >"$TMP/$name.out" 2>"$TMP/$name.err") \
    || { cat "$TMP/$name.err"; die "Treehouse probe failed: $name"; }
  [[ "$(stat -c %s "$TMP/$name.out")" -le 65536 && "$(stat -c %s "$TMP/$name.err")" -le 65536 ]] || die "Treehouse probe exceeded output bound: $name"
  ok "Treehouse probe exited 0: $name"
}
th version --version; th get-help get --help; th status-help status --help; th return-help return --help
VERSION_RAW="$(cat "$TMP/version.out")"
[[ "$VERSION_RAW" == "$TREEHOUSE_VERSION" || "$VERSION_RAW" == "v$TREEHOUSE_VERSION" ]] || die "Treehouse version drift: $VERSION_RAW"
cat "$TMP/get-help.out" "$TMP/get-help.err" >"$TMP/get-help.all"
cat "$TMP/status-help.out" "$TMP/status-help.err" >"$TMP/status-help.all"
cat "$TMP/return-help.out" "$TMP/return-help.err" >"$TMP/return-help.all"
for flag in --lease --lease-holder --json; do grep -Fq -- "$flag" "$TMP/get-help.all" || die "get --help missing $flag"; done
grep -Fq -- '--json' "$TMP/status-help.all" || die 'status --help missing --json'
for flag in --if-lease-id --if-lease-holder; do grep -Fq -- "$flag" "$TMP/return-help.all" || die "return --help missing $flag"; done
ok "Treehouse semantic version = ${VERSION_RAW#v}"
printf 'treehouse_get_help_sha256=%s\n' "$(sha256sum "$TMP/get-help.all" | awk '{print $1}')"
printf 'treehouse_status_help_sha256=%s\n' "$(sha256sum "$TMP/status-help.all" | awk '{print $1}')"
printf 'treehouse_return_help_sha256=%s\n' "$(sha256sum "$TMP/return-help.all" | awk '{print $1}')"

printf '\n=== Exact install and full canonical gate ===\n'
npm ci >"$TMP/npm-ci.log" 2>&1 || { tail -n 160 "$TMP/npm-ci.log"; die 'npm ci failed'; }
grep -Fq 'found 0 vulnerabilities' "$TMP/npm-ci.log" || die 'npm ci did not report 0 vulnerabilities'
ok 'npm ci = PASS / 0 vulnerabilities'
printf 'npm_ci_log_sha256=%s\n' "$(sha256sum "$TMP/npm-ci.log" | awk '{print $1}')"
npm run verify >"$TMP/verify.log" 2>&1 || { tail -n 240 "$TMP/verify.log"; die 'npm run verify failed'; }
for evidence in 'tests 320' 'pass 320' 'tests 119' 'pass 119' 'tests 78' 'pass 78' 'Documentation validation passed (93 canonical IDs'; do
  grep -Fq "$evidence" "$TMP/verify.log" || die "verify evidence missing: $evidence"
done
! grep -Eq 'fail [1-9][0-9]*' "$TMP/verify.log" || die 'verify contains non-zero failure count'
ok 'Product 320/320; AS-02 119/119; TC-01 78/78; docs 93 IDs'
printf 'verify_log_sha256=%s\n' "$(sha256sum "$TMP/verify.log" | awk '{print $1}')"
grep -E '(^|[^[:alnum:]])(tests|pass|fail) (320|119|78|0)$|Documentation validation passed' "$TMP/verify.log" || true

printf '\n=== Actual MNFS doctor ===\n'
node bin/mnfs.mjs doctor --json >"$TMP/doctor.json" 2>"$TMP/doctor.err" || { cat "$TMP/doctor.err"; cat "$TMP/doctor.json"; die 'mnfs doctor failed'; }
DOCTOR="$TMP/doctor.json" EXPECTED_REPO="$REPO_REAL" node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
const r = JSON.parse(readFileSync(process.env.DOCTOR, 'utf8'));
if (r.schemaVersion !== 1 || r.ready !== true || r.environment !== 'wsl2' || r.nodeVersion !== '24.18.0' || r.cwd !== process.env.EXPECTED_REPO) throw new Error('doctor readiness identity mismatch');
if (r.missingRequired?.length || r.problems?.length) throw new Error('doctor reports a required readiness problem');
for (const name of ['git', 'pi', 'treehouse']) if (!r.tools?.some(t => t.name === name && typeof t.path === 'string' && t.path)) throw new Error(`doctor did not resolve ${name}`);
console.log(`doctor.ready=${r.ready}`); console.log(`doctor.environment=${r.environment}`); console.log(`doctor.cwd=${r.cwd}`); console.log(`doctor.missingOptional=${(r.missingOptional ?? []).join(',')}`);
NODE
ok 'mnfs doctor canonical readiness = PASS'
printf 'doctor_json_sha256=%s\n' "$(sha256sum "$TMP/doctor.json" | awk '{print $1}')"

printf '\n=== Post-gate immutability ===\n'
eq 'post-gate HEAD' "$PR_HEAD" "$(git rev-parse HEAD)"
eq 'post-gate branch' "$BRANCH" "$(git branch --show-current)"
[[ -z "$(git status --porcelain=v1 --untracked-files=all)" ]] || { git status --short; die 'checkout changed during preflight'; }
git diff --check || die 'post-gate whitespace-error diff'
ok 'checkout remained clean and unchanged'
printf 'utc_finished=%s\nMNFS_WSL2_PREFLIGHT_RESULT=PASS\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
