---
name: concurrency-and-async-systems
description: >-
  Use this skill to design concurrent, parallel, and asynchronous software systems.
  It guides race condition mitigation, thread safety, Mutex/Semaphore coordination,
  deadlock prevention via strict lock ordering, optimistic vs pessimistic locking,
  backpressure management, and worker pool architectures.
---

# Concurrency & Asynchronous Systems Skill

## Overview
This skill guides the AI agent in engineering high-performance concurrent software. It prevents race conditions, deadlocks, thread starvation, and unhandled promise rejections by enforcing thread-safety, backpressure handling, and sound transactional locking strategies.

---

## When to Use This Skill
- Managing concurrent database writes or state updates (e.g., ticket booking, inventory reservation).
- Building background worker pools or parallel data ingestion pipelines.
- Resolving race conditions, deadlocks, or thread contention issues.
- Handling asynchronous stream backpressure and flow control.

---

## Input Context Required
1. Concurrency runtime model (e.g., Node.js single-thread event loop, Go goroutines & channels, Java Virtual Threads, Python asyncio).
2. Throughput and parallel task volume from `01-requirements-spec`.
3. Database locking capabilities (PostgreSQL `SELECT FOR UPDATE`, Redis distributed locks).

---

## Step-by-Step Execution Workflow

### Step 1: Concurrency Model Identification & Best Practices
- **Event Loop (Node.js / asyncio)**:
  - *Golden Rule*: NEVER execute CPU-bound operations (crypto hashing, heavy image processing) on the event loop; offload to worker threads or external worker microservices.
- **CSP / Go Channels**:
  - Share memory by communicating; don't communicate by sharing memory.
  - Always close channels from the producer side; handle context cancellation (`ctx.Done()`).
- **Thread Pool / Virtual Threads (Java / .NET)**:
  - Bound thread pools explicitly to prevent memory exhaustion under load.

### Step 2: Race Condition Mitigation (Locking Strategies)
Select between Optimistic vs. Pessimistic concurrency control:

1. **Optimistic Concurrency Control (OCC)**:
   - *Best for*: Low-to-moderate contention environments.
   - *Implementation*: Add a `version` integer column.
   - *SQL*:
     ```sql
     UPDATE accounts
     SET balance = balance - 50, version = version + 1
     WHERE id = 'acc_123' AND version = 3;
     ```
   - If row count updated == 0, abort and retry or fail with `ConcurrencyConflictException`.

2. **Pessimistic Concurrency Control**:
   - *Best for*: High-contention environments (e.g., flash sales, limited ticket seats).
   - *Implementation*: Row-level lock.
   - *SQL*:
     ```sql
     SELECT * FROM tickets WHERE id = 'tkt_99' FOR UPDATE;
     ```
   - *Rule*: Keep transaction duration as short as possible (<50ms) to avoid queueing connection pool locks.

### Step 3: Deadlock Prevention Rules
Deadlocks occur when two threads attempt to acquire multiple locks in different orders:
- **Strict Lock Ordering**: If operation requires Lock A and Lock B, ALL code paths must acquire Lock A *before* Lock B.
- **Lock Acquisition Timeouts**: Never block indefinitely. Always set a maximum timeout on lock acquisition.
- **Fail Fast & Rollback**: If a lock acquisition times out, release all held resources and abort cleanly.

### Step 4: Backpressure & Flow Control in Worker Pools
When downstream sinks cannot keep up with upstream producers:
- Use **Bounded Queues**: Reject or throttle new producers when queue capacity reaches limit (e.g., max 10,000 items).
- Apply reactive backpressure (e.g., pause stream reader until consumer buffer drains).
- Implement rate-limiting worker concurrency: Limit active concurrent jobs (e.g., max 10 parallel HTTP requests).

---

## Output Deliverables Template

Generate concurrency worker pool snippet:

```typescript
// Bounded Concurrency Task Pool (TypeScript / Node.js)
export class ConcurrencyLimiter {
  private activeCount = 0;
  private queue: (() => void)[] = [];

  constructor(private readonly maxConcurrency: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.maxConcurrency) {
      // Wait in line until a slot frees up
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.activeCount++;
    try {
      return await task();
    } finally {
      this.activeCount--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }
}

// Usage: Process 500 items with max 5 concurrent requests
const limiter = new ConcurrencyLimiter(5);
const results = await Promise.all(
  items.map(item => limiter.run(() => processItem(item)))
);
```

---

## Quality Checklist & Guardrails
- [ ] Are race conditions mitigated using either Optimistic Locking (versioning) or Pessimistic locks?
- [ ] Is CPU-bound work isolated from the primary async event loop?
- [ ] Are all locks acquired in a consistent global order to prevent deadlocks?
- [ ] Are queues bounded with explicit overflow policies (drop, reject, or backpressure)?
- [ ] Are all async operations provided with cancellation tokens or timeout signals?

---

## Companion Skills
- **Preceding Step**: `06-event-and-messaging-design` and `07-database-modeling-and-migrations`.
- **Implementation**: `10-clean-architecture-and-solid`.
- **Performance Profiling**: `17-performance-and-load-testing`.
