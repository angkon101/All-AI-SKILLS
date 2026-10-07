---
name: sre-slo-and-error-budget-engineering
description: >-
  Use this skill to engineer Service Level Objectives (SLOs), Service Level Indicators (SLIs),
  and Error Budgets following Google SRE best practices. It guides SLI formulation, multi-window multi-burn-rate
  alerting rules in Prometheus/Alertmanager, Error Budget governance policies (feature freezes),
  and systematic toil reduction.
---

# SRE, SLO & Error Budget Engineering Skill

## Overview
This skill guides the AI agent in implementing Site Reliability Engineering (SRE) practices based on Google SRE principles. It replaces subjective, noisy alerts with mathematically sound Service Level Objectives (SLOs) and Error Budgets, aligning product velocity with infrastructure reliability and establishing automated multi-window burn rate alerts.

---

## When to Use This Skill
- Replacing hundreds of unmaintained CPU/memory threshold alerts with user-centric SLO alerts.
- Defining reliability agreements between product management and engineering leadership.
- Implementing Prometheus Alertmanager rules for Error Budget burn rates.
- Establishing an Error Budget Policy that governs when to freeze feature deployments for reliability work.

---

## Input Context Required
1. Critical User Journeys (CUJs): What user actions define business success (e.g., checkout, search, sign-in)?
2. Latency SLAs and uptime targets from `01-requirements-spec`.
3. Prometheus metrics pipeline from `21-observability-and-telemetry`.

---

## Step-by-Step Execution Workflow

### Step 1: The SLI, SLO & SLA Hierarchy
Differentiate the three concepts clearly:
1. **SLI (Service Level Indicator)**: The quantifiable measurement:
   $$\text{SLI} = \frac{\text{Good Events}}{\text{Total Valid Events}} \times 100\%$$
   - *Example*: Percentage of HTTP requests returning status $< 500$ with latency $< 250\text{ms}$.
2. **SLO (Service Level Objective)**: The internal target over a rolling time window:
   - *Example*: $99.9\%$ over a rolling 30-day window.
3. **SLA (Service Level Agreement)**: The external legal contract with financial consequences. (Always looser than SLO; e.g., 99.5% if internal SLO is 99.9%).

### Step 2: Error Budget Arithmetic
The Error Budget represents the allowable room for imperfection and innovation:
$$\text{Error Budget} = 100\% - \text{SLO}$$
| Target SLO (30-day rolling) | Allowable Error Budget | Total Allowable Downtime / Outage per Month |
| :--- | :--- | :--- |
| **99.0% (Two Nines)** | 1.0% | 7 hours, 18 minutes |
| **99.9% (Three Nines)** | 0.1% | 43 minutes, 49 seconds |
| **99.95% (Three and a Half)**| 0.05% | 21 minutes, 54 seconds |
| **99.99% (Four Nines)** | 0.01% | 4 minutes, 23 seconds |

### Step 3: Multi-Window Multi-Burn-Rate Alerting
Never page an on-call engineer at 3 AM for a 2-second CPU spike!
Page *only* when the Error Budget is being consumed at a rate that threatens the 30-day SLO:
- **Burn Rate 1**: Consumes 100% of error budget in exactly 30 days.
- **Burn Rate 14.4 (Page On-Call Immediately)**: Consumes **2% of monthly budget in 1 hour**.
- **Burn Rate 6 (Page On-Call)**: Consumes **5% of monthly budget in 6 hours**.
- **Burn Rate 1 (Create Jira Ticket / Slack Alert)**: Consumes **10% of monthly budget in 3 days**.

### Step 4: The Error Budget Policy (Governance)
Establish an explicit social contract between Product and Engineering:
- **When Error Budget is Positive (> 0)**: Product teams have the green light to ship risky features, conduct A/B experiments, and iterate aggressively.
- **When Error Budget is Depleted (<= 0)**: **Immediate Feature Freeze**. All new feature deployments pause. 100% of engineering bandwidth pivots to fixing reliability bottlenecks, improving test coverage, and updating runbooks until the budget recovers.

### Step 5: Toil Budgeting & Automation
- **Definition of Toil**: Work that is manual, repetitive, tactical, devoid of enduring value, and scales linearly with service growth.
- **Rule**: Cap toil at $< 50\%$ of an engineer's time; spend the remaining $\ge 50\%$ on engineering automation.

---

## Output Deliverables Template

Generate Prometheus SLO Alert Rules (`prometheus/rules/slo-alerts.yaml`):

```yaml
groups:
  - name: order-service-slo-alerts
    rules:
      # 1. Calculate 1-hour burn rate for 99.9% SLO
      # Threshold = 14.4x burn rate (2% budget consumed in 1 hour)
      - alert: OrderServiceErrorBudgetBurningFast
        expr: |
          (
            sum(rate(http_requests_total{service="order-service", status=~"5.."}[1h]))
            /
            sum(rate(http_requests_total{service="order-service"}[1h]))
          ) > (1 - 0.999) * 14.4
        for: 2m
        labels:
          severity: page
          slo_target: "99.9"
        annotations:
          summary: "Order Service burning error budget at 14.4x rate (1h window)"
          description: "2% of monthly error budget consumed in the last hour. Immediate intervention required."
          runbook_url: "https://docs.enterprise.com/runbooks/order-service-outage"

      # 2. Calculate 6-hour burn rate for 99.9% SLO
      # Threshold = 6x burn rate (5% budget consumed in 6 hours)
      - alert: OrderServiceErrorBudgetBurningSlow
        expr: |
          (
            sum(rate(http_requests_total{service="order-service", status=~"5.."}[6h]))
            /
            sum(rate(http_requests_total{service="order-service"}[6h]))
          ) > (1 - 0.999) * 6
        for: 15m
        labels:
          severity: page
        annotations:
          summary: "Order Service burning error budget at 6x rate (6h window)"
```

---

## Quality Checklist & Guardrails
- [ ] Are SLIs formulated strictly as $\frac{\text{Good Events}}{\text{Total Valid Events}}$?
- [ ] Is the 30-day rolling SLO agreed upon with product and business stakeholders?
- [ ] Are pager alerts triggered exclusively by multi-window Error Budget burn rates (not arbitrary CPU spikes)?
- [ ] Is an Error Budget Policy formalized to enforce feature freezes when budgets deplete?
- [ ] Are runbook links attached to every automated SLO alert?

---

## Companion Skills
- **Telemetry Infrastructure**: `21-observability-and-telemetry`.
- **Incident Response**: `22-incident-debugging-and-runbooks`.
- **Chaos Verification**: `36-chaos-engineering-and-disaster-recovery`.
