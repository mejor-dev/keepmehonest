import fs from 'node:fs/promises';
import path from 'node:path';

export async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

export async function readJsonIfExists(p) {
  try {
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function writeFileSafe(to, content, { overwrite }) {
  const already = await exists(to);
  if (already && !overwrite) return;
  await fs.writeFile(to, content, 'utf8');
}

export async function copyDir(from, to, { overwrite, renderer }) {
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const e of entries) {
    const src = path.join(from, e.name);
    const dst = path.join(to, e.name);
    if (e.isDirectory()) {
      await fs.mkdir(dst, { recursive: true });
      await copyDir(src, dst, { overwrite, renderer });
    } else if (e.isFile()) {
      const already = await exists(dst);
      if (already && !overwrite) continue;
      let data = await fs.readFile(src, 'utf8');
      if (renderer) data = await renderer(data);
      await fs.writeFile(dst, data, 'utf8');
    }
  }
}
