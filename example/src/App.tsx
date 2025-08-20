import clsx from "clsx";
import Stats from "stats.js";
import { Analytics } from "@vercel/analytics/react";
import { COLUMNS, generateRows } from "./generateRows";
import { useState, useRef, useEffect } from "react";
import { Grid } from "../../src/grid";
import { FilterCell } from "../../src/cell";

export const FastGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [grid, setGrid] = useState<Grid | null>(null);
  const [speed, setSpeed] = useState(0);
  const [rowCount, setRowCount] = useState(100_000);
  const [stressTest, setStressTest] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [autoScroller, setAutoScroller] = useState<AutoScroller | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const t0 = performance.now();
    const grid = new Grid(container, [], COLUMNS);
    setGrid(grid);
    console.info("Ms to initialize grid:", performance.now() - t0);

    setLoadingRows(true);
    generateRows(rowCount, grid, () => setLoadingRows(false));

    const autoScroller = new AutoScroller(grid);
    setAutoScroller(autoScroller);
    (window as any).__grid = grid;

    return () => {
      grid.destroy();
    };
  }, [rowCount]);

  useEffect(() => {
    if (!grid || !stressTest) return;

    const id = setInterval(() => {
      const filters = grid.rowManager.view.filter;
      if (filters[4] == null || filters[4].length < 5) {
        filters[4] = (filters[4] ?? "") + Math.floor(Math.random() * 10).toString();
      } else {
        delete filters[4];
      }

      for (const header of grid.headerRows) {
        for (const cell of Object.values(header.cellComponentMap)) {
          if (cell instanceof FilterCell && cell.index === 4) {
            // safer style update
            Object.assign(cell.el.style, { backgroundColor: "rgb(239,68,68)" });
            Object.assign(cell.input.style, { backgroundColor: "rgb(239,68,68)", color: "white" });
            cell.input.placeholder = "";
            cell.arrow.style.fill = "white";
            cell.syncToFilter();
          }
        }
      }

      grid.rowManager.runFilter();
    }, 333);

    return () => {
      for (const header of grid.headerRows) {
        for (const cell of Object.values(header.cellComponentMap)) {
          if (cell instanceof FilterCell && cell.index === 4) {
            delete grid.rowManager.view.filter[4];
            Object.assign(cell.el.style, { backgroundColor: "white" });
            Object.assign(cell.input.style, { backgroundColor: "white", color: "black" });
            cell.input.placeholder = "filter...";
            cell.arrow.style.fill = "black";
            cell.syncToFilter();
          }
        }
      }
      grid.rowManager.runFilter();
      clearInterval(id);
    };
  }, [grid, stressTest]);

  useEffect(() => {
    if (!autoScroller) return;
    if (speed === 0) return; // prevent unnecessary RAF loops
    autoScroller.start(Math.exp(speed / 15));
  }, [autoScroller, speed]);

  return (
    <>
      <Analytics />
      <div className="mt-1 self-start max-md:mt-2 sm:self-center">
        Try make the fps counter drop by filtering, sorting, and scrolling simultaneously
      </div>

      <div
        className={clsx(
          "flex w-full select-none flex-wrap justify-between gap-2 py-2",
          loadingRows && "pointer-events-none select-none opacity-60"
        )}
      >
        <div className="hidden w-[150px] md:block" />

        <div className="flex gap-2 text-[11px] md:gap-8 md:text-[13px]">
          <div className="flex items-center">
            <span className="mr-2 whitespace-nowrap">Scroll speed:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className={clsx(
                "h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-300",
                speed === 100 &&
                  "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-red-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
              )}
            />
          </div>

          <button
            className={clsx(
              "flex h-[28px] w-[200px] items-center justify-center gap-0.5 rounded bg-blue-500 text-white hover:opacity-95 active:opacity-90",
              stressTest && "bg-red-500"
            )}
            onClick={() => {
              if (stressTest) {
                setStressTest(false);
                setSpeed(0);
              } else {
                setStressTest(true);
                setSpeed(100);
              }
            }}
          >
            {stressTest && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[14px] w-[14px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            {stressTest ? "Filtering 3 times per second" : "Stress test"}
          </button>
        </div>

        <select
          value={rowCount}
          onChange={(e) => grid && setRowCount(Number(e.target.value))}
          className="hidden h-[28px] w-[150px] items-center justify-center rounded border border-gray-800 bg-white text-[12px] text-gray-700 shadow-[rgba(0,_0,_0,_0.1)_0px_0px_2px_1px] md:flex"
        >
          <option value={10}>10 rows</option>
          <option value={10_000}>10 000 rows</option>
          <option value={100_000}>100 000 rows</option>
          <option value={200_000}>200 000 rows</option>
          <option value={500_000}>500 000 rows</option>
          <option value={1_000_000}>1 000 000 rows (might run out of ram)</option>
          <option value={2_000_000}>2 000 000 rows (might run out of ram)</option>
          <option value={5_000_000}>5 000 000 rows (might run out of ram)</option>
          <option value={10_000_000}>10 000 000 rows (might run out of ram)</option>
        </select>
      </div>

      <div
        ref={containerRef}
        style={{ contain: "strict" }}
        className={clsx(
          "relative box-border w-full flex-1 overflow-clip border border-gray-700 bg-white",
          loadingRows && "pointer-events-none opacity-70"
        )}
      />
    </>
  );
};

// ----------- Single draggable FPS meter -------------
const setupFPS = () => {
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

  // cleanup function
  return () => {
    stats.dom.remove();
    stats.dom.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("mousemove", onMouseMove);
  };
};

setupFPS();

// ----------- AutoScroller -------------
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
    if (speed === 0) return; // skip if speed is 0
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
