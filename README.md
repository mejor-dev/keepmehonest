# @mejor/keepmehonest (KMH)

KMH is a **commit workflow add-on** for JS/TS repos. It installs AI-friendly commands/skills that generate **semantic-release-compatible Conventional Commit** messages from your **staged** git changes.

> Scope: **commits only** (no semantic-release/changelog setup, no self-release).

## Install into a repo

From your repo root:

```bash
npx @mejor/keepmehonest init
```

Or if you prefer explicit binary:

```bash
npx -p @mejor/keepmehonest kmh init
```

KMH will create:
- `kmh.config.yml` (optional) — commit rules + scope heuristics override
- `.kmh/claude-plugin/` (optional) — Claude Code plugin (gives `/kmh:commit`)
- `.agents/skills/` (optional) — Codex skills (gives `$kmh-commit`)
- `.opencode/commands/` (optional) — OpenCode commands (gives `/kmh-commit`)
- `docs/kmh.md` — usage + troubleshooting

## Usage

### Claude Code

KMH installs a **Claude Code plugin** at:

```
.kmh/claude-plugin/
```

For local testing, start Claude Code with:

```bash
claude --plugin-dir ./.kmh/claude-plugin
```

Then run:

- `/kmh:commit`
- `/kmh:commit-atomic`

> For a permanent install, package it into a marketplace and install via `/plugin`. (See Claude Code plugin docs.)

### Codex CLI

KMH installs Codex **skills** under:

```
.agents/skills/kmh-commit/SKILL.md
.agents/skills/kmh-commit-atomic/SKILL.md
```

Invoke them with:

- `$kmh-commit`
- `$kmh-commit-atomic`

Or select via `/skills`.

### OpenCode

KMH installs project commands under:

```
.opencode/commands/kmh-commit.md
.opencode/commands/kmh-commit-atomic.md
```

Invoke them with:

- `/kmh-commit`
- `/kmh-commit-atomic`

## Rules & scope heuristics

By default KMH expects Conventional Commits suitable for semantic-release:

- `feat` / `fix` drive versions
- `BREAKING CHANGE:` footer or `!` indicates major releases

**Scope (default refinement):**
- **Single-package repo**: prefer `package.json` `name` (strip `@scope/`).
- **Monorepo**: prefer changed file path under `packages/*`, `apps/*`, `services/*`, etc.
- Overrides are controlled by `kmh.config.yml` (`scopeByGlob`, `defaultScope`, `fallbackScope`, ...).

See `docs/kmh.md` after installing.

## License

MIT — see `LICENSE`.
