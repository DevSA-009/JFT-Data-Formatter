import path from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const repoName = `jft-data-formatter`;

  const env = loadEnv(mode, process.cwd(), "");

  const isGithubPage = env.VITE_GITHUB_PAGE === "true";

  return {
    base: isGithubPage ? `/${repoName}/` : "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "./src/assets"),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "static",
      emptyOutDir: true,
    },
  };
});
