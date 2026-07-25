---
concept: sql-indexes
title: SQL Indexes & Query Planning
domain: databases
difficulty: 3
prerequisites: [big-o]
mastery: 0
---

## Definition
A SQL index is an auxiliary data structure (in Postgres, a B-tree by default) that stores a sorted copy of one or more columns plus pointers back to the heap rows, letting the query planner locate matching rows in O(log n) instead of scanning the whole table in O(n). The planner is a cost-based optimizer: it estimates the cheapest execution plan from table statistics (row counts, value distribution) and decides whether to use an index scan, index-only scan, bitmap scan, or sequential scan. An index trades write speed and disk space for read speed, because every INSERT/UPDATE/DELETE must also maintain the index.

## Why it matters
Missing or misused indexes are the single most common cause of slow queries in production, and "how would you speed up this query?" is a staple system-design and debugging interview question. Being able to read `EXPLAIN ANALYZE` output, spot a `Seq Scan` on a large table, and reason about composite-index column order separates mid-level from senior engineers. In real systems (Supabase/Postgres backends), a missing index on a foreign key or a frequently filtered column turns a 5ms request into a 2s request under load, and shows up as CPU-bound database saturation long before the app tier is the bottleneck.

## Common mistakes
- Assuming an index on `(a, b)` helps a query filtering only on `b`. B-tree composite indexes are usable left-to-right (leftmost-prefix rule); `WHERE b = ?` alone cannot use it efficiently.
- Getting composite column order backwards: put the equality-filtered / most-selective column first, range/sort columns later. `WHERE status = 'active' AND created_at > $1` wants `(status, created_at)`.
- Wrapping the indexed column in a function (`WHERE lower(email) = $1`) or applying a type cast, which disables the plain index. You need an expression index on `lower(email)`.
- Forgetting that Postgres does NOT auto-create indexes on foreign keys (only on primary keys and UNIQUE constraints), causing slow joins and lock contention on cascading deletes.
- Over-indexing: adding indexes to every column bloats write latency and disk, and the planner may ignore low-selectivity indexes (e.g. a boolean) in favor of a seq scan anyway.
- Reading `EXPLAIN` alone (estimates only) instead of `EXPLAIN ANALYZE` (actual timings and row counts); a large gap between estimated and actual rows signals stale statistics — run `ANALYZE`.

## Real-world applications
- Supabase/Postgres: indexing `user_id` on a `posts` table so a user's feed query is an index scan, not a full-table seq scan.
- Covering / index-only scans: an index on `(user_id, created_at) INCLUDE (title)` lets a list query return without touching the heap, provided the visibility map is current.
- Partial indexes for soft-deletes: `CREATE INDEX ... WHERE deleted_at IS NULL` keeps the index small and hot.
- Full-text search via GIN indexes on `tsvector`; JSONB containment queries via GIN on a `jsonb` column.
- Enforcing uniqueness (email, slug) which is backed by a unique B-tree index that also accelerates lookups.

## Implementations
```sql
-- Baseline: sequential scan on a large table
EXPLAIN ANALYZE
SELECT id, title FROM posts WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;

-- Composite index: equality column first, sort column second
CREATE INDEX idx_posts_user_created ON posts (user_id, created_at DESC);

-- Covering index -> index-only scan (no heap fetch for title)
CREATE INDEX idx_posts_feed ON posts (user_id, created_at DESC) INCLUDE (title);

-- Partial index: only rows that matter
CREATE INDEX idx_posts_active ON posts (user_id) WHERE deleted_at IS NULL;

-- Expression index for case-insensitive lookup
CREATE INDEX idx_users_lower_email ON users (lower(email));
-- must query the same expression to use it:
SELECT * FROM users WHERE lower(email) = lower($1);
```

## Practice problems
1. (easy) Given `SELECT * FROM orders WHERE customer_id = $1`, write the `CREATE INDEX` statement and explain why a seq scan was slow on a 10M-row table.
2. (medium) A query `WHERE status = 'shipped' AND created_at > now() - interval '7 days' ORDER BY created_at DESC` does a seq scan. Design the composite index (with column order justified) and add an `INCLUDE` to make it index-only.
3. (hard) You have index `(a, b, c)`. For each query, state whether it can use the index and how much of it: `WHERE a=1`, `WHERE a=1 AND c=3`, `WHERE b=2 AND c=3`, `WHERE a=1 AND b=2 ORDER BY c`. Then explain what `Rows Removed by Filter` in `EXPLAIN ANALYZE` tells you.

## Review schedule
First review 1 day after introduction, then 3 days, then 7, then 21 (standard SM-2 spacing). Interleave with `big-o` (index lookup is O(log n) vs O(n) scan) and with `transactions` (indexes affect locking granularity and MVCC visibility on updates). Re-test by having the student read a real `EXPLAIN ANALYZE` plan aloud.
