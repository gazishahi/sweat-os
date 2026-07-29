# Authoring a Learning Path

How to point SWEAT OS at a new domain (DevOps/SRE, ML, security, data eng, a language…).
You can stand up a usable path in an afternoon, because you're **only writing data** — the
manager, spaced repetition, mock-interview engine, reflection, and dashboard all operate on
whatever curriculum you give them.

## What you touch (and what you don't)

**Don't touch** (the domain-agnostic brain): `modules/manager.md`, `scheduler.md`,
`reflection-engine.md`, `analytics-engine.md`, `progress-engine.md`, `memory-engine.md`, or
anything in `scripts/`.

**Do author** (the path = data):

| File | What it holds |
|---|---|
| `curriculum/graph.yaml` | The concept **DAG** — nodes + prerequisites |
| `knowledge/<concept>.md` | One teaching node per concept (7-section template) |
| `knowledge/_index.yaml` | Registry: `concept -> { file, mastery }` |
| `seed/progress/skill-matrix.yaml` | Domains + skills + **weights** (drives readiness % and the manager's priorities) |
| `interviews/rubrics/<mode>.md` + `modules/interview-engine.md` | Domain-appropriate interview modes + scoring |
| `seed/sprints/sprint-01.md` | The diagnostic, tailored to your domain |

## The one rule that matters

**Make the concept id (in `graph.yaml` + the node frontmatter) identical to the skill name
(in the skill matrix).** That's what lets a reviewed concept mirror its score into the skill
matrix and ride the spaced-repetition ladder. Mismatch = the concept still works as a lesson,
but it won't update the matrix. (`npm run validate` catches most other mistakes; it can't
catch a *semantic* name mismatch, so mind this one.)

## Steps

1. **Design the graph.** In `curriculum/graph.yaml`, add nodes. Each node:
   ```yaml
   <concept-id>:
     title: Human Title
     domain: <domain>              # must match a domain in the skill matrix
     difficulty: 3                 # 1–5
     prerequisites: [<concept-id>] # a DAG — shared prereqs are expected
     knowledge: knowledge/<concept-id>.md
     threshold_to_unlock: 3        # prereqs must reach this mastery before this unlocks
   ```

2. **Write each knowledge node.** Copy `templates/knowledge-node.md`; keep the seven H2
   sections (Definition · Why it matters · Common mistakes · Real-world applications ·
   Implementations · Practice problems · Review schedule). "Common mistakes" and "Why it
   matters" carry most of the value. For process skills, "Implementations" can be a
   worked example / checklist instead of code.

3. **Register nodes** in `knowledge/_index.yaml` (`concept: { file, mastery: 0 }`).

4. **Define the skill matrix** in `seed/progress/skill-matrix.yaml`: group skills under
   weighted domains. **Weights matter** — they set the interview-readiness % and how hard
   the manager prioritizes a domain. Weight what's central to your domain highest. Skill
   names must equal the concept ids you want reviewable.

5. **Add interview modes** for your domain in `modules/interview-engine.md` and a rubric in
   `interviews/rubrics/<mode>.md` (score 0–5 per dimension). Reuse the golden rules
   (no early hints, hint ladder, score to state).

6. **Tailor the diagnostic** in `seed/sprints/sprint-01.md` so the first session calibrates
   *your* domain's skills.

7. **Validate + run.**
   ```bash
   npm run validate     # prereqs resolve, knowledge files exist, references line up
   npm run setup        # seed a fresh local profile
   ```
   Then open Claude Code and run the diagnostic.

## Worked example — a DevOps/SRE path

`curriculum/graph.yaml`:
```yaml
  slos-and-error-budgets:
    title: SLOs & Error Budgets
    domain: reliability
    difficulty: 3
    prerequisites: []
    knowledge: knowledge/slos-and-error-budgets.md
    threshold_to_unlock: 3
  observability:
    title: Observability (metrics, logs, traces)
    domain: reliability
    difficulty: 3
    prerequisites: [slos-and-error-budgets]
    knowledge: knowledge/observability.md
    threshold_to_unlock: 3
  incident-response:
    title: Incident Response & Postmortems
    domain: reliability
    difficulty: 4
    prerequisites: [slos-and-error-budgets, observability]
    knowledge: knowledge/incident-response.md
    threshold_to_unlock: 3
```

`seed/progress/skill-matrix.yaml` (a new weighted domain):
```yaml
  reliability:
    label: Reliability (SRE)
    weight: 3
    skills:
      slos-and-error-budgets: { mastery: 0, confidence: 0, interview_readiness: 0, last_reviewed: null, review_due: null }
      observability:          { mastery: 0, confidence: 0, interview_readiness: 0, last_reviewed: null, review_due: null }
      incident-response:      { mastery: 0, confidence: 0, interview_readiness: 0, last_reviewed: null, review_due: null }
```

A new interview mode (add to `modules/interview-engine.md` + `interviews/rubrics/incident-response.md`):

> **Incident Response Drill** — present a realistic alert/outage. Score: triage &
> prioritization · hypothesis quality & use of telemetry · mitigation vs. root-cause ·
> communication/comms cadence · blameless postmortem quality. Run it live: give a symptom,
> reveal telemetry only when asked, and time the response.

That's it — the manager will now schedule SRE reviews, run incident-response mocks, detect
plateaus in `observability`, and track an SRE interview-readiness %, with zero changes to
the engine. Swap the data, keep the brain.

## Ship it as a fork

Put your path's *starting* state in `seed/` so cloners begin fresh (personal progress stays
git-ignored). Then tell us — open a PR adding your fork to the README's **Forks & spinoffs**
list.
