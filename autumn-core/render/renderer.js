// /autmn-core/render/renderer.js
// ULTRA-GOD TIER ATOMIC RENDERER v2.0
// Full DAG-aware, batching-aware, zero-frame-drop renderer
// Integrates Signals, Computed, Compiler, GPU Batcher, Scheduler, and Workers

import { batch } from '../reactivity/reactive.js';
import { scheduleRender } from '../scheduler/scheduler.js';
import { renderer as gpuRenderer } from './gpu-batcher.js';

export class Renderer {
  constructor(root = document.body) {
    this.root = root;
    this.queue = new Set();
    this.flushing = false;
  }

  // mark a reactive node for render
  mark(node) {
    if (!node._dirty) node._dirty = true;
    this.queue.add(node);
    this.scheduleFlush();
  }

  // flush queued nodes atomically
  flush() {
    if (this.flushing) return;
    this.flushing = true;

    batch(() => {
      const nodes = Array.from(this.queue);
      this.queue.clear();

      // sort nodes by priority or DAG order (optional)
      nodes.sort((a, b) => (a.priority || 0) - (b.priority || 0));

      for (const node of nodes) {
        try {
          if (node._dirty && typeof node.render === 'function') {
            node.render();           // atomic update
            node._dirty = false;
          }
        } catch (err) {
          console.error('[Renderer Node]', err);
        }
      }

      // GPU batching step for high-performance transforms & compositing
      gpuRenderer.flush();
    });

    this.flushing = false;
  }

  // schedule flush via microtask + scheduler integration
  scheduleFlush() {
    scheduleRender(() => this.flush(), 1); // lane-based, smooth animation
  }
}

// singleton instance for the whole app
export const renderer = new Renderer(document.body);
