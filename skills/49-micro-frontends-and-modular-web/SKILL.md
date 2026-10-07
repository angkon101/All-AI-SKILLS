---
name: micro-frontends-and-modular-web
description: >-
  Use this skill to design scalable Micro-Frontend (MFE) architectures and modular web applications.
  It guides Webpack/Vite Module Federation (Host vs Remote containers), shared dependency singleton management (React/Vue),
  decoupled cross-app communication via CustomEvents, CSS isolation strategies, and resilient Error Boundary fallbacks.
---

# Micro-Frontends & Modular Web Architecture Skill

## Overview
This skill guides the AI agent in operating as a Principal Frontend Architect. It scales enterprise web applications by decomposing monolithic single-page apps into independently deployable, autonomous **Micro-Frontends (MFEs)**. Utilizing **Module Federation**, it dynamically composes remote applications at runtime while managing shared dependency singletons, sandboxing CSS stylesheets, and ensuring page resilience when individual remotes fail.

---

## When to Use This Skill
- Multiple independent squads need to deploy changes to the same customer-facing web application autonomously.
- Breaking apart a 500,000-line monolithic frontend repository into domain-aligned micro-apps.
- Composing remote components dynamically at runtime without rebuilding the host shell container.
- Preventing catastrophic full-page crashes when a non-critical widget or subsystem degrades.

---

## Input Context Required
1. Organizational squads and domain boundaries from `31-team-topologies-and-org-design`.
2. Frontend framework and bundler (Webpack 5, Vite with `@originjs/vite-plugin-federation`, Rspack).
3. Shared dependency requirements (React version, design system component library).

---

## Step-by-Step Execution Workflow

### Step 1: Micro-Frontend Integration Architecture
Select the runtime integration mechanism matching team autonomy:
```mermaid
flowchart TD
    Browser([User Browser]) --> Shell[App Shell / Host Container (Header, Nav, Router)]

    subgraph Remotes["Runtime Remote Micro-Frontends (Module Federation)"]
        Shell -->|Fetch remoteEntry.js| MFE1[Checkout Remote (Squad A)]
        Shell -->|Fetch remoteEntry.js| MFE2[Catalog & Search Remote (Squad B)]
        Shell -->|Fetch remoteEntry.js| MFE3[Account & Billing Remote (Squad C)]
    end
```
- **Build-Time Integration (npm packages)**: Anti-pattern! Every change requires re-building and re-deploying the host shell app.
- **Runtime Module Federation**: Industry standard. Host fetches compiled `remoteEntry.js` bundles dynamically from CDN. Squads deploy updates independently in seconds!

### Step 2: Shared Dependency & Singleton Management
Loading multiple copies of large libraries bloats bundles and breaks frameworks:
- **Singletons**: React, ReactDOM, Vue, or state libraries MUST be declared as singletons in `webpack.config.js`:
  ```javascript
  shared: {
    react: { singleton: true, requiredVersion: '^18.2.0', eager: false },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0', eager: false },
  }
  ```
- If versions match, the browser downloads React *only once* across all micro-frontends.

### Step 3: Decoupled Cross-MFE Communication
Never create a giant shared Redux/Zustand store across micro-frontends! That recreates a distributed monolith:
1. **URL Query Parameters (Primary)**: The URL is the universal contract (`/checkout?plan=enterprise&currency=usd`).
2. **Browser CustomEvents (Secondary)**: For decoupled broadcast events:
   ```typescript
   // Remote A emits:
   window.dispatchEvent(new CustomEvent('cart:item_added', { detail: { itemId: '123' } }));

   // Remote B listens:
   window.addEventListener('cart:item_added', (e: CustomEvent) => updateBadge(e.detail));
   ```

### Step 4: CSS Isolation & Style Sandboxing
Prevent styles in Remote A from accidentally overriding styles in Remote B:
- **CSS Modules / Scoped CSS**: Guarantees unique hashed class names (`.button_a7b9c`).
- **Tailwind Namespace Prefixing**: Configure prefix in each remote (`tw-checkout-`, `tw-catalog-`).
- **Shadow DOM**: Encapsulates DOM and styles completely inside custom Web Components.

### Step 5: Resilient Error Boundaries & Graceful Fallbacks
A failure in a non-critical widget (e.g., Recommendation Carousel) must NEVER crash the entire checkout page:
- Wrap every remote import in a React/Vue **Error Boundary**.
- If the remote CDN times out, render an empty slot or graceful fallback banner while keeping the rest of the application fully functional.

---

## Output Deliverables Template

### 1. Webpack Module Federation Host Configuration (`host/webpack.config.js`)
```javascript
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app_shell',
      remotes: {
        checkoutMfe: 'checkoutMfe@https://cdn.enterprise.com/checkout/remoteEntry.js',
        catalogMfe: 'catalogMfe@https://cdn.enterprise.com/catalog/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
      },
    }),
  ],
};
```

### 2. Resilient Remote Loader Component with Error Boundary (`host/RemoteLoader.tsx`)
```tsx
import React, { Suspense } from 'react';

// Lazy-load remote micro-frontend over network
const RemoteCheckout = React.lazy(() => import('checkoutMfe/CheckoutWidget'));

class MfeErrorBoundary extends React.Component<{ fallbackText: string }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 border rounded bg-yellow-50">{this.props.fallbackText}</div>;
    }
    return this.props.children;
  }
}

export const CheckoutView: React.FC = () => (
  <MfeErrorBoundary fallbackText="Checkout is temporarily unavailable. Please refresh.">
    <Suspense fallback={<div className="spinner">Loading checkout...</div>}>
      <RemoteCheckout />
    </Suspense>
  </MfeErrorBoundary>
);
```

---

## Quality Checklist & Guardrails
- [ ] Are core runtime libraries (React, ReactDOM) configured as singletons in Module Federation?
- [ ] Are remote micro-frontends independently deployable without rebuilding the host shell?
- [ ] Is cross-MFE state coordinated via URLs or CustomEvents (no shared monolithic store)?
- [ ] Are remote components wrapped in Error Boundaries to isolate runtime failures?
- [ ] Is CSS isolated via CSS Modules, prefixes, or Shadow DOM?

---

## Companion Skills
- **Frontend Architecture**: `14-frontend-architecture-and-state`.
- **Team Topologies**: `31-team-topologies-and-org-design`.
- **DevOps CI/CD**: `20-containerization-and-devops`.
