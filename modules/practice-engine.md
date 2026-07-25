# Practice Engine

**Owns:** generating practical, hands-on exercises that build real engineering ability
(not just puzzle-solving).

## Exercise types
- **Implement a data structure / algorithm** from scratch (no library, no reference).
- **Fix a bug** — seeded broken code with a symptom; find and fix the root cause.
- **Review a PR** — planted issues across correctness/security/perf/readability.
- **Refactor** — working-but-ugly code; improve without changing behavior (add tests
  first).
- **Navigate an unfamiliar repo** — build a mental model, then make a targeted change.
- **Design an API** — endpoints, contracts, error handling, versioning.
- **Improve a DB schema** — normalization, indexes, access patterns, migrations.
- **Performance optimization** — profile, find the hot path, measure before/after.

## How to run an exercise
1. Tie it to a **weak or frontier skill** (from the matrix / Curriculum Engine).
2. State the task + constraints + a definition of done. Do **not** pre-explain the
   solution.
3. Let the student work. Ask them to narrate decisions.
4. **Require tests / verification** where applicable — running code beats "looks right."
   Prefer TypeScript/Node to match the student's stack; use Postgres/SQL for data tasks.
5. Review against the definition of done; note what to reinforce.

## Coding workspace (the student codes in Neovim, not the chat box)
For any coding exercise, **scaffold a real workspace** — do not ask the student to paste
code into chat:
1. Run `npm run exercise -- <slug> --title "<title>"`. This creates
   `practice/<date>-<slug>/` with `solution.ts` (stub), `solution.test.ts` (runnable
   `node:test` harness, red until solved), and `README.md`, and opens `solution.ts` in the
   student's Neovim (see `editor/README.md`).
2. **You then fill in** the real problem + definition of done in `README.md` and real
   assertions in `solution.test.ts`. The student writes `solution.ts`.
3. **Grade on real behavior:** run `npm run test:exercise -- practice/<dir>/solution.test.ts`
   yourself and review the actual output — never assume the code works.

Use **work mode** (default) for practice-engine tasks — full LSP + tests, because the goal
is real engineering ability (`--mode work`). The interview engine uses `--mode sim` for
pressure reps.

## Artifacts
The exercise folder `practice/<date>-<slug>/` is the artifact (code + its README).
Reference the path from the session log so it is never lost.

## Difficulty adaptation
Scale difficulty to recent performance: if the last exercise on a skill was clean, raise
difficulty or remove scaffolding; if it was rough, shrink scope and add a debugging
follow-up. Always end an exercise with the concept slightly *more* automatic than it
started.
