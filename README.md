# 🏋️ SWEAT OS — Software Engineer Agentic Training OS

A **persistent, file-based training operating system** that turns one product engineer
into a world-class one — capable of passing rigorous senior-level technical interviews
*and* doing significantly stronger real-world engineering.

This is **not a chatbot, not an interview assistant, not a prompt pack.** It is a
durable system that [Claude Code](https://claude.com/claude-code) re-hydrates every
session, so you never have to re-explain what you learned last time. The state on disk
already knows.

## How it works

The "runtime" is Claude Code itself. When you open this repo in Claude Code:

1. `CLAUDE.md` (the **kernel**) is auto-loaded and Claude runs the **session lifecycle**:
   rehydrate state → **decide today's single highest-ROI task and assign it** →
   teach/interview/practice → record evidence → reflect, refine, and update state.
2. It behaves like an **engineering manager running your career**, not a menu. It wakes up
   already knowing your sprint, the interview coming up, which concepts are at risk of
   being forgotten, which mistakes keep recurring, and which skills have plateaued — and
   it makes the call. Your job is to show up; its job is to decide (and to keep refining
   how it decides as it learns how you learn). See `modules/manager.md`.
3. The **engines** in `modules/` are behavioral protocols Claude executes (manager,
   curriculum, assessment, interview, practice, knowledge, progress, scheduler,
   reflection, analytics, memory) — not running services.
3. **Persistent state** lives in `progress/` (and `knowledge/`, `backlog/`, `sprints/`,
   etc.) as human-readable YAML/Markdown, versioned in Git.
4. A small **TypeScript script layer** (`scripts/`) does the deterministic work — spaced-
   repetition date math, dashboard rendering, state validation, sprint scaffolding — so
   the model never hand-computes dates or stats.

## Getting started

```bash
cd training-os
npm install
npm run setup        # bootstrap your own local progress from the seeds (first run only)
```

Then just start a Claude Code session in this directory and say hello — it will tell you
what to work on. Your **first real session is a diagnostic** (`sprints/sprint-01.md`) that
calibrates your skill matrix from actual performance, not self-report.

### Your data is private by default
This repo is a **shared framework**; your progress is **yours and stays local**. Everything
under `progress/`, `reflections/`, `backlog/`, `interviews/sessions/`, `practice/`,
`homework/`, `projects/`, `sprints/`, and the generated `DASHBOARD.md` is **git-ignored** —
it never gets committed or pushed. The repo ships pristine, identity-free **seeds** under
`seed/`, and `npm run setup` copies them into your live (ignored) paths so you start from
scratch. To back your progress up online, point a **separate private repo** at those
ignored paths — nothing personal ever lands in this public one.

## Commands

| Command | What it does |
|---|---|
| `npm run setup` | Bootstrap local progress from `seed/` (fresh clone; never overwrites existing data) |
| `npm run brief` | Decide today's assignment **and** rebuild the dashboard (plan + dashboard) |
| `npm run plan` | The decision engine: rank tasks by ROI, write today's assignment to `today.yaml` |
| `npm run dashboard` | Rebuild `DASHBOARD.md` from live state |
| `npm run validate` | Schema-validate every state file + check referential integrity |
| `npm run assess -- <skill> <mastery> <readiness> [conf]` | Record a skill score change (matrix + history) |
| `npm run review -- <concept> pass\|fail` | Record a spaced-repetition result (advances/resets interval) |
| `npm run sprint` | Draft the next weekly sprint from weak skills + open issues + due reviews |
| `npm run exercise -- <slug> [--mode work\|sim]` | Scaffold a coding workspace (stub + test harness) and open it in Neovim |
| `npm run test:exercise -- <file>` | Run an exercise's test harness (Node's runner via tsx) |
| `npm run speak -- "…"` | Speak an interviewer line aloud (macOS `say`) for voice-mode interviews |

## Repository map

| Path | Responsibility |
|---|---|
| `CLAUDE.md` | The kernel / boot protocol Claude runs every session |
| `DASHBOARD.md` | Generated daily home screen (never edit by hand) |
| `SCHEMAS.md` | Every data model + field semantics |
| `modules/` | The engine protocols (`manager.md` is the top-level decider) |
| `curriculum/` | `graph.yaml` (concept dependency DAG) + generated lesson plans |
| `progress/` | Persistent state: `state`, `skill-matrix`, `review-queue`, `session-log`, `agenda`, `learning-model`, `skill-history`, `today` |
| `knowledge/` | One Markdown node per concept + `_index.yaml` |
| `backlog/` | Every weakness becomes an issue file + `_index.yaml` |
| `interviews/` | Mock interview logs (`sessions/`) + scoring rubrics (`rubrics/`) |
| `practice/` | Implementation / debug / refactor exercises + submissions |
| `projects/` | Resume-deep-dive project dossiers |
| `reflections/` | Per-session reflection logs |
| `homework/` | Assignments + submissions |
| `sprints/` | Weekly sprint plans, reviews, retros |
| `resources/` | Curated external resource pointers |
| `templates/` | Blank templates for every record type |
| `seed/` | Pristine, identity-free starting state; `npm run setup` copies it into your live (git-ignored) paths |
| `editor/` | Neovim setup: Claude Code plugin spec + the interview-sim profile (see `editor/README.md`) |
| `scripts/` | TypeScript helpers (validate, plan, dashboard, spaced-repetition, sprint, exercise) |

## Cost discipline (it shares your Claude Code usage)

SWEAT OS is built to be cheap on tokens so it doesn't eat into your real work quota:

- **Flat, tiny boot.** Each session the model reads only the pre-computed context package
  (`DASHBOARD.md` + `today.yaml`, ~1k tokens) — never the raw state files, and never the
  whole repo. Boot stays ~3–4k tokens whether you're on day 1 or month 12.
- **Bookkeeping is free.** All deterministic work (dates, spaced-repetition intervals,
  readiness %, dashboard, plateau detection, sprint drafts) runs in TypeScript scripts,
  which cost zero model tokens. The model only reasons.
- **Lazy retrieval.** Knowledge nodes, interview logs, and backlog issues load only when a
  specific activity needs them — the dashboard and `today.yaml` are the index.
- **Model tiering.** The planner tags each day's task with a recommended model — Haiku for
  recall/review, Sonnet for learning, Opus for mock interviews and system design. Switch
  with `/model`; Opus (the expensive one) never runs the cheap activities.

## Design principles

- **Nothing important is forgotten.** Every session appends to the memory spine
  (`progress/session-log.yaml`) and updates durable state.
- **Verify, never assume.** Mastery is earned through demonstrated performance and
  survives the interview + teach-back stages before it counts.
- **The curriculum is a graph, not a line.** Prerequisites gate unlocking.
- **The OS improves itself.** Gaps in curriculum, assessment, or analytics are treated
  as work items, not permanent limitations.
