---
name: code-review-and-audit
description: >-
  Use this skill to perform rigorous, objective code reviews and security/quality audits on Pull Requests (PRs).
  It guides multi-dimensional evaluation (correctness, security vulnerabilities, algorithmic complexity,
  maintainability, test coverage), categorizing feedback with Conventional Comments (blocker, suggestion, nit),
  and providing concrete diff suggestions.
---

# Code Review & Pull Request Audit Skill

## Overview
This skill guides the AI agent in conducting structured, actionable, and constructive code reviews and security audits. It ensures code merged into main branches is free of defects, adheres to architectural invariants, enforces secure coding standards, and remains readable and maintainable.

---

## When to Use This Skill
- Reviewing git diffs or Pull Requests before merging.
- Auditing existing codebases for latent bugs, race conditions, or security regressions.
- Providing standardized, empathetic feedback with ready-to-apply diff snippets.
- Enforcing architectural standards and cyclomatic complexity limits.

---

## Input Context Required
1. Git diff or pull request changes with surrounding file context.
2. Architecture and coding standards from `10-clean-architecture-and-solid`.
3. Test suite results and requirements from `01-requirements-spec`.

---

## Step-by-Step Execution Workflow

### Step 1: The Multi-Dimensional Review Framework
Examine every changeset across five distinct dimensions:
1. **Correctness & Edge Cases**:
   - Does the logic fulfill the requirement?
   - Are edge cases (null, empty array, negative numbers, overflow, boundary conditions) handled?
   - Are async operations awaited properly without unhandled rejections?
2. **Security & Data Integrity**:
   - Is user input validated and sanitized?
   - Are SQL queries parameterized?
   - Are authorization checks executed server-side?
3. **Performance & Resource Hygiene**:
   - Are database queries indexed? Is there an N+1 query pattern?
   - Are open handles (DB connections, file descriptors, streams) closed in `finally` blocks?
   - Is algorithmic complexity acceptable (avoid accidental $O(N^2)$ inside loops)?
4. **Architectural Purity & SOLID**:
   - Are layer boundaries respected (no DB calls directly inside controllers)?
   - Are classes cohesive with single responsibilities?
5. **Testing & Coverage**:
   - Are new code paths accompanied by passing unit/integration tests?
   - Do tests assert outputs and state rather than trivial trivialities?

### Step 2: Conventional Comments Formatting
Label review comments explicitly so the author understands priority:
- **`🔴 [Blocker]`**: Must be addressed before merging. Affects correctness, security, or data integrity.
- **`🟡 [Suggestion]`**: Improves design, readability, or performance; open to discussion.
- **`🟢 [Nit]`**: Minor styling, comment typo, or trivial formatting preference. Merge is not blocked.
- **`💡 [Question]`**: Requesting clarification on rationale or non-obvious design choice.
- **`⭐ [Praise]`**: Highlighting exceptionally well-crafted, elegant code or tests.

### Step 3: Providing Actionable Diff Suggestions
Never leave vague critique like "make this cleaner". Always provide the concrete replacement diff:
```markdown
🔴 **[Blocker] Resource Leak**: The file stream is opened but not closed if an exception occurs during parsing.

```diff
- const stream = fs.createReadStream(path);
- const data = await parse(stream);
+ const stream = fs.createReadStream(path);
+ try {
+   const data = await parse(stream);
+ } finally {
+   stream.destroy();
+ }
```
```

---

## Output Deliverables Template

Generate comprehensive PR Review Summary:

```markdown
# Pull Request Review: PR #104 - Introduce Order Cancellation Workflow

## Summary of Changes
- Adds `cancelOrder` endpoint and use case.
- Adds domain event `OrderCancelled` and publishes to Kafka.
- Adds unit and integration tests.

## Review Decision: 🟡 Changes Requested

---

### Critical Findings (Blockers)
1. 🔴 **[Blocker] Lack of Transactional Consistency**: In `CancelOrderUseCase.ts:L45`, the order status is updated in PostgreSQL, but the refund is issued via Stripe *outside* any error handling block. If Stripe fails, the database remains in `CANCELLED` state without refunding the customer.
   - *Recommendation*: Wrap the workflow in a compensating transaction or use an outbox event.

### Suggestions & Optimizations
2. 🟡 **[Suggestion] Query Optimization**: In `OrderRepository.ts:L88`, `getOrderWithHistory` executes 3 separate queries. Coalesce into a single query using `LEFT JOIN LATERAL` or batch fetching to reduce network roundtrips.

### Minor Points (Nits)
3. 🟢 **[Nit] Typo in Log Message**: `logger.info("Order sucessfully canceled")` -> fix spelling to `successfully`.

---

## Code Quality Scorecard
| Metric | Assessment | Notes |
| :--- | :--- | :--- |
| **Correctness** | Needs Work | Missing compensating refund rollback |
| **Security** | Passed | IDOR checked; auth claims validated |
| **Test Quality** | Good | 94% coverage; happy path & bad state covered |
| **Maintainability** | Excellent | Follows Clean Architecture use-case structure |
```

---

## Quality Checklist & Guardrails
- [ ] Is feedback categorized with clear labels (Blocker, Suggestion, Nit)?
- [ ] Are all blockers backed by concrete technical justifications?
- [ ] Does every suggestion include an actionable code snippet or diff?
- [ ] Was the review conducted without personal bias, focusing strictly on code quality?
- [ ] Were positive aspects of the code acknowledged alongside critique?

---

## Companion Skills
- **Preceding Step**: `10-clean-architecture-and-solid` and `15-test-driven-development`.
- **Refactoring Action**: `19-refactoring-and-debt-reduction`.
- **Security Baseline**: `09-security-and-threat-modeling`.
