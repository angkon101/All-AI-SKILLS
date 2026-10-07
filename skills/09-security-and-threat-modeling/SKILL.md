---
name: security-and-threat-modeling
description: >-
  Use this skill to conduct threat modeling (STRIDE), mitigate OWASP Top 10 vulnerabilities,
  and implement defense-in-depth security architectures. It guides authentication (OAuth2, OIDC, JWT),
  authorization (RBAC/ABAC), secrets management, input sanitization, CSRF/CORS/CSP hardening,
  and secure coding practices.
---

# Security Architecture & Threat Modeling Skill

## Overview
This skill guides the AI agent in embedding proactive, defense-in-depth security throughout software systems. It ensures systems withstand attacks by systematically identifying threats with the STRIDE model, eliminating OWASP Top 10 vulnerabilities, enforcing zero-trust authorization, and securing secrets.

---

## When to Use This Skill
- Designing authentication and authorization flows (OAuth2, OIDC, JWT, RBAC/ABAC).
- Conducting pre-implementation threat modeling and risk assessment.
- Auditing code, APIs, and dependencies for vulnerabilities and injection flaws.
- Configuring secure headers (CORS, CSP, HSTS) and secrets lifecycle.

---

## Input Context Required
1. System architecture and trust boundaries from `03-system-architecture-design`.
2. API contracts and input parameters from `05-api-contract-design`.
3. Compliance mandates (GDPR, PCI-DSS, SOC 2, HIPAA).

---

## Step-by-Step Execution Workflow

### Step 1: STRIDE Threat Modeling Analysis
Map trust boundaries and evaluate each component across the STRIDE taxonomy:
| Threat Category | Property Violated | Mitigation Strategy |
| :--- | :--- | :--- |
| **S - Spoofing** | Authenticity | Mutual TLS (mTLS), strict OIDC/JWT signature verification (RS256/EdDSA), MFA |
| **T - Tampering** | Integrity | Cryptographic HMAC signatures, immutable append-only audit logs, input validation |
| **R - Repudiation** | Non-repudiation | Structured audit logging with user ID, IP, timestamp, and action hash |
| **I - Information Disclosure**| Confidentiality | TLS 1.3 in-transit, AES-256 at-rest, masking PII in logs, strict CORS |
| **D - Denial of Service** | Availability | Rate limiting (token bucket / leaky bucket), request payload size limits, timeouts |
| **E - Elevation of Privilege**| Authorization | Least privilege principle, server-side RBAC/ABAC policy checks (e.g., OPA/Casbin) |

### Step 2: Authentication & JWT Hardening
- **JWT Signatures**: Use asymmetric algorithms (`RS256` or `EdDSA`). Reject `none` algorithm.
- **Claims Verification**: Always validate `iss` (issuer), `aud` (audience), `exp` (expiration), and `nbf` (not before).
- **Lifetimes**: Access tokens should be short-lived (5-15 minutes). Refresh tokens must be rotated upon every use with family revocation if reuse is detected.
- **Storage**: Store tokens in HTTP-only, Secure, SameSite=Strict cookies to eliminate XSS-based theft.

### Step 3: OWASP Top 10 Defense Checklist
1. **Injection (SQLi / Command / NoSQL)**:
   - NEVER concatenate user input into queries. Use parameterized queries or typed query builders (Prisma, Kysely, SQLAlchemy).
2. **Broken Object Level Authorization (BOLA / IDOR)**:
   - Always verify resource ownership server-side:
     `SELECT * FROM orders WHERE id = $orderId AND user_id = $authenticatedUserId;`
3. **Cross-Site Scripting (XSS)**:
   - Context-aware HTML escaping, Content Security Policy (`default-src 'self'`), avoid `dangerouslySetInnerHTML`.
4. **Cross-Site Request Forgery (CSRF)**:
   - Use `SameSite=Lax` or `Strict` cookies; for mutating state, enforce anti-CSRF tokens or custom request headers (`X-Requested-With`).
5. **Security Misconfiguration**:
   - Disable stack traces in production error responses. Strip `X-Powered-By` headers. Enforce HSTS (`max-age=31536000; includeSubDomains`).

### Step 4: Strict Input Validation Schema (Zero-Trust Boundaries)
Validate all incoming payloads at the boundary using strict schemas (e.g., Zod, Pydantic):
```typescript
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(12).max(128).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
  role: z.enum(['viewer', 'editor']), // Disallow elevated roles from client input
}).strict(); // Reject unexpected extra fields to prevent mass assignment
```

### Step 5: Secrets Lifecycle & Environment Hygiene
- Never commit `.env`, private keys, API keys, or certificates into git.
- Enforce pre-commit git secret scanning (e.g., Gitleaks, detect-secrets).
- Inject secrets via cloud secret managers (AWS Secrets Manager, Vault) at runtime.

---

## Output Deliverables Template

Generate Security & Threat Assessment:

```markdown
# Threat Model & Security Specification: [Service Name]

## 1. Trust Boundaries
- **External Public Internet**: Untrusted. All inputs subject to rate limiting and schema validation.
- **Internal Service Mesh**: Authenticated via mTLS and scoped service account tokens.
- **Persistence Layer**: Encrypted at rest, restricted network subnet.

## 2. STRIDE Assessment Matrix
| Component | Threat | Impact | Mitigation Implemented |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/transfer` | Spoofing | High | Enforce Bearer JWT with sub check + MFA step-up |
| `POST /api/v1/transfer` | Tampering | High | Parameterized SQL query, Zod schema validation |
| `GET /api/v1/documents/:id`| IDOR | High | Scoped query validating `tenant_id` matches JWT claim |

## 3. Security Headers Configuration
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `DENY`
- `Content-Security-Policy`: `default-src 'self'; frame-ancestors 'none';`
```

---

## Quality Checklist & Guardrails
- [ ] Are all database queries parameterized without any string concatenation?
- [ ] Is every single API endpoint checked for authorization (IDOR protection)?
- [ ] Are passwords hashed using Argon2id or bcrypt (cost factor >= 12)?
- [ ] Are JWTs short-lived with rotation and cryptographic signature verification?
- [ ] Are secrets excluded from code repositories, logs, and client bundles?

---

## Companion Skills
- **Preceding Step**: `05-api-contract-design`.
- **Implementation**: `10-clean-architecture-and-solid`.
- **Auditing**: `18-code-review-and-audit`.
