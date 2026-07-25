---
concept: hash-maps
title: Hash Maps & Sets
domain: data-structures
difficulty: 2
prerequisites: [big-o, arrays]
mastery: 0
---

## Definition
A hash map stores key/value pairs in an array of buckets, using a hash function to map each key to a bucket index (`hash(key) % capacity`). Collisions — distinct keys landing in the same bucket — are resolved by *chaining* (each bucket holds a list) or *open addressing* (probe to the next free slot). With a good hash function and a bounded load factor, insert/lookup/delete are **average `O(1)`**, degrading to `O(n)` in the worst case (all keys collide). A set is the same structure storing only keys. It trades ordering and range queries for constant-time membership.

## Why it matters
The hash map is the single highest-leverage tool in interviews: it converts "search for X" from an `O(n)` scan into an `O(1)` lookup, collapsing countless `O(n^2)` brute forces to `O(n)`. Recognizing "I've seen this value before" or "count occurrences" as a hash-map cue is a core pattern-matching skill. In production, hash maps back caches, deduplication, symbol tables, database indexes (hash indexes), request routing tables, and memoization. Understanding load factor and rehashing explains latency spikes and memory blowups under scale.

## Common mistakes
- Using a plain object `{}` as a map: prototype keys (`__proto__`, `constructor`) collide with `Object.prototype`, all keys are coerced to strings, and `hasOwnProperty` checks are needed. Prefer `Map`/`Set`.
- Using object/array references as `Map` keys expecting value equality — `Map` uses identity, so `{a:1}` and a different `{a:1}` are distinct keys.
- Forgetting `NaN` and `-0` edge cases: `Map` treats `NaN` as equal to itself (SameValueZero), unlike `===`.
- Iterating a `Map`/`Set` and mutating it in the same loop.
- Quoting the `O(1)` guarantee without caveats — adversarial keys or a weak hash can force `O(n)` per op (a real DoS vector: hash-flooding).
- Choosing a hash map when you need ordering or range queries; a sorted structure/tree is the right tool.
- Serializing a `Map` with `JSON.stringify` — it produces `{}`; convert with `Object.fromEntries` or `[...map]`.

## Real-world applications
- Deduplicating IDs from a Supabase query result with `new Set(rows.map(r => r.id))` in `O(n)`.
- Memoizing expensive computations or React values keyed by input; request-scoped caches in Node.
- Postgres hash indexes and hash joins; grouping (`GROUP BY`) is implemented via hashing.
- Frequency counting for analytics (top-N events), and building adjacency maps for graph problems.

## Implementations
```ts
// Chaining hash map over a bucket array. Illustrates collisions + rehash.
class HashMap<K, V> {
  private buckets: [K, V][][] = Array.from({ length: 8 }, () => []);
  private size = 0;

  private hash(key: K): number {
    const s = String(key);
    let h = 2166136261; // FNV-1a
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) % this.buckets.length;
  }

  set(key: K, value: V): void {
    const b = this.buckets[this.hash(key)];
    const pair = b.find(([k]) => k === key);
    if (pair) { pair[1] = value; return; }
    b.push([key, value]);
    if (++this.size / this.buckets.length > 0.75) this.rehash(); // keep load factor low
  }

  get(key: K): V | undefined {
    return this.buckets[this.hash(key)].find(([k]) => k === key)?.[1];
  }

  private rehash(): void {
    const old = this.buckets;
    this.buckets = Array.from({ length: old.length * 2 }, () => []);
    this.size = 0;
    for (const b of old) for (const [k, v] of b) this.set(k, v);
  }
}
```

## Practice problems
1. (easy) LeetCode 1 "Two Sum" — the canonical value→index map, `O(n)`.
2. (medium) LeetCode 49 "Group Anagrams" — hash by sorted-key/char-count signature.
3. (hard) LeetCode 128 "Longest Consecutive Sequence" — `O(n)` using a set with a smart start-of-run check.

## Review schedule
Review 1 day after `arrays`, then 3 and 7 days. This is the workhorse node — interleave it with `sliding-window` (which uses maps for character/element counts) and `prefix-sum` (which uses maps for subarray-sum indices). Drill until "have I seen this before?" instantly triggers a set/map reach.
