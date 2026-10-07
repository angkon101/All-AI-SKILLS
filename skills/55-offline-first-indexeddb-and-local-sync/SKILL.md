---
name: offline-first-indexeddb-and-local-sync
description: >-
  Use this skill to design offline-first, local-first web applications and bidirectional background sync engines.
  It guides IndexedDB client storage (Dexie.js/OPFS), offline mutation outboxes, conflict resolution (Last-Write-Wins),
  Progressive Web App (PWA) Service Workers (Stale-While-Revalidate), and background sync workers.
---

# Offline-First, IndexedDB & Local-First Sync Architecture Skill

## Overview
This skill guides the AI agent in operating as a Super Expert Full-Stack and Local-First Web Engineer. Based on Martin Kleppmann’s **Local-First software** paradigm (Linear, Superhuman, Apple Notes), the client computer owns the primary copy of data. All reads and writes execute with zero network latency against local client storage (**IndexedDB / OPFS**), while a background synchronization engine drains offline outboxes and reconciles state with cloud servers.

---

## When to Use This Skill
- Building desktop-class, zero-latency web applications where UI never displays loading spinners for local actions.
- Supporting seamless offline work on mobile devices, flights, or flaky subway connections.
- Persisting gigabytes of structured data directly in the browser using IndexedDB or SQLite in WASM.
- Implementing robust Service Worker caching strategies (Stale-While-Revalidate) for PWA installation.

---

## Input Context Required
1. Client storage volume requirements (megabytes vs. gigabytes of cached data).
2. Conflict resolution policy: Last-Write-Wins (LWW) with client/server timestamps vs. CRDTs.
3. Service Worker caching scope and offline manifest rules.

---

## Step-by-Step Execution Workflow

### Step 1: The Local-First Architecture Flow
Invert traditional web architecture: Local storage is the single source of truth for the UI:
```mermaid
flowchart TD
    User([User Action: Edit Task]) -->|1. Write in 0ms| LocalDB[(Local IndexedDB via Dexie.js)]
    LocalDB -->|2. Instant Local Re-render| UI[UI View (Zero Spinner Lag!)]
    LocalDB -->|3. Append Mutation| Outbox[(Local Outbox Table: 'PENDING')]

    subgraph BackgroundSync["Asynchronous Background Sync Engine"]
        Outbox -->|4. Detect Online Event| SyncWorker[Sync Worker]
        SyncWorker -->|5. Batch Push Mutations| Server[Cloud Backend API]
        Server -->|6. Resolve Conflicts & Return Deltas| SyncWorker
        SyncWorker -->|7. Mark Outbox 'COMPLETED'| Outbox
    end
```

### Step 2: Client Storage: IndexedDB with Dexie.js
Raw browser IndexedDB APIs are notoriously complex and event-driven. Use **Dexie.js** for type-safe transactional operations:
- Define database schema with indexed search columns:
  ```typescript
  class TaskDatabase extends Dexie {
    tasks!: Table<Task, string>;
    outbox!: Table<OutboxMutation, string>;
    constructor() {
      super('LocalTaskAppDB');
      this.version(1).stores({
        tasks: 'id, status, updatedAt',
        outbox: 'id, status, createdAt',
      });
    }
  }
  ```

### Step 3: The Persistent Offline Outbox Pattern
Never lose an action if the user closes their laptop while offline:
1. Every write to `tasks` also writes a transaction record to `outbox` within the same IndexedDB transaction.
2. The mutation records:
   - `id`: UUIDv4
   - `entityType`: `'task'`
   - `action`: `'UPDATE'`
   - `payload`: `{ status: 'COMPLETED' }`
   - `clientTimestamp`: ISO-8601 UTC
   - `status`: `'PENDING'`
3. The background sync worker polls the outbox or triggers on `window.addEventListener('online')`, streaming pending batches in FIFO order.

### Step 4: Conflict Resolution (Last-Write-Wins vs. Three-Way Merge)
When two offline devices edit the same task before syncing:
- **Last-Write-Wins (LWW)**: Compare server `updated_at` against client mutation timestamp. Newer timestamp wins.
- **Field-Level Merging**: If Device A changed `title` and Device B changed `assignee_id`, merge both modifications simultaneously without overwriting unrelated fields.

### Step 5: Service Worker Caching Strategies (PWA Workbox)
Configure caching policies across three distinct asset tiers:
1. **Cache-First**: Static, immutable assets with content hashes in their filename (`/assets/main.a4f10.js`, fonts, icons). Serves directly from cache with zero network check.
2. **Stale-While-Revalidate**: HTML shells and general assets. Serves instantly from cache while asynchronously downloading fresh versions in the background for the next visit.
3. **Network-First with Cache Fallback**: Dynamic user authentication endpoints.

---

## Output Deliverables Template

Generate Local-First Client Store & Sync Engine (TypeScript):

```typescript
// Local-First IndexedDB Store with Offline Outbox & Sync (Dexie.js)
import Dexie, { Table } from 'dexie';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  updatedAt: string;
}

export interface OutboxRecord {
  id: string;
  taskId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Partial<Task>;
  createdAt: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
}

class AppDatabase extends Dexie {
  tasks!: Table<Task, string>;
  outbox!: Table<OutboxRecord, string>;

  constructor() {
    super('TaskLocalFirstDB');
    this.version(1).stores({
      tasks: 'id, updatedAt',
      outbox: 'id, status, createdAt',
    });
  }
}

export const localDb = new AppDatabase();

// 1. Zero-latency local write function
export async function updateTaskLocalFirst(taskId: string, updates: Partial<Task>): Promise<void> {
  const timestamp = new Date().toISOString();

  await localDb.transaction('rw', [localDb.tasks, localDb.outbox], async () => {
    // A. Update local entity immediately
    await localDb.tasks.update(taskId, { ...updates, updatedAt: timestamp });

    // B. Record mutation in outbox within the same atomic transaction
    await localDb.outbox.add({
      id: crypto.randomUUID(),
      taskId,
      action: 'UPDATE',
      payload: updates,
      createdAt: timestamp,
      status: 'PENDING',
    });
  });

  // C. Trigger background sync attempt
  drainOutboxBackground();
}

// 2. Background Sync Worker
export async function drainOutboxBackground(): Promise<void> {
  if (!navigator.onLine) return; // Remain silent if offline

  const pending = await localDb.outbox.where('status').equals('PENDING').sortBy('createdAt');
  if (pending.length === 0) return;

  for (const record of pending) {
    try {
      const res = await fetch('/api/sync/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      if (res.ok) {
        await localDb.outbox.update(record.id, { status: 'SYNCED' });
      }
    } catch (err) {
      console.warn('Sync delayed until next connection window:', err);
      break;
    }
  }
}
```

---

## Quality Checklist & Guardrails
- [ ] Are local reads and writes executed with zero network latency against IndexedDB?
- [ ] Are mutations recorded atomically in an offline `outbox` within the same transaction?
- [ ] Does the sync worker handle network reconnects with FIFO order preservation?
- [ ] Are conflicts resolved at the field level or via timestamp comparison (LWW)?
- [ ] Is a Service Worker configured with Stale-While-Revalidate caching for PWA offline booting?

---

## Companion Skills
- **Real-Time CRDTs**: `54-realtime-collaboration-websockets-and-crdts`.
- **UI Performance**: `56-web-animations-and-60fps-ui-performance`.
- **Database Modeling**: `07-database-modeling-and-migrations`.
