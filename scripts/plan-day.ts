// `npm run plan` — THE DECISION ENGINE. This is what makes SWEAT OS an operating system
// rather than a menu: it wakes up already knowing the student's whole situation and
// decides the single highest-ROI task for today. It does not ask.
//
// It reads every signal (due/overdue reviews, upcoming interview, open & recurring
// backlog issues, plateaued skills, the learnable frontier, fatigue), scores a ranked
// list of candidate tasks, picks the winner, and writes:
//   - progress/today.yaml  (the decision + rationale + the signals the manager saw)
//   - state.current.next_session  (so the dashboard/kernel surface the assignment)
// It also keeps a milestone mock interview always scheduled, so there is always an
// interview on the horizon creating urgency.
//
// The learning-model.yaml policy weights and retention data tune the scoring, so as the
// Reflection Engine learns how the student learns, the manager's decisions shift.

import {
  PATHS,
  readYaml,
  writeYaml,
  today,
  addDays,
  daysBetween,
  conceptImportance,
  consecutiveActiveDays,
  StateSchema,
  SkillMatrixSchema,
  ReviewQueueSchema,
  SessionLogSchema,
  BacklogIndexSchema,
  GraphSchema,
  KnowledgeIndexSchema,
  AgendaSchema,
  LearningModelSchema,
  SkillHistorySchema,
  type State,
  type SkillMatrix,
  type ReviewQueue,
  type SessionLog,
  type BacklogIndex,
  type Graph,
  type KnowledgeIndex,
  type Agenda,
  type LearningModel,
  type SkillHistory,
  type Today,
} from "./lib.ts";

const now = today();

const state = StateSchema.parse(readYaml<State>(PATHS.state));
const matrix = SkillMatrixSchema.parse(readYaml<SkillMatrix>(PATHS.skillMatrix));
const queue = ReviewQueueSchema.parse(readYaml<ReviewQueue>(PATHS.reviewQueue));
const log = SessionLogSchema.parse(readYaml<SessionLog>(PATHS.sessionLog));
const backlog = BacklogIndexSchema.parse(readYaml<BacklogIndex>(PATHS.backlogIndex));
const graph = GraphSchema.parse(readYaml<Graph>(PATHS.graph));
const knowledge = KnowledgeIndexSchema.parse(readYaml<KnowledgeIndex>(PATHS.knowledgeIndex));
const agenda = AgendaSchema.parse(readYaml<Agenda>(PATHS.agenda));
const model = LearningModelSchema.parse(readYaml<LearningModel>(PATHS.learningModel));
const history = SkillHistorySchema.parse(readYaml<SkillHistory>(PATHS.skillHistory));

const INTERVIEW_HORIZON_DAYS = 21;
// Task families are scored onto a shared ~0-25 scale so they can be compared directly.
// Rough intended ordering when several compete: an imminent (<=2d) interview or a badly
// overdue review tops out ~15-25; recurring high-priority issues ~10; a distant interview
// or plateau ~6-9; advancing the frontier is the moderate default ~4-8. The learning
// model's policy_weights then tilt these per what actually works for this student.

// --- helpers ---------------------------------------------------------------
function conceptMastery(id: string): number {
  for (const d of Object.values(matrix.domains)) if (d.skills[id]) return d.skills[id].mastery;
  if (knowledge.concepts[id]) return knowledge.concepts[id].mastery;
  return 0;
}
function domainOf(skill: string): string | null {
  for (const [domain, d] of Object.entries(matrix.domains)) if (d.skills[skill]) return domain;
  return null;
}
function retentionMultiplier(skill: string): number {
  const domain = domainOf(skill);
  const r = domain ? model.retention[domain] : undefined;
  if (r === null || r === undefined) return 1;
  return r < 0.6 ? 1.5 : r < 0.8 ? 1.15 : 1; // shakier retention => review is more valuable
}

type Candidate = { type: string; title: string; roi: number; why: string; target: string | null; est: number };
const candidates: Candidate[] = [];

// --- keep a milestone mock always on the horizon ---------------------------
const futureInterviews = agenda.interviews.filter((i) => i.date >= now).sort((a, b) => a.date.localeCompare(b.date));
if (futureInterviews.length === 0) {
  const mock = {
    date: addDays(now, agenda.milestone_cadence_days),
    kind: "milestone-mock" as const,
    focus: "mixed",
    notes: "Auto-scheduled by the manager to keep an interview on the horizon.",
  };
  agenda.interviews.push(mock);
  writeYaml(PATHS.agenda, agenda);
  futureInterviews.push(mock);
}
const nextInterview = futureInterviews[0]!;
const daysUntilInterview = daysBetween(now, nextInterview.date);

