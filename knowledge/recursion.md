---
concept: recursion
title: Recursion & Call Stack
domain: algorithms
difficulty: 3
prerequisites: [big-o]
mastery: 0
---

## Definition
Recursion is a technique where a function solves a problem by calling itself on smaller subproblems until it reaches a base case that can be answered directly. Each call pushes a stack frame — parameters, locals, and return address — onto the call stack; when a call returns, its frame is popped and control resumes in the caller. Correct recursion requires two things: a base case that terminates, and a recursive step that provably moves toward that base case. The maximum recursion depth is bounded by the call stack size, and exceeding it raises a stack overflow (`RangeError: Maximum call stack size exceeded` in V8/Node).

## Why it matters
Recursion is the natural expression for anything defined in terms of itself — trees, graphs, divide-and-conquer, and backtracking — so a large fraction of medium/hard interview problems assume fluency with it. Interviewers watch for whether you can identify the base case first, reason about how state accumulates across frames, and convert to iteration when depth is a risk. In production, unbounded recursion over deep or adversarial input (a deeply nested JSON payload, a linked structure with a cycle) is a real crash and denial-of-service vector. Understanding tail calls, memoization, and the exponential blowup of naive recursion (Fibonacci) separates engineers who write correct-but-slow code from those who write correct-and-fast code.

## Common mistakes
- Missing or unreachable base case, causing infinite recursion and a stack-overflow crash.
- Naive recursion with overlapping subproblems (e.g. Fibonacci) that is O(2^n) instead of memoizing down to O(n).
- Mutating shared state across recursive calls (a shared array/object) without undoing it on backtrack, so branches corrupt each other.
- Assuming JavaScript optimizes tail calls — V8 does not implement TCO, so deep tail recursion still overflows; convert to a loop or an explicit stack.
- Confusing the return value of the recursive call with a side effect — forgetting to actually `return` the recursive result.

## Real-world applications
- Traversing and transforming nested data: walking a Supabase/Postgres `jsonb` document, a React component tree, or a file-system directory listing in a Node script.
- Divide-and-conquer algorithms (merge sort, quicksort) and parser/AST evaluation in TypeScript tooling (ESLint, Babel, TS compiler all recurse over syntax trees).
- Backtracking for form/route generation, permission-tree evaluation, and combinatorial search behind features like Next.js dynamic route matching.

## Implementations
```ts
// Factorial — base case n <= 1. Depth grows O(n), so large n risks overflow.
function factorial(n: number): number {
  if (n <= 1) return 1; // base case
  return n * factorial(n - 1); // recursive step moves toward base
}

// Naive Fibonacci is O(2^n) due to overlapping subproblems.
// Memoized version is O(n) time, O(n) space.
function fib(n: number, memo: Map<number, number> = new Map()): number {
  if (n < 2) return n; // base cases: fib(0)=0, fib(1)=1
  const cached = memo.get(n);
  if (cached !== undefined) return cached;
  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Iterative form avoids call-stack depth entirely (safe for huge n).
function fibIterative(n: number): number {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}
```

## Practice problems
1. (easy) Fibonacci Number (LC 509) — naive vs. memoized, then iterative.
2. (medium) Generate Parentheses (LC 22) — backtracking with base case on length.
3. (hard) Word Search II (LC 212) — recursive DFS with backtracking over a trie.

## Review schedule
Difficulty-3 node; review at +2, +6, +16 days, with a checkpoint requiring the student to state the base case and recurrence before coding. Interleave with big-o (analyze recursion trees and the recurrence T(n) = 2T(n/2) + O(n)) and immediately after with trees, whose traversals are the purest application. Revisit alongside bfs-dfs to contrast recursion's implicit stack against an explicit one.
