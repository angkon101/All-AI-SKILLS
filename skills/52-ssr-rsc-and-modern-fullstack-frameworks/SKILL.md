---
name: ssr-rsc-and-modern-fullstack-frameworks
description: >-
  Use this skill to master React Server Components (RSC), streaming SSR, and modern fullstack frameworks (Next.js App Router, Remix).
  It guides Server vs. Client component boundaries, streaming Suspense skeletons, Server Actions with progressive enhancement,
  cache revalidation (revalidateTag), hydration mismatch debugging, and Partial Prerendering (PPR).
---

# SSR, React Server Components (RSC) & Fullstack Frameworks Skill

## Overview
This skill guides the AI agent in operating as a Super Expert Full-Stack Web Architect. It masters modern fullstack execution paradigms including **React Server Components (RSC)**, streaming Server-Side Rendering (SSR), and Server Actions. By keeping data fetching and business secrets on the server (zero client bundle impact) and streaming deferred UI blocks via React Suspense, applications achieve instant Time to First Byte (TTFB) and flawless hydration.

---

## When to Use This Skill
- Building modern Next.js App Router, Remix, or SvelteKit fullstack web applications.
- Decomposing pages into Server Components (zero bundle size) and Client Components (interactive islands).
- Eliminating waterfall network loading using streaming SSR and React Suspense.
- Implementing mutations via Server Actions with progressive enhancement and optimistic UI updates.
- Diagnosing and eliminating subtle hydration mismatch errors.

---

## Input Context Required
1. Framework target: Next.js (App Router), Remix / React Router v7, Nuxt 3, or SvelteKit.
2. Data fetching requirements: Static pre-rendering (SSG/ISR) vs. dynamic real-time user data (SSR).
3. Interactivity boundaries: Which specific leaf widgets require browser state (`useState`, `onClick`)?

---

## Step-by-Step Execution Workflow

### Step 1: The Server vs. Client Component Boundary
Enforce the fundamental RSC boundary discipline:
```mermaid
flowchart TD
    subgraph ServerEnvironment["Server Environment (Zero Client JS Bundle)"]
        Page[Page.tsx (Server Component)]
        DB[(Direct DB / ORM Call)]
        Page --> DB
        Page --> StaticLayout[Header & Nav: Server Component]
        Page --> SuspenseWrapper[Suspense Boundary with Skeleton]
    end

    subgraph ClientEnvironment["Client Environment (Downloaded by Browser)"]
        SuspenseWrapper --> InteractiveWidget["InteractiveFilter.tsx ('use client')"]
        InteractiveWidget --> Hooks["useState, onClick, Framer Motion"]
    end
```
- **Server Components (Default)**: Fetch data directly from PostgreSQL/Redis, read environment secrets, execute heavy Markdown/AST parsing. Ships **0 KB** of JavaScript to the browser!
- **Client Components (`'use client'`)**: Push as far down the component tree as possible (to interactive leaf nodes). Use *only* for state, effects, and DOM event listeners.

### Step 2: Progressive Streaming SSR with React Suspense
Never make the user stare at a blank white screen while waiting for a slow backend query!
- Wrap slow widgets in `<Suspense fallback={<Skeleton />}>`.
- The server immediately flushes the HTML shell in $< 40\text{ms}$.
- As the slow database query finishes, the server streams the rendered component HTML over the open HTTP connection and replaces the skeleton in-place.

### Step 3: Server Actions & Progressive Enhancement (`'use server'`)
Handle mutations natively without writing custom API routes:
1. Define a Server Action inside a server file or function.
2. Bind to a form action: `<form action={createItem}>`.
3. **Progressive Enhancement**: The form submits and works even if the user has a slow mobile connection where JavaScript has not finished downloading yet!
4. **Optimistic Updates**: Use `useOptimistic()` to instantly update the UI locally before the server responds.
5. **Cache Invalidation**: Call `revalidatePath('/dashboard')` or `revalidateTag('items')` inside the action to refresh cached data.

### Step 4: Hydration Mismatch Elimination
Hydration errors happen when the server-rendered HTML differs from the initial client render.
- **Common Cause 1: Dates & Timestamps**: Server renders UTC; browser renders local timezone.
  - *Fix*: Render timestamps inside a client component after mounting (`useEffect` or `useSyncExternalStore`).
- **Common Cause 2: `typeof window !== 'undefined'` in render**:
  - *Fix*: Never branch render trees on window availability during initial render.
- **Common Cause 3: Invalid HTML Nesting**:
  - e.g., `<p><div>...</div></p>` or `<table><tr>...</tr></table>` (missing `<tbody>`). The browser auto-corrects the DOM, triggering a React hydration mismatch!

---

## Output Deliverables Template

Generate production Next.js App Router Page with Streaming & Server Actions:

```tsx
// src/app/dashboard/page.tsx (Server Component)
import React, { Suspense } from 'react';
import { db } from '@/server/db';
import { revalidateTag } from 'next/cache';
import { OrderListSkeleton } from '@/components/skeletons';

// 1. Server Action: Directly mutates database and revalidates cache
async function createOrderAction(formData: FormData) {
  'use server';
  const itemName = formData.get('itemName') as string;
  await db.orders.create({ data: { name: itemName, status: 'PENDING' } });
  revalidateTag('orders'); // Invalidate tag cache
}

// 2. Slow Component streamed via Suspense
async function AsyncOrderList() {
  // Direct server database query (Zero client bundle JS!)
  const orders = await db.orders.findMany({ cache: { tags: ['orders'] } });

  return (
    <ul className="divide-y">
      {orders.map((o) => (
        <li key={o.id} className="py-2">{o.name} - <span className="text-sm text-gray-500">{o.status}</span></li>
      ))}
    </ul>
  );
}

// 3. Page Shell: Flushes immediately to user in <40ms
export default function DashboardPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Operations Dashboard</h1>

      {/* Progressive Enhancement Server Form */}
      <form action={createOrderAction} className="flex gap-2 mb-6">
        <input name="itemName" placeholder="Item name" required className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Order</button>
      </form>

      {/* Streaming Boundary */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Live Orders</h2>
        <Suspense fallback={<OrderListSkeleton />}>
          <AsyncOrderList />
        </Suspense>
      </section>
    </main>
  );
}
```

---

## Quality Checklist & Guardrails
- [ ] Are `'use client'` directives pushed to the leaves of the component tree?
- [ ] Are slow queries wrapped in React Suspense with dedicated skeleton fallbacks?
- [ ] Do Server Actions call `revalidateTag` or `revalidatePath` to refresh cache?
- [ ] Is server rendering free from date/timezone and window hydration mismatches?
- [ ] Are database clients and environment secrets isolated strictly within Server Components?

---

## Companion Skills
- **Type-Safe RPC**: `51-end-to-end-type-safety-and-trpc`.
- **Form Architecture**: `53-advanced-form-architecture-and-validation`.
- **Frontend Architecture**: `14-frontend-architecture-and-state`.
