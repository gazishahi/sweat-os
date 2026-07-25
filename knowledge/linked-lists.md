---
concept: linked-lists
title: Linked Lists
domain: data-structures
difficulty: 2
prerequisites: [big-o]
mastery: 0
---

## Definition
A linked list is a linear collection of nodes where each node holds a value and a reference (pointer) to the next node; the list is accessed through a `head` pointer, and the last node points to `null`. Unlike an array, elements are not stored contiguously in memory, so there is no O(1) random access by index — you must walk from the head. In exchange, inserting or removing at a known node is O(1) because you only relink pointers instead of shifting elements. Doubly linked lists add a `prev` pointer per node to enable O(1) backward traversal and removal.

## Why it matters
Linked lists are the canonical vehicle for testing pointer manipulation, which is why they dominate the easy/medium tier of interviews (reverse a list, detect a cycle, merge two sorted lists). The real skill being probed is whether you can mutate `next` pointers without losing your place or leaking the rest of the list. In real systems the structure underpins LRU caches (a doubly linked list gives O(1) eviction of the least-recently-used node), adjacency lists in graphs, and the intrusive lists used in kernels and allocators. The Fibonacci-heap-free insight — O(1) splice when you already hold the node — is exactly why runtimes and schedulers reach for them.

## Common mistakes
- Losing the rest of the list during reversal by overwriting `curr.next` before saving it in a temp variable.
- Off-by-one on the fast/slow pointer: forgetting to null-check both `fast` and `fast.next` in the loop condition, which throws on even-length lists.
- Assuming index access is O(1) — traversing to the k-th node is O(k), so nested loops over a list are quietly O(n^2).
- Not using a dummy/sentinel head node when the head itself may be deleted or reassigned, leading to messy special-casing.
- Creating a cycle by accident (pointing a node back into the list) and then infinite-looping on traversal.

## Real-world applications
- LRU cache in a Node/TypeScript API layer: a `Map` for O(1) lookup plus a doubly linked list for O(1) recency reordering (the pattern behind many in-memory caches fronting Postgres/Supabase).
- React's Fiber architecture models the component tree as a linked list of fibers with `child`/`sibling`/`return` pointers to make work interruptible and resumable.
- Undo/redo stacks and streaming buffers where you append and drop from ends without reallocating.

## Implementations
```ts
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

// Reverse a singly linked list, O(n) time, O(1) space.
function reverse<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null;
  let curr = head;
  while (curr !== null) {
    const next = curr.next; // save before we overwrite
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev; // new head
}

// Floyd's cycle detection (tortoise and hare), O(n) time, O(1) space.
function hasCycle<T>(head: ListNode<T> | null): boolean {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

## Practice problems
1. (easy) Reverse Linked List (LC 206) — iterative and recursive.
2. (medium) Linked List Cycle II (LC 142) — return the node where the cycle begins.
3. (hard) Merge k Sorted Lists (LC 23) — using a min-heap of heads.

## Review schedule
Introduced as a difficulty-2 node; first review at +2 days, then +7, +21 on the standard spaced-repetition curve, promoting only after clean reverse + cycle detection from memory. Interleave with arrays (contrast contiguous vs. linked memory and their Big-O trade-offs) and preview hash-maps, since the LRU-cache pattern fuses both. It is a hard prerequisite for trees, where the same pointer-relinking intuition scales to multiple children.
