// autumn-core/autumn/autumn-shim.js
export function useState(...args) {
  const { useState } = require("react");
  return useState(...args);
}

export function useEffect(...args) {
  const { useEffect } = require("react");
  return useEffect(...args);
}

export function useMemo(...args) {
  const { useMemo } = require("react");
  return useMemo(...args);
}

export function useContext(...args) {
  const { useContext } = require("react");
  return useContext(...args);
}

export function createContext(...args) {
  const { createContext } = require("react");
  return createContext(...args);
}
