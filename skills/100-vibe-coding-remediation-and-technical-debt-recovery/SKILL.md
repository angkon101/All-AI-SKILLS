---
name: vibe-coding-remediation-and-technical-debt-recovery
description: Systematic technical debt recovery and architectural rehabilitation for vibe-coded codebases, reverse-engineering un-architected code, untyped state recovery, and characterization test safety nets.
---

# 🏗️ Vibe Coding Remediation & Technical Debt Recovery

## 🎯 Role & Objective
As a **Principal Architecture Recovery Fellow & Vibe-Coding Remediator**, your mission is to rehabilitate codebases built through pure "vibe coding"—projects rapidly prompted into existence with zero intentional architecture, sprawling 3,000-line god files, implicit state mutations, unvetted copy-pasted libraries, and zero test safety nets. You execute a structured recovery protocol: establish characterization tests, reverse-engineer bounded contexts, enforce strict type schemas, decompose god components, and transition the project into an enterprise-grade production system.

---

## 🏗️ The 5-Phase Vibe-Coding Recovery Lifecycle

```mermaid
flowchart TD
    VIBE["Chaotic Vibe-Coded Repository (Spaghetti Code, No Architecture, No Tests)"] --> P1["Phase 1: Characterization Testing Safety Net"]
    
    subgraph RecoveryPipeline["Architectural Rehabilitation Protocol"]
        P1 --> P2["Phase 2: Lock Down Dependency Inventory & Purge Phantom Packages"]
        P2 --> P3["Phase 3: Domain Discovery & Schema Extraction (Zod / TypeScript)"]
        P3 --> P4["Phase 4: Strangler Decomposition of 3000-Line God Files"]
        P4 --> P5["Phase 5: Codify Architecture Fitness Functions & Strict CI Gates"]
    end

    RecoveryPipeline --> ENTERPRISE["Production Enterprise Architecture (Refactorable & Tested)"]
```

---

## ⚙️ Standard Implementation Workflow

### Step 1: Phase 1 — Pin Down Existing Behavior with Characterization Tests

Never refactor a vibe-coded file without first recording its actual current behavior (even its quirky behaviors) as characterization tests:

```typescript
// tests/characterization/legacy_order_endpoint.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

describe('Characterization Baseline: POST /api/orders', () => {
  it('captures exact current behavior and status codes for nominal payload', async () => {
    // Record current response shape as a snapshot
    const response = await request(app)
      .post('/api/orders')
      .send({ userId: '123', items: [{ id: 'a', count: 2 }] });

    expect(response.status).toBe(200);
    // Pin down snapshot so refactoring cannot silently alter response shape
    expect(response.body).toMatchSnapshot();
  });
});
```

---

### Step 2: Phase 3 — Strict Schema Extraction (Replacing Untyped Any Graphs)

Vibe-coded repositories rely heavily on implicit JSON dictionaries. Freeze data boundaries with Zod schemas:

```typescript
// domain/schemas/order.schema.ts
import { z } from 'zod';

export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative()
});

export const CreateOrderCommandSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(OrderItemSchema).min(1),
  idempotencyKey: z.string().min(16)
});

export type CreateOrderCommand = z.infer<typeof CreateOrderCommandSchema>;
```

---

### Step 3: Phase 4 — Decomposing God Files via the Strangler Fig Pattern

When an AI prompt has produced a 2,500-line single file (`app/page.tsx` or `server.js`):
1. **Identify High-Affinity Sub-Clusters**: Group database queries, UI rendering, and business calculations.
2. **Extract Pure Domain Calculations First**: Extract calculation functions into pure, standalone helper modules with zero side-effects. Unit test them immediately.
3. **Extract Data Access Layer**: Wrap inline SQL/MongoDB queries into a repository interface.
4. **Leave the God File as a Thin Coordinator**: Gradually reduce the god file until it is merely coordinating use-cases.

```typescript
// Refactored Controller: From 2,500 lines down to 25 lines of clean orchestration
export async function handleCreateOrder(req: Request, res: Response) {
  const command = CreateOrderCommandSchema.parse(req.body);
  const result = await orderService.createOrder(command);
  return res.status(201).json(result);
}
```

---

## 📋 Production Verification Checklist
- [ ] Golden characterization tests are committed before any refactoring begins.
- [ ] Untyped `any` variables and untyped JSON bodies are eliminated via Zod schemas.
- [ ] God files over 500 lines are systematically decomposed into cohesive domain modules.
- [ ] Unverified packages and ghost dependencies have been audited and pruned.
- [ ] Automated architecture fitness functions enforce boundaries in CI, preventing regression back to vibe coding.
