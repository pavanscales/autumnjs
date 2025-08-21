// /autmn-core/scheduler/synthetic-loop.js
// ULTRA-OPTIMIZED SYNTHETIC EVENT LOOP
// Lane-based Input → Animation → Render → Background
// Zero frame drops, minimal allocations, ultra-fast

import { scheduleBackground } from './scheduler.js';

class SyntheticLoop {
  constructor() {
    this.tasks = [ [], [], [], [] ]; // lanes: 0-input,1-anim,2-render,3-bg
    this.running = false;
    this.lastTime = performance.now();
  }

  // lane: 0=input,1=animation,2=render,3=background
  enqueue(lane, fn) {
    const q = this.tasks[lane];
    q.push(fn);
    if (!this.running) this._start();
  }

  _start() {
    this.running = true;
    requestAnimationFrame(this._loop.bind(this));
  }

  _loop(timestamp) {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // flush lanes in priority order
    for (let lane = 0; lane < 3; lane++) this._flush(this.tasks[lane]);

    // background async
    const bgTasks = this.tasks[3];
    if (bgTasks.length) scheduleBackground(() => this._flush(bgTasks));

    requestAnimationFrame(this._loop.bind(this));
  }

  _flush(queue) {
    let fn;
    while (fn = queue.shift()) {
      try { fn(); } catch(e) { console.error(e); }
    }
  }

  // helpers
  input(fn) { this.enqueue(0, fn); }
  animation(fn) { this.enqueue(1, fn); }
  render(fn) { this.enqueue(2, fn); }
  background(fn) { this.enqueue(3, fn); }
}

export const syntheticLoop = new SyntheticLoop();
