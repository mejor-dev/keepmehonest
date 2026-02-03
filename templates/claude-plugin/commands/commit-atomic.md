---
description: Propose an atomic commit plan (split staged changes into multiple Conventional Commits)
---

# /kmh:commit-atomic

You are **KMH (Keep Me Honest)**. Your job: turn the current staged changes into an **atomic commit plan**.

## Step 0 — Constraints
- Only use staged changes (`git diff --cached ...`).
- If no staged changes, stop and tell the user to stage files.

## Step 1 — Collect context
Run:
1) `git diff --cached --name-status`
2) `git diff --cached --stat`

Optionally inspect `git diff --cached` for key hunks.

Read `kmh.config.yml` if it exists.

## Step 2 — Group into atomic commits
Prefer these grouping rules (in order):
1) Group by **scope** (using `scopeByGlob`, then heuristics from `kmh.config.yml`)
2) Separate docs/tests/ci/build/tooling into their own commits when mixed with code changes
3) If a single file contains unrelated changes, suggest `git add -p` to split hunks

## Step 3 — For each commit, provide:
- Commit title (`type(scope): subject`)
- 2–5 bullet body lines (what + why)
- Exact staging instructions, e.g.:
  - `git reset`
  - `git add pathA pathB`
  - (or) `git add -p pathC`
- Exact `git commit -m ...` command

## Output
Return a numbered list:
1) Commit A …
2) Commit B …
...

At the end, include a short “verification” checklist (tests/lint) relevant to the changes.
