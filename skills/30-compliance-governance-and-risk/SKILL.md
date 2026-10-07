---
name: compliance-governance-and-risk
description: >-
  Use this skill to navigate software governance, regulatory compliance, risk registers, and IP licensing.
  It guides SOC 2 Type II / ISO 27001 readiness, GDPR/CCPA data privacy compliance (Right to be Forgotten),
  HIPAA ePHI controls, open-source software (OSS) license audits (MIT vs. GPL vs. AGPL),
  and Software Bill of Materials (SBOM) generation.
---

# Governance, Risk & Regulatory Compliance (GRC) Skill

## Overview
This skill guides the AI agent in acting as a Chief Risk Officer or Compliance & Privacy Architect. It embeds regulatory compliance, data protection laws (GDPR, HIPAA), industry standards (SOC 2 Type II, ISO 27001), open-source intellectual property protection, and proactive risk registers directly into the software development lifecycle.

---

## When to Use This Skill
- Preparing an enterprise architecture for SOC 2 Type II, ISO 27001, or HIPAA compliance audits.
- Designing data privacy workflows for GDPR/CCPA (Right to Erasure, data subject requests).
- Auditing dependencies for open-source license contamination (flagging dangerous AGPL/GPL packages).
- Maintaining an Enterprise Technical Risk Register for executive leadership.

---

## Input Context Required
1. System data classification (Public, Internal, Confidential, Restricted / PII / ePHI).
2. Customer geography and regulatory obligations (EU GDPR, California CCPA, Healthcare HIPAA, FinTech PCI-DSS).
3. Dependency manifests (`package.json`, `go.mod`, `pom.xml`, `requirements.txt`).

---

## Step-by-Step Execution Workflow

### Step 1: Open Source Software (OSS) License Audit
Never allow developers to blindly `npm install` packages without verifying intellectual property licenses:
| License Tier | Typical Licenses | Commercial SaaS Risk | Policy Rule |
| :--- | :--- | :--- | :--- |
| **Permissive** | MIT, Apache 2.0, BSD-2/3, ISC | **Low / Safe** | **Approved**: Royalty-free commercial use; preserve copyright notice. |
| **Weak Copyleft**| LGPL, MPL 2.0, Eclipse (EPL) | **Medium** | **Conditional**: Permitted if dynamically linked as external library. Modifications to library itself must be open-sourced. |
| **Strong Copyleft** | GPL v2 / v3 | **High** | **Restricted**: Code linking with GPL may be forced to open-source entire proprietary codebase. |
| **Network Copyleft** | AGPL v3, SSPL | **Critical / Prohibitive** | **STRICTLY BLOCKED**: Triggered simply by users interacting with software over a network. Forbid without General Counsel approval! |

### Step 2: Data Privacy Architecture (GDPR / CCPA by Design)
Embed privacy directly into database schemas:
1. **Right to Erasure (Article 17)**:
   - Provide automated cryptographic erasure or anonymization:
     `UPDATE users SET email = 'deleted-' || id || '@anonymized.local', name = 'Anonymized User', phone = NULL WHERE id = $userId;`
2. **Data Minimization (Article 5)**: Only collect fields with documented business necessity.
3. **Audit Trail Immutability**: Store audit access logs in append-only storage with separate encryption keys.

### Step 3: SOC 2 Type II Trust Services Criteria Checklist
Ensure technical controls satisfy SOC 2 auditors:
- **Common Criteria (Security)**: MFA enforced for all internal accounts, role-based access control (RBAC), annual penetration test.
- **Availability**: Automated database backups with tested restore drills, multi-AZ cloud redundancy.
- **Processing Integrity**: Data validation at API boundaries, automated CI/CD test gates.
- **Confidentiality**: Encryption at rest (AES-256) and in transit (TLS 1.3), secrets rotation via cloud secret managers.

### Step 4: The Enterprise Technical Risk Register
Maintain a living risk matrix:
$$\text{Risk Score} = \text{Probability (1-5)} \times \text{Impact (1-5)}$$
- **High Risk (15-25)**: Immediate executive mitigation plan required.
- **Medium Risk (8-14)**: Monitored with assigned mitigation sprint tickets.
- **Low Risk (1-7)**: Accepted risk with periodic review.

---

## Output Deliverables Template

Generate Enterprise Risk Register in `docs/compliance/risk-register.md`:

```markdown
# Enterprise Technical Risk Register: [Project Name]

## 1. Risk Matrix Summary
| ID | Risk Description | Category | Prob (1-5) | Imp (1-5) | Score | Mitigation Controls | Owner | Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **R-01** | Stripe payment webhook failure causing unfulfilled orders | Operational | 3 | 4 | **12** | Implement Transactional Outbox + DLQ retry queue | Lead Eng | Mitigating |
| **R-02** | Contamination of proprietary code via AGPL dependency | Legal / IP | 2 | 5 | **10** | Add FOSSA / license-checker gate to GitHub CI | DevOps | Closed |
| **R-03** | AWS US-East-1 total regional blackout | Infra / SLA | 2 | 5 | **10** | Warm standby database replica in US-West-2 | SRE | In Progress |
| **R-04** | Accidental PII logging in application trace telemetry | Privacy / GDPR | 3 | 3 | **9** | Pino auto-redaction regex middleware | Security | Done |

## 2. Automated Dependency License CI Gate (`.github/workflows/license-check.yml`)
```yaml
name: Dependency License Check
on: [push, pull_request]

jobs:
  license-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check Licenses
        run: |
          npx license-checker --production \
            --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC" \
            --excludePackages "internal-tooling"
```

---

## Quality Checklist & Guardrails
- [ ] Are dependencies scanned in CI to block unauthorized copyleft licenses (GPL/AGPL)?
- [ ] Is an automated GDPR Right to Erasure anonymization workflow tested in database DDL?
- [ ] Are PII and sensitive health data encrypted at rest with managed KMS keys?
- [ ] Is the Risk Register maintained with assigned owners, scores, and mitigation tickets?
- [ ] Is Software Bill of Materials (SBOM) generated during production container builds?

---

## Companion Skills
- **Threat Modeling**: `09-security-and-threat-modeling`.
- **Procurement Review**: `25-build-vs-buy-evaluation`.
- **Database Sanitization**: `07-database-modeling-and-migrations`.
