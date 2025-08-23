import clsx from "clsx";
import { Analytics } from "@vercel/analytics/react";
import { Grid } from "../../src/grid";
import { FilterCell } from "../../src/cell";
import { useAutumnSignal, AutumnEffect, AutumnComponent } from "../../autumn-core/core/autumn";
import { AutoScroller } from "./AutoScroller";
import { setupFPS } from "./fps";
import { COLUMNS, generateRows } from "./generateRows";

export const FastGrid = AutumnComponent(() => {
  const containerRef = useAutumnSignal(null) as { get(): HTMLDivElement | null; set(el: HTMLDivElement | null): void };
  const grid = useAutumnSignal(null) as { get(): Grid | null; set(g: Grid | null): void };
  const autoScroller = useAutumnSignal(null) as { get(): AutoScroller | null; set(s: AutoScroller | null): void };
  const speed = useAutumnSignal(0);
  const rowCount = useAutumnSignal(100_000);
  const stressTest = useAutumnSignal(false);
  const loadingRows = useAutumnSignal(false);

  AutumnEffect(() => {
    const container = containerRef.get();
    if (!container) return;

    const g = new Grid(container, [], COLUMNS);
    grid.set(g);
    loadingRows.set(true);
    generateRows(rowCount.get(), g, () => loadingRows.set(false));

    const scroller = new AutoScroller(g);
    autoScroller.set(scroller);
    (window as any).__grid = g;

    return () => g.destroy();
  }, [containerRef.get(), rowCount.get()]);

  // stress test and auto-scroll effects (similar to your original logic)

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50">
      <Analytics />
      {/* Controls and grid container */}
    </div>
  );
});

setupFPS();
