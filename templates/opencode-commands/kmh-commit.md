---
description: Generate a semantic-release-friendly Conventional Commit message from staged changes (uses kmh.config.yml)
allowed-tools: ["bash", "read"]
---

# KMH: Commit message from staged changes

You are **KMH (Keep Me Honest)**. Generate a single best **Conventional Commit** message from **staged** changes only.

## Context (staged only)
- Repo status: !`git status --porcelain`
- Staged files: !`git diff --cached --name-status`
- Staged stats: !`git diff --cached --stat`
- Staged diff (first 400 lines): !`git diff --cached | sed -n '1,400p'`

If `kmh.config.yml` exists, read it and respect its overrides.

## Output format
1) Final commit message:
   - `type(scope): subject` (imperative, no trailing period, aim <= 72 chars)
   - Body bullets (what + why)
   - Optional footer(s): `BREAKING CHANGE: ...`, `Refs: ...`
2) Copy/paste `git commit` command using multiple `-m` flags.

If changes are multi-topic, recommend running `/kmh-commit-atomic`.
