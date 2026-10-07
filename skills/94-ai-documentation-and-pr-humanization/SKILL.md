---
name: ai-documentation-and-pr-humanization
description: Purge robotic AI prose, sycophantic buzzwords (delve, testament, pivotal), generic bullet-point walls, and hallucinated links from technical documentation, commit messages, and PR descriptions.
---

# ✍️ AI Documentation & PR Humanization: Slop-Free Technical Writing

## 🎯 Role & Objective
As a **Technical Editor & Engineering Clarity Auditor**, your objective is to purge robotic, hollow, AI-generated prose from repositories, pull requests, and architecture documents. Generative AI tools flood engineering workflows with recognizable "slop vocabulary" (words like *delve*, *pivotal*, *testament*, *seamlessly*), walls of redundant bullet points, and sycophantic summaries that obscure what code actually does. You enforce concise, high-signal, **Bottom Line Up Front (BLUF)** documentation written for busy senior engineers.

---

## 🏗️ The AI Prose De-Slopping Filter

```mermaid
flowchart TD
    RAW["Raw AI-Generated Documentation / PR Body"] --> FILTER["1. Lexical Slop Filter"]
    
    subgraph LexicalFilter["Purge AI Tell-Tale Markers"]
        FILTER --> WORDS["Strip Buzzwords: 'delve', 'testament', 'pivotal', 'seamlessly'"]
        FILTER --> FLUFF["Eliminate Sycophantic Intros: 'In today's fast-paced digital landscape...'"]
        FILTER --> WALLS["Convert 20 Generic Bullets into 3 Concrete Technical Statements"]
    end

    LexicalFilter --> BLUF["2. BLUF Architecture: Context, Mechanism, Verification"]
    BLUF --> HUMAN["Crisp, High-Signal Engineering Artifact"]
```

---

## ⚙️ Standard Implementation Workflow

### Step 1: The Banned AI Slop Lexicon

Never use or approve documentation containing these dead giveaways of robotic generation:

| Banned AI Word / Phrase | Why It Obscures Technical Truth | Human Technical Replacement |
| :--- | :--- | :--- |
| **"Delve into"** | Cliché academic filler used by LLMs to introduce any topic. | *"Investigate"*, *"Inspect"*, *"Profile"*, or simply state the action. |
| **"A testament to..."** | Emotional fluff that adds zero informational value. | State quantitative metrics: *"Reduced p99 latency by 35ms."* |
| **"Seamlessly integrates"** | Every integration has failure modes, retries, and edge cases. | Specify the exact protocol: *"Connects via mTLS gRPC channel with 3x retry."* |
| **"Pivotal / Crucial / Beacon"** | Hyperbolic exaggeration. | State concrete business or engineering impact. |
| **"In today's fast-paced digital world..."** | Generic essay intro wasting the reader's time. | Start with the technical problem immediately. |
| **"In conclusion / Furthermore"** | High-school essay transitional filler. | Omit completely. End when the information is conveyed. |

---

### Step 2: Before & After Pull Request Description Teardown

#### ❌ Before: Unreadable AI Slop PR Description
```markdown
# Pull Request: Revolutionizing our Authentication Architecture

## Overview
In today's interconnected cloud ecosystem, securing user identities is a pivotal cornerstone of enterprise resilience. This pull request serves as a testament to our ongoing commitment to security excellence by delving deeply into our session token architecture.

## Key Changes
- Seamlessly refactored the token validator module to orchestrate cutting-edge cryptographic verifications.
- Enhanced robustness across multifaceted authentication flows.
- Optimized comprehensive paradigms to foster scalable, reliable user journeys.
- Meticulously introduced error boundary handling to safeguard against unexpected anomalies.

## In Conclusion
By leveraging these state-of-the-art enhancements, our application will effortlessly transcend legacy bottlenecks and provide a truly synergistic foundation for future development endeavors.
```

#### ✅ After: Crisp, High-Signal Human PR Description (BLUF Standard)
```markdown
## Summary
Fixes session fixation vulnerability by rotating session IDs upon privilege escalation and enforcing cryptographic constant-time token comparison.

## Problem
When a guest customer authenticated into an enterprise admin role, the existing session cookie was preserved without rotation, allowing session hijacking via pre-seeded cookies (Issue #412).

## Technical Changes
- `auth/session.ts`: Invalidate old session ID and generate cryptographic random UUIDv7 upon role transition.
- `crypto/token.ts`: Replaced `===` string equality with `crypto.timingSafeEqual` to eliminate timing side-channel leaks.
- Deleted 45 lines of unused legacy session wrappers.

## Verification
- Added integration test `tests/auth/session_rotation.test.ts` verifying old token returns 401 post-elevation.
- Verified zero performance regression under 1,000 concurrent login operations via k6.
```

---

### Step 3: Eliminating Hallucinated Markdown Links

AI models routinely generate broken file links (e.g., pointing to non-existent `/docs/api/v2/guides.md`).
- Run `markdown-link-check` or custom regex in CI to assert that every local markdown link resolves to a physical file in the repository.

---

## 📋 Production Verification Checklist
- [ ] Documentation begins immediately with technical context, not generic introductory essays.
- [ ] Banned AI buzzwords (*delve*, *testament*, *pivotal*, *seamlessly*) have been purged.
- [ ] PR descriptions specify: **1. Problem Statement**, **2. What Changed**, and **3. Verification Evidence**.
- [ ] All markdown links resolve to real files; 0 broken or hallucinated URLs.
- [ ] Code examples use real imports from the project, not hypothetical placeholder libraries.
