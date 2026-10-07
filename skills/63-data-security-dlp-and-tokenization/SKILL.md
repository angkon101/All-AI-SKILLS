---
name: data-security-dlp-and-tokenization
description: Data loss prevention (DLP), automated PII/PHI redaction, Format-Preserving Encryption (FPE), tokenization vaults, cryptographic audit trails, and GDPR crypto-shredding.
---

# 🛡️ Data Security, DLP, Tokenization & Privacy Engineering

## 🎯 Role & Objective
As a **Principal Data Protection Architect**, your mission is to guarantee data confidentiality and integrity across the entire data lifecycle (in transit, at rest, and in use). You design automated Data Loss Prevention (DLP) sanitizers that redact sensitive PII/secrets before reaching log aggregators and LLMs, implement Format-Preserving Tokenization to keep databases free of raw cardholder and identity data, build tamper-evident cryptographic audit logs, and establish GDPR/CCPA crypto-shredding pipelines.

---

## 🏷️ Data Classification & Handling Matrix

| Tier | Classification | Examples | Storage Requirement | Processing & Logging Constraint |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **Restricted / Regulated** | Credit cards (PCI-DSS), SSN/National IDs, Passwords, Private Keys, Biometrics. | Irreversible hash (Argon2id) OR Format-Preserving Tokenization. Never stored in cleartext. | **Strictly forbidden** in log streams, application metrics, traces, or LLM context prompts. |
| **Tier 2** | **Confidential / PII** | Full name, email, phone number, home address, medical records (HIPAA PHI). | Field-Level AES-256-GCM encryption with per-user salt/key. | Dynamically masked (`j***e@acme.com`) in analytics and debug consoles. |
| **Tier 3** | **Internal Sensitive** | Business financial records, internal contracts, employee IDs. | Table-level transparent encryption (TDE) at rest; strict RBAC. | Role-based authorization; sanitized in non-production staging environments. |
| **Tier 4** | **Public** | Marketing pages, public product catalogs, press releases. | Standard cloud storage. | No encryption restrictions beyond standard TLS in transit. |

---

## ⚙️ Standard Implementation Workflow

### Step 1: Automated PII & Secret Redaction Engine (DLP Logger)

Strip sensitive tokens, social security numbers, credit cards, and Bearer tokens before writing to Datadog, CloudWatch, or OpenTelemetry.

```typescript
// logging/dlpSanitizer.ts
const REDACTION_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  // Credit Cards (Luhn candidates: Visa, Mastercard, Amex)
  { regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g, replacement: '[REDACTED_CC]' },
  // US Social Security Numbers (SSN)
  { regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED_SSN]' },
  // Bearer tokens & JWTs
  { regex: /Bearer\s+ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gi, replacement: 'Bearer [REDACTED_JWT]' },
  // API Keys (AWS, Stripe, OpenAI, GitHub, Slack)
  { regex: /(?:AKIA[0-9A-Z]{16}|sk_live_[0-9a-zA-Z]{24}|ghp_[0-9a-zA-Z]{36})/g, replacement: '[REDACTED_API_KEY]' },
  // Passwords in JSON structures
  { regex: /"(?:password|passwd|secret|api_key|token)"\s*:\s*"[^"]+"/gi, replacement: '"$1":"[REDACTED_SECRET]"' }
];

/**
 * Deeply sanitizes any log object or string payload before outputting to stdout or external collectors.
 */
export function sanitizeLogPayload(input: unknown): unknown {
  if (typeof input === 'string') {
    let sanitized = input;
    for (const { regex, replacement } of REDACTION_PATTERNS) {
      sanitized = sanitized.replace(regex, replacement);
    }
    return sanitized;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeLogPayload(item));
  }

  if (input !== null && typeof input === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const lowerKey = key.toLowerCase();
      // Fast path for field names that are inherently sensitive
      if (['password', 'secret', 'creditcard', 'cvv', 'ssn', 'authtoken', 'refreshtoken'].includes(lowerKey)) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitizeLogPayload(value);
      }
    }
    return sanitizedObj;
  }

  return input;
}
```

---

### Step 2: Format-Preserving Tokenization Vault (Credit Cards / SSN)

Tokenize regulated data into random surrogates that preserve length and character type, keeping real PII completely isolated in an encrypted token vault.

