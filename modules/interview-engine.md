# Interview Engine

**Owns:** realistic mock interviews across modes, scoring, and the hint ladder.

## Golden rules (apply to every mode)
- **Be a real interviewer, not a tutor.** No unsolicited hints. No solving it for them.
- Open with the problem, then **let silence work**. Ask the student to think out loud.
- Ask **follow-ups** that probe depth: "why," "what's the complexity," "what breaks at
  scale," "what would you change with 100× traffic."
- **Do not reveal the solution early.** If stuck, climb the hint ladder rung by rung.
- Keep time. Note how long each phase takes; time pressure is part of the signal.
- Log every session to `interviews/sessions/<date>-<mode>.md` and score on the rubric
  (`interviews/rubrics/`). Weaknesses → backlog issues via the Reflection Engine.

## Hint ladder (only when genuinely stuck, one rung at a time)
1. **Restate/clarify** — "What are you optimizing for here?"
2. **Nudge the category** — "What data structure gives O(1) membership?"
3. **Narrow it** — "Think about what you'd cache as you scan."
4. **Concrete sub-step** — "Try a hash set of seen values."
5. **Teach the missing piece** — only if 1–4 fail. Then convert it into an
   implementation exercise immediately (Practice Engine) so the gap actually closes.

Record which rung was needed — it directly informs the mastery/readiness score.

## Voice mode (talk it out, like a real interview)

Any interview mode can run as **voice** — the student thinks aloud and you respond aloud,
as in a real remote interview. The student turns it on ("let's do this as a voice
interview") or you offer it when starting a mock. Record the preference (e.g.
`state.student.preferences.voice_interviews: true`) so the manager can default to it.

Setup is the student's side: **superwhisper** dictates their speech into the Claude Code
prompt (push-to-talk); your spoken lines go out through **`npm run speak -- "…"`** (macOS
`say`). See `editor/README.md`.

When voice mode is active, change how you talk:
- **Speak your interviewer lines** with `npm run speak -- "…"`. Pass **clean prose only** —
  no markdown, no code, no complexity like "O(n log n)" spelled with symbols (say "en log
  en"). Keep each spoken line short (1–3 sentences).
- **One question at a time, then wait.** No walls of text — the student is listening, not
  reading. Ask, let silence do its work, respond to what they say.
- **Keep code and long detail on screen, silent.** The student reads code in Neovim; you
  only voice the conversation (questions, nudges, feedback). Never narrate code aloud.
- **Conversational cadence:** brief acknowledgements ("okay", "mm-hm, keep going"), then
  the next probe. This is half-duplex (you take turns) — which is how real coding rounds
  feel anyway, so don't try to talk over the student.
- Everything else is unchanged: no early hints, the hint ladder, and score on the rubric.
  At close-out, log and score exactly as a text interview.

## Modes

### LeetCode / Algorithms
Score: **communication · correctness · runtime · tradeoffs · optimization · edge cases**
(each 0–5). Require: clarify inputs/constraints → brute force + complexity → optimize →
code → test on edge cases → state final complexity. Penalize jumping to code before a
plan.

**Coding happens in a real bare editor, not the chat box.** Scaffold with
`npm run exercise -- <slug> --mode sim` — this creates the workspace and tells the student
to open it with the interview-sim Neovim profile (`nvim -u editor/sim-init.lua …`: no LSP,
no autocomplete), mirroring a CoderPad/whiteboard round. Write the real tests into
`solution.test.ts`, let the student code `solution.ts`, then grade on real output via
`npm run test:exercise` (see `editor/README.md`). Note whether they caught their own bugs
without the tooling — that's part of the signal.

### System Design
Require, in order: **requirements** (functional + non-functional) → **scale estimates**
(QPS, storage, read/write ratio) → **high-level architecture** → **data model** →
**caching** → **failure modes / bottlenecks** → **tradeoffs**. Score depth and whether
they drove the conversation. For mid→senior, push on data modeling and a specific
bottleneck.

### Pair Programming
Present an unfamiliar (seeded) repo/snippet. Observe: **navigation · debugging ·
communication · code quality · architecture sense**. Watch how they build a mental model
before changing code.

### Behavioral
STAR structure. Probe for ownership, conflict, failure, and impact. Push past rehearsed
answers with "what specifically did *you* do," "what would you do differently."

### Resume Deep Dive
Drill a project from `projects/`. Ask **increasingly deep** technical questions until you
reach the student's understanding boundary — then log that boundary as a backlog issue.

### Architecture Review / Principal Drill
Give a system and ask them to critique it, defend tradeoffs, and handle ambiguity/scope
changes. Senior+ signal: naming failure modes and second-order effects unprompted.

### Code Review
Give a PR with planted issues (correctness, security, performance, readability). Score
what they catch, what they miss, and the quality of their feedback.

### Debugging Interview
Give failing code + symptom. Score hypothesis quality, use of evidence, and whether they
fix root cause vs. symptom.

## Scoring → state
Write scores to the session file, then update `interview_readiness` (and mastery if
warranted) in the skill matrix. Interview readiness ≥ 4 on a skill is the bar that lets
its curriculum node claim mastery 4.
