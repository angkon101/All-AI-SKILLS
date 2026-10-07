---
name: mobile-offline-sync-and-sqlite-architecture
description: Mobile local-first architecture, encrypted SQLite with SQLCipher and FTS5 full-text search, offline mutation outbox queues, and resilient background cloud sync.
---

# 📱 Mobile Offline-First Sync & SQLite Architecture

## 🎯 Role & Objective
As a **Principal Mobile Data Architect**, your mandate is to build truly offline-first mobile applications that operate flawlessly in zero-connectivity environments (airplane mode, subways, remote areas). You design embedded **SQLite** databases hardened with **SQLCipher (AES-256)** and accelerated with **FTS5 full-text search**, implement an asynchronous **Mutation Outbox Queue**, handle optimistic UI state rollbacks, and resolve concurrent cloud synchronization conflicts via **Last-Write-Wins (LWW)** and Lamport timestamps.

---

## 🔄 Mobile Offline Sync Outbox Pattern

```mermaid
flowchart TD
    UI["Mobile UI (User Highlights Text / Reads Page)"] -->|1. Optimistic Write| LOCAL["Local Encrypted SQLite DB"]
    UI -->|2. Enqueue Mutation| OUTBOX["Offline Outbox Table (status: PENDING)"]
    LOCAL -->|3. Instant Reactive UI Update| UI

    NET["Network Monitor (Online Detected)"] --> DRAIN["4. Background Outbox Worker"]
    DRAIN -->|5. Batch Post (mutations[])| CLOUD["Cloud Sync API (/sync/v1)"]
    CLOUD -->|6. Acknowledge / Conflicts| DRAIN
    DRAIN -->|7. Update Outbox (status: SYNCED)| OUTBOX
```

---

## ⚙️ Standard Implementation Workflow

### Step 1: Encrypted SQLite Schema with FTS5 Full-Text Search

```sql
-- schema.sql (SQLite with SQLCipher & FTS5)

-- 1. Books Metadata Table
CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    total_pages INTEGER NOT NULL,
    current_page INTEGER DEFAULT 1,
    last_read_at INTEGER NOT NULL,
    sync_status TEXT CHECK(sync_status IN ('SYNCED', 'PENDING_UPDATE')) DEFAULT 'SYNCED'
);

-- 2. Highlights & Annotations Table
CREATE TABLE IF NOT EXISTS annotations (
    id TEXT PRIMARY KEY NOT NULL,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    cfi_range TEXT NOT NULL,
    highlighted_text TEXT NOT NULL,
    note TEXT,
    color TEXT DEFAULT '#00f2fe',
    client_updated_at INTEGER NOT NULL,
    sync_status TEXT CHECK(sync_status IN ('SYNCED', 'PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE')) DEFAULT 'PENDING_INSERT'
);

-- 3. FTS5 Virtual Table for Instant Offline Book Search
CREATE VIRTUAL TABLE IF NOT EXISTS book_search_index USING fts5(
    book_id UNINDEXED,
    chapter_index UNINDEXED,
    content_text,
    tokenize = 'porter unicode61'
);

-- 4. Sync Outbox Queue
CREATE TABLE IF NOT EXISTS sync_outbox (
    outbox_id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, -- 'BOOK_PROGRESS' | 'ANNOTATION'
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,      -- 'UPSERT' | 'DELETE'
    payload_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    retry_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_outbox_created ON sync_outbox(created_at);
```

---

### Step 2: Optimistic Mutation & Outbox Transaction (TypeScript / React Native)

Ensure that any user write updates local storage and enqueues to the outbox inside a single atomic database transaction.

