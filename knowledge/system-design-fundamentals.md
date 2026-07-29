---
concept: system-design-fundamentals
title: System Design — The Process
domain: system-design
difficulty: 3
prerequisites: [http]
mastery: 0
---

## Definition
System design is the skill of turning an ambiguous prompt ("design a URL shortener")
into a concrete, defensible architecture under explicit constraints. In an interview it
is a *process*, not a diagram: clarify requirements → estimate scale → sketch a high-level
architecture → design the data model → address caching/scaling → name failure modes and
bottlenecks → state the tradeoffs you chose and why. The artifact matters less than the
reasoning and the order you reason in.

## Why it matters
For mid→senior interviews this is often the highest-signal round: it shows whether you can
scope ambiguity, quantify before deciding, and reason about tradeoffs instead of reciting
components. It is also the daily reality of real engineering — every feature is a small
system design. Candidates fail not from missing a buzzword but from skipping steps (coding
the design before agreeing on requirements, or hand-waving scale).

## Common mistakes
- **Designing before scoping.** Drawing boxes before pinning functional + non-functional
  requirements and cutting scope explicitly.
- **No numbers.** Not estimating QPS / storage / read:write ratio, so every later choice
  is unjustified ("add a cache" — for what hit rate, evicting what?).
- **Component name-dropping** without saying why *this* component solves *this* constraint.
- **Ignoring the bottleneck.** A senior signal is picking one part and going deep
  (the hot path, the write amplification, the single point of failure).
- **Never stating tradeoffs.** Choosing consistency vs availability, cost vs complexity —
  and defending it — is the point.
- **Losing the thread** — jumping around instead of driving the standard flow top-to-bottom.

## Real-world applications
- Designing a feature at a startup: rate-limited API, a Postgres schema that matches the
  access pattern, a Redis cache, a queue for async work — the same flow at smaller scale.
- Writing a design doc / RFC before building (this node *is* the RFC skeleton).
- Reviewing someone else's design and spotting the missing failure-mode analysis.

## Implementations
A reusable interview framework — drive it in this order, out loud:

```text
1. REQUIREMENTS   functional (what it must do) + non-functional (scale, latency,
                  consistency, availability) + explicit out-of-scope cuts
2. ESTIMATE       users, QPS (peak = ~2–3× average), storage/yr, read:write ratio
3. API            a few core endpoints / contracts
4. HIGH-LEVEL     client → LB → service(s) → data stores; draw the request path
5. DATA MODEL     entities + the ONE access pattern that drives the schema + indexing
6. SCALE          find the bottleneck; apply caching / replication / partitioning / queues
7. FAILURE        SPOFs, degradation, what you'd monitor
8. TRADEOFFS      the 2–3 decisions you made and the alternative you rejected, with reason
```

## Practice problems
1. (easy) Design a pastebin / URL shortener — practice the full flow end-to-end once.
2. (medium) Design a rate limiter — force real QPS math and a data-structure choice.
3. (hard) Design a news feed (fan-out on write vs read) — a genuine tradeoff with numbers.

## Review schedule
Enters spaced repetition after the first end-to-end mock; interleave with `requirements-gathering`
and `system-decomposition` (its two sub-skills) and with `caching`. On review, don't
re-solve a whole problem — recite the 8-step flow from memory and name one tradeoff per step.
