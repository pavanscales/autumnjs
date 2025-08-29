import clsx from "clsx";
import Stats from "stats.js";
import { Analytics } from "@vercel/analytics/react";
import { COLUMNS, generateRows } from "./generateRows";
import { Grid } from "../../src/grid";
import { useAutumnSignal, AutumnEffect, AutumnComponent } from "../../autumn-core/core/autumn";

// ---------------- AUTO SCROLLER ----------------
class AutoScroller {
  grid: Grid;
  toBottom = true;
  version = 0;

  constructor(grid: Grid) { this.grid = grid; }

  start(speed: number) {
    if (!speed) return;
    this.version++;
    const versionAtStart = this.version;

    const step = () => {
      const state = this.grid.getState();
      if (this.version !== versionAtStart) return;

      if (this.grid.offsetY > state.tableHeight - this.grid.viewportHeight - 1) this.toBottom = false;
      else if (this.grid.offsetY <= 0) this.toBottom = true;

      const delta = this.toBottom ? speed : -speed;
      this.grid.container.dispatchEvent(new WheelEvent("wheel", { deltaY: delta }));

      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

// ---------------- AUTUMN LAYERS ----------------
const LAYERS = [
  "Application Layer",
  "Signal & Reactivity Layer",
  "Scheduler / Loop Engine",
  "Renderer Layer",
  "Data & Memory Layer"
];
const layerElements: Record<string, HTMLElement> = {};
LAYERS.forEach(name => {
  const el = document.createElement("div");
  el.className = "autumn-layer";
  el.dataset.layer = name;
  el.dataset.status = "running";
  el.style.cssText = `
    pointer-events:none;
    font-family:monospace;
    font-size:12px;
    position:fixed;
    right:0;
    top:0;
    background:rgba(0,0,0,0.25);
    padding:3px 5px;
    margin:2px;
    border-radius:4px;
    z-index:9998;
    color:#fff;
    backdrop-filter:blur(2px);
    transition: all 0.15s ease;
  `;
  document.body.appendChild(el);
  layerElements[name] = el;
});

// ---------------- SIGNAL EXPLOSIONS ----------------
const explosions: Record<string, { x: number; y: number; vx: number; vy: number; alpha: number }[]> = {};

function triggerLayerExplosion(layer: string) {
  if (!explosions[layer]) explosions[layer] = [];
  const el = layerElements[layer];
  if (!el) return;
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < 15; i++) {
    explosions[layer].push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      alpha: 1
    });
  }
}

