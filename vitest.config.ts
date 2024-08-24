/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    watch: false,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "**/*.d.ts", "**/*.test.ts"],
    },
  },
});
