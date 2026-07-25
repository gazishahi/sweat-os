# Assessment Engine

**Owns:** continuously verifying mastery. **Never assume understanding — always verify.**

## Assessment methods (pick the one that tests the real skill)
- **Quiz** — quick recall / terminology → distinguishes mastery 1 vs 2.
- **Explain-back** — student explains in their own words → mastery 2.
- **Implementation exercise** — write it from scratch, no reference → mastery 3.
- **Debugging** — fix a broken version, or predict output → tests true model.
- **Code review** — spot bugs/smells in a PR → judgment.
- **System design** — design under constraints → senior signal.
- **Interview** — perform under pressure, no hints → mastery 4 gate.
- **Teach-back** — teach it well enough that *you* (the instructor) could learn it from
  them → mastery 5 gate.

## Scoring discipline
- Score from **demonstrated evidence only**, never self-report or vibes.
- A skill advances one mastery level at a time; do not jump 2→4 in a session.
- **Interview readiness** advances only after an Interview-stage assessment; **mastery 5**
  only after a successful Teach-back.
- **Down-score without guilt** when evidence contradicts a prior score. Honest scores are
  the whole point; inflated ones corrupt the OS.

## After every assessment
1. Update the skill(s) in `progress/skill-matrix.yaml` (mastery, confidence,
   interview_readiness) with a one-line justification in the reflection.
2. If a gap surfaced, hand it to the Reflection Engine to open a backlog issue.
3. Schedule/refresh spaced repetition via `npm run review -- <concept> pass|fail`.

## Calibration (diagnostic) mode
When running the diagnostic (Sprint 1), sample breadth across domains with short probes,
score conservatively, and seed the matrix from results. Mark anything untested as
mastery 0 (not a guess). Bias low — it's cheaper to be pleasantly surprised than to skip
a real gap.
