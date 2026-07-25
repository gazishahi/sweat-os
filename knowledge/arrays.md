---
concept: arrays
title: Arrays & Dynamic Arrays
domain: data-structures
difficulty: 2
prerequisites: [big-o]
mastery: 0
---

## Definition
An array is a contiguous block of memory holding elements of uniform size, giving `O(1)` random access by index via pointer arithmetic (`base + i·size`). A *dynamic array* (JavaScript's `Array`, C++ `vector`, Python `list`) wraps this with automatic resizing: it tracks a `length` and a larger `capacity`, and when a push exceeds capacity it allocates a bigger backing store (typically 1.5–2x) and copies existing elements over. This doubling strategy makes `push` **amortized `O(1)`** even though individual grow-triggering pushes are `O(n)`.

## Why it matters
Arrays are the default container in almost every interview and the substrate under strings, matrices, heaps, and hash-map buckets. Knowing which operations are `O(1)` (access, push/pop at end) versus `O(n)` (insert/delete at front or middle, search) drives correct algorithm choices — most two-pointer, sliding-window, and prefix-sum techniques exist specifically to exploit contiguous layout and cheap indexing. In real systems, arrays' cache-friendliness (sequential memory) makes them dramatically faster to iterate than linked structures, even when both are "`O(n)`".

## Common mistakes
- Using `unshift`/`shift` or `splice` in a loop: each is `O(n)`, silently making the loop `O(n^2)`. Prefer pushing and reversing, or a deque.
- Mutating an array while iterating it with indices, causing skipped or repeated elements.
- Assuming `delete arr[i]` removes an element — it leaves a `hole` (empty slot) and does not change `length`; use `splice`.
- Sparse arrays and holes: `[1,,3]` and `new Array(3)` behave surprisingly with `map`/`forEach` (holes are skipped) versus `length`-based loops.
- Off-by-one errors on bounds (`<=` vs `<`, `length - 1`).
- Copying by reference: `const b = a` aliases; use `[...a]` or `structuredClone` for independence, and note both are `O(n)`.
- Assuming JS arrays are true contiguous arrays — engines may deopt to dictionary mode with sparse/mixed-type usage, losing `O(1)` guarantees.

## Real-world applications
- Any React list render maps over an array; unstable or index-based `key` props cause incorrect reconciliation on insert/reorder.
- Node stream/batch processing: accumulating chunks in an array then `Buffer.concat` / `join`.
- Postgres/Supabase returns query results as row arrays; `.in()` filters and `unnest()` operate over array columns.
- Ring buffers backed by a fixed array power rate limiters and fixed-size in-memory logs.

## Implementations
```ts
// Dynamic array with explicit capacity to show amortized O(1) push.
class DynamicArray<T> {
  private data: (T | undefined)[] = new Array(1);
  private capacity = 1;
  length = 0;

  get(i: number): T {
    if (i < 0 || i >= this.length) throw new RangeError("index out of bounds");
    return this.data[i] as T;
  }

  push(value: T): void {
    if (this.length === this.capacity) this.resize(this.capacity * 2); // O(n), rare
    this.data[this.length++] = value; // O(1), common
  }

  pop(): T | undefined {
    if (this.length === 0) return undefined;
    const v = this.data[--this.length];
    this.data[this.length] = undefined; // release reference
    return v;
  }

  private resize(newCap: number): void {
    const next = new Array<T | undefined>(newCap);
    for (let i = 0; i < this.length; i++) next[i] = this.data[i]; // copy: O(n)
    this.data = next;
    this.capacity = newCap;
  }
}

// Amortized analysis: growing from 0..n triggers copies at 1,2,4,...,n.
// Total copy work = 1 + 2 + 4 + ... + n < 2n = O(n) across n pushes
// => O(1) amortized per push.
```

## Practice problems
1. (easy) LeetCode 26 "Remove Duplicates from Sorted Array" — in-place, `O(1)` extra space.
2. (medium) LeetCode 238 "Product of Array Except Self" — no division, `O(n)`.
3. (hard) LeetCode 41 "First Missing Positive" — `O(n)` time, `O(1)` space using the array itself as a hash.

## Review schedule
Review 1 day after `big-o`, then at 3 and 7 days. Immediately before starting `two-pointer` and `prefix-sum`, since both assume fluency with in-place index manipulation. Interleave amortized-cost reasoning with the `hash-maps` node, which relies on the same array-doubling idea for its bucket store.
