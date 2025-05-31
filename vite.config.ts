import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        content: "src/extension/index.js",
      },
      output: {
        entryFileNames: "content.js",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    manifest: false,
  },
});
