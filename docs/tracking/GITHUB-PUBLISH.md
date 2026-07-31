# GitHub publication handoff

## Target

- **Repository:** `developmentconexus-ops/mnfs`
- **Visibility:** public
- **Default branch:** `main`
- **Implementation branch:** `feat/m0-foundation`

The operator created the empty GitHub repository on 2026-07-31. Publication now consists only of pushing the two prepared branches, creating the tracking issues and opening the draft PR.

## Current publication state

- [x] repository exists at `https://github.com/developmentconexus-ops/mnfs`;
- [ ] `main` and `feat/m0-foundation` are pushed;
- [ ] GitHub issues mirror the remaining M0 and M1 gates;
- [ ] a draft PR targets `main` from `feat/m0-foundation`;
- [ ] resulting URLs are recorded in `STATUS.md`.

## One-time WSL2 publication

Use the publication kit generated with this repository. Inside Ubuntu WSL2, with `gh auth login` already completed:

```bash
unzip mnfs-github-publish-kit.zip -d ~/mnfs-publish-kit
bash ~/mnfs-publish-kit/publish.sh
```

The script is idempotent for issue and pull-request creation. It performs normal non-force pushes to the empty repository and preserves the complete local Git history.

## Manual fallback

From a restored checkout:

```bash
git remote set-url origin https://github.com/developmentconexus-ops/mnfs.git   || git remote add origin https://github.com/developmentconexus-ops/mnfs.git

git push -u origin main
git push -u origin feat/m0-foundation
```
