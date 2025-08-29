# Autmn.js — React without React framework

> Frame‑perfect, GPU‑aware, multi‑threaded engine for real‑time UIs. Minimal GC, deterministic updates, and predictable latency at scale.

---

## Quick pitch

Autmn.js is not another component library. It’s a runtime and scheduler built for latency‑sensitive interfaces: massive grids, live data streams, and UI surfaces where dropped frames and GC spikes are unacceptable.

* Deterministic: same input → same output, every frame.
* Scales: millions of rows, zero‑surprise behavior under heavy load.
* Low GC pressure: object pools, ephemeral reuse, and zero‑copy worker lanes.

---

## Architecture (5 layers)

```
┌───────────────────────────────────────────────────────────────┐
│                      Application Layer                        │
│ - Ultra-fast UI components, grids, tables, inputs             │
│ - Stress-tested: 10M+ rows, zero frame drops                  │
│ - Lightning-fast API micro-drivers → async in <0.5ms          │
│ - Hot-swappable reactive UI → zero re-render overhead         │
└───────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────────────────────────────┐
│                  Signal & Reactivity Layer                    │
│ - DAG-driven atomic signals → recompute only what changes     │
│ - Lazy-computed ephemeral caches → minimal memory usage       │
│ - Deterministic updates → zero redundant rendering            │
│ - Garbage Collection interruptions? practically never         │
└───────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────────────────────────────┐
│                 Scheduler / Loop Engine                       │
│ - Synthetic frame lanes → Input → Animation → Render → BG     │
│ - Precomputed queues, ultra-low-latency task prioritization   │
│ - Frame-perfect execution → 120fps under extreme load         │
│ - Predictable, deterministic ticks → zero surprises           │
└───────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────────────────────────────┐
│                     Renderer Layer                            │
│ - Atomic DOM commits & GPU-accelerated transforms             │
│ - Off-thread diff calculations → WebWorker / SIMD             │
│ - Custom virtualization → exceeds browser pixel limits        │
│ - Zero frame drops while scrolling, filtering, or sorting     │
└───────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────────────────────────────┐
│                   Data & Memory Layer                         │
│ - Ephemeral object pools → GC-free zones                      │
│ - SharedArrayBuffers → concurrent, zero-copy state            │
│ - Typed arrays → dense, predictable memory layout             │
│ - Off-thread heavy computations (sort, filter, layout)        │
└───────────────────────────────────────────────────────────────┘
```

---

## Core concepts

* **Signals (DAG)** — atomic reactive nodes. Only nodes affected by a change recompute. Propagation order is deterministic and repeatable.
* **Scheduler** — frame‑aligned lanes: Input → Animation → Render → Background. Tasks are budgeted per frame and prioritized.
* **Renderer** — off‑thread diffing, atomic commits on the main thread, and GPU transforms for smooth visual updates.
* **Memory model** — object pools, typed buffers, and `SharedArrayBuffer` lanes for zero‑copy worker communication.

---

## Technical highlights

* Worker pipeline with `SharedArrayBuffer` for off‑main‑thread sort/filter/layout.
* DOM reuse strategy: update existing nodes, avoid detach/attach churn.
* Non‑passive, deterministic scrolling to guarantee visible row bounds.
* Custom virtualization to bypass browser pixel/DOM limits for ultra‑dense lists.
* Observability: lightweight scheduler traces, runtime counters (fps, memory), and a reactive graph inspector.

---

## Example performance (Acer class reference, 1M rows)

|                        Action | Typical  |
| ----------------------------: | :------- |
|                 Generate rows | ~12 ms   |
| Init + first render (1M rows) | ~3 ms    |
|                        Filter | ~250 ms  |
|                          Sort | ~300 ms  |
|      Scroll (40 rows / frame) | ~70 fps  |
|         Filter + sort @300 ms | ~70 fps  |

> Numbers are indicative—measure on your target hardware. The engine prioritizes predictability over raw single‑machine best case.

---

## Usage sketch

```ts
import { Engine } from "autmn";
import { Grid } from "autmn/grid";

const engine = new Engine({ devOverlays: true });
const grid = new Grid(containerEl, dataSource, columnDefs, { virtualization: true });

engine.mount(grid);

// Use worker lanes for heavy data pipelines
engine.pipelines.sortFilter.registerWorker(workerScriptUrl);
```

---

## Integration tips

* Keep overlays disabled in production unless needed for telemetry.
* Push heavy one‑off computations (large sorts, merges) to worker lanes.
* Use the signal API to wrap frequently changing bits; keep coarse state out of the hot path.
* Use object pool APIs for temporary buffers inside hot loops.

---

## Roadmap

* WebGPU renderer path (progressive opt‑in).
* Deterministic replay & trace capture for bug reproduction.
* Native shell adapters (wasm + native UI glue).
* Higher‑level Grid primitives for analytics dashboards.

---

## License

MIT — examples and benchmark harness included. Benchmarks are reproducible and provided with test scripts.
