/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";

const fileName = {
  es: "main.js",
  iife: "main.iife.js",
  cjs: "main.cjs",
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

export default defineConfig({
  base: "./",
  build: {
    outDir: "./build/dist",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "gameUtils",
      formats,
      fileName: (format) => fileName[format],
    },
  },
  test: {
    watch: false,
  },
  resolve: {
    alias: [{ find: "~", replacement: path.resolve(__dirname, "src") }],
  },
});
