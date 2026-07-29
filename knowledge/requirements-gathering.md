---
concept: requirements-gathering
title: Requirements Gathering
domain: product-engineering
difficulty: 3
prerequisites: [system-design-fundamentals]
mastery: 0
---

## Definition
Requirements gathering is the disciplined first move of any design: converting a vague ask
into an explicit, bounded contract before proposing a solution. It splits into **functional**
requirements (what the system must *do*) and **non-functional** requirements (scale,
latency, availability, consistency, durability, cost, security) — and, just as importantly,
an explicit list of what is **out of scope**.

## Why it matters
It is the step interviewers watch most closely, because scoping ambiguity is the core of
senior work. A candidate who asks two sharp clarifying questions and states assumptions
out loud reads as senior; one who starts drawing immediately reads as junior. In real work,
most rework and missed deadlines trace back to requirements never made explicit.

## Common mistakes
- **Skipping straight to a solution** — the single most common system-design failure.
- Gathering only **functional** requirements and forgetting the non-functionals (scale,
  latency, consistency) that actually determine the architecture.
- Asking open-ended "any other requirements?" instead of **proposing** assumptions to
  confirm ("I'll assume ~10M DAU and read-heavy, ~100:1 reads:writes — okay?").
- Never **cutting scope** — trying to design everything instead of naming what's excluded.
- Not writing down the agreed requirements, then contradicting them later.

## Real-world applications
- Kicking off a feature: a crisp requirements paragraph at the top of the design doc.
- Triaging a bug report into a reproducible, bounded problem statement.
- Turning a stakeholder's "make it faster" into a measurable target (p95 < 200ms).

## Implementations
A checklist to run in the first ~3–5 minutes of any design:

```text
FUNCTIONAL      Who are the users? Core actions? What's explicitly NOT included (v1)?
NON-FUNCTIONAL  Scale (users/QPS/data)? Latency target? Consistency vs availability?
                Durability? Read:write ratio? Growth?
ASSUMPTIONS     State them as proposals to confirm, not open questions.
SUCCESS         What does "good" look like — the one metric this must move?
```
Worked example — "design Twitter": functional = post, follow, view timeline; non-functional
= 300M users, read-heavy (~1000:1), timeline p95 < 200ms, eventual consistency OK for the
feed; out of scope (v1) = DMs, search, ads.

## Practice problems
1. (easy) Given "design a chat app," write 3 functional + 4 non-functional requirements in 3 min.
2. (medium) For "design Uber," propose the assumptions (scale, consistency) rather than asking.
3. (hard) Take a one-line prompt and defend two *different* designs that follow from two
   different sets of non-functional requirements.

## Review schedule
Drill in short reps at the start of every system-design mock; interleave with
`system-design-fundamentals` and `system-decomposition`. On review, take any product in ~60
seconds and rattle off functional + non-functional + one explicit scope cut.
