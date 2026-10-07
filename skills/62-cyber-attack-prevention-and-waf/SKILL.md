---
name: cyber-attack-prevention-and-waf
description: Layer 3/4 and Layer 7 DDoS mitigation, HTTP/2 Rapid Reset defense, OWASP Core Rule Set WAF configuration, JA4 TLS fingerprinting, and automated bot mitigation.
---

# 🛡️ Cyber Attack Prevention, WAF & DDoS Mitigation

## 🎯 Role & Objective
As a **Principal Cyber Defense Architect**, your mission is to protect enterprise web services and APIs from automated attacks, volumetric DDoS, application-layer exhaustion, exploit payloads (SQLi, XSS, RCE, Path Traversal), and credential-stuffing botnets. You configure Edge Web Application Firewalls (Cloudflare, AWS WAF, Envoy/ModSecurity), enforce TLS/JA4 client fingerprinting, implement behavioral anomaly detection, and design automated tarpits and rate limiters.

---

## ⚡ Attack Taxonomy & Defense Vectors

| Layer | Attack Type | Vector / Mechanism | Active Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **L3 / L4** | **SYN Flood / UDP Amp** | Saturates network bandwidth with forged packets. | Anycast BGP routing, cloud scrubbers (Cloudflare Magic Transit, AWS Shield Advanced), SYN cookies in Linux kernel. |
| **L7** | **HTTP/2 Rapid Reset (CVE-2023-44487)** | Sends bursts of `HEADERS` followed immediately by `RST_STREAM`, exhausting server CPU and memory. | Enforce HTTP/2 stream reset budget: reset limit of 100 resets/sec per connection; terminate TCP connection if exceeded. |
| **L7** | **HTTP Flood / Cache Busters** | High-frequency random URI requests (`/search?q=rnd123`) bypassing CDN cache to exhaust origin DB. | Edge token bucket rate limiting; cryptographic Turnstile/Proof-of-Work (PoW) challenges; dynamic WAF rate limiting rules. |
| **L7** | **Slowloris / Slow POST** | Holds hundreds of HTTP connections open sending 1 byte every 10 seconds. | Minimum data transfer rate enforcement (e.g., min 100 bytes/sec); aggressive connection idle timeouts (5s). |
| **L7** | **Exploit Injections (SQLi, XSS, RCE)** | Query params or request bodies containing `' OR 1=1`, `<script>`, `${jndi:ldap:...}`. | OWASP Core Rule Set (CRS 3.3+) Paranoia Level 2; strict regex matching on body and query params; payload length limits. |
| **L7** | **Credential Stuffing / Brute Force** | Leaked password lists replayed by distributed residential proxies. | JA4 TLS fingerprint correlation; IP reputation databases; strict CAPTCHA / WebAuthn gates on `/auth/v1/token`. |

---

## ⚙️ Standard Implementation Workflow

### Step 1: Mitigate HTTP/2 Rapid Reset & Resource Exhaustion (NGINX / Envoy)

```nginx
# /etc/nginx/conf.d/ddos_hardening.conf

# 1. Limit concurrent streams and set reset thresholds to prevent CVE-2023-44487
http2_max_concurrent_streams 128;
http2_max_field_size 16k;
http2_max_header_size 32k;

# 2. Strict timeout rules against Slowloris and connection exhaustion
client_body_timeout 10s;
client_header_timeout 10s;
send_timeout 10s;
keepalive_timeout 30s;
keepalive_requests 1000;

# 3. Memory-bounded rate limiting zones
# Rate limit per real client IP (10 requests per second, burst 20)
limit_req_zone $binary_remote_addr zone=api_general_limit:20m rate=10r/s;
# Strict rate limit for authentication endpoints (2 requests per second, burst 5)
limit_req_zone $binary_remote_addr zone=api_auth_limit:10m rate=2r/s;

# 4. Limit simultaneous open connections per IP
limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;

server {
    listen 443 ssl http2;
    server_name api.acme.com;

    # Enforce connection concurrency limit
    limit_conn conn_limit_per_ip 50;

    location /api/v1/auth/ {
        limit_req zone=api_auth_limit burst=5 nodelay;
        limit_req_status 429;
        proxy_pass http://auth_backend;
    }

    location / {
        limit_req zone=api_general_limit burst=20 nodelay;
        limit_req_status 429;
        proxy_pass http://api_backend;
    }
}
```

---

### Step 2: Implement JA4 TLS Fingerprint Inspection & Bot Scoring

