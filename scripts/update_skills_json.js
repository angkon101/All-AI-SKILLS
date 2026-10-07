const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'skills.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.version = '10.0.0';
data.description = 'Comprehensive suite of 100 production AI agent skills modeling an entire technology organization, Super Expert Full-Stack Developer, Principal Cybersecurity Architect, Mobile Application Engineer, Software Design Authority (SDA), Professional QA/SDET Test Architect, and Principal Anti-Slop Code Simplifier: spanning executive strategy, UXR, full-stack type safety, microservices, mobile, zero-trust security, ISTQB testing, and ruthless elimination of AI code slop, phantom dependencies, mock theater, and vibe-coding technical debt.';

// Track T: AI Slop Removal, Code De-Bloating & LLM Output Sanitization
const trackT = {
  id: 'track-ai-slop-removal-and-code-sanitization',
  name: 'Track T: AI Slop Removal, Code De-Bloating & LLM Output Sanitization',
  skills: [
    '91-ai-code-deslopping-and-simplification',
    '92-hallucinated-dependency-and-phantom-api-auditing',
    '93-ai-test-deslopping-and-assertion-hardening',
    '94-ai-documentation-and-pr-humanization',
    '95-anti-slop-linter-rules-and-ast-guardrails',
    '96-context-window-pruning-and-token-diet',
    '97-synthetic-data-cleaning-and-model-collapse-prevention',
    '98-ai-code-smell-detection-and-deodorizing',
    '99-insecure-ai-defaults-and-exploit-remediation',
    '100-vibe-coding-remediation-and-technical-debt-recovery'
  ]
};

const existingTrackIdx = data.tracks.findIndex(t => t.id === trackT.id);
if (existingTrackIdx >= 0) {
  data.tracks[existingTrackIdx] = trackT;
} else {
  data.tracks.push(trackT);
}

const newSkills = [
  {
    id: '91-ai-code-deslopping-and-simplification',
    name: 'ai-code-deslopping-and-simplification',
    path: 'skills/91-ai-code-deslopping-and-simplification/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Eliminate AI code slop, strip redundant wrappers, eradicate patronizing comments, eliminate unnecessary defensive null-checks, and refactor bloated LLM code into dense, idiomatic engineering.'
  },
  {
    id: '92-hallucinated-dependency-and-phantom-api-auditing',
    name: 'hallucinated-dependency-and-phantom-api-auditing',
    path: 'skills/92-hallucinated-dependency-and-phantom-api-auditing/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Detect and eradicate AI-hallucinated dependencies on npm and PyPI, eliminate phantom library methods, audit deprecated API calls, and protect against AI package hallucination supply-chain attacks.'
  },
  {
    id: '93-ai-test-deslopping-and-assertion-hardening',
    name: 'ai-test-deslopping-and-assertion-hardening',
    path: 'skills/93-ai-test-deslopping-and-assertion-hardening/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Eliminate AI mock theater and tautological tests, replace shallow assertions (toBeDefined) with state-verifying contracts, and harden test suites against false-positive AI test passes.'
  },
  {
    id: '94-ai-documentation-and-pr-humanization',
    name: 'ai-documentation-and-pr-humanization',
    path: 'skills/94-ai-documentation-and-pr-humanization/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Purge robotic AI prose, sycophantic buzzwords (delve, testament, pivotal), generic bullet-point walls, and hallucinated links from technical documentation, commit messages, and PR descriptions.'
  },
  {
    id: '95-anti-slop-linter-rules-and-ast-guardrails',
    name: 'anti-slop-linter-rules-and-ast-guardrails',
    path: 'skills/95-anti-slop-linter-rules-and-ast-guardrails/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Automated anti-slop linter rules, AST guardrails with ESLint, Biome, and Semgrep, comment density limits, complexity budgets, and copy-paste duplication blocking in CI.'
  },
  {
    id: '96-context-window-pruning-and-token-diet',
    name: 'context-window-pruning-and-token-diet',
    path: 'skills/96-context-window-pruning-and-token-diet/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Agent context window engineering, token diet strategies, system prompt compression, preventing context poisoning, and optimizing LLM prompt caching efficiency.'
  },
  {
    id: '97-synthetic-data-cleaning-and-model-collapse-prevention',
    name: 'synthetic-data-cleaning-and-model-collapse-prevention',
    path: 'skills/97-synthetic-data-cleaning-and-model-collapse-prevention/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Clean synthetic datasets, detect and purge recursive AI-generated content, prevent downstream model collapse, eliminate synthetic hallucinations, and apply MinHash LSH deduplication.'
  },
  {
    id: '98-ai-code-smell-detection-and-deodorizing',
    name: 'ai-code-smell-detection-and-deodorizing',
    path: 'skills/98-ai-code-smell-detection-and-deodorizing/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Detect and deodorize distinct AI code smells, eliminate zombie parameters, consolidate amnesiac reinvented helpers, fix placebo retries, and purge hallucinated configuration flags.'
  },
  {
    id: '99-insecure-ai-defaults-and-exploit-remediation',
    name: 'insecure-ai-defaults-and-exploit-remediation',
    path: 'skills/99-insecure-ai-defaults-and-exploit-remediation/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Remediate insecure AI code defaults, eliminate SQL injection in LLM raw queries, remove hardcoded fallback secrets, fix permissive CORS wildcard bypasses, and prevent ReDoS vulnerabilities.'
  },
  {
    id: '100-vibe-coding-remediation-and-technical-debt-recovery',
    name: 'vibe-coding-remediation-and-technical-debt-recovery',
    path: 'skills/100-vibe-coding-remediation-and-technical-debt-recovery/SKILL.md',
    category: 'AI Slop Removal & Sanitization',
    summary: 'Systematic technical debt recovery and architectural rehabilitation for vibe-coded codebases, reverse-engineering un-architected code, untyped state recovery, and characterization test safety nets.'
  }
];

for (const skill of newSkills) {
  const existingIdx = data.skills.findIndex(s => s.id === skill.id);
  if (existingIdx >= 0) {
    data.skills[existingIdx] = skill;
  } else {
    data.skills.push(skill);
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
console.log(`Successfully updated skills.json: ${data.tracks.length} tracks, ${data.skills.length} skills`);

// Also update docs/skills-data.js
const docsDataPath = path.join(__dirname, '..', 'docs', 'skills-data.js');
const jsContent = 'window.SKILLS_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(docsDataPath, jsContent);
console.log('Successfully updated docs/skills-data.js');
