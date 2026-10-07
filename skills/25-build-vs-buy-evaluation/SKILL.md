---
name: build-vs-buy-evaluation
description: >-
  Use this skill to conduct rigorous, objective Build vs. Buy vs. Open Source (OSS) evaluations.
  It guides Core vs. Context differentiation, 3-to-5 year Total Cost of Ownership (TCO) financial modeling,
  vendor risk due diligence (SLA, lock-in, data portability), open-source vitality audits (bus factor, CVEs),
  and exit/reversibility strategies.
---

# Build vs. Buy vs. Open Source Evaluation Skill

## Overview
This skill guides the AI agent in conducting strategic, financially sound, and objective technical procurement evaluations. By separating competitive core capabilities from non-differentiating context, calculating true multi-year Total Cost of Ownership (TCO), and auditing vendor lock-in risks, engineering organizations avoid both the costly "Not Invented Here" (NIH) syndrome and hazardous vendor traps.

---

## When to Use This Skill
- Deciding whether to build an internal subsystem (auth, billing, notifications, search, feature flagging) vs. adopting SaaS or open-source.
- Evaluating commercial vendor proposals against open-source alternatives.
- Calculating the 3-5 year TCO of building in-house versus third-party subscriptions.
- Preparing technology procurement memos for engineering leadership and CFO approval.

---

## Input Context Required
1. Capability requirements and non-functional SLAs from `01-requirements-spec`.
2. Team size, engineering compensation rates, and operational maintenance capacity.
3. Candidate solutions (in-house build design, commercial SaaS products, open-source projects).

---

## Step-by-Step Execution Workflow

### Step 1: The Core vs. Context Framework (Geoffrey Moore)
Categorize the capability before evaluating technology:
- **Core (Build In-House)**: Capabilities that directly differentiate the product from competitors and generate competitive advantage. (e.g., proprietary search recommendation engine for an e-commerce platform).
- **Context (Buy or Adopt Open Source)**: Capabilities that must be done well, but customers do not choose you because of them. (e.g., authentication, billing, email delivery, error logging).
- *Golden Rule*: **Never spend engineering innovation capital building Context.**

### Step 2: 3-Year Total Cost of Ownership (TCO) Model
Calculate true costs across all three options:
$$\text{TCO} = \text{Implementation Cost} + \text{Maintenance \& Support} + \text{Hosting/Licensing Cost}$$

1. **Build In-House**:
   - Initial Dev: $E \text{ engineers} \times M \text{ months} \times \text{Fully Loaded Monthly Salary}$.
   - Ongoing Maintenance: 20-30% of initial dev cost annually (bugfixes, upgrades, on-call).
   - Infrastructure: Compute, database, backup, multi-region failover hosting costs.
2. **Buy (Commercial SaaS)**:
   - Annual subscription license (watch for volume-based pricing multipliers: MAU, API calls).
   - Integration & onboarding engineering time (usually 2-6 weeks).
   - Enterprise support tier and compliance add-ons.
3. **Adopt Open Source (OSS)**:
   - Zero license fee, BUT self-hosting infrastructure compute.
   - Ongoing patch maintenance, version upgrades, security CVE vulnerability monitoring.
   - Staff training and operational runbook development.

### Step 3: Vendor Due Diligence & Risk Scoring
Audit candidate SaaS vendors against a weighted scorecard (1-5 scale):
| Risk Dimension | What to Verify | Red Flag / Disqualifier |
| :--- | :--- | :--- |
| **SLA & Uptime** | Financial refund commitments for downtime | SLA < 99.9% or no financial credit remedy |
| **Data Portability** | Automated daily S3/JSON export APIs | Proprietary binary format; no bulk export |
| **Lock-in Risk** | Open standard API vs proprietary SDK | Custom proprietary language or schema |
| **Security & Compliance** | SOC 2 Type II, ISO 27001, GDPR DPA | Self-attestation only; no third-party audit |
| **Pricing Escalation** | Price caps on renewal (e.g., max 5%/year) | Uncapped renewal pricing; aggressive seat minimums |

