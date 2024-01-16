/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsConfigPaths(), react()],
  server: {
    port: 4020,
  },
  test: {
    globals: true,
    includeSource: ["src/**/*.{js,jsx,ts,tsx}"],
    setupFiles: ["./test/setup.ts"],
    environment: "jsdom",
  },
});
