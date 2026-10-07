---
name: end-to-end-type-safety-and-trpc
description: >-
  Use this skill to design and implement end-to-end type-safe fullstack architectures without code generation drift.
  It guides tRPC v11 router structures, shared Zod/Valibot validation schemas, automatic client type inference,
  type-safe API error handling, and unified fullstack contract testing.
---

# End-to-End Type Safety & tRPC Architecture Skill

## Overview
This skill guides the AI agent in operating as a Super Expert Full-Stack Developer. It eliminates the traditional disconnect between frontend interfaces and backend APIs by enforcing **End-to-End (E2E) Type Safety**. Utilizing **tRPC** and shared runtime validation schemas (Zod/Valibot), any modification to a backend database model or endpoint parameter triggers an immediate compile-time type error across the frontend client before code is ever run.

---

## When to Use This Skill
- Building full-stack TypeScript applications (Next.js, Vite + Express/Fastify, Remix, SvelteKit).
- Eliminating fragile manual API typing and out-of-sync REST documentation.
- Sharing validation schemas seamlessly between frontend forms and backend database mutations.
- Refactoring backend models with 100% confidence that broken frontend calls will be caught by `tsc`.

---

## Input Context Required
1. Runtime stack: Next.js App Router, Vite React, or monorepo package structure.
2. Shared validation library: Zod, Valibot, or ArkType.
3. Database ORM / query builder: Prisma, Drizzle ORM, or Kysely.

---

## Step-by-Step Execution Workflow

### Step 1: The E2E Type-Safety Mental Model
Never duplicate types between frontend and backend:
```mermaid
flowchart LR
    subgraph Backend["Backend Router (tRPC / Server)"]
        Drizzle[(Drizzle Schema / DB)] --> Router[tRPC Procedure: query / mutation]
        Schema[Zod Input Schema] --> Router
    end

    Router -.->|Export AppRouter Type ONLY (Zero JS Bundle Size)| ClientType["type AppRouter"]

    subgraph Frontend["Frontend Client (React / TanStack)"]
        ClientType --> Client[trpc.useQuery / useMutation]
        Schema --> Form[React Hook Form / Zod Resolver]
        Client --> UI[Auto-Completed UI Components]
    end
```
- **Zero Runtime Bloat**: The frontend imports *only* TypeScript types (`import type { AppRouter } from '@/server/api/root'`). Zero backend JavaScript code is bundled into client assets!

### Step 2: Modular tRPC Procedure & Router Architecture
Structure procedures using clear middleware authorization:
1. **Public Procedure**: Unauthenticated (login, public landing data).
2. **Protected Procedure**: Enforces authenticated session; injects `ctx.session.user` and `ctx.tenantId`.
3. **Admin Procedure**: Enforces role checks before procedure execution.

### Step 3: Shared Schema Single Source of Truth
Define validation schemas once in a shared module and use them everywhere:
- Frontend uses it in form validation (e.g., `zodResolver(CreateOrderSchema)`).
- Backend uses it as the procedure `.input(CreateOrderSchema)`.
- If a field is changed from optional to required, both the frontend form and backend route adapt synchronously.

### Step 4: Type-Safe Error Handling & Formatting
Never return generic `500 Internal Server Error` strings:
- Use `TRPCError` with semantic codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`.
- The client receives strongly typed error objects (`error.data?.zodError?.fieldErrors`).

---

## Output Deliverables Template

### 1. Backend Router & Protected Procedure (`src/server/api/routers/orders.ts`)
```typescript
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
    })
  ).min(1, 'Order must contain at least one item'),
  shippingAddressId: z.string().uuid(),
});

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, db } = ctx;

      // Type-safe execution with auto-completed input fields
      const newOrder = await db.orders.create({
        data: {
          userId: user.id,
          addressId: input.shippingAddressId,
          items: input.items,
          status: 'PENDING',
        },
      });

      return newOrder;
    }),
});
```

### 2. Frontend React Client Usage with Full Auto-Complete (`src/app/orders/page.tsx`)
```tsx
'use client';

import React from 'react';
import { trpc } from '@/trpc/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOrderSchema } from '@/server/api/routers/orders';
import { z } from 'zod';

type FormValues = z.infer<typeof CreateOrderSchema>;

export function OrderCheckoutForm() {
  const utils = trpc.useUtils();
  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      // `order` is fully typed from backend return signature!
      console.log('Order created successfully:', order.id);
      utils.orders.invalidate();
    },
    onError: (err) => {
      alert(`Error: ${err.message}`);
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(CreateOrderSchema),
  });

  const onSubmit = (data: FormValues) => {
    createOrder.mutate(data); // 100% type-checked payload!
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* UI Form Fields with instant compile-time checking */}
    </form>
  );
}
```

---

## Quality Checklist & Guardrails
- [ ] Is frontend importing ONLY TypeScript types from the backend (no runtime backend JS in bundle)?
- [ ] Are input validation schemas (Zod) shared between frontend forms and backend routers?
- [ ] Are protected procedures guarded by session authentication middleware?
- [ ] Does `tsc --noEmit` detect breaking changes across the entire client-server boundary?
- [ ] Are mutations configured with cache invalidation (`utils.invalidate()`) on success?

---

## Companion Skills
- **Forms & Validation**: `53-advanced-form-architecture-and-validation`.
- **Database Modeling**: `07-database-modeling-and-migrations`.
- **Clean Architecture**: `10-clean-architecture-and-solid`.
