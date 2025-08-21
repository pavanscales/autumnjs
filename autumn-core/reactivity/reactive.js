// /autmn-core/reactivity/reactive.js
// UNIVERSE-LEVEL FRONTEND REACTIVE HELPERS
// High-level reactive engine built on top of Signal/Computed
// DAG-safe, lazy, batched, memory-safe, transactions-ready

import { Signal, Computed, Effect, batch as coreBatch } from './signal.js';

let CURRENT_DERIVED = null;

// ====================
// DERIVED EFFECT WITH FULL DAG SAFETY
// ====================
class DerivedEffect extends Effect {
  constructor(fn, options = {}) {
    super(fn, options);
    this._depsSnapshot = new Set();
  }

  _track(signal) {
    super._track(signal);
    this._depsSnapshot.add(signal);
  }

  _run() {
    // Remove stale dependencies
    for (const s of this._depsSnapshot) {
      if (!this.deps.has(s)) s._subs.delete(this);
    }
    this._depsSnapshot.clear();
    super._run();
  }
}

// ====================
// OBJECT REACTIVITY
// ====================
export function reactive(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  return new Proxy(obj, {
    get(target, key, receiver) {
      const val = Reflect.get(target, key, receiver);
      if (val instanceof Signal) return val.get();
      return val;
    },
    set(target, key, value, receiver) {
      const prev = target[key];
      if (prev instanceof Signal) {
        prev.set(value);
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
    deleteProperty(target, key) {
      const val = target[key];
      if (val instanceof Signal) val._subs.clear();
      return Reflect.deleteProperty(target, key);
    }
  });
}

// ====================
// DERIVED COMPUTED SIGNALS
// ====================
export function derived(fn) {
  const comp = new Computed(() => {
    CURRENT_DERIVED = comp;
    try {
      return fn();
    } finally {
      CURRENT_DERIVED = null;
    }
  });
  return comp;
}

// ====================
// WATCH / EFFECT HELPER
// ====================
export function watch(fn, options = {}) {
  return new DerivedEffect(fn, options);
}

// ====================
// TRANSACTIONAL BATCHING
// ====================
export function batch(fn) {
  coreBatch(fn);
}

// ====================
// UTILITY HELPERS
// ====================
export function unwrap(obj) {
  if (obj instanceof Signal || obj instanceof Computed) return obj.get();
  return obj;
}

export function mapSignals(obj, fn) {
  const result = {};
  for (const key in obj) {
    const val = obj[key];
    result[key] = val instanceof Signal ? fn(val, key) : val;
  }
  return result;
}

// ====================
// DEV / METRICS
// ====================
export function effectStats(effect) {
  if (effect instanceof DerivedEffect) {
    return {
      deps: effect.deps.size,
      dirty: effect._dirty,
      active: effect.active
    };
  }
  return {};
}

export function signalStats(signal) {
  return { subscribers: signal._subs.size };
}

// ====================
// EXPORTS
// ====================
export { Signal, Computed, Effect };
export { reactive, derived, watch, batch, unwrap, mapSignals };