// ---------------- REACTIVE SIGNAL ----------------
function reactiveSignal<T>(initial: T, layerName: string) {
  const s = useAutumnSignal(initial);
  const originalSet = s.set.bind(s);
  s.set = (val: T) => {
    if (val !== s.get()) {
      const el = layerElements[layerName];
      if (el) {
        el.style.background = "rgba(0,255,200,0.95)";
        setTimeout(() => (el.style.background = "rgba(0,0,0,0.25)"), 100);
      }
      triggerLayerExplosion(layerName);
    }
    return originalSet(val);
  };
  return s;
}
// ---------------- SIGNAL PARTICLE MAP ----------------
const SignalMap = AutumnComponent(({ speed }: { speed: ReturnType<typeof useAutumnSignal<number>> }) => {
  const canvasRef = useAutumnSignal<HTMLCanvasElement | null>(null);
  const pos = useAutumnSignal({ x: 16, y: 16 }); // 🔥 track position
  const dragging = useAutumnSignal(false);
  const offset = useAutumnSignal({ x: 0, y: 0 });

  // ---- 🎯 Dragging system ----
  AutumnEffect(() => {
    const el = canvasRef.get();
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      dragging.set(true);
      offset.set({ x: e.clientX - pos.get().x, y: e.clientY - pos.get().y });
      e.preventDefault();
    };
    const onMouseUp = () => dragging.set(false);
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.get()) return;
      pos.set({
        x: e.clientX - offset.get().x,
        y: e.clientY - offset.get().y
      });
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [canvasRef.get(), dragging.get()]);

  // ---- 🌌 Particle animation ----
  AutumnEffect(() => {
    const canvas = canvasRef.get();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nodes: { x: number; y: number; alpha: number; vx: number; vy: number }[] = [];
    const totalNodes = 120;
    for (let i = 0; i < totalNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        alpha: Math.random(),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const spd = Math.max(speed.get() / 10, 1);

      nodes.forEach(n => {
        n.x += n.vx * spd;
        n.y += n.vy * spd;
        n.alpha -= 0.02 * spd;

        if (n.alpha <= 0 || n.x < 0 || n.y < 0 || n.x > canvas.width || n.y > canvas.height) {
          n.alpha = 1;
          n.x = Math.random() * canvas.width;
          n.y = Math.random() * canvas.height;
          n.vx = (Math.random() - 0.5) * 4;
          n.vy = (Math.random() - 0.5) * 4;
        }

        ctx.beginPath();
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00ffc8";
        ctx.fillStyle = `rgba(0,255,200,${n.alpha})`;
        ctx.arc(n.x, n.y, 3 + spd * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      Object.keys(explosions).forEach(layer => {
        const arr = explosions[layer];
        for (let i = arr.length - 1; i >= 0; i--) {
          const n = arr[i];
          n.x += n.vx;
          n.y += n.vy;
          n.alpha -= 0.05;
          ctx.beginPath();
          ctx.fillStyle = `rgba(0,255,255,${n.alpha})`;
          ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
          ctx.fill();
          if (n.alpha <= 0) arr.splice(i, 1);
        }
      });

      requestAnimationFrame(animate);
    };
    animate();
  }, [canvasRef.get(), speed.get()]);

  return (
    <canvas
      ref={el => canvasRef.set(el)}
      width={200}
      height={200}
      style={{
        position: "fixed",
        left: pos.get().x,
        top: pos.get().y,
        zIndex: 9999,
        borderRadius: "12px",
        background: "rgba(0,0,0,0.85)",
        pointerEvents: "auto",
        boxShadow: "0 0 16px rgba(0,255,200,0.7)",
        cursor: "move",
        transition: dragging.get() ? "none" : "left 0.1s ease, top 0.1s ease" // 🔥 smooth snap feel
      }}
    />
  );
});

// ---------------- FPS OVERLAY ----------------
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
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
  });
  for (const child of stats.dom.children) {
    // @ts-expect-error
    child.style.width = "160px";
    // @ts-expect-error
    child.style.height = "96px";
  }
  document.body.appendChild(stats.dom);

  let isDragging = false, offsetX = 0, offsetY = 0;
  const onMouseDown = (e: MouseEvent) => { isDragging = true; offsetX = e.clientX - stats.dom.offsetLeft; offsetY = e.clientY - stats.dom.offsetTop; e.preventDefault(); };
  const onMouseUp = () => (isDragging = false);
  const onMouseMove = (e: MouseEvent) => { if (!isDragging) return; stats.dom.style.left = e.clientX - offsetX + "px"; stats.dom.style.top = e.clientY - offsetY + "px"; };

  stats.dom.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);

  const animate = () => { stats.update(); requestAnimationFrame(animate); };
  requestAnimationFrame(animate);

  return () => { stats.dom.remove(); stats.dom.removeEventListener("mousedown", onMouseDown); window.removeEventListener("mouseup", onMouseUp); window.removeEventListener("mousemove", onMouseMove); };
};

setupFPS();

// ---------------- PERFORMANCE OVERLAY ----------------
const PerformanceOverlay = AutumnComponent(() => {
  const fps = useAutumnSignal(0);
  const memTotal = useAutumnSignal(0);
  const memUsed = useAutumnSignal(0);

  AutumnEffect(() => {
    const update = () => {
      fps.set(Math.round(performance.now() % 100));
      if (performance.memory) {
        memTotal.set(performance.memory.totalJSHeapSize / 1024 / 1024);
        memUsed.set(performance.memory.usedJSHeapSize / 1024 / 1024);
      }
      requestAnimationFrame(update);
    };
    update();
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 12,
      right: 12,
      width: "160px",
      height: "120px",
      background: "rgba(0,0,0,0.9)",
      color: "#00ff00",
      fontFamily: "monospace",
      fontSize: "12px",
      padding: "10px",
      borderRadius: "8px",
      zIndex: 9999,
      pointerEvents: "none",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 0 12px rgba(0,255,0,0.5)"
    }}>
      <div>FPS: {fps.get()}</div>
      <div>Mem Total: {memTotal.get().toFixed(2)} MB</div>
      <div>Mem Used: {memUsed.get().toFixed(2)} MB</div>
    </div>
  );
});

