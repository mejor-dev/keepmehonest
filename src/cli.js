import { initCommand } from './init.js';
import { printHelp } from './help.js';

export async function run(argv) {
  const { cmd, args, flags } = parseArgs(argv);

  if (!cmd || flags.help || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  if (cmd === 'init') {
    await initCommand({ args, flags });
    return;
  }

  console.error(`[kmh] Unknown command: ${cmd}`);
  printHelp();
  process.exitCode = 1;
}

function parseArgs(argv) {
  const flags = {};
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      flags.help = true;
    } else if (a === '--yes' || a === '-y') {
      flags.yes = true;
    } else if (a.startsWith('--tools=')) {
      flags.tools = a.split('=')[1];
    } else if (a === '--tools') {
      flags.tools = argv[i + 1];
      i++;
    } else if (a === '--project') {
      flags.installScope = 'project';
    } else if (a === '--global') {
      flags.installScope = 'global';
    } else if (a.startsWith('--install-scope=')) {
      flags.installScope = a.split('=')[1];
    } else if (a === '--install-scope') {
      flags.installScope = argv[i + 1];
      i++;
    } else if (a === '--overwrite') {
      flags.overwrite = true;
    } else if (a.startsWith('-')) {
      // ignore unknown flags for now
      flags[a.replace(/^--?/, '')] = true;
    } else {
      positional.push(a);
    }
  }

  const cmd = positional[0];
  const args = positional.slice(1);

  return { cmd, args, flags };
}
