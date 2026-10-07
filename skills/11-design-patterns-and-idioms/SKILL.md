---
name: design-patterns-and-idioms
description: >-
  Use this skill to select and implement appropriate Gang of Four (GoF) design patterns
  and enterprise idioms. It guides Factory, Builder, Strategy, Observer, Decorator, Adapter,
  Repository, Unit of Work, Specification pattern, and the Result/Either functional idiom,
  while eliminating anti-patterns like Primitive Obsession and God Objects.
---

# Design Patterns & Enterprise Idioms Skill

## Overview
This skill guides the AI agent in applying proven Gang of Four (GoF) design patterns and modern enterprise software idioms. It emphasizes selecting the right pattern to solve specific architectural tensions without over-engineering or premature abstraction.

---

## When to Use This Skill
- Refactoring complex conditional branches (`switch`/`if-else` cascades) into extensible strategies.
- Constructing complex objects with numerous optional parameters (Builder / Fluent API).
- Integrating incompatible legacy interfaces with new systems (Adapter / Facade).
- Modeling business rules, queries, and validation criteria cleanly (Specification Pattern).

---

## Input Context Required
1. Architectural structure from `10-clean-architecture-and-solid`.
2. Code smell or flexibility bottleneck identified in code reviews.
3. Target language paradigms (object-oriented, functional, or hybrid).

---

## Step-by-Step Execution Workflow

### Step 1: Pattern Category Selection
Match the engineering problem to the appropriate pattern:

| Category | Pattern | When to Use | Alternative / Anti-Pattern to Avoid |
| :--- | :--- | :--- | :--- |
| **Creational** | **Builder** | Constructing complex domain objects or test fixtures step-by-step | Giant telescoping constructor with 10+ arguments |
| **Creational** | **Factory Method** | Creating objects when exact type is determined at runtime | Scattering `new ConcreteClass()` throughout use cases |
| **Structural** | **Adapter** | Wrapping third-party SDK or legacy API to match internal port | Leaking external SDK types into domain layer |
| **Structural** | **Decorator** | Adding cross-cutting concerns (caching, logging, metrics) transparently | Polluting core business logic with telemetry code |
| **Behavioral** | **Strategy** | Swapping algorithms or pricing/tax calculation logic at runtime | Massive `switch(type)` statements violating Open/Closed |
| **Behavioral** | **Observer / PubSub** | Reacting to state changes without tight coupling between components | Hardcoded direct method invocations across subsystems |
| **Enterprise** | **Specification** | Encapsulating reusable business rules and query filters | Duplicating validation logic across controllers and queries |
| **Enterprise** | **Unit of Work** | Coordinating writes across multiple repositories in a single atomic transaction | Partial database commits leaving data corrupted |

### Step 2: The Specification Pattern for Rich Business Rules
Encapsulate domain rules so they are reusable, composable, and testable:
```typescript
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
}

export class OrderEligibleForDiscountSpec implements Specification<Order> {
  constructor(private readonly minAmount: number) {}

  isSatisfiedBy(order: Order): boolean {
    return order.totalAmount >= this.minAmount && order.customer.isVipMember();
  }

  and(other: Specification<Order>): Specification<Order> {
    return new AndSpecification(this, other);
  }
}
```

### Step 3: Functional Result / Either Idiom (Error Handling Without Throwing)
Eliminate unhandled exceptions across boundaries using typed Result objects:
```typescript
export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ success: true, value });
export const fail = <E>(error: E): Result<never, E> => ({ success: false, error });

// Usage in Use Case:
async function transferMoney(req: TransferDTO): Promise<Result<TransferReceipt, TransferError>> {
  if (req.amount <= 0) return fail(new InvalidAmountError());
  const sender = await accountRepo.find(req.fromId);
  if (!sender.hasSufficientFunds(req.amount)) return fail(new InsufficientFundsError());
  
  sender.debit(req.amount);
  await accountRepo.save(sender);
  return ok(new TransferReceipt(req.amount));
}
```

### Step 4: Eliminating Common Code Smells & Anti-Patterns
- **Primitive Obsession**: Replacing raw strings/numbers with typed Value Objects (e.g., `PostalCode`, `Email`, `CurrencyAmount`).
- **Feature Envy**: Moving logic into the class that holds the relevant data.
- **God Object / Brain Class**: Decomposing monolithic classes with 1,000+ lines into cohesive, single-responsibility services.

---

## Output Deliverables Template

Generate pattern implementation:

```typescript
// Strategy Pattern Example: Dynamic Discount Calculator
export interface DiscountStrategy {
  calculateDiscount(order: Order): number;
}

export class BlackFridayDiscountStrategy implements DiscountStrategy {
  calculateDiscount(order: Order): number {
    return order.totalAmount * 0.30; // 30% off
  }
}

export class NoDiscountStrategy implements DiscountStrategy {
  calculateDiscount(order: Order): number {
    return 0;
  }
}

export class OrderPricingService {
  constructor(private strategy: DiscountStrategy) {}

  setStrategy(strategy: DiscountStrategy) {
    this.strategy = strategy;
  }

  getFinalPrice(order: Order): number {
    const discount = this.strategy.calculateDiscount(order);
    return Math.max(0, order.totalAmount - discount);
  }
}
```

---

## Quality Checklist & Guardrails
- [ ] Is the pattern justified by concrete requirements (avoid premature abstraction)?
- [ ] Are interfaces kept lean and client-focused (Interface Segregation)?
- [ ] Does the implementation eliminate code duplication and branching?
- [ ] Are domain concepts represented by Value Objects rather than primitive strings?
- [ ] Is the Result/Either idiom used for expected business failure modes?

---

## Companion Skills
- **Preceding Step**: `10-clean-architecture-and-solid`.
- **Accompanying Resilience**: `12-resilience-and-error-handling`.
- **Testing**: `15-test-driven-development`.