```typescript
// vault/tokenizationVault.ts
import crypto from 'node:crypto';
import { db } from '../db';
import { tokenVault } from '../db/schema';
import { eq } from 'drizzle-orm';

const VAULT_AES_KEY = Buffer.from(process.env.TOKEN_VAULT_KEY_HEX || '', 'hex'); // 256-bit key from KMS

export interface TokenizedResult {
  token: string;
  maskedDisplay: string;
}

/**
 * Converts raw sensitive cardholder data into a non-PCI token.
 * Only the token is stored in the application primary database.
 */
export async function tokenizeCreditCard(rawPan: string, tenantId: string): Promise<TokenizedResult> {
  const cleanPan = rawPan.replace(/\D/g, '');
  const lastFour = cleanPan.slice(-4);
  const maskedDisplay = `•••• •••• •••• ${lastFour}`;

  // 1. Generate unique opaque token format: tok_card_<uuid>
  const token = `tok_card_${crypto.randomUUID().replace(/-/g, '')}`;

  // 2. Encrypt raw PAN with AES-256-GCM using unique IV
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', VAULT_AES_KEY, iv);
  const encryptedPan = Buffer.concat([cipher.update(cleanPan, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 3. Store encrypted blob exclusively in the isolated Token Vault table
  await db.insert(tokenVault).values({
    token,
    tenantId,
    lastFour,
    encryptedBlob: encryptedPan.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    createdAt: new Date()
  });

  return { token, maskedDisplay };
}

/**
 * Detokenizes only within a secure PCI enclave for outbound processing with authorized PSP.
 */
export async function detokenizeCreditCard(token: string, tenantId: string): Promise<string> {
  const [entry] = await db
    .select()
    .from(tokenVault)
    .where(eq(tokenVault.token, token))
    .limit(1);

  if (!entry || entry.tenantId !== tenantId) {
    throw new Error('Invalid token or unauthorized tenant access');
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    VAULT_AES_KEY,
    Buffer.from(entry.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(entry.authTag, 'base64'));

  const decryptedPan = Buffer.concat([
    decipher.update(Buffer.from(entry.encryptedBlob, 'base64')),
    decipher.final()
  ]);

  return decryptedPan.toString('utf8');
}
```

---

### Step 3: Crypto-Shredding Engine for GDPR Right-to-Erasure

Instead of running destructive SQL `DELETE` operations across hundreds of relational tables and backups, encrypt user data with a unique **Per-User Data Encryption Key (DEK)**. To execute an irreversible GDPR deletion, destroy the user's DEK from the Key Management Service.

```typescript
// privacy/cryptoShredder.ts
import { kmsClient } from '../crypto/kms';

/**
 * Permanently and instantly renders all distributed records of a user unreadable across all databases,
 * cold storage replicas, and backups by destroying their dedicated Encryption Key.
 */
export async function executeGdprCryptoShred(userId: string, tenantId: string): Promise<void> {
  const userKeyAlias = `alias/users/${tenantId}/${userId}/dek`;

  // 1. Log cryptographic deletion request into immutable audit trail
  console.log(`[AUDIT] Initiating crypto-shredding erasure for user ${userId} in tenant ${tenantId}`);

  // 2. Instruct KMS to immediately schedule destruction or disable the user-specific key
  await kmsClient.scheduleKeyDeletion({
    KeyId: userKeyAlias,
    PendingWindowInDays: 7 // Schedule deletion with immediate revocation of decrypt operations
  });

  // 3. Purge cached DEK from local memory / Redis caches
  await kmsClient.invalidateCachedKey(userKeyAlias);

  // 4. Update user status in primary database
  console.log(`[AUDIT] Key ${userKeyAlias} destroyed. Data permanently unrecoverable.`);
}
```

---

## 📋 Security Quality Checklist

- [ ] **Automated DLP Redaction**: Logging transports execute regex and key-name redaction before dispatching logs to Datadog/CloudWatch.
- [ ] **Zero Cardholder Storage**: Raw PANs and CVVs are tokenized via Format-Preserving Tokenization; only opaque tokens and `last_four` are retained.
- [ ] **Field-Level Encryption (FLE)**: PII columns (SSN, medical notes) are encrypted at the application layer with AES-256-GCM before database insertion.
- [ ] **Crypto-Shredding Implemented**: User records use per-user DEKs such that KMS key destruction instantly satisfies GDPR Right-to-Erasure across all backups.
- [ ] **Tamper-Evident Audit Logs**: Critical security events (key rotation, permission grants, detokenization requests) append to an immutable log with SHA-256 hash chaining.
- [ ] **Masking in Non-Prod**: Production database dumps passed to staging/local environments are processed through anonymization pipelines.
