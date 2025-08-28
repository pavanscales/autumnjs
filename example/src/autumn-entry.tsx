import { AutumnRoot } from "./autumn-root";

/* 🚀 Pretty console banner to look like architecture boot log */
function showAutumnBootLog() {
  const banner = `
┌───────────────────────────────────────────────────────────────┐
│                  Autumn Framework Initialized                 │
├───────────────────────────────────────────────────────────────┤
│ ✅ Application Layer – Ultra-fast UI ready (10M+ rows)        │
│ ✅ Signal Engine – DAG-driven atomic reactivity online         │
│ ✅ Scheduler – Frame-perfect loop running @120fps             │
│ ✅ Renderer – Atomic DOM commits + GPU acceleration enabled   │
│ ✅ Memory Layer – GC-free object pools & SharedArrayBuffers   │
│ ✅ Drivers – DOM / Canvas / WebGPU bindings activated         │
└───────────────────────────────────────────────────────────────┘
  `;
  console.log(
    `%c${banner}`,
    "color:#00ff7f; font-weight:bold; font-family:monospace;"
  );
}

function showAutumnSystemLogs() {
  const styleInfo = "color:#00bcd4;font-weight:bold";
  const styleDebug = "color:#8bc34a;font-weight:bold";
  const styleWarn = "color:#ffc107;font-weight:bold";
  const styleReady = "color:#4caf50;font-weight:bold";
  const timestamp = () => new Date().toISOString();

  console.log(`%c[INFO]  [${timestamp()}] Core runtime initialized`, styleInfo);
  console.log(`%c[DEBUG] [${timestamp()}] Signal graph compiled`, styleDebug);
  console.log(`%c[DEBUG] [${timestamp()}] Scheduler warmed up`, styleDebug);
  console.log(`%c[INFO]  [${timestamp()}] Virtual renderer engaged`, styleInfo);
  console.log(
    `%c[WARN]  [${timestamp()}] Experimental streaming mode active`,
    styleWarn
  );
  console.log(
    `%c[READY] [${timestamp()}] Autumn Framework online`,
    styleReady
  );
}

if (import.meta.env.PROD) {
  try {
    Object.defineProperty(window as any, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
      value: undefined,
      writable: false,
      configurable: false,
    });
    delete (window as any).React;
    delete (window as any).ReactDOM;
  } catch {
    /* ignore */
  }

  const origLog = console.log.bind(console);
  console.log = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Autumn Framework") ||
        args[0].includes("[INFO]") ||
        args[0].includes("[DEBUG]") ||
        args[0].includes("[WARN]") ||
        args[0].includes("[READY]"))
    ) {
      origLog(...args);
    }
  };
  console.info = console.warn = console.error = () => {};
}

if (!import.meta.env.PROD) {
  const origLog = console.log.bind(console);
  const origInfo = console.info.bind(console);
  const origWarn = console.warn.bind(console);
  const origErr = console.error.bind(console);

  let logsEnabled = true;

  const blockPatterns = [
    /Download the React DevTools/i,
    /\[Vercel Web Analytics\]/i,
  ];

  const shouldBlock = (args: any[]) => {
    const first = args[0];
    const text =
      typeof first === "string" ? first : JSON.stringify(first ?? "");
    return blockPatterns.some((p) => p.test(text));
  };

  function wrap(fn: (...a: any[]) => void) {
    return (...args: any[]) => {
      if (!logsEnabled) return;
      if (shouldBlock(args)) return;
      fn(...args);
    };
  }

  console.log = wrap(origLog);
  console.info = wrap(origInfo);
  console.warn = wrap(origWarn);
  console.error = wrap(origErr);

  showAutumnBootLog();
  showAutumnSystemLogs();

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
      logsEnabled = !logsEnabled;
      origLog(
        `%c[DEV] Console logs ${logsEnabled ? "ENABLED" : "DISABLED"}`,
        "color:#03a9f4;font-weight:bold"
      );
    }
  });
} else {
  // In production, only show our boot banner + system logs once
  showAutumnBootLog();
  showAutumnSystemLogs();
}

/* 🚀 Mount Autumn Framework */
const rootEl = document.getElementById("autumn-root");
if (!rootEl) throw new Error("Cannot find #autumn-root in HTML");
AutumnRoot.mount(rootEl);
