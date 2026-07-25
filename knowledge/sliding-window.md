---
concept: sliding-window
title: Sliding Window
domain: algorithms
difficulty: 3
prerequisites: [arrays, hash-maps]
mastery: 0
---

## Definition
Sliding window maintains a contiguous range `[left, right)` over an array or string and incrementally updates an aggregate (sum, count, character frequencies) as the window expands on the right and contracts on the left, rather than recomputing over the range each time. It comes in two forms: *fixed-size* windows (length `k` slides one step at a time) and *variable-size* windows (right expands greedily; left contracts while a constraint is violated). Because each element is added and removed at most once, the whole scan is `O(n)` even though the window's boundaries move independently.

## Why it matters
It is the definitive pattern for "longest/shortest/best contiguous subarray or substring satisfying a constraint," collapsing an `O(n^2)` or `O(n·k)` recompute into a single `O(n)` pass. Interviewers specifically probe whether you can identify when the constraint is *monotonic* enough for a window (expanding can only worsen it, contracting can only improve it) — that reasoning distinguishes a window from a problem that actually needs prefix sums or a different structure. Real-world analogs include streaming rate limiters, moving averages, and bandwidth/log aggregations over time windows.

## Common mistakes
- Forcing a window onto a problem without the monotonic property (e.g. arrays with negative numbers for a "sum >= target" — the window may need to grow after shrinking, breaking the invariant; prefix sums or a deque is needed).
- Updating the answer at the wrong time — for shortest-window problems, record the length *inside* the contraction loop, not after.
- Failing to fully shrink: using `if` instead of `while` on the contraction condition, leaving the window in an invalid state.
- Not removing the departing element from the frequency map when `left` advances, or leaving stale zero-count entries that corrupt a "distinct count" check.
- Off-by-one in fixed windows: the window becomes valid at `right >= k - 1`; emit only then.
- Recomputing the aggregate over the whole window each step, silently reintroducing `O(n·k)`.
- Mishandling the empty-window or single-character edge cases.

## Real-world applications
- Moving averages / rolling metrics over a time-ordered event array in a Node analytics job.
- Fixed-window rate limiting: count requests within the trailing time window per user key (a `Map`).
- "Longest run of healthy responses" or "smallest window covering all error types" over a log stream.
- Client-side search/typeahead scanning for the shortest span containing all query tokens.

## Implementations
```ts
// Variable window: longest substring without repeating characters. O(n).
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>(); // char -> last index
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    // If we've seen c inside the current window, jump left past it.
    if (lastSeen.has(c) && lastSeen.get(c)! >= left) {
      left = lastSeen.get(c)! + 1;
    }
    lastSeen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

// Fixed window: max sum of any subarray of length k. O(n).
function maxSubarraySum(nums: number[], k: number): number {
  let windowSum = 0, best = -Infinity;
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right];              // add entering element
    if (right >= k - 1) {                  // window is now size k
      best = Math.max(best, windowSum);
      windowSum -= nums[right - k + 1];    // remove leaving element
    }
  }
  return best;
}
```

## Practice problems
1. (easy) LeetCode 643 "Maximum Average Subarray I" — fixed-size window.
2. (medium) LeetCode 3 "Longest Substring Without Repeating Characters" — variable window with a map.
3. (hard) LeetCode 76 "Minimum Window Substring" — variable window with a need/have counter over character frequencies.

## Review schedule
Review 2 days after `hash-maps`, then 4 and 8 days — it is difficulty 3 and benefits from tighter early spacing. Interleave with `two-pointer` (its parent pattern) and `prefix-sum` (the alternative when the window property fails). During review, first classify the problem as fixed vs variable and state the monotonic invariant before coding.
