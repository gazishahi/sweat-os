// `npm run sprint` — scaffold the next weekly sprint file. It reads the current
// sprint number from state, increments it, and pre-fills objectives from the
// student's weakest skills + open high-priority backlog issues + concepts due for
// review. The Scheduler engine (Claude) then refines the draft and, when the
// student starts it, advances state.current.sprint. This script does NOT move the
// pointer — it only produces the draft so nothing is lost if the draft is discarded.

import { existsSync, writeFileSync } from "node:fs";
import {
  PATHS,
  ROOT,
  readYaml,
  today,
  daysBetween,
  flattenSkills,
  StateSchema,
  SkillMatrixSchema,
  ReviewQueueSchema,
  BacklogIndexSchema,
  type State,
  type SkillMatrix,
  type ReviewQueue,
  type BacklogIndex,
} from "./lib.ts";
import { join } from "node:path";

const state = StateSchema.parse(readYaml<State>(PATHS.state));
const matrix = SkillMatrixSchema.parse(readYaml<SkillMatrix>(PATHS.skillMatrix));
const queue = ReviewQueueSchema.parse(readYaml<ReviewQueue>(PATHS.reviewQueue));
const backlog = BacklogIndexSchema.parse(readYaml<BacklogIndex>(PATHS.backlogIndex));

// Determine next sprint number from the current pointer (sprints/sprint-NN.md).
const m = state.current.sprint.match(/sprint-(\d+)\.md$/);
const currentNum = m ? parseInt(m[1]!, 10) : 0;
let n = currentNum + 1;
let file = join("sprints", `sprint-${String(n).padStart(2, "0")}.md`);
while (existsSync(join(ROOT, file))) {
  n += 1;
  file = join("sprints", `sprint-${String(n).padStart(2, "0")}.md`);
}

const now = today();
const rows = flattenSkills(matrix);

const weakest = [...rows]
  .sort((a, b) => a.interview_readiness - b.interview_readiness || a.mastery - b.mastery)
  .slice(0, 4);

const hotIssues = backlog.issues
  .filter((i) => i.status === "open" && i.priority === "high")
  .slice(0, 4);

const dueThisWeek = queue.items.filter((i) => {
  const d = daysBetween(now, i.due);
  return d <= 7;
});

const objectives = weakest.map((w) => `- [ ] Raise **${w.skill}** (${w.domainLabel}) from readiness ${w.interview_readiness}/5 toward 4/5`);
const issueTasks = hotIssues.map((i) => `- [ ] Close backlog issue **#${i.id}** — ${i.title}`);
const reviewTasks = dueThisWeek.map((i) => `- [ ] Spaced review: \`${i.concept}\` (due ${i.due})`);

const md = `# Sprint ${n} — ${now} → ${addWeek(now)}

_Auto-drafted by \`npm run sprint\`. Refine with the Scheduler engine (\`modules/scheduler.md\`) before starting._

## Objectives
${objectives.length ? objectives.join("\n") : "- [ ] (set objectives — matrix not yet calibrated)"}
${issueTasks.length ? "\n### Backlog to burn down\n" + issueTasks.join("\n") : ""}

## Lessons
- [ ] (Curriculum Engine: pick 2–3 unlocked nodes to advance this week)

## Implementation
- [ ] (Practice Engine: one implementation exercise tied to a weak skill above)

## Mock Interview
- [ ] (Interview Engine: at least one mock in a relevant mode)

## Reviews (spaced repetition)
${reviewTasks.length ? reviewTasks.join("\n") : "- [ ] (nothing due within 7 days)"}

## Reflection
- [ ] End-of-sprint reflection (Reflection Engine) → \`reflections/\`

## Homework
- [ ] Assigned via Homework Engine → \`homework/\`

## Sprint Review
_(fill at end of sprint: what shipped vs. planned)_

## Retrospective
_(fill at end of sprint: what to change next sprint)_
`;

function addWeek(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}

writeFileSync(join(ROOT, file), md);
console.log(`🗓️  sprint: drafted ${file}. Review it, then point state.current.sprint at it to start.`);
