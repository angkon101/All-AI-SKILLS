---
name: performance-and-load-testing
description: >-
  Use this skill to benchmark system performance, conduct load and stress testing,
  and profile bottlenecks. It guides load simulation scripting using k6, latency percentile analysis
  (p95, p99), memory leak profiling, database query plan tuning with EXPLAIN ANALYZE,
  and eliminating N+1 query patterns using DataLoader.
---

# Performance Engineering & Load Testing Skill

## Overview
This skill guides the AI agent in benchmarking, profiling, and optimizing software performance under load. It ensures systems meet non-functional latency and throughput SLAs by simulating realistic traffic with k6, analyzing p95/p99 latency distributions, diagnosing memory leaks, and tuning database query execution plans.

---

## When to Use This Skill
- Preparing a system for high-traffic events (launches, flash sales).
- Identifying database and network latency bottlenecks.
- Diagnosing memory leaks, CPU spikes, or degrading response times over long runtimes.
- Validating performance improvements objectively against baseline benchmarks.

---

## Input Context Required
1. Target latency percentiles (e.g., p95 < 150ms, p99 < 300ms) and throughput from `01-requirements-spec`.
2. Target endpoints or workflows under scrutiny.
3. Database engine and execution environment.

---

## Step-by-Step Execution Workflow

### Step 1: Load Test Topology & Scenarios
Design testing workloads tailored to specific stress vectors:
1. **Smoke Test**: Minimal load (1-2 VUs) to verify test scripts and endpoints function correctly.
2. **Load Test**: Normal and peak expected production traffic over an extended window (e.g., 500 VUs for 30 minutes).
3. **Stress Test**: Gradually ramp traffic beyond peak capacity until the system breaks to determine maximum throughput ceiling and failure behavior.
4. **Spike Test**: Sudden, instantaneous burst of traffic to test auto-scaling responsiveness and circuit breakers.
5. **Soak / Endurance Test**: Moderate load maintained over 12-24 hours to uncover memory leaks, connection pool exhaustion, and disk saturation.

### Step 2: Load Scripting with k6
Write modular, realistic k6 scenarios with ramp-up stages and strict assertion thresholds:
- Assert thresholds on p95/p99 latency and error rates. If thresholds fail, fail CI build!

### Step 3: Database Query Plan Tuning (`EXPLAIN ANALYZE`)
Inspect slow SQL queries using execution plans:
1. Run `EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT ...`:
   - **Seq Scan (Sequential Scan)**: Full table scan. If table has >1,000 rows, consider adding an index.
   - **Index Scan vs Index Only Scan**: Index Only Scan is fastest because it reads data directly from the index tree without fetching heap pages.
   - **Sort**: Look for `Sort Method: external merge Disk`. Increase `work_mem` or add an index matching the `ORDER BY` clause to sort in memory.
2. **The N+1 Query Problem**:
   - Symptom: 1 query to fetch $N$ orders, followed by $N$ separate queries to fetch items.
   - *Fix*: Use `JOIN`, SQL `IN (...)` batching, or a **DataLoader** pattern to coalesce lookups into a single batched query per tick.

### Step 4: Memory Profiling & Leak Detection
- Capture Heap Snapshots before and after sustained traffic.
- Compare retained size of objects:
  - Check for growing unbounded global caches/maps.
  - Check for unremoved event listeners (`emitter.on()` without `emitter.off()`).
  - Check for open streams or timers that keep references alive in closures.

---

## Output Deliverables Template

Generate automated k6 load script:

```javascript
// load-tests/k6-orders-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 virtual users
    { duration: '5m', target: 50 },  // Stay at 50 VUs
    { duration: '2m', target: 200 }, // Spike to 200 VUs
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    // 95% of requests must complete below 200ms
    http_req_duration: ['p(95)<200', 'p(99)<400'],
    // Error rate must be under 1%
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const url = 'https://api.staging.example.com/api/v1/orders';
  const payload = JSON.stringify({
    customerId: '018f26a5-7b3b-74d1-81f1-3ecf0392ad34',
    items: [{ sku: 'PROD-101', quantity: 1, unitPrice: 25.0 }],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response has orderId': (r) => JSON.parse(r.body).id !== undefined,
  });

  sleep(1); // Realistic user think-time
}
```

---

## Quality Checklist & Guardrails
- [ ] Are latency evaluations based on percentiles (p95, p99) rather than misleading averages?
- [ ] Does load test include realistic user "think time" between actions?
- [ ] Are database query execution plans verified via `EXPLAIN ANALYZE`?
- [ ] Are N+1 queries eliminated using eager joins or batch DataLoaders?
- [ ] Has soak testing verified that heap usage returns to baseline after load drops?

---

## Companion Skills
- **Preceding Step**: `07-database-modeling-and-migrations`.
- **Accompanying Telemetry**: `21-observability-and-telemetry`.
- **Infrastructure Tuning**: `20-containerization-and-devops`.
