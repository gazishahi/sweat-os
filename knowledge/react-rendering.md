---
concept: react-rendering
title: React Rendering & Reconciliation
domain: frontend
difficulty: 3
prerequisites: []
mastery: 0
---

## Definition
React rendering is a two-phase process. In the render phase React calls your components to produce a tree of React elements (a lightweight description of the UI) and diffs it against the previous tree — this is reconciliation. In the commit phase React applies the minimal set of changes to the actual DOM. Reconciliation is a heuristic O(n) diff: React compares elements by position and type, and uses the `key` prop to match children across renders. A component re-renders when its state changes, its parent re-renders, or a consumed context value changes — not when its props "look different," but whenever the render is triggered upstream.

## Why it matters
Rendering behavior is the root cause of most React performance problems and a common source of subtle bugs (stale closures, lost input focus, reset state), so front-end interviews probe whether you understand what actually triggers a re-render versus folklore ("props changed"). Knowing that a parent re-render re-renders all children by default — and when `memo`/`useMemo`/`useCallback` genuinely help versus add noise — is a senior-level distinction. In Next.js the server/client component boundary changes where rendering happens at all, which reshapes data fetching and bundle size.

## Common mistakes
- Using array index as `key` in a reorderable/insertable list, causing React to reuse the wrong DOM nodes — leading to wrong state, lost focus, and visual glitches. Use a stable unique id.
- Believing `React.memo` stops re-renders from state/context changes. `memo` only skips re-renders caused by unchanged props; it does nothing if the component's own state or a consumed context changes.
- Passing a new object/array/function literal as a prop to a `memo`'d child every render, defeating the memoization because the reference changes each time. That's where `useMemo`/`useCallback` come in — but only when the child is actually memoized.
- Sprinkling `useMemo`/`useCallback` everywhere prophylactically; they have their own cost and add complexity. Measure first — most components are cheap to re-render.
- Creating state-derived values in state and syncing them with `useEffect` instead of computing during render, causing extra renders and drift.
- Mutating state in place (`arr.push(...)` then `setArr(arr)`); React compares by reference, sees the same array, and skips the re-render.
- Adding `"use client"` too high in the Next.js tree, pulling everything below it into the client bundle and losing server-rendering benefits.

## Real-world applications
- List rendering (feeds, tables) where correct `key` usage prevents state/focus bugs on insert/reorder/delete.
- Memoizing an expensive derived computation (filtering/sorting a large dataset) with `useMemo` so it doesn't recompute on unrelated state changes.
- `React.memo` + `useCallback` for a heavy child component (e.g. a chart) that would otherwise re-render on every parent keystroke.
- Next.js App Router: Server Components fetch data and render on the server (zero client JS), Client Components (`"use client"`) handle interactivity — used to shrink bundles and stream HTML.
- Context for theme/auth, with careful splitting so a frequently-changing value doesn't re-render every consumer.

## Implementations
```tsx
// Stable keys: correct vs buggy
{items.map((it) => <Row key={it.id} item={it} />)}     // correct
{items.map((it, i) => <Row key={i} item={it} />)}      // buggy on reorder/insert

// memo + useCallback: only helps together
const Child = React.memo(function Child({ onPick }: { onPick: (id: string) => void }) {
  // re-renders only when onPick reference changes
  return /* ... */;
});

function Parent() {
  const [q, setQ] = React.useState("");
  const [items] = React.useState<Item[]>(/* ... */);

  // stable reference so memo(Child) can skip re-render on each keystroke
  const onPick = React.useCallback((id: string) => selectItem(id), []);

  // recompute only when inputs change, not on every render
  const filtered = React.useMemo(
    () => items.filter((i) => i.name.includes(q)),
    [items, q]
  );

  return (<><input value={q} onChange={(e) => setQ(e.target.value)} />
           {filtered.map((i) => <Child key={i.id} onPick={onPick} />)}</>);
}
```

## Practice problems
1. (easy) Given a parent with a counter and three static child components, predict which children re-render when the counter increments, and explain why `React.memo` would or wouldn't change that.
2. (medium) A controlled input inside a `.map()` list loses focus and shows the wrong value after inserting an item at the top. Diagnose the `key` bug and fix it; explain what reconciliation did.
3. (hard) Profile-and-optimize: a dashboard re-renders an expensive chart on every keystroke in an unrelated search box. Identify the cause (new prop references / shared parent) and refactor with `memo` + `useCallback` + `useMemo` and/or state colocation — and state how you'd verify the win in the React Profiler.

## Review schedule
No prerequisites; introduce early in the frontend track. Review at 1d / 3d / 7d / 21d. Interleave with `caching` (client-cache libraries like React Query and stale-while-revalidate) and `http` (data fetching in Server Components). Re-test by predicting render counts for a small component tree and reading a React Profiler flame chart.
