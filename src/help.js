export function printHelp() {
  console.log(`
@mejor/keepmehonest (kmh)

Usage:
  npx @mejor/keepmehonest init
  npx -p @mejor/keepmehonest kmh init

Commands:
  init         Interactive wizard to add KMH workflows to the current repo

Options:
  --yes, -y              Non-interactive defaults (best effort)
  --tools <list>         Comma-separated: claude,codex,opencode
  --project              Install into this repo (default)
  --global               Global install where supported (Codex prompts only; deprecated)
  --overwrite            Overwrite existing generated files
  --help, -h             Show help

Examples:
  npx @mejor/keepmehonest init
  npx @mejor/keepmehonest init --tools claude,codex --overwrite
`.trim());
}
