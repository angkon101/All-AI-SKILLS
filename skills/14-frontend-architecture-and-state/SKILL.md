---
name: frontend-architecture-and-state
description: >-
  Use this skill to design responsive, accessible, and performant frontend web applications.
  It guides component hierarchy architecture, server vs client state separation (TanStack Query vs Zustand),
  design token systems, Core Web Vitals optimization (LCP, INP, CLS), and WCAG 2.1 AA accessibility.
---

# Frontend Architecture & State Management Skill

## Overview
This skill guides the AI agent in engineering scalable, highly responsive, and accessible frontend client architectures. It separates server cache from ephemeral UI state, implements design token systems, optimizes Core Web Vitals, and ensures full keyboard and screen-reader accessibility.

---

## When to Use This Skill
- Architecting a modern frontend application or component library.
- Structuring complex client-side state across server queries, URL parameters, and local forms.
- Optimizing web performance for Core Web Vitals (Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift).
- Enforcing WCAG 2.1 AA accessibility compliance across interactive components.

---

## Input Context Required
1. Product requirements and user journeys from `01-requirements-spec`.
2. API contracts and OpenAPI schemas from `05-api-contract-design`.
3. Target frontend framework (React, Vue, Svelte, Angular, Vanilla TS/HTML).

---

## Step-by-Step Execution Workflow

### Step 1: The Three-Tier State Architecture
Never store server data in a generic global store. Separate state strictly into three tiers:
1. **Server State (Remote Cache)**:
   - *Tools*: TanStack Query, SWR, RTK Query.
   - *Characteristics*: Asynchronous, requires cache invalidation, deduplication, background re-fetching, optimistic updates.
2. **Client / UI State (Ephemeral Local)**:
   - *Tools*: Zustand, Signals, React Context, or local component state.
   - *Characteristics*: Synchronous, transient UI state (e.g., sidebar toggled, active modal, dropdown open).
3. **URL State (Shareable Navigation)**:
   - *Tools*: Browser Query Parameters (`useSearchParams`).
   - *Characteristics*: Filters, search keywords, pagination page, active tabs. Must persist across link sharing!

### Step 2: Component Hierarchy & Atomic Organization
Structure components cleanly:
```text
src/
├── components/
│   ├── ui/               # Reusable primitives: Button, Input, Modal, Dropdown (Headless / Accessible)
│   ├── forms/            # Composed form blocks with validation
│   └── layout/           # AppShell, Navbar, Sidebar, Footer
├── features/             # Domain-specific feature modules
│   ├── orders/
│   │   ├── api/          # useOrdersQuery.ts, useCreateOrderMutation.ts
│   │   ├── components/   # OrderTable.tsx, OrderStatusBadge.tsx
│   │   └── types/        # order.types.ts
├── hooks/                # Shared custom hooks (useDebounce, useMediaQuery)
└── styles/               # CSS variables & design tokens
```

### Step 3: Design Tokens & Styling Architecture
Establish semantic CSS variables for consistency and effortless dark mode:
```css
:root {
  /* Colors */
  --color-bg-canvas: #0f172a;
  --color-bg-surface: #1e293b;
  --color-border: #334155;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  
  /* Spacing & Radii */
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Step 4: Accessibility (WCAG 2.1 AA Compliance)
- **Keyboard Navigation**: All interactive elements must be focusable via `Tab` and activatable via `Enter` / `Space`.
- **Focus Rings**: Never remove `:focus-visible` outlines without providing a high-contrast replacement.
- **ARIA & Roles**: Use semantic HTML (`<button>`, `<dialog>`, `<nav>`, `<main>`) before reaching for ARIA. Provide `aria-label` for icon-only buttons.
- **Color Contrast**: Enforce minimum contrast ratio of `4.5:1` for normal text and `3:1` for large text against background.

### Step 5: Core Web Vitals Optimization
- **Largest Contentful Paint (LCP < 2.5s)**: Preload hero images, optimize font loading (`font-display: swap`), avoid render-blocking scripts.
- **Interaction to Next Paint (INP < 200ms)**: Defer heavy computations off the main thread (Web Workers), use transitions (`startTransition`), debounce input handlers.
- **Cumulative Layout Shift (CLS < 0.1)**: Always set explicit `width` and `height` (or `aspect-ratio`) on images and video embeds; reserve space for dynamic banners/skeletons.

---

## Output Deliverables Template

Generate accessible UI component snippet:

```tsx
// Accessible, optimistic mutation button with status states
import React, { useTransition } from 'react';

interface ActionButtonProps {
  label: string;
  onAction: () => Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onAction,
  variant = 'primary',
}) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await onAction();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
      className={`btn btn-${variant} ${isPending ? 'loading' : ''}`}
      style={{
        padding: '0.625rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        cursor: isPending ? 'not-allowed' : 'pointer',
      }}
    >
      {isPending ? (
        <span aria-hidden="true" className="spinner" />
      ) : null}
      <span>{label}</span>
    </button>
  );
};
```

---

## Quality Checklist & Guardrails
- [ ] Is server data isolated using dedicated query hooks (not copied into global Redux/Zustand state)?
- [ ] Are filter and pagination states synced with URL search params?
- [ ] Are all image assets configured with explicit aspect ratios or width/height attributes?
- [ ] Can the entire application be navigated using keyboard only?
- [ ] Does color contrast meet WCAG 2.1 AA standards (minimum 4.5:1 ratio)?

---

## Companion Skills
- **Preceding Step**: `05-api-contract-design`.
- **Testing**: `16-integration-and-e2e-testing`.
