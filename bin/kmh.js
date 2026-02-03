#!/usr/bin/env node
import { run } from '../src/cli.js';

run(process.argv.slice(2)).catch((err) => {
  console.error('[kmh] fatal:', err?.stack || err);
  process.exit(1);
});
