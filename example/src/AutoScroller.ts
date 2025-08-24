import { Grid } from "../../src/grid";

export class AutoScroller {
  private grid: Grid;
  private running = true;
  private toBottom = true;
  private version = 0;

  constructor(grid: Grid) {
    this.grid = grid;
    if (process.env.NODE_ENV === "development") {
      console.info("[AutoScroller] Initialized for grid");
    }
  }

  start(speed: number) {
    if (!speed) return;
    this.version++;
    const currentVersion = this.version;

    if (process.env.NODE_ENV === "development") {
      console.info(`[AutoScroller] Start scrolling (speed=${speed.toFixed(2)})`);
    }

    const step = () => {
      const state = this.grid.getState();
      if (this.version !== currentVersion) {
        if (process.env.NODE_ENV === "development") {
          console.info("[AutoScroller] Stopped (new version started)");
        }
        return;
      }

      // Direction flip logs
      if (
        this.toBottom &&
        this.grid.offsetY >= state.tableHeight - this.grid.viewportHeight - 1
      ) {
        this.toBottom = false;
        if (process.env.NODE_ENV === "development") {
          console.debug("[AutoScroller] Reached bottom → reversing upward");
        }
      } else if (this.grid.offsetY <= 0 && !this.toBottom) {
        this.toBottom = true;
        if (process.env.NODE_ENV === "development") {
          console.debug("[AutoScroller] Reached top → reversing downward");
        }
      }

      const delta = this.toBottom ? speed : -speed;
      this.grid.container.dispatchEvent(
        new WheelEvent("wheel", { deltaY: delta, deltaMode: 0 })
      );
      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }
}
