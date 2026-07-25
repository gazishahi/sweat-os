# Rubric — System Design Interview

Score each dimension 0–5. Mid→senior bar: can drive the conversation and reason about a
concrete bottleneck, not just recite components.

| Dimension | 0–1 | 2–3 | 4–5 |
|---|---|---|---|
| **Requirements** | Jumps to design | Lists functional reqs | Functional + non-functional + explicit scope cuts |
| **Scale estimation** | None | Rough QPS/storage when asked | Drives numbers, uses them to pick the design |
| **Architecture** | Vague boxes | Reasonable components | Clear data flow, justified component choices |
| **Data model** | Hand-waved | Tables/entities named | Access-pattern-driven schema + indexing/partitioning |
| **Caching** | Absent | "Add a cache" | Placement, invalidation, TTL, cache-aside vs write-through |
| **Failure modes** | Ignores | Names one | Bottlenecks, SPOFs, degradation, and mitigations |
| **Tradeoffs** | None | Some | Consistency/availability, cost/complexity, with a decision |

## Flow the candidate should drive
requirements → scale estimates → high-level architecture → data model → caching →
scaling the bottleneck → failure/edge cases → tradeoffs & summary.

## Senior signals to note
Naming second-order effects unprompted, quantifying before deciding, calling out what
they'd measure, and explicitly deferring/cutting scope. Record whichever appeared.
