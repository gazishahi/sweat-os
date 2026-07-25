// `npm run dashboard` — regenerate DASHBOARD.md from live state. This is the
// student's daily home screen. Pure read-then-write; it never mutates state.
//
// Interview-readiness % = weighted mean of each skill's interview_readiness/5,
// weighted by its domain weight. Domains that matter more for a mid→senior loop
// (algorithms, data-structures, system-design, fundamentals) carry higher weight,
// set in skill-matrix.yaml. Also writes stats.interview_readiness back into state
// so the number the dashboard shows and the number stored agree.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  PATHS,
  ROOT,
  readYaml,
  writeYaml,
  today,
  daysBetween,
  existsSync,
  flattenSkills,
  StateSchema,
  SkillMatrixSchema,
  ReviewQueueSchema,
  SessionLogSchema,
  BacklogIndexSchema,
  TodaySchema,
  type State,
  type SkillMatrix,
  type ReviewQueue,
  type SessionLog,
  type BacklogIndex,
  type Today,
} from "./lib.ts";

const state = StateSchema.parse(readYaml<State>(PATHS.state));
const matrix = SkillMatrixSchema.parse(readYaml<SkillMatrix>(PATHS.skillMatrix));
const queue = ReviewQueueSchema.parse(readYaml<ReviewQueue>(PATHS.reviewQueue));
const log = SessionLogSchema.parse(readYaml<SessionLog>(PATHS.sessionLog));
const backlog = BacklogIndexSchema.parse(readYaml<BacklogIndex>(PATHS.backlogIndex));
// today.yaml is written by `npm run plan`. If it's missing/stale the dashboard still
// renders, but the manager's briefing prompts you to run the planner first.
const plan: Today | null = existsSync(PATHS.today) ? TodaySchema.parse(readYaml<Today>(PATHS.today)) : null;

const now = today();
const rows = flattenSkills(matrix);

// --- Interview readiness ---------------------------------------------------
let wSum = 0;
let wReadiness = 0;
for (const r of rows) {
  wSum += r.domainWeight;
  wReadiness += r.domainWeight * (r.interview_readiness / 5);
}
const readinessPct = wSum > 0 ? Math.round((wReadiness / wSum) * 100) : 0;

// Persist the computed readiness back to state.
state.stats.interview_readiness = readinessPct;
writeYaml(PATHS.state, state);

// --- Mastery heatmap (per domain average, 0–5) -----------------------------
const heatChar = (m: number) => ["·", "▁", "▂", "▃", "▅", "█"][Math.max(0, Math.min(5, Math.round(m)))];
const domainRows = Object.entries(matrix.domains).map(([, d]) => {
  const skills = Object.values(d.skills);
  const avg = skills.length ? skills.reduce((a, s) => a + s.mastery, 0) / skills.length : 0;
  return { label: d.label, avg, count: skills.length };
});

// --- Upcoming reviews ------------------------------------------------------
const dueSoon = [...queue.items]
  .sort((a, b) => a.due.localeCompare(b.due))
  .slice(0, 8)
  .map((i) => {
    const delta = daysBetween(now, i.due);
    const when = delta < 0 ? `overdue ${-delta}d` : delta === 0 ? "today" : `in ${delta}d`;
    return `- \`${i.concept}\` — due ${i.due} (${when})`;
  });

// --- Weakest skills (lowest interview_readiness, then mastery) --------------
const weakest = [...rows]
  .sort((a, b) => a.interview_readiness - b.interview_readiness || a.mastery - b.mastery)
  .slice(0, 6)
  .map((r) => `- **${r.skill}** (${r.domainLabel}) — mastery ${r.mastery}/5, readiness ${r.interview_readiness}/5`);

// --- Recent progress -------------------------------------------------------
const recent = [...log.sessions]
  .slice(-5)
  .reverse()
  .map((s) => `- ${s.date} · _${s.type}_ — ${s.summary}`);

// --- Open issues -----------------------------------------------------------
const openIssues = backlog.issues.filter((i) => i.status === "open");
const issueLines = openIssues
  .sort((a, b) => ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority])
  .slice(0, 8)
  .map((i) => `- **#${i.id}** [${i.priority}] ${i.title} — \`${i.file}\``);

// --- Velocity (sessions in the last 7 days) --------------------------------
const last7 = log.sessions.filter((s) => daysBetween(s.date, now) <= 7 && daysBetween(s.date, now) >= 0).length;

