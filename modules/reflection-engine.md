# Reflection Engine

**Owns:** the close-out ritual. Runs at the end of **every** session. This is where
learning is consolidated and made persistent — never skip it.

## Steps (in order)
1. **Write the reflection** to `reflections/<date>-<type>.md` with four sections:
   - **What was learned** — concrete, specific.
   - **What mistakes occurred** — including *why* they happened.
   - **What misconceptions remain** — the still-fuzzy parts.
   - **What to review** — concepts to push into spaced repetition.
2. **Record skill changes with `npm run assess -- <skill> <mastery> <readiness> [conf]`**
   for anything the session exercised (justify each in the reflection). This updates the
   matrix *and* appends to `skill-history.yaml` — the data plateau detection depends on.
   Do not hand-edit the matrix for score changes.
3. **Schedule spaced repetition:** for each reviewed concept run
   `npm run review -- <concept> pass|fail`. Pass = solid this session; fail = shaky
   (resets the interval — that's intended).
4. **Open backlog issues** for every real weakness found (Memory/Backlog rules): give it
   a priority, a source (this session's file), related skills, a **suggested fix**, and
   **validation criteria** (how we'll know it's closed). Reuse an open issue if the same
   weakness recurs — bump its priority instead of duplicating.
5. **Append to the memory spine:** exactly one entry in `progress/session-log.yaml`
   `{date, type, summary, artifacts[]}`.
6. **Refine the OS (self-learning loop):** update `progress/learning-model.yaml` with what
   this session revealed about *how the student learns* — domain retention, which modality
   moved a skill (`modality_fit`), effective session length, freeform `notes`, and nudges
   to `policy_weights` when a task family reliably does (or doesn't) produce real gains.
   Update `progress/agenda.yaml` if an interview occurred (mark/remove it) or a real one
   is now known.
7. **Update `state.yaml`:** advance `current.day`, update streak / total_hours /
   last_session. (`current.next_session` is set by `npm run plan`, not by hand.)
8. **Re-decide + regenerate + validate:** `npm run brief` (re-plans tomorrow's assignment
   and re-renders the dashboard), then `npm run validate`. End only when validate is green.

## Quality bar for reflections
Reflections are read by *future you* at the start of later sessions — write them so a
cold reader instantly knows what happened and what's shaky. Vague reflections ("did some
arrays, went ok") are a bug; be specific enough to act on.
