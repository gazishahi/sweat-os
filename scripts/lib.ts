// Shared helpers + zod schemas for SWEAT OS scripts.
// Everything deterministic (YAML IO, date math, schema definitions) lives here so
// the four command scripts stay small and the LLM never hand-computes state.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Paths — every path is resolved relative to the repo root (parent of scripts/).
// ---------------------------------------------------------------------------
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const p = (...parts: string[]) => join(ROOT, ...parts);

export const PATHS = {
  state: p("progress", "state.yaml"),
  skillMatrix: p("progress", "skill-matrix.yaml"),
  reviewQueue: p("progress", "review-queue.yaml"),
  sessionLog: p("progress", "session-log.yaml"),
  graph: p("curriculum", "graph.yaml"),
  knowledgeIndex: p("knowledge", "_index.yaml"),
  backlogIndex: p("backlog", "_index.yaml"),
  agenda: p("progress", "agenda.yaml"),
  learningModel: p("progress", "learning-model.yaml"),
  skillHistory: p("progress", "skill-history.yaml"),
  today: p("progress", "today.yaml"),
  dashboard: p("DASHBOARD.md"),
};

// ---------------------------------------------------------------------------
// YAML IO
// ---------------------------------------------------------------------------
export function readYaml<T = unknown>(path: string): T {
  // JSON_SCHEMA keeps ISO dates as plain strings (the default schema parses them into
  // JS Date objects, which breaks our string date fields) and avoids YAML 1.1 surprises
  // like `no`/`yes` becoming booleans.
  return yaml.load(readFileSync(path, "utf8"), { schema: yaml.JSON_SCHEMA }) as T;
}

export function writeYaml(path: string, data: unknown): void {
  const header = "# Managed by SWEAT OS. Edit via scripts/engines, not by hand unless you know the schema.\n";
  writeFileSync(path, header + yaml.dump(data, { lineWidth: 100, sortKeys: false }));
}

// ---------------------------------------------------------------------------
// Date helpers — ISO date (YYYY-MM-DD) math, no timezone surprises.
// ---------------------------------------------------------------------------
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + "T00:00:00Z").getTime();
  const b = new Date(toIso + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86_400_000);
}

// ---------------------------------------------------------------------------
// Zod schemas — the source of truth for every structured state file.
// ---------------------------------------------------------------------------
const mastery = z.number().int().min(0).max(5);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nullableDate = isoDate.nullable();

export const SkillSchema = z.object({
  mastery,
  confidence: z.number().min(0).max(1),
  interview_readiness: mastery,
  last_reviewed: nullableDate,
  review_due: nullableDate,
});

export const SkillMatrixSchema = z.object({
  version: z.number(),
  domains: z.record(
    z.object({
      label: z.string(),
      weight: z.number().min(0),
      skills: z.record(SkillSchema),
    })
  ),
});
export type SkillMatrix = z.infer<typeof SkillMatrixSchema>;

export const StateSchema = z.object({
  version: z.number(),
  student: z.object({
    name: z.string(),
    target: z.string(),
    pace: z.string(),
    hours_per_week: z.number(),
    started: isoDate,
    timeline_weeks: z.number(),
    preferences: z.record(z.unknown()).optional(),
  }),
  current: z.object({
    sprint: z.string(),
    day: z.number().int(),
    next_session: z.string(),
  }),
  stats: z.object({
    interview_readiness: z.number(),
    streak_days: z.number().int(),
    total_hours: z.number(),
    last_session: nullableDate,
  }),
});
export type State = z.infer<typeof StateSchema>;

export const ReviewQueueSchema = z.object({
  version: z.number(),
  intervals_days: z.array(z.number().int()),
  items: z.array(
    z.object({
      concept: z.string(),
      interval_index: z.number().int().min(0),
      due: isoDate,
      last_result: z.enum(["pass", "fail"]).nullable(),
      last_reviewed: nullableDate,
    })
  ),
});
export type ReviewQueue = z.infer<typeof ReviewQueueSchema>;

export const SessionLogSchema = z.object({
  version: z.number(),
  sessions: z.array(
    z.object({
      date: isoDate,
      type: z.string(),
      summary: z.string(),
      artifacts: z.array(z.string()),
    })
  ),
});
export type SessionLog = z.infer<typeof SessionLogSchema>;

export const GraphSchema = z.object({
  version: z.number(),
  nodes: z.record(
    z.object({
      title: z.string(),
      domain: z.string(),
      difficulty: z.number().int().min(1).max(5),
      prerequisites: z.array(z.string()),
      knowledge: z.string(),
      threshold_to_unlock: mastery,
    })
  ),
});
export type Graph = z.infer<typeof GraphSchema>;

export const KnowledgeIndexSchema = z.object({
  version: z.number(),
  concepts: z.record(z.object({ file: z.string(), mastery })),
});
export type KnowledgeIndex = z.infer<typeof KnowledgeIndexSchema>;

