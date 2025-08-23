// autumn.js
import { 
  AutumnSignalHook, 
  AutumnEffectHook, 
  AutumnComputedHook,
  AutumnContextHook,
  useAutumnContext
} from "./internals";

// -------- SIGNAL ----------
export function AutumnSignal(initial) {
  const [value, setValue] = AutumnSignalHook(initial);
  return {
    get: () => value,
    set: setValue
  };
}

// alias
export const useAutumnSignal = AutumnSignal;

// -------- EFFECT ----------
export function AutumnEffect(fn, deps) {
  return AutumnEffectHook(fn, deps);
}

// -------- COMPUTED ----------
export function AutumnComputed(fn, deps) {
  return AutumnComputedHook(fn, deps);
}

// -------- CONTEXT ----------
export function AutumnContext(defaultValue) {
  return AutumnContextHook(defaultValue);
}
export function useAutumnCtx(ctx) {
  return useAutumnContext(ctx);
}

// -------- COMPONENT WRAPPER ----------
export function AutumnComponent(Comp) {
  return Comp;
}

export {
  AutumnSignalHook,
  AutumnEffectHook,
  AutumnComputedHook,
  AutumnContextHook,
  useAutumnContext
};
