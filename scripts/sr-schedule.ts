// `npm run review -- <concept> pass|fail` — record a spaced-repetition result.
// Advances the interval on pass, resets it to the first interval on fail, and
// recomputes the next `due` date with real date math. Also mirrors last_reviewed /
// review_due onto the matching skill in the skill matrix when the concept name maps
// to a skill. Creates the queue item on first review of a concept.

import {
  PATHS,
  readYaml,
  writeYaml,
  today,
  addDays,
  ReviewQueueSchema,
  SkillMatrixSchema,
  type ReviewQueue,
  type SkillMatrix,
} from "./lib.ts";

const [, , concept, resultArg] = process.argv;

if (!concept || (resultArg !== "pass" && resultArg !== "fail")) {
  console.error("usage: npm run review -- <concept> pass|fail");
  process.exit(2);
}
const result = resultArg as "pass" | "fail";

const queue = ReviewQueueSchema.parse(readYaml<ReviewQueue>(PATHS.reviewQueue));
const now = today();

let item = queue.items.find((i) => i.concept === concept);
if (!item) {
  item = { concept, interval_index: 0, due: now, last_result: null, last_reviewed: null };
  queue.items.push(item);
}

// On pass, advance one interval (capped at the last). On fail, reset to interval 0.
if (result === "pass") {
  item.interval_index = Math.min(item.interval_index + 1, queue.intervals_days.length - 1);
} else {
  item.interval_index = 0;
}

const intervalDays = queue.intervals_days[item.interval_index]!;
item.last_result = result;
item.last_reviewed = now;
item.due = addDays(now, intervalDays);

// Keep the queue sorted by due date so the dashboard reads top-down.
queue.items.sort((a, b) => a.due.localeCompare(b.due));
writeYaml(PATHS.reviewQueue, queue);

// Mirror onto the skill matrix if the concept name matches a skill.
const matrix = SkillMatrixSchema.parse(readYaml<SkillMatrix>(PATHS.skillMatrix));
let mirrored = false;
for (const domain of Object.values(matrix.domains)) {
  const skill = domain.skills[concept];
  if (skill) {
    skill.last_reviewed = now;
    skill.review_due = item.due;
    mirrored = true;
  }
}
if (mirrored) writeYaml(PATHS.skillMatrix, matrix);

console.log(
  `📆 review: ${concept} → ${result}. interval now ${intervalDays}d, next due ${item.due}` +
    (mirrored ? " (mirrored to skill matrix)" : "")
);
