---
name: caching-and-data-stores
description: >-
  Use this skill to design distributed caching strategies and specialized data store integrations.
  It guides cache-aside, write-through, and write-behind patterns, cache invalidation with TTL jitter,
  mitigating thundering herd/stampede with singleflight locking, distributed locks (Redlock),
  and Redis data structure optimization.
---

# Distributed Caching & In-Memory Data Stores Skill

## Overview
This skill guides the AI agent in implementing high-throughput, low-latency caching architectures. It protects downstream relational databases from overload while preventing data staleness, race conditions, cache stampedes, and distributed lock corruption.

---

## When to Use This Skill
- Reducing database read latency on high-traffic endpoints.
- Managing session state or distributed rate limiters.
- Mitigating database connection exhaustion during traffic spikes.
- Implementing distributed locks across multi-instance microservices.

---

## Input Context Required
1. Query read-to-write ratios and latency SLAs from `01-requirements-spec`.
2. Database schema and consistency models from `07-database-modeling-and-migrations`.
3. Cache technology (Redis Cluster, Memcached, Dragonfly, CloudFront CDN).

---

## Step-by-Step Execution Workflow

### Step 1: Caching Pattern Selection
- **Cache-Aside (Lazy Loading)**: Default pattern. Application reads from cache; if miss, queries DB, populates cache, and returns. Simple and robust against cache crashes.
- **Write-Through**: Application writes to cache; cache immediately writes synchronously to DB. Ensures high consistency, but increases write latency.
- **Write-Behind (Write-Back)**: Application writes to cache; asynchronous worker flushes batches to DB. Ultra-high write throughput, but risks data loss on cache node crash.
- **Refresh-Ahead**: Cache automatically re-queries frequently accessed keys before their TTL expires.

### Step 2: Cache Key Naming Convention & Namespacing
Standardize key structures with semantic delimiters and schema versions:
`{service}:{namespace}:{schema_version}:{entity_id}:{sub_resource}`
- *Example*: `ordering:orders:v1:ord_8849:summary`
- Include version tokens (`v1`) so deployments with modified JSON schemas can instantly invalidate or isolate keys without clearing the entire cache.

### Step 3: Mitigating the Three Critical Cache Failure Modes
1. **Cache Stampede / Thundering Herd**: When a hot key expires and hundreds of concurrent requests query the DB at once.
   - *Fix*: Singleflight pattern / Distributed Mutex: Only one request acquires lock to rebuild the cache, while others await the result or serve slightly stale data.
2. **Cache Avalanche**: When thousands of keys expire at the exact same second, overwhelming the DB.
   - *Fix*: TTL Jitter: Add random offset to base TTL: `TTL = 3600 + random(-300, 300) seconds`.
3. **Cache Penetration**: When requests repeatedly query non-existent IDs that miss cache and hit DB.
   - *Fix*: Cache negative results (null/empty) with short TTL (e.g., 60s), or use a Bloom Filter.

### Step 4: Distributed Locking Implementation (Redis SET NX EX)
Implement safe distributed locks with timeouts and unique fencing tokens:
```typescript
// Acquire lock
const lockKey = `locks:process_order:${orderId}`;
const lockValue = crypto.randomUUID(); // Fencing token
const acquired = await redis.set(lockKey, lockValue, 'NX', 'PX', 5000); // 5 sec TTL

if (!acquired) {
  throw new ConcurrencyError('Operation currently locked by another worker');
}

try {
  // Execute critical section
  await processOrder(orderId);
} finally {
  // Release safely via Lua script to guarantee only the holder deletes its own lock
  const releaseScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  await redis.eval(releaseScript, 1, lockKey, lockValue);
}
```

---

## Output Deliverables Template

Generate caching wrapper module specification:

```typescript
// Cache-aside helper with singleflight and TTL jitter
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { baseTtlSeconds: number; jitterSeconds?: number }
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  // Mutex lock to prevent thundering herd
  const lockKey = `mutex:${key}`;
  const lockAcquired = await redis.set(lockKey, '1', 'NX', 'EX', 10);

  if (!lockAcquired) {
    // Wait briefly and retry reading cache
    await sleep(50);
    return getOrSetCache(key, fetcher, options);
  }

  try {
    const freshData = await fetcher();
    const jitter = (Math.random() * 2 - 1) * (options.jitterSeconds || 60);
    const ttl = Math.floor(options.baseTtlSeconds + jitter);
    await redis.set(key, JSON.stringify(freshData), 'EX', ttl);
    return freshData;
  } finally {
    await redis.del(lockKey);
  }
}
```

---

## Quality Checklist & Guardrails
- [ ] Is every cache write configured with an explicit TTL (never unbounded keys)?
- [ ] Is TTL jitter applied to prevent synchronized cache avalanche?
- [ ] Are distributed locks released only using atomic Lua scripts verifying holder token?
- [ ] Is sensitive PII encrypted or excluded before serializing to cache?
- [ ] Does the application handle cache downtime gracefully with database fallback?

---

## Companion Skills
- **Preceding Step**: `07-database-modeling-and-migrations`.
- **Implementation**: `12-resilience-and-error-handling`.
