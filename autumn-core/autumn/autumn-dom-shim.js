// autumn-core/autumn/autumn-dom-shim.js
import * as ReactDOMClient from "react-dom/client";
import * as ReactDOM from "react-dom";

export const createRoot = ReactDOMClient.createRoot;
export const hydrateRoot = ReactDOMClient.hydrateRoot;
export const unmountComponentAtNode = ReactDOM.unmountComponentAtNode;
