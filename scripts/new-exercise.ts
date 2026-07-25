// `npm run exercise -- <slug> [--mode work|sim] [--title "..."]`
// Scaffolds a coding-exercise workspace so the student codes in a real file in Neovim,
// not in the chat box. Creates practice/<date>-<slug>/ with a solution stub, a runnable
// node:test harness, and a README (problem + definition of done + run command).
//
// The interview/practice engine (Claude) runs this to start a coding task, then fills in
// the real problem in README.md and real assertions in solution.test.ts; the student
// writes solution.ts. Grade on real behavior: `npm run test:exercise -- <testfile>`.
//
// Neovim integration:
//   - work mode: if a Neovim socket is reachable, opens the stub in that running Neovim
//     (`nvim --server <sock> --remote`). $NVIM is set automatically when Claude Code runs
//     inside Neovim (coder/claudecode.nvim's :ClaudeCode split, or any :terminal); other-
//     wise set SWEAT_NVIM_SOCKET, or start Neovim with `nvim --listen /tmp/sweat.nvim`.
//   - sim mode: prints the bare-profile launch command instead (no LSP/autocomplete), to
//     mimic a CoderPad/whiteboard round.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, today } from "./lib.ts";

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const mode = (args.includes("--mode") ? args[args.indexOf("--mode") + 1] : "work") as "work" | "sim";
const title = args.includes("--title") ? args[args.indexOf("--title") + 1]! : slug ?? "Exercise";

if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("usage: npm run exercise -- <kebab-slug> [--mode work|sim] [--title \"...\"]");
  process.exit(2);
}
if (mode !== "work" && mode !== "sim") {
  console.error(`bad --mode "${mode}" (expected work|sim)`);
  process.exit(2);
}

const dateSlug = `${today()}-${slug}`;
const relDir = join("practice", dateSlug);
const absDir = join(ROOT, relDir);
if (existsSync(absDir)) {
  console.error(`already exists: ${relDir}`);
  process.exit(1);
}
mkdirSync(absDir, { recursive: true });

const solutionRel = join(relDir, "solution.ts");
const testRel = join(relDir, "solution.test.ts");

writeFileSync(
  join(absDir, "solution.ts"),
  `// ${title}
// Mode: ${mode}. Write your solution here, then run:
//   npm run test:exercise -- ${testRel}
export function solve(/* TODO: real parameters */): unknown {
  throw new Error("not implemented");
}
`
);

writeFileSync(
  join(absDir, "solution.test.ts"),
  `import { test } from "node:test";
import assert from "node:assert/strict";
import { solve } from "./solution.ts";

// The interview/practice engine replaces these with real assertions.
// Left failing on purpose so the harness is red until the solution works.
test("TODO: first case", () => {
  assert.fail("replace with a real assertion, then implement solve()");
});
`
);

writeFileSync(
  join(absDir, "README.md"),
  `# ${title}

- **Mode:** ${mode} ${mode === "sim" ? "(interview simulation — no LSP/autocomplete)" : "(real-work — full LSP + tests)"}
- **Edit:** \`${solutionRel}\`
- **Run:** \`npm run test:exercise -- ${testRel}\`

## Problem
_(the interview/practice engine fills this in)_

## Definition of done
_(explicit, checkable criteria — e.g. all tests pass, correct complexity, edge cases handled)_

## Notes / approach log
_(student: jot your plan and tradeoffs here as you go)_
`
);

// --- open in Neovim --------------------------------------------------------
const socket = process.env.NVIM || process.env.SWEAT_NVIM_SOCKET || "/tmp/sweat.nvim";
let opened = false;
if (mode === "work" && existsSync(socket)) {
  const r = spawnSync("nvim", ["--server", socket, "--remote", join(absDir, "solution.ts")], { stdio: "ignore" });
  opened = r.status === 0;
}

console.log(`🧩 exercise: created ${relDir}/ (mode: ${mode})`);
console.log(`   edit: ${solutionRel}`);
console.log(`   run:  npm run test:exercise -- ${testRel}`);
if (mode === "sim") {
  console.log(`   open (bare, interview-sim): nvim -u editor/sim-init.lua ${solutionRel}`);
} else if (opened) {
  console.log(`   opened solution.ts in your running Neovim (${socket}).`);
} else {
  console.log(`   open: nvim ${solutionRel}   (no Neovim socket found; set SWEAT_NVIM_SOCKET or run \`nvim --listen /tmp/sweat.nvim\`)`);
}
