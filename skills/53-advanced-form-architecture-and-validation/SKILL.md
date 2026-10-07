---
name: advanced-form-architecture-and-validation
description: >-
  Use this skill to design complex fullstack form architectures, dynamic nested arrays, and multi-step wizard state machines.
  It guides React Hook Form performance optimization (zero unnecessary re-renders), shared Zod schema validation,
  accessible ARIA error messaging, multi-step URL state preservation, and direct-to-S3 presigned file uploads.
---

# Advanced Form Architecture & Validation Skill

## Overview
This skill guides the AI agent in operating as a Super Expert Full-Stack Frontend Engineer. Forms are the primary vehicle for customer data entry and transactions. By utilizing uncontrolled form architectures (React Hook Form), dynamic nested field arrays, accessible ARIA error bindings, multi-step wizard state machines synced to URL parameters, and direct-to-cloud presigned file uploads, applications deliver frictionless user experiences with zero re-render lag.

---

## When to Use This Skill
- Building complex, data-heavy enterprise forms (invoices, nested configurations, dynamic line items).
- Constructing multi-step onboarding or checkout wizards with draft persistence.
- Eliminating re-render lag on forms with 50+ input fields.
- Implementing large file attachments via direct S3/R2 presigned upload URLs.

---

## Input Context Required
1. Form data model and validation rules (types, min/max limits, conditional dependencies).
2. UI Component primitives (headless inputs, custom selects, date pickers).
3. Backend upload destination (AWS S3, Cloudflare R2, Google Cloud Storage).

---

## Step-by-Step Execution Workflow

### Step 1: Uncontrolled Inputs vs. Controlled State
Never store every keystroke in a top-level `useState`! Typing in one input re-renders all 50 other fields on every letter:
- **React Hook Form**: Uses uncontrolled native inputs with ref subscriptions. Re-renders happen *only* in the field being validated or edited.
- Bind validation using the shared schema resolver (`zodResolver(MySchema)`).

### Step 2: Dynamic Nested Field Arrays (`useFieldArray`)
Manage dynamic lists (e.g., adding line items to an order):
- Use `useFieldArray({ control, name: 'items' })`.
- Always use `field.id` as the React `key` (never use array index `idx` as key, which corrupts input values when items are deleted or reordered!).

### Step 3: Multi-Step Wizard State Machine & URL Synchronization
Never keep wizard step state purely in local memory:
1. **URL Sync**: Store active step in query params: `/onboarding?step=billing`. Allows users to use the browser Back/Forward buttons and share deep links.
2. **Draft Persistence**: Save partial form progress to `sessionStorage` or server draft table so accidental page refreshes do not lose data.
3. **Step Validation**: Validate *only* the current step's schema slice before allowing transition to the next step:
   `const isValid = await trigger(['email', 'companyName']);`

### Step 4: Accessibility & Error Focus Management
Enforce accessible WCAG error patterns:
- Link input to error message via `aria-describedby="email-error"`.
- Set `aria-invalid={!!errors.email}`.
- Upon failed submission, automatically scroll and focus the **first invalid field**:
  ```typescript
  const onError = (errors) => {
    const firstField = Object.keys(errors)[0];
    document.getElementById(firstField)?.focus();
  };
  ```

### Step 5: Direct-to-S3 Pre-Signed File Uploads
Never upload 500 MB files through your web server (exhausts Node.js memory and bandwidth):
1. Client requests a presigned URL from backend: `POST /api/uploads/presign { filename: 'report.pdf' }`.
2. Backend generates signed S3 PUT URL with short TTL (60s) via AWS SDK.
3. Client uploads file **directly from browser to S3**:
   ```typescript
   await fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
   ```
4. Client sends confirmed S3 file key to form submission.

---

## Output Deliverables Template

Generate Dynamic Nested Form Component (TypeScript):

```tsx
// Dynamic Invoice Line-Items Form with React Hook Form & Zod
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const InvoiceSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description required'),
      quantity: z.number().int().min(1),
      unitPriceCents: z.number().int().min(0),
    })
  ).min(1, 'At least one item required'),
});

type InvoiceFormValues = z.infer<typeof InvoiceSchema>;

export function DynamicInvoiceForm({ onSubmit }: { onSubmit: (data: InvoiceFormValues) => void }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      clientName: '',
      items: [{ description: '', quantity: 1, unitPriceCents: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium">Client Name</label>
        <input
          id="clientName"
          {...register('clientName')}
          aria-invalid={!!errors.clientName}
          className="border p-2 rounded w-full"
        />
        {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Invoice Items</h3>
        {fields.map((field, idx) => (
          <div key={field.id} className="flex gap-2 items-center">
            <input
              {...register(`items.${idx}.description` as const)}
              placeholder="Item description"
              className="border p-2 rounded flex-1"
            />
            <input
              type="number"
              {...register(`items.${idx}.quantity` as const, { valueAsNumber: true })}
              className="border p-2 rounded w-20"
            />
            <button type="button" onClick={() => remove(idx)} className="text-red-500 px-2">Remove</button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ description: '', quantity: 1, unitPriceCents: 0 })}
          className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
        >
          + Add Item
        </button>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Invoice</button>
    </form>
  );
}
```

---

## Quality Checklist & Guardrails
- [ ] Are form fields uncontrolled to prevent whole-page re-renders on keystrokes?
- [ ] Do dynamic field arrays use `field.id` as the React key (never array index)?
- [ ] Are multi-step wizard stages synchronized with URL query params?
- [ ] Are inputs linked to validation errors via `aria-describedby` and `aria-invalid`?
- [ ] Are large file uploads sent directly to cloud storage via presigned URLs?

---

## Companion Skills
- **Type Safety**: `51-end-to-end-type-safety-and-trpc`.
- **SSR & Actions**: `52-ssr-rsc-and-modern-fullstack-frameworks`.
- **Frontend Architecture**: `14-frontend-architecture-and-state`.
