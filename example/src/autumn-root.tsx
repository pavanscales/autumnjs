import ReactDOM from "react-dom/client";
import { FastGrid } from "./autumn-perf"

import "./index.css"
// Internal React, never exposed globally
export const AutumnRoot = {
  mount(rootEl: HTMLElement) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<FastGrid />);
  },
};
