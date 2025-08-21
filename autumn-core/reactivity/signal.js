// /autmn-core/reactivity/signal.js
// ULTRA-GOD TIER REACTIVE CORE v3.0
// Atomic signals + DAG + lazy computed + nested batching + memory safe + prioritized effects

let CURRENT_EFFECT = null;
let BATCH_DEPTH = 0;

// ====================
// TASK QUEUE WITH PRIORITY
// ====================
class TaskQueue {
  constructor() {
    this.queue = [];
    this.scheduled = false;
  }

  enqueue(task) {
    if (!task._enqueued) {
      task._enqueued = true;
      this.queue.push(task);
      this._schedule();
    }
  }

  _schedule() {
    if (!this.scheduled && BATCH_DEPTH === 0) {
      this.scheduled = true;
      queueMicrotask(() => this._flush());
    }
  }

  _flush() {
    this.scheduled = false;
    // sort by priority descending
    this.queue.sort((a, b) => b._priority - a._priority);
    const q = this.queue;
    for (let i = 0; i < q.length; i++) {
      const t = q[i];
      t._enqueued = false;
      t._run();
    }
    q.length = 0;
  }
}

const GLOBAL_QUEUE = new TaskQueue();

// ====================
// SIGNAL
// ====================
export class Signal {
  constructor(value) {
    this._value = value;
    this._subs = new Set();
  }

  get() {
    if (CURRENT_EFFECT) CURRENT_EFFECT._track(this);
    return this._value;
  }

  set(next) {
    if (Object.is(this._value, next)) return;
    this._value = next;
    for (const eff of this._subs) eff._markDirty();
  }
}

// ====================
// EFFECT
// ====================
export class Effect {
  constructor(fn, options = {}) {
    this.fn = fn;
    this._priority = options.priority || 0;
    this.scheduler = options.scheduler || GLOBAL_QUEUE;
    this.deps = new Set();
    this._dirty = true;
    this.active = true;
    this._enqueued = false;
    this._lazy = !!options.lazy;

    if (!this._lazy) this._run();
  }

  _track(signal) {
    this.deps.add(signal);
  }

  _markDirty() {
    if (!this._dirty) {
      this._dirty = true;
      this.scheduler.enqueue(this);
    }
  }

  _run() {
    if (!this.active || !this._dirty) return;
    this._dirty = false;

    // cleanup previous deps
    for (const s of this.deps) s._subs.delete(this);
    this.deps.clear();

    const prev = CURRENT_EFFECT;
    CURRENT_EFFECT = this;
    try { this.fn(); } 
    catch(e) { console.error("[Autmn-Core Effect]", e); } 
    finally {
      CURRENT_EFFECT = prev;
      for (const s of this.deps) s._subs.add(this);
    }
  }

  run() { this._markDirty(); }

  stop() {
    this.active = false;
    for (const s of this.deps) s._subs.delete(this);
    this.deps.clear();
  }
}

// ====================
// COMPUTED
// ====================
export class Computed {
  constructor(getter, options = {}) {
    this._getter = getter;
    this._value = undefined;
    this._dirty = true;
    this._effect = new Effect(() => {
      this._value = getter();
      this._dirty = false;
    }, { scheduler: GLOBAL_QUEUE, lazy: true, priority: options.priority || 0 });

    this._subs = new Set();
  }

  get() {
    if (CURRENT_EFFECT) CURRENT_EFFECT._track(this);
    if (this._dirty) this._effect._run();
    return this._value;
  }
}

// ====================
// TRANSACTIONS / BATCH
// ====================
export function batch(fn) {
  BATCH_DEPTH++;
  try { fn(); } finally {
    BATCH_DEPTH--;
    if (BATCH_DEPTH === 0) GLOBAL_QUEUE._flush();
  }
}

// ====================
// DEV METRICS
// ====================
export function signalStats(signal) { return { subscribers: signal._subs.size }; }
export function effectStats(effect) { return { deps: effect.deps.size, dirty: effect._dirty, active: effect.active }; }

// ====================
// SHORTCUTS
// ====================
export function signal(value) { return new Signal(value); }
export function effect(fn, opts) { return new Effect(fn, opts); }
export function computedSignal(getter, opts) { return new Computed(getter, opts); }
