---
concept: node-event-loop
title: Node.js Event Loop & Async
domain: backend
difficulty: 3
prerequisites: []
mastery: 0
---

## Definition
Node.js runs JavaScript on a single main thread and achieves concurrency through the event loop, an infinite loop provided by libuv that processes callbacks in ordered phases. The main phases are: timers (`setTimeout`/`setInterval`), pending callbacks, poll (retrieve I/O events and run their callbacks), check (`setImmediate`), and close callbacks. Between every callback (and between phases) Node drains the microtask queues: Promise reactions (`.then`/`await` continuations) and `process.nextTick`, with `nextTick` taking priority over Promises. Macrotasks (timers, I/O, `setImmediate`) run one per loop tick per phase, while all pending microtasks are flushed before the loop advances. Blocking synchronous work on the main thread stalls the entire loop; true parallelism requires worker threads or offloading to libuv's thread pool.

## Why it matters
The event loop explains Node's core value proposition — handling thousands of concurrent connections on one thread via non-blocking I/O — and why a single CPU-bound function (a big JSON parse, sync crypto, an unbounded loop) freezes an entire server for all users. Backend interviews frequently ask you to predict the output order of a `Promise` + `setTimeout` + `nextTick` snippet, which tests whether you understand microtask vs macrotask ordering. In production, a blocked event loop shows up as rising latency across every endpoint at once, and knowing to move work to a worker thread or a queue is a senior-level instinct.

## Common mistakes
- Assuming `setTimeout(fn, 0)` runs before an already-resolved Promise's `.then`. Microtasks (Promises) drain before the next macrotask (the timer), so the Promise callback runs first.
- Blocking the loop with synchronous CPU work (`JSON.parse` on a huge payload, `crypto.pbkdf2Sync`, `fs.readFileSync` in a request handler), degrading latency for every concurrent request, not just the current one.
- Thinking `async`/`await` creates threads or parallelism. `await` only yields the current function and schedules its continuation as a microtask; it's single-threaded cooperative concurrency.
- Sequential awaits in a loop for independent work (`for (const x of xs) await f(x)`) instead of `await Promise.all(xs.map(f))`, needlessly serializing I/O.
- Starving the loop with recursive `process.nextTick`, which runs before I/O and Promises and can prevent the loop from ever progressing.
- Unhandled promise rejections and forgetting that an `async` function always returns a Promise, so a "fire-and-forget" call swallows errors unless caught.
- Assuming `setImmediate` vs `setTimeout(0)` ordering is deterministic at the top level (it isn't); inside an I/O callback `setImmediate` reliably runs first (check phase before the next timers phase).

## Real-world applications
- Node/Next API routes handling many concurrent DB calls to Supabase/Postgres via non-blocking I/O without threads.
- Offloading CPU-bound work (image resizing, PDF generation, hashing) to `worker_threads` or a background job queue (BullMQ/Redis) to keep the request loop responsive.
- Batching independent I/O with `Promise.all` to cut request latency (parallel Supabase queries instead of sequential awaits).
- Streaming large responses so you never buffer/parse a huge body synchronously and block the loop.
- Graceful shutdown using `close` callbacks and draining in-flight requests.

## Implementations
```ts
// Predict the output order:
console.log("1: sync start");
setTimeout(() => console.log("2: setTimeout (macrotask)"), 0);
Promise.resolve().then(() => console.log("3: promise (microtask)"));
process.nextTick(() => console.log("4: nextTick (runs before promises)"));
console.log("5: sync end");
// Order: 1, 5, 4, 3, 2
//  sync runs to completion (1,5); then microtasks: nextTick(4) before Promise(3);
//  then the next macrotask: the timer (2).

// async/await is microtask-based sugar over Promises:
async function load() {
  const a = await fetchA(); // continuation after this line is a microtask
  const b = await fetchB(); // runs only after fetchA resolves (serial)
  return [a, b];
}

// Parallelize independent I/O:
const [a, b] = await Promise.all([fetchA(), fetchB()]); // both in flight at once

// Blocking the loop (anti-pattern) vs offloading:
// BAD: heavyCpuSync(payload) inside a handler freezes all requests
// GOOD: await runInWorker(payload) or enqueue a background job
```

## Practice problems
1. (easy) Predict the exact console output order of a snippet mixing `console.log`, `setTimeout(0)`, `Promise.resolve().then`, and `process.nextTick`, and justify each position.
2. (medium) Rewrite a route handler that does `for (const id of ids) await fetchUser(id)` to run the independent fetches concurrently, and explain the latency difference and any concurrency-limit concern.
3. (hard) A Node API's p99 latency spikes across all endpoints whenever one endpoint receives a large upload. Explain in event-loop terms why every endpoint is affected, then propose two concrete fixes (streaming/parsing off-thread, worker threads, or a job queue) with tradeoffs.

## Review schedule
No prerequisites; introduce early in the backend track. Review at 1d / 3d / 7d / 21d. Interleave with `http` (concurrent request handling) and `transactions` (async DB calls still race at the DB layer even on a single JS thread). Re-test with an output-ordering drill and a "why did all endpoints slow down?" scenario.
