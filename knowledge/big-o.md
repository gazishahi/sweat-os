---
concept: big-o
title: Big-O & Complexity Analysis
domain: algorithms
difficulty: 2
prerequisites: []
mastery: 0
---

## Definition
Big-O notation describes an upper bound on how an algorithm's running time or memory grows as its input size `n` grows toward infinity, ignoring constant factors and lower-order terms. It captures the *asymptotic* shape of the growth curve (e.g. `O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, `O(n^2)`, `O(2^n)`) rather than exact operation counts. Formally, `f(n) = O(g(n))` if there exist constants `c > 0` and `n0` such that `f(n) <= c·g(n)` for all `n >= n0`. Related bounds: `Omega` (lower bound) and `Theta` (tight bound, when upper and lower match).

## Why it matters
Complexity analysis is the shared vocabulary of every technical interview: "can you do better than O(n^2)?" is a rephrasing of most optimization prompts. Getting it right lets you reject a brute-force approach before writing code and justify a data-structure choice out loud. In real systems it is the difference between an endpoint that stays flat at 20ms and one that degrades from 20ms to 8s as a table grows from 1k to 1M rows. A senior engineer reasons about complexity when picking an index, sizing a cache, or deciding whether a nested loop over request payloads is safe under load.

## Common mistakes
- Confusing best/average/worst case: quicksort is `O(n log n)` average but `O(n^2)` worst; hash lookup is `O(1)` average but `O(n)` worst under collisions.
- Dropping the variable that actually dominates: string/array problems are often `O(n·m)` or `O(n·k)`, not `O(n)` — count *every* input dimension.
- Assuming `.includes()`, `.indexOf()`, `in` on arrays, or `Array.prototype.some` are cheap — they are `O(n)`, so a loop containing them is `O(n^2)`.
- Ignoring hidden costs of built-ins: `arr.unshift()`, `arr.splice(0, ...)`, and string concatenation in a loop are `O(n)` each.
- Confusing time and space complexity, or forgetting recursion's call-stack space (`O(depth)`).
- Reporting `O(2n)` or `O(n + 5)` — constants and lower-order terms are dropped; write `O(n)`.

## Real-world applications
- Choosing a `Map`/`Set` over `Array.includes` in a Node request handler to turn an `O(n^2)` dedupe into `O(n)`.
- Reading a Postgres `EXPLAIN ANALYZE` plan: a `Seq Scan` is `O(n)`, a B-tree `Index Scan` is `O(log n)` — the basis for adding an index in Supabase.
- Justifying pagination/virtualization in a React list: rendering all N rows is `O(n)` DOM work per update; windowing keeps it near `O(1)` in the viewport.
- Estimating whether an `O(n^2)` similarity check over uploaded records will time out a serverless function's execution limit.

## Implementations
```ts
// O(1): index access — independent of input size
const first = <T>(a: T[]): T | undefined => a[0];

// O(n): single pass
function sum(a: number[]): number {
  let total = 0;
  for (const x of a) total += x; // n iterations
  return total;
}

// O(n^2): nested pass — e.g. naive "has duplicate"
function hasDupNaive(a: number[]): boolean {
  for (let i = 0; i < a.length; i++)
    for (let j = i + 1; j < a.length; j++)
      if (a[i] === a[j]) return true; // ~n^2/2 comparisons -> O(n^2)
  return false;
}

// O(log n): binary search halves the search space each step
function binarySearch(a: number[], target: number): number {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (a[mid] === target) return mid;
    if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

## Practice problems
1. (easy) LeetCode 704 "Binary Search" — implement and state the complexity.
2. (medium) LeetCode 34 "Find First and Last Position of Element in Sorted Array" — achieve `O(log n)`.
3. (hard) LeetCode 4 "Median of Two Sorted Arrays" — the target is `O(log(m+n))`; argue why the obvious merge is `O(m+n)`.

## Review schedule
Foundational node: review daily for the first week, then at 3-day and 7-day intervals. Interleave with `arrays` and `hash-maps` so every data-structure operation is annotated with its cost. Re-derive complexity aloud for each new algorithm you learn — treat Big-O as an active checklist, not a fact to memorize.
