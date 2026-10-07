---
name: api-security-and-zero-trust-gateways
description: OWASP API Security Top 10 mitigation, Broken Object Level Authorization (BOLA/IDOR) elimination, schema-driven request validation, token revocation blocklists, and zero-trust mTLS proxy architectures.
---

# 🛡️ API Security Hardening & Zero-Trust Gateways

## 🎯 Role & Objective
As a **Principal API Security Engineer**, your mandate is to protect all public, partner, and internal service-to-service APIs against data leaks, unauthorized access, and automated abuse. You implement proactive defenses against the **OWASP API Security Top 10**, strictly enforce object-level and function-level authorization (BOLA/BFLA), enforce contract-first schema validation at the gateway, and implement zero-trust mutual TLS (mTLS) with cryptographically validated identity tokens.

---

## 🔒 OWASP API Security Top 10 Reference Matrix

| Threat Code | Vulnerability Name | Primary Root Cause | Defensive Architecture Pattern |
| :--- | :--- | :--- | :--- |
| **API1:2023** | **BOLA (Broken Object Level Authorization)** | Using client-supplied IDs without verifying tenant/user ownership in DB. | Contextual resource-ownership middleware; UUIDv7/hashids over auto-increment; DB-level predicate injection. |
| **API2:2023** | **Broken Authentication** | Weak JWT signing, missing token revocation, credential stuffing, lack of rate limits on `/login`. | EdDSA/ES256 asymmetric signing, short-lived access tokens (15m), Redis-backed JTI revocation list, strict IP/subnet lockout. |
| **API3:2023** | **Broken Property Level Authorization** | Mass assignment / Over-posting, excessive data exposure of internal fields (`role`, `is_admin`, `ssn`). | Strict DTO validation with Zod/Pydantic (`stripUnknown: true`), explicit response serializers (`exclude: [...]`). |
| **API4:2023** | **Unrestricted Resource Consumption** | Missing pagination limits, unbounded file uploads, regex DoS (ReDoS), GraphQL unbounded depth. | Mandatory `limit <= 100`, sliding window rate limiting per API key/IP, bounded JSON body parser (100KB), max query depth 5. |
| **API5:2023** | **BFLA (Broken Function Level Auth)** | Relying on hidden UI elements; `/api/admin/users` accessible by regular authenticated user. | Declarative Role/Permission middleware on every router; deny-by-default route guards; automated route audit tests. |
| **API6:2023** | **Unrestricted Access to Sensitive Flows** | Automated bots exhausting business operations (promo codes, ticket scalping, checkout hoarding). | Behavioral anomaly scoring, Proof of Work (PoW) or turnstile challenges, velocity checks per fingerprint. |
| **API7:2023** | **Server-Side Request Forgery (SSRF)** | API downloads images/webhooks from user-supplied URLs without resolving IP or blocking private RFC 1918 CIDRs. | DNS resolution validation before fetch; blocking loopback (`127.0.0.1`), private (`10.0.0.0/8`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`). |
| **API8:2023** | **Security Misconfiguration** | Permissive CORS (`*` with credentials), verbose stack traces, default passwords, unnecessary HTTP methods enabled. | Strict CORS origin allowlist, standardized RFC 7807 error sanitization in production, disabled TRACE/OPTIONS debug verbs. |
| **API9:2023** | **Improper Inventory Management** | Zombie / shadow API versions (`/v1/debug`, `/api/beta`) lacking security patches exposed to Internet. | OpenAPI spec contract parity enforcement in CI, gateway route inventory locking, automatic deprecation and sunset headers. |
| **API10:2023**| **Unsafe Consumption of APIs** | Blindly trusting data returned from third-party vendor APIs without sanitization or TLS certificate verification. | Strict TLS certificate validation, input validation on third-party payloads, circuit breakers, timeout limits. |

---

## ⚙️ Standard Implementation Workflow

### Step 1: Prevent BOLA (IDOR) with Ownership Verification Guards

Never query a database using only the URL path parameter ID. Always bind the query to the authenticated `session.userId` or `session.tenantId`.

```typescript
// middleware/authorizeResource.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { documents } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    tenantId: string;
    role: 'USER' | 'ADMIN' | 'AUDITOR';
  };
}

/**
 * Higher-order middleware ensuring the authenticated user owns or has tenant access to the resource.
 * Eliminates OWASP API1:2023 (BOLA).
 */
