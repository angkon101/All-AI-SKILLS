---
name: llm-and-rag-system-architecture
description: >-
  Use this skill to design production-grade Large Language Model (LLM) and Retrieval-Augmented Generation (RAG) systems.
  It guides semantic chunking, embedding generation, vector indexing (HNSW/IVFFlat), hybrid dense-sparse search,
  Cross-Encoder reranking, context window management, hallucination mitigation guardrails, and RAG evaluation (Ragas/TruLens).
---

# LLM & Retrieval-Augmented Generation (RAG) Architecture Skill

## Overview
This skill guides the AI agent in engineering production-grade LLM applications and Retrieval-Augmented Generation (RAG) architectures. It moves beyond toy prototypes by implementing hybrid retrieval (dense vector embeddings + sparse BM25 keyword search), Cross-Encoder reranking, semantic document chunking, hallucination guardrails, and automated evaluation frameworks (Ragas).

---

## When to Use This Skill
- Designing or implementing document question-answering, semantic search, or enterprise knowledge bases.
- Architecting RAG pipelines using vector databases (pgvector, Pinecone, Qdrant, Milvus).
- Mitigating LLM hallucinations, prompt injection, and context-window truncation.
- Evaluating retrieval quality and answer faithfulness using quantitative metrics.

---

## Input Context Required
1. Knowledge corpus characteristics (PDFs, Markdown docs, tabular databases, codebases).
2. Latency and cost budgets (e.g., p95 query latency < 1.5s, max cost $0.01 per query).
3. Target LLM and embedding providers (OpenAI, Anthropic, Gemini, local HuggingFace/Ollama models).

---

## Step-by-Step Execution Workflow

### Step 1: Ingestion & Semantic Chunking Strategy
Never use naive fixed-character chunking (e.g., splitting every 500 characters, which slices sentences in half).
Apply content-aware semantic chunking:
1. **Document Structure Chunking**: Split by Markdown headers (`#`, `##`), HTML tags, or code AST function boundaries.
2. **Chunk Size & Overlap**:
   - Optimal chunk size: 300 to 500 tokens (provides focused semantics for embeddings).
   - Overlap: 10% to 15% (50 tokens) to preserve context across chunk boundaries.
3. **Metadata Enrichment**: Attach rich metadata to every chunk: `doc_id`, `section_title`, `created_at`, `access_roles` (for RBAC filtering), and `parent_doc_summary`.

