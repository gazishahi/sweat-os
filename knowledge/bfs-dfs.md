---
concept: bfs-dfs
title: BFS & DFS
domain: algorithms
difficulty: 3
prerequisites: [graphs]
mastery: 0
---

## Definition
Breadth-first search (BFS) and depth-first search (DFS) are the two fundamental graph/tree traversal strategies. BFS explores level by level using a FIFO queue, visiting all neighbors at distance k before any at distance k+1; this makes it find the shortest path (fewest edges) in an unweighted graph. DFS explores as deep as possible along one branch before backtracking, using an explicit stack or the call stack via recursion. Both run in O(V + E) time on an adjacency list and require a `visited` set to avoid revisiting nodes and looping forever on cyclic graphs. The core difference is the data structure — queue (BFS) vs. stack/recursion (DFS) — which dictates the exploration order.

## Why it matters
Nearly every graph interview problem reduces to "which traversal and what do I track per node." The decisive senior-level judgment is choosing BFS when the question involves shortest path, minimum steps, or level-by-level processing in an unweighted graph, and DFS when it involves connectivity, cycle detection, topological sort, or exhaustive path/backtracking search. Getting this wrong — using DFS for shortest path — produces answers that are correct-looking but wrong. In production these traversals power crawlers, dependency resolution, reachability/permission checks, flood-fill in image tools, and "friends within N hops" queries. The visited-set discipline is also what separates a working traversal from an infinite loop in real cyclic data.

## Common mistakes
- Using DFS to find a shortest path in an unweighted graph — only BFS guarantees fewest edges; DFS finds *a* path, not the shortest.
- Marking a node visited when dequeued rather than when enqueued in BFS, allowing the same node to be added multiple times and blowing up the queue.
- Omitting the visited set on a cyclic graph, causing an infinite loop (trees can skip it because they are acyclic).
- Recursive DFS overflowing the call stack on deep/large graphs — switch to an explicit stack when depth is unbounded.
- Forgetting to iterate over all vertices for a disconnected graph, so entire components go unvisited.

## Real-world applications
- Flood fill and connected-components ("Number of Islands") in grids — the basis of paint-bucket tools and region labeling.
- Shortest-hop queries over a Supabase/Postgres social graph ("degrees of separation"), and web crawlers that BFS outward from seed URLs.
- DFS-based topological sort for build/task ordering (turbo, nx) and cycle detection in the npm/bundler module graph; reachability checks for permission propagation.

## Implementations
```ts
type Graph = Map<string, string[]>;

// BFS: FIFO queue, shortest path (fewest edges) in an unweighted graph.
function bfs(graph: Graph, start: string): string[] {
  const visited = new Set<string>([start]);
  const queue: string[] = [start]; // use a real queue in prod (index pointer)
  const order: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor); // mark on enqueue, not dequeue
        queue.push(neighbor);
      }
    }
  }
  return order;
}

// BFS shortest distance (edges) from start to target, or -1 if unreachable.
function shortestPath(graph: Graph, start: string, target: string): number {
  const visited = new Set<string>([start]);
  let frontier: string[] = [start];
  let dist = 0;
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const node of frontier) {
      if (node === target) return dist;
      for (const n of graph.get(node) ?? []) {
        if (!visited.has(n)) {
          visited.add(n);
          next.push(n);
        }
      }
    }
    frontier = next;
    dist++;
  }
  return -1;
}

// DFS (recursive): connectivity, cycle detection, backtracking.
function dfs(graph: Graph, start: string, visited = new Set<string>()): string[] {
  const order: string[] = [];
  const explore = (node: string) => {
    visited.add(node);
    order.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) explore(neighbor);
    }
  };
  explore(start);
  return order;
}
```

## Practice problems
1. (easy) Number of Islands (LC 200) — DFS/BFS flood fill over a grid.
2. (medium) Binary Tree Level Order Traversal (LC 102) — BFS by level.
3. (hard) Word Ladder (LC 127) — BFS for shortest transformation sequence.

## Review schedule
Difficulty-3 capstone of the graph track; review at +2, +6, +16 days with a gate requiring the student to state, for a given problem, whether BFS or DFS applies and why. Interleave tightly with graphs (representation feeds traversal) and recursion (recursive DFS vs. explicit stack). Once mastered, this unlocks weighted-shortest-path (Dijkstra) and topological-sort follow-on nodes.
