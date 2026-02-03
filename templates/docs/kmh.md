# KMH (Keep Me Honest) — Commit Workflow

KMH is a commit-message workflow designed to produce **semantic-release-friendly** Conventional Commits from your **staged changes**.

## Commands

### Claude Code
If installed, KMH creates a Claude Code plugin at:

- `.kmh/claude-plugin`

Run Claude Code with:

```bash
claude --plugin-dir ./.kmh/claude-plugin
```

Then use:

- `/kmh:commit`
- `/kmh:commit-atomic`

> Plugin commands are namespaced by plugin name to avoid collisions.

### Codex CLI
If installed, KMH creates skills at:

- `.agents/skills/kmh-commit/SKILL.md`
- `.agents/skills/kmh-commit-atomic/SKILL.md`

Use:

- `$kmh-commit`
- `$kmh-commit-atomic`

Or select via `/skills`.

### OpenCode
If installed, KMH creates project commands at:

- `.opencode/commands/kmh-commit.md`
- `.opencode/commands/kmh-commit-atomic.md`

Use:

- `/kmh-commit`
- `/kmh-commit-atomic`

## Rules

KMH aims for Conventional Commits (semantic-release compatible):
- `feat` / `fix` are primary
- `BREAKING CHANGE:` footer or `type!:` indicates major changes

Subject line rules:
- Imperative mood ("add", "fix", "remove")
- No trailing period
- Target <= 72 chars

## Scopes (default heuristics)

**Refinement enabled by default** (see `kmh.config.yml`):

1) **Single-package repo**
- Prefer `package.json` name
- If name is `@mejor/foo`, scope becomes `foo`

2) **Monorepo**
- Prefer first matching directory in:
  - `packages/*`, `apps/*`, `services/*`, etc.
- If changed files live under `packages/api/**`, scope becomes `api`

### Overriding scope/type
Use `kmh.config.yml`:
- `mappings.scopeByGlob`
- `mappings.typeByGlob`
- `defaults.defaultScope`
- `defaults.fallbackScope`
- `defaults.requireScope`

## Troubleshooting

### "No staged changes"
KMH only reads **staged** changes. Stage files first:

```bash
git add -A
# or
git add -p
```

Then re-run `/kmh:commit` or `$kmh-commit`.

### "It suggested the wrong type"
Add a `typeByGlob` rule in `kmh.config.yml`, or give a short hint when you invoke the command.
