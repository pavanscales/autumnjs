import { AutumnRoot } from "./autumn-root";

Object.defineProperty(window, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
  value: null,
  writable: false,
  configurable: false,
});

if ((window as any).React) delete (window as any).React;
if ((window as any).ReactDOM) delete (window as any).ReactDOM;

if (process.env.NODE_ENV === "production") {
  console.log = console.info = console.warn = console.error = () => {};
  if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
  }
}

const rootEl = document.getElementById("autumn-root");
if (!rootEl) throw new Error("Cannot find #autumn-root in HTML");
AutumnRoot.mount(rootEl);
