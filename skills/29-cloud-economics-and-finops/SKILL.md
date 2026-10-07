---
name: cloud-economics-and-finops
description: >-
  Use this skill to model cloud infrastructure economics, calculate product unit economics,
  and embed FinOps cost governance into software architecture. It guides AWS/GCP/Azure sizing,
  Cost per Transaction modeling, egress fee mitigation, Savings Plans vs Spot optimization,
  and automated Infracost CI/CD budget guardrails.
---

# Cloud Economics & FinOps Engineering Skill

## Overview
This skill guides the AI agent in acting as a FinOps Certified Practitioner and Cloud Economics Architect. It bridges engineering architecture with financial accountability by calculating unit economics (Cost per Transaction / MAU), eliminating hidden cloud waste (such as NAT Gateway egress traps), and embedding automated cost-estimation checks directly into CI/CD pipelines.

---

## When to Use This Skill
- Forecasting infrastructure hosting budgets for a new system or service.
- Calculating product unit economics (e.g., "Does this $10/mo user cost us $14 in compute?").
- Optimizing high-scale cloud bills across AWS, GCP, or Azure.
- Establishing cost allocation tagging taxonomies and CI/CD budget guardrails.

---

## Input Context Required
1. System topology and data stores from `03-system-architecture-design` and `07-database-modeling-and-migrations`.
2. Throughput scale: Expected requests/second, storage volume, egress bandwidth.
3. Target cloud provider (AWS, GCP, Azure, or hybrid/bare-metal).

---

## Step-by-Step Execution Workflow

### Step 1: Unit Economics Formulation (The Financial Health Metric)
Never analyze cloud spend in absolute dollars ($50k/mo). Always calculate **Unit Economics**:
$$\text{Cost per Unit} = \frac{\text{Total Cloud Spend attributable to Service}}{\text{Total Units Delivered (Transactions / MAU / Queries)}}$$
- If Cost per Unit is *declining* as traffic scales, your architecture demonstrates healthy economies of scale.
- If Cost per Unit is *increasing*, your architecture contains an accidental super-linear bottleneck (e.g., cross-region network egress or unbounded unindexed queries).

### Step 2: The 4 Major Cloud Cost Levers & Pitfalls
1. **Compute (Right-Sizing & Commitment)**:
   - *Baseline*: Cover steady-state baseline (70-80% of compute) with 1-3 year Compute Savings Plans or Reserved Instances (saves 35-65%).
   - *Spikes*: Scale burst traffic with On-Demand.
   - *Batch Workers*: Run background asynchronous jobs on Spot / Preemptible instances (saves 70-90%).