### Step 4: Open Source Vitality Audit
If evaluating open-source software, inspect repository health:
- **Bus Factor**: Are commits distributed among multiple companies or just one sole maintainer?
- **Commit Cadence**: Active commits within last 30 days; healthy issue-to-PR resolution ratio.
- **Licensing**: Permissive (MIT, Apache 2.0, BSD) vs Copyleft (GPL, AGPL). For proprietary SaaS backends, avoid AGPL without legal review!
- **CVE Track Record**: Rapid patching of reported vulnerabilities (<7 days for critical).

### Step 5: The Two-Way Door Exit Strategy (Reversibility)
Never adopt a vendor or build an internal engine without an exit strategy:
- Mandate an **Anti-Corruption Layer (ACL)** / Port interface inside the application:
  `src/application/ports/IAuthenticationService.ts`
- The application code imports *only* the port. The vendor SDK is quarantined in `src/infrastructure/auth/Auth0Adapter.ts`.
- If the vendor 5x increases prices, only the single adapter class needs rewriting.

---

## Output Deliverables Template

Generate evaluation scorecard in `docs/evaluations/build-vs-buy-[capability].md`:

```markdown
# Build vs. Buy Evaluation: Feature Flagging & Experimentation

## 1. Executive Summary & Recommendation
- **Recommendation**: **Adopt Open Source (GrowthBook / Unleash self-hosted on AWS ECS)**.
- **Justification**: Saves ~$48,000/year compared to LaunchDarkly while avoiding the 6-month engineering distraction of building an in-house flagging system.

## 2. Core vs. Context Assessment
- **Classification**: **Context**. Feature flagging is critical operational infrastructure, but customers do not purchase our product because of our feature flag engine.

## 3. 3-Year TCO Comparison Table
| Cost Component | Option A: Build In-House | Option B: LaunchDarkly (SaaS) | Option C: GrowthBook (OSS) |
| :--- | :--- | :--- | :--- |
| **Initial Implementation** | $75,000 (2 eng, 3 mos) | $12,500 (1 eng, 2 wks) | $18,000 (1 eng, 3 wks) |
| **Annual Licensing / Sub** | $0 | $48,000 / yr ($144,000 total) | $0 |
| **Annual Infra Hosting** | $3,600 / yr | $0 (Included in SaaS) | $2,400 / yr ($7,200 total) |
| **Ongoing Maintenance** | $25,000 / yr ($75,000) | $6,000 / yr ($18,000) | $12,000 / yr ($36,000) |
| **Total 3-Year TCO** | **$160,800** | **$174,500** | **$61,200** |

## 4. Vendor / Solution Evaluation Matrix
| Evaluation Criteria | Weight | Build In-House | LaunchDarkly | GrowthBook OSS |
| :--- | :--- | :--- | :--- | :--- |
| Feature Completeness | 25% | 2.5 | 5.0 | 4.5 |
| Time to Market | 25% | 1.0 (3 months) | 5.0 (Immediate) | 4.0 (2 weeks) |
| Cost Efficiency (TCO) | 20% | 2.0 | 1.5 | 5.0 |
| Data Privacy / Control | 15% | 5.0 (Internal) | 3.0 (Cloud) | 5.0 (VPC private) |
| Vendor Lock-in Freedom | 15% | 5.0 | 2.0 | 4.5 |
| **Weighted Score** | **100%** | **2.88** | **3.65** | **4.53** |

## 5. Architectural Decoupling & Exit Strategy
- The application will communicate solely with the internal `IFeatureFlagPort` port.
- Switching to another provider will require zero alterations to business domain code.
```

---

## Quality Checklist & Guardrails
- [ ] Has the capability been classified as Core vs Context?
- [ ] Does the TCO model account for fully loaded engineering salaries and ongoing maintenance?
- [ ] Has the open-source solution been audited for bus factor, license compliance, and CVE history?
- [ ] Does the design isolate the third-party tool behind an internal Port / Anti-Corruption Layer?
- [ ] Is an exit strategy and data export mechanism documented?

---

## Companion Skills
- **Preceding Thought**: `24-principal-systems-thinking`.
- **Financial Integration**: `29-cloud-economics-and-finops`.
- **Legal Compliance**: `30-compliance-governance-and-risk`.
