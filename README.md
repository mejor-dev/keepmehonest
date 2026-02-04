# @mejor/keepmehonest (KMH)

KMH is a **commit workflow add-on** for JS/TS repos.

It installs AI-friendly commands/skills that generate **semantic-release-compatible Conventional Commit** messages from your **staged git changes**.

> Scope: **commits only** (no semantic-release setup, no changelog setup, no self-release automation).

---

## What you get

### Commands

- **Claude Code (plugin)**
  - `/kmh:commit` — generate a single best commit message for the current staged changes
  - `/kmh:commit-atomic` — propose a plan to split staged changes into atomic commits

- **Codex CLI (skills)**
  - `$kmh-commit`
  - `$kmh-commit-atomic`

- **OpenCode (project commands)**
  - `/kmh-commit`
  - `/kmh-commit-atomic`

All variants aim to produce a Conventional Commit message that works well with semantic-release defaults:
- `feat` → minor
- `fix` → patch
- `BREAKING CHANGE:` or `!` → major

---

## Install into a repo

From your repo root:

```bash
npx @mejor/keepmehonest init
```

The wizard will let you choose what to install:
- Claude plugin
- Codex skills
- OpenCode commands
- Optional `kmh.config.yml` (commit rules overrides)

---

## Usage (recommended workflow)

### 1) Stage your changes

KMH looks at **staged** changes only.

```bash
git add -A
# or git add <files>
```

### 2) Generate a commit message

#### Claude Code
Start Claude with the KMH plugin directory created by `init`:

```bash
claude --plugin-dir ./.kmh/claude-plugin
```

Then run:

```
/kmh:commit
```

KMH will:
- inspect staged diff
- choose `type(scope): subject`
- include a short body when helpful
- flag breaking changes when detected

#### Codex CLI

Use the skill:

- `$kmh-commit`
- or `/skills` and select it

#### OpenCode

Run:

- `/kmh-commit`

---

## Atomic commits

Atomic mode is **guided by default**.

It will propose **multiple commits** (each with a message + file grouping + staging commands), but it won’t assume you want to execute the plan unless you explicitly confirm.

### Claude Code

```
/kmh:commit-atomic
```

KMH will respond with:
1) a proposed list of commits (A, B, C…)
2) the recommended staging commands per commit
3) the commit message for each step

✅ To proceed, reply with an explicit confirmation, e.g.:

- `Proceed with the plan`
- `Yes, proceed`
- `Apply the plan`

If you *don’t* confirm, KMH treats the response as a suggestion-only plan.

### Codex / OpenCode

Use:
- `$kmh-commit-atomic` (Codex)
- `/kmh-commit-atomic` (OpenCode)

Same concept: it outputs a plan and expects confirmation before applying changes.

---

## Configuration (override rules)

KMH supports a repo-local override file:

- `kmh.config.yml`

Common use cases:
- enforce allowed types
- map folder paths to scopes (`packages/api/**` → `api`)
- default scope for single-package repos
- limit subject line length (default 72)

### Scope heuristics (default)

If you do *nothing*, KMH tries sensible defaults:

- **single-package repo**: infer scope from `package.json` name
- **monorepo**: infer scope from common roots like:
  - `packages/<name>/...`
  - `apps/<name>/...`

You can override with `scopeByGlob` when needed.

---

## Examples

### Single commit
```
feat(auth): add refresh token rotation

- Store hashed refresh tokens
- Invalidate token family on reuse
```

### Breaking change
```
feat(api)!: rename user endpoint

BREAKING CHANGE: /v1/user is now /v1/users/:id
```

### Atomic plan (example output)
1) `docs(readme): document setup instructions`
   - stage: `git add README.md`
2) `feat(api): add pagination to list endpoint`
   - stage: `git add packages/api/src/...`
3) `test(api): cover pagination edge cases`
   - stage: `git add packages/api/test/...`

---

## Troubleshooting

### “No staged changes”
KMH only analyzes staged changes. Stage files first:

```bash
git add -A
```

### “KMH commands not found in Claude”
Make sure you started Claude with the plugin directory:

```bash
claude --plugin-dir ./.kmh/claude-plugin
```

If your plugin lives somewhere else, pass that folder instead (it must contain `.claude-plugin/plugin.json`).

---

## License

MIT
