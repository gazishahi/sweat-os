# SWEAT OS — Data Models

All structured state is YAML (human-readable, diff-friendly). Long-form content is
Markdown with YAML frontmatter. The zod schemas in `scripts/lib.ts` are the enforced
source of truth — `npm run validate` rejects anything that drifts from them. Schemas are
versioned via a top-level `version` field so migrations are explicit.

Convention: dates are ISO `YYYY-MM-DD`. Scores use two scales — **mastery 0–5** and
**confidence 0.0–1.0**. Files with a `# Managed by SWEAT OS` header are written by
scripts; edit them only through the scripts/engines.

---

## `progress/state.yaml` — Student profile + pointers + top-line stats

```yaml
version: 1
student:
  name: Student
  target: mid-to-senior       # training target level
  pace: steady                # steady ~10 hrs/week
  hours_per_week: 10
  started: 2025-01-01
  timeline_weeks: 20          # planning horizon (3–6 months)
current:
  sprint: sprints/sprint-01.md
  day: 1
  next_session: "Diagnostic calibration"
stats:
  interview_readiness: 0      # % — recomputed by render-dashboard
  streak_days: 0
  total_hours: 0
  last_session: null          # ISO date or null
```

## `progress/skill-matrix.yaml` — Evolving skill matrix

Domains carry a `weight` used by the interview-readiness formula. Each skill tracks
mastery, confidence, interview readiness, and review dates.

```yaml
version: 1
domains:
  algorithms:
    label: Algorithms
    weight: 3                 # importance weight for readiness %
    skills:
      big-o:
        mastery: 0            # 0–5 (see CLAUDE.md mastery table)
        confidence: 0.0       # 0.0–1.0 self/observed confidence
        interview_readiness: 0# 0–5, earned only after the interview stage
        last_reviewed: null   # ISO date or null
        review_due: null      # ISO date or null (mirrored from review-queue)
```

Domains (with mid→senior weights): algorithms (3), data-structures (3), system-design
(3), databases (2), networking (2), operating-systems (2), distributed-systems (2),
backend (2), frontend (2), communication (2), debugging (1), security (1),
architecture (1), product-engineering (1).

## `progress/review-queue.yaml` — Spaced repetition

```yaml
version: 1
intervals_days: [1, 3, 7, 14, 30, 90]
items:
  - concept: big-o
    interval_index: 0         # index into intervals_days
    due: 2026-07-24
    last_result: pass         # pass | fail | null
    last_reviewed: 2026-07-23 # ISO date or null
```

Managed by `npm run review`. Pass → `interval_index + 1` (capped); fail → `0`.

## `progress/session-log.yaml` — The memory spine (append-only)

```yaml
version: 1
sessions:
  - date: 2026-07-23
    type: diagnostic          # diagnostic | lesson | practice | interview | review | reflection
    summary: One-line what happened + what changed.
    artifacts:                # paths written this session
      - reflections/2026-07-23-diagnostic.md
```

Every session appends exactly one entry. This is what lets the next session "already
know."

## `progress/agenda.yaml` — What the Manager knows is coming

```yaml
version: 1
milestone_cadence_days: 14   # the planner keeps a milestone mock scheduled within this
interviews:
  - date: 2026-08-06
    kind: milestone-mock       # milestone-mock | real
    focus: mixed               # leetcode | system-design | behavioral | mixed | ...
    notes: Auto-scheduled by the manager.
deadlines: []                  # [{date, title}]
```

`npm run plan` auto-inserts a milestone mock whenever no future interview exists, so there
is always an interview on the horizon. Add real interviews (`kind: real`) and prep ramps.

## `progress/learning-model.yaml` — How the student learns (self-refining)

```yaml
version: 1
retention: { algorithms: null, ... }   # per-domain first-try review pass rate (0-1|null)
avg_hint_rung: null                     # mean interview hint rung (lower = better)
optimal_session_minutes: 75
plateau_days: 14                        # no-improvement window that counts as a plateau
modality_fit: {}                        # skill/domain -> modality that moved it
notes: []                               # observations the Manager should honor
policy_weights: { review: 1.0, interview: 1.0, issue: 1.0, plateau: 1.0, learn: 1.0, rest: 1.0 }
```