```typescript
// middleware/ja4BotDefense.ts
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../cache/redis';

// Known malicious automated script fingerprints (e.g., standard python-requests, golang default http client)
const BLOCKED_JA4_FINGERPRINTS = new Set([
  't13d1516h2_8daaf6152771_018247da3075', // Known credential stuffing bot cluster
  't13i0808h1_000000000000_000000000000'  // Automated headless scraper profile
]);

export interface SecurityContextRequest extends Request {
  clientIp: string;
  ja4Fingerprint: string;
  riskScore: number;
}

export function ja4AndAnomalyDefense() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Cloudflare or edge gateway forwards JA4 fingerprint in custom header
    const ja4 = (req.headers['cf-ja4'] || req.headers['x-ja4-fingerprint'] || '') as string;
    const clientIp = (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;

    let riskScore = 0;

    // 1. Direct block on known malicious TLS fingerprints
    if (ja4 && BLOCKED_JA4_FINGERPRINTS.has(ja4)) {
      return res.status(403).json({
        type: 'https://security.acme.com/blocked',
        title: 'Access Denied',
        detail: 'Automated TLS client profile is prohibited from accessing this resource.'
      });
    }

    // 2. Track velocity per JA4 fingerprint across different IPs (detects distributed proxy botnets)
    if (ja4) {
      const windowKey = `ja4:velocity:${ja4}`;
      const requestCount = await redisClient.incr(windowKey);
      if (requestCount === 1) {
        await redisClient.expire(windowKey, 60); // 1-minute window
      }

      if (requestCount > 500) {
        riskScore += 40; // High frequency bot activity across distributed IPs
      }
    }

    // 3. User-Agent / JA4 Mismatch Check
    const userAgent = req.headers['user-agent'] || '';
    const isBrowserUa = /Mozilla\/5\.0.*(Chrome|Safari|Firefox|Edge)/i.test(userAgent);
    const isHttp10 = req.httpVersion === '1.0';

    if (isBrowserUa && isHttp10) {
      // Modern browsers never initiate HTTP/1.0 connections
      riskScore += 60;
    }

    // 4. Action based on accumulated risk score
    if (riskScore >= 70) {
      // Tarpit the attacker: artificially delay response by 5 seconds to tie up bot resources
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return res.status(429).json({
        type: 'https://security.acme.com/anomaly-detected',
        title: 'Too Many Requests',
        detail: 'Behavioral anomalies detected. Request blocked.'
      });
    }

    next();
  };
}
```

---

### Step 3: Declarative Cloudflare / AWS WAF Ruleset (Terraform)

```hcl
# main.tf - AWS WAFv2 WebACL with OWASP Core Rules & Rate Limiting
resource "aws_wafv2_web_acl" "production_waf" {
  name        = "production-core-waf"
  scope       = "REGIONAL"
  description = "Production WAF guarding against OWASP Top 10, botnets, and L7 floods"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "ProductionCoreWaf"
    sampled_requests_enabled   = true
  }

  # Rule 1: IP Rate Limiting (Block IPs exceeding 300 requests in 5 minutes)
  rule {
    name     = "RateLimitPerIP"
    priority = 1

    action {
      block {
        custom_response {
          response_code = 429
        }
      }
    }

    statement {
      rate_based_statement {
        limit              = 300
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitPerIPMetric"
      sampled_requests_enabled   = true
    }
  }

  # Rule 2: AWS Managed OWASP Core Rule Set (CRS)
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # Rule 3: Known Bad Inputs / SQL Injection Rule Set
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesSQLiRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }
}
```

---

## 📋 Security Quality Checklist

- [ ] **HTTP/2 Rapid Reset Mitigated**: Reverse proxy terminates connections exceeding 100 resets/sec per connection.
- [ ] **Slowloris Mitigated**: Explicit 10s header/body timeouts and minimum transfer rate thresholds enforced.
- [ ] **WAF Core Rules Active**: Managed OWASP Core Rule Set (CRS 3.3+) active in blocking mode with CloudWatch/Datadog alerting.
- [ ] **JA4 Fingerprint Defense**: Edge TLS fingerprint inspected to block headless scraping bots and proxy rotation clusters.
- [ ] **Sliding Window Rate Limiter**: Redis or WAF rate limiter enforces strict bounds per IP and per API key with HTTP 429 Retry-After headers.
- [ ] **Tarpit / Delay Defense**: High-risk anomaly requests held for 3–5 seconds before rejection to deplete botnet worker pools.
