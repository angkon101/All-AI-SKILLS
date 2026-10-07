---
name: secrets-lifecycle-and-vault-architecture
description: HashiCorp Vault architecture, dynamic ephemeral database credentials, automated secret rotation, Gitleaks secret scanning CI gates, and PKI cert-manager lifecycles.
---

# 🛡️ Secrets Management, Vault Architecture & PKI

## 🎯 Role & Objective
As a **Principal Secrets & Cryptographic Systems Architect**, your mandate is to eradicate hardcoded static credentials, unencrypted `.env` files, and long-lived API tokens across the organization. You deploy enterprise secrets orchestration via **HashiCorp Vault**, configure dynamic database credential engines that mint 15-minute ephemeral users on demand, build automated secrets rotation pipelines, enforce strict pre-commit and CI secrets scanning with **Gitleaks**, and automate internal TLS certificate lifecycles via Vault PKI engines.

---

## 🔐 The Static vs Dynamic Secrets Paradigm

```mermaid
flowchart LR
    subgraph Antipattern["Anti-Pattern: Static Leaked Secret"]
        A1["Long-Lived DB Password in .env / ConfigMap"] --> A2["Developer Commits to Git or Leaks in Logs"]
        A2 --> A3["Attacker Compromises Database Indefinitely"]
    end

    subgraph VaultPattern["Production Standard: Dynamic Ephemeral Secret"]
        B1["Microservice Authenticates to Vault via K8s Service Account"] --> B2["Vault Mints Dynamic Ephemeral DB User with 1-Hour TTL"]
        B2 --> B3["Microservice Executes Queries"]
        B3 --> B4["TTL Expires: Vault Automatically Drops DB User from Database"]
    end
```

---

## ⚙️ Standard Implementation Workflow

### Step 1: Configure HashiCorp Vault Dynamic Database Secrets Engine

Instruct Vault to dynamically create and manage short-lived PostgreSQL database credentials on demand.

```hcl
# vault-database-engine.hcl
# 1. Mount the database secrets engine
path "database/config/production-postgres" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# 2. Configure connection to PostgreSQL cluster with administrative root user
# Note: Master root password is stored securely only within Vault's encrypted storage backend
plugin_name = "postgresql-database-plugin"
allowed_roles = ["billing-service-readwrite", "analytics-readonly"]
connection_url = "postgresql://{{username}}:{{password}}@postgres-prod.internal:5432/production?sslmode=verify-full"
username = "vault_root_admin"
password = "super-secret-vault-master-pass"

# 3. Define role template for billing microservice
# Vault will substitute {{name}}, {{password}}, and {{expiration}} dynamically on each credential request
path "database/roles/billing-service-readwrite" {
  db_name = "production-postgres"
  creation_statements = [
    "CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';",
    "GRANT CONNECT ON DATABASE production TO \"{{name}}\";",
    "GRANT USAGE ON SCHEMA billing TO \"{{name}}\";",
    "GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA billing TO \"{{name}}\";"
  ]
  revocation_statements = [
    "REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA billing FROM \"{{name}}\";",
    "REVOKE USAGE ON SCHEMA billing FROM \"{{name}}\";",
    "DROP ROLE IF EXISTS \"{{name}}\";"
  ]
  default_ttl = "1h"
  max_ttl = "4h"
}
```

---

### Step 2: Fetch and Renew Ephemeral Credentials in Application Code

```typescript
// secrets/vaultClient.ts
import axios from 'axios';

const VAULT_ADDR = process.env.VAULT_ADDR || 'https://vault.internal:8200';
const VAULT_ROLE = 'billing-service-readwrite';

export interface DynamicDbCredentials {
  username: string;
  password: string;
  leaseId: string;
  leaseDurationSeconds: number;
}

/**
 * Authenticates via Kubernetes Service Account token to fetch temporary DB credentials from Vault.
 */
export async function getDynamicDbCredentials(): Promise<DynamicDbCredentials> {
  // 1. Read K8s Service Account JWT injected by Kubernetes
  const fs = await import('node:fs/promises');
  const jwt = await fs.readFile('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');

  // 2. Authenticate to Vault Kubernetes Auth method
  const loginRes = await axios.post(`${VAULT_ADDR}/v1/auth/kubernetes/login`, {
    role: 'billing-app',
    jwt: jwt
  });

  const clientToken = loginRes.data.auth.client_token;

  // 3. Request dynamic PostgreSQL credentials from Database Engine
  const credsRes = await axios.get(`${VAULT_ADDR}/v1/database/creds/${VAULT_ROLE}`, {
    headers: { 'X-Vault-Token': clientToken }
  });

  const { username, password } = credsRes.data.data;
  const { lease_id, lease_duration } = credsRes.data;

  // 4. Set up background lease renewal loop before expiration
  setInterval(async () => {
    try {
      await axios.put(
        `${VAULT_ADDR}/v1/sys/leases/renew`,
        { lease_id, increment: 1800 },
        { headers: { 'X-Vault-Token': clientToken } }
      );
      console.log(`[VAULT] Successfully renewed lease ${lease_id}`);
    } catch (err) {
      console.error(`[VAULT ERROR] Lease renewal failed; rotating connection pool:`, err);
    }
  }, (lease_duration / 2) * 1000);

  return {
    username,
    password,
    leaseId: lease_id,
    leaseDurationSeconds: lease_duration
  };
}
```

---

### Step 3: Zero-Tolerance Pre-Commit & CI Secrets Scanning (Gitleaks)

Block any commit or pull request that introduces hardcoded private keys, AWS access keys, Slack webhooks, or API credentials.

```toml
# .gitleaks.toml
[extend]
useDefault = true

[allowlist]
description = "Permitted non-sensitive mock fixtures"
paths = [
  '''tests/mocks/.*''',
  '''\.gitleaks\.toml'''
]
regexes = [
  '''example-dummy-key-[0-9a-f]+''',
  '''00000000000000000000000000000000'''
]

[[rules]]
id = "custom-internal-api-token"
description = "Acme Corp Internal Secret Token"
regex = '''(?i)(?:acme_sec_[0-9a-zA-Z]{32})'''
keywords = ["acme_sec"]
```

```yaml
# .github/workflows/secrets-scan.yml
name: "Gitleaks Secrets Detection CI Gate"

on:
  pull_request:
  push:
    branches: [main]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository with full commit history
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Gitleaks Scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_CONFIG: .gitleaks.toml
```

---

## 📋 Security Quality Checklist

- [ ] **No Static Database Credentials**: Microservices use Vault dynamic secret engines or AWS IAM authentication; standing root/admin passwords are prohibited in code.
- [ ] **Automated Secret Lease Renewal**: Applications schedule periodic renewal before `lease_duration` expires, with fallback to clean reconnection pools.
- [ ] **Pre-Commit and CI Gitleaks Enforcement**: Pre-commit hooks (`pre-commit-msg`) and GitHub Actions fail builds immediately upon detecting secret entropy.
- [ ] **Transit Encryption as a Service**: High-security applications encrypt sensitive data via Vault Transit API (`v1/transit/encrypt`) so master keys never leave Vault.
- [ ] **Automated PKI Rotation**: Internal TLS certificates are minted by Vault PKI or Cert-Manager with short lifespans (max 30 days) and automated renewal.
- [ ] **Audit Logging Active**: Every secret read, lease creation, and renewal is logged to an immutable SIEM audit pipeline with requestor metadata.
