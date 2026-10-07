const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'skills.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.version = '11.0.0';
data.description = 'Comprehensive suite of 110 production AI agent skills modeling an entire technology organization, Super Expert Full-Stack Developer, Principal Cybersecurity Architect, Mobile Application Engineer, Software Design Authority (SDA), Professional QA/SDET Test Architect, Principal Anti-Slop Code Simplifier, and AI Agent Token Optimization Specialist: spanning executive strategy, UXR, full-stack type safety, microservices, mobile, zero-trust security, ISTQB testing, anti-slop code de-bloating, KV-cache prompt caching, AST repository mapping, tool distillation, trajectory compaction, frugal model cascades, compact tool schemas, scoped diff context, semantic hybrid RAG, attention hygiene, and GenAI cost governance.';

// Track U: AI Agent Token Optimization, Context Compression & Token Economics
const trackU = {
  id: 'track-ai-agent-token-optimization',
  name: 'Track U: AI Agent Token Optimization, Context Compression & Token Economics',
  skills: [
    '101-prompt-caching-and-prefix-alignment',
    '102-ast-repository-mapping-and-code-compression',
    '103-tool-output-distillation-and-truncation',
    '104-multi-turn-agent-trajectory-compaction',
    '105-model-cascades-and-frugal-agent-routing',
    '106-schema-minification-and-compact-tool-calling',
    '107-scoped-line-range-and-diff-anchored-context',
    '108-semantic-embedding-rag-and-vector-pre-filtering',
    '109-attention-de-poisoning-and-scratchpad-pruning',
    '110-agent-token-budgeting-and-cost-telemetry'
  ]
};

const existingTrackIdx = data.tracks.findIndex(t => t.id === trackU.id);
if (existingTrackIdx >= 0) {
  data.tracks[existingTrackIdx] = trackU;
} else {
  data.tracks.push(trackU);
}

const newSkills = [
  {
    id: '101-prompt-caching-and-prefix-alignment',
    name: 'prompt-caching-and-prefix-alignment',
    path: 'skills/101-prompt-caching-and-prefix-alignment/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Optimize LLM prompt caching (Anthropic, OpenAI, Gemini), enforce prefix invariance to prevent cache-busting, engineer KV-cache volatility layers, and achieve up to 90% token cost reduction.'
  },
  {
    id: '102-ast-repository-mapping-and-code-compression',
    name: 'ast-repository-mapping-and-code-compression',
    path: 'skills/102-ast-repository-mapping-and-code-compression/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Extract Tree-sitter AST symbol graphs, generate PageRank-ranked repository maps, strip implementation bodies, and compress entire codebases by 90-95% for token-efficient agent context.'
  },
  {
    id: '103-tool-output-distillation-and-truncation',
    name: 'tool-output-distillation-and-truncation',
    path: 'skills/103-tool-output-distillation-and-truncation/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Intercept verbose agent tool outputs (test runners, linter logs, grep results, build dumps), apply intelligent truncation and error-delta distillation, and prevent context window exhaustion.'
  },
  {
    id: '104-multi-turn-agent-trajectory-compaction',
    name: 'multi-turn-agent-trajectory-compaction',
    path: 'skills/104-multi-turn-agent-trajectory-compaction/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Eliminate quadratic O(N^2) multi-turn token explosion through sliding window history pruning, anchored state delta summarization, thought-trail pruning, and episodic compaction.'
  },
  {
    id: '105-model-cascades-and-frugal-agent-routing',
    name: 'model-cascades-and-frugal-agent-routing',
    path: 'skills/105-model-cascades-and-frugal-agent-routing/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Implement tiered model cascades and frugal agent routing (RouteLLM, FrugalGPT), assigning low-cost models (Haiku, Flash) to exploration/git/linting tasks and frontier models (Opus, Sonnet) to complex reasoning.'
  },
  {
    id: '106-schema-minification-and-compact-tool-calling',
    name: 'schema-minification-and-compact-tool-calling',
    path: 'skills/106-schema-minification-and-compact-tool-calling/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Minify LLM tool definitions and function-calling schemas, strip verbose JSON schema bloat, adopt compact TypeScript interfaces (TypeChat), and reduce per-turn tool overhead by up to 70%.'
  },
  {
    id: '107-scoped-line-range-and-diff-anchored-context',
    name: 'scoped-line-range-and-diff-anchored-context',
    path: 'skills/107-scoped-line-range-and-diff-anchored-context/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Enforce scoped line-range reading, extract localized AST node slices, anchor edits to targeted diffs, and eliminate massive multi-thousand-line whole-file context dumps.'
  },
  {
    id: '108-semantic-embedding-rag-and-vector-pre-filtering',
    name: 'semantic-embedding-rag-and-vector-pre-filtering',
    path: 'skills/108-semantic-embedding-rag-and-vector-pre-filtering/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Implement token-capped hybrid code retrieval (BM25 + dense vector embeddings), cross-encoder reranking, and sub-500-token contextual chunk injection to eliminate massive doc dumps.'
  },
  {
    id: '109-attention-de-poisoning-and-scratchpad-pruning',
    name: 'attention-de-poisoning-and-scratchpad-pruning',
    path: 'skills/109-attention-de-poisoning-and-scratchpad-pruning/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Prune historical reasoning scratchpads, strip verbose internal thought traces, eliminate dead conversation branches, and prevent cross-attention degradation and token compounding.'
  },
  {
    id: '110-agent-token-budgeting-and-cost-telemetry',
    name: 'agent-token-budgeting-and-cost-telemetry',
    path: 'skills/110-agent-token-budgeting-and-cost-telemetry/SKILL.md',
    category: 'AI Agent Token Optimization',
    summary: 'Implement per-task token budgets, automated loop circuit breakers, OpenTelemetry GenAI cost telemetry, burn rate alerting, and enterprise LLM spend governance.'
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
