// autumn-core/autumn/jsx-runtime-shim.js
// autumn-core/autumn/jsx-runtime-shim.js
export * from "react/jsx-runtime";

export function jsx(type, props) { return { type, props }; }
export function jsxs(type, props) { return { type, props }; }
export function jsxDEV(type, props, key, isStaticChildren, source, self) { 
  return { type, props, key }; 
}
// autumn-core/autumn/jsx-runtime-shim.js
export { jsx, jsxs, jsxDEV } from "react/jsx-runtime"; // or implement jsxDEV in your shim
