import Stats from "stats.js";

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

  document.body.appendChild(stats.dom);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const onMouseDown = (e: MouseEvent) => { isDragging = true; offsetX = e.clientX - stats.dom.offsetLeft; offsetY = e.clientY - stats.dom.offsetTop; e.preventDefault(); };
  const onMouseUp = () => (isDragging = false);
  const onMouseMove = (e: MouseEvent) => { if (!isDragging) return; stats.dom.style.left = e.clientX - offsetX + "px"; stats.dom.style.top = e.clientY - offsetY + "px"; };

  stats.dom.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);

  const animate = () => { stats.update(); requestAnimationFrame(animate); };
  requestAnimationFrame(animate);

  return () => {
    stats.dom.remove();
    stats.dom.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("mousemove", onMouseMove);
  };
};
