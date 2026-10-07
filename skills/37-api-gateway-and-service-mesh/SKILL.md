---
name: api-gateway-and-service-mesh
description: >-
  Use this skill to design edge API gateways and internal service mesh networking architectures.
  It guides North-South traffic routing (Envoy, Kong), East-West microservice communication (Istio, Linkerd),
  edge JWT authentication offloading, zero-trust Mutual TLS (mTLS), canary traffic splitting,
  and gRPC-to-JSON HTTP transcoding.
---

# API Gateway & Service Mesh Architecture Skill

## Overview
This skill guides the AI agent in architecting high-scale network routing topologies for modern microservice and distributed systems. It establishes clear boundaries between North-South edge traffic (API Gateway) and East-West internal service communication (Service Mesh), enforcing edge authentication offloading, canary traffic splitting, and zero-trust Mutual TLS (mTLS).

---

## When to Use This Skill
- Managing incoming public internet traffic across multiple backend services (North-South).
- Securing internal microservice-to-microservice communication with zero-trust mTLS (East-West).
- Implementing edge rate limiting, centralized JWT verification, and SSL termination.
- Orchestrating canary traffic routing and progressive deployment shifts without application changes.

---

## Input Context Required
1. Service catalog, domain boundaries, and public API routes from `03-system-architecture-design` and `05-api-contract-design`.
2. Security requirements (zero-trust, mTLS, WAF, CORS) from `09-security-and-threat-modeling`.
3. Target infrastructure (Kubernetes, AWS EKS, Envoy, Istio, Kong).

---

## Step-by-Step Execution Workflow

### Step 1: North-South vs. East-West Traffic Architecture
Never conflate the edge gateway with the internal service mesh:
```mermaid
flowchart TD
    Internet([Public Internet / Clients]) -->|HTTPS / REST| Gateway[Edge API Gateway (North-South)]

    subgraph ServiceMesh["Internal Service Mesh (East-West Zero-Trust)"]
        Gateway -->|mTLS| ProxyA[Sidecar Envoy A]
        ProxyA --- ServiceA[Order Service]

        ServiceA -->|mTLS| ProxyB[Sidecar Envoy B]
        ProxyB --- ServiceB[Payment Service]

        ServiceA -->|mTLS| ProxyC[Sidecar Envoy C]
        ProxyC --- ServiceC[Inventory Service]
    end
```
- **North-South (Edge API Gateway)**: Public-facing. Focuses on SSL termination, DDoS protection, Web Application Firewall (WAF), edge rate limiting, and authenticating untrusted clients.
- **East-West (Service Mesh)**: Internal cluster communication. Focuses on zero-trust mutual TLS (mTLS), internal service discovery, load balancing, canary traffic shifting, and sidecar observability.

### Step 2: Edge Authentication Offloading (JWT Gateway Pattern)
Relieve internal backend microservices from parsing crypto signatures on every request:
1. Public client sends `Authorization: Bearer <JWT>` to the API Gateway.
2. The Gateway validates the cryptographic signature against the identity provider JWKS (JSON Web Key Set).
3. If valid, the Gateway strips the raw token and forwards trusted internal headers to downstream services:
   - `X-User-Id: usr_9941`
   - `X-Tenant-Id: ten_012`
   - `X-User-Roles: editor,billing-admin`
4. Downstream microservices read trusted headers directly without repeated crypto verification overhead.

### Step 3: Zero-Trust Mutual TLS (mTLS) in Service Mesh
Encrypt and cryptographically authenticate every internal packet:
- Each service pod is injected with an Envoy sidecar proxy.
- Istio / Linkerd control plane issues short-lived X.509 certificates to each sidecar using SPIFFE IDs (e.g., `spiffe://cluster.local/ns/prod/sa/order-service-sa`).
- Proxies automatically establish mTLS with strict mutual authentication, rendering internal network packet sniffing impossible.

### Step 4: Canary Traffic Splitting & Circuit Breaking
Route traffic dynamically at the networking layer without changing application code:
- Shift traffic incrementally: e.g., 90% to `v1` (stable), 10% to `v2` (canary).
- Configure sidecar circuit breaking: Eject failing backend instances automatically if they return 5xx errors for 3 consecutive attempts.

---

## Output Deliverables Template

### 1. Istio VirtualService Canary Routing Spec (`infra/k8s/virtual-service.yaml`)
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: order-service-routes
  namespace: production
spec:
  hosts:
    - "order-service"
  http:
    - route:
        - destination:
            host: order-service
            subset: v1-stable
          weight: 90
        - destination:
            host: order-service
            subset: v2-canary
          weight: 10
      timeout: 3.0s
      retries:
        attempts: 2
        perTryTimeout: 1.0s
        retryOn: "5xx,connect-failure,refused-stream"
```

### 2. Edge Envoy Gateway JWT Auth Policy (`infra/k8s/envoy-jwt-policy.yaml`)
```yaml
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: edge-jwt-auth
  namespace: istio-system
spec:
  selector:
    matchLabels:
      app: istio-ingressgateway
  jwtRules:
    - issuer: "https://auth.enterprise.com/"
      jwksUri: "https://auth.enterprise.com/.well-known/jwks.json"
      forwardOriginalToken: true
```

---

## Quality Checklist & Guardrails
- [ ] Are edge gateway responsibilities clearly separated from internal service mesh tasks?
- [ ] Does the edge gateway validate JWT signatures before forwarding requests internally?
- [ ] Are internal communications secured using automated mTLS with SPIFFE identity?
- [ ] Are timeout and retry policies enforced at the proxy layer with bounded retry caps?
- [ ] Is canary traffic splitting configured with automated health metrics verification?

---

## Companion Skills
- **API Contracts**: `05-api-contract-design`.
- **Zero-Trust Security**: `09-security-and-threat-modeling`.
- **Telemetry Propagation**: `21-observability-and-telemetry`.
