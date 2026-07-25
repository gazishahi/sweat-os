---
concept: transactions
title: Transactions & Isolation Levels
domain: databases
difficulty: 4
prerequisites: [sql-indexes]
mastery: 0
---

## Definition
A transaction is a unit of work that groups multiple statements so they succeed or fail atomically, guaranteeing the ACID properties (Atomicity, Consistency, Isolation, Durability). Isolation level controls how concurrent transactions see each other's uncommitted or committed changes, trading correctness for concurrency. Postgres implements isolation with MVCC (Multi-Version Concurrency Control): each write creates a new row version tagged with transaction IDs, so readers never block writers and writers never block readers. The SQL standard defines four levels; Postgres offers READ COMMITTED (the default), REPEATABLE READ (which in Postgres is snapshot isolation), and SERIALIZABLE (Serializable Snapshot Isolation).

## Why it matters
Concurrency bugs are the hardest bugs to reproduce and the most damaging (double-charged customers, lost inventory, negative balances), and they are a favorite senior-level interview topic because they test whether you understand what the database actually guarantees. Knowing that READ COMMITTED — the default in Postgres/Supabase — does NOT prevent lost updates or write skew is the difference between code that works in dev and code that corrupts data under load. In real systems, the choice between an app-level `SELECT ... FOR UPDATE` lock, an optimistic version column, and bumping the isolation level is a core design decision.

## Common mistakes
- Read-modify-write lost update: `SELECT balance` in the app, compute `balance - 10`, then `UPDATE`. Under READ COMMITTED two concurrent transactions both read the old value and one update is silently lost. Fix with `UPDATE ... SET balance = balance - 10` (atomic), `SELECT ... FOR UPDATE`, or an optimistic version check.
- Assuming a transaction is a lock. MVCC means readers don't block; a plain `SELECT` inside a transaction gives no exclusive access.
- Confusing REPEATABLE READ with SERIALIZABLE. REPEATABLE READ (snapshot isolation) prevents non-repeatable and phantom reads but still allows write skew (two transactions each read a set, each writes based on it, together violating an invariant).
- Not handling `serialization_failure` (SQLSTATE 40001). SERIALIZABLE and REPEATABLE READ can abort a transaction at commit; you MUST retry the whole transaction, not just re-run one statement.
- Holding transactions open across network/HTTP calls or user think-time, causing long-lived MVCC snapshots that bloat the table and block `VACUUM`.
- Interleaving business logic that assumes read values are still current at write time without re-checking inside the same locked transaction.

## Real-world applications
- Postgres/Supabase: transferring credits between two accounts inside a `BEGIN ... COMMIT` with row locks to prevent double-spend.
- Inventory decrement / seat booking: `UPDATE seats SET taken = true WHERE id = $1 AND taken = false` returning affected-row count as an optimistic guard.
- Optimistic concurrency with a `version` integer column, common in ORMs and Supabase RPC functions.
- Idempotency keys on payment endpoints backed by a unique constraint inside the transaction so retries don't double-charge.
- Batch jobs using SERIALIZABLE with a retry loop for correctness-critical aggregation.

## Implementations
```sql
-- WRONG: lost update under READ COMMITTED (default)
BEGIN;
SELECT balance FROM accounts WHERE id = 1;      -- app reads 100
-- (concurrent tx also reads 100)
UPDATE accounts SET balance = 90 WHERE id = 1;  -- one -10 is lost
COMMIT;

-- RIGHT: atomic write, no app-side arithmetic
BEGIN;
UPDATE accounts SET balance = balance - 10 WHERE id = 1 AND balance >= 10;
COMMIT;

-- RIGHT: explicit row lock when you must read-then-write
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;  -- blocks concurrent writers
UPDATE accounts SET balance = balance - 10 WHERE id = 1;
COMMIT;

-- SERIALIZABLE with retry (pseudo-TS around the driver)
-- BEGIN ISOLATION LEVEL SERIALIZABLE; ...; COMMIT;
-- on SQLSTATE '40001' -> ROLLBACK and retry the whole block
```

## Practice problems
1. (easy) Explain, with a two-timeline diagram, why `SELECT balance; UPDATE SET balance = $newValue` loses an update under READ COMMITTED, and give two distinct fixes.
2. (medium) Two doctors are on call; a rule requires at least one to remain on call. Both run a transaction that checks "is another doctor on call?" then sets themselves off-call. Show how write skew violates the invariant under REPEATABLE READ and how SERIALIZABLE or a `FOR UPDATE` lock prevents it.
3. (hard) Implement a Postgres-backed idempotent "charge" endpoint in TypeScript (Supabase/pg): use a unique idempotency key and a single transaction so concurrent retries never double-charge, and correctly retry on serialization failures.

## Review schedule
Introduce after `sql-indexes` (locking interacts with index granularity). Review at 1d / 3d / 7d / 21d. Interleave with `caching` (stale cache after commit / invalidation ordering) and with concurrency concepts in `node-event-loop` (single-threaded app still faces DB-level races). Re-test by asking the student to classify a given anomaly as lost update, non-repeatable read, phantom, or write skew and name the minimum isolation level that prevents it.