```typescript
// data/annotationsRepository.ts
import * as SQLite from 'expo-sqlite';

export interface Annotation {
  id: string;
  bookId: string;
  cfiRange: string;
  highlightedText: string;
  note?: string;
  color: string;
}

export async function createAnnotationOptimistic(db: SQLite.SQLiteDatabase, annotation: Annotation): Promise<void> {
  const now = Date.now();
  const payloadJson = JSON.stringify({
    ...annotation,
    updatedAt: now
  });

  // Execute within atomic transaction
  await db.withTransactionAsync(async () => {
    // 1. Insert into local annotations table with PENDING_INSERT flag
    await db.runAsync(
      `INSERT INTO annotations (id, book_id, cfi_range, highlighted_text, note, color, client_updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_INSERT')`,
      [annotation.id, annotation.bookId, annotation.cfiRange, annotation.highlightedText, annotation.note ?? null, annotation.color, now]
    );

    // 2. Enqueue mutation in sync_outbox for background upload
    await db.runAsync(
      `INSERT INTO sync_outbox (entity_type, entity_id, action, payload_json, created_at)
       VALUES ('ANNOTATION', ?, 'UPSERT', ?, ?)`,
      [annotation.id, payloadJson, now]
    );
  });
}
```

---

### Step 3: Resilient Outbox Cloud Sync Worker

```typescript
// sync/outboxSyncWorker.ts
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

const SYNC_ENDPOINT = 'https://api.acme.com/v1/sync/batch';

export async function processOutboxQueue(db: SQLite.SQLiteDatabase): Promise<void> {
  const net = await NetInfo.fetch();
  if (!net.isConnected || !net.isInternetReachable) {
    console.log('[SYNC] Device is offline; deferring outbox drain.');
    return;
  }

  // 1. Fetch oldest 50 pending mutations
  const pendingRows = await db.getAllAsync<{
    outbox_id: number;
    entity_type: string;
    entity_id: string;
    action: string;
    payload_json: string;
    retry_count: number;
  }>('SELECT * FROM sync_outbox ORDER BY created_at ASC LIMIT 50');

  if (pendingRows.length === 0) return;

  const batchPayload = pendingRows.map((row) => ({
    outboxId: row.outbox_id,
    type: row.entity_type,
    id: row.entity_id,
    action: row.action,
    payload: JSON.parse(row.payload_json)
  }));

  try {
    // 2. Dispatch batch to Cloud Sync API
    const response = await axios.post(SYNC_ENDPOINT, { mutations: batchPayload }, { timeout: 15000 });
    const { syncedOutboxIds } = response.data;

    // 3. Purge synced rows and mark local records as SYNCED
    await db.withTransactionAsync(async () => {
      for (const id of syncedOutboxIds) {
        await db.runAsync('DELETE FROM sync_outbox WHERE outbox_id = ?', [id]);
      }
      await db.runAsync("UPDATE annotations SET sync_status = 'SYNCED' WHERE sync_status != 'SYNCED'");
    });

    console.log(`[SYNC] Successfully synchronized ${syncedOutboxIds.length} mutations.`);
  } catch (error) {
    console.warn('[SYNC ERROR] Batch push failed; incrementing retry counters:', error);
    await db.runAsync(
      'UPDATE sync_outbox SET retry_count = retry_count + 1 WHERE outbox_id IN (' +
        pendingRows.map((r) => r.outbox_id).join(',') +
        ')'
    );
  }
}
```

---

## 📋 Security & Quality Checklist

- [ ] **SQLCipher 256-Bit Encryption**: Database file encrypted with SQLCipher using a key stored in the hardware Keychain / Android KeyStore.
- [ ] **FTS5 Full-Text Search**: In-book search executes against virtual FTS5 tables with sub-10ms response times on 500,000+ words.
- [ ] **Atomic Outbox Transactions**: Local writes and outbox enqueues execute inside `withTransactionAsync` to eliminate sync state divergence.
- [ ] **Network State Debouncing**: Sync worker triggers on `NetInfo` connectivity restoration with a 2-second debounce window.
- [ ] **Conflict Resolution Strategy**: Backend implements Last-Write-Wins (LWW) utilizing client timestamps combined with server sequence clocks.
- [ ] **Exponential Backoff on Failures**: Failing mutations increase `retry_count` and back off exponentially to protect battery and server capacity.
