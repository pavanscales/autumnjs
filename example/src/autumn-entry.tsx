import { AutumnRoot } from "./autumn-root";

// --- FULL REACT STEALTH (DEV + PROD) ---
Object.defineProperty(window, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
  value: null,
  writable: false,
  configurable: false,
});

console.log = console.info = console.warn = console.error = () => {};
if ((window as any).React) delete (window as any).React;
if ((window as any).ReactDOM) delete (window as any).ReactDOM;
if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
}

// --- MOUNT AUTUMN ROOT ---
const rootEl = document.getElementById("autumn-root");
if (!rootEl) throw new Error("Cannot find #autumn-root in HTML");
AutumnRoot.mount(rootEl);
