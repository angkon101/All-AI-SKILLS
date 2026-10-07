---
name: chaos-engineering-and-disaster-recovery
description: >-
  Use this skill to design hypothesis-driven chaos engineering experiments and disaster recovery (DR) protocols.
  It guides establishing steady-state baselines, controlled fault injection (network latency, pod termination,
  packet loss, split-brain partitions) using Chaos Mesh/Toxiproxy, blast radius containment,
  and executing GameDays to verify RTO and RPO targets.
---

# Chaos Engineering & Disaster Recovery (DR) Skill

## Overview
This skill guides the AI agent in acting as a Principal Site Reliability Engineer and Resilience Architect. It proactively uncovers systemic weaknesses and latent failure modes in distributed systems *before* they cause outages. By formulating scientific hypotheses, injecting controlled faults, and conducting disaster recovery GameDays, teams build empirical confidence in automated failover mechanisms.

---

## When to Use This Skill
- Validating high-availability claims (e.g., "Our database failover takes < 15 seconds").
- Stress-testing circuit breakers, retry policies, and timeout configurations under network degradation.
- Verifying Recovery Time Objective (RTO) and Recovery Point Objective (RPO) compliance.
- Running planned resilience GameDays before major peak-traffic events.

---

## Input Context Required
1. Steady-state baseline metrics: normal error rates, request throughput, p95/p99 latency from `21-observability-and-telemetry`.
2. Architecture topology and dependencies from `03-system-architecture-design`.
3. Blast radius boundaries: Staging environment vs. production canary cohort.

---

## Step-by-Step Execution Workflow

### Step 1: The 4 Principles of Chaos Engineering
Never inject chaos randomly without a scientific method:
1. **Define Steady State**: Establish a quantifiable baseline representing normal system health (e.g., checkout error rate $< 0.1\%$, p99 latency $< 200\text{ms}$).
2. **Formulate a Falsifiable Hypothesis**:
   *"Hypothesis: When we introduce 300ms network latency to the Redis cache cluster, the application will degrade gracefully to direct database reads with p99 latency remaining below 450ms and zero 500 errors."*
3. **Introduce Real-World Turbulence**: Inject a specific fault simulating hardware crashes, network partitions, or dependency failures.
4. **Attempt to Disprove Hypothesis**: Compare post-injection metrics to steady state. If metrics degrade beyond the hypothesis, you have discovered a latent defect! Fix the architecture before production does it for you.

### Step 2: Fault Injection Taxonomy
Categorize faults across three failure domains:
| Domain | Fault Injection Type | Tooling | What it Tests |
| :--- | :--- | :--- | :--- |
| **Network** | Packet Loss (5-20%) | Toxiproxy / Chaos Mesh | Retries, exponential backoff, TCP reconnection |
| **Network** | Latency Injection (+1s) | Toxiproxy | Client timeouts, deadline propagation, thread starvation |
| **Network** | DNS Resolution Drop | Chaos Mesh | DNS caching, circuit breaker fallback |
| **Compute** | Sudden Pod Kill (`SIGKILL`) | Kubernetes / Chaos Monkey | Kubernetes replica rescheduling, connection draining |
| **Resource** | CPU / Memory Saturation | Stress-ng / Litmus | Autoscaling responsiveness, OOM killer survival |
| **Storage** | Primary DB Failover | Cloud RDS / Patroni | Leader election, split-brain prevention, replica promotion |

### Step 3: Blast Radius Containment & Stop Conditions
Safety is paramount during live chaos experiments:
- **Blast Radius Limitation**: Start in staging -> move to 1% production canary traffic -> only expand if safe.
- **Automated Emergency Abort (Dead Man's Switch)**:
  - Define automated kill switches: If overall production 5xx error rate exceeds $1.0\%$ or latency exceeds $1,000\text{ms}$, immediately abort the chaos injection and restore normal routing.

### Step 4: Disaster Recovery (DR) Verification (RTO & RPO)
Quantify disaster recovery capabilities:
- **RTO (Recovery Time Objective)**: The maximum tolerable duration of downtime after an outage before service is restored (e.g., target: $< 15\text{ minutes}$).
- **RPO (Recovery Point Objective)**: The maximum tolerable age of data loss from the moment of disaster (e.g., target: $< 60\text{ seconds}$ via continuous WAL streaming).
- *DR Drill Requirement*: Test actual database restore from backup snapshots quarterly to ensure backups are not corrupt.

### Step 5: Conducting a Resilience GameDay
Organize structured team simulation exercises:
1. Mobilize on-call engineers without revealing the exact fault upfront.
2. Inject fault during scheduled window.
3. Observe: Did alerts fire within SLA? Did automated failovers work? Were runbooks accurate?
4. Document findings in an action-item remediation tracker.

---

## Output Deliverables Template

Generate Chaos Experiment Plan in `docs/chaos/experiment-[name].md`:

```markdown
# Chaos Experiment Plan: EXP-CHAOS-04 - Redis Cache Partition Survival

## 1. Hypothesis Statement
If the primary Redis cache cluster becomes completely unreachable (100% packet loss), the core ordering service will automatically trip its circuit breaker within 3 seconds, route read queries directly to PostgreSQL with read replicas, and maintain a 99.9% HTTP 200 success rate with p99 latency $< 350\text{ms}$.

## 2. Steady-State Baseline
- **Traffic Volume**: 2,500 req/sec.
- **Baseline Error Rate**: 0.02%.
- **Baseline p99 Latency**: 65ms.

## 3. Chaos Injection Specification (Chaos Mesh YAML)
```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: redis-network-partition
  namespace: production
spec:
  action: partition
  mode: all
  selector:
    namespaces:
      - production
    labelSelectors:
      app: redis-cluster
  direction: to
  target:
    selector:
      labelSelectors:
        app: order-service
  duration: '5m'
```

## 4. Emergency Abort Criteria (Stop Conditions)
- [x] Abort immediately if HTTP 5xx error rate exceeds $0.5\%$.
- [x] Abort immediately if PostgreSQL CPU utilization exceeds $85\%$.
- [x] Abort immediately if p99 latency exceeds $800\text{ms}$ for more than 30 consecutive seconds.

## 5. Experiment Findings & Architectural Remediation
- **Observed Behavior**: The circuit breaker successfully opened at 2.8s. However, PostgreSQL replica connection pools saturated because connection max limits were set too low (10 connections/pod).
- **Remediation Action Item**: Increase Postgres connection pool limit to 25 and configure PgBouncer pooling (Jira: INFRA-442).
```

---

## Quality Checklist & Guardrails
- [ ] Is steady state quantified with explicit baseline metric thresholds?
- [ ] Is an automated emergency stop condition configured to abort if error limits are breached?
- [ ] Is the blast radius tightly constrained to canary or non-peak cohorts?
- [ ] Have primary database failover drills verified both RTO and RPO?
- [ ] Are all unexpected findings recorded in architectural remediation tickets?

---

## Companion Skills
- **Telemetry Monitoring**: `21-observability-and-telemetry`.
- **Fault Tolerance Patterns**: `12-resilience-and-error-handling`.
- **Incident Response**: `22-incident-debugging-and-runbooks`.
