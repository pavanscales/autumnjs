// vite.config.ts
import { defineConfig } from "file:///C:/autumn-js/example/node_modules/vite/dist/node/index.js";
import react from "file:///C:/autumn-js/example/node_modules/@vitejs/plugin-react-swc/index.mjs";
import obfuscator from "file:///C:/autumn-js/example/node_modules/rollup-plugin-obfuscator/dist/rollup-plugin-obfuscator.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    obfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      debugProtection: true,
      disableConsoleOutput: true
    }),
    {
      name: "remove-react-devtools-hook",
      // This runs at the very start of the bundle
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "remove-react-hook.js",
          source: `
            if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
              Object.keys(window.__REACT_DEVTOOLS_GLOBAL_HOOK__).forEach(k => {
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__[k] =
                  typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[k] === 'function'
                    ? () => {}
                    : null;
              });
            }
          `
        });
      }
    }
  ],
  build: {
    sourcemap: false,
    // no source maps
    target: "esnext",
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks: void 0,
        // everything in one bundle
        entryFileNames: `bundle-[hash].js`,
        // generic filename
        chunkFileNames: `chunk-[hash].js`,
        assetFileNames: `asset-[hash].[ext]`
      }
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "React.createElement"]
        // remove React hints
      },
      mangle: true
      // rename functions and variables
    }
  },
  resolve: {
    alias: { "@": "/src" },
    dedupe: ["react", "react-dom"]
    // still use React internally
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxhdXR1bW4tanNcXFxcZXhhbXBsZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcYXV0dW1uLWpzXFxcXGV4YW1wbGVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L2F1dHVtbi1qcy9leGFtcGxlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgb2JmdXNjYXRvciBmcm9tIFwicm9sbHVwLXBsdWdpbi1vYmZ1c2NhdG9yXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG9iZnVzY2F0b3Ioe1xuICAgICAgY29tcGFjdDogdHJ1ZSxcbiAgICAgIGNvbnRyb2xGbG93RmxhdHRlbmluZzogdHJ1ZSxcbiAgICAgIGNvbnRyb2xGbG93RmxhdHRlbmluZ1RocmVzaG9sZDogMSxcbiAgICAgIGRlYnVnUHJvdGVjdGlvbjogdHJ1ZSxcbiAgICAgIGRpc2FibGVDb25zb2xlT3V0cHV0OiB0cnVlLFxuICAgIH0pLFxuICAgIHtcbiAgICAgIG5hbWU6IFwicmVtb3ZlLXJlYWN0LWRldnRvb2xzLWhvb2tcIixcbiAgICAgIC8vIFRoaXMgcnVucyBhdCB0aGUgdmVyeSBzdGFydCBvZiB0aGUgYnVuZGxlXG4gICAgICBnZW5lcmF0ZUJ1bmRsZSgpIHtcbiAgICAgICAgdGhpcy5lbWl0RmlsZSh7XG4gICAgICAgICAgdHlwZTogXCJhc3NldFwiLFxuICAgICAgICAgIGZpbGVOYW1lOiBcInJlbW92ZS1yZWFjdC1ob29rLmpzXCIsXG4gICAgICAgICAgc291cmNlOiBgXG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5fX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHdpbmRvdy5fX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18pLmZvckVhY2goayA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93Ll9fUkVBQ1RfREVWVE9PTFNfR0xPQkFMX0hPT0tfX1trXSA9XG4gICAgICAgICAgICAgICAgICB0eXBlb2Ygd2luZG93Ll9fUkVBQ1RfREVWVE9PTFNfR0xPQkFMX0hPT0tfX1trXSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICA/ICgpID0+IHt9XG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYCxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiBmYWxzZSwgLy8gbm8gc291cmNlIG1hcHNcbiAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgbW9kdWxlUHJlbG9hZDogeyBwb2x5ZmlsbDogZmFsc2UgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB1bmRlZmluZWQsIC8vIGV2ZXJ5dGhpbmcgaW4gb25lIGJ1bmRsZVxuICAgICAgICBlbnRyeUZpbGVOYW1lczogYGJ1bmRsZS1baGFzaF0uanNgLCAvLyBnZW5lcmljIGZpbGVuYW1lXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBgY2h1bmstW2hhc2hdLmpzYCxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IGBhc3NldC1baGFzaF0uW2V4dF1gLFxuICAgICAgfSxcbiAgICB9LFxuICAgIG1pbmlmeTogXCJ0ZXJzZXJcIixcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXG4gICAgICAgIHB1cmVfZnVuY3M6IFtcImNvbnNvbGUubG9nXCIsIFwiUmVhY3QuY3JlYXRlRWxlbWVudFwiXSwgLy8gcmVtb3ZlIFJlYWN0IGhpbnRzXG4gICAgICB9LFxuICAgICAgbWFuZ2xlOiB0cnVlLCAvLyByZW5hbWUgZnVuY3Rpb25zIGFuZCB2YXJpYWJsZXNcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHsgXCJAXCI6IFwiL3NyY1wiIH0sXG4gICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSwgLy8gc3RpbGwgdXNlIFJlYWN0IGludGVybmFsbHlcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUCxTQUFTLG9CQUFvQjtBQUNqUixPQUFPLFdBQVc7QUFDbEIsT0FBTyxnQkFBZ0I7QUFFdkIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLE1BQ1QsU0FBUztBQUFBLE1BQ1QsdUJBQXVCO0FBQUEsTUFDdkIsZ0NBQWdDO0FBQUEsTUFDaEMsaUJBQWlCO0FBQUEsTUFDakIsc0JBQXNCO0FBQUEsSUFDeEIsQ0FBQztBQUFBLElBQ0Q7QUFBQSxNQUNFLE1BQU07QUFBQTtBQUFBLE1BRU4saUJBQWlCO0FBQ2YsYUFBSyxTQUFTO0FBQUEsVUFDWixNQUFNO0FBQUEsVUFDTixVQUFVO0FBQUEsVUFDVixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFVVixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUE7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLGVBQWUsRUFBRSxVQUFVLE1BQU07QUFBQSxJQUNqQyxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxRQUNkLGdCQUFnQjtBQUFBO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxlQUFlO0FBQUEsUUFDZixZQUFZLENBQUMsZUFBZSxxQkFBcUI7QUFBQTtBQUFBLE1BQ25EO0FBQUEsTUFDQSxRQUFRO0FBQUE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTyxFQUFFLEtBQUssT0FBTztBQUFBLElBQ3JCLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQTtBQUFBLEVBQy9CO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
