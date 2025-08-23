import clsx from "clsx";
import Stats from "stats.js";
import { Analytics } from "@vercel/analytics/react";
import { COLUMNS, generateRows } from "./generateRows";
import { Grid } from "../../src/grid";
import { FilterCell } from "../../src/cell";
import { useAutumnSignal, AutumnEffect, AutumnComponent } from "../../autumn-core/core/autumn";

// ----------- AUTO SCROLLER -------------
class AutoScroller {
  grid: Grid;
  running: boolean;
  toBottom: boolean;
  version: number;

  constructor(grid: Grid) {
    this.grid = grid;
    this.running = true;
    this.toBottom = true;
    this.version = 0;
  }

  start(speed: number) {
    if (speed === 0) return;
    this.version++;
    const currentVersion = this.version;

    const cb = () => {
      const state = this.grid.getState();
      if (this.version !== currentVersion) return;

      if (this.grid.offsetY > state.tableHeight - this.grid.viewportHeight - 1) {
        this.toBottom = false;
      } else if (this.grid.offsetY <= 0) {
        this.toBottom = true;
      }

      const delta = this.toBottom ? speed : -speed;
      const wheelEvent = new WheelEvent("wheel", {
        deltaY: delta,
        deltaMode: 0,
      });
      this.grid.container.dispatchEvent(wheelEvent);

      requestAnimationFrame(cb);
    };
    requestAnimationFrame(cb);
  }
}

// ----------- FASTGRID COMPONENT -------------
export const FastGrid = AutumnComponent(() => {
  const containerRef = useAutumnSignal(null) as {
    get(): HTMLDivElement | null;
    set(el: HTMLDivElement | null): void;
  };
  const grid = useAutumnSignal(null) as {
    get(): Grid | null;
    set(g: Grid | null): void;
  };
  const autoScroller = useAutumnSignal(null) as {
    get(): AutoScroller | null;
    set(s: AutoScroller | null): void;
  };
  const speed = useAutumnSignal(0);
  const rowCount = useAutumnSignal(100_000);
  const stressTest = useAutumnSignal(false);
  const loadingRows = useAutumnSignal(false);

  // ----------- AUTUMN EFFECTS -------------
  AutumnEffect(() => {
    const container = containerRef.get();
    if (!container) return;

    const t0 = performance.now();
    const g = new Grid(container, [], COLUMNS);
    grid.set(g);
    console.info("Ms to initialize grid:", performance.now() - t0);

    loadingRows.set(true);
    generateRows(rowCount.get(), g, () => loadingRows.set(false));

    const scroller = new AutoScroller(g);
    autoScroller.set(scroller);
    (window as any).__grid = g;

    return () => g.destroy();
  }, [containerRef.get(), rowCount.get()]);

  AutumnEffect(() => {
    const g = grid.get();
    if (!g || !stressTest.get()) return;

    const id = setInterval(() => {
      const filters = g.rowManager.view.filter;
      if (filters[4] == null || filters[4].length < 5) {
        filters[4] = (filters[4] ?? "") + Math.floor(Math.random() * 10).toString();
      } else {
        delete filters[4];
      }

      for (const header of g.headerRows) {
        for (const cell of Object.values(header.cellComponentMap)) {
          if (cell instanceof FilterCell && cell.index === 4) {
            Object.assign(cell.el.style, { backgroundColor: "rgb(239,68,68)" });
            Object.assign(cell.input.style, { backgroundColor: "rgb(239,68,68)", color: "white" });
            cell.input.placeholder = "";
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
            Object.assign(cell.input.style, { backgroundColor: "white", color: "black" });
            cell.input.placeholder = "filter...";
            cell.arrow.style.fill = "black";
            cell.syncToFilter();
          }
        }
      }
      g.rowManager.runFilter();
      clearInterval(id);
    };
  }, [grid.get(), stressTest.get()]);

  AutumnEffect(() => {
    const scroller = autoScroller.get();
    if (!scroller || speed.get() === 0) return;
    scroller.start(Math.exp(speed.get() / 15));
  }, [autoScroller.get(), speed.get()]);

  // ----------- RENDER FULLSCREEN WITH STYLING -------------
  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50">
      <Analytics />

      {/* Controls */}
      <div className="p-2 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Scroll speed:</span>
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

        <button
          className={clsx(
            "h-8 px-3 rounded bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all",
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
          {stressTest.get() ? "Filtering 3x/sec" : "Stress test"}
        </button>

        <select
          value={rowCount.get()}
          onChange={(e) => rowCount.set(Number(e.target.value))}
          className="h-8 rounded border border-gray-700 bg-white px-2 text-sm"
        >
          <option value={10}>10 rows</option>
          <option value={10_000}>10 000 rows</option>
          <option value={100_000}>100 000 rows</option>
          <option value={200_000}>200 000 rows</option>
          <option value={500_000}>500 000 rows</option>
          <option value={1_000_000}>1 000 000 rows</option>
          <option value={2_000_000}>2 000 000 rows</option>
          <option value={5_000_000}>5 000 000 rows</option>
          <option value={10_000_000}>10 000 000 rows</option>
        </select>
      </div>

      {/* Grid */}
      <div
        ref={(el) => containerRef.set(el)}
        style={{ flex: 1, contain: "strict" }}
        className={clsx(
          "relative w-full overflow-clip border border-gray-700 bg-white shadow-inner",
          loadingRows.get() && "pointer-events-none opacity-70"
        )}
      />
    </div>
  );
});

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