export const BacklogIndexSchema = z.object({
  version: z.number(),
  next_id: z.number().int(),
  issues: z.array(
    z.object({
      id: z.number().int(),
      title: z.string(),
      priority: z.enum(["low", "medium", "high"]),
      status: z.enum(["open", "validated"]),
      source: z.string(),
      created: isoDate,
      file: z.string(),
      related_skills: z.array(z.string()),
      // Recurrence: how many times this weakness has resurfaced. A recurring mistake is
      // higher-ROI to fix than a one-off, so the decision engine weights by times_seen.
      times_seen: z.number().int().min(1).optional(),
      last_seen: isoDate.optional(),
    })
  ),
});
export type BacklogIndex = z.infer<typeof BacklogIndexSchema>;

// --- The manager's inputs & output ----------------------------------------

// What the OS knows is coming — the "an interview is always around the corner" signal.
export const AgendaSchema = z.object({
  version: z.number(),
  milestone_cadence_days: z.number().int(),
  interviews: z.array(
    z.object({
      date: isoDate,
      kind: z.enum(["milestone-mock", "real"]),
      focus: z.string(), // leetcode | system-design | behavioral | mixed | ...
      notes: z.string().optional(),
    })
  ),
  deadlines: z.array(z.object({ date: isoDate, title: z.string() })),
});
export type Agenda = z.infer<typeof AgendaSchema>;

// The OS's evolving model of HOW this student learns. The Reflection Engine updates it;
// the decision engine reads it. This is what makes the OS "refine itself over time."
export const LearningModelSchema = z.object({
  version: z.number(),
  retention: z.record(z.number().min(0).max(1).nullable()), // domain -> first-try review pass rate
  avg_hint_rung: z.number().nullable(),
  optimal_session_minutes: z.number().int(),
  plateau_days: z.number().int(), // no-improvement window that counts as a plateau
  modality_fit: z.record(z.string()), // skill/domain -> modality that moved the needle
  notes: z.array(z.string()),
  policy_weights: z.object({
    review: z.number(),
    interview: z.number(),
    issue: z.number(),
    plateau: z.number(),
    learn: z.number(),
    rest: z.number(),
  }),
});
export type LearningModel = z.infer<typeof LearningModelSchema>;

// Append-only log of skill scores over time — the raw material for plateau detection.
export const SkillHistorySchema = z.object({
  version: z.number(),
  events: z.array(
    z.object({
      date: isoDate,
      skill: z.string(),
      mastery,
      interview_readiness: mastery,
    })
  ),
});
export type SkillHistory = z.infer<typeof SkillHistorySchema>;

// The manager's decision for the day (written by plan-day, read by the dashboard).
export const TodaySchema = z.object({
  version: z.number(),
  generated: isoDate,
  assignment: z.object({
    type: z.string(),
    title: z.string(),
    target: z.string().nullable(),
    why: z.string(),
    est_minutes: z.number().int(),
    recommended_model: z.string(), // haiku | sonnet | opus — cost tiering per activity
  }),
  candidates: z.array(
    z.object({ type: z.string(), title: z.string(), roi: z.number(), why: z.string() })
  ),
  signals: z.object({
    reviews_due: z.number().int(),
    reviews_overdue: z.number().int(),
    next_interview: z
      .object({ date: isoDate, kind: z.string(), focus: z.string(), days_until: z.number().int() })
      .nullable(),
    open_issues: z.number().int(),
    recurring_issues: z.number().int(),
    plateaued_skills: z.array(z.string()),
    frontier_nodes: z.array(z.string()),
    consecutive_days: z.number().int(),
    rest_recommended: z.boolean(),
  }),
});
export type Today = z.infer<typeof TodaySchema>;

// Flatten the skill matrix into a sortable list of {domain, skill, ...}.
export function flattenSkills(matrix: SkillMatrix) {
  const rows: Array<{
    domain: string;
    domainLabel: string;
    domainWeight: number;
    skill: string;
    mastery: number;
    confidence: number;
    interview_readiness: number;
    review_due: string | null;
  }> = [];
  for (const [domain, d] of Object.entries(matrix.domains)) {
    for (const [skill, s] of Object.entries(d.skills)) {
      rows.push({
        domain,
        domainLabel: d.label,
        domainWeight: d.weight,
        skill,
        mastery: s.mastery,
        confidence: s.confidence,
        interview_readiness: s.interview_readiness,
        review_due: s.review_due,
      });
    }
  }
  return rows;
}

// Find the domain weight of the skill matching a concept id (importance proxy).
// Concepts are named to match skills where possible (e.g., "hash-maps"). Defaults to 2.
export function conceptImportance(matrix: SkillMatrix, concept: string): number {
  for (const d of Object.values(matrix.domains)) {
    if (d.skills[concept]) return d.weight;
  }
  return 2;
}

// Count consecutive days (ending today or yesterday) that have at least one session.
export function consecutiveActiveDays(sessionDates: string[], todayIso: string): number {
  const set = new Set(sessionDates);
  let streak = 0;
  let cursor = todayIso;
  // Allow the streak to "hold" if today has no session yet but yesterday did.
  if (!set.has(cursor)) cursor = addDays(cursor, -1);
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export { existsSync };
