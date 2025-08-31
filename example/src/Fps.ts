import Stats from "stats.js";

/**
 * Setup a draggable FPS monitor overlay.
 * Returns a cleanup function to unmount it safely.
 */
export const setupFPS = (): (() => void) | void => {
  // Prevent duplicate overlays
  if (document.getElementById("draggable-fps")) return;

  const stats = new Stats();
  stats.showPanel(0); // 0 = FPS

  // Style improvements
  const el = stats.dom;
  el.id = "draggable-fps";
  Object.assign(el.style, {
    position: "fixed",
    top: "50px",
    left: "50px",
    zIndex: "9999",
    userSelect: "none",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
    cursor: "grab",
  });

  document.body.appendChild(el);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.cursor = "grabbing";
    e.preventDefault();
  };

  const onMouseUp = () => {
    isDragging = false;
    el.style.cursor = "grab";
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    // Use requestAnimationFrame for smoother drag updates
    requestAnimationFrame(() => {
      el.style.left = e.clientX - offsetX + "px";
      el.style.top = e.clientY - offsetY + "px";
    });
  };

  el.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);

  let animationId: number;
  const animate = () => {
    stats.update();
    animationId = requestAnimationFrame(animate);
  };
  animationId = requestAnimationFrame(animate);

  // Cleanup function
  return () => {
    cancelAnimationFrame(animationId);
    el.remove();
    el.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("mousemove", onMouseMove);
  };
};
