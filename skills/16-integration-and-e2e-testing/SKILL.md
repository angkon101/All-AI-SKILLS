---
name: integration-and-e2e-testing
description: >-
  Use this skill to design and implement integration tests and End-to-End (E2E) test suites.
  It guides Testcontainers for ephemeral real databases, consumer-driven contract testing (Pact),
  external HTTP mocking (MSW/WireMock), and browser user journey automation using Playwright
  with the Page Object Model (POM).
---

# Integration & End-to-End (E2E) Testing Skill

## Overview
This skill guides the AI agent in engineering automated integration tests and browser-driven End-to-End (E2E) user journey validation. While unit tests prove algorithms in isolation, integration and E2E tests prove that real databases, network protocols, third-party adapters, and user interfaces function harmoniously.

---

## When to Use This Skill
- Verifying database repositories against real database engines (PostgreSQL, MySQL, Redis).
- Validating HTTP API endpoints, status codes, and serialization end-to-end.
- Automating critical user conversion journeys (registration, checkout, checkout payment).
- Eliminating flaky tests caused by arbitrary sleep timers and unmanaged state.

---

## Input Context Required
1. API contracts from `05-api-contract-design`.
2. Database schema and migration scripts from `07-database-modeling-and-migrations`.
3. Target test runners and tools (Playwright, Cypress, Testcontainers, Supertest, MSW).

---

## Step-by-Step Execution Workflow

### Step 1: The Integration Testing Strategy (Testcontainers)
Never run integration tests against in-memory SQLite mocks if production runs PostgreSQL! SQLite behaves differently with JSONB, locks, and types:
- Use **Testcontainers** to spin up lightweight, ephemeral Docker containers for PostgreSQL, Redis, or Kafka during test runs.
- Run database migrations automatically during test suite setup.
- Isolate test data: Wrap each test in a database transaction that rolls back upon completion, or execute TRUNCATE scripts between runs.

### Step 2: HTTP API Integration Testing
Use tools like `supertest` or HTTP clients against the running application instance:
- Test the full HTTP pipeline: routing, auth middleware, request schema validation, use cases, DB queries, and response serialization.
- Mock only external third-party dependencies (e.g., Stripe, Twilio) using **WireMock** or **MSW (Mock Service Worker)**.

### Step 3: Consumer-Driven Contract Testing (Pact)
For distributed microservices:
- Prevent breaking changes by having consumers define a contract of expected requests and responses.
- Producers verify that their latest build satisfies all consumer contracts before merging.

### Step 4: End-to-End (E2E) Browser Testing (Playwright)
1. **The Page Object Model (POM)**:
   - Encapsulate page selectors and interactions within reusable classes.
   - Tests read like user actions: `await loginPage.login('user@test.com', 'secret')`.
2. **Deterministic Auto-Waiting**:
   - NEVER use hardcoded sleep calls (`await page.waitForTimeout(5000)`).
   - Rely on Playwright's built-in auto-waiting for locators: `await page.getByRole('button', { name: 'Submit' }).click()`.
3. **Resilient Locators**:
   - Prioritize accessible roles and text: `getByRole()`, `getByLabel()`, `getByTestId('checkout-button')`. Avoid brittle CSS paths like `div > div:nth-child(3) > span`.

---

## Output Deliverables Template

Generate E2E test using Playwright and Page Object Model:

```typescript
// 1. Page Object: tests/e2e/pages/CheckoutPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly payButton: Locator;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.payButton = page.getByRole('button', { name: 'Complete Purchase' });
    this.confirmationMessage = page.getByTestId('order-confirmation-badge');
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async completeOrder() {
    await this.payButton.click();
    await expect(this.confirmationMessage).toBeVisible({ timeout: 5000 });
  }
}

// 2. E2E Test: tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/CheckoutPage';

test.describe('E2E Checkout Flow', () => {
  test('should allow authenticated user to purchase items', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();
    await checkoutPage.completeOrder();
    await expect(checkoutPage.confirmationMessage).toHaveText('Thank you for your order!');
  });
});
```

---

## Quality Checklist & Guardrails
- [ ] Are integration tests executed against real containerized databases (Testcontainers)?
- [ ] Are third-party external networks mocked deterministically (MSW / WireMock)?
- [ ] Are E2E tests completely free of arbitrary sleep delays (`waitForTimeout`)?
- [ ] Does E2E test locator strategy rely on accessibility roles or explicit `data-testid`?
- [ ] Are database states cleaned or isolated between successive test runs?

---

## Companion Skills
- **Preceding Step**: `15-test-driven-development`.
- **Accompanying Performance**: `17-performance-and-load-testing`.
- **CI Automation**: `20-containerization-and-devops`.
