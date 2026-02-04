import { defineConfig } from "vite";

export default defineConfig({
  base: "/jft-data-formatter/",
  build: {
    outDir: "dist",
    assetsDir: "static",
    emptyOutDir: true,
  },
});
