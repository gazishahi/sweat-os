// `npm run setup` — bootstrap a fresh clone from the committed seeds.
// Copies seed/* into the live (gitignored) paths ONLY when they don't already exist, so
// running it on an established install never clobbers your real progress. Then stamps
// today's date as the start and generates the first dashboard.
//
// Fresh-clone flow:  npm install  &&  npm run setup

import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { p, ROOT, readYaml, writeYaml, today, StateSchema, type State } from "./lib.ts";

// seed relative path -> live relative path
const SEEDS: Array<[string, string]> = [
  ["seed/progress/state.yaml", "progress/state.yaml"],
  ["seed/progress/skill-matrix.yaml", "progress/skill-matrix.yaml"],
  ["seed/progress/review-queue.yaml", "progress/review-queue.yaml"],
  ["seed/progress/session-log.yaml", "progress/session-log.yaml"],
  ["seed/progress/agenda.yaml", "progress/agenda.yaml"],
  ["seed/progress/learning-model.yaml", "progress/learning-model.yaml"],
  ["seed/progress/skill-history.yaml", "progress/skill-history.yaml"],
  ["seed/backlog/_index.yaml", "backlog/_index.yaml"],
  ["seed/sprints/sprint-01.md", "sprints/sprint-01.md"],
];

let copied = 0;
let skipped = 0;
for (const [seedRel, liveRel] of SEEDS) {
  const live = p(liveRel);
  if (existsSync(live)) {
    skipped++;
    continue;
  }
  mkdirSync(dirname(live), { recursive: true });
  copyFileSync(p(seedRel), live);
  copied++;
}

// Stamp today's date as the start, but only on a freshly seeded profile.
const state = StateSchema.parse(readYaml<State>(p("progress/state.yaml")));
if (state.student.started === "2025-01-01") {
  state.student.started = today();
  writeYaml(p("progress/state.yaml"), state);
}

console.log(`🌱 setup: seeded ${copied} file(s), left ${skipped} existing file(s) untouched.`);

if (copied > 0) {
  // Fresh install — generate the first dashboard so the OS is ready to open.
  const run = (script: string) => spawnSync("npm", ["run", script], { cwd: ROOT, stdio: "inherit" });
  run("validate");
  run("brief");
  console.log("\n✅ SWEAT OS is ready. Open a Claude Code session here and say hello.");
} else {
  console.log("Nothing to seed — your install already has live state. (Run `npm run brief` to refresh.)");
}
