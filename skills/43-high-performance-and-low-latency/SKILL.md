---
name: high-performance-and-low-latency
description: >-
  Use this skill to optimize software for ultra-low latency, high throughput, and hardware efficiency (Mechanical Sympathy).
  It guides CPU cache line optimization (spatial/temporal locality, false sharing prevention), zero-copy I/O (io_uring, sendfile),
  memory allocation elimination (object pooling, off-heap memory), branch prediction optimization, and SIMD vectorization.
---

# High-Performance & Low-Latency Systems Skill

## Overview
This skill guides the AI agent in operating as a Principal Systems Performance Engineer. It applies **Mechanical Sympathy**—designing algorithms and software that work in harmony with the underlying computer hardware. By optimizing for CPU cache lines, eliminating False Sharing, utilizing zero-copy I/O (`io_uring`), minimizing garbage collection pressure, and vectorizing loops (SIMD), software achieves sub-millisecond p99 latencies.

---

## When to Use This Skill
- Building high-frequency trading (HFT) platforms, real-time gaming engines, or telemetry ingestion hubs.
- Eliminating p99/p99.9 tail latency spikes caused by Garbage Collection (GC) pauses or page faults.
- Optimizing CPU-bound workloads via SIMD and cache-friendly memory layouts.
- Squeezing maximum throughput out of network sockets using zero-copy Linux syscalls.

---

## Input Context Required
1. Latency targets: p99 and p99.9 target budgets (e.g., p99 $< 50\mu\text{s}$, or $< 5\text{ms}$).
2. Hardware profile: CPU architecture (x86_64, ARM64/Graviton), L1/L2/L3 cache sizes, NUMA nodes.
3. Execution runtime (C++, Rust, Go, Java with ZGC/Shenandoah, Zig).

---

## Step-by-Step Execution Workflow

### Step 1: Mechanical Sympathy & CPU Cache Hierarchy
Modern CPUs do not fetch single bytes from RAM; they fetch **64-byte Cache Lines**:
- **Spatial Locality**: If you access byte $X$, the CPU pre-fetches the entire 64-byte line into L1 cache. Keep sequentially accessed data contiguous in memory!
- **Data Structure Layout (AoS vs. SoA)**:
  - **Array of Structs (AoS)**: `[ {x, y, z, id, name}, {x, y, z, id, name} ]`. (Wastes cache space if an algorithm only processes coordinates `x, y`).
  - **Struct of Arrays (SoA)**: `{ x: [...], y: [...], z: [...] }`. Allows loading hundreds of coordinates into cache without loading extraneous fields!

### Step 2: Eliminating False Sharing Across Cores
When two threads on separate CPU cores modify distinct variables that happen to reside on the same 64-byte cache line:
- The CPU hardware cache coherency protocol (MESI) constantly invalidates the cache line across cores, tanking throughput by $50\times$!
- *Fix*: Pad concurrent variables with 64 bytes of alignment:
  ```rust
  #[repr(align(64))]
  pub struct ThreadCounter {
      pub count: std::sync::atomic::AtomicU64,
  }
  ```

### Step 3: Zero-Copy Networking & Asynchronous I/O (`io_uring`)
Traditional network copying wastes massive CPU cycles moving bytes:
`Disk -> OS Page Cache -> User Space Buffer -> Socket Buffer -> NIC`.
- **`sendfile(2)`**: Transfers file descriptors directly in kernel space without copying to user-space memory.
- **Linux `io_uring`**:
  - Replaces traditional blocking syscalls with two lock-free ring buffers shared between kernel and user space:
    1. **Submission Queue (SQ)**: Application submits I/O requests without a context switch.
    2. **Completion Queue (CQ)**: Kernel notifies application of completed reads/writes.
  - Eliminates syscall context switch overhead, achieving millions of IOPS per core.

### Step 4: Garbage Collection (GC) Elimination & Allocation Discipline
In managed languages (Java, Go, C#), GC pauses are the primary cause of p99 tail latency spikes:
- **Zero-Allocation Hot Paths**: The inner execution loop must allocate **zero** heap objects.
- **Object Pooling**: Pre-allocate and reuse byte buffers, request objects, and packet frames using ring buffers (e.g., LMAX Disruptor pattern).
- **Off-Heap Memory**: Store large caching structures in direct memory / shared memory (`mmap`) outside the GC-scanned heap.

### Step 5: Branch Prediction & Vectorization (SIMD)
- **Branch Elimination**: Replace unpredictable conditional branches (`if (x > y)`) in tight loops with branchless bitwise operations or `cmov` instructions.
- **SIMD (Single Instruction Multiple Data)**: Use AVX-512 or ARM NEON instructions to execute arithmetic operations across 8 or 16 numbers in a single CPU cycle.

---

## Output Deliverables Template

Generate low-latency ring buffer snippet (Rust / Systems Engineering):

```rust
// Lock-free Cache-Padded Ring Buffer Slot (Eliminating False Sharing)
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

// Force 64-byte cache line alignment to prevent MESI bus invalidation
#[repr(align(64))]
pub struct CachePaddedSlot<T> {
    pub sequence: AtomicU64,
    pub is_ready: AtomicBool,
    pub data: Option<T>,
}

impl<T> CachePaddedSlot<T> {
    pub fn new(initial_seq: u64) -> Self {
        Self {
            sequence: AtomicU64::new(initial_seq),
            is_ready: AtomicBool::new(false),
            data: None,
        }
    }

    #[inline(always)]
    pub fn write_payload(&mut self, payload: T, next_seq: u64) {
        self.data = Some(payload);
        self.is_ready.store(true, Ordering::Release);
        self.sequence.store(next_seq, Ordering::Release);
    }
}
```

---

## Quality Checklist & Guardrails
- [ ] Are variables accessed concurrently across cores padded to 64-byte boundaries (False Sharing eliminated)?
- [ ] Are inner hot paths free from dynamic heap memory allocations?
- [ ] Are sequential data sets structured using Struct-of-Arrays (SoA) for cache line density?
- [ ] Is disk and network I/O executed using zero-copy syscalls (`io_uring` or `sendfile`)?
- [ ] Has tail latency been verified on p99 and p99.9 distributions (not misleading averages)?

---

## Companion Skills
- **Storage Engines**: `42-database-internals-and-storage-engines`.
- **Load Profiling**: `17-performance-and-load-testing`.
- **Concurrency**: `13-concurrency-and-async-systems`.
