// /autmn-core/render/renderer.js
// ULTRA-GOD TIER ATOMIC RENDERER v2.1
// DAG-aware, batching-aware, zero-frame-drop renderer
// With adaptive scheduling + GPU integration

import { batch } from '../reactivity/reactive.js';
import { scheduleRender } from '../scheduler/scheduler.js';
import { renderer as gpuRenderer } from './gpu-batcher.js';

let tmpList = []; // reuse buffer to avoid GC thrash

export class Renderer {
  constructor(root = document.body) {
    this.root = root;
    this.queue = new Set();
    this.flushing = false;
  }

  // mark reactive node dirty
  mark(node) {
    if (!node._dirty) {
      node._dirty = true;
      this.queue.add(node);
      this.scheduleFlush();
    }
  }

  flush() {
    if (this.flushing) return;
    this.flushing = true;

    batch(() => {
      if (this.queue.size === 0) {
        this.flushing = false;
        return;
      }

      tmpList.length = 0;
      for (const n of this.queue) tmpList.push(n);
      this.queue.clear();

      if (tmpList.length > 1) {
        tmpList.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      }

      let gpuWork = false;

      for (let i = 0; i < tmpList.length; i++) {
        const node = tmpList[i];
        try {
          if (node._dirty && typeof node.render === 'function') {
            node.render();
            node._dirty = false;
            gpuWork = true;
          }
        } catch (err) {
          console.error('[Renderer Node]', err);
        }
      }

      if (gpuWork) {
        gpuRenderer.flush();
      }
    });

    // release flag in a microtask to prevent re-entrancy starvation
    queueMicrotask(() => {
      this.flushing = false;
      if (this.queue.size > 0) this.scheduleFlush();
    });
  }

  // hybrid scheduler: microtask for state, RAF for visuals
  scheduleFlush() {
    scheduleRender(() => this.flush(), 1);
  }
}

export const renderer = new Renderer(document.body);
