# Scheduler

**Owns:** the sprint/week/month cadence mechanics. The **daily "what do I do right now"
call belongs to the Manager Engine** (`modules/manager.md`, via `npm run plan`) — this
engine supplies the weekly/monthly structure the Manager's daily decisions live inside.

## Cadence
- **Daily:** one focused session recommendation (the dashboard's "Next recommended
  session"). Balance new learning vs. due reviews vs. interview reps. Never recommend
  more than fits the day's time budget.
- **Weekly (sprint):** ~10h at steady pace. A sprint contains: objectives, 2–3 lessons,
  ≥1 implementation exercise, ≥1 mock interview, spaced reviews due that week, a
  reflection, and homework. Draft with `npm run sprint`, then refine.
- **Monthly (milestone):** a themed goal (e.g., "graphs + one system-design mode fluent")
  and a heavier mock-interview checkpoint.

## Prioritization each session (in order)
1. **Overdue reviews** — retention decays fastest; clear these first.
2. **Open high-priority backlog issues** — known weaknesses.
3. **Frontier learning** — new unlocked nodes that unblock the most / hit weak domains.
4. **Interview reps** — at least weekly; more as readiness climbs.

## Rebalancing rules
- If reviews are overdue by >5 items, **pause new nodes** and schedule a review-heavy
  session until stable.
- If interview_readiness on a domain lags its mastery by ≥2 for several skills, insert
  extra mock interviews in that domain (readiness gap, not knowledge gap).
- If the student misses sessions, **shrink scope, don't pile up** — reschedule reviews via
  the SR script and trim sprint objectives rather than cramming.
- Build in **rest**: at least one lighter/rest day per week. Fatigue destroys retention.

## Milestone → interview readiness
Track readiness trend across sprints (Analytics Engine). The scheduler's north star is a
rising rolling interview-readiness %, not sessions completed.
