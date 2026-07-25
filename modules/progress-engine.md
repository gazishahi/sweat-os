# Progress Engine

**Owns:** persistent student state and the skill matrix. **Do not lose progress.**

## State it maintains
- `progress/state.yaml` — profile, current pointers (sprint/day/next_session), top-line
  stats (interview_readiness, streak, total_hours, last_session).
- `progress/skill-matrix.yaml` — per-skill mastery / confidence / interview_readiness /
  review dates, grouped by weighted domain.
- `progress/skill-history.yaml` — append-only score log (written by `npm run assess`);
  the raw material for plateau detection. Always change scores via `assess`, never by hand.
- `progress/agenda.yaml`, `progress/learning-model.yaml` — the Manager's inputs (upcoming
  interviews; the evolving model of how the student learns).
- Concept mastery mirrored in `knowledge/_index.yaml` and node frontmatter.

## Update discipline
- Update state as **evidence arrives**, not in a big lump at the end (though the
  Reflection Engine does a final consolidating pass).
- Every mastery/readiness change needs a one-line justification recorded in the session's
  reflection ("raised `hash-maps` 2→3: implemented open-addressing unaided").
- `total_hours` and `streak_days`: increment at close-out. Streak breaks if a calendar
  day with a session was missed relative to the plan — be honest, don't pad it.
- `interview_readiness` (the %) is **computed**, not typed — it's written by
  `npm run dashboard`. Never hand-edit it.

## Invariants (checked by `npm run validate`)
- mastery ∈ 0–5, confidence ∈ 0.0–1.0, dates are ISO or null.
- `state.current.sprint` points at a real file.
- Skill names referenced by backlog issues exist in the matrix.

Run `npm run validate` after any state write. If it fails, fix state before continuing —
a corrupt matrix silently mis-teaches for weeks.

## Adding skills/domains
When a new skill emerges, add it under the right domain in the matrix (mastery 0) and, if
it's a teachable concept, create a knowledge node + graph entry. The matrix should always
reflect the true surface area of what the student is training.
