---
name: ai-code-smell-detection-and-deodorizing
description: Detect and deodorize distinct AI code smells, eliminate zombie parameters, consolidate amnesiac reinvented helpers, fix placebo retries, and purge hallucinated configuration flags.
---

# 👃 AI Code Smell Detection & Deodorizing

## 🎯 Role & Objective
As a **Principal Code Quality Fellow & AI Deodorizing Architect**, your mission is to identify and eradicate the subtle, idiosyncratic "code smells" that uniquely characterize generative AI output. Unlike traditional human coding errors, AI models produce distinct architectural anti-patterns: **Zombie Parameters** (unused arguments copied from training data), **Amnesiac Helpers** (reinventing date/string formatters in every file), **Placebo Retries** (retrying non-idempotent 400 errors), and **Hallucinated Config Flags**. You diagnose these patterns and deodorize codebases to maintain pristine maintainability.

---

## 🏗️ The 5 Distinct AI Code Smells

```mermaid
flowchart TD
    subgraph AICodeSmells["Distinct Generative AI Code Smells"]
        S1["1. The Zombie Parameter (Unused signature args copied blindly)"]
        S2["2. The Amnesiac Helper (Reinventing utils/date.ts in 8 different files)"]
        S3["3. The Placebo Retry (Retrying 400 Bad Request with zero delay)"]
        S4["4. The Ghost Try-Catch (Wrapping sync code or swallowing async promises)"]
        S5["5. The Hallucinated Config Flag (Adding non-existent keys to framework configs)"]
    end

    AICodeSmells --> AUDIT["AST Code Smell Scanner"]
    AUDIT --> DEODORIZE["Deodorizing Refactoring Action"]
    DEODORIZE --> CLEAN["Cohesive, Shared, Verified Architectural Baseline"]
```

---

## ⚙️ Standard Implementation Workflow

### Step 1: Identifying & Deodorizing the 5 Smells

#### Smell 1: The Zombie Parameter
*Symptom*: An AI model outputs a function taking 5 parameters, but uses only 2 of them:
```typescript
// ❌ AI Smelling Code: 'format' and 'strictMode' are completely ignored
export function parseUserIdentifier(rawId: string, format: string, strictMode: boolean): string {
  return rawId.trim().toLowerCase();
}

// ✅ Deodorized: Clean signature with zero zombie baggage
export function parseUserIdentifier(rawId: string): string {
  return rawId.trim().toLowerCase();
}
```

---

#### Smell 2: The Amnesiac Helper
*Symptom*: In `auth.ts`, `billing.ts`, and `dashboard.ts`, the AI writes 3 slightly different versions of `formatCurrency()` or `formatDate()`, unaware that `src/lib/formatters.ts` already exists:
```typescript
// ❌ AI Smelling Code in orders.ts:
function formatPrice(val: number) { return '$' + val.toFixed(2); }

// ✅ Deodorized: Import established single source of truth
import { formatCurrency } from '@/lib/formatters';
```

---

#### Smell 3: The Placebo Retry
*Symptom*: AI attempts to look "resilient" by wrapping an HTTP call in a retry loop, but retries fatal client errors without backoff:
```typescript
// ❌ AI Smelling Code: Retries 401 Unauthorized 3 times with 0ms delay!
for (let i = 0; i < 3; i++) {
  try {
    return await api.post('/charge', payload);
  } catch (e) {
    if (i === 2) throw e;
  }
}

// ✅ Deodorized: Exponential backoff with jitter; only retries transient errors (503, 429)
import { pRetry, isTransientHttpError } from '@/lib/resilience';

return await pRetry(() => api.post('/charge', payload), {
  retries: 3,
  factor: 2,
  minTimeout: 200,
  shouldRetry: (err) => isTransientHttpError(err)
});
```

---

#### Smell 4: The Hallucinated Config Flag
*Symptom*: AI adds fictional configuration flags to `vite.config.ts` or `tailwind.config.js` hallucinated from other tools:
```javascript
// ❌ AI Smelling Code in vite.config.ts:
export default defineConfig({
  server: {
    hotReload: true,       // Fictional: Vite uses 'hmr', not 'hotReload'
    enableFastRefresh: true // Fictional: React plugin handles this, not server root
  }
});

// ✅ Deodorized: Strictly validated against Vite's exported UserConfig types
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});
```

---

## 📋 Production Verification Checklist
- [ ] No unused function parameters exist (`@typescript-eslint/no-unused-vars` enforced).
- [ ] Utility functions are consolidated in shared modules, not reinvented per-file.
- [ ] Retry blocks explicitly inspect error status codes (only retrying 5xx and 429).
- [ ] Configuration files are typechecked against official schemas (`UserConfig`).
- [ ] Catch blocks preserve original error stack traces using `new Error(msg, { cause: err })`.