### Step 2: Vector Indexing & Hybrid Retrieval
Combine dense and sparse search to achieve high recall across both conceptual meanings and exact keyword matches:
- **Dense Embeddings**: Models like `text-embedding-3-small`, `bge-large-en-v1.5`. Excellent for conceptual meaning and synonyms.
- **Sparse Search (BM25 / Full-Text Search)**: Excellent for part numbers, acronyms, specific IDs, and exact nomenclature.
- **Reciprocal Rank Fusion (RRF)**:
  $$\text{RRF Score}(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$
  *(Combines dense and sparse ranks with smoothing factor $k \approx 60$).*

### Step 3: Two-Stage Retrieval with Cross-Encoder Reranking
High recall at stage 1; high precision at stage 2:
1. **Stage 1 (Fast Retrieval)**: Retrieve top 25-50 candidate chunks using Hybrid Search in vector DB (<30ms).
2. **Stage 2 (Reranking)**: Pass `(query, chunk)` pairs through a Cross-Encoder reranker (e.g., `bge-reranker-large`, Cohere Rerank) to score semantic relevance.
3. Select only the top 3-5 highest-scoring chunks to send into the LLM prompt.

### Step 4: Context Window Construction & Hallucination Mitigation
1. **Prompt Structure (Lost-in-the-Middle Defense)**:
   - Place most critical context chunks at the *very beginning* and *very end* of the context window.
   - Instruct the LLM strictly: *"Answer the question based SOLELY on the provided context. If the context does not contain the answer, state: 'The provided documentation does not contain this information.' Never speculate."*
2. **Chain of Thought & Citation Grounding**:
   - Require the model to quote exact context snippet IDs in its generated answer (`[Source: doc_chunk_42]`).

### Step 5: Automated Evaluation Framework (Ragas Metrics)
Measure RAG pipeline performance quantitatively using four golden metrics:
- **Faithfulness**: Is the answer derived *only* from the retrieved context (no hallucinations)?
- **Answer Relevance**: Does the answer directly address the user's prompt?
- **Context Precision**: Are the ground-truth relevant chunks ranked at the top?
- **Context Recall**: Did the retrieval stage capture all information needed to answer?

---

## Output Deliverables Template

Generate production RAG query pipeline snippet:

```typescript
// Production Hybrid RAG Pipeline with Reranking and Citations (TypeScript)
import { pgvectorPool } from './db';
import { generateEmbedding, callLLM } from './ai';

interface RetrievedChunk {
  id: string;
  content: string;
  sourceDoc: string;
  score: number;
}

export async function queryRAG(userQuery: string): Promise<{ answer: string; sources: string[] }> {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(userQuery);

  // 2. Execute Hybrid Search (Vector Cosine Distance + Full-Text Search via Postgres pgvector)
  const querySql = `
    WITH vector_matches AS (
      SELECT id, content, source_doc,
             1 - (embedding <=> $1::vector) AS vector_similarity
      FROM document_chunks
      ORDER BY embedding <=> $1::vector
      LIMIT 25
    ),
    text_matches AS (
      SELECT id, content, source_doc,
             ts_rank_cd(to_tsvector('english', content), plainto_tsquery('english', $2)) AS text_rank
      FROM document_chunks
      WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $2)
      LIMIT 25
    )
    SELECT COALESCE(v.id, t.id) AS id,
           COALESCE(v.content, t.content) AS content,
           COALESCE(v.source_doc, t.source_doc) AS source_doc,
           (COALESCE(v.vector_similarity, 0) * 0.7 + COALESCE(t.text_rank, 0) * 0.3) AS combined_score
    FROM vector_matches v
    FULL OUTER JOIN text_matches t ON v.id = t.id
    ORDER BY combined_score DESC
    LIMIT 10;
  `;

  const candidates = await pgvectorPool.query(querySql, [JSON.stringify(queryEmbedding), userQuery]);

  // 3. Select Top Chunks
  const topChunks: RetrievedChunk[] = candidates.rows.slice(0, 4);

  // 4. Construct Grounded Prompt
  const contextBlock = topChunks
    .map((c, idx) => `[Source ${idx + 1} | ${c.sourceDoc}]:\n${c.content}`)
    .join('\n\n');

  const systemPrompt = `You are an expert technical assistant. Answer the user query using ONLY the provided sources. 
Always cite your claims using [Source X]. If the answer cannot be determined from the sources, state that you do not know.`;

  const userPrompt = `Context:\n${contextBlock}\n\nQuestion: ${userQuery}\n\nAnswer:`;

  // 5. Generate Grounded Response
  const response = await callLLM({ systemPrompt, userPrompt, temperature: 0.1 });

  return {
    answer: response.text,
    sources: topChunks.map((c) => c.sourceDoc),
  };
}
```

---

## Quality Checklist & Guardrails
- [ ] Are document chunks split semantically with token overlap (never raw character slicing)?
- [ ] Is Hybrid Search (dense vector + sparse BM25) implemented to catch both synonyms and exact terms?
- [ ] Are top retrieval candidates refined using a Cross-Encoder reranker?
- [ ] Are context chunks tagged with source IDs and required in citations?
- [ ] Does the prompt instruct the LLM to refuse answering if context is insufficient?

---

## Companion Skills
- **Agent Orchestration**: `34-ai-agent-design-and-tool-use`.
- **Database Storage**: `07-database-modeling-and-migrations`.
- **Performance Benchmarking**: `17-performance-and-load-testing`.
