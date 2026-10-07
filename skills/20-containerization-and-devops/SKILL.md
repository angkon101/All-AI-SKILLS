---
name: containerization-and-devops
description: >-
  Use this skill to build secure, production-grade Docker containers and automated CI/CD pipelines.
  It guides multi-stage Docker builds, layer caching, non-root container security, Docker Compose
  for local multi-service environments, GitHub Actions workflows (lint, test, build, push),
  and Blue-Green / Canary deployment strategies.
---

# Containerization & CI/CD DevOps Skill

## Overview
This skill guides the AI agent in packaging software applications into lean, hardened, and reproducible container images and orchestrating automated CI/CD deployment pipelines. It enforces container security best practices, optimizes build cache performance, and ensures seamless continuous delivery.

---

## When to Use This Skill
- Writing or optimizing Dockerfiles for production services.
- Creating `docker-compose.yml` for unified local developer environments.
- Setting up GitHub Actions or GitLab CI automated build and test pipelines.
- Configuring deployment strategies (Rolling updates, Canary releases, Blue-Green deployments).

---

## Input Context Required
1. Application runtime, language version, and package manager.
2. Required backing services (e.g., PostgreSQL, Redis, Kafka) for local dev composition.
3. Target deployment platform (Kubernetes, AWS ECS, Google Cloud Run, Docker Swarm).

---

## Step-by-Step Execution Workflow

### Step 1: Multi-Stage Production Dockerfile Architecture
Eliminate build tools, compilers, and source files from the final production container:
1. **Stage 1 (Builder)**: Install full development dependencies, copy source, compile binaries/transpile assets.
2. **Stage 2 (Runner)**: Use a minimal base image (Alpine or Google Distroless). Copy *only* the compiled artifacts and production dependencies.
3. **Layer Caching Optimization**: Copy dependency lockfiles (`package.json`, `pnpm-lock.yaml`, `go.mod`, `requirements.txt`) *first*, run install, and only then copy application source code.
4. **Security Hardening**:
   - Run as an unprivileged non-root user (`USER node` or `USER 10001`).
   - Remove shell utilities in distroless containers to eliminate post-exploitation tools.
   - Enforce read-only root filesystems where possible.

### Step 2: Docker Compose for Local Development
Construct a self-contained local developer environment:
- Provision application service + database + cache + message queues.
- Use named volumes for database persistence across container restarts.
- Define `healthcheck` directives with `depends_on: condition: service_healthy` so application containers wait until the database is ready.

### Step 3: Production-Ready GitHub Actions CI Pipeline
Construct automated workflow triggered on pull requests and pushes to `main`:
1. **Lint & Formatting Check**: Fail immediately if style guides or types fail (`tsc --noEmit`).
2. **Automated Test Matrix**: Run unit and integration tests.
3. **Security Vulnerability Audit**: Scan dependencies for CVEs (`npm audit`, `trivy`, `snyk`).
4. **Container Image Build & Attestation**: Build multi-platform image with GitHub Actions cache (`type=gha`), sign image with Cosign.

### Step 4: Zero-Downtime Deployment Strategies
- **Rolling Update**: Incrementally replace older version pods with new ones. Standard K8s deployment.
- **Blue-Green Deployment**: Spin up complete new environment ("Green"), run smoke tests, then switch router/load balancer instantly. Instant rollback capability.
- **Canary Release**: Route 5% of production traffic to new version; monitor error rates and latency before gradually ramping to 100%.

---

## Output Deliverables Template

### 1. Production Hardened Multi-Stage Dockerfile
```dockerfile
# syntax=docker/dockerfile:1.4

# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Enable layer caching for dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build
RUN npm prune --production

# Stage 2: Production Minimal Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Run as non-root user
USER node

# Copy only production artifacts
COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "dist/main.js"]
```

### 2. GitHub Actions CI Workflow (`.github/workflows/ci.yml`)
```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Type Check & Lint
        run: |
          npm run typecheck
          npm run lint

      - name: Run Test Suite
        run: npm run test:coverage

      - name: Docker Build Test
        run: docker build -t app:test .
```

---

## Quality Checklist & Guardrails
- [ ] Does the final Docker image run under a non-root user?
- [ ] Are development tools, compilers, and test suites excluded from the final image?
- [ ] Is layer caching optimized by isolating dependency manifests?
- [ ] Is a reliable `HEALTHCHECK` defined for container orchestrators?
- [ ] Does CI run all automated lint, test, and type checks before deployment?

---

## Companion Skills
- **Testing Prerequisite**: `15-test-driven-development` and `16-integration-and-e2e-testing`.
- **Accompanying Telemetry**: `21-observability-and-telemetry`.
- **Infrastructure Provisioning**: Deployable to any standard cloud environment.
