import ReactDOM from "react-dom/client";
import { FastGrid } from "./autumn-perf";

import "./index.css";

export const AutumnRoot = {
  mount(rootEl: HTMLElement) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<FastGrid />);

    console.log(
      "%c[Autumn-Core] → Application mounted successfully!",
      "color: #00ff7f; font-weight: bold; font-size: 14px;"
    );
  },
};
