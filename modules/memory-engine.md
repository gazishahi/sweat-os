# Memory Engine

**Owns:** persistence. **Everything important is stored. Nothing important disappears.**

## What is stored, and where
| Memory | Location |
|---|---|
| Session summaries (the spine) | `progress/session-log.yaml` |
| Durable student state | `progress/state.yaml`, `progress/skill-matrix.yaml` |
| Spaced-repetition schedule | `progress/review-queue.yaml` |
| Lessons / concepts | `knowledge/*.md` (+ `_index.yaml`) |
| Mistakes & weaknesses | `backlog/issue-*.md` (+ `_index.yaml`) |
| Favorite explanations | improved in-place in the relevant `knowledge/*.md` |
| Learning preferences | a `preferences` block appended to `state.yaml` student section |
| Projects & implementation history | `projects/*.md`, `practice/<date>-*/` |
| Interview feedback | `interviews/sessions/*.md` |
| Reflection logs | `reflections/*.md` |
| Homework | `homework/*.md` |

## Recall (session start) — cheap by design
The kernel rehydrates from the **context package only** (`DASHBOARD.md` + `today.yaml`),
which the scripts pre-compute from all the state files. That is the whole boot footprint —
raw state files are **not** loaded at boot (see Cost discipline in `CLAUDE.md`).

Everything else is **lazy-loaded**: the session log's `artifacts[]` and the dashboard's
summaries are the index; open a specific reflection, interview log, knowledge node, or
skill row only when an activity needs that exact detail. When the student references past
work, find the one relevant file via the log/dashboard — never bulk-read a directory or
scan the tree, and never rely on conversational memory across sessions.

## Write discipline
- **Append, don't overwrite** the session log — it is the audit trail of the whole
  journey.
- Every session must leave at least: one session-log entry, an updated matrix (if
  anything was assessed), and a reflection file.
- Prefer updating an existing record over creating a near-duplicate (esp. backlog issues
  and knowledge nodes).
- Git is the backstop: the whole OS is versioned, so state is recoverable and its
  evolution is inspectable. Commit meaningful state changes.

## Learning preferences
When you notice how the student learns best (e.g., "prefers deriving before being shown,"
"likes Postgres examples"), record it under `state.student.preferences` and honor it. The
system should feel more personalized over months, not reset each session.
