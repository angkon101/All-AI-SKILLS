---
name: team-topologies-and-org-design
description: >-
  Use this skill to design organizational team structures that mirror target software architectures
  using Team Topologies and Conway's Law. It guides the Reverse Conway Maneuver, mapping the 4 fundamental
  team types (Stream-Aligned, Platform, Enabling, Complicated-Subsystem), defining team interaction modes
  (Collaboration, X-as-a-Service, Facilitating), and minimizing developer cognitive load.
---

# Team Topologies & Organizational Architecture Skill

## Overview
This skill guides the AI agent in acting as a VP of Engineering or Organizational Architect. It applies the principles of **Team Topologies** and **Conway's Law** to structure engineering teams so that software boundaries, communication channels, and deployment pipelines remain decoupled, fast, and resilient against developer burnout.

---

## When to Use This Skill
- Scaling an engineering organization from 1 team to multiple squads or business units.
- Decomposing a monolithic system where multiple teams collide on the same codebase.
- Executing the "Reverse Conway Maneuver" to reshape teams before an architectural redesign.
- Reducing excessive team cognitive load and eliminating cross-team blocking dependencies.

---

## Input Context Required
1. Target software architecture and bounded contexts from `02-domain-driven-design` and `03-system-architecture-design`.
2. Current engineering headcount, squad sizes, and cross-team dependency bottlenecks.
3. Strategic release frequency goals (e.g., daily independent deployments).

---

## Step-by-Step Execution Workflow

### Step 1: The Reverse Conway Maneuver
Conway's Law dictates that software architecture mirrors organizational communication:
- If 4 teams work on 1 database, you will get a tightly coupled monolithic database.
- If you want decoupled microservices or autonomous modules, you **must first establish autonomous teams** with clear, decoupled domain ownership.

### Step 2: The Four Fundamental Team Types
Organize all engineering squads strictly into these four archetypes:
1. **Stream-Aligned Team (Primary Workhorse)**:
   - Aligned directly to a single continuous stream of customer value (e.g., *Checkout Squad*, *Search & Discovery Squad*).
   - Cross-functional: Product, Design, Frontend, Backend, QA in a single unit (6-9 people).
   - Empowered to ship end-to-end to production without handing off work to another team.
2. **Platform Team**:
   - Enables stream-aligned teams to deliver autonomously without knowing low-level cloud plumbing.
   - Treats the platform as an internal product: provides self-service APIs, CI/CD templates, observability dashboards, and database provisioning as a service (X-as-a-Service).
3. **Enabling Team**:
   - Specialists in emerging technologies (e.g., Security, Accessibility, AI/ML, Kafka streaming).
   - Time-boxed missions: They do not write production features for teams; they embed temporarily to mentor, upskill, and spread best practices.
4. **Complicated-Subsystem Team (Use Sparingly)**:
   - Reserved exclusively for rare, deeply specialized domains (e.g., real-time video codec engine, custom cryptography, optical character recognition).

### Step 3: The Three Team Interaction Modes
Clarify how teams collaborate to prevent perpetual coordination meetings:
- **X-as-a-Service**: One team provides and maintains a self-service API; the other consumes it with zero sync meetings. (Default target).
- **Collaboration**: Two teams work closely together for a strictly time-boxed period (e.g., 2 sprints) to co-design a new API boundary, then transition to X-as-a-Service.
- **Facilitating**: An Enabling team coaches another team to clear an architectural hurdle.

### Step 4: Managing Team Cognitive Load
Cognitive load represents the mental bandwidth required to maintain a software footprint:
- **Intrinsic Load**: Mechanics of coding (languages, frameworks).
- **Extrinsic Load**: Operational friction (How do I deploy? How do I configure AWS IAM?). *Platform teams must eliminate this!*
- **Germane Load**: Core business domain logic. *Stream teams should spend 80%+ of their mental energy here.*
- *Rule*: If a team is responsible for more domains than can fit in their collective working memory, shrink their boundary or split the team!

---

## Output Deliverables Template

Generate Team Topologies Blueprint in `docs/architecture/team-topologies.md`:

```markdown
# Organizational Architecture Blueprint: Commerce Core Scaling

## 1. Team Archetypes & Domain Ownership
```mermaid
flowchart TD
    subgraph StreamTeams["Stream-Aligned Teams (Customer Value)"]
        T1["Checkout Squad (Cart, Payment, Receipts)"]
        T2["Catalog Squad (Search, Inventory, Pricing)"]
    end

    subgraph Specialist["Complicated Subsystem"]
        T3["Fraud Risk Modeling Team"]
    end

    subgraph Enablement["Enabling Team"]
        T4["FinOps & Performance SWAT Team"]
    end

    subgraph Platform["Platform Team (Internal Developer Platform)"]
        T5["Developer Experience & Cloud Infra Team"]
    end

    T1 -->|X-as-a-Service| T5
    T2 -->|X-as-a-Service| T5
    T1 -->|X-as-a-Service API| T3
    T4 -.->|Facilitating / Coaching (2 Sprints)| T1
```

## 2. Team Interaction Contract Table
| Team Pair | Interaction Mode | Duration | Purpose / Deliverable |
| :--- | :--- | :--- | :--- |
| **Checkout Squad -> Platform Team** | X-as-a-Service | Ongoing | Self-service Postgres provisioning and K8s namespace |
| **Catalog Squad -> Fraud Team** | X-as-a-Service | Ongoing | Fraud scoring gRPC endpoint (<15ms response) |
| **FinOps SWAT -> Checkout Squad** | Facilitating | 2 Weeks | Optimize database connection pooling and cloud cost |

## 3. Cognitive Load Assessment
- **Assessment**: Checkout Squad previously maintained its own Kubernetes clusters, Datadog alerts, and payment gateways.
- **Remediation**: Platform Team absorbs Kubernetes cluster maintenance via automated Terraform templates, reclaiming ~35% of Checkout Squad's weekly engineering bandwidth for customer features.
```

---

## Quality Checklist & Guardrails
- [ ] Are Stream-Aligned teams truly cross-functional with zero blocking dependencies on external teams for releases?
- [ ] Does the Platform Team treat internal developers as customers with self-service APIs?
- [ ] Are Collaboration interaction modes strictly time-boxed to prevent chronic dependency coupling?
- [ ] Is team cognitive load assessed before adding new microservices or repos to a squad's ownership?
- [ ] Does the software architecture context map directly mirror the team boundaries?

---

## Companion Skills
- **Domain Boundaries**: `02-domain-driven-design`.
- **System Topology**: `03-system-architecture-design`.
- **Executive Alignment**: `32-executive-stakeholder-communication`.
