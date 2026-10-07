---
name: database-sharding-and-partitioning
description: >-
  Use this skill to design horizontal database sharding architectures and declarative table partitioning.
  It guides Shard Key selection, Consistent Hashing algorithms, PostgreSQL declarative partitioning (Range/List/Hash),
  Partition Pruning optimization, mitigating distributed cross-shard joins, and Citus/Vitess distributed SQL topologies.
---

# Database Sharding & Partitioning Architecture Skill

## Overview
This skill guides the AI agent in operating as a Principal Database Architect and Scale Infrastructure Fellow. When databases grow beyond the vertical limits of single-node hardware (>10 TB data volumes, IOPS saturation, connection exhaustion), horizontal scale-out becomes mandatory. By implementing declarative table partitioning, selecting optimal Shard Keys, applying Consistent Hashing, and co-locating related entity tables, systems achieve virtually unlimited linear horizontal scalability.

---

## When to Use This Skill
- Scaling relational databases (PostgreSQL, MySQL) past single-node hardware ceilings (>100,000 writes/sec or >15 TB storage).
- Designing multi-terabyte time-series or audit tables via declarative range partitioning.
- Eliminating table lock contention and long vacuum times on high-cardinality tables.
- Distributing data across multi-node clusters using Citus, Vitess, or application-level routing.

---

## Input Context Required
1. Scale metrics: Total dataset size, monthly row growth, peak write and read QPS.
2. Query access patterns: What columns are present in 95%+ of all `WHERE` and `JOIN` clauses?
3. Target distributed engine (Native PostgreSQL Partitioning, Citus Data, Vitess, CockroachDB).

---

## Step-by-Step Execution Workflow

### Step 1: Partitioning vs. Sharding (Level of Granularity)
Differentiate the two scale tiers:
- **Table Partitioning (Single Node / Logical)**: A single database instance divides a giant table into smaller sub-tables behind the scenes. Best for managing tables with $>50\text{M}$ rows on a single server.
- **Horizontal Sharding (Distributed / Physical)**: Data is split across multiple independent database servers (shards), each holding a subset of rows. Required when storage or compute saturates a single machine.

### Step 2: PostgreSQL Declarative Table Partitioning
Partition large tables logically without changing application SQL:
1. **Range Partitioning**: Best for time-series and audit logs:
   ```sql
   CREATE TABLE events (
       id UUID NOT NULL,
       tenant_id UUID NOT NULL,
       created_at TIMESTAMPTZ NOT NULL,
       payload JSONB
   ) PARTITION BY RANGE (created_at);

   -- Partitions
   CREATE TABLE events_2026_q1 PARTITION OF events
       FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-04-01 00:00:00+00');
   ```
2. **Partition Pruning**:
   Ensure `enable_partition_pruning = on`. When querying `WHERE created_at >= '2026-02-01'`, the PostgreSQL query planner skips all historical partitions, scanning *only* the matching quarter!

### Step 3: Shard Key Selection & Co-location
The Shard Key is the single most critical architectural choice in horizontal scaling:
- **Golden Rule 1: High Cardinality & Uniform Distribution**: Choose keys with millions of distinct values (e.g., `account_id`, `company_id`). Never shard on low-cardinality columns like `country` or `status`!
- **Golden Rule 2: Co-locate Related Entities**:
  - If `orders` and `order_items` both use `company_id` as their shard key, all items for an order will reside on the **exact same physical database shard**.
  - Local joins on the same shard run at native SQL speed ($< 5\text{ms}$).
  - Cross-shard distributed joins require scatter-gather network calls and run $100\times$ slower!

```mermaid
flowchart TD
    Router[Application / Shard Router]

    subgraph Shard1["Shard 1 (Company A, Company B)"]
        O1[Orders: Company A] --- I1[Order Items: Company A]
        note1["Local SQL JOIN: Fast (<5ms)"]
    end

    subgraph Shard2["Shard 2 (Company C, Company D)"]
        O2[Orders: Company C] --- I2[Order Items: Company C]
    end

    Router -->|Hash(Company A) -> Node 1| Shard1
    Router -->|Hash(Company C) -> Node 2| Shard2
```

### Step 4: Consistent Hashing Ring (Ketama Algorithm)
Avoid naive modulo sharding (`hash(key) % N`):
- If you use modulo and add an $(N+1)$-th database shard, **almost 100% of keys must be moved across the network**!
- Use **Consistent Hashing**:
  - Keys and nodes are mapped onto a $2^{32} - 1$ virtual ring.
  - Adding a new shard requires migrating only $K / N$ keys (minimal rebalancing disruption).
  - Use virtual nodes (vnodes) to guarantee uniform distribution across physical nodes.

### Step 5: Mitigating the Hotspot / "Celebrity Tenant" Problem
When one single customer generates 50% of the entire company's traffic:
- Isolate the celebrity tenant onto a dedicated database instance (see `45-multi-tenant-saas-architecture`).
- Remove the tenant from the standard consistent hash ring to protect all other tenants.

---

## Output Deliverables Template

Generate automated PostgreSQL Partition Maintenance Script (SQL):

```sql
-- Automated Monthly Partition Creation & Archival Procedure
CREATE OR REPLACE FUNCTION create_monthly_events_partition(target_date DATE)
RETURNS VOID AS $$
DECLARE
    start_date TIMESTAMPTZ := date_trunc('month', target_date);
    end_date TIMESTAMPTZ := start_date + INTERVAL '1 month';
    partition_name TEXT := 'events_' || to_char(start_date, 'YYYY_MM');
BEGIN
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF events
         FOR VALUES FROM (%L) TO (%L);',
        partition_name, start_date, end_date
    );

    -- Index partition locally for fast b-tree lookups
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I (tenant_id, created_at);',
        'idx_' || partition_name || '_tenant_created', partition_name
    );
END;
$$ LANGUAGE plpgsql;

-- Example: Pre-provision upcoming partition
SELECT create_monthly_events_partition('2026-11-01'::DATE);
```

---

## Quality Checklist & Guardrails
- [ ] Is the Shard Key present in high-frequency queries to enable single-shard routing?
- [ ] Are related child tables co-located on the same shard using the same shard key?
- [ ] Are distributed cross-shard joins strictly avoided in online transaction paths?
- [ ] Is partition pruning verified via `EXPLAIN` to confirm unneeded partitions are skipped?
- [ ] Is consistent hashing configured with virtual nodes to prevent uneven data distribution?

---

## Companion Skills
- **Storage Engines**: `42-database-internals-and-storage-engines`.
- **Database Modeling**: `07-database-modeling-and-migrations`.
- **SaaS Multi-Tenancy**: `45-multi-tenant-saas-architecture`.
