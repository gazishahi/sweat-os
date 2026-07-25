# Sprint 1 — Diagnostic & Calibration (2026-07-23 → 2026-07-30)

_Theme: Find out where the student actually is. Seed the skill matrix from **demonstrated
performance**, not self-report. Bias scores low — a missed gap is worse than a pleasant
surprise._

## Objectives
- [ ] Run the cross-domain diagnostic below and seed `progress/skill-matrix.yaml` from results
- [ ] Establish a baseline interview-readiness % on the dashboard
- [ ] Open backlog issues for the 3–5 clearest weaknesses found
- [ ] Generate Sprint 2 (`npm run sprint`) targeting those weaknesses
- [ ] Record learning preferences observed during the diagnostic in `state.student.preferences`

## How to run the diagnostic (Assessment Engine, calibration mode)

Do this as **one interactive session**, ~60–90 min. Keep it conversational and honest.
Score each probe against the mastery table (0–5) in `CLAUDE.md`. Test breadth over depth;
go deeper only where the student seems strong (to find the ceiling) or the answer is
ambiguous. Anything untested stays at mastery 0 — do not guess.

### 1. Warm-up & context (5 min)
Confirm target, timeline, hours, and current role/projects. Ask which areas they *think*
are strong/weak (used only to sequence probes, never to set scores).

### 2. Algorithms & data structures (25 min)
- **Big-O:** "What's the time/space of X?" on 2–3 snippets; probe amortized (dynamic array
  push) and log-time (binary search) reasoning.
- **One live coding problem, interview-style** (Interview Engine, LeetCode mode, no
  hints): pick a two-pointer or hash-map problem (e.g., Two Sum, then Longest Substring
  Without Repeating Characters if strong). Score communication + approach, not just the
  final answer.
- **Verbal probes** (no coding): when to use a hash map vs. array; BFS vs. DFS; how a
  balanced BST stays O(log n). Score explanation quality.

### 3. Databases & backend (15 min)
- Postgres: "This query is slow — how do you diagnose and fix it?" (probe `EXPLAIN`,
  indexes, composite column order).
- "Walk me through what happens on a `SELECT ... FOR UPDATE` inside a transaction."
- Node: "What does the event loop do; what happens if you block it?"

### 4. System design (15 min)
Small design prompt (e.g., "design a URL shortener" or "design a rate limiter"). Look for
whether they gather requirements, estimate scale, and reason about a bottleneck. Score
the process, not perfection.

### 5. Frontend & communication (10 min)
- React: "When does a component re-render, and how do you stop an unnecessary one?"
- Throughout: score **communication** (thinking aloud, structure) and **explaining
  tradeoffs** as their own skills.

## Close-out (Reflection Engine — required)
1. Write `reflections/2026-07-23-diagnostic.md` (four sections).
2. Seed `progress/skill-matrix.yaml`: set mastery/confidence/interview_readiness for every
   skill you actually probed, with a one-line justification per change in the reflection.
   Leave untested skills at 0.
3. For each concept you want to lock in, run `npm run review -- <concept> pass|fail`.
4. Open backlog issues (`backlog/issue-NNN.md` + `_index.yaml`) for the clearest weaknesses.
5. Append the session to `progress/session-log.yaml`.
6. Update `state.yaml` (day, next_session, streak, hours, last_session).
7. `npm run dashboard` then `npm run validate`.
8. `npm run sprint` to draft Sprint 2, then refine it with the Scheduler.

## Lessons
- [ ] (none this sprint — calibration only)

## Implementation
- [ ] The live-coding problem in step 2 doubles as the implementation check

## Mock Interview
- [ ] The LeetCode-mode problem in step 2 is the baseline mock

## Reviews (spaced repetition)
- [ ] Seed the queue with whatever the diagnostic confirms as "solid this session"

## Reflection
- [ ] `reflections/2026-07-23-diagnostic.md`

## Homework
- [ ] Assign after calibration, targeted at the top weakness (Homework Engine)

## Sprint Review
_(fill at end: which skills got a real baseline, starting readiness %)_

## Retrospective
_(fill at end: did the diagnostic surface the right gaps? adjust Sprint 2)_
