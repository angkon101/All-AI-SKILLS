---
name: architecture-decision-records
description: >-
  Use this skill to document, evaluate, and maintain Architecture Decision Records (ADRs).
  It guides structured capture of technical choices, trade-offs, options considered,
  decision drivers, and consequences (positive, negative, and neutral) using the MADR/Nygard standard.
---

# Architecture Decision Records (ADR) Skill

## Overview
This skill guides the AI agent in authoring, organizing, and evaluating Architecture Decision Records (ADRs). ADRs capture crucial architectural decisions along with their context, trade-offs, rationale, and consequences, creating an immutable history that prevents architectural drift and repetitive debates.

---

## When to Use This Skill
- Deciding on a fundamental framework, language, database, or infrastructure component.
- Changing an established architectural pattern (e.g., migrating from REST to gRPC, adding a caching tier).
- Evaluating multiple viable technical options where significant trade-offs exist.
- Overriding or superseding a previous architectural decision.

---

## Input Context Required
1. Architectural question or problem statement.
2. Technical constraints, business requirements, and operational capabilities.
3. Candidate solutions or technologies under consideration (at least 2-3 options).

---

## Step-by-Step Execution Workflow

### Step 1: Decision Driver Identification
Identify the forces influencing the decision:
- **Functional Drivers**: Business requirements, feature velocity, domain fit.
- **Non-Functional Drivers**: Performance, operational simplicity, cost, security, scalability, developer familiarity.
- **Organizational Drivers**: Licensing, vendor lock-in, compliance mandates.

### Step 2: Options Comparison & Trade-off Matrix
Enumerate at least two distinct viable alternatives and score them objectively:
| Criteria | Weight (1-5) | Option A: [e.g. PostgreSQL] | Option B: [e.g. MongoDB] | Option C: [e.g. DynamoDB] |
| :--- | :--- | :--- | :--- | :--- |
| ACID Guarantees | 5 | 5 (Native) | 3 (Multi-doc transactions) | 3 (Single-table limits) |
| Relational Joins | 4 | 5 (Full SQL) | 2 (Lookup stages) | 1 (Application joins) |
| Operational Overhead | 3 | 4 (Managed RDS) | 4 (Atlas) | 5 (Serverless) |
| Community & Ecosystem | 4 | 5 (Extensive) | 4 (Large) | 4 (AWS native) |

### Step 3: Decision Outcome Formulation
State the decision clearly in one assertive sentence:
- *"We will use [Chosen Option] for [Problem/Component], because [Primary Justification]."*

### Step 4: Consequence Analysis
Document all consequences honestly:
- **Positive Consequences**: What benefits or improvements are unlocked?
- **Negative Consequences / Trade-offs**: What pain points, technical debt, or limitations are accepted?
- **Mitigation Plan**: How will the negative consequences be managed?

### Step 5: ADR Status Lifecycle Management
Track the state of the ADR:
- `Proposed`: Under RFC review.
- `Accepted`: Approved and active.
- `Rejected`: Evaluated but discarded.
- `Deprecated`: No longer relevant due to system evolution.
- `Superseded by ADR-XXXX`: Replaced by a newer decision.

---

## Output Deliverables Template

Generate ADR files in `docs/adr/XXXX-[short-title].md`:

```markdown
# ADR-[NUMBER]: [Title: Choose X Over Y for Z]

- **Status**: [Proposed | Accepted | Superseded by ADR-XXXX]
- **Date**: YYYY-MM-DD
- **Deciders**: [Architects, Tech Leads, AI Agent]
- **Consulted**: [Engineering Team]

## Context and Problem Statement
[Describe the context, technical problem, and constraints requiring an architectural decision. 2-3 paragraphs.]

## Decision Drivers
1. [Driver 1 - e.g., Must support high-throughput read operations (<50ms)]
2. [Driver 2 - e.g., Must enforce strict relational integrity for financial transactions]
3. [Driver 3 - e.g., Operational complexity must be minimal for a small team]

## Considered Options
1. [Option 1: Name and brief description]
2. [Option 2: Name and brief description]
3. [Option 3: Name and brief description]

## Decision Outcome
Chosen option: "[Option 1]", because [summarize core reason].

### Positive Consequences
- [Pro 1: Improved query latency via native indexing]
- [Pro 2: Native JSONB support enables flexible attributes without sacrificing ACID]

### Negative Consequences / Trade-Offs
- [Con 1: Vertical scaling limits before read-replicas required]
- [Mitigation: Read replicas configured behind PgBouncer connection pool]

## Pros and Cons of the Options

### [Option 1]
- Good, because [positive attribute]
- Bad, because [drawback]

### [Option 2]
- Good, because [positive attribute]
- Bad, because [drawback]

## Validation & Compliance
- How will this decision be verified during implementation? (e.g., CI lint rules, architecture test suites, benchmark harness).
```

---

## Quality Checklist & Guardrails
- [ ] Is the decision written in active voice and unambiguous?
- [ ] Are real alternatives evaluated (no "straw man" options created just to make the chosen option look good)?
- [ ] Are negative consequences documented without sugarcoating?
- [ ] Is the ADR committed directly to version control alongside code?

---

## Companion Skills
- **Preceding Step**: `03-system-architecture-design`.
- **Downstream Impact**: Guides implementation in `05-api-contract-design` through `10-clean-architecture-and-solid`.
