// `npm run validate` — schema-validate every structured state file and check
// referential integrity across them. Run at session start and end so state is
// never silently corrupt. Exits non-zero on any problem.

import {
  PATHS,
  ROOT,
  readYaml,
  existsSync,
  StateSchema,
  SkillMatrixSchema,
  ReviewQueueSchema,
  SessionLogSchema,
  GraphSchema,
  KnowledgeIndexSchema,
  BacklogIndexSchema,
  AgendaSchema,
  LearningModelSchema,
  SkillHistorySchema,
  TodaySchema,
  flattenSkills,
} from "./lib.ts";
import { join } from "node:path";

const problems: string[] = [];

function loadAndValidate<T>(label: string, path: string, schema: { parse: (x: unknown) => T }): T | null {
  if (!existsSync(path)) {
    problems.push(`missing file: ${label} (${path})`);
    return null;
  }
  try {
    return schema.parse(readYaml(path));
  } catch (err) {
    problems.push(`schema error in ${label}: ${(err as Error).message.split("\n")[0]}`);
    return null;
  }
}

const state = loadAndValidate("state.yaml", PATHS.state, StateSchema);
const matrix = loadAndValidate("skill-matrix.yaml", PATHS.skillMatrix, SkillMatrixSchema);
const queue = loadAndValidate("review-queue.yaml", PATHS.reviewQueue, ReviewQueueSchema);
loadAndValidate("session-log.yaml", PATHS.sessionLog, SessionLogSchema);
const graph = loadAndValidate("graph.yaml", PATHS.graph, GraphSchema);
const knowledge = loadAndValidate("knowledge/_index.yaml", PATHS.knowledgeIndex, KnowledgeIndexSchema);
const backlog = loadAndValidate("backlog/_index.yaml", PATHS.backlogIndex, BacklogIndexSchema);
loadAndValidate("agenda.yaml", PATHS.agenda, AgendaSchema);
const model = loadAndValidate("learning-model.yaml", PATHS.learningModel, LearningModelSchema);
const skillHistory = loadAndValidate("skill-history.yaml", PATHS.skillHistory, SkillHistorySchema);
// today.yaml is generated; validate it only if present.
if (existsSync(PATHS.today)) loadAndValidate("today.yaml", PATHS.today, TodaySchema);

// --- Referential integrity -------------------------------------------------

// Every graph prerequisite must be a real node; every knowledge path must exist.
if (graph) {
  const ids = new Set(Object.keys(graph.nodes));
  for (const [id, node] of Object.entries(graph.nodes)) {
    for (const pre of node.prerequisites) {
      if (!ids.has(pre)) problems.push(`graph node "${id}" has unknown prerequisite "${pre}"`);
    }
    if (!existsSync(join(ROOT, node.knowledge))) {
      problems.push(`graph node "${id}" points to missing knowledge file "${node.knowledge}"`);
    }
  }
}

// Every knowledge-index file must exist on disk.
if (knowledge) {
  for (const [concept, entry] of Object.entries(knowledge.concepts)) {
    if (!existsSync(join(ROOT, entry.file))) {
      problems.push(`knowledge index concept "${concept}" points to missing file "${entry.file}"`);
    }
  }
}

// Every review-queue concept should be a known graph node or knowledge concept.
if (queue && (graph || knowledge)) {
  const known = new Set([
    ...(graph ? Object.keys(graph.nodes) : []),
    ...(knowledge ? Object.keys(knowledge.concepts) : []),
  ]);
  for (const item of queue.items) {
    if (!known.has(item.concept)) {
      problems.push(`review-queue references unknown concept "${item.concept}"`);
    }
    if (item.interval_index >= queue.intervals_days.length) {
      problems.push(`review-queue item "${item.concept}" interval_index out of range`);
    }
  }
}

// skill-history events + learning-model retention keys should name real skills/domains.
if (matrix) {
  const skillNames = new Set(flattenSkills(matrix).map((r) => r.skill));
  const domainNames = new Set(Object.keys(matrix.domains));
  if (skillHistory) {
    for (const e of skillHistory.events) {
      if (!skillNames.has(e.skill)) problems.push(`skill-history references unknown skill "${e.skill}"`);
    }
  }
  if (model) {
    for (const dom of Object.keys(model.retention)) {
      if (!domainNames.has(dom)) problems.push(`learning-model.retention references unknown domain "${dom}"`);
    }
  }
}

// state.current.sprint should point at a real file.
if (state && !existsSync(join(ROOT, state.current.sprint))) {
  problems.push(`state.current.sprint points to missing file "${state.current.sprint}"`);
}

// Backlog issue files must exist; related_skills should be real skills.
if (backlog) {
  const skillNames = matrix ? new Set(flattenSkills(matrix).map((r) => r.skill)) : new Set<string>();
  for (const issue of backlog.issues) {
    if (!existsSync(join(ROOT, issue.file))) {
      problems.push(`backlog issue #${issue.id} points to missing file "${issue.file}"`);
    }
    if (matrix) {
      for (const s of issue.related_skills) {
        if (!skillNames.has(s)) problems.push(`backlog issue #${issue.id} references unknown skill "${s}"`);
      }
    }
  }
}

// --- Report ----------------------------------------------------------------
if (problems.length === 0) {
  console.log("✅ validate: all state files pass schema + integrity checks.");
  process.exit(0);
} else {
  console.error(`❌ validate: ${problems.length} problem(s) found:\n`);
  for (const msg of problems) console.error("  • " + msg);
  process.exit(1);
}