// --- signal: is the matrix calibrated at all? ------------------------------
const allSkills = Object.values(matrix.domains).flatMap((d) => Object.values(d.skills));
const uncalibrated = allSkills.every((s) => s.mastery === 0 && s.interview_readiness === 0);
const hadDiagnostic = log.sessions.some((s) => s.type === "diagnostic");

// --- signal: reviews due ---------------------------------------------------
const due = queue.items.filter((i) => i.due <= now);
const overdue = due.filter((i) => i.due < now);
if (due.length > 0) {
  const roi =
    model.policy_weights.review *
    due.reduce((sum, i) => sum + conceptImportance(matrix, i.concept) * retentionMultiplier(i.concept) * (1 + Math.max(0, daysBetween(i.due, now))), 0);
  candidates.push({
    type: "review",
    title: `Spaced review — ${due.length} concept(s) due (${overdue.length} overdue)`,
    roi,
    why: `Retention decays fastest on overdue items; clearing them protects everything already learned. Due: ${due.map((i) => i.concept).join(", ")}.`,
    target: null,
    est: Math.min(60, 8 * due.length),
  });
}

// --- signal: upcoming interview -------------------------------------------
const interviewRelevantDomains = ["algorithms", "data-structures", "system-design"];
const relSkills = interviewRelevantDomains.flatMap((dom) =>
  matrix.domains[dom] ? Object.values(matrix.domains[dom]!.skills) : []
);
const readinessGap = relSkills.length
  ? relSkills.reduce((s, k) => s + Math.max(0, 4 - k.interview_readiness) / 4, 0) / relSkills.length
  : 1;
if (daysUntilInterview <= INTERVIEW_HORIZON_DAYS) {
  const proximity = 1 + (INTERVIEW_HORIZON_DAYS - daysUntilInterview) / INTERVIEW_HORIZON_DAYS; // 1..2
  const urgent = daysUntilInterview <= 2 ? 1.8 : 1;
  const roi = model.policy_weights.interview * 4 * proximity * (0.5 + readinessGap) * urgent;
  candidates.push({
    type: "interview",
    title: `Mock interview (${nextInterview.focus}) — ${nextInterview.kind} in ${daysUntilInterview}d`,
    roi,
    why: `An interview is ${daysUntilInterview} day(s) out (${nextInterview.date}). Readiness gap on core interview skills is ${(readinessGap * 100).toFixed(0)}%. Reps under pressure close it.`,
    target: nextInterview.focus,
    est: 60,
  });
}

// --- signal: open & recurring backlog issues -------------------------------
const openIssues = backlog.issues.filter((i) => i.status === "open");
const priorityWeight = { high: 5, medium: 3, low: 1.5 } as const;
const recurringCount = openIssues.filter((i) => (i.times_seen ?? 1) > 1).length;
for (const issue of openIssues) {
  const seen = issue.times_seen ?? 1;
  const roi = model.policy_weights.issue * priorityWeight[issue.priority] * (1 + (seen - 1) * 0.5);
  candidates.push({
    type: "issue",
    title: `Close backlog issue #${issue.id} — ${issue.title}`,
    roi,
    why: `${issue.priority}-priority weakness${seen > 1 ? `, recurred ${seen}×` : ""}. Related: ${issue.related_skills.join(", ") || "—"}.`,
    target: issue.file,
    est: 45,
  });
}

// --- signal: plateaued skills ----------------------------------------------
const plateaued: string[] = [];
{
  const bySkill = new Map<string, { date: string; mastery: number }[]>();
  for (const e of history.events) {
    let arr = bySkill.get(e.skill);
    if (!arr) {
      arr = [];
      bySkill.set(e.skill, arr);
    }
    arr.push({ date: e.date, mastery: e.mastery });
  }
  for (const [skill, evsRaw] of bySkill) {
    const evs = evsRaw.slice().sort((a, b) => a.date.localeCompare(b.date));
    if (evs.length < 2) continue;
    const last = evs[evs.length - 1]!;
    const windowStart = addDays(last.date, -2 * model.plateau_days);
    const win = evs.filter((e) => e.date >= windowStart);
    if (win.length < 2) continue;
    const first = win[0]!;
    if (daysBetween(first.date, last.date) < model.plateau_days) continue;
    const maxM = Math.max(...win.map((e) => e.mastery));
    if (last.mastery <= first.mastery && last.mastery === maxM && last.mastery > 0 && last.mastery < 4) {
      plateaued.push(skill);
    }
  }
}
for (const skill of plateaued) {
  const domain = domainOf(skill);
  const w = domain ? matrix.domains[domain]!.weight : 2;
  const preferred = model.modality_fit[skill] ?? model.modality_fit[domain ?? ""] ?? "teach-back or a debugging drill";
  candidates.push({
    type: "plateau",
    title: `Break the plateau on "${skill}" — switch modality to ${preferred}`,
    roi: model.policy_weights.plateau * w * 2.2,
    why: `"${skill}" has been worked but hasn't improved in ${model.plateau_days}+ days. The current approach isn't moving it; change the modality.`,
    target: skill,
    est: 40,
  });
}