// ---------------- REACTIVE CONSOLE ----------------
const ReactiveConsole = AutumnComponent(() => {
  const consoleRef = useAutumnSignal<HTMLDivElement | null>(null);
  const allSignals = (window as any).__allAutumnSignals = (window as any).__allAutumnSignals || [];

  AutumnEffect(() => {
    const el = consoleRef.get();
    if (!el) return;

    const update = () => {
      el.innerHTML = "";
      allSignals.forEach((s: any) => {
        const div = document.createElement("div");
        div.textContent = `${s.name}: ${JSON.stringify(s.signal.get())}`;
        div.style.padding = "2px 4px";
        div.style.fontSize = "12px";
        div.style.color = "#00ff99";
        el.appendChild(div);
      });
      requestAnimationFrame(update);
    };
    update();
  }, [consoleRef.get()]);

  return <div ref={el => consoleRef.set(el)} style={{
    position: "fixed",
    bottom: "50px",
    left: "50px",
    width: "250px",
    height: "200px",
    background: "rgba(0,0,0,0.9)",
    color: "#00ff99",
    fontFamily: "monospace",
    fontSize: "12px",
    padding: "8px",
    borderRadius: "8px",
    overflowY: "auto",
    zIndex: 9999,
    boxShadow: "0 0 12px rgba(0,255,0,0.5)",
    cursor: "move"
  }}/>;
});

// ---------------- FASTGRID ----------------
export const FastGrid = AutumnComponent(() => {
  const containerRef = useAutumnSignal<HTMLDivElement | null>(null);
  const grid = useAutumnSignal<Grid | null>(null);
  const scroller = useAutumnSignal<AutoScroller | null>(null);

  const speed = reactiveSignal(50, "Signal & Reactivity Layer");
  const rowsNum = reactiveSignal(100_000, "Data & Memory Layer");
  const stress = reactiveSignal(false, "Application Layer");
  const loading = useAutumnSignal(false);

  (window as any).__allAutumnSignals = [
    { name: "speed", signal: speed },
    { name: "rowsNum", signal: rowsNum },
    { name: "stress", signal: stress },
    { name: "loading", signal: loading }
  ];

  AutumnEffect(() => {
    const el = containerRef.get();
    if (!el) return;

    const g = new Grid(el, [], COLUMNS);
    grid.set(g);

    loading.set(true);
    generateRows(rowsNum.get(), g, () => loading.set(false));

    const sc = new AutoScroller(g);
    scroller.set(sc);
    (window as any).__grid = g;

    return () => g.destroy();
  }, [containerRef.get(), rowsNum.get()]);

  AutumnEffect(() => {
    const g = grid.get();
    if (!g || !stress.get()) return;
    const id = setInterval(() => {
          // 👇 Clean boot-style logs
      console.log("%c[Signal] Filter pulse", "color:#9c27b0;font-weight:bold;");
      console.log("%c[Scheduler] Recompute queued", "color:#1976d2;font-weight:bold;");
      console.log("%c[Renderer] Commit complete", "color:#e53935;font-weight:bold;");
      const f = g.rowManager.view.filter;
      if (!f[4] || f[4].length < 5) f[4] = (f[4] ?? "") + Math.floor(Math.random() * 10);
      else delete f[4];
      g.rowManager.runFilter();
    }, 100);
    return () => clearInterval(id);
  }, [grid.get(), stress.get()]);

  AutumnEffect(() => {
    const sc = scroller.get();
    if (!sc || speed.get() === 0) return;
    sc.start(Math.exp(speed.get() / 15));
  }, [scroller.get(), speed.get()]);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50 relative">
      <Analytics />
      <SignalMap speed={speed} />
      <PerformanceOverlay />
      <ReactiveConsole />

      <div className="p-2 flex flex-wrap gap-2 items-center z-20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Scroll speed:</span>
          <input type="range" min={0} max={100} value={speed.get()} onChange={e => speed.set(Number(e.target.value))}
            className={clsx("h-2 w-40 cursor-pointer rounded-full bg-gray-300")} />
        </div>

        <button className={clsx(
          "h-8 px-3 rounded text-white hover:scale-95 transition-all",
          stress.get() ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
        )} onClick={() => stress.set(!stress.get())}>
          {stress.get() ? "Stress Test ON" : "Stress Test OFF"}
        </button>

        <select value={rowsNum.get()} onChange={e => rowsNum.set(Number(e.target.value))}
          className="h-8 rounded border border-gray-700 bg-white px-2 text-sm">
          {[10,10_000,100_000,200_000,500_000,1_000_000,2_000_000,5_000_000,10_000_000].map(v =>
            <option key={v} value={v}>{v.toLocaleString()} rows</option>
          )}
        </select>
      </div>

      <div ref={el => containerRef.set(el)}
        style={{ flex: 1, contain: "strict" }}
        className={clsx(
          "relative w-full overflow-clip border border-gray-700 bg-white shadow-inner",
          loading.get() && "pointer-events-none opacity-70"
        )}
      />
    </div>
  );
});
