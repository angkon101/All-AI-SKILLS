---
name: test-driven-development
description: >-
  Use this skill to practice Test-Driven Development (TDD) and author high-quality unit tests.
  It guides the Red-Green-Refactor cycle, Arrange-Act-Assert (AAA) structure, test double
  categorization (Mocks, Stubs, Spies, Fakes), parameterized testing, mutation testing,
  and testing observable behaviors rather than private implementation details.
---

# Test-Driven Development (TDD) & Unit Testing Skill

## Overview
This skill guides the AI agent in practicing disciplined Test-Driven Development (TDD) and engineering robust unit test suites. By writing tests before code, clarifying edge cases early, and testing observable contracts rather than internal mechanics, systems achieve high defect immunity and fearless refactorability.

---

## When to Use This Skill
- Implementing new domain logic, use cases, or complex algorithmic functions.
- Practicing the Red-Green-Refactor cycle for feature development.
- Isolating and reproducing a reported bug with a failing regression test before fixing.
- Eliminating brittle tests that break upon private implementation refactoring.

---

## Input Context Required
1. Acceptance criteria and user stories from `01-requirements-spec`.
2. Domain entities and use case ports from `02-domain-driven-design` and `10-clean-architecture-and-solid`.
3. Target test framework (Jest, Vitest, Pytest, Go test, JUnit 5).

---

## Step-by-Step Execution Workflow

### Step 1: The Red-Green-Refactor Loop
Execute strictly in three distinct phases:
1. **Red**: Write a small, targeted test for the next increment of behavior. Run the test suite and verify that the test fails for the expected reason (compilation failure or assertion failure).
2. **Green**: Write the minimum possible production code to make the test pass. Do not write premature optimizations or unneeded features.
3. **Refactor**: Clean up the code, eliminate duplication, improve variable naming, and extract abstractions while keeping the test suite green.

### Step 2: Arrange-Act-Assert (AAA) Test Anatomy
Structure every unit test into three distinct visual blocks:
```typescript
test('should apply 20% discount when order total exceeds $100', () => {
  // 1. Arrange: Setup preconditions and test inputs
  const discountRule = new VolumeDiscountRule({ threshold: 100, percentage: 0.20 });
  const order = new OrderBuilder().withTotal(150).build();

  // 2. Act: Execute the unit under test
  const discountAmount = discountRule.calculateDiscount(order);

  // 3. Assert: Verify the expected outcome
  expect(discountAmount).toBe(30.0);
});
```

### Step 3: Test Double Taxonomy (Fowler Classification)
Never confuse mocks with stubs or fakes. Choose the simplest test double:
- **Dummy**: Passed around but never used (e.g., filling an unused constructor argument).
- **Stub**: Provides hardcoded canned answers to calls made during the test (e.g., returning fixed exchange rate).
- **Spy**: A stub that also records how it was called (e.g., recording invocation count and arguments).
- **Mock**: Pre-programmed with expectations of calls it must receive; verifies interaction. (Use sparingly; prefer asserting state over asserting interactions!).
- **Fake**: Has a working implementation, but takes shortcuts making it unsuitable for production (e.g., `InMemoryUserRepository` using a `Map`). Fakes are the highest-fidelity test doubles!

### Step 4: Golden Rules of Unit Testing
1. **Test Observable Behavior, Not Implementation**: Never test private methods or spy on internal private properties. Test the public interface contract.
2. **Deterministic & Fast**: A unit test must never touch the real network, disk filesystem, or sleep timers. Complete within milliseconds.
3. **Zero Test Cross-Contamination**: Each test must instantiate fresh state; never share mutable state across tests.
4. **Descriptive Test Names**: Name tests by requirement: `should_<expected_result>_when_<condition>`.

### Step 5: Parameterized / Table-Driven Testing
Consolidate boundary testing across multiple input matrices:
```typescript
describe('TaxCalculator', () => {
  test.each([
    { country: 'US', state: 'NY', amount: 100, expectedTax: 8.875 },
    { country: 'US', state: 'DE', amount: 100, expectedTax: 0.0 },
    { country: 'GB', state: '',   amount: 100, expectedTax: 20.0 },
  ])('calculates tax correctly for $country $state', ({ country, state, amount, expectedTax }) => {
    const calc = new TaxCalculator();
    expect(calc.computeTax(country, state, amount)).toBeCloseTo(expectedTax, 2);
  });
});
```

---

## Output Deliverables Template

Generate isolated unit test suite using an in-memory Fake:

```typescript
// Test suite for CreateOrderUseCase using an in-memory Fake repository
describe('CreateOrderUseCase', () => {
  let fakeRepo: InMemoryOrderRepository;
  let useCase: CreateOrderUseCase;

  beforeEach(() => {
    fakeRepo = new InMemoryOrderRepository();
    useCase = new CreateOrderUseCase(fakeRepo);
  });

  it('should successfully persist order when payload is valid', async () => {
    const command = { customerId: 'cust_123', items: [{ sku: 'SKU-A', price: 50, qty: 1 }] };

    const result = await useCase.execute(command);

    expect(result.status).toBe('SUCCESS');
    const saved = await fakeRepo.findById(result.orderId);
    expect(saved).not.toBeNull();
    expect(saved?.totalAmount).toBe(50);
  });

  it('should reject order creation when items list is empty', async () => {
    const command = { customerId: 'cust_123', items: [] };

    await expect(useCase.execute(command)).rejects.toThrow('Order must contain at least one item');
  });
});
```

---

## Quality Checklist & Guardrails
- [ ] Was the failing test verified before writing the implementation code?
- [ ] Are tests free from I/O, sleep delays, and real network calls?
- [ ] Are test assertions based on state/output rather than over-mocking internal calls?
- [ ] Are edge cases (zero values, nulls, empty collections, maximum boundaries) covered?
- [ ] Do test names clearly articulate the expected behavior and scenario?

---

## Companion Skills
- **Preceding Step**: `10-clean-architecture-and-solid`.
- **Broader Testing**: `16-integration-and-e2e-testing`.
- **Refactoring Safe Harbor**: `19-refactoring-and-debt-reduction`.
