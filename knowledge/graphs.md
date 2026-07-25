---
concept: graphs
title: Graphs (Representation)
domain: data-structures
difficulty: 3
prerequisites: [trees, hash-maps]
mastery: 0
---

## Definition
A graph is a set of vertices (nodes) connected by edges, where edges may be directed or undirected and optionally weighted. Unlike a tree, a graph can contain cycles, be disconnected, and have a vertex reachable by many paths. The two dominant representations are the adjacency list — a map from each vertex to a collection of its neighbors, costing O(V + E) space — and the adjacency matrix — a V×V grid where cell [i][j] marks an edge, costing O(V^2) space. Adjacency lists are preferred for sparse graphs (E much smaller than V^2) and iterating neighbors; matrices give O(1) edge-existence checks and suit dense graphs or algorithms that do matrix math.

## Why it matters
Graphs model relationships, and "model this as a graph" is the unlock for a huge class of hard interview problems (dependencies, scheduling, connectivity, shortest path). The representation choice is itself a signal of seniority: choosing an adjacency list for a sparse social graph vs. a matrix for a dense one directly changes memory from linear to quadratic. Real systems are graphs everywhere — foreign-key relationships in Postgres, package dependency trees (npm), the React import graph that bundlers walk, and permission/role hierarchies. Picking the right representation and traversal is what makes features like "find all users within 2 connections" tractable at scale rather than timing out.

## Common mistakes
- Using an adjacency matrix for a sparse graph, wasting O(V^2) memory when O(V + E) would do (and vice versa for dense graphs).
- For an undirected graph, adding the edge in only one direction — you must push u→v and v→u.
- Forgetting that graphs can be disconnected: a single traversal from one start node misses whole components, so you must loop over all vertices.
- Not handling cycles, causing infinite loops when traversing without a visited set (the key difference from tree traversal).
- Assuming vertices are dense integers 0..V-1 when they are arbitrary strings/ids — use a `Map` rather than an array-indexed structure.

## Real-world applications
- Postgres relational data as a graph: users, follows, and posts form a directed graph; recursive CTEs traverse it for follower recommendations.
- Dependency resolution: npm/pnpm and bundlers (Vite/webpack) build the module import graph and topologically order it; a cycle is a "circular dependency" warning.
- Modeling permissions/org hierarchies in a Supabase-backed app, routing/maps, and recommendation "people you may know" features built on adjacency lists.

## Implementations
```ts
// Adjacency list: sparse-friendly, O(V + E) space. Keyed by arbitrary vertex ids.
type AdjacencyList = Map<string, string[]>;

function buildAdjacencyList(
  edges: [string, string][],
  directed = false,
): AdjacencyList {
  const graph: AdjacencyList = new Map();
  const addNode = (v: string) => {
    if (!graph.has(v)) graph.set(v, []);
  };
  for (const [u, v] of edges) {
    addNode(u);
    addNode(v);
    graph.get(u)!.push(v);
    if (!directed) graph.get(v)!.push(u); // undirected: both directions
  }
  return graph;
}

// Adjacency matrix: dense-friendly, O(V^2) space, O(1) edge lookup.
// Vertices must map to indices 0..n-1.
function buildAdjacencyMatrix(
  n: number,
  edges: [number, number][],
  directed = false,
): number[][] {
  const matrix: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  );
  for (const [u, v] of edges) {
    matrix[u][v] = 1;
    if (!directed) matrix[v][u] = 1;
  }
  return matrix;
}

// Example: edge list -> adjacency list
const graph = buildAdjacencyList([
  ["a", "b"],
  ["a", "c"],
  ["b", "d"],
]);
// graph => { a: [b, c], b: [a, d], c: [a], d: [b] }
```

## Practice problems
1. (easy) Find the Town Judge (LC 997) — reason about in-degree/out-degree from edges.
2. (medium) Course Schedule (LC 207) — build a dependency graph and detect a cycle.
3. (hard) Reconstruct Itinerary (LC 332) — build the graph then Hierholzer's traversal.

## Review schedule
Difficulty-3 node; review at +2, +6, +16 days with a gate requiring the student to justify list-vs-matrix given V and E. Interleave with hash-maps (the adjacency list is a map) and trees (a tree is an acyclic connected graph). It is the direct prerequisite for bfs-dfs, where these representations are traversed; revisit both together so representation and traversal are learned as one skill.