export function requireDocumentOwnership() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    const documentId = req.params.id;

    if (!documentId) {
      return res.status(400).json({ error: 'Missing document ID parameter' });
    }

    // 1. Fetch document querying strictly by documentId AND tenantId
    const [doc] = await db
      .select({ id: documents.id, ownerId: documents.ownerId, tenantId: documents.tenantId })
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.tenantId, authReq.user.tenantId)
        )
      )
      .limit(1);

    // 2. Return 404 instead of 403 to prevent resource enumeration attacks
    if (!doc) {
      return res.status(404).json({
        type: 'https://api.acme.com/errors/not-found',
        title: 'Resource Not Found',
        status: 404,
        detail: `Document with identifier '${documentId}' does not exist.`
      });
    }

    // 3. For non-admin roles, verify specific user ownership if tenant is shared
    if (authReq.user.role !== 'ADMIN' && doc.ownerId !== authReq.user.id) {
      return res.status(404).json({
        type: 'https://api.acme.com/errors/not-found',
        title: 'Resource Not Found',
        status: 404,
        detail: `Document with identifier '${documentId}' does not exist.`
      });
    }

    next();
  };
}
```

---

### Step 2: Prevent SSRF (OWASP API7) on Webhook & URL Fetchers

```typescript
// utils/safeUrlFetcher.ts
import dns from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

const DISALLOWED_RANGES = [
  'unspecified',
  'broadcast',
  'linkLocal',
  'loopback',
  'private',
  'carrierGradeNat',
  'reserved'
];

/**
 * Validates a target URL before outbound dispatch, resolving DNS and blocking private/internal/cloud metadata IP ranges.
 */
export async function validateOutboundUrl(rawUrl: string): Promise<URL> {
  const parsed = new URL(rawUrl);

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`Unsupported protocol: ${parsed.protocol}`);
  }

  // Prevent internal localhost resolution
  if (parsed.hostname === 'localhost' || parsed.hostname.endsWith('.local') || parsed.hostname.endsWith('.internal')) {
    throw new Error('Outbound connections to local domains are prohibited');
  }

  // Resolve hostname to IP address
  const addresses = await dns.lookup(parsed.hostname, { all: true });

  for (const { address } of addresses) {
    const addr = ipaddr.parse(address);
    const range = addr.range();

    if (DISALLOWED_RANGES.includes(range)) {
      throw new Error(`Outbound request to ${address} (${range}) is forbidden for security.`);
    }

    // Explicit check for AWS/GCP/Azure link-local metadata service (169.254.169.254)
    if (address === '169.254.169.254' || address === 'fd00:ec2::254') {
      throw new Error('Access to cloud metadata service is strictly blocked.');
    }
  }

  return parsed;
}
```

---

### Step 3: Implement Token Revocation & JTI Blocklisting in Redis

```typescript
// security/tokenValidator.ts
import jwt from 'jsonwebtoken';
import { redisClient } from '../cache/redis';

export interface DecodedToken {
  sub: string;
  jti: string; // Unique Token Identifier
  tenantId: string;
  exp: number;
}

export async function verifyAndCheckRevocation(token: string, publicKey: string): Promise<DecodedToken> {
  // 1. Verify asymmetric signature and expiration
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ['ES256', 'EdDSA'],
    issuer: 'https://auth.acme.com',
    audience: 'https://api.acme.com'
  }) as DecodedToken;

  if (!decoded.jti) {
    throw new Error('Token missing required JTI claim');
  }

  // 2. Check Redis JTI revocation blocklist
  const isRevoked = await redisClient.exists(`token:revoked:${decoded.jti}`);
  if (isRevoked) {
    throw new Error('Token has been revoked by user logout or security administrator');
  }

  return decoded;
}

export async function revokeToken(jti: string, remainingTtlSeconds: number): Promise<void> {
  // Set key with TTL equal to token expiration time; automatically expires from Redis
  await redisClient.set(`token:revoked:${jti}`, '1', 'EX', Math.max(remainingTtlSeconds, 60));
}
```

---

## 📋 Security Quality Checklist

- [ ] **BOLA Elimination**: Every entity fetch filters by tenant/user context from the session, never trusting URL path IDs alone.
- [ ] **Resource Enumeration Mitigation**: Unauthorized attempts return HTTP 404 (Not Found) rather than 403 (Forbidden) to prevent attackers probing which resource IDs exist.
- [ ] **Mass Assignment Blocked**: DTO inputs stripped using Zod `strict()` or `strip()` to prevent unauthorized mutation of privileged attributes.
- [ ] **SSRF Defense**: Outbound webhooks and link preview resolvers query DNS and block loopback, RFC 1918 private CIDRs, and `169.254.169.254`.
- [ ] **JTI Revocation List**: JWTs carry a unique `jti` claim, and logouts write to a Redis blocklist keyed with remaining token TTL.
- [ ] **Strict Rate Limits**: Authenticated endpoints rate-limited per API key; unauthenticated endpoints rate-limited per IP with sliding window.
- [ ] **Sanitized Errors**: Production responses implement RFC 7807 Problem Details and strip stack traces, database dialects, and internal IP addresses.