2. **The Networking / Egress Trap (The #1 Cloud Bill Surprise)**:
   - AWS charges ~$0.09/GB for internet egress, but also charges for **Cross-AZ data transfer** ($0.01/GB in and out)!
   - *Fix*: Keep chatty services within the same Availability Zone where possible; use VPC Endpoints (PrivateLink) instead of routing S3 traffic through NAT Gateways.
3. **Storage Tier Lifecycle Policies**:
   - S3 Standard: ~$0.023/GB/mo.
   - S3 Infrequent Access (IA): ~$0.0125/GB/mo.
   - S3 Glacier Flexible: ~$0.0036/GB/mo.
   - S3 Deep Archive: ~$0.00099/GB/mo (saves 95%+).
   - *Rule*: Automate transition to IA after 30 days and Glacier after 90 days.
4. **Database Provisioning**:
   - Deploy connection poolers (PgBouncer) so database compute size is determined by working memory and disk IOPS, NOT by connection counts.

### Step 3: Mandatory Cloud Tagging Taxonomy
Enforce tagging on every provisioned resource to enable automated showback / chargeback:
- `env`: `production`, `staging`, `dev`
- `service`: `ordering-api`, `billing-engine`, `search-indexer`
- `team`: `core-platform`, `checkout-stream`
- `cost-center`: `finance-allocated-code`

### Step 4: Shift-Left FinOps: CI/CD Cost Guardrails (Infracost)
Never let an engineer merge a Terraform change that doubles cloud spend without visibility:
- Run **Infracost** on pull requests to display the exact dollar difference on every DDL or infra change.

---

## Output Deliverables Template

### 1. Cloud Sizing & Unit Economics Model

```markdown
# Cloud Infrastructure Economics & Sizing Model: [Service Name]

## 1. Scale Assumptions & Unit Volume
- **Monthly Active Users (MAU)**: 1,000,000
- **Monthly Transactions**: 15,000,000
- **Total Ingress / Egress**: 20 TB ingress, 45 TB egress / month.

## 2. Monthly Infrastructure Cost Breakdown (AWS US-East-1)
| Component | Configuration | Pricing Basis | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **API Compute (ECS Fargate)** | 16 vCPU, 32 GB RAM baseline | Compute Savings Plan (1-yr) | $462.00 |
| **Database (Aurora Postgres)** | `db.r6g.xlarge` (Multi-AZ) | 1-yr Reserved Instance | $518.00 |
| **Distributed Cache (ElastiCache)** | 2x `cache.m6g.large` Redis | Reserved Instance | $164.00 |
| **S3 Object Storage** | 50 TB (with lifecycle to Glacier) | Tiered storage | $410.00 |
| **Internet Egress Bandwidth** | 45 TB via CloudFront CDN | Tiered CDN pricing | $1,280.00 |
| **VPC Endpoints & NAT Gateways** | 2 NAT Gateways + S3 Endpoints | Gateway hours + data | $135.00 |
| **Total Estimated Cloud Spend** | | | **$2,969.00 / month** |

## 3. Unit Economics KPI
- **Cost per Transaction**:
  $$\frac{\$2,969}{15,000,000\,\text{tx}} = \mathbf{\$0.000198} \quad (\approx 0.02\text{ cents per transaction})$$
- **Cost per Monthly Active User (MAU)**:
  $$\frac{\$2,969}{1,000,000\,\text{MAU}} = \mathbf{\$0.00297} \quad (\approx 0.30\text{ cents per MAU})$$
- **Gross Margin Contribution**: At $0.15 revenue per transaction, cloud infra COGS represents only **1.32% of revenue**, ensuring high software gross margins (>80%).
```

### 2. Automated PR Infracost Workflow (`.github/workflows/infracost.yml`)
```yaml
name: Infracost PR Cost Check
on: [pull_request]

jobs:
  infracost:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Infracost
        uses: infracost/actions/setup@v3
        with:
          api-key: ${{ secrets.INFRACOST_API_KEY }}
      - name: Run Infracost breakdown
        run: |
          infracost breakdown --path=terraform/ \
                              --format=json \
                              --out-file=/tmp/infracost.json
          infracost comment github --path=/tmp/infracost.json \
                                   --repo=$GITHUB_REPOSITORY \
                                   --github-token=${{ secrets.GITHUB_TOKEN }} \
                                   --pull-request=${{ github.event.pull_request.number }} \
                                   --behavior=update
```

---

## Quality Checklist & Guardrails
- [ ] Has Unit Cost (Cost per Transaction/MAU) been quantified against revenue?
- [ ] Are NAT Gateway egress traffic fees mitigated using S3/DynamoDB VPC Endpoints?
- [ ] Are steady-state baseline instances covered by Savings Plans / Reserved commitments?
- [ ] Is an S3 lifecycle policy configured to transition cold data to Glacier?
- [ ] Is Infracost or automated cost estimation embedded into infrastructure PRs?

---

## Companion Skills
- **Procurement Strategy**: `25-build-vs-buy-evaluation`.
- **Infrastructure Code**: `20-containerization-and-devops`.
- **Architecture Sizing**: `03-system-architecture-design`.
