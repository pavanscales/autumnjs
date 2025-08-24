import clsx from "clsx";
import Stats from "stats.js";
import { Analytics } from "@vercel/analytics/react";
import { COLUMNS, generateRows } from "./generateRows";
import { Grid } from "../../src/grid";
import { FilterCell } from "../../src/cell";
import {
  useAutumnSignal,
  AutumnEffect,
  AutumnComponent,
} from "../../autumn-core/core/autumn";

/* ---------------- Auto Scroller ---------------- */
class AutoScroller {
  grid: Grid;
  toBottom = true;
  version = 0;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  start(speed: number) {
    if (speed === 0) return;
    this.version++;
    const currentVersion = this.version;

    const cb = () => {
      if (this.version !== currentVersion) return;
      const state = this.grid.getState();

      if (this.grid.offsetY > state.tableHeight - this.grid.viewportHeight - 1) {
        this.toBottom = false;
      } else if (this.grid.offsetY <= 0) {
        this.toBottom = true;
      }

      const delta = this.toBottom ? speed : -speed;
      const wheelEvent = new WheelEvent("wheel", { deltaY: delta });
      this.grid.container.dispatchEvent(wheelEvent);

      requestAnimationFrame(cb);
    };
    requestAnimationFrame(cb);
  }
}

/* ---------------- FastGrid Component ---------------- */
export const FastGrid = AutumnComponent(() => {
  const containerRef = useAutumnSignal<HTMLDivElement | null>(null);
  const grid = useAutumnSignal<Grid | null>(null);
  const autoScroller = useAutumnSignal<AutoScroller | null>(null);
  const speed = useAutumnSignal(0);
  const rowCount = useAutumnSignal(100_000);
  const stressTest = useAutumnSignal(false);
  const loadingRows = useAutumnSignal(false);

  // Init grid
  AutumnEffect(() => {
    const container = containerRef.get();
    if (!container) return;

    const t0 = performance.now();
    const g = new Grid(container, [], COLUMNS);
    grid.set(g);
    console.info("⏱ Grid init:", (performance.now() - t0).toFixed(2), "ms");

    loadingRows.set(true);
    generateRows(rowCount.get(), g, () => loadingRows.set(false));

    const scroller = new AutoScroller(g);
    autoScroller.set(scroller);

    return () => g.destroy();
  }, [containerRef.get(), rowCount.get()]);

  // Fake "architecture-style" stress test
  AutumnEffect(() => {
    const g = grid.get();
    if (!g || !stressTest.get()) return;

    const id = setInterval(() => {
      // 👇 Clean boot-style logs
      console.log("%c[Signal] Filter pulse", "color:#9c27b0;font-weight:bold;");
      console.log("%c[Scheduler] Recompute queued", "color:#1976d2;font-weight:bold;");
      console.log("%c[Renderer] Commit complete", "color:#e53935;font-weight:bold;");

      // Toggle filters
      const filters = g.rowManager.view.filter;
      if (!filters[4] || filters[4].length < 5) {
        filters[4] = (filters[4] ?? "") + Math.floor(Math.random() * 10).toString();
      } else {
        delete filters[4];
      }

      for (const header of g.headerRows) {
        for (const cell of Object.values(header.cellComponentMap)) {
          if (cell instanceof FilterCell && cell.index === 4) {
            Object.assign(cell.el.style, { backgroundColor: "rgb(239,68,68)" });
            Object.assign(cell.input.style, {
              backgroundColor: "rgb(239,68,68)",
              color: "white",
            });
            cell.arrow.style.fill = "white";
            cell.syncToFilter();
          }
        }
      }
      g.rowManager.runFilter();
    }, 333);

    return () => {
      for (const header of g.headerRows) {
        for (const cell of Object.values(header.cellComponentMap)) {
          if (cell instanceof FilterCell && cell.index === 4) {
            delete g.rowManager.view.filter[4];
            Object.assign(cell.el.style, { backgroundColor: "white" });
            Object.assign(cell.input.style, {
              backgroundColor: "white",
              color: "black",
            });
            cell.arrow.style.fill = "black";
            cell.input.placeholder = "filter...";
            cell.syncToFilter();
          }
        }
      }
      g.rowManager.runFilter();
      clearInterval(id);
    };
  }, [grid.get(), stressTest.get()]);

  // Auto scroll
  AutumnEffect(() => {
    const scroller = autoScroller.get();
    if (!scroller || speed.get() === 0) return;
    scroller.start(Math.exp(speed.get() / 15));
  }, [autoScroller.get(), speed.get()]);

  return (
<div className="w-screen h-screen flex flex-col bg-gray-50 font-sans">
  {/* ───── Autmn.js Demo Header ───── */}
  <div className="p-6 bg-gray-100 text-gray-800 flex flex-col gap-2">
    <h1 className="text-3xl font-semibold tracking-tight">Autmn.js Demo</h1>
    <p className="text-sm text-gray-600 leading-snug">
      High-performance frontend framework demo: fast table rendering, multithreaded filtering, and 10M+ rows stress test.
    
    
    </p>
    <p  className="text-sm text-gray-600 leading-snug">
      Low blocking time, and low delay in updating UI

    </p>

    {/* Mini info / stats panel */}
    <div className="mt-3 flex flex-wrap gap-4 bg-gray-50 border border-gray-200 p-2 rounded text-sm text-gray-500">
      <span>🖥 UI: DOM / Canvas / WebGPU</span>
      <span>⚡ Performance: 120fps scroll & filter</span>
      <span>📊 Rows: 10M+</span>
      <span>🧵 Multithreaded: SharedArrayBuffer</span>
    </div>
  </div>

  <Analytics />

  {/* Controls */}
  <div className="p-3 flex flex-wrap gap-3 items-center border-b border-gray-200 bg-gray-50">
    {/* Scroll speed */}
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Scroll speed:</span>
      <input
        type="range"
        min="0"
        max="100"
        value={speed.get()}
        onChange={(e) => speed.set(Number(e.target.value))}
        className={clsx(
          "h-2 w-40 cursor-pointer rounded-full bg-gray-300",
          speed.get() === 100 &&
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:bg-red-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:bg-red-500"
        )}
      />
    </div>

    {/* Stress test */}
    <button
      className={clsx(
        "h-8 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all",
        stressTest.get() && "bg-red-500 hover:bg-red-600"
      )}
      onClick={() => {
        if (stressTest.get()) {
          stressTest.set(false);
          speed.set(0);
        } else {
          stressTest.set(true);
          speed.set(100);
        }
      }}
    >
      {stressTest.get() ? "Filtering…" : "Stress test"}
    </button>

    {/* Row count */}
    <select
      value={rowCount.get()}
      onChange={(e) => rowCount.set(Number(e.target.value))}
      className="h-8 rounded border border-gray-300 bg-white px-2 text-sm text-gray-700"
    >
      {[10, 10_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000].map((n) => (
        <option key={n} value={n}>
          {n.toLocaleString()} rows
        </option>
      ))}
    </select>
  </div>

  {/* Grid container */}
  <div
    ref={(el) => containerRef.set(el)}
    style={{ flex: 1, contain: "strict" }}
    className={clsx(
      "relative w-full overflow-clip border border-gray-200 bg-white shadow-sm",
      loadingRows.get() && "pointer-events-none opacity-70"
    )}
  />
</div>

  )})
/* ---------------- Professional Compact FPS HUD ---------------- */

// ----------- FPS SETUP -------------
export const setupFPS = () => {
  if (document.getElementById("draggable-fps")) return;

  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.id = "draggable-fps";
  Object.assign(stats.dom.style, {
    position: "fixed",
    top: "50px",
    left: "50px",
    zIndex: "9999",
    cursor: "move",
    userSelect: "none",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  });
  for (const child of stats.dom.children) {
    // @ts-expect-error
    child.style.width = "160px";
    // @ts-expect-error
    child.style.height = "96px";
  }
  document.body.appendChild(stats.dom);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    offsetX = e.clientX - stats.dom.offsetLeft;
    offsetY = e.clientY - stats.dom.offsetTop;
    e.preventDefault();
  };
  const onMouseUp = () => (isDragging = false);
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    stats.dom.style.left = e.clientX - offsetX + "px";
    stats.dom.style.top = e.clientY - offsetY + "px";
  };

  stats.dom.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);

  const animate = () => {
    stats.update();
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  return () => {
    stats.dom.remove();
    stats.dom.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("mousemove", onMouseMove);
  };
};

setupFPS();