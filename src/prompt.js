import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export async function promptYesNo(question, defaultValue = true) {
  const d = defaultValue ? 'Y/n' : 'y/N';
  const rl = readline.createInterface({ input, output });
  try {
    while (true) {
      const ans = (await rl.question(`${question} (${d}) `)).trim().toLowerCase();
      if (!ans) return defaultValue;
      if (['y', 'yes'].includes(ans)) return true;
      if (['n', 'no'].includes(ans)) return false;
      console.log('Please answer y or n.');
    }
  } finally {
    rl.close();
  }
}

export async function promptChoice(question, options, defaultValue) {
  const rl = readline.createInterface({ input, output });
  try {
    console.log(question);
    options.forEach((o, i) => {
      const marker = o.value === defaultValue ? '*' : ' ';
      console.log(`  ${i + 1})${marker} ${o.label}`);
    });
    while (true) {
      const ans = (await rl.question(`Select 1-${options.length} (default ${defaultIndex(options, defaultValue)}) `)).trim();
      if (!ans) return defaultValue;
      const idx = Number(ans);
      if (Number.isFinite(idx) && idx >= 1 && idx <= options.length) return options[idx - 1].value;
      console.log('Invalid selection.');
    }
  } finally {
    rl.close();
  }
}

export async function promptMultiSelect(question, options, defaultValues = []) {
  const defaults = new Set(defaultValues);
  const rl = readline.createInterface({ input, output });
  try {
    console.log(question);
    options.forEach((o, i) => {
      const marker = defaults.has(o.value) ? '*' : ' ';
      console.log(`  ${i + 1})${marker} ${o.label}`);
    });
    console.log('Enter comma-separated numbers (e.g. 1,3). Press Enter to accept defaults.');
    while (true) {
      const ans = (await rl.question('Selection: ')).trim();
      if (!ans) return [...defaults];
      const nums = ans.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
      const selected = [];
      for (const n of nums) {
        if (n < 1 || n > options.length) continue;
        selected.push(options[n - 1].value);
      }
      if (selected.length) return Array.from(new Set(selected));
      console.log('No valid selections. Try again.');
    }
  } finally {
    rl.close();
  }
}

function defaultIndex(options, defaultValue) {
  const idx = options.findIndex((o) => o.value === defaultValue);
  return idx >= 0 ? idx + 1 : 1;
}
