---
name: api-contract-design
description: >-
  Use this skill to design robust, backwards-compatible API contracts across REST,
  OpenAPI 3.1, GraphQL, and gRPC/Protocol Buffers. It guides endpoint structure,
  idempotent mutations, cursor-based pagination, RFC 7807 error responses, schema
  versioning, and contract-first API development.
---

# API Contract & Protocol Design Skill

## Overview
This skill guides the AI agent in establishing robust, contract-first API definitions. High-quality API contracts eliminate ambiguity between client and server teams, guarantee backwards compatibility, enforce uniform error taxonomy, and allow automated code generation and mock testing.

---

## When to Use This Skill
- Designing public or internal APIs for web, mobile, or microservice clients.
- Authoring OpenAPI 3.1 specifications (Swagger), GraphQL schemas, or gRPC Protobuf files.
- Establishing pagination, filtering, sorting, and error response standards.
- Ensuring mutation endpoints are idempotent and safe for retries.

---

## Input Context Required
1. Domain models & aggregates from `02-domain-driven-design`.
2. Communication requirements from `03-system-architecture-design`.
3. Client consumption patterns (latency-sensitive mobile, bulk batch processing, real-time).

---

## Step-by-Step Execution Workflow

### Step 1: Protocol Selection Matrix
Select the protocol tailored to client and networking demands:
- **REST / HTTP/JSON (OpenAPI 3.1)**: Best for public APIs, web frontends, wide interoperability, and standard CDN caching.
- **gRPC / Protocol Buffers**: Best for internal service-to-service communication requiring high throughput, low latency, compact binary serialization, and strict typed contracts.
- **GraphQL**: Best for complex client-driven queries with deeply nested relationships where over-fetching/under-fetching must be avoided.
- **WebSockets / Server-Sent Events (SSE)**: Best for real-time pushing (dashboards, chat, live telemetry).

### Step 2: RESTful URI & Resource Modeling Standards
Follow strict REST conventions:
- Use plural nouns for resources: `/api/v1/orders`, NOT `/api/v1/getOrders`.
- Hierarchy reflects ownership: `/api/v1/orders/{orderId}/items/{itemId}`.
- Actions that do not map to CRUD: Use explicit controller sub-resources: `POST /api/v1/orders/{orderId}/cancel` or `POST /api/v1/checkout/sessions`.
- HTTP Methods:
  - `GET`: Safe, idempotent. No request body.
  - `POST`: Create non-idempotent resource or trigger complex command.
  - `PUT`: Complete idempotent replacement of resource.
  - `PATCH`: Idempotent partial update (e.g., JSON Merge Patch).
  - `DELETE`: Idempotent removal.

### Step 3: Idempotent Mutations Design
For critical mutations (billing, orders, money transfer):
- Require an `Idempotency-Key: <UUIDv4>` header.
- The server checks if the key has been processed within a TTL (e.g., 24h).
- If seen, replay the exact cached response without re-executing side effects.

### Step 4: Pagination, Filtering & Sorting Conventions
Avoid unbounded queries and standard offset pagination on large datasets:
- **Cursor-based Pagination**:
  - Request: `GET /api/v1/orders?limit=20&starting_after=ord_abc123`
  - Response:
    ```json
    {
      "data": [...],
      "pagination": {
        "has_more": true,
        "next_cursor": "ord_xyz789",
        "total_count": 1420
      }
    }
    ```
- **Sorting**: `GET /api/v1/orders?sort=-created_at,amount` (prefix `-` for descending).

### Step 5: RFC 7807 Error Taxonomy
Return standard Problem Details for HTTP APIs:
```json
{
  "type": "https://api.example.com/errors/insufficient-funds",
  "title": "Insufficient Funds",
  "status": 422,
  "detail": "Account balance of $50.00 is insufficient for purchase of $120.00",
  "instance": "/api/v1/orders/ord_123/payments",
  "invalid_params": [
    { "name": "amount", "reason": "Exceeds available balance" }
  ],
  "code": "ERR_INSUFFICIENT_FUNDS",
  "timestamp": "2026-10-07T13:00:00Z"
}
```

---

## Output Deliverables Template

Generate contract specs (e.g., OpenAPI 3.1 YAML snippet):

```yaml
openapi: 3.1.0
info:
  title: Order Processing Service API
  version: 1.0.0
  description: Production API contract for order lifecycle management.
paths:
  /api/v1/orders:
    post:
      summary: Create a new order
      operationId: createOrder
      parameters:
        - name: Idempotency-Key
          in: header
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrderRequest'
      responses:
        '201':
          description: Order created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderResponse'
        '400':
          $ref: '#/components/responses/BadRequestError'
        '422':
          $ref: '#/components/responses/UnprocessableEntityError'

components:
  schemas:
    CreateOrderRequest:
      type: object
      required: [customerId, items]
      properties:
        customerId:
          type: string
          format: uuid
        items:
          type: array
          minItems: 1
          items:
            $ref: '#/components/schemas/OrderItemRequest'
```

---

## Quality Checklist & Guardrails
- [ ] Are all API inputs validated with explicit field types, min/max lengths, and regex constraints?
- [ ] Is cursor-based pagination implemented for high-cardinality collections?
- [ ] Are mutation endpoints protected with idempotency keys?
- [ ] Are error responses unified using RFC 7807 standard schemas?
- [ ] Is API versioning explicit in the URL path (`/api/v1/...`)?

---

## Companion Skills
- **Preceding Step**: `02-domain-driven-design` and `03-system-architecture-design`.
- **Implementation**: `10-clean-architecture-and-solid`.
- **Testing**: `16-integration-and-e2e-testing`.
