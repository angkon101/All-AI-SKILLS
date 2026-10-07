---
name: product-strategy-and-market-research
description: >-
  Use this skill to conduct market research, competitive teardown analysis, and product strategy formulation.
  It guides TAM/SAM/SOM market sizing, Hamilton Helmer's 7 Powers moat analysis, Value Proposition Canvas
  mapping, Jobs-to-be-Done (JTBD), and strategic feature prioritization via RICE and Kano models.
---

# Product Strategy & Market Research Skill

## Overview
This skill guides the AI agent in operating as a Strategic Product Leader or VP of Product. It ensures engineering efforts are directed toward commercially viable opportunities with durable competitive advantages (moats). It translates market signals into quantitative market sizing, competitive teardowns, and rigorous feature prioritization before engineering begins.

---

## When to Use This Skill
- Validating the market viability and business model of a new software system or venture.
- Performing competitive teardowns against existing market incumbents.
- Sizing market opportunities using bottom-up TAM/SAM/SOM calculations.
- Prioritizing roadmap initiatives using quantitative frameworks (RICE, Kano Model).

---

## Input Context Required
1. Target industry, target customer persona, and core value proposition.
2. Direct competitors, indirect substitutes, and alternative non-consumption solutions.
3. Pricing model hypothesis (B2B SaaS per-seat, usage-based, marketplace rake, freemium).

---

## Step-by-Step Execution Workflow

### Step 1: Bottom-Up Market Sizing (TAM / SAM / SOM)
Avoid generic top-down analyst reports ("A $50B market"). Use bottom-up unit arithmetic:
1. **TAM (Total Addressable Market)**:
   $$\text{TAM} = \text{Total Potential Customers in the World} \times \text{Annual Contract Value (ACV)}$$
2. **SAM (Serviceable Addressable Market)**:
   The subset of TAM that matches your geographic, technical, and regulatory reach.
3. **SOM (Serviceable Obtainable Market)**:
   The realistic portion of SAM achievable within 2-3 years (usually 2-5% of SAM).

### Step 2: Competitive Teardown & Hamilton Helmer's 7 Powers
Analyze incumbents across Hamilton Helmer's 7 Powers framework to identify sustainable barriers to entry:
1. **Network Effects**: Value increases with every additional user.
2. **Switching Costs**: Prohibitive cost/pain for customer to migrate to competitor.
3. **Counter-Positioning**: Incumbent cannot copy your model without destroying their core business.
4. **Scale Economies**: Per-unit production cost declines as volume expands.
5. **Cornered Resource**: Preferential access to scarce talent, IP, or proprietary data assets.
6. **Process Power**: Embedded organizational operational excellence that cannot be easily copied.
7. **Brand**: Trust premium earned over sustained execution.

### Step 3: The Value Proposition Canvas & Jobs-to-be-Done (JTBD)
Frame user needs via Clayton Christensen's JTBD: *"Customers don't buy products; they hire them to do a job."*
- **Customer Profile**:
  - **Jobs to be done**: Functional, emotional, and social tasks they need to accomplish.
  - **Pains**: Friction, unexpected costs, bad UX, compliance headaches.
  - **Gains**: Desired outcomes, cost savings, status, speed.
- **Value Map**:
  - **Products & Services**: What we deliver.
  - **Pain Relievers**: How we eliminate their specific frustrations.
  - **Gain Creators**: How we create outsized positive value.

### Step 4: Quantitative Prioritization Frameworks
Eliminate subjective arguments using data-driven scoring:

1. **RICE Scoring Model**:
   $$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$
   - **Reach**: Number of users impacted per quarter (e.g., 5,000 users).
   - **Impact**: Multiplier on key metric ($3.0 = \text{Massive}$, $2.0 = \text{High}$, $1.0 = \text{Medium}$, $0.5 = \text{Low}$).
   - **Confidence**: Percentage based on empirical evidence ($100\% = \text{High data}$, $80\% = \text{Qualitative tests}$, $50\% = \text{Gut feeling}$).
   - **Effort**: Person-months of engineering/design work.

2. **The Kano Model Categorization**:
   - **Must-Be (Basic)**: Expected table stakes. If missing, customers churn; if present, nobody cheers (e.g., password reset, SSL).
   - **Performance (One-Dimensional)**: Linear satisfaction (e.g., query execution speed, export throughput).
   - **Attractive (Delighters)**: Unexpected innovations that drive virality and word-of-mouth.

---

## Output Deliverables Template

Generate Product Strategy Canvas in `docs/strategy/product-strategy-[name].md`:

```markdown
# Product Strategy & Market Analysis: [Initiative Name]

## 1. Market Opportunity Sizing (Bottom-Up)
- **Target Customer**: Mid-market B2B SaaS companies (100-1,000 employees) in North America.
- **Identified Population**: ~42,000 companies.
- **Proposed Pricing (ACV)**: $12,000 / year ($1,000/mo).
- **TAM**: $42,000 \times \$12,000 = \$504,000,000$.
- **SAM** (Targeting Postgres users): ~60% of TAM = $\$302,400,000$.
- **SOM** (Target 2% of SAM in 24 months): $\$6,048,000$ ARR (~504 customers).

## 2. Competitive Teardown Matrix
| Feature / Power | Incumbent A | Incumbent B | Our Solution |
| :--- | :--- | :--- | :--- |
| **Pricing Model** | $3,500/mo enterprise gate | Free open source | Usage-based self-serve |
| **Setup Time** | 4-6 weeks professional services | Self-hosted manual | 5-minute single-line SDK |
| **Moat Lever** | High Switching Costs | Scale Economies | Counter-Positioning |

## 3. RICE Prioritization Table
| Initiative | Reach | Impact | Confidence | Effort (Person-Mos) | RICE Score | Decision |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| 1-Click PostgreSQL Telemetry | 4,000 | 2.0 | 80% | 1.5 | **4,266** | **Sprint 1 (Must-Do)** |
| SOC 2 Automated Compliance Export | 1,200 | 3.0 | 90% | 1.0 | **3,240** | **Sprint 2 (Must-Do)** |
| Custom Slack Notification Webhooks | 2,500 | 0.5 | 50% | 2.0 | **312** | Backlog |
```

---

## Quality Checklist & Guardrails
- [ ] Is market sizing derived bottom-up with explicit unit multiplication?
- [ ] Has competitive moat analysis identified at least one of Helmer's 7 Powers?
- [ ] Are features categorized using Kano analysis to protect table-stakes requirements?
- [ ] Is RICE scoring backed by stated confidence levels and effort estimates?
- [ ] Does the product strategy explicitly articulate what the product will *not* do?

---

## Companion Skills
- **Requirements Translation**: Feeds into `01-requirements-spec`.
- **Metrics Telemetry**: Connects with `28-data-analytics-and-experimentation`.
- **Stakeholder Alignment**: `32-executive-stakeholder-communication`.
