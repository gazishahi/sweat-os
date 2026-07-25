---
concept: caching
title: Caching Strategies
domain: system-design
difficulty: 3
prerequisites: [hash-maps, http]
mastery: 0
---

## Definition
Caching stores the result of an expensive computation or fetch in a faster, closer, or cheaper store so subsequent reads avoid the original cost. A cache is defined by its read/write policy (cache-aside, write-through, write-back), its eviction/expiry policy (TTL plus an eviction algorithm like LRU when capacity is bounded), and its invalidation strategy (how stale entries are removed when the source of truth changes). Because a cache is a second copy of data, correctness reduces to one hard question — keeping it consistent with the source — which is why "there are only two hard things in computer science: cache invalidation and naming things" is a cliché rooted in real pain.

## Why it matters
Caching is the highest-leverage performance tool in system design and appears in almost every scaling interview ("your read latency is too high / your DB is saturated — what do you do?"). The subtle part interviewers probe is not "add a cache" but the consistency and invalidation tradeoffs, and knowing which layer to cache at (CDN, application/Redis, or DB). In production, a mis-tuned cache causes stale-data bugs, thundering-herd stampedes when a hot key expires, and memory exhaustion — problems that only surface under load.

## Common mistakes
- Caching without an invalidation plan, so users see stale data after a write. Decide up front: TTL-only, write-through, or explicit delete-on-write.
- The dual-write inconsistency: updating DB then cache (or cache then DB) non-atomically. A crash between the two leaves them divergent; prefer cache-aside with delete-after-commit, and accept a brief miss over a wrong value.
- Cache stampede / thundering herd: a popular key expires and thousands of requests all miss and hit the DB simultaneously. Mitigate with locking/single-flight, jittered TTLs, or `stale-while-revalidate`.
- Confusing eviction with expiration: TTL removes stale data (correctness/freshness); LRU/LFU eviction removes cold data under memory pressure (capacity). You often need both.
- Caching per-user or auth-scoped data in a shared/CDN cache, leaking one user's data to another (missing `Cache-Control: private` / cache key omitting the user).
- Choosing write-back for data you can't afford to lose — write-back acknowledges before persisting, so a crash loses recent writes.

## Real-world applications
- Redis as an application cache in front of Postgres/Supabase for hot lookups (session data, feature flags, rendered feed pages) using cache-aside.
- CDN (Vercel/Cloudflare) caching static assets and SSR/ISR pages via `s-maxage` + `stale-while-revalidate`.
- Next.js Data Cache / `revalidateTag` for on-demand invalidation of fetched data after a mutation.
- React Query / SWR as a client-side cache with stale-while-revalidate semantics and cache-key-based invalidation.
- Postgres shared buffers / OS page cache as a transparent DB-layer cache; materialized views as a precomputed cache you `REFRESH`.

## Implementations
```ts
// Cache-aside (lazy loading) with Redis in front of Postgres
async function getUser(id: string): Promise<User> {
  const key = `user:${id}`;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);          // cache hit

  const user = await db.query(...);         // miss -> load source of truth
  await redis.set(key, JSON.stringify(user), "EX", 300); // TTL 300s
  return user;
}

// On write: update DB, then invalidate (delete) — safer than writing the cache
async function updateUser(id: string, patch: Partial<User>) {
  await db.update(...);                      // source of truth first
  await redis.del(`user:${id}`);             // next read repopulates
}

// Minimal LRU cache in TypeScript (Map preserves insertion order)
class LRU<K, V> {
  private map = new Map<K, V>();
  constructor(private cap: number) {}
  get(k: K): V | undefined {
    if (!this.map.has(k)) return undefined;
    const v = this.map.get(k)!;
    this.map.delete(k); this.map.set(k, v); // mark most-recently-used
    return v;
  }
  set(k: K, v: V) {
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value); // evict LRU
  }
}
```

## Practice problems
1. (easy) For a "user profile" read that changes rarely, choose a caching layer and policy and justify the TTL. Contrast with a "live sports score" read.
2. (medium) Implement a generic LRU cache in TypeScript with O(1) get/set and a capacity bound; then extend it to support per-entry TTL.
3. (hard) Design cache invalidation for a Next.js + Supabase feed: a post edit must reflect within seconds across CDN, Redis, and client caches. Address the dual-write problem, cache stampede on a viral post, and how you'd key private vs public entries.

## Review schedule
Introduce after `hash-maps` (the eviction map) and `http` (cache headers/CDN). Review at 1d / 3d / 7d / 21d. Interleave with `transactions` (invalidate only after commit) and `http` (`Cache-Control`, `ETag`). Re-test by having the student pick cache-aside vs write-through vs write-back for three given workloads and defend the choice.