// --- Current sprint objectives (pull the Objectives block if present) ------
let sprintExcerpt = "_No current sprint file found._";
const sprintPath = join(ROOT, state.current.sprint);
if (existsSync(sprintPath)) {
  const md = readFileSync(sprintPath, "utf8");
  const m = md.match(/##\s*Objectives\s*\n([\s\S]*?)(\n##\s|\n#\s|$)/i);
  sprintExcerpt = m ? m[1]!.trim() : `See \`${state.current.sprint}\`.`;
}

// --- Today's assignment + the manager's read (from plan-day) ---------------
let assignmentBlock: string;
let managerRead: string;
if (plan) {
  const a = plan.assignment;
  const s = plan.signals;
  const runnerUps = plan.candidates
    .filter((c) => c.title !== a.title)
    .slice(0, 3)
    .map((c) => `- ${c.title} _(ROI ${c.roi})_`);
  assignmentBlock = `## ✅ TODAY'S ASSIGNMENT

### ${a.title}

**Why this, today:** ${a.why}
_Estimated: ~${a.est_minutes} min${a.target ? ` · target: \`${a.target}\`` : ""} · run on: **${a.recommended_model}** (\`/model ${a.recommended_model}\`)_

This is the call. Show up and do the work — renegotiate only if something material changed.
${runnerUps.length ? `\n<details><summary>What else the manager considered</summary>\n\n${runnerUps.join("\n")}\n</details>` : ""}`;

  const ni = s.next_interview;
  managerRead = `## 🧭 Manager's Read

| Signal | Status |
|---|---|
| Next interview | ${ni ? `**${ni.kind}** (${ni.focus}) in **${ni.days_until}d** — ${ni.date}` : "none scheduled"} |
| Reviews due | ${s.reviews_due} (${s.reviews_overdue} overdue) |
| At-risk concepts | ${s.reviews_overdue > 0 ? `${s.reviews_overdue} slipping` : "none slipping"} |
| Open issues | ${s.open_issues}${s.recurring_issues ? ` (${s.recurring_issues} recurring)` : ""} |
| Plateaued skills | ${s.plateaued_skills.length ? s.plateaued_skills.join(", ") : "none"} |
| Learnable frontier | ${s.frontier_nodes.length} node(s) unlocked |
| Fatigue | ${s.consecutive_days} consecutive day(s)${s.rest_recommended ? " — **rest recommended**" : ""} |`;
} else {
  assignmentBlock = `## ✅ TODAY'S ASSIGNMENT\n\n_Run \`npm run plan\` (or \`npm run brief\`) — the manager hasn't decided today's task yet._`;
  managerRead = "";
}

// --- Compose ---------------------------------------------------------------
const out = `# 🏋️ SWEAT OS — Dashboard

_Generated ${now} · student: ${state.student.name} · target: ${state.student.target} · pace: ${state.student.pace}_

${assignmentBlock}

---

${managerRead}${managerRead ? "\n\n---\n\n" : ""}## 📊 Interview Readiness: ${readinessPct}%

\`${"█".repeat(Math.round(readinessPct / 5)).padEnd(20, "░")}\` ${readinessPct}/100

Streak: ${state.stats.streak_days}d · Total hours: ${state.stats.total_hours} · Velocity (7d): ${last7} session${last7 === 1 ? "" : "s"}

---

## 🎯 Current Sprint — \`${state.current.sprint}\` (day ${state.current.day})

${sprintExcerpt}

---

## 🔥 Mastery Heatmap

| Domain | Skills | Avg mastery |
|---|---|---|
${domainRows.map((d) => `| ${d.label} | ${d.count} | ${heatChar(d.avg)} ${d.avg.toFixed(1)}/5 |`).join("\n")}

---

## ⏰ Upcoming Reviews
${dueSoon.length ? dueSoon.join("\n") : "_Review queue empty — nothing scheduled yet._"}

---

## 🪫 Weakest Skills
${weakest.length ? weakest.join("\n") : "_Skill matrix not yet calibrated. Run the diagnostic._"}

---

## 🐛 Open Issues (${openIssues.length})
${issueLines.length ? issueLines.join("\n") : "_No open issues._"}

---

## 📈 Recent Progress
${recent.length ? recent.join("\n") : "_No sessions logged yet._"}

---

_This file is generated by \`npm run dashboard\`. Do not edit by hand._
`;

writeFileSync(PATHS.dashboard, out);
console.log(`🖥️  dashboard: wrote DASHBOARD.md (readiness ${readinessPct}%, ${queue.items.length} review items, ${openIssues.length} open issues).`);