// --- signal: learnable frontier --------------------------------------------
const downstream = new Map<string, number>();
for (const node of Object.values(graph.nodes)) for (const pre of node.prerequisites) downstream.set(pre, (downstream.get(pre) ?? 0) + 1);
const frontier: string[] = [];
let bestLearn: Candidate | null = null;
for (const [id, node] of Object.entries(graph.nodes)) {
  const m = conceptMastery(id);
  if (m >= 4) continue;
  const unlocked = node.prerequisites.every((pre) => conceptMastery(pre) >= node.threshold_to_unlock);
  if (!unlocked) continue;
  frontier.push(id);
  const domainWeight = matrix.domains[node.domain]?.weight ?? 2;
  const unlockPower = downstream.get(id) ?? 0;
  const need = 1 - m / 5;
  const roi = model.policy_weights.learn * (2 + unlockPower * 0.4 + domainWeight * 0.5) * (0.5 + need * 0.5);
  if (!bestLearn || roi > bestLearn.roi) {
    bestLearn = {
      type: "learn",
      title: `Learn / advance "${node.title}"`,
      roi,
      why: `Unlocked frontier node in ${node.domain} (mastery ${m}/5), unblocks ${unlockPower} downstream node(s).`,
      target: id,
      est: model.optimal_session_minutes,
    };
  }
}
if (bestLearn) candidates.push(bestLearn);

// --- signal: fatigue / rest ------------------------------------------------
const consecutive = consecutiveActiveDays(log.sessions.map((s) => s.date), now);
const restRecommended = consecutive >= 6;
if (restRecommended) {
  candidates.push({
    type: "rest",
    title: "Rest or light review only — you're on a long streak",
    roi: model.policy_weights.rest * consecutive,
    why: `${consecutive} consecutive active days. Fatigue destroys retention; a light day compounds better than grinding.`,
    target: null,
    est: 20,
  });
}

// --- decide ----------------------------------------------------------------
candidates.sort((a, b) => b.roi - a.roi);

let winner: Candidate;
if (uncalibrated && !hadDiagnostic) {
  // Nothing is known yet — every other decision depends on calibration. Override.
  winner = {
    type: "diagnostic",
    title: "Run the diagnostic calibration (Sprint 1)",
    roi: Infinity,
    why: "The skill matrix is uncalibrated. Every downstream decision depends on a real baseline, so this comes first.",
    target: "sprints/sprint-01.md",
    est: 80,
  };
  candidates.unshift(winner);
} else if (candidates.length === 0) {
  winner = {
    type: "learn",
    title: "Free study — no signals pending; pick a frontier node with the Curriculum Engine",
    roi: 0,
    why: "No reviews due, no open issues, no plateau, no imminent interview. Advance the frontier.",
    target: null,
    est: model.optimal_session_minutes,
  };
  candidates.push(winner);
} else {
  winner = candidates[0]!;
}

// Cost tiering: recall/light work runs on Haiku, solid reasoning on Sonnet, deep
// coaching/pressure on Opus. Keeps Opus (the expensive model) off the cheap activities.
const MODEL_BY_TYPE: Record<string, string> = {
  review: "haiku",
  rest: "haiku",
  learn: "sonnet",
  issue: "sonnet",
  interview: "opus",
  plateau: "opus",
  diagnostic: "opus",
};
const recommendedModel = MODEL_BY_TYPE[winner.type] ?? "sonnet";

const todayDoc: Today = {
  version: 1,
  generated: now,
  assignment: { type: winner.type, title: winner.title, target: winner.target, why: winner.why, est_minutes: winner.est, recommended_model: recommendedModel },
  candidates: candidates.slice(0, 6).map((c) => ({ type: c.type, title: c.title, roi: Math.round(c.roi * 10) / 10, why: c.why })),
  signals: {
    reviews_due: due.length,
    reviews_overdue: overdue.length,
    next_interview: { date: nextInterview.date, kind: nextInterview.kind, focus: nextInterview.focus, days_until: daysUntilInterview },
    open_issues: openIssues.length,
    recurring_issues: recurringCount,
    plateaued_skills: plateaued,
    frontier_nodes: frontier,
    consecutive_days: consecutive,
    rest_recommended: restRecommended,
  },
};
writeYaml(PATHS.today, todayDoc);

state.current.next_session = winner.title;
writeYaml(PATHS.state, state);

console.log(`🧭 plan: TODAY'S ASSIGNMENT → ${winner.title}  [model: ${recommendedModel}]`);
console.log(`   why: ${winner.why}`);
console.log(`   (${candidates.length} candidate(s) considered; interview in ${daysUntilInterview}d; ${due.length} review(s) due; ${openIssues.length} open issue(s); ${plateaued.length} plateau(s))`);
