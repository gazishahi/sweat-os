---
concept: system-decomposition
title: System Decomposition
domain: architecture
difficulty: 4
prerequisites: [system-design-fundamentals, requirements-gathering]
mastery: 0
---

## Definition
System decomposition is breaking a system into components with clear responsibilities and
well-defined boundaries — deciding what the pieces are, what each owns, and how they talk
(sync vs async, what data crosses each boundary). It is the step between "here are the
requirements" and "here is the architecture": choosing the seams.

## Why it matters
Good boundaries are what make a system understandable, testable, and independently
scalable/deployable; bad ones create tight coupling that shows up later as cascading
failures and change-amplification (one feature touches five services). In interviews,
clean decomposition — and *justifying* the seams — is a strong senior/staff signal. In real
work it's the difference between a codebase that scales with the team and one that doesn't.

## Common mistakes
- **Boundaries by noun, not by responsibility/ownership** — splitting "because microservices"
  rather than around cohesion and change-together data.
- **Over-decomposition** — a distributed monolith with 12 chatty services and a shared DB,
  paying network + operational cost for no isolation benefit.
- **Under-decomposition** — one component owning unrelated concerns that should scale/deploy
  separately.
- Ignoring **sync vs async** at a boundary (calling synchronously where a queue belongs,
  coupling availability of the two sides).
- Letting components **reach into each other's data** (shared mutable database) instead of
  talking through contracts.
- Not stating the **tradeoff**: every split adds latency + failure modes + ops surface.

## Real-world applications
- Deciding service/module boundaries (e.g., separating an async billing worker from the
  request-path API) and whether they share or own their data.
- Drawing the seam between a Next.js server component layer and backend services.
- Introducing a queue to decouple a slow downstream from the user-facing request.

## Implementations
Heuristics to choose boundaries, with a worked example:

```text
CUT ALONG        cohesion (things that change together stay together);
                 ownership (one component owns its data, others use its API);
                 rate of change; different scaling/availability needs.
FOR EACH SEAM    responsibility (one sentence), interface (contract),
                 sync or async?, what data crosses, failure behavior if the other side is down.
SMELL CHECK      Would a single feature touch many components? -> boundaries are wrong.
```
Worked example — an e-commerce checkout: split `Orders` (owns order state, sync API),
`Payments` (external, wrap behind an adapter, retry + idempotency), `Inventory` (reserve
sync, replenish async), `Notifications` (fully async via queue — email/SMS must not block
or fail checkout). Justify: Payments is decoupled because it's slow and external;
Notifications is async because it's non-critical to the checkout's success path.

## Practice problems
1. (easy) Given a monolith description, name 3 components and each one's single responsibility.
2. (medium) For a food-delivery app, decide which interactions are sync vs async and why.
3. (hard) Take an over-decomposed design (10 services, shared DB) and re-draw the boundaries,
   defending each merge/split with a cohesion or scaling argument.

## Review schedule
Review alongside `system-design-fundamentals` and after `requirements-gathering`; it's
difficulty 4, so keep early spacing tight. On review, take any system and, in ~2 minutes,
propose its components + one sync/async decision + the tradeoff that decision buys.
