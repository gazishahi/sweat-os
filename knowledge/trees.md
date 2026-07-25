---
concept: trees
title: Trees & Binary Search Trees
domain: data-structures
difficulty: 3
prerequisites: [recursion, linked-lists]
mastery: 0
---

## Definition
A tree is a hierarchical, acyclic, connected structure of nodes where each node has a value and references to child nodes, and every node except the root has exactly one parent. A binary tree restricts each node to at most two children (`left`, `right`). A binary search tree (BST) is a binary tree with an ordering invariant: for every node, all values in its left subtree are less than the node's value and all values in its right subtree are greater. This invariant enables O(h) search, insert, and delete, where h is the height — O(log n) when balanced, but degrading to O(n) when the tree becomes a lopsided chain. In-order traversal of a BST visits values in sorted ascending order.

## Why it matters
Trees are the highest-yield topic in mid-to-senior interviews because they combine recursion, pointers, and invariants, and because so many follow-ups build on them (balancing, tries, segment trees). The recurring test is whether you can pick the right traversal (pre/in/post/level order) for the task and reason about balanced vs. degenerate height. In real systems, balanced search trees (red-black, B-trees) are the backbone of database indexes — Postgres B-tree indexes are why an indexed `WHERE` is O(log n) instead of a full scan — and of ordered in-memory maps. Getting the BST invariant and traversal order right is directly the difference between an index that works and one that returns wrong ranges.

## Common mistakes
- Validating a BST by only comparing each node to its immediate children instead of propagating a valid (min, max) range down — a classic wrong answer to Validate BST.
- Forgetting a base case (`node === null`) in recursive traversal, or handling it inconsistently between left and right branches.
- Assuming a BST is balanced: inserting sorted data builds a degenerate O(n) chain, so all operations silently become linear.
- Mixing up traversal orders — using pre-order when the problem needs sorted output (which requires in-order), or level-order when you need depth.
- In the iterative in-order traversal, pushing nodes in the wrong order or not fully descending left before visiting.

## Real-world applications
- Postgres/Supabase B-tree indexes: the query planner walks a balanced tree to satisfy equality and range predicates in O(log n); understanding BST ordering explains why `ORDER BY` on an indexed column is free.
- The DOM and React's virtual DOM are trees; reconciliation is a tree diff, and rendering is effectively a traversal.
- File systems, org charts, comment threads (nested replies stored via parent_id in Postgres), and abstract syntax trees in the TypeScript compiler.

## Implementations
```ts
class TreeNode {
  value: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(value: number) {
    this.value = value;
  }
}

// Recursive in-order traversal: left, node, right -> sorted for a BST.
function inorderRecursive(root: TreeNode | null, out: number[] = []): number[] {
  if (root === null) return out; // base case
  inorderRecursive(root.left, out);
  out.push(root.value);
  inorderRecursive(root.right, out);
  return out;
}

// Iterative in-order using an explicit stack (avoids call-stack depth limits).
function inorderIterative(root: TreeNode | null): number[] {
  const out: number[] = [];
  const stack: TreeNode[] = [];
  let curr = root;
  while (curr !== null || stack.length > 0) {
    while (curr !== null) {
      stack.push(curr);
      curr = curr.left; // descend fully left
    }
    curr = stack.pop()!;
    out.push(curr.value);
    curr = curr.right;
  }
  return out;
}

// BST insert and search, O(h) each.
function insert(root: TreeNode | null, value: number): TreeNode {
  if (root === null) return new TreeNode(value);
  if (value < root.value) root.left = insert(root.left, value);
  else if (value > root.value) root.right = insert(root.right, value);
  return root; // duplicates ignored
}

function search(root: TreeNode | null, value: number): boolean {
  if (root === null) return false;
  if (value === root.value) return true;
  return value < root.value
    ? search(root.left, value)
    : search(root.right, value);
}
```

## Practice problems
1. (easy) Maximum Depth of Binary Tree (LC 104) — recursion with base case on null.
2. (medium) Validate Binary Search Tree (LC 98) — propagate (min, max) bounds.
3. (hard) Serialize and Deserialize Binary Tree (LC 297) — encode/decode via traversal.

## Review schedule
Difficulty-3 node; review at +2, +6, +16 days with a gate requiring both recursive and iterative in-order from memory. Interleave with recursion (traversals) and linked-lists (pointer relinking during insert/delete), and immediately precede graphs — a tree is a connected acyclic graph, so the traversal mental model transfers directly to bfs-dfs.
