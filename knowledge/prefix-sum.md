---
concept: prefix-sum
title: Prefix Sum
domain: algorithms
difficulty: 2
prerequisites: [arrays]
mastery: 0
---

## Definition
A prefix sum (cumulative sum) array `P` stores `P[i] = a[0] + a[1] + ... + a[i-1]`, with `P[0] = 0`. Once built in `O(n)`, the sum of any subarray `a[l..r)` is `P[r] - P[l]` in `O(1)`. It trades `O(n)` precomputation and `O(n)` extra space for constant-time range queries, converting repeated range-sum work from `O(n)` per query to `O(1)`. The idea generalizes to prefix products, prefix XOR, prefix counts, 2D prefix sums (for submatrix sums), and — combined with a hash map — to counting subarrays whose sum equals a target.

## Why it matters
Prefix sums are the answer whenever a problem asks about *many* range aggregates or about subarrays defined by a cumulative condition, especially when a sliding window fails because values can be negative. The map-based variant ("number of subarrays summing to k") is a top-tier interview pattern that trips up candidates who only know windows. In production the same precompute-once/query-many shape underlies analytics rollups, cumulative charts, and range queries — and the 2D version powers image integral tables (Viola-Jones), where box sums must be `O(1)`.

## Common mistakes
- Off-by-one in the index convention: mixing an inclusive prefix array with exclusive query math. Use `P` of length `n+1` with `P[0]=0` and `sum(l,r) = P[r+1]-P[l]` (inclusive) consistently.
- Reaching for a sliding window on a "subarray sum equals k" problem with negatives — the window invariant breaks; use prefix sum + hash map instead.
- In the map variant, forgetting to seed the map with `{0: 1}` to account for prefixes that themselves equal the target.
- Storing the wrong thing in the map (storing sums-count vs first-index) for the problem asked (counting vs longest).
- Mutating the input to hold prefixes when the original values are still needed later.
- Integer overflow in fixed-width languages for large ranges (note the habit even if JS uses doubles).
- Building a prefix array for a single query — that's wasted `O(n)` space; just loop.

## Real-world applications
- Precomputing cumulative revenue/usage so a dashboard can answer arbitrary date-range totals in `O(1)` instead of re-aggregating (mirrors a Postgres materialized rollup).
- SQL `SUM() OVER (ORDER BY ...)` window functions are prefix sums computed in the database.
- 2D prefix sums for fast submatrix queries in image processing / heatmap tooling.
- Difference arrays (the inverse trick) to apply many range increments in `O(1)` each, then reconstruct — used in interval booking/availability computations.

## Implementations
```ts
// Build once, then O(1) inclusive range sums a[l..r].
function makePrefix(a: number[]): (l: number, r: number) => number {
  const P = new Array<number>(a.length + 1).fill(0);
  for (let i = 0; i < a.length; i++) P[i + 1] = P[i] + a[i]; // O(n)
  return (l, r) => P[r + 1] - P[l]; // O(1) per query
}

// Map variant: count subarrays whose sum equals k (handles negatives). O(n).
function subarraySum(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]); // prefix-sum -> occurrences
  let running = 0, count = 0;
  for (const x of nums) {
    running += x;
    // number of earlier prefixes P such that running - P === k
    count += seen.get(running - k) ?? 0;
    seen.set(running, (seen.get(running) ?? 0) + 1);
  }
  return count;
}
```

## Practice problems
1. (easy) LeetCode 303 "Range Sum Query - Immutable" — the canonical prefix array.
2. (medium) LeetCode 560 "Subarray Sum Equals K" — prefix sum + hash map, seed `{0:1}`.
3. (hard) LeetCode 304 "Range Sum Query 2D - Immutable" — 2D prefix sums with inclusion-exclusion.

## Review schedule
Review 1 day after `arrays`, then 3 and 7 days. Deliberately interleave with `sliding-window`: practice a matched pair (a positive-only "subarray >= target" window vs a with-negatives "sum == k" prefix problem) so you learn to pick the right tool. Pair the map variant with `hash-maps` review to reinforce the count-what-you've-seen pattern.