The Reflection Engine updates this each session; `npm run plan` reads it to tune the
daily decision. This is how the OS gets better fitted to the student over months.

## `progress/skill-history.yaml` — Append-only score log

```yaml
version: 1
events:
  - { date: 2026-07-30, skill: recursion, mastery: 2, interview_readiness: 1 }
```

Written by `npm run assess`. Plateau detection reads it: a skill with several events over
≥ `plateau_days` and no mastery gain is flagged.

## `progress/today.yaml` — The Manager's decision (generated)

```yaml
version: 1
generated: 2026-07-30
assignment: { type: review, title: ..., target: ..., why: ..., est_minutes: 45, recommended_model: haiku }
candidates: [ { type, title, roi, why }, ... ]   # ranked; winner is candidates[0]
signals:
  reviews_due: 3
  reviews_overdue: 1
  next_interview: { date, kind, focus, days_until }
  open_issues: 2
  recurring_issues: 1
  plateaued_skills: [recursion]
  frontier_nodes: [trees, prefix-sum]
  consecutive_days: 4
  rest_recommended: false
```

Written by `npm run plan`; read by the dashboard. `state.current.next_session` mirrors
`assignment.title`. Do not hand-edit — re-run `npm run plan`.

## `curriculum/graph.yaml` — Concept dependency DAG

```yaml
version: 1
nodes:
  hash-maps:
    title: Hash Maps
    domain: data-structures
    difficulty: 2             # 1–5
    prerequisites: [big-o, arrays]
    knowledge: knowledge/hash-maps.md
    threshold_to_unlock: 3    # prereqs must reach this mastery before this unlocks
```

Not linear — shared prerequisites are expected. `validate` enforces that every
prerequisite is a real node and every `knowledge` path exists.

## `knowledge/*.md` — Concept nodes (Markdown + frontmatter)

```markdown
---
concept: sliding-window
title: Sliding Window
domain: algorithms
difficulty: 3
prerequisites: [arrays, hash-maps]
mastery: 0
---

## Definition
## Why it matters
## Common mistakes
## Real-world applications
## Implementations
## Practice problems
## Review schedule
```

`knowledge/_index.yaml` mirrors `{concept: {file, mastery}}` for fast reads.

## `backlog/_index.yaml` + `backlog/issue-NNN.md` — Weaknesses as issues

```yaml
# _index.yaml
version: 1
next_id: 2
issues:
  - id: 1
    title: Difficulty explaining amortized complexity
    priority: high            # low | medium | high
    status: open              # open | validated
    source: interviews/sessions/2026-07-30-leetcode.md
    created: 2026-07-30
    file: backlog/issue-001.md
    related_skills: [amortized-analysis, hash-maps, dynamic-array]
    times_seen: 2            # optional; bump when the weakness recurs
    last_seen: 2026-08-04    # optional; most recent recurrence
```

Issue markdown carries the same frontmatter plus **Suggested fix** and **Validation
criteria**. An issue stays `open` until its validation criteria are demonstrably met. When
the same weakness resurfaces, bump `times_seen` (don't duplicate) — the Manager weights
recurring mistakes higher.

## `interviews/sessions/*.md` — Mock interview logs

Frontmatter: `mode`, `date`, `problem`, `scores` (communication, correctness, runtime,
tradeoffs, edge_cases, optimization — each 0–5), plus `transcript_summary` and
`issues_created`. Rubrics per mode live in `interviews/rubrics/`.

## `homework/*.md` — Adaptive homework

Always includes: one **implementation** exercise, one **interview** exercise, one
**reflection** exercise, and an optional **stretch** goal. Difficulty adapts to recent
performance.

## `sprints/sprint-NN.md` — Weekly sprints

Sections: Objectives · Lessons · Implementation · Mock Interview · Reviews · Reflection ·
Homework · Sprint Review · Retrospective. Drafted by `npm run sprint`.

## `reflections/*.md` — Per-session reflection

Sections: What was learned · What mistakes occurred · What misconceptions remain · What
to review (feeds the review queue and backlog).

## `projects/*.md` — Resume deep-dive dossiers

Per project: what it does, your role, architecture, hard decisions + tradeoffs, and an
"understanding boundary" log the Resume Deep-Dive interview mode pushes against.
