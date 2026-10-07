---
name: iam-zero-trust-and-rbac-rebac
description: Zero Trust Architecture, Cloud IAM least privilege, Policy-as-Code with Open Policy Agent (OPA/Rego), Google Zanzibar ReBAC, and ephemeral JIT access.
---

# 🛡️ Identity & Access Management (IAM), Zero Trust & ReBAC

## 🎯 Role & Objective
As a **Principal IAM & Zero Trust Security Architect**, your mandate is to eradicate persistent elevated permissions, eliminate wildcard privileges (`*`), and establish continuous identity verification under **NIST SP 800-207 Zero Trust Architecture**. You design fine-grained authorization architectures leveraging **Role-Based Access Control (RBAC)**, **Attribute-Based Access Control (ABAC)**, and **Zanzibar-style Relationship-Based Access Control (ReBAC)**, execute Policy-as-Code via **Open Policy Agent (OPA/Rego)**, and implement ephemeral, Just-In-Time (JIT) privileged access.

---

## 🏛️ Authorization Models Compared

| Model | Paradigm | Ideal Use Case | Representative Tooling |
| :--- | :--- | :--- | :--- |
| **RBAC** (Role-Based) | User belongs to Role; Role has Permissions. Simple matrix (`ADMIN`, `EDITOR`, `VIEWER`). | Standard SaaS enterprise administration; back-office portals. | PostgreSQL roles, Keycloak, Auth0 roles. |
| **ABAC** (Attribute-Based) | Decisions evaluate Subject, Resource, Action, and Environment attributes (time, IP, device security state). | Dynamic compliance rules; e.g., "Allow access only during business hours from company-managed laptops". | Open Policy Agent (OPA), AWS Cedar, XACML. |
| **ReBAC** (Relationship-Based) | Inspired by **Google Zanzibar**. Access derived from graph edges (e.g., "User is a member of Team X which owns Folder Y which contains Document Z"). | Google Docs / Notion / Figma scale document and workspace sharing with recursive inheritance. | SpiceDB, Ory Keto, Permify, OpenFGA. |
| **Zero Trust Workload** | Cryptographic mutual authentication without static API keys or network perimeters. | Microservices communicating across Kubernetes clusters and multi-cloud environments. | SPIFFE / SPIRE, Istio mTLS, AWS IAM Roles for Service Accounts (IRSA). |

---

## ⚙️ Standard Implementation Workflow

### Step 1: Policy-as-Code Authorization with Open Policy Agent (OPA / Rego)

Decouple business authorization rules from application code. Decisions are evaluated deterministically in microsecond latency.

```rego
# policies/authz.rego
package acme.authz

import future.keywords.in
import future.keywords.if

default allow := false

# Helper: Extract user roles
user_has_role(role) if {
    role in input.user.roles
}

# Rule 1: Super Administrators have full access across all endpoints
allow if {
    user_has_role("SECURITY_ADMIN")
}

# Rule 2: Tenant Isolation Check (Subject tenant must match Resource tenant)
tenant_matches if {
    input.user.tenant_id == input.resource.tenant_id
}

# Rule 3: Document Read Access (Role-based or Direct Ownership)
allow if {
    tenant_matches
    input.action == "read"
    input.resource.type == "document"
    user_has_role("DOCUMENT_VIEWER")
}

allow if {
    tenant_matches
    input.action == "read"
    input.resource.type == "document"
    input.resource.owner_id == input.user.id
}

# Rule 4: Document Write Access requires EDITOR role and strict IP geofencing
allow if {
    tenant_matches
    input.action == "write"
    input.resource.type == "document"
    user_has_role("DOCUMENT_EDITOR")
    # Verify client is connecting from corporate VPN CIDR
    net.cidr_contains("10.200.0.0/16", input.context.client_ip)
}
```

---

### Step 2: Zanzibar-Style ReBAC Schema (OpenFGA / SpiceDB)

Model complex collaborative hierarchies where permissions flow naturally through organizational parent-child relationships.

```dsl
// schema.fga
model
  schema 1.1

type user

type organization
  relations
    define admin: [user]
    define member: [user] or admin

type workspace
  relations
    define parent_org: [organization]
    define owner: [user]
    define member: [user] or owner or member from parent_org

type document
  relations
    define parent_workspace: [workspace]
    define viewer: [user] or viewer from parent_workspace or member from parent_workspace
    define editor: [user] or owner from parent_workspace
    define can_read: viewer or editor
    define can_edit: editor
```

---

### Step 3: Just-In-Time (JIT) Ephemeral Cloud IAM Session Broker

Eliminate standing admin privileges. Engineers request access via Slack; upon approval, a temporary AWS STS session with an explicit 1-hour expiration is provisioned with zero permanent credentials stored on local machines.

```typescript
// iam/jitSessionBroker.ts
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import crypto from 'node:crypto';

const sts = new STSClient({ region: 'us-east-1' });

export interface JitAccessRequest {
  engineerEmail: string;
  jiraTicketId: string;
  targetRoleArn: string;
  durationSeconds: number; // Max 3600 (1 hour)
  approverEmail: string;
}

export async function issueJitCredentials(request: JitAccessRequest) {
  // 1. Enforce strict duration bounds
  const boundedDuration = Math.min(Math.max(request.durationSeconds, 900), 3600);

  // 2. Build unique audited session name
  const sessionName = `JIT-${request.jiraTicketId}-${crypto.randomBytes(4).toString('hex')}`;

  // 3. Assume privileged role with ephemeral session tags for CloudTrail auditing
  const command = new AssumeRoleCommand({
    RoleArn: request.targetRoleArn,
    RoleSessionName: sessionName,
    DurationSeconds: boundedDuration,
    Tags: [
      { Key: 'Requestor', Value: request.engineerEmail },
      { Key: 'ApprovedBy', Value: request.approverEmail },
      { Key: 'JiraTicket', Value: request.jiraTicketId }
    ]
  });

  const response = await sts.send(command);

  if (!response.Credentials) {
    throw new Error('Failed to generate ephemeral STS credentials');
  }

  // 4. Return temporary credentials valid exclusively for the granted window
  return {
    accessKeyId: response.Credentials.AccessKeyId,
    secretAccessKey: response.Credentials.SecretAccessKey,
    sessionToken: response.Credentials.SessionToken,
    expiresAt: response.Credentials.Expiration
  };
}
```

---

## 📋 Security Quality Checklist

- [ ] **No Standing Wildcard Permissions**: Cloud IAM policies eliminate `Action: "*"` and `Resource: "*"`.
- [ ] **Decoupled Authorization Engine**: Fine-grained business logic uses Open Policy Agent (OPA/Rego) or OpenFGA/SpiceDB ReBAC.
- [ ] **Strict Tenant Scoping**: Every access evaluation enforces subject tenant equals resource tenant prior to permission checks.
- [ ] **Ephemeral JIT Access**: Production database and cloud admin access is provisioned dynamically with maximum 1-hour TTLs.
- [ ] **Workload Identity (SPIFFE/IRSA)**: Kubernetes workloads authenticate to cloud resources using dynamic OpenID Connect service account tokens rather than long-lived API keys.
- [ ] **Audited Session Tags**: Cloud IAM assume-role commands attach mandatory tags identifying the human requestor, approver, and ticket reference.
