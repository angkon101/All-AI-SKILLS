---
name: data-analytics-and-experimentation
description: >-
  Use this skill to design product analytics telemetry, construct North Star metric trees,
  and engineer statistically sound A/B experimentation frameworks. It guides event taxonomy schema design,
  A/B test hypothesis formulation, sample size calculation, statistical significance (p-value, power, MDE),
  and avoiding experimentation pitfalls (peeking problem, Simpson's Paradox).
---

# Product Analytics & Experimentation Design Skill

## Overview
This skill guides the AI agent in acting as a Lead Data Analyst and Experimentation Scientist. It ensures software systems instrument business-critical telemetry, structure metrics into actionable driver trees, and evaluate feature changes through rigorous statistical hypothesis testing rather than intuition or vanity metrics.

---

## When to Use This Skill
- Defining the telemetry tracking plan and event schema for a new software application.
- Constructing North Star metric trees and KPI dashboards for business visibility.
- Designing, sizing, and analyzing A/B split tests and multivariate experiments.
- Diagnosing product conversion bottlenecks, drop-offs, and user cohort retention decay.

---

## Input Context Required
1. Product goals, user journeys, and conversion funnels from `01-requirements-spec` and `27-product-strategy-and-market-research`.
2. Baseline conversion rates and current traffic volume (Daily Active Users / Weekly Sessions).
3. Analytics infrastructure (Segment, Mixpanel, PostHog, Amplitude, BigQuery / Snowflake).

---

## Step-by-Step Execution Workflow

### Step 1: The North Star Metric Tree Architecture
Decompose the company's North Star Metric into actionable input levers:
- **North Star Metric (NSM)**: The single metric that best captures core customer value delivery (e.g., Spotify: *Time spent listening to content*; Airbnb: *Nights booked*).
- **The 4 Metric Tree Input Dimensions**:
  1. **Breadth**: How many active users interact with the feature? (e.g., 28-day Active Users).
  2. **Depth**: How deeply do they engage per session? (e.g., Queries per session).
  3. **Frequency**: How often do they return? (e.g., Days active per week).
  4. **Efficiency**: How successfully do they reach the finish line? (e.g., Checkout completion rate).

### Step 2: Telemetry Event Schema Taxonomy
Never emit ad-hoc strings like `analytics.track("clicked")`.
Enforce the structured **Object-Action** standard:
- **Naming Convention**: `[entity]_[action]` (lowercase snake_case): `order_placed`, `document_shared`, `workspace_created`.
- **Payload Schema Standard**:
  ```json
  {
    "event": "order_completed",
    "timestamp": "2026-10-07T14:15:00Z",
    "user_id": "usr_99812",
    "session_id": "ses_4401",
    "properties": {
      "order_id": "ord_1029",
      "cart_value_cents": 14900,
      "currency": "USD",
      "items_count": 3,
      "checkout_duration_seconds": 42.5,
      "payment_method": "credit_card"
    }
  }
  ```

### Step 3: A/B Experimentation Statistical Design
Formulate mathematically sound experiment briefs:
1. **Hypothesis Formulation**:
   *"If we [introduce 1-click checkout], then [checkout completion rate will increase by >= 8% relative], because [cart abandonment friction is reduced]."*
2. **Key Metrics Taxonomy**:
   - **Primary Metric**: What the experiment intends to move (e.g., Conversion Rate).
   - **Secondary Metrics**: Diagnostic metrics explaining *why* it moved.
   - **Guardrail Metrics**: What must NOT degrade (e.g., p95 checkout latency, payment dispute rate).
3. **Statistical Power & Sample Size**:
   - Significance level ($\alpha = 0.05$): 5% chance of False Positive (Type I error).
   - Statistical Power ($1 - \beta = 0.80$): 80% chance of detecting a real effect if it exists (Type II error).
   - Minimum Detectable Effect (MDE): The smallest percentage uplift that matters economically.
   - Calculate sample size per variant:
     $$n \approx \frac{16 \times \sigma^2}{\text{MDE}^2}$$

### Step 4: Mitigating Critical Experimentation Traps
- **The Peeking Problem**: Never declare victory on Day 2 just because $p < 0.05$! Checking results repeatedly inflates False Positive rates from 5% to over 30%. Enforce fixed-horizon sample sizes or use Sequential Testing (mSPRT).
- **Simpson's Paradox**: An aggregate trend reverses when data is partitioned by sub-populations (e.g., mobile vs desktop). Always segment results across key dimensions.
- **Novelty Effect**: Users click new buttons purely out of curiosity; let tests run for at least 2 full business cycles (14 days) to allow behavior to normalize.

---

## Output Deliverables Template

Generate Experimentation Spec in `docs/analytics/experiment-[name].md`:

```markdown
# Experimentation Brief: EXP-108 - One-Click Checkout Workflow

## 1. Executive Summary & Hypothesis
- **Hypothesis**: Replacing multi-step checkout with 1-click modal will increase checkout conversion by +5% relative without increasing fraudulent chargebacks.
- **Target Audience**: 100% of web desktop returning customers with saved payment methods.

## 2. Metric Framework
- **Primary Metric**: Checkout Conversion Rate ($C = \text{Completed Orders} / \text{Checkout Starts}$). Baseline: 12.0%. Target: >= 12.6% ($+5\%$ relative MDE).
- **Secondary Metric**: Time to purchase completion (target decrease from 45s to 12s).
- **Guardrail Metric**: Chargeback rate (must not exceed baseline of 0.08%).

## 3. Statistical Sizing & Runtime
- **Baseline Conversion**: 12.0%
- **MDE (Relative)**: 5.0% (Absolute: 0.6%)
- **Significance ($\alpha$)**: 0.05 (Two-tailed)
- **Power ($1 - \beta$)**: 0.80
- **Required Sample Size**: ~48,000 visitors per variant (96,000 total).
- **Daily Traffic**: ~7,000 eligible visitors/day.
- **Mandatory Runtime**: **14 full days** (to capture two complete weekend cycles).

## 4. Variant Allocation
- **Control (50%)**: Standard 3-step checkout page.
- **Variant A (50%)**: 1-click slide-over modal with pre-selected default card.
```

---

## Quality Checklist & Guardrails
- [ ] Are telemetry events structured using the `entity_action` naming standard?
- [ ] Is sample size determined upfront based on MDE, $\alpha=0.05$, and $80\%$ power?
- [ ] Is test runtime locked for a minimum of 2 full weekly business cycles?
- [ ] Are guardrail metrics monitored to prevent unintended business regressions?
- [ ] Are analytics events validated against schema registries before deployment?

---

## Companion Skills
- **Product Strategy**: `27-product-strategy-and-market-research`.
- **Backend Instrumentation**: `10-clean-architecture-and-solid`.
- **Telemetry Infrastructure**: `21-observability-and-telemetry`.
