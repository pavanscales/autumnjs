import { Signal, Effect, Computed } from '../reactivity/signal.js';
import { batch } from '../reactivity/reactive.js';

// Node wraps a signal and tracks dependencies
export class Node {
  constructor(signal) {
    this.signal = signal;
    this.deps = new Set();
    this.subscribers = new Set();
    this._dirty = true;
    this._value = signal.get();
  }

  markDirty() {
    if (!this._dirty) {
      this._dirty = true;
      for (const sub of this.subscribers) sub.markDirty();
    }
  }

  compute() {
    if (!this._dirty) return this._value;

    const prevDeps = new Set(this.deps);
    this.deps.clear();
    const prevEffect = Compiler.currentNode;
    Compiler.currentNode = this;

    try {
      this._value = this.signal.get();
    } finally {
      Compiler.currentNode = prevEffect;
      // remove stale dependencies
      for (const oldDep of prevDeps) {
        if (!this.deps.has(oldDep)) oldDep.subscribers.delete(this);
      }
      for (const newDep of this.deps) newDep.subscribers.add(this);
      this._dirty = false;
    }

    return this._value;
  }
}

// Core compiler that tracks dependencies and flushes in batch
export class Compiler {
  static currentNode = null;

  constructor() {
    this.nodes = new Map();
    this.queue = [];
  }

  node(signal) {
    if (!this.nodes.has(signal)) this.nodes.set(signal, new Node(signal));
    return this.nodes.get(signal);
  }

  track(signal) {
    if (Compiler.currentNode) {
      const node = this.node(signal);
      Compiler.currentNode.deps.add(node);
    }
  }

  compileSignals(signals) {
    for (const sig of signals) this.node(sig);
  }

  // Flush all dirty nodes in topological order
  flush() {
    const toFlush = Array.from(this.nodes.values()).filter(n => n._dirty);
    const sorted = this.topoSort(toFlush);
    batch(() => {
      for (const node of sorted) node.compute();
    });
  }

  topoSort(nodes) {
    const sorted = [];
    const visited = new Set();

    const visit = (node) => {
      if (visited.has(node)) return;
      visited.add(node);
      for (const dep of node.deps) visit(dep);
      sorted.push(node);
    };

    for (const node of nodes) visit(node);
    return sorted;
  }

  stats() {
    let totalDeps = 0;
    for (const node of this.nodes.values()) totalDeps += node.deps.size;
    return { nodes: this.nodes.size, totalDeps };
  }
}

// singleton instance
export const compiler = new Compiler();
