---
name: requirements-spec
description: >-
  Use this skill when defining, analyzing, or structuring requirements for software systems,
  new features, or greenfield projects. It guides the creation of Product Requirement Documents (PRDs),
  functional and non-functional requirements (NFRs), user stories with acceptance criteria,
  edge case matrices, and domain constraints.
---

# Requirements Engineering & PRD Specification Skill

## Overview
This skill guides an AI agent through formal requirements elicitation, structured analysis, and specification for software systems. It ensures engineering initiatives are anchored in unambiguous user needs, technical feasibility, measurable success criteria, and explicit non-functional requirements (NFRs) before architecture or coding begins.

---

## When to Use This Skill
- Kicking off a new software project, service, or major feature.
- Translating high-level user ideas or business goals into actionable engineering specs.
- Resolving ambiguities, scope creep, or missing edge cases in vague requests.
- Defining Product Requirement Documents (PRDs) and user stories with testable acceptance criteria.

---

## Input Context Required
Before executing, gather or request:
1. **Target Problem & Objectives**: What core problem is being solved and who are the stakeholders/personas?
2. **Target Scope**: In-scope vs. out-of-scope boundaries.
3. **Environment & Ecosystem**: Target platform (cloud, web, mobile, CLI, embedded) and existing system dependencies.
4. **Constraints**: Latency, scale, compliance (e.g., GDPR, HIPAA), budget, or deadline constraints.

---

## Step-by-Step Execution Workflow

### Step 1: Stakeholder & Persona Analysis
Identify the primary user personas and system actors:
- **Primary Persona**: Who directly interacts with the system daily?
- **Secondary / Administrative Persona**: Who operates, monitors, or audits the system?
- **System Actor**: What external automated systems, APIs, or cron triggers interact with it?

### Step 2: Functional Scope Definition (MoSCoW Method)
Categorize capabilities rigorously:
- **Must Have**: Core functionality required for MVP / release viability.
- **Should Have**: High-priority capabilities that have manual workarounds if delayed.
- **Could Have**: Enhancements to be prioritized only if resources permit.
- **Won't Have (This Iteration)**: Explicitly rejected or deferred ideas to prevent scope creep.

### Step 3: Non-Functional Requirements (NFR) Quantification
Quantify NFRs using precise, testable metrics rather than subjective adjectives:
- **Performance**: p95 / p99 response time targets (e.g., `< 120ms` for API reads, `< 300ms` for writes).
- **Scalability**: Target Transactions Per Second (TPS), concurrent active users, data ingestion volume per day.
- **Availability & SLA**: Target uptime (e.g., 99.9% uptime = max ~43 mins downtime/month), Recovery Time Objective (RTO), Recovery Point Objective (RPO).
- **Security & Compliance**: Encryption-in-transit (TLS 1.3), encryption-at-rest (AES-256), auth requirements, regulatory standards.
- **Auditability**: Audit log retention rules, GDPR data deletion requirements.

### Step 4: User Story Formulation with Given-When-Then
Format every functional capability into the standard template:
```text
Title: [Actionable Capability]
As a [Persona]
I want to [Perform Action]
So that [Achieve Business Value / Outcome]

Acceptance Criteria (Gherkin):
Scenario 1: Happy Path
Given [Initial system state or precondition]
When [User executes action with valid payload]
Then [System performs expected state change]
And [System returns successful response / event]

Scenario 2: Boundary / Edge Case
Given [User reaches threshold or quota]
When [User attempts exceeding limit]
Then [System rejects with 429 / 400 and clear error message]
```

### Step 5: Edge Case & Failure Mode Matrix
Construct a table mapping failure modes to system behaviors:
| Category | Scenario | Expected System Behavior | Fallback / Notification |
| :--- | :--- | :--- | :--- |
| **Network** | Upstream dependency timeout (>2s) | Return cached data or degraded response | Log warning, increment timeout metric |
| **Data** | Malformed input payload or missing fields | Reject with 422 Unprocessable Entity + field errors | No state mutation |
| **Concurrency** | Duplicate request submitted simultaneously | Idempotency key deduplication (single execution) | Return identical cached outcome |
| **Auth** | Expired session token | Return 401 Unauthorized with refresh challenge | Redirect or prompt re-auth |

---

## Output Deliverables Template

Generate a structured document following this layout:

```markdown
# Product Requirement Document (PRD): [Project / Feature Name]

## 1. Executive Summary & Problem Statement
- **Context**:
- **Problem Solved**:
- **Business Impact**:

## 2. Target Personas & Use Cases
- **Personas**:
- **Core Use Cases**:

## 3. Scope Boundaries
- **In Scope (Must Have)**:
- **Out of Scope**:

## 4. User Stories & Acceptance Criteria
- [Story US-01]: ...
- [Story US-02]: ...

## 5. Non-Functional Requirements (NFRs)
- **Performance**:
- **Availability & Durability**:
- **Security & Privacy**:

## 6. Edge Cases & Error Behaviors
[Matrix of Edge Cases]

## 7. Dependencies & Assumptions
- **Internal Dependencies**:
- **External Dependencies**:
- **Risks & Open Questions**:
```

---

## Quality Checklist & Guardrails
- [ ] Are all requirements measurable and verifiable (no words like "fast", "intuitive", "reliable" without numbers)?
- [ ] Are acceptance criteria written in Given-When-Then format?
- [ ] Is "Out of Scope" explicitly documented to protect engineering bandwidth?
- [ ] Are rate limits, data retention limits, and error responses defined?
- [ ] Has every user story been reviewed for technical feasibility?

---

## Companion Skills
- **Next Step**: Pass PRD output to `02-domain-driven-design` or `03-system-architecture-design`.
- **Review**: Validate acceptance criteria against `15-test-driven-development`.
