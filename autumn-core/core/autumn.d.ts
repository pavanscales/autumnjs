import * as React from "react";

// ---------- SIGNAL ----------
export interface AutumnSignalReturn<T> {
  get: () => T;
  set: (v: T) => void;
}

export function AutumnSignal<T>(initial: T): AutumnSignalReturn<T>;
export const useAutumnSignal: <T>(initial: T) => AutumnSignalReturn<T>;

// ---------- EFFECT ----------
export function AutumnEffect(fn: () => void, deps?: React.DependencyList): void;

// ---------- COMPUTED ----------
export function AutumnComputed<T>(fn: () => T, deps?: React.DependencyList): T;

// ---------- CONTEXT ----------
export function AutumnContext<T>(defaultValue: T): React.Context<T>;
export function useAutumnCtx<T>(ctx: React.Context<T>): T;

// ---------- COMPONENT WRAPPER ----------
export function AutumnComponent<P>(Comp: React.ComponentType<P>): React.ComponentType<P>;
