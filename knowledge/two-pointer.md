---
concept: two-pointer
title: Two Pointers
domain: algorithms
difficulty: 2
prerequisites: [arrays]
mastery: 0
---

## Definition
The two-pointer technique uses two indices that move over a sequence according to a rule, replacing a nested loop with a single linear pass. The two canonical shapes are *opposing pointers* (one from each end, converging — used on sorted arrays and palindromes) and *same-direction pointers* (a slow/fast or read/write pair — used for in-place filtering, cycle detection, and merging). By exploiting sorted order or a monotonic invariant, it drives many `O(n^2)` search problems down to `O(n)` time with `O(1)` extra space.

## Why it matters
It is the go-to optimization when a brute force compares all pairs and the data is sorted or can be sorted cheaply. Interviewers use it to test whether you can articulate *why* moving a pointer is safe — the correctness argument (which candidate answers you provably eliminate on each move) is the real signal, not the code. In real systems the same idea appears as merge steps in external sort, the merge in merge-sort, and read/write compaction passes that avoid allocating a second buffer.

## Common mistakes
- Applying opposing pointers to an *unsorted* array — the correctness argument for "move the smaller pointer" collapses without sorted order.
- Wrong loop bound: using `left < right` vs `left <= right` incorrectly, either missing the middle element or comparing an element with itself.
- Forgetting to skip duplicates in problems that require unique results (e.g. 3Sum), producing repeated tuples.
- Advancing both pointers when only one should move, silently skipping valid pairs.
- Infinite loops from failing to advance a pointer in some branch.
- With slow/fast in-place filtering, returning the wrong length (return the write index, and remember elements past it are stale).
- Ignoring integer overflow in other languages when summing two pointer values (less of an issue in JS, but note the habit).

## Real-world applications
- In-place removal/compaction of array elements in a Node data pipeline without allocating a new array (read/write pointers).
- Merging two already-sorted result sets (e.g. two ordered Postgres query streams) without a full re-sort.
- Detecting a cycle in a linked structure (Floyd's tortoise-and-hare) — job-dependency or pointer-chase validation.
- Validating palindromic or mirrored input (tokens, DNA-like sequences) in one pass.

## Implementations
```ts
// Opposing pointers on a SORTED array: two-sum returning 1-based indices.
function twoSumSorted(nums: number[], target: number): [number, number] | null {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const sum = nums[lo] + nums[hi];
    if (sum === target) return [lo + 1, hi + 1];
    if (sum < target) lo++;        // need a larger sum -> raise the low end
    else hi--;                     // need a smaller sum -> lower the high end
  }
  return null;
}

// Same-direction (slow/fast) in-place: remove all occurrences of `val`,
// returning the new length. O(n) time, O(1) space.
function removeElement(nums: number[], val: number): number {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== val) nums[write++] = nums[read];
  }
  return write; // nums[0..write) is the kept prefix
}
```

## Practice problems
1. (easy) LeetCode 125 "Valid Palindrome" — opposing pointers with character filtering.
2. (medium) LeetCode 11 "Container With Most Water" — greedy opposing pointers; justify moving the shorter wall.
3. (hard) LeetCode 42 "Trapping Rain Water" — two pointers with running max from each side.

## Review schedule
Review 1 day after `arrays`, then 3 and 7 days. Interleave with `sliding-window`, since a sliding window is a specialized same-direction two-pointer with a maintained invariant — practicing them together sharpens the distinction. When reviewing, always re-state the elimination argument aloud before writing code.
