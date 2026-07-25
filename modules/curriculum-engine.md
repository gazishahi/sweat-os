# Curriculum Engine

**Owns:** learning paths, topic sequencing, prerequisite enforcement, unlocking,
pacing, lesson-plan generation.

## Inputs
- `curriculum/graph.yaml` — the concept DAG.
- `progress/skill-matrix.yaml` — current mastery per skill.
- `progress/state.yaml` — pace (steady ~10h/wk), target (mid→senior), current sprint.

## Core rules
- **Graph, not line.** Traverse `graph.yaml` by prerequisite. A node is **unlocked**
  only when every prerequisite has reached that node's `threshold_to_unlock` (default
  mastery 3). Never teach a locked node — route to the missing prerequisite instead and
  say so plainly.
- **Frontier selection.** The "learnable frontier" = unlocked nodes with mastery < 4.
  Prefer frontier nodes that (a) unblock the most downstream nodes, and (b) target the
  student's weakest weighted domains (from the skill matrix).
- **Mid→senior weighting.** Early on, favor fundamentals + DSA breadth (algorithms,
  data-structures) and the core of databases/networking/OS. As those cross mastery 3,
  shift weight toward system-design and distributed-systems depth.
- **Pacing.** At steady pace, plan ~2–3 new nodes per week alongside review load. Do not
  introduce new nodes when the review queue is overdue by more than ~5 items — stabilize
  first (tell the Scheduler).

## Generating a lesson plan
For a chosen node, write a plan to `curriculum/lesson-plans/<concept>.md` that walks the
learning pipeline: Learn → Understand → Implement → Debug → Apply → Explain → Teach-back.
Each stage names the concrete artifact (e.g., "implement in `practice/`", "3 problems",
"teach-back prompt"). Keep it to what fits the session's time budget.

## Advancing / unlocking
When a node crosses its threshold, note newly-unlocked downstream nodes in the session
log so the Scheduler can surface them. Never silently skip the interview stage: a node
does not reach mastery 4 without an interview-stage check (Assessment/Interview engines).

## Growing the graph
When the student needs a concept that has no node, **add it** (Knowledge Engine creates
the node; you wire prerequisites into `graph.yaml`). A missing node is a curriculum gap,
not a dead end.
