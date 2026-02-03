import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { exists, ensureDir, copyDir, readJsonIfExists, writeFileSafe } from './io.js';
import { promptYesNo, promptMultiSelect, promptChoice } from './prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '..', 'templates');

export async function initCommand({ flags }) {
  const cwd = process.cwd();

  const repoInfo = await detectRepo(cwd);

  const nonInteractive = !!flags.yes;

  let confirmed = true;
  if (!nonInteractive) {
    confirmed = await promptYesNo(
      'KMH will add files to this project to enable commit commands/skills. Continue?',
      true
    );
  }
  if (!confirmed) return;

  // tool selection
  let tools = ['claude', 'codex', 'opencode'];
  if (flags.tools) {
    tools = flags.tools.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (!nonInteractive) {
    tools = await promptMultiSelect(
      'Which tools do you want to install KMH for?',
      [
        { value: 'claude', label: 'Claude Code plugin (adds /kmh:commit)' },
        { value: 'codex', label: 'Codex skills (adds $kmh-commit)' },
        { value: 'opencode', label: 'OpenCode commands (adds /kmh-commit)' },
      ],
      tools
    );
  }

  // install scope
  let installScope = flags.installScope || 'project';
  if (!nonInteractive) {
    installScope = await promptChoice(
      'Install scope?',
      [
        { value: 'project', label: 'Project (recommended) - writes into this repo' },
        { value: 'global', label: 'Global (Codex prompts only; deprecated) - writes into your home folder' },
      ],
      installScope
    );
  }

  // optional files
  let createConfig = true;
  let createDocs = true;
  if (!nonInteractive) {
    createConfig = await promptYesNo('Create kmh.config.yml (commit rules + scope heuristics)?', true);
    createDocs = await promptYesNo('Create docs/kmh.md (usage + troubleshooting)?', true);
  }

  // Optional deprecated Codex prompts (slash aliases)
  let installCodexPrompts = false;
  if (tools.includes('codex') && installScope === 'global' && !nonInteractive) {
    installCodexPrompts = await promptYesNo(
      'Install deprecated Codex custom prompts as /kmh-commit aliases in ~/.codex/prompts?',
      false
    );
  } else if (tools.includes('codex') && installScope === 'global' && nonInteractive) {
    installCodexPrompts = false;
  }

  // Prepare plan
  const plan = [];

  if (createConfig) {
    plan.push({
      kind: 'file',
      from: path.join(TEMPLATES_DIR, 'kmh.config.yml'),
      to: path.join(cwd, 'kmh.config.yml'),
    });
  }
  if (createDocs) {
    plan.push({
      kind: 'file',
      from: path.join(TEMPLATES_DIR, 'docs', 'kmh.md'),
      to: path.join(cwd, 'docs', 'kmh.md'),
    });
  }

  if (tools.includes('claude')) {
    plan.push({
      kind: 'dir',
      from: path.join(TEMPLATES_DIR, 'claude-plugin'),
      to: path.join(cwd, '.kmh', 'claude-plugin'),
    });
  }
  if (tools.includes('codex')) {
    plan.push({
      kind: 'dir',
      from: path.join(TEMPLATES_DIR, 'codex-skills'),
      to: path.join(cwd, '.agents', 'skills'),
    });
  }
  if (tools.includes('opencode')) {
    plan.push({
      kind: 'dir',
      from: path.join(TEMPLATES_DIR, 'opencode-commands'),
      to: path.join(cwd, '.opencode', 'commands'),
    });
  }

  if (installCodexPrompts) {
    plan.push({
      kind: 'dir',
      from: path.join(TEMPLATES_DIR, 'codex-prompts'),
      to: path.join(os.homedir(), '.codex', 'prompts'),
    });
  }

  // detect conflicts
  const conflicts = [];
  for (const p of plan) {
    if (p.kind === 'file') {
      if (await exists(p.to)) conflicts.push(p.to);
    } else {
      // if directory exists, that's ok, but we might overwrite files
      if (await exists(p.to)) conflicts.push(p.to);
    }
  }

  const overwriteAll = !!flags.overwrite || (nonInteractive ? false : (conflicts.length ? await promptYesNo(
    `Some target paths already exist (${conflicts.length}). Overwrite/merge where needed?`,
    false
  ) : false));

  if (conflicts.length && !overwriteAll) {
    console.log('[kmh] Aborting to avoid overwriting existing files.');
    console.log('       Re-run with --overwrite to merge/overwrite generated files.');
    return;
  }

  // Apply
  console.log('\n[kmh] Plan:');
  for (const p of plan) {
    console.log(`  - ${p.kind.toUpperCase()}  ${rel(cwd, p.to)}`);
  }
  console.log('');

  // Ensure repo looks JS-ish (soft warning)
  if (!repoInfo.packageJsonPath) {
    console.log('[kmh] Note: package.json not found in this folder. KMH is intended for JS/TS repos.');
  }

  for (const p of plan) {
    if (p.kind === 'file') {
      await ensureDir(path.dirname(p.to));
      const content = await fs.readFile(p.from, 'utf8');
      const rendered = await renderTemplate(content, { repo: repoInfo });
      await writeFileSafe(p.to, rendered, { overwrite: overwriteAll });
    } else {
      await ensureDir(p.to);
      await copyDir(p.from, p.to, { overwrite: overwriteAll, renderer: (c) => renderTemplate(c, { repo: repoInfo }) });
    }
  }

  console.log('[kmh] Done.');
  console.log('');
  console.log('Next steps:');
  if (tools.includes('claude')) {
    console.log('  - Claude Code: start with `claude --plugin-dir ./.kmh/claude-plugin` then run `/kmh:commit`.');
  }
  if (tools.includes('codex')) {
    console.log('  - Codex: run `$kmh-commit` or `$kmh-commit-atomic` (or `/skills`).');
  }
  if (tools.includes('opencode')) {
    console.log('  - OpenCode: run `/kmh-commit` or `/kmh-commit-atomic`.');
  }
  console.log('  - Customize rules in `kmh.config.yml`.');
}

async function detectRepo(cwd) {
  const packageJsonPath = await findUp(cwd, 'package.json');
  const pkg = packageJsonPath ? await readJsonIfExists(packageJsonPath) : null;

  const isMonorepo = await looksLikeMonorepo(cwd, pkg);

  return {
    cwd,
    packageJsonPath,
    packageName: pkg?.name || null,
    isMonorepo,
  };
}

async function looksLikeMonorepo(cwd, pkg) {
  // Heuristic: pnpm-workspace, lerna, nx, turbo, or package.json workspaces
  const markers = ['pnpm-workspace.yaml', 'lerna.json', 'nx.json', 'turbo.json'];
  for (const m of markers) {
    if (await exists(path.join(cwd, m))) return true;
  }
  if (pkg && pkg.workspaces) return true;

  // common directory patterns
  const common = ['packages', 'apps', 'services'];
  for (const d of common) {
    if (await exists(path.join(cwd, d))) return true;
  }
  return false;
}

function rel(cwd, abs) {
  const r = path.relative(cwd, abs);
  return r && !r.startsWith('..') ? r : abs;
}

async function findUp(startDir, filename) {
  let dir = path.resolve(startDir);
  while (true) {
    const candidate = path.join(dir, filename);
    if (await exists(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

async function renderTemplate(content, { repo }) {
  // Simple token replacement. Keep it tiny and dependency-free.
  return content
    .replaceAll('{{KMH_VERSION}}', '0.1.0')
    .replaceAll('{{REPO_IS_MONOREPO}}', String(!!repo.isMonorepo))
    .replaceAll('{{REPO_PACKAGE_NAME}}', repo.packageName || '');
}
