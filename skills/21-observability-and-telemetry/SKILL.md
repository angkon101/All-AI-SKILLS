---
name: observability-and-telemetry
description: >-
  Use this skill to design and implement end-to-end observability across logs, metrics, and traces.
  It guides structured JSON logging with correlation IDs, OpenTelemetry (OTel) distributed tracing,
  Prometheus RED/USE metrics, Kubernetes Liveness/Readiness probes, and SLO/SLI error budget definitions.
---

# Observability & Distributed Telemetry Skill

## Overview
This skill guides the AI agent in instrumenting software systems for full production observability. By uniting structured JSON logs, OpenTelemetry distributed tracing, and Prometheus metrics, systems become introspectable, enabling instant identification of degraded dependencies and latency bottlenecks in high-scale distributed environments.

---

## When to Use This Skill
- Instrumenting a new backend application or microservice for production operations.
- Tracing requests across multiple asynchronous services and queues.
- Standardizing structured logging formats with correlation and request IDs.
- Defining Prometheus metrics, health checks, and SLA/SLO alerting thresholds.

---

## Input Context Required
1. System architecture and network boundaries from `03-system-architecture-design`.
2. Communication protocols (HTTP, gRPC, Kafka) from `05-api-contract-design` and `06-event-and-messaging-design`.
3. Telemetry infrastructure (OpenTelemetry Collector, Prometheus, Grafana, Datadog).

---

## Step-by-Step Execution Workflow

### Step 1: Structured JSON Logging Standards
Never emit unstructured plaintext logs (e.g., `console.log("Error occurred: " + err)`).
Enforce machine-readable JSON logs (Pino, Zap, Winston, structlog):
- **Core Fields Required in Every Log Line**:
  - `timestamp`: ISO-8601 UTC.
  - `level`: `debug`, `info`, `warn`, `error`, `fatal`.
  - `message`: Clear, static message template (avoid dynamic strings in message field).
  - `trace_id`: Distributed trace identifier (W3C standard).
  - `span_id`: Span identifier.
  - `request_id`: Client or gateway correlation ID.
  - `service_name`: Identifier of the reporting service.
  - `context`: Structured key-value metadata object (e.g., `{ order_id: '123', user_id: '456' }`).
- **PII Scrubbing**: Automatically mask passwords, credit card numbers, auth tokens, and social security numbers.

### Step 2: The RED & USE Metrics Models
Instrument metrics adhering to industry standards:
1. **The RED Method (For Request-Driven Services)**:
   - **Rate**: Requests per second (`http_requests_total` counter).
   - **Errors**: Number of failed requests (`http_requests_total{status=~"5.."}`).
   - **Duration**: Latency distribution histogram (`http_request_duration_seconds_bucket`).
2. **The USE Method (For Internal Hardware/Software Resources)**:
   - **Utilization**: Percentage of time resource was busy (CPU, memory, disk).
   - **Saturation**: Degree to which work is queued (Queue depth, thread pool wait queue).
   - **Errors**: Hardware or driver errors.

### Step 3: OpenTelemetry Distributed Tracing (OTel)
Implement end-to-end context propagation across boundaries:
- Ingest and forward the W3C `traceparent` header across all outgoing HTTP, gRPC, and messaging calls.
- Wrap external database queries, cache lookups, and third-party API calls in distinct spans.
- Attach semantic attributes: `http.method`, `http.status_code`, `db.system`, `db.statement`.

### Step 4: Health Check Probes (Kubernetes Triad)
Separate health probes cleanly:
1. **`/health/startup`**: Returns 200 once initialization tasks (loading config, warm caches) are done.
2. **`/health/liveness`**: Returns 200 if process is alive and not deadlocked. (Do NOT check downstream DB here! If DB goes down, killing all web app instances will cause a cascading restart storm).
3. **`/health/readiness`**: Returns 200 if service can accept traffic (verifies DB connection pool and cache reachability).

---

## Output Deliverables Template

Generate telemetry middleware and instrumentation snippet:

```typescript
// OpenTelemetry and Structured Context Middleware (Fastify / Express)
import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export function telemetryMiddleware(req: any, res: any, next: () => void) {
  const currentSpan = trace.getSpan(context.active());
  const traceId = currentSpan?.spanContext().traceId || crypto.randomUUID();
  const spanId = currentSpan?.spanContext().spanId;

  // Bind trace context to request-scoped logger
  req.log = logger.child({
    trace_id: traceId,
    span_id: spanId,
    request_id: req.headers['x-request-id'] || traceId,
    http_method: req.method,
    http_url: req.url,
  });

  const startTime = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    req.log.info(
      {
        status_code: res.statusCode,
        duration_ms: durationMs,
      },
      'HTTP Request Completed'
    );
  });

  next();
}
```

---

## Quality Checklist & Guardrails
- [ ] Are all application logs serialized as structured JSON?
- [ ] Are trace IDs propagated across service boundaries via W3C Trace Context?
- [ ] Is PII automatically masked before persisting logs?
- [ ] Does the liveness probe check only process health without querying external dependencies?
- [ ] Are metrics instrumented for request rate, error rate, and duration (RED)?

---

## Companion Skills
- **Deployment Integration**: `20-containerization-and-devops`.
- **Debugging Operations**: `22-incident-debugging-and-runbooks`.
