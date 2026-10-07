---
name: incident-debugging-and-runbooks
description: >-
  Use this skill to triage production incidents, debug complex distributed system bugs,
  and author postmortems and operational runbooks. It guides SEV severity classification,
  first-response mitigation (rollback, feature flags, traffic shedding), 5 Whys Root Cause Analysis (RCA),
  and blameless postmortem generation.
---

# Incident Debugging & Operational Runbooks Skill

## Overview
This skill guides the AI agent through live incident triage, diagnostic root-cause debugging, blameless postmortem authoring, and operational runbook development. It prioritizes rapid production stabilization before deep investigation, followed by thorough systematic learning to eliminate recurrence.

---

## When to Use This Skill
- Triaging an active production outage, degraded performance, or critical alert.
- Formulating emergency mitigation actions (rollbacks, traffic shedding, circuit breaking).
- Debugging obscure production errors using logs, metrics, and trace telemetry.
- Writing a blameless postmortem and authoring operational runbooks.

---

## Input Context Required
1. Incident symptoms, error spikes, and affected user cohorts.
2. Observability data (logs, traces, metrics) from `21-observability-and-telemetry`.
3. Recent deployment history, configuration changes, or infrastructure events.

---

## Step-by-Step Execution Workflow

### Step 1: Incident Severity Classification
Quickly categorize severity to coordinate communications:
- **SEV-1 (Critical Outage)**: Core user workflow completely broken for broad user base (e.g., checkout offline, database corrupted). Requires immediate engineering mobilization.
- **SEV-2 (Major Degradation)**: High-impact degradation or significant portion of users affected, but workarounds exist.
- **SEV-3 (Moderate Issue)**: Non-critical feature broken (e.g., PDF export failing, search filters slow).
- **SEV-4 (Minor Issue)**: Cosmetic bug or low-impact glitch.

### Step 2: Golden Rule of First Response: Mitigate First, Debug Later!
During an active outage, your goal is to **restore user service immediately**, not to write the perfect bugfix.
1. **Was there a recent release?** -> **ROLL BACK IMMEDIATELY** to the last known healthy version.
2. **Was there a config change?** -> Revert the configuration change.
3. **Is an external dependency failing?** -> Flip the feature flag OFF or open the circuit breaker to trigger degraded fallback.
4. **Is the system experiencing an overload spike?** -> Shed non-critical traffic (rate limit / disable background workers) and auto-scale compute.

### Step 3: Diagnostic Root-Cause Investigation (Post-Mitigation)
Once the system is stabilized:
1. **Trace the Correlation ID**: Pull all log entries sharing the failing `trace_id` or `request_id`.
2. **Inspect the Diff**: Correlate deployment timestamps with metrics inflection points.
3. **Examine Resource Saturation**: Check CPU, memory heap, connection pool saturation, and DB lock wait times.
4. **Reproduce Locally**: Construct an isolated regression test reproducing the exact failure conditions.

### Step 5: The 5 Whys Root Cause Analysis (RCA)
Dig beneath superficial symptoms to uncover systemic organizational and architectural gaps:
- *Why 1*: Why did the checkout API return 500s? -> The database connection pool was exhausted.
- *Why 2*: Why was the connection pool exhausted? -> A query hung waiting for a row lock.
- *Why 3*: Why did the query hang? -> A new migration added an unindexed foreign key column.
- *Why 4*: Why was the unindexed column deployed? -> The migration was tested only on empty local databases.
- *Why 5*: Why was it not caught in staging? -> Staging lacked realistic data volume and automated query plan verification.

---

## Output Deliverables Template

### 1. Blameless Postmortem Template

```markdown
# Incident Postmortem: [INCIDENT-ID] - [Brief Summary]

- **Date**: YYYY-MM-DD
- **Severity**: SEV-1
- **Duration**: 42 minutes (14:10 UTC - 14:52 UTC)
- **Incident Commander**: [Name]
- **Services Affected**: Ordering API, Payment Processing

## Executive Summary
Between 14:10 and 14:52 UTC, customers were unable to complete checkout due to database connection pool exhaustion. Service was restored by rolling back deployment `v2.4.1` and terminating hanging lock queries. 1,420 checkout attempts were impacted.

## Impact Metrics
- **Downtime**: 42 minutes
- **Error Rate**: Peaked at 78% of checkout requests
- **Financial Impact**: Estimated ~$14,000 delayed transactions (92% recovered after fix)

## Timeline (UTC)
- **14:05**: Deployment `v2.4.1` commenced.
- **14:10**: Alert triggered: `CheckoutErrorRateHigh` (> 5%).
- **14:15**: On-call engineer mobilized; identified connection pool saturation.
- **14:28**: Decision made to execute automated rollback to `v2.4.0`.
- **14:40**: Rollback completed; stale lock connections terminated via PgBouncer.
- **14:52**: Error rate returned to baseline (0.02%); incident marked mitigated.

## Root Cause & Contributing Factors
- **Root Cause**: Deployment `v2.4.1` introduced a synchronous query without a lock timeout, causing cascading thread starvation.
- **Trigger**: Concurrency surge in EU morning traffic.

## Action Items (Preventative Corrective Actions)
| Action Item | Type | Owner | Due Date | Ticket |
| :--- | :--- | :--- | :--- | :--- |
| Enforce 3s query timeout globally | Preventative Code | Eng Team | YYYY-MM-DD | ENG-881 |
| Add CI check for table lock migrations | Guardrail | DevOps | YYYY-MM-DD | INFRA-204 |
| Add alert for DB connection pool > 80% | Monitoring | SRE | YYYY-MM-DD | SRE-119 |
```

### 2. Operational Runbook Snippet (`runbooks/drain-queue.md`)
```markdown
# Runbook: Emergency Queue Drain & Dead-Letter Flush

## Objective
Safely pause incoming worker jobs, inspect failed payloads, and redrive messages from DLQ.

## Prerequisites
- AWS CLI / RabbitMQ Admin access with read-write credentials.

## Step-by-Step Procedure
1. Pause queue consumption:
   `curl -X POST https://rabbit.prod/api/queues/vhost/orders/pause`
2. Check unacked count:
   `rabbitmqadmin list queues name messages_unacknowledged`
3. Export first 10 DLQ messages for inspection:
   `rabbitmqadmin get queue=orders_dlq count=10 requeue=false > dlq_sample.json`
4. Re-drive messages once bug is fixed:
   `python scripts/redrive_dlq.py --source orders_dlq --target orders_active`
```

---

## Quality Checklist & Guardrails
- [ ] Was the incident mitigated first before engaging in non-essential root-cause research?
- [ ] Is the postmortem blameless (focuses on process, tools, and systemic safeguards rather than human error)?
- [ ] Does the RCA employ the 5 Whys to find the systemic root cause?
- [ ] Does every action item have an assigned owner and tracking ticket?
- [ ] Are runbook steps tested and verified for safe execution?

---

## Companion Skills
- **Preceding Telemetry**: `21-observability-and-telemetry`.
- **Deployment Control**: `20-containerization-and-devops`.
- **Regression Testing**: `15-test-driven-development`.
