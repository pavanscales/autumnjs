// /autmn-core/scheduler/scheduler.js
// ULTRA-GOD TIER SCHEDULER v1.0
// Lane-based Input → Animation → Render → Background

import { Effect } from '../reactivity/signal.js';

const LANES = {
  INPUT: 3,
  ANIMATION: 2,
  RENDER: 1,
  BACKGROUND: 0
};

let CURRENT_FRAME = performance.now();
let frameScheduled = false;

const queues = {
  [LANES.INPUT]: [],
  [LANES.ANIMATION]: [],
  [LANES.RENDER]: [],
  [LANES.BACKGROUND]: []
};

export function schedule(fn, lane = LANES.BACKGROUND, priority = 0) {
  const task = { fn, lane, priority, _enqueued: false };
  const q = queues[lane];

  if (!task._enqueued) {
    task._enqueued = true;
    q.push(task);
    q.sort((a, b) => b.priority - a.priority);
  }

  requestFlush();
}

function flush() {
  frameScheduled = false;
  CURRENT_FRAME = performance.now();

  for (let lane = LANES.INPUT; lane >= LANES.BACKGROUND; lane--) {
    const q = queues[lane];
    while (q.length) {
      const task = q.shift();
      task._enqueued = false;
      try { task.fn(); } catch (e) { console.error('[Scheduler Task]', e); }
    }
  }
}

// Only schedule flush if nothing is scheduled
function requestFlush() {
  if (!frameScheduled) {
    frameScheduled = true;
    requestAnimationFrame(flush);
  }
}

// Wrappers for clarity
export function scheduleInput(fn, priority = 0) { schedule(fn, LANES.INPUT, priority); }
export function scheduleAnimation(fn, priority = 0) { schedule(fn, LANES.ANIMATION, priority); }
export function scheduleRender(fn, priority = 0) { schedule(fn, LANES.RENDER, priority); }
export function scheduleBackground(fn, priority = 0) { schedule(fn, LANES.BACKGROUND, priority); }

export { LANES };
